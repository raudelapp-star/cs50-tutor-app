import React, { useEffect, useRef, useState } from 'react';
import {
  BookOpen,
  Code2,
  Play,
  RotateCcw,
  Volume2,
  Mic,
  Square,
  HelpCircle,
  Copy,
  Check,
  ExternalLink,
  Calendar,
  Radio,
  Sparkles,
  Upload,
  Github,
  Trash2,
  Download,
  Terminal,
  Brain,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  db,
  initAuth,
  googleSignIn,
  logout,
  saveTopicProgressDoc,
  logRecurrentErrorDoc,
  saveTutorSessionDoc,
  updateUserProfileState,
  deleteErrorRecordDoc,
  loadUserProfileDoc,
  loadTutorSessionDoc,
  collection,
  query,
  where,
  onSnapshot,
  handleFirestoreError,
  OperationType,
} from './firebase';
import {
  CS50_MODULES,
  CS50Module,
  INITIAL_CLASS_0_WELCOME,
  GUIDED_AI_PROJECTS,
  EIGHT_TECH_GUIDES,
} from './data/cs50Curriculum';
import { LiveVoiceModal } from './components/LiveVoiceModal';
import { CalendarSchedulerModal } from './components/CalendarSchedulerModal';
import {
  GlobalAssistantDrawer,
  PendingConfirmationAction,
  AppScreenTab,
} from './components/GlobalAssistantDrawer';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  modelUsed?: string;
  detectedLevel?: number;
  passedCurrentLevel?: boolean;
  hintGiven?: boolean;
  errorDetected?: boolean;
  errorCategory?: string;
  recommendedIntervalDays?: number;
  singleQuestion?: string;
  groundingUrls?: { title: string; uri: string }[];
  functionCallsExecuted?: string[];
}

interface TopicProgressItem {
  id: string;
  moduleId: string;
  topicName: string;
  status: 'pending' | 'in_progress' | 'mastered';
  socraticLevel: number;
  attempts: number;
  hintsUsed: number;
  intervalDays: number;
  nextReviewDate: string;
}

interface ErrorRecordItem {
  id: string;
  moduleId: string;
  errorCategory: string;
  causeDescription: string;
  occurrences: number;
}

const ROUTINE_BLOCKS = [
  { id: 'recall', label: '01. Recuperación Activa (Sin apuntes)', minutes: 10 },
  { id: 'concept', label: '02. Concepto Nuevo y Vídeo CS50', minutes: 20 },
  { id: 'guided', label: '03. Práctica Guiada Socrática', minutes: 40 },
  { id: 'challenge', label: '04. Reto Práctico en Sandbox', minutes: 35 },
  { id: 'feynman', label: '05. Cierre Feynman y Registro Markdown', minutes: 15 },
];

