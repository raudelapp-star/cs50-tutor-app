import React, { useState, useEffect } from 'react';
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
  Clock,
  Video,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Flame,
  Trophy,
  CheckSquare,
  Square,
  WifiOff,
} from 'lucide-react';
import {
  CS50_MODULES,
  CS50Module,
  MicroExercise,
} from './data/cs50Curriculum';

interface CodeRunResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  executionTimeMs: number | null;
}

const LANGUAGE_LABELS: Record<CS50Module['language'], string> = {
  scratch: 'Scratch (scratch.mit.edu)',
  c: 'C (GCC 12)',
  python: 'Python 3',
  sql: 'SQL (SQLite)',
  javascript: 'JavaScript (Node.js)',
};

// Safe LocalStorage Helpers
function getStoredValue<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item);
  } catch {
    return defaultValue;
  }
}

function setStoredValue<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export default function App() {
  // 1. Persistent Current Module
  const [currentModuleId, setCurrentModuleId] = useState<string>(() => {
    const saved = getStoredValue<string>('cs50_current_module_id', CS50_MODULES[1].id);
    return CS50_MODULES.some((m) => m.id === saved) ? saved : CS50_MODULES[1].id;
  });

  const currentModule =
    CS50_MODULES.find((m) => m.id === currentModuleId) || CS50_MODULES[1];
  const isClassZero = currentModule.id === 'module-0';

  // 2. Persistent Selected Chapter
  const [selectedChapterId, setSelectedChapterId] = useState<string>(() => {
    const saved = getStoredValue<string>(`cs50_chapter_${currentModule.id}`, '');
    if (saved && currentModule.chapters.some((c) => c.id === saved)) {
      return saved;
    }
    return currentModule.chapters[0]?.id || '';
  });

  const selectedChapter =
    currentModule.chapters.find((c) => c.id === selectedChapterId) ||
    currentModule.chapters[0];

  // 3. Persistent Left Panel Tab
  const [leftTab, setLeftTab] = useState<'micro-exercises' | 'official-pset' | 'video-explanation'>(() => {
    return getStoredValue<'micro-exercises' | 'official-pset' | 'video-explanation'>(
      'cs50_left_tab',
      'micro-exercises'
    );
  });

  // 4. Expanded Solution Tracking
  const [expandedSolutionId, setExpandedSolutionId] = useState<string | null>(null);

  // 5. Active Exercise Title & Toast
  const [activeExerciseTitle, setActiveExerciseTitle] = useState<string>(() => {
    return getStoredValue<string>(`cs50_title_${currentModule.id}`, `Plantilla inicial de ${currentModule.weekLabel}`);
  });
  const [loadToast, setLoadToast] = useState<string | null>(null);

  // 6. Persistent Code and Language
  const [language, setLanguage] = useState<CS50Module['language']>(() => {
    return getStoredValue<CS50Module['language']>(`cs50_lang_${currentModule.id}`, currentModule.language);
  });

  const [code, setCode] = useState<string>(() => {
    const savedCode = getStoredValue<string | null>(`cs50_code_${currentModule.id}`, null);
    return savedCode !== null ? savedCode : currentModule.starterCode;
  });

  // 7. Persistent Completed Exercises (Reward System)
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>(() => {
    return getStoredValue<Record<string, boolean>>('cs50_completed_exercises', {});
  });

  // 8. Persistent Harvard Checked Specs Checklist
  const [checkedSpecs, setCheckedSpecs] = useState<Record<string, Record<number, boolean>>>(() => {
    return getStoredValue<Record<string, Record<number, boolean>>>('cs50_checked_specs', {});
  });

  // 9. Persistent Daily Streak
  const [streakDays, setStreakDays] = useState<number>(() => {
    if (typeof window === 'undefined') return 1;
    try {
      const todayStr = new Date().toISOString().slice(0, 10);
      const lastActive = localStorage.getItem('cs50_last_active_date');
      const savedStreak = parseInt(localStorage.getItem('cs50_streak_days') || '1', 10);
      const safeStreak = isNaN(savedStreak) ? 1 : Math.max(1, savedStreak);

      if (!lastActive) {
        localStorage.setItem('cs50_last_active_date', todayStr);
        localStorage.setItem('cs50_streak_days', '1');
        return 1;
      }
      if (lastActive === todayStr) {
        return safeStreak;
      }

      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      const nextStreak = lastActive === yesterday ? safeStreak + 1 : 1;
      localStorage.setItem('cs50_last_active_date', todayStr);
      localStorage.setItem('cs50_streak_days', String(nextStreak));
      return nextStreak;
    } catch {
      return 1;
    }
  });

  // 10. Online / Offline Status
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 11. Terminal & Execution State
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [terminalResult, setTerminalResult] = useState<CodeRunResult>({
    stdout: '',
    stderr: '',
    exitCode: null,
    executionTimeMs: null,
  });

  const [copiedCmd, setCopiedCmd] = useState<'check50' | 'submit50' | null>(null);

  // 12. Video-Anchored Socratic Tutor State
  const [hintText, setHintText] = useState<string | null>(null);
  const [hintCount, setHintCount] = useState<number>(0);
  const [customQuestion, setCustomQuestion] = useState<string>('');
  const [isLoadingHint, setIsLoadingHint] = useState<boolean>(false);
  const [hintError, setHintError] = useState<string | null>(null);

  // Toast Helper
  const showToast = (message: string) => {
    setLoadToast(message);
    setTimeout(() => {
      setLoadToast((current) => (current === message ? null : current));
    }, 2800);
  };

  // Switch Module
  const handleSelectModule = (moduleId: string) => {
    const selected = CS50_MODULES.find((m) => m.id === moduleId);
    if (!selected) return;

    setCurrentModuleId(selected.id);
    setStoredValue('cs50_current_module_id', selected.id);

    const savedChapterId = getStoredValue<string>(`cs50_chapter_${selected.id}`, selected.chapters[0]?.id || '');
    const validChapter = selected.chapters.some((c) => c.id === savedChapterId)
      ? savedChapterId
      : selected.chapters[0]?.id || '';

    setSelectedChapterId(validChapter);
    setStoredValue(`cs50_chapter_${selected.id}`, validChapter);

    const savedCode = getStoredValue<string | null>(`cs50_code_${selected.id}`, null);
    const finalCode = savedCode !== null ? savedCode : selected.starterCode;

    const savedLang = getStoredValue<CS50Module['language']>(`cs50_lang_${selected.id}`, selected.language);
    setLanguage(savedLang);
    setCode(finalCode);

    const title = `Plantilla inicial de ${selected.weekLabel}`;
    setActiveExerciseTitle(title);
    setStoredValue(`cs50_title_${selected.id}`, title);

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
    setExpandedSolutionId(null);
  };

  // Switch Chapter
  const handleSelectChapter = (chapterId: string) => {
    setSelectedChapterId(chapterId);
    setStoredValue(`cs50_chapter_${currentModule.id}`, chapterId);
    setExpandedSolutionId(null);
  };

  // Switch Left Tab
  const handleSelectLeftTab = (tab: 'micro-exercises' | 'official-pset' | 'video-explanation') => {
    setLeftTab(tab);
    setStoredValue('cs50_left_tab', tab);
  };

  // Code Change with Local Persistence
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    setStoredValue(`cs50_code_${currentModule.id}`, newCode);
  };

  // Load Micro-Exercise
  const handleLoadMicroExercise = (exercise: MicroExercise) => {
    setCode(exercise.starterCode);
    setLanguage(exercise.language);
    const title = `Micro-ejercicio: ${exercise.title}`;
    setActiveExerciseTitle(title);
    setStoredValue(`cs50_code_${currentModule.id}`, exercise.starterCode);
    setStoredValue(`cs50_lang_${currentModule.id}`, exercise.language);
    setStoredValue(`cs50_title_${currentModule.id}`, title);

    setTerminalResult({
      stdout: '',
      stderr: '',
      exitCode: null,
      executionTimeMs: null,
    });
    showToast(`✓ Cargado en el editor: ${exercise.title}`);
  };

  // Load Solution Code
  const handleLoadSolution = (exercise: MicroExercise) => {
    setCode(exercise.solutionCode);
    setLanguage(exercise.language);
    const title = `Solución explicada: ${exercise.title}`;
    setActiveExerciseTitle(title);
    setStoredValue(`cs50_code_${currentModule.id}`, exercise.solutionCode);
    setStoredValue(`cs50_lang_${currentModule.id}`, exercise.language);
    setStoredValue(`cs50_title_${currentModule.id}`, title);

    setTerminalResult({
      stdout: '',
      stderr: '',
      exitCode: null,
      executionTimeMs: null,
    });
    showToast(`✓ Solución cargada en el editor: ${exercise.title}`);
  };

  // Load Official Challenge Code
  const handleLoadOfficialExercise = () => {
    setCode(currentModule.starterCode);
    setLanguage(currentModule.language);
    const title = currentModule.starterChallengeTitle;
    setActiveExerciseTitle(title);
    setStoredValue(`cs50_code_${currentModule.id}`, currentModule.starterCode);
    setStoredValue(`cs50_lang_${currentModule.id}`, currentModule.language);
    setStoredValue(`cs50_title_${currentModule.id}`, title);

    setTerminalResult({
      stdout: '',
      stderr: '',
      exitCode: null,
      executionTimeMs: null,
    });
    showToast(`✓ Reto oficial cargado en el editor`);
  };

  // Reset Code
  const handleResetCode = () => {
    setCode(currentModule.starterCode);
    setLanguage(currentModule.language);
    const title = `Plantilla inicial de ${currentModule.weekLabel}`;
    setActiveExerciseTitle(title);
    setStoredValue(`cs50_code_${currentModule.id}`, currentModule.starterCode);
    setStoredValue(`cs50_lang_${currentModule.id}`, currentModule.language);
    setStoredValue(`cs50_title_${currentModule.id}`, title);

    setTerminalResult({
      stdout: '',
      stderr: '',
      exitCode: null,
      executionTimeMs: null,
    });
    setHintText(null);
    setHintError(null);
    showToast('✓ Código reiniciado a la plantilla base');
  };

  // Toggle Micro-Exercise Completion
  const handleToggleCompleteExercise = (exerciseId: string, exerciseTitle: string) => {
    setCompletedExercises((prev) => {
      const nextState = !prev[exerciseId];
      const updated = { ...prev, [exerciseId]: nextState };
      setStoredValue('cs50_completed_exercises', updated);
      if (nextState) {
        showToast(`🎉 ¡Reto superado (+50 XP)!: ${exerciseTitle}`);
      } else {
        showToast(`Marcado como pendiente: ${exerciseTitle}`);
      }
      return updated;
    });
  };

  // Toggle Harvard Official Requirement
  const handleToggleHarvardSpec = (specIndex: number) => {
    setCheckedSpecs((prev) => {
      const moduleSpecs = { ...(prev[currentModule.id] || {}) };
      moduleSpecs[specIndex] = !moduleSpecs[specIndex];
      const updated = { ...prev, [currentModule.id]: moduleSpecs };
      setStoredValue('cs50_checked_specs', updated);
      return updated;
    });
  };

  // Run Code (Native server GCC/Python/SQL with client-side offline fallback)
  const handleRunCode = async () => {
    if (isRunning) return;
    setIsRunning(true);

    // If completely offline or network unavailable, handle client-side
    if (!isOnline) {
      if (language === 'javascript') {
        const start = Date.now();
        const logs: string[] = [];
        const originalLog = console.log;
        try {
          console.log = (...args: unknown[]) => {
            logs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
          };
          // eslint-disable-next-line no-new-func
          const runFn = new Function(code);
          runFn();
          console.log = originalLog;
          setTerminalResult({
            stdout: logs.join('\n') || '[Ejecución JavaScript finalizada sin salida en consola]',
            stderr: '',
            exitCode: 0,
            executionTimeMs: Date.now() - start,
          });
        } catch (jsErr: unknown) {
          console.log = originalLog;
          const msg = jsErr instanceof Error ? jsErr.message : String(jsErr);
          setTerminalResult({
            stdout: logs.join('\n'),
            stderr: `Error en tiempo de ejecución (offline): ${msg}`,
            exitCode: 1,
            executionTimeMs: Date.now() - start,
          });
        }
      } else {
        setTerminalResult({
          stdout: '',
          stderr: `[Modo sin conexión] Tu código se encuentra guardado de forma segura en tu navegador.\nPara compilar en ${language.toUpperCase()} con el entorno oficial de GCC/Python, conéctate a Internet o cambia el entorno a JavaScript para probar lógica en el navegador sin conexión.`,
          exitCode: 1,
          executionTimeMs: 12,
        });
      }
      setIsRunning(false);
      return;
    }

    // Online execution via /api/code/run
    try {
      const res = await fetch('/api/code/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          code,
        }),
      });

      if (!res.ok) {
        throw new Error(`Servidor devolvió código de error HTTP ${res.status}`);
      }

      const data = await res.json();
      const exitCode = typeof data.exitCode === 'number' ? data.exitCode : 0;
      setTerminalResult({
        stdout: data.stdout || '',
        stderr: data.stderr || '',
        exitCode,
        executionTimeMs:
          typeof data.executionTimeMs === 'number' ? data.executionTimeMs : null,
      });

      // If execution was successful and matches active micro-exercise, award completion
      if (exitCode === 0 && data.stdout && selectedChapter) {
        const matchingExercise = selectedChapter.microExercises.find(
          (ex) => activeExerciseTitle.includes(ex.title)
        );
        if (matchingExercise && !completedExercises[matchingExercise.id]) {
          handleToggleCompleteExercise(matchingExercise.id, matchingExercise.title);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setTerminalResult({
        stdout: '',
        stderr: `Error al conectar con el entorno de compilación: ${msg}\nTu código sigue guardado en el editor.`,
        exitCode: 1,
        executionTimeMs: null,
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Video-Anchored Socratic Tutor Assistance
  const handleRequestVideoAnchoredHelp = async (explicitQuestion?: string) => {
    if (isLoadingHint) return;
    setIsLoadingHint(true);
    setHintError(null);
    const nextHintStep = hintCount + 1;
    const currentChapterLabel = selectedChapter
      ? `Capítulo ${selectedChapter.chapterNumber}: ${selectedChapter.title} (${selectedChapter.timeRange})`
      : currentModule.weekLabel;

    const questionToSend =
      (explicitQuestion ?? customQuestion).trim() ||
      `Estoy atascado en el tramo "${currentChapterLabel}". Dame una pista pedagógica orientada a la lógica sin resolver el ejercicio.`;

    // Offline fallback for Tutor if offline or network unavailable
    if (!isOnline) {
      const offlineHint = `📍 [Tutor CS50 — Modo sin conexión activo]\nTramo: ${selectedChapter?.title || currentModule.title} (${selectedChapter?.timeRange || '00:00'})\n\n💡 Síntesis del concepto:\n${selectedChapter?.summary || currentModule.verifiedTopics}\n\n🎯 Analogía de la vida real:\n${currentModule.realWorldUseCase}\n\nPregúntate: ¿Qué parte exacta de los requisitos aún no cumple la salida de tu código?`;
      setHintText(offlineHint);
      setHintCount(nextHintStep);
      if (explicitQuestion !== undefined || customQuestion.trim()) {
        setCustomQuestion('');
      }
      setIsLoadingHint(false);
      return;
    }

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
          `📍 En este vídeo (Capítulo: ${selectedChapter?.title || currentModule.title}): Piensa en el problema paso a paso antes de continuar.`;
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

    // If server failed after retries, provide offline chapter hint so student is never stranded
    const fallbackHint = `📍 [Tutor CS50 — Sugerencia pedagógica]:\n${selectedChapter?.summary || currentModule.verifiedTopics}\n\n💡 Consejo Feynman: ${currentModule.realWorldUseCase}\n\nRevisa la salida de la terminal y contrástala con lo que David Malan demuestra en el minuto ${selectedChapter?.timeRange || '00:00'}.`;
    setHintText(fallbackHint);
    setHintCount(nextHintStep);
    setHintError(`Nota del sistema: El servicio de IA devolvió "${lastError}", pero hemos cargado las pistas pedagógicas locales para que no te detengas.`);
    setIsLoadingHint(false);
  };

  // Copy check50 or submit50 commands
  const handleCopyCommand = (type: 'check50' | 'submit50', cmdText: string) => {
    navigator.clipboard.writeText(cmdText);
    setCopiedCmd(type);
    setTimeout(() => setCopiedCmd(null), 1800);
  };

  const { officialExercise, simpleVideoExplanations } = currentModule;

  // Compute Total and Chapter Completion
  const totalCompletedCount = Object.values(completedExercises).filter(Boolean).length;
  const currentChapterCompletedCount = (selectedChapter?.microExercises || []).filter(
    (ex) => completedExercises[ex.id]
  ).length;

  const currentModuleSpecsChecked = checkedSpecs[currentModule.id] || {};
  const totalSpecsChecked = Object.values(currentModuleSpecsChecked).filter(Boolean).length;

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-950 text-slate-100">
      {/* Toast Notification when code is loaded or exercise completed */}
      {loadToast && (
        <div className="fixed top-16 right-6 z-50 flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-950/90 px-4 py-2.5 text-xs font-semibold text-emerald-200 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{loadToast}</span>
        </div>
      )}

      {/* A. Minimalist Top Bar (Header) */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 sm:px-6">
        {/* Left: Brand Title */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-400 font-mono text-xs font-bold text-slate-950 shadow-sm">
            CS50
          </div>
          <div>
            <h1 className="text-xs sm:text-sm font-semibold tracking-tight text-slate-100">
              CS50 en Español — Harvard
            </h1>
          </div>
        </div>

        {/* Center: Class Dropdown Selector (Clase 0 to Clase 11) */}
        <div className="flex items-center gap-2">
          <label
            htmlFor="class-selector"
            className="hidden text-xs font-medium text-slate-400 lg:inline"
          >
            Clase activa:
          </label>
          <select
            id="class-selector"
            value={currentModule.id}
            onChange={(e) => handleSelectModule(e.target.value)}
            className="max-w-[200px] sm:max-w-[280px] md:max-w-[360px] truncate rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-100 focus:border-amber-400 focus:outline-none"
          >
            {CS50_MODULES.map((mod) => (
              <option key={mod.id} value={mod.id}>
                {mod.weekLabel} — {mod.title}
              </option>
            ))}
          </select>
        </div>

        {/* Right: Rewards, Streaks & Active Language */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs">
          {/* Daily Streak Badge */}
          <div
            title={`Racha de estudio: ${streakDays} días consecutivos`}
            className="flex items-center gap-1 rounded-md border border-orange-500/30 bg-orange-500/10 px-2 py-1 font-mono text-xs font-bold text-orange-400"
          >
            <Flame className="h-3.5 w-3.5 fill-current text-orange-400" />
            <span>{streakDays}d</span>
          </div>

          {/* Reward Badges Counter */}
          <div
            title={`Total de retos completados: ${totalCompletedCount}`}
            className="hidden sm:flex items-center gap-1 rounded-md border border-amber-400/30 bg-amber-400/10 px-2 py-1 font-mono text-xs font-bold text-amber-300"
          >
            <Trophy className="h-3.5 w-3.5 text-amber-400" />
            <span>{totalCompletedCount}</span>
          </div>

          {/* Offline status indicator */}
          {!isOnline && (
            <div
              title="Modo sin conexión activo — Tu código y progreso se guardan localmente"
              className="flex items-center gap-1 rounded-md border border-amber-500/40 bg-amber-500/20 px-2 py-1 text-[11px] font-semibold text-amber-300"
            >
              <WifiOff className="h-3 w-3" />
              <span className="hidden md:inline">Sin conexión</span>
            </div>
          )}

          {/* Environment Label */}
          <span className="rounded-md border border-slate-700 bg-slate-950 px-2.5 py-1 font-mono text-xs font-semibold text-slate-300">
            {isClassZero ? 'Scratch' : LANGUAGE_LABELS[language] || language.toUpperCase()}
          </span>
        </div>
      </header>

      {/* Main Unified Split-Screen Workspace (50% Left / 50% Right on Desktop, Stacked on Mobile) */}
      <main className="grid flex-1 grid-cols-1 overflow-hidden lg:grid-cols-2">
        {/* B. Left Panel: APRENDER, CAPÍTULOS Y RETOS (Independent scroll) */}
        <section
          aria-label="Aprender y Capítulos"
          className="flex flex-col gap-4 overflow-y-auto border-b border-slate-800 p-4 sm:p-5 lg:border-b-0 lg:border-r"
        >
          {/* 1. Selector de Capítulos de Vídeo Sincronizado */}
          <div className="flex flex-col gap-2.5 rounded-xl border border-slate-800 bg-slate-900/80 p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <Video className="h-4 w-4 text-amber-400" />
                <span>Selector de Capítulos del Vídeo:</span>
              </div>
              {selectedChapter && (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-amber-300">
                    <Clock className="h-3 w-3" />
                    {selectedChapter.timeRange}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">
                    {currentChapterCompletedCount}/{selectedChapter.microExercises.length} retos
                  </span>
                </div>
              )}
            </div>

            <select
              aria-label="Seleccionar capítulo del vídeo"
              value={selectedChapter?.id}
              onChange={(e) => handleSelectChapter(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-medium text-slate-100 focus:border-amber-400 focus:outline-none"
            >
              {currentModule.chapters.map((ch) => {
                const completedInCh = ch.microExercises.filter((e) => completedExercises[e.id]).length;
                const isAllDone = ch.microExercises.length > 0 && completedInCh === ch.microExercises.length;
                return (
                  <option key={ch.id} value={ch.id}>
                    {isAllDone ? '✓ ' : ''}Capítulo {ch.chapterNumber}: {ch.title} ({ch.timeRange})
                  </option>
                );
              })}
            </select>

            {selectedChapter && (
              <p className="text-xs leading-relaxed text-slate-400">
                {selectedChapter.summary}
              </p>
            )}
          </div>

          {/* 2. Synchronized YouTube Video Player */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="mb-2.5 flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-200 truncate pr-2">
                {selectedChapter
                  ? `Capítulo ${selectedChapter.chapterNumber}: ${selectedChapter.title}`
                  : `${currentModule.weekLabel}: ${currentModule.title}`}
              </span>
              <a
                href={`${currentModule.videoUrl}${
                  selectedChapter && selectedChapter.startSeconds > 0
                    ? `&t=${selectedChapter.startSeconds}s`
                    : ''
                }`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-1 text-amber-400 hover:underline"
              >
                Abrir en YouTube ({selectedChapter ? selectedChapter.timeRange : '00:00'}){' '}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="aspect-video w-full overflow-hidden rounded-lg border border-slate-800 bg-black">
              <iframe
                key={`${currentModule.id}-${selectedChapter?.id || '0'}`}
                title={`${currentModule.weekLabel} — ${selectedChapter?.title || currentModule.title}`}
                src={`https://www.youtube.com/embed/${currentModule.youtubeId}?start=${
                  selectedChapter?.startSeconds || 0
                }&rel=0`}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          {/* 3. Three-Tab Selector: Micro-Ejercicios vs Reto Oficial vs Explicación Sencilla */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 p-1.5">
            <button
              type="button"
              onClick={() => handleSelectLeftTab('micro-exercises')}
              className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                leftTab === 'micro-exercises'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              ⚡ Micro-Ejercicios ({selectedChapter?.microExercises.length || 0})
            </button>
            <button
              type="button"
              onClick={() => handleSelectLeftTab('official-pset')}
              className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                leftTab === 'official-pset'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              📋 Reto Oficial ({currentModule.weekLabel})
            </button>
            <button
              type="button"
              onClick={() => handleSelectLeftTab('video-explanation')}
              className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                leftTab === 'video-explanation'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              💡 Vida Real (Feynman)
            </button>
          </div>

          {/* TAB 1: Micro-Ejercicios de este fragmento */}
          {leftTab === 'micro-exercises' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div>
                  <h2 className="text-sm font-bold text-slate-100">
                    Micro-Ejercicios Guiados ({selectedChapter?.timeRange})
                  </h2>
                  <p className="text-xs text-slate-400">
                    Retos de 5 minutos sobre lo que David Malan acaba de explicar en este tramo.
                  </p>
                </div>
              </div>

              {selectedChapter && selectedChapter.microExercises.length > 0 ? (
                <div className="space-y-4">
                  {selectedChapter.microExercises.map((exercise, index) => {
                    const isExpanded = expandedSolutionId === exercise.id;
                    const isCompleted = Boolean(completedExercises[exercise.id]);

                    return (
                      <div
                        key={exercise.id}
                        className={`rounded-xl border p-4 space-y-3.5 transition-all ${
                          isCompleted
                            ? 'border-emerald-500/40 bg-emerald-950/20'
                            : 'border-slate-800 bg-slate-900/70 hover:border-slate-700'
                        }`}
                      >
                        {/* Header: Title, Duration Badge & Action Buttons */}
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                                  isCompleted
                                    ? 'bg-emerald-400 text-slate-950'
                                    : 'bg-amber-400/20 text-amber-400'
                                }`}
                              >
                                {isCompleted ? '✓' : index + 1}
                              </span>
                              <h3 className="text-sm font-bold text-slate-100 truncate">
                                {exercise.title}
                              </h3>
                            </div>
                            <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
                              <Clock className="h-3 w-3 text-slate-500" />
                              Duración estimada: {exercise.duration} · {LANGUAGE_LABELS[exercise.language]}
                            </span>
                          </div>

                          {/* Action Buttons: Mark Completed & Load to Editor */}
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleCompleteExercise(exercise.id, exercise.title)}
                              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                                isCompleted
                                  ? 'border border-emerald-500/60 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                                  : 'border border-slate-700 bg-slate-900 text-slate-300 hover:border-emerald-500/50 hover:text-emerald-400'
                              }`}
                            >
                              <CheckCircle2 className={`h-3.5 w-3.5 ${isCompleted ? 'text-emerald-400' : 'text-slate-500'}`} />
                              <span>{isCompleted ? 'Completado' : 'Marcar hecho'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleLoadMicroExercise(exercise)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-bold text-slate-950 shadow-sm hover:bg-amber-300 transition-colors"
                            >
                              <FileCode2 className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">Cargar en el Editor</span>
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        {/* Prompt / Enunciado */}
                        <p className="text-xs leading-relaxed text-slate-300">
                          {exercise.prompt}
                        </p>

                        {/* Dropdown: Ver Solución Explicada */}
                        <div className="border-t border-slate-800/80 pt-2.5">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedSolutionId(isExpanded ? null : exercise.id)
                            }
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-amber-300 transition-colors"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className="h-3.5 w-3.5 text-amber-400" />
                                <span>Ocultar Solución Explicada</span>
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-3.5 w-3.5 text-amber-400" />
                                <span>Ver Solución Explicada Paso a Paso</span>
                              </>
                            )}
                          </button>

                          {isExpanded && (
                            <div className="mt-3 space-y-3 rounded-lg border border-amber-400/20 bg-slate-950 p-3.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                                  Solución Oficial
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleLoadSolution(exercise)}
                                  className="inline-flex items-center gap-1 rounded border border-slate-700 bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-slate-200 hover:bg-slate-800 hover:text-amber-300 transition-colors"
                                >
                                  <Sparkles className="h-3 w-3 text-amber-400" />
                                  Probar solución en el editor
                                </button>
                              </div>

                              <pre className="overflow-x-auto rounded-lg border border-slate-800 bg-black p-3 font-mono text-xs leading-relaxed text-emerald-400">
                                <code>{exercise.solutionCode}</code>
                              </pre>

                              <div className="space-y-1">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                  Explicación Pedagógica Línea por Línea:
                                </span>
                                <p className="text-xs leading-relaxed text-slate-300 whitespace-pre-wrap">
                                  {exercise.solutionExplanation}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-center text-xs text-slate-400">
                  Selecciona un capítulo en el desplegable superior para ver sus micro-ejercicios prácticos.
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Reto Oficial (Problem Set de la Semana) con Checklist Interactivo */}
          {leftTab === 'official-pset' && (
            <div className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5">
              <div className="flex flex-col gap-3 border-b border-slate-800 pb-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-medium text-amber-400">
                      Reto Oficial de Harvard ({currentModule.weekLabel})
                    </p>
                    <h2 className="mt-0.5 text-base font-bold text-slate-100">
                      {officialExercise.title}
                    </h2>
                  </div>

                  {!isClassZero && (
                    <button
                      type="button"
                      onClick={handleLoadOfficialExercise}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-amber-400 px-3.5 py-1.5 text-xs font-bold text-slate-950 shadow-sm hover:bg-amber-300 transition-colors"
                    >
                      <FileCode2 className="h-3.5 w-3.5" />
                      <span>Cargar Reto en el Editor</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  )}
                </div>

                {/* Enlaces Oficiales */}
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

              {/* 📋 Checklist Interactivo de Requisitos de Harvard */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    📋 Requisitos Oficiales de Harvard (Checklist)
                  </h3>
                  <span className="text-[11px] font-mono text-amber-300">
                    {totalSpecsChecked} / {officialExercise.specs.length} completados
                  </span>
                </div>

                <div className="space-y-2">
                  {officialExercise.specs.map((spec, idx) => {
                    const isChecked = Boolean(currentModuleSpecsChecked[idx]);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleToggleHarvardSpec(idx)}
                        className={`flex w-full items-start gap-2.5 rounded-lg border p-2.5 text-left text-xs leading-relaxed transition-colors ${
                          isChecked
                            ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-200'
                            : 'border-slate-800 bg-slate-950/70 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {isChecked ? (
                          <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                        ) : (
                          <Square className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                        )}
                        <span className={isChecked ? 'line-through opacity-80' : ''}>{spec}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 💻 Salida esperada (Usage) */}
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
          )}

          {/* TAB 3: Explicación Sencilla con Ejemplos de la Vida Real */}
          {leftTab === 'video-explanation' && (
            <div className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5">
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

        {/* C. Right Panel: EDITOR DE CÓDIGO ESTÁNDAR + TERMINAL + TUTOR */}
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

          {/* Active Exercise Indicator Bar */}
          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-1.5 text-xs text-slate-400">
            <div className="flex items-center gap-2 truncate">
              <FileCode2 className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span className="text-slate-500">Editando:</span>
              <span className="truncate font-medium text-slate-200">
                {activeExerciseTitle}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              {language.toUpperCase()}
            </span>
          </div>

          {/* 1. Editor Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-900/70 px-4 py-2.5">
            <div className="flex items-center gap-2.5">
              <label htmlFor="editor-lang" className="text-xs text-slate-400">
                Lenguaje:
              </label>
              <select
                id="editor-lang"
                value={language}
                onChange={(e) => {
                  const newLang = e.target.value as CS50Module['language'];
                  setLanguage(newLang);
                  setStoredValue(`cs50_lang_${currentModule.id}`, newLang);
                }}
                className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 font-mono text-xs text-slate-100 focus:border-amber-400 focus:outline-none"
              >
                <option value="c">C (GCC)</option>
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
                {isRunning ? 'Compilando...' : '▶ Ejecutar Código'}
              </button>
            </div>
          </div>

          {/* 2. Monospace Code Editor */}
          <div className="relative min-h-[260px] flex-1 overflow-hidden">
            <textarea
              aria-label="Editor de código"
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              spellCheck={false}
              className="h-full w-full resize-none bg-slate-950 p-4 sm:p-5 font-mono text-xs leading-relaxed text-slate-100 focus:outline-none sm:text-sm"
            />
          </div>

          {/* 3. Terminal Output (Below the editor) */}
          <div className="border-t border-slate-800 bg-black px-4 py-3">
            <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-300">
                <Terminal className="h-3.5 w-3.5 text-amber-400" />
                Terminal de Salida (GCC / Node / Python / SQLite)
              </span>
              {terminalResult.executionTimeMs !== null && (
                <span className="font-mono text-[11px] tabular-nums text-slate-400">
                  Exit: {terminalResult.exitCode} · Tiempo:{' '}
                  {terminalResult.executionTimeMs}ms
                </span>
              )}
            </div>

            <pre className="max-h-36 min-h-[75px] overflow-y-auto rounded-lg border border-slate-800/90 bg-slate-950/90 p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap">
              {terminalResult.stderr ? (
                <span className="text-red-400">{terminalResult.stderr}</span>
              ) : terminalResult.stdout ? (
                <span className="text-emerald-400">{terminalResult.stdout}</span>
              ) : (
                <span className="text-slate-500">
                  Pulsa &quot;▶ Ejecutar Código&quot; para compilar tu programa y ver la salida aquí...
                </span>
              )}
            </pre>
          </div>

          {/* 4. Tutor IA Anclado al Vídeo y Capítulo Actual */}
          <div className="border-t border-slate-800 bg-slate-900/90 px-4 py-3 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleRequestVideoAnchoredHelp()}
                disabled={isLoadingHint}
                className="inline-flex items-center gap-2 rounded-lg border border-amber-400/40 bg-amber-400/10 px-3.5 py-1.5 sm:py-2 text-xs font-semibold text-amber-300 hover:bg-amber-400/20 disabled:opacity-50 transition-colors"
              >
                <Lightbulb className="h-3.5 w-3.5" />
                <span>
                  {isLoadingHint
                    ? 'Consultando fragmento del vídeo...'
                    : `💡 ¿Atascado? Pista sobre este fragmento (${selectedChapter?.timeRange || '00:00'})`}
                </span>
              </button>

              <span className="text-[11px] text-slate-400 truncate">
                Anclado a <strong className="text-slate-200">{selectedChapter?.title || currentModule.weekLabel}</strong>
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
                placeholder={`Pregunta una duda sobre el capítulo ${selectedChapter?.chapterNumber || 1} (${selectedChapter?.timeRange || ''})...`}
                className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
              >
              </input>
              <button
                type="submit"
                disabled={isLoadingHint || !customQuestion.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 disabled:opacity-40 transition-colors"
              >
                <Send className="h-3 w-3" />
                <span>Preguntar</span>
              </button>
            </form>

            {hintText && (
              <div className="max-h-40 overflow-y-auto rounded-lg border border-amber-500/30 bg-slate-950 px-3.5 py-2.5 text-xs leading-relaxed text-slate-200 whitespace-pre-wrap">
                {hintText}
              </div>
            )}

            {hintError && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-950/20 px-3.5 py-2 text-xs text-amber-200">
                {hintError}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
