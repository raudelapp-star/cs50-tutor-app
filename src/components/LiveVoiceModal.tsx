import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Volume2, X, Radio } from 'lucide-react';

interface LiveVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentModuleTitle: string;
}

function floatTo16BitPCMBase64(float32Array: Float32Array): string {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export const LiveVoiceModal: React.FC<LiveVoiceModalProps> = ({
  isOpen,
  onClose,
  currentModuleTitle,
}) => {
  const [connected, setConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [tutorTranscript, setTutorTranscript] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const inputCtxRef = useRef<AudioContext | null>(null);
  const outputCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const isMutedRef = useRef<boolean>(false);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  const stopSession = () => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (inputCtxRef.current) {
      inputCtxRef.current.close().catch(() => {});
      inputCtxRef.current = null;
    }
    if (outputCtxRef.current) {
      outputCtxRef.current.close().catch(() => {});
      outputCtxRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    activeSourcesRef.current = [];
    setConnected(false);
  };

  const playPcmChunk24k = (base64Pcm: string) => {
    const outCtx = outputCtxRef.current;
    if (!outCtx) return;

    const binary = atob(base64Pcm);
    const len = binary.length;
    const int16 = new Int16Array(len / 2);
    const view = new DataView(new ArrayBuffer(len));
    for (let i = 0; i < len; i++) {
      view.setUint8(i, binary.charCodeAt(i));
    }
    for (let i = 0; i < int16.length; i++) {
      int16[i] = view.getInt16(i * 2, true);
    }

    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / 32768.0;
    }

    const audioBuffer = outCtx.createBuffer(1, float32.length, 24000);
    audioBuffer.getChannelData(0).set(float32);

    const source = outCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(outCtx.destination);

    const now = outCtx.currentTime;
    const startAt = Math.max(now, nextStartTimeRef.current);
    source.start(startAt);
    nextStartTimeRef.current = startAt + audioBuffer.duration;
    activeSourcesRef.current.push(source);
  };

  const startLiveSession = async () => {
    setErrorMsg(null);
    setUserTranscript('');
    setTutorTranscript('');

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${window.location.host}/live`);
      wsRef.current = ws;

      const inputCtx = new AudioContext({ sampleRate: 16000 });
      const outputCtx = new AudioContext({ sampleRate: 24000 });
      inputCtxRef.current = inputCtx;
      outputCtxRef.current = outputCtx;
      nextStartTimeRef.current = outputCtx.currentTime;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      ws.onopen = () => {
        setConnected(true);
        ws.send(
          JSON.stringify({
            text: `Hola profesor. Estoy estudiando ${currentModuleTitle}. Hazme una pregunta socrática corta para comprobar mi comprensión.`,
          })
        );

        const source = inputCtx.createMediaStreamSource(stream);
        const processor = inputCtx.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        processor.onaudioprocess = (e) => {
          if (isMutedRef.current || ws.readyState !== WebSocket.OPEN) return;
          const channelData = e.inputBuffer.getChannelData(0);
          const base64Audio = floatTo16BitPCMBase64(channelData);
          ws.send(JSON.stringify({ audio: base64Audio }));
        };

        source.connect(processor);
        processor.connect(inputCtx.destination);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.audio) {
            playPcmChunk24k(msg.audio);
          }
          if (msg.inputTranscription) {
            setUserTranscript((prev) => `${prev} ${msg.inputTranscription}`.trim());
          }
          if (msg.outputTranscription) {
            setTutorTranscript((prev) => `${prev} ${msg.outputTranscription}`.trim());
          }
          if (msg.interrupted) {
            activeSourcesRef.current.forEach((s) => {
              try {
                s.stop();
              } catch {}
            });
            activeSourcesRef.current = [];
            if (outputCtxRef.current) {
              nextStartTimeRef.current = outputCtxRef.current.currentTime;
            }
          }
          if (msg.error) {
            setErrorMsg(msg.error);
          }
        } catch (err) {
          console.error('WS parse error:', err);
        }
      };

      ws.onclose = () => {
        setConnected(false);
      };
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'No se pudo acceder al micrófono o iniciar la sesión de voz.'
      );
      stopSession();
    }
  };

  useEffect(() => {
    if (!isOpen) {
      stopSession();
    }
    return () => {
      stopSession();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-100">
              Tutoría Socrática por Voz en Tiempo Real
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Motor: gemini-3.8-live · {currentModuleTitle}
            </p>
          </div>
          <button
            onClick={() => {
              stopSession();
              onClose();
            }}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
            aria-label="Cerrar tutor de voz"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="my-6 flex flex-col items-center justify-center rounded-lg border border-slate-800 bg-slate-950/60 p-6 text-center">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-400">
            {connected ? <Volume2 className="h-8 w-8" /> : <Radio className="h-8 w-8" />}
          </div>
          <p className="text-sm font-medium text-slate-200">
            {connected
              ? isMuted
                ? 'Micrófono silenciado'
                : 'Conectado en vivo — Explica tu razonamiento en voz alta (Método Feynman)'
              : 'Practica explicando un concepto en voz alta sin leer apuntes'}
          </p>
          <p className="mt-1 text-xs text-slate-400 max-w-md">
            El tutor escuchará tu explicación a 16kHz PCM y te responderá con preguntas socráticas habladas a 24kHz.
          </p>

          {errorMsg && (
            <div className="mt-4 w-full rounded-lg border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-300 text-left">
              Error: {errorMsg}
            </div>
          )}

          {(userTranscript || tutorTranscript) && (
            <div className="mt-4 w-full space-y-2 text-left text-xs border-t border-slate-800 pt-4 max-h-40 overflow-y-auto">
              {userTranscript && (
                <p className="text-slate-300">
                  <strong className="text-amber-400">Tú:</strong> {userTranscript}
                </p>
              )}
              {tutorTranscript && (
                <p className="text-slate-200">
                  <strong className="text-sky-400">Tutor CS50:</strong> {tutorTranscript}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3">
          {!connected ? (
            <button
              onClick={startLiveSession}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-amber-400 transition-colors"
            >
              <Mic className="h-4 w-4" />
              Iniciar Conversación en Vivo
            </button>
          ) : (
            <>
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                  isMuted
                    ? 'border-red-500/40 bg-red-950/40 text-red-300'
                    : 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`}
              >
                {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                {isMuted ? 'Reactivar Micrófono' : 'Silenciar Micrófono'}
              </button>
              <button
                onClick={stopSession}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-500 transition-colors"
              >
                Finalizar Sesión de Voz
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