export default function App() {
  // Navigation tabs (Top Bar Contract)
  const [activeTab, setActiveTab] = useState<
    'tutor' | 'sandbox' | 'curriculum' | 'memory' | 'architecture'
  >('tutor');

  // Auth & Firestore state
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [topicProgressMap, setTopicProgressMap] = useState<Record<string, TopicProgressItem>>({});
  const [errorRecords, setErrorRecords] = useState<ErrorRecordItem[]>([]);

  // Active CS50 Module & Learning Cycle State
  const [currentModuleId, setCurrentModuleId] = useState<string>('module-0');
  const currentModule: CS50Module =
    CS50_MODULES.find((m) => m.id === currentModuleId) || CS50_MODULES[0];
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [hintStep, setHintStep] = useState<number>(0);

  // Socratic Chat State (Starts with Class 0 Welcome as requested in Section 13)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-class-0',
      role: 'assistant',
      content: INITIAL_CLASS_0_WELCOME,
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'CS50 Maestro Tutor · Clase 0',
      detectedLevel: 1,
      singleQuestion:
        'En el peor de los casos, ¿cuántos pasos adicionales tendrás que dar con el Enfoque A frente a cuántos pasos adicionales necesitarás con el Enfoque B para encontrar a alguien en esa nueva guía de 2.000 páginas?',
    },
  ]);
  const [userInput, setUserInput] = useState('');
  const [tutorMode, setTutorMode] = useState<
    'socratic-structured' | 'deep-thinking' | 'grounding-tools' | 'fast-lite'
  >('socratic-structured');
  const [isSending, setIsSending] = useState(false);
  const inFlightTutorRef = useRef<boolean>(false);
  const [tutorRetryState, setTutorRetryState] = useState<{
    attempt: number;
    maxRetries: number;
    delayMs: number;
    status?: number;
  } | null>(null);
  const [tutorRequestError, setTutorRequestError] = useState<{
    message: string;
    status?: number;
    pendingHistory: ChatMessage[];
    nextHintStep: number;
    isHintRequest: boolean;
    originalText: string;
  } | null>(null);

  // Audio TTS & Microphone Transcription State
  const [isPlayingTts, setIsPlayingTts] = useState<string | null>(null);
  const [isRecordingMic, setIsRecordingMic] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Modals
  const [isLiveVoiceOpen, setIsLiveVoiceOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // 2-Hour Daily Routine Timer State
  const [activeRoutineIdx, setActiveRoutineIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(ROUTINE_BLOCKS[0].minutes * 60);
  const [timerRunning, setTimerRunning] = useState(false);

  // Code Execution Sandbox & Interactive Algorithm Visualizer State
  const [sandboxLang, setSandboxLang] = useState<'python' | 'c' | 'javascript' | 'sql'>('python');
  const [sandboxCode, setSandboxCode] = useState<string>(CS50_MODULES[0].starterCode);
  const [studentHypothesis, setStudentHypothesis] = useState<string>('');
  const [codeOutput, setCodeOutput] = useState<{
    stdout: string;
    stderr: string;
    exitCode: number | null;
    executionTimeMs: number | null;
  }>({ stdout: '', stderr: '', exitCode: null, executionTimeMs: null });
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [debuggerFeedback, setDebuggerFeedback] = useState<string | null>(null);
  const [isAnalyzingError, setIsAnalyzingError] = useState(false);

  // Interactive Phonebook Binary vs Linear Search Simulator (Educational Simulation)
  const [simPages, setSimPages] = useState<number>(1000);
  const [simTargetPage, setSimTargetPage] = useState<number>(342);
  const [simStepIndex, setSimStepIndex] = useState<number>(0);

  // Video Understanding State (gemini-4-argon)
  const [videoQuestion, setVideoQuestion] = useState('');
  const [uploadedVideoData, setUploadedVideoData] = useState<{
    base64: string;
    mimeType: string;
    name: string;
  } | null>(null);
  const [videoAnalysis, setVideoAnalysis] = useState<{
    verificationNotice: string;
    coreConcepts: string[];
    feynmanAnalogy: string;
    activeWatchChecklist: string[];
    socraticCheckQuestion: string;
    modelUsed: string;
  } | null>(null);
  const [isAnalyzingVideo, setIsAnalyzingVideo] = useState(false);

  // Memory Markdown Import/Export & GitHub Integration State
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [importedMarkdownText, setImportedMarkdownText] = useState('');
  const [importStatusMsg, setImportStatusMsg] = useState<string | null>(null);
  const [githubStatus, setGithubStatus] = useState<{
    connected: boolean;
    oauthConfigured: boolean;
    username?: string;
    htmlUrl?: string;
  }>({ connected: false, oauthConfigured: false });
  const [githubPat, setGithubPat] = useState('');
  const [gistResultUrl, setGistResultUrl] = useState<string | null>(null);
  const [isExportingGist, setIsExportingGist] = useState(false);
  const [gistError, setGistError] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Initialize Firebase Auth
  useEffect(() => {
    const unsub = initAuth((u) => {
      setUser(u);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  // Attach Firestore listeners when authenticated
  useEffect(() => {
    if (!authReady || !user) {
      setTopicProgressMap({});
      setErrorRecords([]);
      return;
    }

    const tpQuery = query(
      collection(db, 'topicProgress'),
      where('ownerId', '==', user.uid)
    );
    const unsubTp = onSnapshot(
      tpQuery,
      (snap) => {
        const nextMap: Record<string, TopicProgressItem> = {};
        snap.forEach((d) => {
          const data = d.data();
          nextMap[data.moduleId] = {
            id: d.id,
            moduleId: data.moduleId,
            topicName: data.topicName,
            status: data.status,
            socraticLevel: data.socraticLevel,
            attempts: data.attempts,
            hintsUsed: data.hintsUsed,
            intervalDays: data.intervalDays,
            nextReviewDate: data.nextReviewDate,
          };
        });
        setTopicProgressMap(nextMap);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'topicProgress')
    );

    const errQuery = query(
      collection(db, 'errorRecords'),
      where('ownerId', '==', user.uid)
    );
    const unsubErr = onSnapshot(
      errQuery,
      (snap) => {
        const list: ErrorRecordItem[] = [];
        snap.forEach((d) => {
          const data = d.data();
          list.push({
            id: d.id,
            moduleId: data.moduleId,
            errorCategory: data.errorCategory,
            causeDescription: data.causeDescription,
            occurrences: data.occurrences,
          });
        });
        setErrorRecords(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'errorRecords')
    );

    // Automatically restore user's active module, level, and saved Socratic conversation from Firestore
    (async () => {
      try {
        const profile = await loadUserProfileDoc(user.uid);
        const modId = profile?.currentModuleId || 'module-0';
        const lvl = profile?.currentLevel || 1;
        const foundMod = CS50_MODULES.find((m) => m.id === modId);
        if (foundMod) {
          setCurrentModuleId(foundMod.id);
          setSandboxLang(foundMod.language);
          setSandboxCode(foundMod.starterCode);
        }
        setCurrentLevel(lvl);

        const savedSession = await loadTutorSessionDoc(user.uid, modId);
        if (savedSession?.messagesJson) {
          const parsedMsgs = JSON.parse(savedSession.messagesJson);
          if (Array.isArray(parsedMsgs) && parsedMsgs.length > 0) {
            setMessages(parsedMsgs);
          }
        }
      } catch (e) {
        console.error('Failed to restore user session:', e);
      }
    })();

    return () => {
      unsubTp();
      unsubErr();
    };
  }, [authReady, user]);

  // Check GitHub connection status & popup message listener
  const checkGithubStatus = async () => {
    try {
      const res = await fetch('/api/github/status');
      if (res.ok) {
        const data = await res.json();
        setGithubStatus(data);
      }
    } catch {}
  };

  useEffect(() => {
    checkGithubStatus();
    const handlePopupMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        checkGithubStatus();
      }
    };
    window.addEventListener('message', handlePopupMessage);
    return () => window.removeEventListener('message', handlePopupMessage);
  }, []);

  // 2-hour routine countdown timer
  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  const formatTimer = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Switch active CS50 module
  const handleSelectModule = (mod: CS50Module, startInTutor = false) => {
    setCurrentModuleId(mod.id);
    setSandboxLang(mod.language);
    setSandboxCode(mod.starterCode);
    const savedProgress = topicProgressMap[mod.id];
    const lvl = savedProgress ? savedProgress.socraticLevel : 1;
    setCurrentLevel(lvl);
    setHintStep(0);

    if (user) {
      updateUserProfileState(user.uid, {
        currentModuleId: mod.id,
        currentLevel: lvl,
      });
    }

    if (startInTutor) {
      setActiveTab('tutor');
      const moduleIntroMsg: ChatMessage = {
        id: `mod-intro-${Date.now()}`,
        role: 'assistant',
        content: `📺 **RECURSO DE VÍDEO**

**Tema:** ${mod.title} (${mod.weekLabel})

**Vídeo recomendado:** ${mod.videoUrl}

**Qué estudiar:** ${mod.verifiedTopics} *(Contenidos verificados del programa de CS50; revisa el vídeo antes o durante nuestra práctica).*

---

### Por qué importa en proyectos reales
${mod.realWorldUseCase}

### Nivel ${lvl} Activo — Comprobación Inicial (Feynman)
${mod.feynmanPrompt}`,
        timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'Sincronizador CS50',
        detectedLevel: lvl,
        singleQuestion: mod.feynmanPrompt,
      };
      setMessages((prev) => [...prev, moduleIntroMsg]);
    }
  };

  // Global Assistant handlers connected to existing navigation & progress services
  const handleAssistantNavigateScreen = (
    screen: AppScreenTab,
    openModal: 'none' | 'live-voice' | 'calendar' = 'none'
  ) => {
    setActiveTab(screen);
    if (openModal === 'live-voice') {
      setIsLiveVoiceOpen(true);
    } else if (openModal === 'calendar') {
      setIsCalendarOpen(true);
    }
  };

  const handleAssistantOpenLessonModule = (mod: CS50Module, targetScreen: AppScreenTab) => {
    handleSelectModule(mod, targetScreen === 'tutor');
    if (targetScreen !== 'tutor') {
      setActiveTab(targetScreen);
    }
  };

  const handleAssistantStartExercise = (
    mod: CS50Module,
    customStarterCode?: string,
    language?: 'python' | 'c' | 'sql' | 'javascript'
  ) => {
    setCurrentModuleId(mod.id);
    setSandboxLang(language || mod.language);
    setSandboxCode(customStarterCode || mod.starterCode);
    const savedProgress = topicProgressMap[mod.id];
    const lvl = savedProgress ? savedProgress.socraticLevel : 2;
    setCurrentLevel(lvl);
    setHintStep(0);
    setActiveTab('sandbox');

    if (user) {
      updateUserProfileState(user.uid, {
        currentModuleId: mod.id,
        currentLevel: lvl,
      });
    }
  };

  const handleExecuteConfirmedAssistantMutation = async (
    action: PendingConfirmationAction
  ): Promise<string> => {
    const targetModId = action.moduleId || currentModule.id;
    const mod = CS50_MODULES.find((m) => m.id === targetModId) || currentModule;
    const existing = topicProgressMap[mod.id];
    const todayStr = new Date().toISOString().slice(0, 10);

    if (action.actionType === 'update_level' || action.actionType === 'change_study_plan') {
      const nextLvl = Math.max(1, Math.min(4, Number(action.targetLevel || 1)));
      const nextStatus: 'pending' | 'in_progress' | 'mastered' =
        nextLvl >= 4 ? 'mastered' : nextLvl > 1 ? 'in_progress' : 'pending';
      const nextItem: TopicProgressItem = {
        id: existing?.id || `${user?.uid || 'local'}_${mod.id}`,
        moduleId: mod.id,
        topicName: mod.title,
        status: nextStatus,
        socraticLevel: nextLvl,
        attempts: existing?.attempts || 1,
        hintsUsed: existing?.hintsUsed || 0,
        intervalDays: existing?.intervalDays || 1,
        nextReviewDate: existing?.nextReviewDate || todayStr,
      };
      setTopicProgressMap((prev) => ({ ...prev, [mod.id]: nextItem }));
      if (mod.id === currentModule.id) {
        setCurrentLevel(nextLvl);
      }
      if (user) {
        await saveTopicProgressDoc(user.uid, mod.id, {
          topicName: mod.title,
          status: nextStatus,
          socraticLevel: nextLvl,
          attempts: nextItem.attempts,
          hintsUsed: nextItem.hintsUsed,
          intervalDays: nextItem.intervalDays,
          nextReviewDate: nextItem.nextReviewDate,
        });
        await updateUserProfileState(user.uid, {
          currentModuleId: mod.id,
          currentLevel: nextLvl,
        });
      }
      return `Se actualizó ${mod.weekLabel} (${mod.title}) a Nivel ${nextLvl}/4 (${nextStatus}).`;
    }

    if (action.actionType === 'mark_status') {
      const nextStatus = action.targetStatus || 'in_progress';
      const nextLvl = nextStatus === 'mastered' ? 4 : nextStatus === 'in_progress' ? 2 : 1;
      const nextItem: TopicProgressItem = {
        id: existing?.id || `${user?.uid || 'local'}_${mod.id}`,
        moduleId: mod.id,
        topicName: mod.title,
        status: nextStatus,
        socraticLevel: nextLvl,
        attempts: existing?.attempts || 1,
        hintsUsed: existing?.hintsUsed || 0,
        intervalDays: nextStatus === 'mastered' ? 7 : 1,
        nextReviewDate: existing?.nextReviewDate || todayStr,
      };
      setTopicProgressMap((prev) => ({ ...prev, [mod.id]: nextItem }));
      if (mod.id === currentModule.id) {
        setCurrentLevel(nextLvl);
      }
      if (user) {
        await saveTopicProgressDoc(user.uid, mod.id, {
          topicName: mod.title,
          status: nextStatus,
          socraticLevel: nextLvl,
          attempts: nextItem.attempts,
          hintsUsed: nextItem.hintsUsed,
          intervalDays: nextItem.intervalDays,
          nextReviewDate: nextItem.nextReviewDate,
        });
      }
      return `Estado de ${mod.weekLabel} marcado como "${nextStatus}" (Nivel ${nextLvl}/4).`;
    }

    if (action.actionType === 'reset_module') {
      const resetItem: TopicProgressItem = {
        id: existing?.id || `${user?.uid || 'local'}_${mod.id}`,
        moduleId: mod.id,
        topicName: mod.title,
        status: 'pending',
        socraticLevel: 1,
        attempts: 0,
        hintsUsed: 0,
        intervalDays: 1,
        nextReviewDate: todayStr,
      };
      setTopicProgressMap((prev) => ({ ...prev, [mod.id]: resetItem }));
      if (mod.id === currentModule.id) {
        setCurrentLevel(1);
        setSandboxCode(mod.starterCode);
      }
      if (user) {
        await saveTopicProgressDoc(user.uid, mod.id, {
          topicName: mod.title,
          status: 'pending',
          socraticLevel: 1,
          attempts: 0,
          hintsUsed: 0,
          intervalDays: 1,
          nextReviewDate: todayStr,
        });
      }
      return `Progreso de ${mod.weekLabel} (${mod.title}) reiniciado a Nivel 1 (Pendiente).`;
    }

    if (action.actionType === 'delete_error_record') {
      const targetErr = action.errorId
        ? errorRecords.find((e) => e.id === action.errorId)
        : errorRecords[0];
      if (!targetErr) {
        return 'No se encontró ningún registro de error recurrente para eliminar.';
      }
      setErrorRecords((prev) => prev.filter((e) => e.id !== targetErr.id));
      if (user) {
        await deleteErrorRecordDoc(targetErr.id);
      }
      return `Registro de error "${targetErr.errorCategory}" eliminado correctamente.`;
    }

    if (action.actionType === 'clear_all_errors') {
      const toDelete = [...errorRecords];
      setErrorRecords([]);
      if (user) {
        for (const err of toDelete) {
          await deleteErrorRecordDoc(err.id);
        }
      }
      return `Se eliminaron ${toDelete.length} registros de errores recurrentes.`;
    }

    return 'Cambio confirmado y aplicado.';
  };

  // Calculate deterministic Spaced Repetition next date (1d, 3d, 7d, 14d)
  const computeNextIntervalDays = (
    prevInterval: number,
    passedLevel: boolean,
    errorDetected: boolean,
    usedHint: boolean
  ): number => {
    if (errorDetected || usedHint) return 1;
    if (!passedLevel) return Math.max(1, prevInterval || 1);
    if (prevInterval <= 1) return 3;
    if (prevInterval <= 3) return 7;
    return 14;
  };

  // Send message to Socratic Tutor with bounded exponential backoff & duplicate request protection
  const MAX_TUTOR_RETRIES = 3;

  const executeTutorRequestWithBackoff = async (params: {
    updatedHistory: ChatMessage[];
    nextHintStep: number;
    isHintRequest: boolean;
    originalText: string;
  }) => {
    const { updatedHistory, nextHintStep, isHintRequest, originalText } = params;
    setTutorRequestError(null);
    setTutorRetryState(null);
    setIsSending(true);
    inFlightTutorRef.current = true;

    // Persist student's message immediately so neither message nor progress is lost on failure
    try {
      localStorage.setItem(
        `cs50_tutor_session_${currentModule.id}`,
        JSON.stringify(updatedHistory.slice(-15))
      );
    } catch {}
    if (user) {
      saveTutorSessionDoc(
        user.uid,
        currentModule.id,
        JSON.stringify(updatedHistory.slice(-15)),
        generateMarkdownProgressBlock()
      ).catch(() => {});
    }

    try {
      let data: any = null;
      let lastError: Error | null = null;
      let lastStatus: number | undefined = undefined;

      for (let attempt = 0; attempt <= MAX_TUTOR_RETRIES; attempt++) {
        try {
          const response = await fetch('/api/gemini/tutor', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: updatedHistory.slice(-10).map((m) => ({
                role: m.role,
                content: m.content,
              })),
              currentModule,
              currentLevel,
              mode: tutorMode,
              studentCode: sandboxCode,
              HintStep: nextHintStep,
            }),
          });

          let payload: any = {};
          try {
            payload = await response.json();
          } catch {
            payload = {};
          }

          if (!response.ok) {
            lastStatus = response.status;
            const isRetryableStatus =
              response.status === 503 ||
              response.status === 429 ||
              response.status === 502 ||
              response.status === 504 ||
              Boolean(payload.retryable);

            const errMessage =
              payload.error ||
              (response.status === 503
                ? 'El servicio del tutor está experimentando alta demanda temporal (Error 503).'
                : response.status === 429
                ? 'Se alcanzó el límite temporal de peticiones (Error 429).'
                : `Error del servidor (${response.status}) al contactar con el tutor.`);

            const errObj = new Error(errMessage) as Error & {
              status?: number;
              retryable?: boolean;
            };
            errObj.status = response.status;
            errObj.retryable = isRetryableStatus;
            throw errObj;
          }

          data = payload;
          break; // Request succeeded
        } catch (err: any) {
          const isNetworkError =
            err instanceof TypeError ||
            String(err?.message || '').toLowerCase().includes('failed to fetch') ||
            String(err?.message || '').toLowerCase().includes('network');
          const status = typeof err?.status === 'number' ? err.status : undefined;
          lastStatus = status;
          const canRetry = Boolean(err?.retryable) || isNetworkError;

          lastError =
            err instanceof Error
              ? err
              : new Error('Error de conexión con el servidor del tutor.');

          if (!canRetry || attempt === MAX_TUTOR_RETRIES) {
            throw lastError;
          }

          // Exponential backoff: 1000ms, 2000ms, 4000ms + jitter
          const nextAttemptNum = attempt + 1;
          const delayMs = 1000 * Math.pow(2, attempt) + Math.floor(Math.random() * 250);
          setTutorRetryState({
            attempt: nextAttemptNum,
            maxRetries: MAX_TUTOR_RETRIES,
            delayMs,
            status,
          });
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }

      setTutorRetryState(null);

      // Process Adaptive Evaluation & Spaced Repetition logic deterministically in the app
      let nextLevel = currentLevel;
      if (data.passedCurrentLevel && currentLevel < 4) {
        nextLevel = currentLevel + 1;
      } else if (
        typeof data.detectedLevel === 'number' &&
        data.detectedLevel >= 1 &&
        data.detectedLevel <= 4
      ) {
        nextLevel = data.detectedLevel;
      }

      // Check if Function Calls were returned in grounding-tools mode
      const executedTools: string[] = [];
      if (Array.isArray(data.functionCalls)) {
        for (const fc of data.functionCalls) {
          executedTools.push(`${fc.name}(${JSON.stringify(fc.args || {})})`);
          if (fc.name === 'advanceMasteryLevel' && fc.args?.newLevel) {
            nextLevel = Math.min(4, Math.max(1, Number(fc.args.newLevel)));
          }
          if (fc.name === 'loadSandboxExercise' && fc.args?.starterCode) {
            setSandboxCode(String(fc.args.starterCode));
            if (fc.args?.language) {
              setSandboxLang(fc.args.language);
            }
          }
          if (fc.name === 'recordRecurrentError' && user && fc.args?.errorCategory) {
            await logRecurrentErrorDoc(
              user.uid,
              currentModule.id,
              String(fc.args.errorCategory),
              String(fc.args.causeDescription || 'Error detectado por herramienta socrática')
            );
          }
        }
      }

      if (data.sandboxStarterCode && data.sandboxStarterCode.trim().length > 10) {
        setSandboxCode(data.sandboxStarterCode);
      }

      setCurrentLevel(nextLevel);

      const existingProg = topicProgressMap[currentModule.id];
      const prevAttempts = existingProg?.attempts || 0;
      const prevHints = existingProg?.hintsUsed || 0;
      const prevInterval = existingProg?.intervalDays || 1;

      const intervalDays = computeNextIntervalDays(
        prevInterval,
        Boolean(data.passedCurrentLevel),
        Boolean(data.errorDetected),
        isHintRequest || Boolean(data.hintGiven)
      );

      const nextReviewIso = new Date(Date.now() + intervalDays * 86400000)
        .toISOString()
        .slice(0, 10);

      const newStatus: 'pending' | 'in_progress' | 'mastered' =
        nextLevel === 4 && data.passedCurrentLevel ? 'mastered' : 'in_progress';

      // Update local state map immediately and persist to Firestore if logged in
      const updatedProgressItem: TopicProgressItem = {
        id: `${user?.uid || 'local'}_${currentModule.id}`,
        moduleId: currentModule.id,
        topicName: currentModule.title,
        status: newStatus,
        socraticLevel: nextLevel,
        attempts: prevAttempts + 1,
        hintsUsed: prevHints + (isHintRequest ? 1 : 0),
        intervalDays,
        nextReviewDate: nextReviewIso,
      };

      setTopicProgressMap((prev) => ({
        ...prev,
        [currentModule.id]: updatedProgressItem,
      }));

      if (user) {
        await saveTopicProgressDoc(user.uid, currentModule.id, updatedProgressItem);
        if (data.errorDetected && data.errorCategory) {
          await logRecurrentErrorDoc(
            user.uid,
            currentModule.id,
            String(data.errorCategory),
            String(data.errorExplanation || 'Error conceptual en sesión socrática')
          );
        }
      }

      const groundingUrls: { title: string; uri: string }[] = [];
      if (Array.isArray(data.groundingChunks)) {
        for (const chunk of data.groundingChunks) {
          if (chunk.web?.uri) {
            groundingUrls.push({
              title: chunk.web.title || chunk.web.uri,
              uri: chunk.web.uri,
            });
          }
        }
      }

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.socraticReply,
        timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed,
        detectedLevel: nextLevel,
        passedCurrentLevel: Boolean(data.passedCurrentLevel),
        hintGiven: isHintRequest || Boolean(data.hintGiven),
        errorDetected: Boolean(data.errorDetected),
        errorCategory: data.errorCategory ? String(data.errorCategory) : undefined,
        recommendedIntervalDays: intervalDays,
        singleQuestion: data.singleQuestion,
        groundingUrls,
        functionCallsExecuted: executedTools,
      };

      const finalMessages = [...updatedHistory, assistantMsg];
      setMessages(finalMessages);

      try {
        localStorage.setItem(
          `cs50_tutor_session_${currentModule.id}`,
          JSON.stringify(finalMessages.slice(-15))
        );
      } catch {}

      if (user) {
        await saveTutorSessionDoc(
          user.uid,
          currentModule.id,
          JSON.stringify(finalMessages.slice(-15)),
          generateMarkdownProgressBlock()
        );
      }
    } catch (err: any) {
      setTutorRetryState(null);
      const errMsg = err instanceof Error ? err.message : String(err);
      const status = typeof err?.status === 'number' ? err.status : undefined;
      setTutorRequestError({
        message: errMsg,
        status,
        pendingHistory: updatedHistory,
        nextHintStep,
        isHintRequest,
        originalText,
      });
    } finally {
      inFlightTutorRef.current = false;
      setIsSending(false);
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const handleSendMessage = async (overridePrompt?: string, isHintRequest = false) => {
    const textToSend = (overridePrompt ?? userInput).trim();
    if (!textToSend || isSending || inFlightTutorRef.current) return;

    const nextHintStep = isHintRequest ? Math.min(5, hintStep + 1) : hintStep;
    if (isHintRequest) {
      setHintStep(nextHintStep);
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    if (!overridePrompt) setUserInput('');

    await executeTutorRequestWithBackoff({
      updatedHistory,
      nextHintStep,
      isHintRequest,
      originalText: textToSend,
    });
  };

  const handleManualRetryTutorRequest = async () => {
    if (!tutorRequestError || isSending || inFlightTutorRef.current) return;
    await executeTutorRequestWithBackoff({
      updatedHistory: tutorRequestError.pendingHistory,
      nextHintStep: tutorRequestError.nextHintStep,
      isHintRequest: tutorRequestError.isHintRequest,
      originalText: tutorRequestError.originalText,
    });
  };

  // Trigger 5-step Socratic Bloqueo Protocol
  const handleRequestSocraticHint = () => {
    const nextStep = Math.min(5, hintStep + 1);
    const stepDescriptions: Record<number, string> = {
      1: 'Estoy bloqueado (Paso 1/5 del protocolo): Pídeme primero que te explique qué intento conseguir y qué parte exacta no entiendo.',
      2: 'Sigo bloqueado (Paso 2/5 del protocolo): Divide el problema en pasos más pequeños y dame una analogía Feynman sin resolver el ejercicio.',
      3: 'Necesito una pista concreta (Paso 3/5 del protocolo): Dame una pista puntual que me permita dar el siguiente paso por mí mismo.',
      4: 'Aún no logro avanzar (Paso 4/5 del protocolo): Muéstrame un ejemplo independiente de sintaxis o lógica similar (pero que NO sea la solución de mi ejercicio).',
      5: 'Paso 5/5 del protocolo: Ayúdame a verificar mi último intento paso a paso con una pregunta guía.',
    };
    handleSendMessage(stepDescriptions[nextStep], true);
  };

  // Text-to-Speech Playback (gemini-3.8-flash-tts)
  const handlePlayTts = async (msgId: string, text: string, mode: 'single' | 'dual-podcast' = 'single') => {
    if (isPlayingTts === msgId) return;
    setIsPlayingTts(msgId);
    try {
      const res = await fetch('/api/gemini/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, mode }),
      });
      const data = await res.json();
      if (data.audioBase64) {
        const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
        audio.onended = () => setIsPlayingTts(null);
        audio.onerror = () => setIsPlayingTts(null);
        await audio.play();
      } else {
        setIsPlayingTts(null);
      }
    } catch {
      setIsPlayingTts(null);
    }
  };

  // Microphone Audio Recording & Transcription (gemini-3.5-transcribe)
  const handleToggleMicRecording = async () => {
    if (isRecordingMic && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecordingMic(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setIsTranscribing(true);
        try {
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64String = String(reader.result || '').split(',')[1];
            if (!base64String) {
              setIsTranscribing(false);
              return;
            }
            const res = await fetch('/api/gemini/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                audioBase64: base64String,
                mimeType: 'audio/webm',
              }),
            });
            const data = await res.json();
            if (data.transcription) {
              setUserInput((prev) => `${prev} ${data.transcription}`.trim());
            }
            setIsTranscribing(false);
          };
          reader.readAsDataURL(audioBlob);
        } catch {
          setIsTranscribing(false);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecordingMic(true);
    } catch (err) {
      console.error('Microphone error:', err);
    }
  };

  // Run Code in Isolated Sandbox (/api/code/run)
  const handleRunCode = async () => {
    setIsRunningCode(true);
    setDebuggerFeedback(null);
    try {
      const res = await fetch('/api/code/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: sandboxLang,
          code: sandboxCode,
        }),
      });
      const data = await res.json();
      setCodeOutput({
        stdout: data.stdout || '',
        stderr: data.stderr || '',
        exitCode: data.exitCode ?? 0,
        executionTimeMs: data.executionTimeMs ?? 0,
      });
    } catch (err: unknown) {
      setCodeOutput({
        stdout: '',
        stderr: err instanceof Error ? err.message : 'Error ejecutando sandbox',
        exitCode: 1,
        executionTimeMs: 0,
      });
    } finally {
      setIsRunningCode(false);
    }
  };

  // Socratic Error Diagnosis with gemini-3.1-flash-lite
  const handleAnalyzeCodeSocratically = async () => {
    setIsAnalyzingError(true);
    try {
      const res = await fetch('/api/gemini/fast-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: sandboxLang,
          code: sandboxCode,
          compilerOutput: codeOutput.stderr || codeOutput.stdout,
          studentHypothesis,
        }),
      });
      const data = await res.json();
      setDebuggerFeedback(data.feedback || 'Revisa la salida de la terminal paso a paso.');
    } catch {
      setDebuggerFeedback('No se pudo analizar el código en este momento.');
    } finally {
      setIsAnalyzingError(false);
    }
  };

  // Video Understanding Analysis with gemini-4-argon
  const handleAnalyzeVideo = async () => {
    setIsAnalyzingVideo(true);
    try {
      const res = await fetch('/api/gemini/analyze-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl: currentModule.videoUrl,
          moduleTitle: currentModule.title,
          verifiedTopics: currentModule.verifiedTopics,
          questionPrompt: videoQuestion,
          videoBase64: uploadedVideoData?.base64,
          mimeType: uploadedVideoData?.mimeType,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setVideoAnalysis(data);
      }
    } catch (err) {
      console.error('Video analysis failed:', err);
    } finally {
      setIsAnalyzingVideo(false);
    }
  };

  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = String(reader.result || '').split(',')[1];
      if (base64) {
        setUploadedVideoData({
          base64,
          mimeType: file.type || 'video/mp4',
          name: file.name,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Generate exportable Markdown Progress Block (Section 9)
  const generateMarkdownProgressBlock = (): string => {
    const nowStr = new Date().toISOString().slice(0, 10);
    const mastered = CS50_MODULES.filter((m) => topicProgressMap[m.id]?.status === 'mastered');
    const inProgress = CS50_MODULES.filter((m) => topicProgressMap[m.id]?.status === 'in_progress');
    const pending = CS50_MODULES.filter(
      (m) => !topicProgressMap[m.id] || topicProgressMap[m.id]?.status === 'pending'
    );

    const errLines =
      errorRecords.length > 0
        ? errorRecords
            .map(
              (e) =>
                `- [${e.moduleId}] ${e.errorCategory} (${e.occurrences}x): ${e.causeDescription}`
            )
            .join('\n')
        : '- Sin errores recurrentes registrados aún.';

    return `# REGISTRO DE EVOLUCIÓN — CS50 MAESTRO TUTOR
Fecha de actualización: ${nowStr}
Módulo activo: ${currentModule.weekLabel} — ${currentModule.title} (${currentModule.id})
Nivel del Ciclo Obligatorio Actual: Nivel ${currentLevel} / 4
Pistas utilizadas en el ejercicio activo: ${hintStep} / 5

## 1. Conceptos Dominados (Nivel 4 demostrado independientemente)
${mastered.length > 0 ? mastered.map((m) => `- [x] ${m.weekLabel}: ${m.title}`).join('\n') : '- Ninguno completado en Nivel 4 todavía (en construcción).'}

## 2. Conceptos en Proceso
${
  inProgress.length > 0
    ? inProgress
        .map((m) => {
          const p = topicProgressMap[m.id];
          return `- [/] ${m.weekLabel}: ${m.title} · Nivel ${p.socraticLevel}/4 · Intentos: ${p.attempts} · Pistas: ${p.hintsUsed} · Próximo repaso: ${p.nextReviewDate} (${p.intervalDays}d)`;
        })
        .join('\n')
    : `- [/] ${currentModule.weekLabel}: ${currentModule.title} · Nivel ${currentLevel}/4`
}

## 3. Conceptos Pendientes
${pending.map((m) => `- [ ] ${m.weekLabel}: ${m.title}`).join('\n')}

## 4. Errores Recurrentes y Causa Raíz
${errLines}

## 5. Próximo Objetivo y Ejercicio
- Completar Nivel ${currentLevel} de ${currentModule.weekLabel} (${currentModule.starterChallengeTitle}) explicando la solución con mis propias palabras (Método Feynman).`;
  };

  // Import Markdown Progress Block to restore state (Section 9)
  const handleImportMarkdownProgress = () => {
    if (!importedMarkdownText.trim()) return;
    const modMatch = importedMarkdownText.match(/\((module-\d+)\)/);
    const lvlMatch = importedMarkdownText.match(/Nivel\s+(\d)\s*\/\s*4/);

    if (modMatch?.[1]) {
      const foundMod = CS50_MODULES.find((m) => m.id === modMatch[1]);
      if (foundMod) {
        setCurrentModuleId(foundMod.id);
        setSandboxLang(foundMod.language);
        setSandboxCode(foundMod.starterCode);
      }
    }
    if (lvlMatch?.[1]) {
      setCurrentLevel(Math.min(4, Math.max(1, Number(lvlMatch[1]))));
    }
    setImportStatusMsg(
      'Registro de progreso leído y restaurado correctamente. El tutor continuará exactamente desde este punto.'
    );
  };

  // Connect GitHub OAuth Popup or Export Gist
  const handleConnectGithubPopup = async () => {
    try {
      const res = await fetch('/api/github/auth-url');
      const data = await res.json();
      if (data.configured && data.url) {
        window.open(data.url, 'github_oauth_popup', 'width=600,height=700');
      } else {
        setActiveTab('architecture');
      }
    } catch (err) {
      console.error('GitHub popup error:', err);
    }
  };

  const handleExportToGithubGist = async () => {
    setIsExportingGist(true);
    setGistError(null);
    setGistResultUrl(null);
    try {
      const res = await fetch('/api/github/export-gist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: githubPat.trim() || undefined,
          filename: `CS50_PROGRESO_${new Date().toISOString().slice(0, 10)}.md`,
          content: `${generateMarkdownProgressBlock()}\n\n## Último Código en Sandbox (${sandboxLang})\n\`\`\`${sandboxLang}\n${sandboxCode}\n\`\`\``,
          description: `Progreso CS50 Maestro Tutor — ${currentModule.weekLabel}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo exportar el Gist');
      }
      setGistResultUrl(data.htmlUrl);
    } catch (err: unknown) {
      setGistError(err instanceof Error ? err.message : 'Error al exportar a GitHub');
    } finally {
      setIsExportingGist(false);
    }
  };

  // Compute Binary Search steps for the interactive educational visualizer
  const computeBinarySearchTrace = (totalPages: number, target: number) => {
    const steps: { step: number; low: number; high: number; mid: number; action: string }[] = [];
    let low = 1;
    let high = totalPages;
    let count = 0;
    while (low <= high && count < 20) {
      count++;
      const mid = Math.floor((low + high) / 2);
      if (mid === target) {
        steps.push({
          step: count,
          low,
          high,
          mid,
          action: `¡Encontrado en la página ${mid} en solo ${count} pasos! (Búsqueda lineal habría tardado ${target} pasos).`,
        });
        break;
      } else if (mid < target) {
        steps.push({
          step: count,
          low,
          high,
          mid,
          action: `Página media ${mid} < ${target}: descartamos la mitad izquierda (${low}..${mid}).`,
        });
        low = mid + 1;
      } else {
        steps.push({
          step: count,
          low,
          high,
          mid,
          action: `Página media ${mid} > ${target}: descartamos la mitad derecha (${mid}..${high}).`,
        });
        high = mid - 1;
      }
    }
    return steps;
  };

  const binaryTrace = computeBinarySearchTrace(simPages, simTargetPage);
  const currentTraceStep = binaryTrace[Math.min(simStepIndex, binaryTrace.length - 1)] || binaryTrace[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-slate-800/80 bg-slate-950/90 sticky top-0 z-30 backdrop-blur-md">
        {/* Zone 1: Brand Title (Single text element wordmark) */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('tutor');
          }}
          className="text-lg font-bold tracking-tight text-slate-100 whitespace-nowrap shrink-0"
        >
          CS50 Maestro Tutor
        </a>

        {/* Zone 2: 5 Single-Line Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <button
            onClick={() => setActiveTab('tutor')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'tutor'
                ? 'border-amber-400 text-slate-100'
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            Tutor Socrático
          </button>
          <button
            onClick={() => setActiveTab('sandbox')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'sandbox'
                ? 'border-amber-400 text-slate-100'
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            Laboratorio de Código
          </button>
          <button
            onClick={() => setActiveTab('curriculum')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'curriculum'
                ? 'border-amber-400 text-slate-100'
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            Ruta &amp; Vídeos CS50
          </button>
          <button
            onClick={() => setActiveTab('memory')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'memory'
                ? 'border-amber-400 text-slate-100'
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            Memoria &amp; SRS
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'architecture'
                ? 'border-amber-400 text-slate-100'
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            Arquitectura &amp; Paso a Paso
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          {!user ? (
            <button
              onClick={() => googleSignIn()}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 rounded-lg hover:bg-amber-300 transition-colors whitespace-nowrap shrink-0"
            >
              Sign in with Google
            </button>
          ) : (
            <button
              onClick={() => setIsCalendarOpen(true)}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 rounded-lg hover:bg-amber-300 transition-colors whitespace-nowrap shrink-0"
            >
              Agendar Rutina 2h
            </button>
          )}
        </div>
      </header>

      {/* Mobile Navigation Bar */}
      <div className="flex md:hidden items-center gap-2 overflow-x-auto px-4 py-2 border-b border-slate-800 bg-slate-950 text-xs">
        <button
          onClick={() => setActiveTab('tutor')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap shrink-0 ${
            activeTab === 'tutor' ? 'bg-slate-800 text-amber-400 font-semibold' : 'text-slate-400'
          }`}
        >
          Tutor Socrático
        </button>
        <button
          onClick={() => setActiveTab('sandbox')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap shrink-0 ${
            activeTab === 'sandbox' ? 'bg-slate-800 text-amber-400 font-semibold' : 'text-slate-400'
          }`}
        >
          Laboratorio
        </button>
        <button
          onClick={() => setActiveTab('curriculum')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap shrink-0 ${
            activeTab === 'curriculum' ? 'bg-slate-800 text-amber-400 font-semibold' : 'text-slate-400'
          }`}
        >
          Ruta &amp; Vídeos
        </button>
        <button
          onClick={() => setActiveTab('memory')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap shrink-0 ${
            activeTab === 'memory' ? 'bg-slate-800 text-amber-400 font-semibold' : 'text-slate-400'
          }`}
        >
          Memoria SRS
        </button>
        <button
          onClick={() => setActiveTab('architecture')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap shrink-0 ${
            activeTab === 'architecture' ? 'bg-slate-800 text-amber-400 font-semibold' : 'text-slate-400'
          }`}
        >
          Paso a Paso
        </button>
      </div>

      {/* Sub-header Context Strip: 2-Hour Routine Timer & 4-Stage Learning Cycle (Unboxed clean metadata) */}
      <div className="border-b border-slate-800/70 bg-slate-900/40 px-6 py-3">
        <div className="mx-auto max-w-[1400px] flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-200">{currentModule.weekLabel}</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-300">{currentModule.title}</span>
            <span aria-hidden="true">·</span>
            <a
              href={currentModule.videoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-amber-400 hover:underline whitespace-nowrap"
            >
              Vídeo Oficial CS50 <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {/* 4-Stage Learning Cycle Selector / Indicator */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {[
              { lvl: 1, name: '1. Comprensión' },
              { lvl: 2, name: '2. Construcción' },
              { lvl: 3, name: '3. Aplicación' },
              { lvl: 4, name: '4. Dominio' },
            ].map((stage) => (
              <button
                key={stage.lvl}
                onClick={() => setCurrentLevel(stage.lvl)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  currentLevel === stage.lvl
                    ? 'bg-amber-400 text-slate-950 font-semibold'
                    : currentLevel > stage.lvl
                    ? 'text-emerald-400 hover:text-emerald-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {stage.name}
              </button>
            ))}
          </div>

          {/* 2-Hour Daily Session Routine Control */}
          <div className="flex items-center gap-3">
            <select
              value={activeRoutineIdx}
              onChange={(e) => {
                const idx = Number(e.target.value);
                setActiveRoutineIdx(idx);
                setSecondsLeft(ROUTINE_BLOCKS[idx].minutes * 60);
                setTimerRunning(false);
              }}
              className="bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1 text-xs text-slate-200"
              aria-label="Seleccionar bloque de rutina de 2 horas"
            >
              {ROUTINE_BLOCKS.map((b, i) => (
                <option key={b.id} value={i}>
                  {b.label} ({b.minutes}m)
                </option>
              ))}
            </select>
            <span className="font-mono text-sm font-semibold text-amber-300 tabular-nums">
              {formatTimer(secondsLeft)}
            </span>
            <button
              onClick={() => setTimerRunning(!timerRunning)}
              className="px-2.5 py-1 rounded bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-medium whitespace-nowrap"
            >
              {timerRunning ? 'Pausar' : 'Iniciar'}
            </button>
            {user && (
              <button
                onClick={() => logout()}
                className="p-1 text-slate-400 hover:text-slate-200"
                title={`Cerrar sesión (${user.displayName || user.email})`}
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Container (1440px desktop baseline) */}
      <main className="flex-1 mx-auto w-full max-w-[1400px] px-6 py-6">
        {/* TAB 1: TUTOR SOCRÁTICO & MÉTODO FEYNMAN */}
        {activeTab === 'tutor' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left 8 Columns: Multi-turn Socratic Dialogue Thread */}
            <div className="lg:col-span-8 flex flex-col rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden h-[calc(100vh-195px)] min-h-[600px]">
              {/* Workspace Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-950/60 px-5 py-3">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Brain className="h-4 w-4 text-amber-400" />
                  <span className="font-medium text-slate-200">Motor Pedagógico:</span>
                  <select
                    value={tutorMode}
                    onChange={(e) => setTutorMode(e.target.value as any)}
                    className="rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-100"
                  >
                    <option value="socratic-structured">
                      Structured Socratic (gemini-3.8-flash · JSON Schema)
                    </option>
                    <option value="deep-thinking">
                      High Thinking (gemini-4-argon · ThinkingLevel.HIGH)
                    </option>
                    <option value="grounding-tools">
                      Search Grounding + Function Calling (Hybrid Tools)
                    </option>
                    <option value="fast-lite">
                      Low-Latency Flash-Lite (gemini-3.1-flash-lite)
                    </option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsLiveVoiceOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-300 hover:bg-amber-500/20 transition-colors whitespace-nowrap shrink-0"
                  >
                    <Radio className="h-3.5 w-3.5" />
                    Tutor por Voz en Vivo
                  </button>
                  <button
                    onClick={handleRequestSocraticHint}
                    disabled={isSending}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0"
                    title="Protocolo de 5 pasos sin resolver el ejercicio por ti"
                  >
                    <HelpCircle className="h-3.5 w-3.5 text-amber-400" />
                    Estoy bloqueado · Pista ({hintStep}/5)
                  </button>
                </div>
              </div>

              {/* Scrollable Message Thread */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${
                      m.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-3xl rounded-xl p-4 text-sm leading-relaxed ${
                        m.role === 'user'
                          ? 'bg-amber-500/15 border border-amber-500/30 text-slate-100'
                          : 'bg-slate-950/80 border border-slate-800 text-slate-200'
                      }`}
                    >
                      {/* Clean unboxed message header */}
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 border-b border-slate-800/60 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-200">
                            {m.role === 'user' ? 'Tú (Alumno)' : 'CS50 Maestro Tutor'}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">{m.timestamp}</span>
                          {m.modelUsed && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>{m.modelUsed}</span>
                            </>
                          )}
                          {m.detectedLevel && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-amber-300">Nivel {m.detectedLevel}/4</span>
                            </>
                          )}
                        </div>

                        {m.role === 'assistant' && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handlePlayTts(m.id, m.content, 'single')}
                              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-amber-300 transition-colors"
                              title="Escuchar explicación con gemini-3.8-flash-tts"
                            >
                              <Volume2 className="h-3.5 w-3.5" />
                              {isPlayingTts === m.id ? 'Reproduciendo...' : 'Voz'}
                            </button>
                            <span aria-hidden="true">·</span>
                            <button
                              onClick={() => handlePlayTts(`${m.id}-pod`, m.content, 'dual-podcast')}
                              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-sky-300 transition-colors"
                              title="Escuchar diálogo estilo Profesor Malan + Tutor"
                            >
                              Diálogo CS50
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Formatted Markdown-style Content */}
                      <div className="whitespace-pre-wrap space-y-2">{m.content}</div>

                      {/* Highlighted Single Socratic Question */}
                      {m.role === 'assistant' && m.singleQuestion && (
                        <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-950/20 p-3">
                          <p className="text-xs font-semibold text-amber-300 mb-1">
                            Pregunta única para avanzar (Responde antes de continuar):
                          </p>
                          <p className="text-sm text-slate-100 font-medium">{m.singleQuestion}</p>
                        </div>
                      )}

                      {/* Structured Output Schema Evaluation Metadata */}
                      {m.role === 'assistant' && m.recommendedIntervalDays !== undefined && (
                        <div className="mt-3 pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs text-slate-400 font-mono tabular-nums">
                          <span className="text-slate-300">Structured Output:</span>
                          <span>
                            Nivel superado: {m.passedCurrentLevel ? 'Sí' : 'En proceso'}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>Pista dada: {m.hintGiven ? 'Sí' : 'No'}</span>
                          <span aria-hidden="true">·</span>
                          <span>
                            Error detectado:{' '}
                            {m.errorDetected ? m.errorCategory || 'Sí' : 'Ninguno'}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>Intervalo SRS: {m.recommendedIntervalDays}d</span>
                        </div>
                      )}

                      {/* Function Calls Executed Indicator */}
                      {m.functionCallsExecuted && m.functionCallsExecuted.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-slate-800 text-xs text-emerald-300 font-mono">
                          Acciones ejecutadas por Function Calling:{' '}
                          {m.functionCallsExecuted.join(' · ')}
                        </div>
                      )}

                      {/* Google Search Grounding Sources */}
                      {m.groundingUrls && m.groundingUrls.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-slate-800 text-xs text-slate-400">
                          <span className="font-medium text-slate-300">
                            Fuentes verificadas (Google Search Grounding):{' '}
                          </span>
                          {m.groundingUrls.map((g, i) => (
                            <React.Fragment key={i}>
                              {i > 0 && <span aria-hidden="true"> · </span>}
                              <a
                                href={g.uri}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sky-400 hover:underline"
                              >
                                {g.title}
                              </a>
                            </React.Fragment>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isSending && (
                  <div
                    role="status"
                    aria-live="polite"
                    className="flex flex-col gap-2 rounded-xl border border-amber-500/30 bg-slate-950/90 p-3.5 text-xs text-slate-200 max-w-xl"
                  >
                    <div className="flex items-center gap-2.5">
                      <RotateCcw className="h-4 w-4 text-amber-400 animate-spin shrink-0" />
                      <span className="font-medium text-slate-100">
                        {tutorRetryState
                          ? `Reintentando conexión automáticamente (${tutorRetryState.attempt}/${tutorRetryState.maxRetries})...`
                          : 'El tutor socrático está evaluando tu razonamiento (sin resolver el problema por ti)...'}
                      </span>
                    </div>
                    {tutorRetryState && (
                      <div className="pl-6 text-amber-300/90 font-mono text-[11px]">
                        Alta demanda temporal detectada
                        {tutorRetryState.status ? ` (HTTP ${tutorRetryState.status})` : ''} ·
                        Espera progresiva: {(tutorRetryState.delayMs / 1000).toFixed(1)}s · Tu
                        mensaje y progreso están guardados.
                      </div>
                    )}
                  </div>
                )}

                {tutorRequestError && !isSending && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-500/40 bg-red-950/25 p-4 text-xs text-slate-200 max-w-2xl space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="font-semibold text-red-300">
                          No se pudo completar la solicitud al Tutor API tras {MAX_TUTOR_RETRIES}{' '}
                          reintentos automáticos
                          {tutorRequestError.status ? ` (Código ${tutorRequestError.status})` : ''}
                        </p>
                        <p className="text-slate-300 leading-relaxed">
                          {tutorRequestError.message}
                        </p>
                        <p className="text-slate-400 text-[11px]">
                          Tu mensaje y tu progreso de aprendizaje siguen guardados y no se han
                          perdido.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleManualRetryTutorRequest}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-amber-400 px-3.5 py-1.5 text-xs font-semibold text-slate-950 hover:bg-amber-300 transition-colors"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Reintentar manualmente
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUserInput(tutorRequestError.originalText);
                          setMessages((prev) =>
                            prev.length > 1 &&
                            prev[prev.length - 1].role === 'user' &&
                            prev[prev.length - 1].content === tutorRequestError.originalText
                              ? prev.slice(0, -1)
                              : prev
                          );
                          setTutorRequestError(null);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
                      >
                        Restaurar mensaje en el editor
                      </button>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Area with Microphone Transcription (gemini-3.5-transcribe) */}
              <div className="border-t border-slate-800 bg-slate-950 p-4">
                <div className="flex flex-col gap-2">
                  <textarea
                    rows={3}
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Escribe tu razonamiento, tu predicción o tu explicación Feynman aquí (Enter para enviar, Shift+Enter para salto de línea)..."
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 p-3 text-sm text-slate-100 placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleToggleMicRecording}
                        disabled={isTranscribing}
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                          isRecordingMic
                            ? 'border-red-500 bg-red-950/50 text-red-300'
                            : 'border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        {isRecordingMic ? (
                          <>
                            <Square className="h-3.5 w-3.5" />
                            Detener y Transcribir
                          </>
                        ) : (
                          <>
                            <Mic className="h-3.5 w-3.5 text-amber-400" />
                            {isTranscribing
                              ? 'Transcribiendo con gemini-3.5-transcribe...'
                              : 'Dictar respuesta por voz'}
                          </>
                        )}
                      </button>
                      <span className="text-xs text-slate-500 hidden sm:inline">
                        Prohibido pedir soluciones hechas · Aprende a pensar como programador
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSendMessage()}
                      disabled={isSending || !userInput.trim()}
                      className="rounded-lg bg-amber-400 px-5 py-2 text-xs font-semibold text-slate-950 hover:bg-amber-300 disabled:opacity-40 transition-colors whitespace-nowrap shrink-0"
                    >
                      Enviar Razonamiento
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 4 Columns: Active Video Sync Card, Feynman Guide & Quick Code Scratchpad */}
            <div className="lg:col-span-4 flex flex-col gap-5">
              {/* Synchronized Video Resource Panel */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-slate-100">
                    Recurso de Vídeo Sincronizado
                  </h2>
                  <select
                    value={currentModule.id}
                    onChange={(e) => {
                      const mod = CS50_MODULES.find((m) => m.id === e.target.value);
                      if (mod) handleSelectModule(mod, true);
                    }}
                    className="rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-200"
                  >
                    {CS50_MODULES.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.weekLabel}: {m.title.slice(0, 28)}...
                      </option>
                    ))}
                  </select>
                </div>

                <div className="aspect-video w-full overflow-hidden rounded-lg border border-slate-800 bg-slate-950 mb-3">
                  <iframe
                    title={currentModule.title}
                    src={`https://www.youtube.com/embed/${currentModule.youtubeId}`}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>

                <div className="space-y-2 text-xs text-slate-300">
                  <p>
                    <strong className="text-slate-100">Qué estudiar (Verificado):</strong>{' '}
                    {currentModule.verifiedTopics}
                  </p>
                  <p>
                    <strong className="text-slate-100">Aplicación real:</strong>{' '}
                    {currentModule.realWorldUseCase}
                  </p>
                </div>
              </div>

              {/* Active Exercise & 4-Stage Mastery Rules Card */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-100 mb-2">
                    Reto Activo: {currentModule.starterChallengeTitle}
                  </h2>
                  <p className="text-xs text-slate-400 mb-3">
                    Escribe o prueba tu lógica en el Laboratorio de Código. El tutor socrático lee automáticamente tu código actual para darte pistas sin resolverlo por ti.
                  </p>
                  <pre className="rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs text-slate-300 overflow-x-auto max-h-44">
                    <code>{sandboxCode}</code>
                  </pre>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setActiveTab('sandbox')}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-800 px-3 py-2 text-xs font-medium text-slate-100 hover:bg-slate-700 transition-colors"
                  >
                    <Code2 className="h-4 w-4 text-amber-400" />
                    Abrir en Laboratorio de Código
                  </button>
                  <button
                    onClick={() => setActiveTab('memory')}
                    className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
                  >
                    Ver Progreso
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LABORATORIO DE CÓDIGO & SIMULADOR ALGORÍTMICO (2-Zone Sandbox Layout) */}
        {activeTab === 'sandbox' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Left 7 Columns: Code Editor & Terminal Output */}
              <div className="lg:col-span-7 flex flex-col rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-950 px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Terminal className="h-4 w-4 text-amber-400" />
                    <span className="text-sm font-semibold text-slate-100">
                      Sandboxed Code Runner
                    </span>
                    <select
                      value={sandboxLang}
                      onChange={(e) => setSandboxLang(e.target.value as any)}
                      className="rounded border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-100"
                    >
                      <option value="python">Python 3 (python3 -I)</option>
                      <option value="c">C (GCC -Wall -Wextra)</option>
                      <option value="sql">SQL (SQLite en memoria)</option>
                      <option value="javascript">JavaScript (Node.js)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSandboxCode(currentModule.starterCode)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Reiniciar Plantilla
                    </button>
                    <button
                      onClick={handleRunCode}
                      disabled={isRunningCode}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-amber-400 px-4 py-1.5 text-xs font-semibold text-slate-950 hover:bg-amber-300 disabled:opacity-50 transition-colors"
                    >
                      <Play className="h-3.5 w-3.5" />
                      {isRunningCode ? 'Ejecutando...' : 'Ejecutar Código'}
                    </button>
                  </div>
                </div>

                <textarea
                  value={sandboxCode}
                  onChange={(e) => setSandboxCode(e.target.value)}
                  rows={14}
                  spellCheck={false}
                  className="w-full flex-1 bg-slate-950 p-5 font-mono text-xs leading-relaxed text-slate-100 focus:outline-none resize-y"
                />

                {/* Terminal Output Panel */}
                <div className="border-t border-slate-800 bg-slate-950/90 p-4">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span>Salida de Terminal (Aislada · Límite 5000ms)</span>
                    {codeOutput.executionTimeMs !== null && (
                      <span className="font-mono tabular-nums">
                        Exit: {codeOutput.exitCode} · Tiempo: {codeOutput.executionTimeMs}ms
                      </span>
                    )}
                  </div>
                  <pre className="rounded-lg border border-slate-800 bg-slate-900 p-3 font-mono text-xs text-slate-200 min-h-[90px] max-h-48 overflow-y-auto whitespace-pre-wrap">
                    {codeOutput.stderr ? (
                      <span className="text-red-400">{codeOutput.stderr}</span>
                    ) : codeOutput.stdout ? (
                      <span className="text-emerald-300">{codeOutput.stdout}</span>
                    ) : (
                      <span className="text-slate-500">
                        Haz clic en &quot;Ejecutar Código&quot; para ver stdout / stderr reales.
                      </span>
                    )}
                  </pre>
                </div>
              </div>

              {/* Right 5 Columns: Socratic Debugger & Interactive Algorithm Simulation */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                {/* Socratic Debugging Protocol Card */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
                  <h3 className="text-sm font-semibold text-slate-100 mb-1">
                    Depuración Socrática (Formulación de Hipótesis)
                  </h3>
                  <p className="text-xs text-slate-400 mb-3">
                    Un programador profesional no pega el error sin leerlo. Escribe tu hipótesis sobre por qué ocurre el resultado o fallo, y el motor de baja latencia (gemini-3.1-flash-lite) te guiará a encontrar el origen sin reescribir tu código.
                  </p>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={studentHypothesis}
                      onChange={(e) => setStudentHypothesis(e.target.value)}
                      placeholder="Mi hipótesis: creo que el bucle se pasa en 1 posición porque..."
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 placeholder-slate-500"
                    />
                    <button
                      onClick={handleAnalyzeCodeSocratically}
                      disabled={isAnalyzingError}
                      className="w-full rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition-colors"
                    >
                      {isAnalyzingError
                        ? 'Analizando con gemini-3.1-flash-lite...'
                        : 'Diagnosticar Error con Guía Socrática'}
                    </button>
                  </div>

                  {debuggerFeedback && (
                    <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950 p-3.5 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {debuggerFeedback}
                    </div>
                  )}
                </div>

                {/* Interactive Algorithm Visualizer (Binary Search vs Linear Search — Class 0 & 3) */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-100">
                      Simulador Interactivo: Búsqueda Lineal $O(n)$ vs. Binaria $O(\log_2 n)$
                    </h3>
                    <span className="text-xs font-mono text-amber-400 tabular-nums">
                      Paso {currentTraceStep?.step || 1} / {binaryTrace.length}
                    </span>
                  </div>

                  {/* Labeled Sliders with Explicit Units (per 6_education_simulations.md) */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs text-slate-300 mb-1 font-mono tabular-nums">
                        Total de páginas (n): {simPages} págs
                      </label>
                      <input
                        type="range"
                        min={100}
                        max={4000}
                        step={100}
                        value={simPages}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setSimPages(v);
                          if (simTargetPage > v) setSimTargetPage(v);
                          setSimStepIndex(0);
                        }}
                        className="w-full accent-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 mb-1 font-mono tabular-nums">
                        Página buscada (target): pág {simTargetPage}
                      </label>
                      <input
                        type="range"
                        min={1}
                        max={simPages}
                        step={1}
                        value={simTargetPage}
                        onChange={(e) => {
                          setSimTargetPage(Number(e.target.value));
                          setSimStepIndex(0);
                        }}
                        className="w-full accent-sky-400"
                      />
                    </div>
                  </div>

                  {/* Interactive SVG Visual Stage */}
                  <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 mb-3">
                    <svg viewBox="0 0 400 95" className="w-full h-24">
                      {/* Full phonebook bar */}
                      <rect x="15" y="25" width="370" height="22" rx="4" fill="#1e293b" />
                      {/* Active search window [low..high] */}
                      {currentTraceStep && (
                        <rect
                          x={15 + ((currentTraceStep.low - 1) / simPages) * 370}
                          y="25"
                          width={Math.max(
                            6,
                            ((currentTraceStep.high - currentTraceStep.low + 1) / simPages) * 370
                          )}
                          height="22"
                          rx="3"
                          fill="#0284c7"
                        />
                      )}
                      {/* Target marker */}
                      <line
                        x1={15 + (simTargetPage / simPages) * 370}
                        y1="16"
                        x2={15 + (simTargetPage / simPages) * 370}
                        y2="56"
                        stroke="#10b981"
                        strokeWidth="2.5"
                      />
                      {/* Midpoint probe marker */}
                      {currentTraceStep && (
                        <circle
                          cx={15 + (currentTraceStep.mid / simPages) * 370}
                          cy="36"
                          r="6"
                          fill="#f59e0b"
                        />
                      )}
                      <text x="15" y="75" fill="#94a3b8" fontSize="10" fontFamily="JetBrains Mono">
                        low: {currentTraceStep?.low} · mid: {currentTraceStep?.mid} · high:{' '}
                        {currentTraceStep?.high}
                      </text>
                      <text x="245" y="75" fill="#fbbf24" fontSize="10" fontFamily="JetBrains Mono">
                        Max log2(n): {Math.ceil(Math.log2(simPages))} pasos
                      </text>
                    </svg>
                  </div>

                  <p className="text-xs text-slate-300 mb-3">{currentTraceStep?.action}</p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSimStepIndex((i) => Math.max(0, i - 1))}
                      disabled={simStepIndex === 0}
                      className="rounded border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 disabled:opacity-40"
                    >
                      Paso Anterior
                    </button>
                    <button
                      onClick={() =>
                        setSimStepIndex((i) => Math.min(binaryTrace.length - 1, i + 1))
                      }
                      disabled={simStepIndex >= binaryTrace.length - 1}
                      className="rounded bg-amber-400 px-3 py-1.5 text-xs font-semibold text-slate-950 disabled:opacity-40"
                    >
                      Siguiente División (/2)
                    </button>
                    <button
                      onClick={() => setSimStepIndex(0)}
                      className="ml-auto text-xs text-slate-400 hover:text-slate-200"
                    >
                      Reiniciar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: RUTA CS50x, VÍDEOS SINCRONIZADOS, ANALIZADOR DE VÍDEO IA & PROYECTOS GUIADOS */}
        {activeTab === 'curriculum' && (
          <div className="space-y-8">
            {/* Video Content Analyzer (gemini-4-argon + ThinkingLevel.HIGH) */}
            <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-5">
                <div>
                  <h2 className="text-lg font-semibold text-slate-100">
                    Analizador Profundo de Clases y Vídeo con Gemini 4 Argon
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Extrae conceptos verificados, analogías Feynman y listas de observación activa para cualquier vídeo de CS50 o clip subido (modelo: gemini-4-argon · ThinkingLevel.HIGH).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 space-y-4">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">
                      Clase de CS50 seleccionada
                    </label>
                    <select
                      value={currentModule.id}
                      onChange={(e) => {
                        const mod = CS50_MODULES.find((m) => m.id === e.target.value);
                        if (mod) handleSelectModule(mod, false);
                      }}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100"
                    >
                      {CS50_MODULES.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.weekLabel} — {m.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 mb-1">
                      ¿Qué duda o concepto del vídeo quieres desglosar?
                    </label>
                    <input
                      type="text"
                      value={videoQuestion}
                      onChange={(e) => setVideoQuestion(e.target.value)}
                      placeholder="Ej. ¿Cómo explica Malan los punteros y por qué ocurre un segmentation fault?"
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <label className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 cursor-pointer">
                      <Upload className="h-3.5 w-3.5 text-amber-400" />
                      <span>
                        {uploadedVideoData
                          ? `Clip cargado: ${uploadedVideoData.name}`
                          : 'Subir clip de vídeo opcional (MP4/WebM)'}
                      </span>
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime"
                        onChange={handleVideoFileUpload}
                        className="hidden"
                      />
                    </label>

                    <button
                      onClick={handleAnalyzeVideo}
                      disabled={isAnalyzingVideo}
                      className="inline-flex items-center gap-2 rounded-lg bg-amber-400 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-amber-300 disabled:opacity-50 transition-colors"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      {isAnalyzingVideo
                        ? 'Analizando con gemini-4-argon...'
                        : 'Analizar Contenido del Vídeo'}
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-7 rounded-lg border border-slate-800 bg-slate-950 p-4">
                  {!videoAnalysis ? (
                    <div className="h-full flex flex-col justify-center text-xs text-slate-400 space-y-2">
                      <p className="text-slate-200 font-medium">
                        Enlace oficial activo: {currentModule.videoUrl}
                      </p>
                      <p>
                        Temas verificados en este vídeo: {currentModule.verifiedTopics}
                      </p>
                      <p className="text-slate-500">
                        Pulsa &quot;Analizar Contenido del Vídeo&quot; para generar una guía de estudio Feynman con Gemini 4 Argon.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 text-xs">
                      <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
                        <span className="font-semibold text-amber-300">
                          Guía de Estudio Verificada
                        </span>
                        <span>{videoAnalysis.modelUsed}</span>
                      </div>
                      <p className="text-slate-300 italic">{videoAnalysis.verificationNotice}</p>
                      <div>
                        <strong className="text-slate-100 block mb-1">
                          Conceptos clave que debes observar:
                        </strong>
                        <ul className="list-disc list-inside space-y-1 text-slate-300">
                          {videoAnalysis.coreConcepts.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <strong className="text-slate-100 block mb-1">Analogía Feynman:</strong>
                        <p className="text-slate-300">{videoAnalysis.feynmanAnalogy}</p>
                      </div>
                      <div className="rounded border border-amber-500/30 bg-amber-950/20 p-2.5">
                        <strong className="text-amber-300 block mb-0.5">
                          Pregunta de comprobación tras ver el vídeo:
                        </strong>
                        <p className="text-slate-100">{videoAnalysis.socraticCheckQuestion}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* The 12 Progressive CS50 + AI Modules Grid */}
            <section className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-100">
                  Ruta Progresiva: De Pensamiento Computacional y C a Ingeniería de IA
                </h2>
                <p className="text-xs text-slate-400">
                  Columna vertebral basada en CS50x de Harvard con los 12 vídeos oficiales proporcionados y ampliación práctica hacia APIs, bases de datos y modelos de lenguaje.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {CS50_MODULES.map((mod) => {
                  const prog = topicProgressMap[mod.id];
                  const statusLabel =
                    prog?.status === 'mastered'
                      ? 'Dominado (Nivel 4)'
                      : prog?.status === 'in_progress'
                      ? `En progreso · Nivel ${prog.socraticLevel}/4`
                      : 'Pendiente';

                  return (
                    <div
                      key={mod.id}
                      className={`rounded-xl border p-5 flex flex-col justify-between transition-colors ${
                        currentModule.id === mod.id
                          ? 'border-amber-400/70 bg-slate-900/90'
                          : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        {/* Quiet 1-line unboxed kicker */}
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                          <span>
                            {mod.weekLabel} · {mod.language.toUpperCase()}
                          </span>
                          <span
                            className={
                              prog?.status === 'mastered'
                                ? 'text-emerald-400 font-medium'
                                : prog?.status === 'in_progress'
                                ? 'text-amber-300 font-medium'
                                : 'text-slate-500'
                            }
                          >
                            {statusLabel}
                          </span>
                        </div>

                        <h3 className="text-base font-semibold text-slate-100 mb-1">
                          {mod.title}
                        </h3>
                        <p className="text-xs text-slate-400 mb-3">{mod.subtitle}</p>
                        <p className="text-xs text-slate-300 mb-4 line-clamp-3">
                          {mod.verifiedTopics}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                        <a
                          href={mod.videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-slate-300 hover:text-amber-300"
                        >
                          Ver Vídeo YouTube <ExternalLink className="h-3 w-3" />
                        </a>
                        <button
                          onClick={() => handleSelectModule(mod, true)}
                          className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-100 hover:bg-amber-400 hover:text-slate-950 transition-colors"
                        >
                          Estudiar Clase <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Guided AI Projects (Section 11 & Function 6) */}
            <section className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-100">
                  Proyectos Guiados de IA y Automatización (Fase Posterior)
                </h2>
                <p className="text-xs text-slate-400">
                  Cada proyecto reutiliza fundamentos anteriores e introduce decisiones reales de arquitectura. Tú tomas las decisiones técnicas y escribes el código; el tutor socrático revisa tu diseño.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {GUIDED_AI_PROJECTS.map((proj) => (
                  <div
                    key={proj.id}
                    className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 flex flex-col justify-between"
                  >
                    <div>
                      <p className="text-xs text-amber-400 mb-1">{proj.phase}</p>
                      <h3 className="text-base font-semibold text-slate-100 mb-2">
                        {proj.title}
                      </h3>
                      <p className="text-xs text-slate-300 mb-4">{proj.architectureSummary}</p>

                      <div className="mb-3">
                        <p className="text-xs font-semibold text-slate-200 mb-1">
                          Decisiones técnicas que deberás justificar:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-xs text-slate-400">
                          {proj.technicalDecisions.map((d, i) => (
                            <li key={i}>{d}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setActiveTab('tutor');
                        handleSendMessage(
                          `Quiero iniciar la revisión de arquitectura para el proyecto guiado: "${proj.title}". Hazme la primera pregunta sobre las decisiones técnicas antes de escribir código.`
                        );
                      }}
                      className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-100 hover:bg-amber-400 hover:text-slate-950 transition-colors"
                    >
                      Diseñar Arquitectura con el Tutor
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* TAB 4: MEMORIA DEL APRENDIZAJE, REPETICIÓN ESPACIADA (SRS) & EXPORTACIÓN MARKDOWN / GITHUB */}
        {activeTab === 'memory' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left 7 Columns: Spaced Repetition Table & Recurrent Errors */}
              <div className="lg:col-span-7 space-y-6">
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <div>
                      <h2 className="text-base font-semibold text-slate-100">
                        Matriz de Dominio y Repetición Espaciada (1d · 3d · 7d · 14d)
                      </h2>
                      <p className="text-xs text-slate-400">
                        Distinción estricta entre haber visto una explicación (Nivel 1) y demostrar aplicación independiente (Nivel 4).
                      </p>
                    </div>
                    <button
                      onClick={() => setIsCalendarOpen(true)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700"
                    >
                      <Calendar className="h-3.5 w-3.5 text-amber-400" />
                      Agendar Repaso en Calendar
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400">
                          <th className="py-2.5 pr-3 font-medium">Módulo</th>
                          <th className="py-2.5 px-3 font-medium">Estado</th>
                          <th className="py-2.5 px-3 font-medium">Nivel Ciclo</th>
                          <th className="py-2.5 px-3 font-medium">Intentos / Pistas</th>
                          <th className="py-2.5 px-3 font-medium">Próximo Repaso SRS</th>
                          <th className="py-2.5 pl-3 font-medium">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 tabular-nums">
                        {CS50_MODULES.map((m) => {
                          const p = topicProgressMap[m.id];
                          return (
                            <tr key={m.id} className="hover:bg-slate-800/30">
                              <td className="py-2.5 pr-3 font-medium text-slate-200">
                                {m.weekLabel}: {m.title.slice(0, 28)}
                              </td>
                              <td className="py-2.5 px-3">
                                {p?.status === 'mastered' ? (
                                  <span className="text-emerald-400 font-semibold">Dominado</span>
                                ) : p?.status === 'in_progress' ? (
                                  <span className="text-amber-300">En proceso</span>
                                ) : (
                                  <span className="text-slate-500">Pendiente</span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-slate-300">
                                {p ? `Nivel ${p.socraticLevel}/4` : 'Nivel 1/4'}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-slate-400">
                                {p ? `${p.attempts} int · ${p.hintsUsed} pistas` : '0 int · 0 pistas'}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-slate-300">
                                {p ? `${p.nextReviewDate} (${p.intervalDays}d)` : 'Hoy (Inicio)'}
                              </td>
                              <td className="py-2.5 pl-3">
                                <button
                                  onClick={async () => {
                                    handleSelectModule(m, true);
                                    if (user) {
                                      const sess = await loadTutorSessionDoc(user.uid, m.id);
                                      if (sess?.messagesJson) {
                                        try {
                                          const parsed = JSON.parse(sess.messagesJson);
                                          if (Array.isArray(parsed) && parsed.length > 0) {
                                            setMessages(parsed);
                                          }
                                        } catch {}
                                      }
                                    }
                                  }}
                                  className="text-xs text-amber-400 hover:underline whitespace-nowrap"
                                >
                                  {p ? 'Reanudar' : 'Iniciar'}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recurrent Errors Registry */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
                  <h3 className="text-base font-semibold text-slate-100 mb-1">
                    Registro de Errores Recurrentes y Causa Raíz
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">
                    Cuando el tutor detecta un fallo conceptual o de código, lo registra aquí para programar ejercicios adaptativos sobre ese mismo concepto.
                  </p>

                  {errorRecords.length === 0 ? (
                    <p className="text-xs text-slate-400 rounded-lg border border-slate-800 bg-slate-950/50 p-4">
                      No hay errores recurrentes registrados todavía. A medida que resuelvas retos en el Tutor o Laboratorio, tus patrones de error aparecerán aquí.
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {errorRecords.map((err) => (
                        <div
                          key={err.id}
                          className="flex items-start justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2 text-slate-300 font-medium">
                              <span className="font-mono text-amber-300">{err.errorCategory}</span>
                              <span aria-hidden="true">·</span>
                              <span>Módulo: {err.moduleId}</span>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono tabular-nums">
                                Ocurrencias: {err.occurrences}
                              </span>
                            </div>
                            <p className="text-slate-400 mt-1">{err.causeDescription}</p>
                          </div>
                          <button
                            onClick={() => deleteErrorRecordDoc(err.id)}
                            className="p-1 text-slate-500 hover:text-red-400"
                            title="Marcar error como superado"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right 5 Columns: Markdown Progress Block Generator, Importer & GitHub Gist Exporter */}
              <div className="lg:col-span-5 space-y-6">
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-slate-100">
                      Bloque de Progreso en Markdown (Para Copiar o Guardar)
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(generateMarkdownProgressBlock());
                          setCopiedMarkdown(true);
                          setTimeout(() => setCopiedMarkdown(false), 2000);
                        }}
                        className="inline-flex items-center gap-1 rounded border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-200 hover:bg-slate-700"
                      >
                        {copiedMarkdown ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" /> Copiado
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" /> Copiar
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          const blob = new Blob([generateMarkdownProgressBlock()], {
                            type: 'text/markdown;charset=utf-8',
                          });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `CS50_PROGRESO_${new Date().toISOString().slice(0, 10)}.md`;
                          a.click();
                        }}
                        className="inline-flex items-center gap-1 rounded border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-200 hover:bg-slate-700"
                      >
                        <Download className="h-3.5 w-3.5" /> .MD
                      </button>
                    </div>
                  </div>

                  <pre className="rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono text-[11px] text-slate-300 max-h-64 overflow-y-auto whitespace-pre-wrap">
                    {generateMarkdownProgressBlock()}
                  </pre>

                  {/* GitHub Gist Export Integration */}
                  <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                        <Github className="h-4 w-4" /> Exportar Progreso y Código a GitHub Gist
                      </span>
                      {githubStatus.connected && (
                        <span className="text-xs text-emerald-400">
                          Conectado como @{githubStatus.username}
                        </span>
                      )}
                    </div>

                    {!githubStatus.connected && (
                      <div className="space-y-2">
                        <input
                          type="password"
                          value={githubPat}
                          onChange={(e) => setGithubPat(e.target.value)}
                          placeholder="Opcional: GitHub Personal Access Token (permiso 'gist')"
                          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-100"
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleExportToGithubGist}
                        disabled={isExportingGist}
                        className="flex-1 rounded-lg bg-amber-400 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-amber-300 disabled:opacity-50 transition-colors"
                      >
                        {isExportingGist ? 'Subiendo a GitHub...' : 'Guardar en GitHub Gist'}
                      </button>
                      <button
                        onClick={handleConnectGithubPopup}
                        className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700"
                      >
                        OAuth Popup
                      </button>
                    </div>

                    {gistResultUrl && (
                      <p className="text-xs text-emerald-400">
                        Gist creado con éxito:{' '}
                        <a
                          href={gistResultUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="underline"
                        >
                          {gistResultUrl}
                        </a>
                      </p>
                    )}
                    {gistError && <p className="text-xs text-red-400">{gistError}</p>}
                  </div>
                </div>

                {/* Restore Progress from Markdown Block */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
                  <h3 className="text-sm font-semibold text-slate-100 mb-1">
                    Restaurar Registro de Conversación Anterior
                  </h3>
                  <p className="text-xs text-slate-400 mb-3">
                    Si guardaste tu bloque de progreso en un archivo de texto o Markdown en otra sesión sin cuenta, pégalo aquí para continuar donde lo dejaste.
                  </p>
                  <textarea
                    rows={4}
                    value={importedMarkdownText}
                    onChange={(e) => setImportedMarkdownText(e.target.value)}
                    placeholder="Pega aquí tu # REGISTRO DE EVOLUCIÓN — CS50 MAESTRO TUTOR..."
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-xs text-slate-200 mb-2"
                  />
                  <button
                    onClick={handleImportMarkdownProgress}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-100 hover:bg-slate-700 transition-colors"
                  >
                    Cargar Registro y Sincronizar Estado
                  </button>
                  {importStatusMsg && (
                    <p className="mt-2 text-xs text-emerald-400">{importStatusMsg}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ARQUITECTURA & PASO A PASO DE LAS 8 TECNOLOGÍAS SOLICITADAS */}
        {activeTab === 'architecture' && (
          <div className="space-y-8">
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
              <h2 className="text-xl font-bold text-slate-100 mb-2">
                Guía Paso a Paso: Cómo están incluidas las 8 tecnologías y 6 módulos núcleo
              </h2>
              <p className="text-sm text-slate-300 max-w-3xl">
                Aquí tienes el paso a paso conciso y directo de cómo hemos integrado cada una de las 8 capacidades técnicas en esta aplicación y qué configuración externa opcional puedes añadir (como tus credenciales de GitHub OAuth).
              </p>

              {/* GitHub OAuth Required Callback URLs Card (Mandatory per oauth-integration skill) */}
              <div className="mt-5 rounded-lg border border-amber-500/30 bg-amber-950/15 p-4 text-xs space-y-2">
                <h3 className="text-sm font-semibold text-amber-300 flex items-center gap-2">
                  <Github className="h-4 w-4" /> Configuración Paso a Paso de GitHub OAuth (Punto 8)
                </h3>
                <p className="text-slate-300">
                  Para usar el botón de conexión OAuth Popup de GitHub con tu propia aplicación OAuth (además de la exportación por Token que ya está lista):
                </p>
                <ol className="list-decimal list-inside space-y-1 text-slate-200">
                  <li>
                    Abre tu panel de desarrollador de GitHub:{' '}
                    <a
                      href="https://github.com/settings/developers"
                      target="_blank"
                      rel="noreferrer"
                      className="text-amber-400 underline"
                    >
                      https://github.com/settings/developers
                    </a>{' '}
                    y crea una nueva <strong>OAuth App</strong>.
                  </li>
                  <li>
                    Añade exactamente estas <strong>Authorization callback URLs</strong>:
                    <ul className="list-disc list-inside ml-4 mt-1 font-mono text-[11px] text-amber-200 space-y-1">
                      <li>
                        Development URL: https://ais-dev-2yudcqcvnd5zqjlpepcpsk-143288575802.europe-west2.run.app/auth/github/callback
                      </li>
                      <li>
                        Shared/Deployed URL: https://ais-pre-2yudcqcvnd5zqjlpepcpsk-143288575802.europe-west2.run.app/auth/github/callback
                      </li>
                    </ul>
                  </li>
                  <li>
                    En el panel de configuración de secretos del entorno, define las variables{' '}
                    <code className="text-amber-300">GITHUB_CLIENT_ID</code> y{' '}
                    <code className="text-amber-300">GITHUB_CLIENT_SECRET</code>.
                  </li>
                </ol>
              </div>
            </div>

            {/* Grid of the 8 Requested Integrations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {EIGHT_TECH_GUIDES.map((tech) => (
                <div
                  key={tech.number}
                  className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="font-mono font-semibold text-amber-400">
                        0{tech.number}. {tech.scopeClassification}
                      </span>
                      <span className="text-emerald-400 font-medium">
                        {tech.status === 'active_in_app'
                          ? 'Activa e Integrada'
                          : 'Integrada · Claves OAuth opcionales'}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-slate-100 mb-1.5">
                      {tech.name}
                    </h3>
                    <p className="text-xs text-slate-300 mb-3">{tech.summary}</p>
                    <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300 mb-4">
                      {tech.steps.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ol>
                    <pre className="rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono text-[11px] text-slate-300 overflow-x-auto mb-4">
                      <code>{tech.codeSnippet}</code>
                    </pre>
                  </div>

                  <div className="pt-3 border-t border-slate-800 text-xs text-slate-400">
                    <strong className="text-slate-200">Dónde probarlo:</strong> {tech.whereInApp}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <LiveVoiceModal
        isOpen={isLiveVoiceOpen}
        onClose={() => setIsLiveVoiceOpen(false)}
        currentModuleTitle={`${currentModule.weekLabel}: ${currentModule.title}`}
      />

      <CalendarSchedulerModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        currentModuleTitle={`${currentModule.weekLabel}: ${currentModule.title}`}
        nextReviewTopic={currentModule.title}
        nextReviewDays={topicProgressMap[currentModule.id]?.intervalDays || 1}
      />

      {/* AI Global Assistant accessible across all screens */}
      <GlobalAssistantDrawer
        activeTab={activeTab}
        currentModule={currentModule}
        currentLevel={currentLevel}
        sandboxLang={sandboxLang}
        sandboxCode={sandboxCode}
        topicProgressMap={topicProgressMap}
        errorRecords={errorRecords}
        onNavigateScreen={handleAssistantNavigateScreen}
        onOpenLessonModule={handleAssistantOpenLessonModule}
        onStartExerciseInSandbox={handleAssistantStartExercise}
        onExecuteConfirmedMutation={handleExecuteConfirmedAssistantMutation}
      />
    </div>
  );
}
