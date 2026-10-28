import React, { useState } from 'react';
import {
  Play,
  RotateCcw,
  ExternalLink,
  Copy,
  Check,
  Terminal,
  BookOpen,
  FileCode2,
  Lightbulb,
  Send,
  Info,
} from 'lucide-react';
import { CS50_MODULES, CS50Module } from './data/cs50Curriculum';

interface CodeRunResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  executionTimeMs: number | null;
}

const LANGUAGE_LABELS: Record<CS50Module['language'], string> = {
  scratch: 'Scratch (scratch.mit.edu)',
  c: 'C (GCC)',
  python: 'Python 3',
  sql: 'SQL (SQLite)',
  javascript: 'JavaScript (Node.js)',
};

export default function App() {
  const [currentModuleId, setCurrentModuleId] = useState<string>(CS50_MODULES[0].id);
  const currentModule =
    CS50_MODULES.find((m) => m.id === currentModuleId) || CS50_MODULES[0];

  const isClassZero = currentModule.id === 'module-0';

  // Left Panel Tabs: 'challenge' ("Reto del Ejercicio") | 'video-explanation' ("Explicación Sencilla del Vídeo")
  const [leftTab, setLeftTab] = useState<'challenge' | 'video-explanation'>('challenge');

  const [language, setLanguage] = useState<CS50Module['language']>(
    CS50_MODULES[0].language
  );
  const [code, setCode] = useState<string>(CS50_MODULES[0].starterCode);

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [terminalResult, setTerminalResult] = useState<CodeRunResult>({
    stdout: '',
    stderr: '',
    exitCode: null,
    executionTimeMs: null,
  });

  const [copiedCmd, setCopiedCmd] = useState<'check50' | 'submit50' | null>(null);

  // Video-Anchored Socratic Tutor & Hint State
  const [hintText, setHintText] = useState<string | null>(null);
  const [hintCount, setHintCount] = useState<number>(0);
  const [customQuestion, setCustomQuestion] = useState<string>('');
  const [isLoadingHint, setIsLoadingHint] = useState<boolean>(false);
  const [hintError, setHintError] = useState<string | null>(null);

  const handleSelectModule = (moduleId: string) => {
    const selected = CS50_MODULES.find((m) => m.id === moduleId);
    if (!selected) return;
    setCurrentModuleId(selected.id);
    setLanguage(selected.language);
    setCode(selected.starterCode);
    setTerminalResult({
      stdout: '',
      stderr: '',
      exitCode: null,
      executionTimeMs: null,
    });
    setHintText(null);
    setHintCount(0);
    setCustomQuestion('');
    setHintError(null);
  };

  const handleResetCode = () => {
    setCode(currentModule.starterCode);
    setLanguage(currentModule.language);
    setTerminalResult({
      stdout: '',
      stderr: '',
      exitCode: null,
      executionTimeMs: null,
    });
    setHintText(null);
    setHintError(null);
  };

  const handleRunCode = async () => {
    if (isRunning) return;
    setIsRunning(true);
    try {
      const res = await fetch('/api/code/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          code,
        }),
      });
      const data = await res.json();
      setTerminalResult({
        stdout: data.stdout || '',
        stderr: data.stderr || '',
        exitCode: typeof data.exitCode === 'number' ? data.exitCode : 0,
        executionTimeMs:
          typeof data.executionTimeMs === 'number' ? data.executionTimeMs : null,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setTerminalResult({
        stdout: '',
        stderr: `Error al conectar con el servidor de ejecución: ${msg}`,
        exitCode: 1,
        executionTimeMs: null,
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleRequestVideoAnchoredHelp = async (explicitQuestion?: string) => {
    if (isLoadingHint) return;
    setIsLoadingHint(true);
    setHintError(null);
    const nextHintStep = hintCount + 1;
    const questionToSend =
      (explicitQuestion ?? customQuestion).trim() ||
      (isClassZero
        ? 'Dame una pista sencilla sobre los conceptos del vídeo de la Clase 0 y cómo planificar mi proyecto en Scratch.'
        : 'Estoy atascado en este ejercicio. Dame una pista orientada a la lógica basándote en el vídeo de esta clase sin resolver el código.');

    const maxRetries = 2;
    let lastError = 'No se pudo obtener la explicación en este momento.';

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const res = await fetch('/api/gemini/tutor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: 'short-hint',
            currentModule,
            studentCode: isClassZero ? '' : code,
            terminalOutput: isClassZero
              ? ''
              : terminalResult.stderr || terminalResult.stdout || '',
            HintStep: nextHintStep,
            questionText: questionToSend,
            messages: [
              {
                role: 'user',
                content: questionToSend,
              },
            ],
          }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (
            (res.status === 503 || res.status === 429 || res.status === 504) &&
            attempt < maxRetries
          ) {
            await new Promise((r) => setTimeout(r, 800 * Math.pow(2, attempt)));
            continue;
          }
          throw new Error(data.error || `Error HTTP ${res.status}`);
        }

        const receivedHint =
          (data.hint || data.socraticReply || '').trim() ||
          `📍 En este vídeo (Capítulo: ${currentModule.title}): Piensa en el problema paso a paso usando una analogía cotidiana antes de continuar.`;
        setHintText(receivedHint);
        setHintCount(nextHintStep);
        if (explicitQuestion !== undefined || customQuestion.trim()) {
          setCustomQuestion('');
        }
        setIsLoadingHint(false);
        return;
      } catch (err: unknown) {
        lastError = err instanceof Error ? err.message : String(err);
        if (attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, 800 * Math.pow(2, attempt)));
        }
      }
    }

    setHintError(lastError);
    setIsLoadingHint(false);
  };

  const handleCopyCommand = (type: 'check50' | 'submit50', cmdText: string) => {
    navigator.clipboard.writeText(cmdText);
    setCopiedCmd(type);
    setTimeout(() => setCopiedCmd(null), 1800);
  };

  const { officialExercise, simpleVideoExplanations } = currentModule;

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-950 text-slate-100">
      {/* A. Minimalist Top Bar (Header) */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900/90 px-5">
        {/* Left: Brand Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-400 font-mono text-xs font-bold text-slate-950">
            CS50
          </div>
          <h1 className="text-sm font-semibold tracking-tight text-slate-100 sm:text-base">
            CS50 en Español — Harvard
          </h1>
        </div>

        {/* Center: Prominent Class Dropdown Selector (Clase 0 to Clase 10) */}
        <div className="flex items-center gap-2">
          <label
            htmlFor="class-selector"
            className="hidden text-xs font-medium text-slate-400 md:inline"
          >
            Clase activa:
          </label>
          <select
            id="class-selector"
            value={currentModule.id}
            onChange={(e) => handleSelectModule(e.target.value)}
            className="w-60 rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-100 focus:border-amber-400 focus:outline-none sm:w-80 md:w-96"
          >
            {CS50_MODULES.map((mod) => (
              <option key={mod.id} value={mod.id}>
                {mod.weekLabel} — {mod.title}
              </option>
            ))}
          </select>
        </div>

        {/* Right: Active Language Indicator */}
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <span className="hidden text-slate-500 sm:inline">Lenguaje:</span>
          <span className="rounded-md border border-amber-400/40 bg-amber-400/10 px-2.5 py-1 font-mono text-xs font-semibold text-amber-300">
            {isClassZero ? 'Scratch' : LANGUAGE_LABELS[language]}
          </span>
        </div>
      </header>

      {/* Main Unified Split-Screen Workspace (50% Left / 50% Right) */}
      <main className="grid flex-1 grid-cols-1 overflow-hidden lg:grid-cols-2">
        {/* B. Left Panel: APRENDER Y RETO (50% of screen, independent scroll) */}
        <section
          aria-label="Aprender y Reto Oficial"
          className="flex flex-col gap-4 overflow-y-auto border-b border-slate-800 p-5 lg:border-b-0 lg:border-r"
        >
          {/* 1. Synchronized YouTube Video */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="mb-2.5 flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-200">
                {currentModule.weekLabel}: {currentModule.title}
              </span>
              <a
                href={currentModule.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-amber-400 hover:underline"
              >
                Abrir en YouTube <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="aspect-video w-full overflow-hidden rounded-lg border border-slate-800 bg-black">
              <iframe
                title={`${currentModule.weekLabel} — ${currentModule.title}`}
                src={`https://www.youtube.com/embed/${currentModule.youtubeId}`}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          {/* 2. Two-Tab Selector Below Video: Pestaña A ("Reto del Ejercicio") vs Pestaña B ("Explicación Sencilla del Vídeo") */}
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 p-1.5">
            <button
              type="button"
              onClick={() => setLeftTab('challenge')}
              className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                leftTab === 'challenge'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              📋 Reto del Ejercicio ({currentModule.weekLabel})
            </button>
            <button
              type="button"
              onClick={() => setLeftTab('video-explanation')}
              className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                leftTab === 'video-explanation'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              💡 Explicación Sencilla del Vídeo (Vida Real)
            </button>
          </div>

          {/* TAB A: Reto Oficial (Problem Set) */}
          {leftTab === 'challenge' ? (
            <div className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex flex-col gap-3 border-b border-slate-800 pb-4">
                <div>
                  <p className="text-xs font-medium text-amber-400">
                    Reto Oficial de Harvard ({currentModule.weekLabel})
                  </p>
                  <h2 className="mt-0.5 text-base font-bold text-slate-100">
                    {officialExercise.title}
                  </h2>
                </div>

                {/* Enlaces Oficiales: En Clase 0 un único enlace limpio a https://scratch.mit.edu/ (target="_blank") */}
                <div className="flex flex-wrap items-center gap-2">
                  {isClassZero ? (
                    <a
                      href="https://scratch.mit.edu/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-amber-400 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-300 transition-colors"
                    >
                      Ir a Scratch (https://scratch.mit.edu/)
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    <>
                      <a
                        href={officialExercise.notesUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-amber-400/60 hover:text-amber-300 transition-colors"
                      >
                        <BookOpen className="h-3.5 w-3.5 text-amber-400" />
                        📖 Apuntes Oficiales de Harvard
                        <ExternalLink className="h-3 w-3 opacity-70" />
                      </a>
                      <a
                        href={officialExercise.psetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-amber-400/60 hover:text-amber-300 transition-colors"
                      >
                        <FileCode2 className="h-3.5 w-3.5 text-sky-400" />
                        📋 Enunciado Oficial de Harvard
                        <ExternalLink className="h-3 w-3 opacity-70" />
                      </a>
                    </>
                  )}
                </div>
              </div>

              {/* 🎯 Objetivo */}
              <div className="space-y-1.5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  🎯 Objetivo
                </h3>
                <p className="text-sm leading-relaxed text-slate-300">
                  {officialExercise.goal}
                </p>
              </div>

              {/* 📋 Requisitos de Harvard en Español */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  📋 Requisitos Oficiales de Harvard
                </h3>
                <ul className="list-disc space-y-1.5 pl-5 text-xs leading-relaxed text-slate-300">
                  {officialExercise.specs.map((spec, idx) => (
                    <li key={idx}>{spec}</li>
                  ))}
                </ul>
              </div>

              {/* 💻 Salida esperada (Usage) - Solo cuando aplica a código de consola */}
              {officialExercise.usageExample && (
                <div className="space-y-1.5">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    💻 Salida esperada (Usage)
                  </h3>
                  <pre className="overflow-x-auto rounded-lg border border-slate-800 bg-black p-3.5 font-mono text-xs leading-relaxed text-emerald-400">
                    <code>{officialExercise.usageExample}</code>
                  </pre>
                </div>
              )}

              {/* Comandos Oficiales: check50 & submit50 */}
              <div className="space-y-2 border-t border-slate-800 pt-3.5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Comandos Oficiales (CS50 CLI)
                </h3>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2">
                    <div className="min-w-0 flex-1">
                      <span className="block text-[10px] font-semibold uppercase text-slate-500">
                        Verificar (check50)
                      </span>
                      <code className="block truncate font-mono text-xs text-slate-200">
                        {officialExercise.check50}
                      </code>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyCommand('check50', officialExercise.check50)
                      }
                      className="inline-flex shrink-0 items-center gap-1 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-300 hover:bg-slate-800 transition-colors"
                    >
                      {copiedCmd === 'check50' ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2">
                    <div className="min-w-0 flex-1">
                      <span className="block text-[10px] font-semibold uppercase text-slate-500">
                        Entregar (submit50)
                      </span>
                      <code className="block truncate font-mono text-xs text-slate-200">
                        {officialExercise.submit50}
                      </code>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyCommand('submit50', officialExercise.submit50)
                      }
                      className="inline-flex shrink-0 items-center gap-1 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-300 hover:bg-slate-800 transition-colors"
                    >
                      {copiedCmd === 'submit50' ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* TAB B: Explicación Sencilla con Ejemplos de la Vida Real */
            <div className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="border-b border-slate-800 pb-3">
                <p className="text-xs font-medium text-amber-400">
                  Método Feynman · Cero Tecnicismos ({currentModule.weekLabel})
                </p>
                <h2 className="mt-0.5 text-base font-bold text-slate-100">
                  Explicación Sencilla del Vídeo con Ejemplos de la Vida Real
                </h2>
              </div>

              <div className="space-y-4">
                {simpleVideoExplanations.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-2.5"
                  >
                    <div className="text-xs font-semibold text-amber-400">
                      📍 {item.chapterTitle}
                    </div>
                    <h3 className="text-sm font-bold text-slate-100">
                      {item.analogyTitle}
                    </h3>
                    <div className="space-y-2 text-xs leading-relaxed text-slate-300 sm:text-sm">
                      {item.paragraphs.map((p, pIdx) => (
                        <p key={pIdx}>{p}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* C. Right Panel: EDITOR DE CÓDIGO ESTÁNDAR + TERMINAL (Todas las clases) */}
        <section
          aria-label="Editor de Código y Terminal"
          className="flex flex-col overflow-hidden bg-slate-950"
        >
          {/* Aviso superior en la Clase 0 */}
          {isClassZero && (
            <div className="flex items-start gap-2.5 border-b border-amber-400/30 bg-amber-400/10 px-4 py-3 text-xs leading-relaxed text-amber-200">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              <p>
                En la Clase 0 los ejercicios se realizan en la plataforma visual de Scratch (scratch.mit.edu). Este editor de código se activará con compilador y terminal a partir de la Clase 1 con el Lenguaje C.
              </p>
            </div>
          )}

          {/* 1. Editor Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-900/70 px-4 py-2.5">
            <div className="flex items-center gap-2.5">
              <label htmlFor="editor-lang" className="text-xs text-slate-400">
                Lenguaje:
              </label>
              <select
                id="editor-lang"
                value={language}
                onChange={(e) =>
                  setLanguage(e.target.value as CS50Module['language'])
                }
                className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 font-mono text-xs text-slate-100 focus:border-amber-400 focus:outline-none"
              >
                <option value="c">C</option>
                <option value="python">Python</option>
                <option value="sql">SQL</option>
                <option value="javascript">JavaScript</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetCode}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reiniciar Código
              </button>

              <button
                type="button"
                onClick={handleRunCode}
                disabled={isRunning}
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-400 px-4 py-1.5 text-xs font-semibold text-slate-950 hover:bg-amber-300 disabled:opacity-50 transition-colors"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                {isRunning ? 'Ejecutando...' : '▶ Ejecutar Código'}
              </button>
            </div>
          </div>

          {/* 2. Monospace Code Editor */}
          <div className="relative flex-1 overflow-hidden">
            <textarea
              aria-label="Editor de código"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="h-full w-full resize-none bg-slate-950 p-5 font-mono text-xs leading-relaxed text-slate-100 focus:outline-none sm:text-sm"
            />
          </div>

          {/* 3. Terminal Output (Below the editor) */}
          <div className="border-t border-slate-800 bg-black px-4 py-3">
            <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-300">
                <Terminal className="h-3.5 w-3.5 text-amber-400" />
                Terminal de Salida
              </span>
              {terminalResult.executionTimeMs !== null && (
                <span className="font-mono text-[11px] tabular-nums text-slate-400">
                  Exit: {terminalResult.exitCode} · Tiempo:{' '}
                  {terminalResult.executionTimeMs}ms
                </span>
              )}
            </div>

            <pre className="max-h-32 min-h-[76px] overflow-y-auto rounded-lg border border-slate-800/90 bg-slate-950/90 p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap">
              {terminalResult.stderr ? (
                <span className="text-red-400">{terminalResult.stderr}</span>
              ) : terminalResult.stdout ? (
                <span className="text-emerald-400">{terminalResult.stdout}</span>
              ) : (
                <span className="text-slate-500">
                  Pulsa &quot;▶ Ejecutar Código&quot; para compilar y ver la salida real aquí...
                </span>
              )}
            </pre>
          </div>

          {/* 4. Tutor IA Anclado al Vídeo y Capítulo Actual */}
          <div className="border-t border-slate-800 bg-slate-900/90 px-4 py-3.5 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleRequestVideoAnchoredHelp()}
                disabled={isLoadingHint}
                className="inline-flex items-center gap-2 rounded-lg border border-amber-400/40 bg-amber-400/10 px-3.5 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-400/20 disabled:opacity-50 transition-colors"
              >
                <Lightbulb className="h-3.5 w-3.5" />
                <span>
                  {isLoadingHint
                    ? 'Consultando capítulo del vídeo...'
                    : '💡 ¿Atascado? Pedir una pista de este vídeo'}
                </span>
              </button>

              <span className="text-[11px] text-slate-400">
                Anclado exclusivamente a <strong className="text-slate-200">{currentModule.weekLabel}</strong>
              </span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (customQuestion.trim()) {
                  handleRequestVideoAnchoredHelp(customQuestion);
                }
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder={`Pregunta una duda sobre el vídeo de ${currentModule.weekLabel}...`}
                className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isLoadingHint || !customQuestion.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 disabled:opacity-40 transition-colors"
              >
                <Send className="h-3 w-3" />
                Preguntar
              </button>
            </form>

            {hintText && (
              <div className="max-h-44 overflow-y-auto rounded-lg border border-amber-500/30 bg-slate-950 px-3.5 py-2.5 text-xs leading-relaxed text-slate-200 whitespace-pre-wrap">
                {hintText}
              </div>
            )}

            {hintError && (
              <div className="rounded-lg border border-red-500/30 bg-red-950/20 px-3.5 py-2 text-xs text-red-300">
                {hintError}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
