import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  X,
  Send,
  Search,
  Compass,
  Code2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ChevronRight,
  Sparkles,
  ShieldAlert,
  Check,
  Trash2,
  BookOpen,
  Play,
  Layers,
} from 'lucide-react';
import {
  CS50_MODULES,
  GUIDED_AI_PROJECTS,
  EIGHT_TECH_GUIDES,
  CS50Module,
} from '../data/cs50Curriculum';

export interface TopicProgressItem {
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

export interface ErrorRecordItem {
  id: string;
  moduleId: string;
  errorCategory: string;
  causeDescription: string;
  occurrences: number;
}

export type AppScreenTab = 'tutor' | 'sandbox' | 'curriculum' | 'memory' | 'architecture';

export interface AssistantSearchResultItem {
  id: string;
  category: 'lesson' | 'exercise' | 'project' | 'architecture';
  title: string;
  subtitle: string;
  snippet: string;
  moduleId?: string;
  targetScreen: AppScreenTab;
}

export interface AssistantProgressReport {
  queryType: string;
  masteredModules: Array<{ id: string; weekLabel: string; title: string; level: number }>;
  inProgressModules: Array<{
    id: string;
    weekLabel: string;
    title: string;
    level: number;
    challengeTitle: string;
  }>;
  pendingModules: Array<{
    id: string;
    weekLabel: string;
    title: string;
    challengeTitle: string;
  }>;
  recurrentErrors: Array<{
    id: string;
    moduleId: string;
    errorCategory: string;
    causeDescription: string;
    occurrences: number;
  }>;
  nextObjective: {
    moduleId: string;
    weekLabel: string;
    title: string;
    challengeTitle: string;
    reason: string;
  };
}

export interface PendingConfirmationAction {
  id: string;
  actionType:
    | 'update_level'
    | 'mark_status'
    | 'reset_module'
    | 'delete_error_record'
    | 'clear_all_errors'
    | 'change_study_plan';
  moduleId?: string;
  targetLevel?: number;
  targetStatus?: 'pending' | 'in_progress' | 'mastered';
  errorId?: string;
  reason: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}

export interface ExecutedAssistantAction {
  toolName: string;
  summary: string;
  targetScreen?: AppScreenTab;
  moduleId?: string;
}

export interface GlobalAssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  modelUsed?: string;
  executedActions?: ExecutedAssistantAction[];
  searchResults?: AssistantSearchResultItem[];
  progressReport?: AssistantProgressReport;
  pendingConfirmation?: PendingConfirmationAction;
}

interface GlobalAssistantDrawerProps {
  activeTab: AppScreenTab;
  currentModule: CS50Module;
  currentLevel: number;
  sandboxLang: 'python' | 'c' | 'sql' | 'javascript';
  sandboxCode: string;
  topicProgressMap: Record<string, TopicProgressItem>;
  errorRecords: ErrorRecordItem[];
  onNavigateScreen: (
    screen: AppScreenTab,
    openModal?: 'none' | 'live-voice' | 'calendar'
  ) => void;
  onOpenLessonModule: (mod: CS50Module, targetScreen: AppScreenTab) => void;
  onStartExerciseInSandbox: (
    mod: CS50Module,
    customStarterCode?: string,
    language?: 'python' | 'c' | 'sql' | 'javascript',
    challengeTitle?: string
  ) => void;
  onExecuteConfirmedMutation: (action: PendingConfirmationAction) => Promise<string>;
}

const ASSISTANT_STORAGE_KEY = 'cs50_global_assistant_messages_v1';
const MAX_ASSISTANT_RETRIES = 3;

const TAB_LABELS: Record<AppScreenTab, string> = {
  tutor: 'Tutor Socrático',
  sandbox: 'Laboratorio de Código',
  curriculum: 'Ruta CS50x & Vídeos',
  memory: 'Memoria & SRS',
  architecture: 'Arquitectura & Guías',
};

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function resolveModuleByIdOrTopic(
  moduleIdOrTopic: string,
  currentModuleId: string,
  topicProgressMap: Record<string, TopicProgressItem>
): CS50Module {
  const raw = (moduleIdOrTopic || '').trim();
  const norm = normalizeText(raw);

  // 1. Check "next" / "siguiente" -> next unmastered module after currentModuleId, or first unmastered
  if (
    norm === 'next' ||
    norm.includes('siguiente') ||
    norm.includes('proximo') ||
    norm.includes('continuar')
  ) {
    const currentIndex = CS50_MODULES.findIndex((m) => m.id === currentModuleId);
    for (let offset = 1; offset <= CS50_MODULES.length; offset++) {
      const candidate = CS50_MODULES[(currentIndex + offset) % CS50_MODULES.length];
      if (topicProgressMap[candidate.id]?.status !== 'mastered') {
        return candidate;
      }
    }
    return CS50_MODULES[Math.min(currentIndex + 1, CS50_MODULES.length - 1)] || CS50_MODULES[0];
  }

  // 2. Direct ID match (e.g. module-2)
  const exactById = CS50_MODULES.find((m) => m.id.toLowerCase() === norm);
  if (exactById) return exactById;

  // 3. Match by class number (e.g., "clase 2", "week 4", "2")
  const classNumMatch = norm.match(/(?:clase|modulo|module|semana|week)?\s*(\d+)/);
  if (classNumMatch) {
    const num = Number(classNumMatch[1]);
    if (num >= 0 && num < CS50_MODULES.length) {
      const byNum = CS50_MODULES.find((m) => m.id === `module-${num}`);
      if (byNum) return byNum;
    }
  }

  // 4. Keyword aliases map for rapid natural language resolution
  const keywordAliases: Array<{ keywords: string[]; moduleId: string }> = [
    { keywords: ['scratch', 'binario', 'computacional', 'pseudocodigo'], moduleId: 'module-0' },
    {
      keywords: ['lenguaje c', 'tipos de datos', 'condicionales', 'bucles', 'coma flotante', 'printf'],
      moduleId: 'module-1',
    },
    {
      keywords: ['array', 'arrays', 'arreglos', 'strings', 'criptografia', 'argc', 'argv'],
      moduleId: 'module-2',
    },
    {
      keywords: [
        'algoritmo',
        'algoritmos',
        'busqueda binaria',
        'busqueda lineal',
        'merge sort',
        'bubble sort',
        'recursividad',
        'big o',
      ],
      moduleId: 'module-3',
    },
    {
      keywords: [
        'memoria',
        'puntero',
        'punteros',
        'pointers',
        'hexadecimal',
        'malloc',
        'valgrind',
        'swap',
        'stack',
        'heap',
      ],
      moduleId: 'module-4',
    },
    {
      keywords: [
        'estructuras de datos',
        'listas enlazadas',
        'linked list',
        'hash',
        'arboles',
        'tries',
        'queues',
        'stacks',
      ],
      moduleId: 'module-5',
    },
    {
      keywords: ['python', 'diccionarios', 'excepciones', 'csv'],
      moduleId: 'module-6',
    },
    {
      keywords: ['sql', 'sqlite', 'bases de datos', 'relacional', 'join', 'injection'],
      moduleId: 'module-7',
    },
    {
      keywords: ['html', 'css', 'javascript', 'dom', 'http', 'tcp', 'dns', 'cliente-servidor'],
      moduleId: 'module-8',
    },
    {
      keywords: ['flask', 'backend', 'sesiones', 'endpoints', 'mvc', 'cookies'],
      moduleId: 'module-9',
    },
    {
      keywords: ['especial ia', 'llm', 'transformers', 'embeddings', 'tokens', 'minimax'],
      moduleId: 'module-10',
    },
    {
      keywords: ['proyecto final', 'automatizacion', 'pipelines', 'retries', 'capstone'],
      moduleId: 'module-11',
    },
  ];

  for (const entry of keywordAliases) {
    if (entry.keywords.some((kw) => norm.includes(kw))) {
      const found = CS50_MODULES.find((m) => m.id === entry.moduleId);
      if (found) return found;
    }
  }

  // 5. Fallback substring search across title, subtitle, verifiedTopics, starterChallengeTitle
  const matched = CS50_MODULES.find((m) => {
    const haystack = normalizeText(
      `${m.weekLabel} ${m.title} ${m.subtitle} ${m.verifiedTopics} ${m.starterChallengeTitle}`
    );
    return haystack.includes(norm);
  });

  return matched || CS50_MODULES.find((m) => m.id === currentModuleId) || CS50_MODULES[0];
}

export function performAppContentSearch(
  query: string,
  category: string = 'all'
): AssistantSearchResultItem[] {
  const normQuery = normalizeText(query);
  const terms = normQuery.split(/\s+/).filter((t) => t.length > 1);
  const results: AssistantSearchResultItem[] = [];

  const matchesTerms = (text: string) => {
    const normText = normalizeText(text);
    if (!normQuery) return true;
    if (normText.includes(normQuery)) return true;
    return terms.length > 0 && terms.some((t) => normText.includes(t));
  };

  if (category === 'all' || category === 'lessons' || category === 'concepts') {
    for (const mod of CS50_MODULES) {
      if (
        matchesTerms(
          `${mod.id} ${mod.weekLabel} ${mod.title} ${mod.subtitle} ${mod.verifiedTopics} ${mod.realWorldUseCase}`
        )
      ) {
        results.push({
          id: `lesson-${mod.id}`,
          category: 'lesson',
          title: `${mod.weekLabel}: ${mod.title}`,
          subtitle: `${mod.language.toUpperCase()} · ${mod.subtitle}`,
          snippet: mod.verifiedTopics,
          moduleId: mod.id,
          targetScreen: 'tutor',
        });
      }
    }
  }

  if (category === 'all' || category === 'exercises') {
    for (const mod of CS50_MODULES) {
      if (
        matchesTerms(
          `${mod.weekLabel} ${mod.title} ${mod.starterChallengeTitle} ${mod.language} ${mod.verifiedTopics}`
        )
      ) {
        results.push({
          id: `exercise-${mod.id}`,
          category: 'exercise',
          title: `Ejercicio: ${mod.starterChallengeTitle}`,
          subtitle: `${mod.weekLabel} · Lenguaje: ${mod.language.toUpperCase()}`,
          snippet: `Pregunta Feynman asociada: ${mod.feynmanPrompt}`,
          moduleId: mod.id,
          targetScreen: 'sandbox',
        });
      }
    }
  }

  if (category === 'all' || category === 'projects') {
    for (const proj of GUIDED_AI_PROJECTS) {
      if (
        matchesTerms(
          `${proj.title} ${proj.phase} ${proj.architectureSummary} ${proj.technicalDecisions.join(' ')}`
        )
      ) {
        results.push({
          id: `project-${proj.id}`,
          category: 'project',
          title: proj.title,
          subtitle: proj.phase,
          snippet: proj.architectureSummary,
          targetScreen: 'curriculum',
        });
      }
    }
  }

  if (category === 'all' || category === 'architecture') {
    for (const guide of EIGHT_TECH_GUIDES) {
      if (
        matchesTerms(
          `${guide.name} ${guide.summary} ${guide.scopeClassification} ${guide.whereInApp}`
        )
      ) {
        results.push({
          id: `arch-${guide.number}`,
          category: 'architecture',
          title: `Guía 0${guide.number}: ${guide.name}`,
          subtitle: guide.scopeClassification,
          snippet: guide.summary,
          targetScreen: 'architecture',
        });
      }
    }
  }

  // If query was very generic and nothing matched, return top 4 relevant modules/exercises
  if (results.length === 0) {
    return CS50_MODULES.slice(0, 4).map((mod) => ({
      id: `lesson-${mod.id}`,
      category: 'lesson',
      title: `${mod.weekLabel}: ${mod.title}`,
      subtitle: `${mod.language.toUpperCase()} · ${mod.subtitle}`,
      snippet: mod.verifiedTopics,
      moduleId: mod.id,
      targetScreen: 'tutor',
    }));
  }

  return results.slice(0, 6);
}

export function buildProgressReport(
  queryType: string,
  currentModuleId: string,
  topicProgressMap: Record<string, TopicProgressItem>,
  errorRecords: ErrorRecordItem[]
): AssistantProgressReport {
  const masteredModules: AssistantProgressReport['masteredModules'] = [];
  const inProgressModules: AssistantProgressReport['inProgressModules'] = [];
  const pendingModules: AssistantProgressReport['pendingModules'] = [];

  for (const mod of CS50_MODULES) {
    const prog = topicProgressMap[mod.id];
    if (prog?.status === 'mastered') {
      masteredModules.push({
        id: mod.id,
        weekLabel: mod.weekLabel,
        title: mod.title,
        level: prog.socraticLevel,
      });
    } else if (prog?.status === 'in_progress') {
      inProgressModules.push({
        id: mod.id,
        weekLabel: mod.weekLabel,
        title: mod.title,
        level: prog.socraticLevel,
        challengeTitle: mod.starterChallengeTitle,
      });
    } else {
      pendingModules.push({
        id: mod.id,
        weekLabel: mod.weekLabel,
        title: mod.title,
        challengeTitle: mod.starterChallengeTitle,
      });
    }
  }

  const nextCandidate =
    inProgressModules[0]
      ? CS50_MODULES.find((m) => m.id === inProgressModules[0].id)!
      : pendingModules[0]
      ? CS50_MODULES.find((m) => m.id === pendingModules[0].id)!
      : CS50_MODULES.find((m) => m.id === currentModuleId) || CS50_MODULES[0];

  const nextProg = topicProgressMap[nextCandidate.id];
  const nextReason = nextProg?.status === 'in_progress'
    ? `Tienes ${nextCandidate.weekLabel} en progreso (Nivel ${nextProg.socraticLevel}/4). Completa el Nivel 4 para dominarlo.`
    : `Es la siguiente clase pendiente en tu ruta estructurada de CS50x.`;

  return {
    queryType: queryType || 'summary',
    masteredModules,
    inProgressModules,
    pendingModules,
    recurrentErrors: errorRecords.map((e) => ({
      id: e.id,
      moduleId: e.moduleId,
      errorCategory: e.errorCategory,
      causeDescription: e.causeDescription,
      occurrences: e.occurrences,
    })),
    nextObjective: {
      moduleId: nextCandidate.id,
      weekLabel: nextCandidate.weekLabel,
      title: nextCandidate.title,
      challengeTitle: nextCandidate.starterChallengeTitle,
      reason: nextReason,
    },
  };
}

export const GlobalAssistantDrawer: React.FC<GlobalAssistantDrawerProps> = ({
  activeTab,
  currentModule,
  currentLevel,
  sandboxLang,
  sandboxCode,
  topicProgressMap,
  errorRecords,
  onNavigateScreen,
  onOpenLessonModule,
  onStartExerciseInSandbox,
  onExecuteConfirmedMutation,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [retryState, setRetryState] = useState<{
    attempt: number;
    maxRetries: number;
    delayMs: number;
    status?: number;
  } | null>(null);
  const [requestError, setRequestError] = useState<{
    message: string;
    status?: number;
    originalText: string;
  } | null>(null);

  const [messages, setMessages] = useState<GlobalAssistantMessage[]>(() => {
    try {
      const saved = localStorage.getItem(ASSISTANT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return [
      {
        id: 'welcome-global-assistant',
        role: 'assistant',
        content:
          'Hola, soy tu **AI Global Assistant** de CS50 Maestro Tutor. Puedo buscar lecciones, conceptos o ejercicios en toda la app, llevarte a cualquier clase o pantalla (ej. *«Llévame a arrays»* o *«Abre el siguiente ejercicio»*), consultar tu progreso real o darte una pista socrática contextual sin abandonar lo que estás haciendo.\n\n¿En qué te ayudo ahora?',
        timestamp: new Date().toISOString(),
        modelUsed: 'Global Assistant · Ready',
      },
    ];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(ASSISTANT_STORAGE_KEY, JSON.stringify(messages.slice(-30)));
    } catch {}
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isSending]);

  const pendingConfirmationsCount = messages.filter(
    (m) => m.pendingConfirmation && m.pendingConfirmation.status === 'pending'
  ).length;

  const buildProgressSummaryText = () => {
    const report = buildProgressReport(
      'summary',
      currentModule.id,
      topicProgressMap,
      errorRecords
    );
    const masteredText =
      report.masteredModules.length > 0
        ? report.masteredModules.map((m) => `${m.weekLabel} (${m.title})`).join(', ')
        : 'Ninguna todavía';
    const inProgressText =
      report.inProgressModules.length > 0
        ? report.inProgressModules
            .map((m) => `${m.weekLabel}: ${m.title} [Nivel ${m.level}/4]`)
            .join(', ')
        : 'Ninguna en curso';
    const pendingText =
      report.pendingModules.length > 0
        ? report.pendingModules.map((m) => `${m.weekLabel}: ${m.title}`).join(', ')
        : 'Todas completadas';
    const errorsText =
      report.recurrentErrors.length > 0
        ? report.recurrentErrors
            .map((e) => `[ID: ${e.id}] ${e.errorCategory} en ${e.moduleId} (${e.occurrences}x)`)
            .join('; ')
        : 'Sin errores recurrentes registrados';

    return `- Lecciones dominadas (${report.masteredModules.length}/${CS50_MODULES.length}): ${masteredText}
- Lecciones en progreso (${report.inProgressModules.length}): ${inProgressText}
- Lecciones pendientes (${report.pendingModules.length}): ${pendingText}
- Próximo objetivo recomendado: ${report.nextObjective.weekLabel} — ${report.nextObjective.title} (Reto: ${report.nextObjective.challengeTitle})
- Errores recurrentes: ${errorsText}`;
  };

  const executeWithBackoff = async (payload: Record<string, unknown>) => {
    let lastErr: Error & { status?: number; retryable?: boolean } = new Error(
      'Error de comunicación con el AI Global Assistant.'
    );

    for (let attempt = 0; attempt <= MAX_ASSISTANT_RETRIES; attempt++) {
      try {
        const res = await fetch('/api/gemini/tutor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        let data: any = null;
        try {
          data = await res.json();
        } catch {
          data = null;
        }

        if (!res.ok) {
          const status = res.status;
          const isRetryableStatus =
            status === 503 ||
            status === 429 ||
            status === 502 ||
            status === 504 ||
            Boolean(data?.retryable);

          const errMsg =
            data?.error ||
            (status === 503
              ? 'El servicio del AI Global Assistant está experimentando alta demanda temporal (503).'
              : `Error del servidor (${status}).`);

          const err = new Error(errMsg) as Error & { status?: number; retryable?: boolean };
          err.status = status;
          err.retryable = isRetryableStatus;
          throw err;
        }

        setRetryState(null);
        return data;
      } catch (err: any) {
        const isNetworkError =
          err instanceof TypeError ||
          /network|fetch|failed to fetch|timeout|econnreset/i.test(String(err?.message || ''));
        const status = typeof err?.status === 'number' ? err.status : undefined;
        const canRetry =
          attempt < MAX_ASSISTANT_RETRIES &&
          (Boolean(err?.retryable) ||
            isNetworkError ||
            status === 503 ||
            status === 429 ||
            status === 502 ||
            status === 504);

        lastErr = err instanceof Error ? err : new Error(String(err));
        if (status) lastErr.status = status;

        if (!canRetry) {
          setRetryState(null);
          throw lastErr;
        }

        const nextAttempt = attempt + 1;
        const baseDelay = 1000 * Math.pow(2, attempt);
        const jitter = Math.floor(Math.random() * 250);
        const delayMs = baseDelay + jitter;

        setRetryState({
          attempt: nextAttempt,
          maxRetries: MAX_ASSISTANT_RETRIES,
          delayMs,
          status,
        });

        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    setRetryState(null);
    throw lastErr;
  };

  const handleSend = async (overrideText?: string, isManualRetry = false) => {
    const textToSend = (overrideText ?? input).trim();
    if (!textToSend || isSending) return;

    const userMsg: GlobalAssistantMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString(),
    };

    const updatedHistory = isManualRetry
      ? messages[messages.length - 1]?.role === 'user' &&
        messages[messages.length - 1]?.content === textToSend
        ? messages
        : [...messages, userMsg]
      : [...messages, userMsg];

    if (!isManualRetry) {
      setMessages(updatedHistory);
      if (!overrideText) setInput('');
    }

    setRequestError(null);
    setRetryState(null);
    setIsSending(true);

    try {
      const data = await executeWithBackoff({
        mode: 'global-assistant',
        messages: updatedHistory.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        currentModule,
        currentLevel,
        studentCode: sandboxCode,
        appContext: {
          activeTab,
          activeTabLabel: TAB_LABELS[activeTab],
          currentModule,
          currentLevel,
          sandboxLang,
          sandboxCode,
          progressSummaryText: buildProgressSummaryText(),
        },
      });

      const executedActions: ExecutedAssistantAction[] = [];
      let searchResults: AssistantSearchResultItem[] | undefined;
      let progressReport: AssistantProgressReport | undefined;
      let pendingConfirmation: PendingConfirmationAction | undefined;

      const functionCalls = Array.isArray(data.functionCalls) ? data.functionCalls : [];

      for (const call of functionCalls) {
        const args = (call.args || {}) as Record<string, any>;

        if (call.name === 'searchAppContent') {
          const query = String(args.query || textToSend);
          const category = String(args.category || 'all');
          searchResults = performAppContentSearch(query, category);
          executedActions.push({
            toolName: 'searchAppContent',
            summary: `Búsqueda ejecutada: "${query}" (${searchResults.length} resultados)`,
          });
        } else if (call.name === 'navigateToScreen') {
          const rawScreen = normalizeText(String(args.screen || 'tutor'));
          let targetScreen: AppScreenTab = activeTab;
          if (rawScreen.includes('sandbox') || rawScreen.includes('laboratorio') || rawScreen.includes('codigo')) {
            targetScreen = 'sandbox';
          } else if (rawScreen.includes('curriculum') || rawScreen.includes('ruta') || rawScreen.includes('video')) {
            targetScreen = 'curriculum';
          } else if (rawScreen.includes('memory') || rawScreen.includes('memoria') || rawScreen.includes('progreso')) {
            targetScreen = 'memory';
          } else if (rawScreen.includes('architecture') || rawScreen.includes('arquitectura') || rawScreen.includes('guia')) {
            targetScreen = 'architecture';
          } else {
            targetScreen = 'tutor';
          }

          const rawModal = normalizeText(String(args.openModal || 'none'));
          const modalToOpen: 'none' | 'live-voice' | 'calendar' =
            rawModal.includes('voice') || rawModal.includes('voz')
              ? 'live-voice'
              : rawModal.includes('calendar') || rawModal.includes('calendario')
              ? 'calendar'
              : 'none';

          onNavigateScreen(targetScreen, modalToOpen);
          executedActions.push({
            toolName: 'navigateToScreen',
            summary: `Pantalla abierta: ${TAB_LABELS[targetScreen]}${
              modalToOpen !== 'none' ? ` + Modal (${modalToOpen})` : ''
            }`,
            targetScreen,
          });
        } else if (call.name === 'openLessonModule') {
          const moduleIdOrTopic = String(args.moduleIdOrTopic || 'next');
          const resolvedMod = resolveModuleByIdOrTopic(
            moduleIdOrTopic,
            currentModule.id,
            topicProgressMap
          );
          const rawScreen = normalizeText(String(args.targetScreen || 'tutor'));
          const targetScreen: AppScreenTab =
            rawScreen === 'sandbox'
              ? 'sandbox'
              : rawScreen === 'curriculum'
              ? 'curriculum'
              : 'tutor';

          onOpenLessonModule(resolvedMod, targetScreen);
          executedActions.push({
            toolName: 'openLessonModule',
            summary: `Lección abierta: ${resolvedMod.weekLabel} — ${resolvedMod.title}`,
            targetScreen,
            moduleId: resolvedMod.id,
          });
        } else if (call.name === 'startExerciseInSandbox') {
          const moduleIdOrTopic = String(args.moduleIdOrTopic || 'next');
          const resolvedMod = resolveModuleByIdOrTopic(
            moduleIdOrTopic,
            currentModule.id,
            topicProgressMap
          );
          const customCode =
            typeof args.customStarterCode === 'string' && args.customStarterCode.trim().length > 0
              ? args.customStarterCode
              : undefined;
          const lang = (args.language || resolvedMod.language) as
            | 'python'
            | 'c'
            | 'sql'
            | 'javascript';

          onStartExerciseInSandbox(
            resolvedMod,
            customCode,
            lang,
            args.challengeTitle || resolvedMod.starterChallengeTitle
          );
          executedActions.push({
            toolName: 'startExerciseInSandbox',
            summary: `Ejercicio iniciado en Sandbox: ${resolvedMod.starterChallengeTitle} (${resolvedMod.weekLabel})`,
            targetScreen: 'sandbox',
            moduleId: resolvedMod.id,
          });
        } else if (call.name === 'queryStudentProgress') {
          const queryType = String(args.queryType || 'summary');
          progressReport = buildProgressReport(
            queryType,
            currentModule.id,
            topicProgressMap,
            errorRecords
          );
          executedActions.push({
            toolName: 'queryStudentProgress',
            summary: `Progreso consultado (${progressReport.masteredModules.length} dominadas, ${progressReport.pendingModules.length} pendientes)`,
          });
        } else if (call.name === 'requestStateModification') {
          const rawAction = String(args.actionType || 'update_level') as PendingConfirmationAction['actionType'];
          const resolvedMod = args.moduleId
            ? resolveModuleByIdOrTopic(String(args.moduleId), currentModule.id, topicProgressMap)
            : currentModule;

          pendingConfirmation = {
            id: `confirm-${Date.now()}`,
            actionType: rawAction,
            moduleId: resolvedMod.id,
            targetLevel: args.targetLevel ? Number(args.targetLevel) : undefined,
            targetStatus: args.targetStatus as any,
            errorId: args.errorId ? String(args.errorId) : undefined,
            reason:
              String(args.reason || '').trim() ||
              `Modificar estado o progreso en ${resolvedMod.weekLabel}: ${resolvedMod.title}`,
            status: 'pending',
          };
          executedActions.push({
            toolName: 'requestStateModification',
            summary: `Confirmación requerida antes de modificar datos (${rawAction})`,
          });
        }
      }

      const assistantMsg: GlobalAssistantMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content:
          data.reply ||
          data.socraticReply ||
          'He procesado tu solicitud. ¿Qué deseas explorar a continuación?',
        timestamp: new Date().toISOString(),
        modelUsed: data.modelUsed || 'Global Assistant',
        executedActions: executedActions.length > 0 ? executedActions : undefined,
        searchResults,
        progressReport,
        pendingConfirmation,
      };

      setMessages([...updatedHistory, assistantMsg]);
    } catch (err: any) {
      const status = typeof err?.status === 'number' ? err.status : undefined;
      const errMsg =
        err instanceof Error
          ? err.message
          : 'No se pudo conectar con el AI Global Assistant.';
      setRequestError({
        message: errMsg,
        status,
        originalText: textToSend,
      });
    } finally {
      setIsSending(false);
      setRetryState(null);
    }
  };

  const handleConfirmPendingAction = async (msgId: string, action: PendingConfirmationAction) => {
    try {
      const outcomeSummary = await onExecuteConfirmedMutation(action);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId && m.pendingConfirmation
            ? {
                ...m,
                pendingConfirmation: { ...m.pendingConfirmation, status: 'confirmed' },
                content: `${m.content}\n\n✅ **Cambio confirmado y aplicado:** ${outcomeSummary}`,
              }
            : m
        )
      );
    } catch (err: any) {
      const errText = err instanceof Error ? err.message : String(err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId
            ? {
                ...m,
                content: `${m.content}\n\n⚠️ **Error al aplicar el cambio:** ${errText}`,
              }
            : m
        )
      );
    }
  };

  const handleCancelPendingAction = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId && m.pendingConfirmation
          ? {
              ...m,
              pendingConfirmation: { ...m.pendingConfirmation, status: 'cancelled' },
              content: `${m.content}\n\n🛑 **Acción cancelada por el usuario.** No se modificó ningún dato de tu progreso.`,
            }
          : m
      )
    );
  };

  return (
    <>
      {/* Floating Action Button accessible across all screens */}
      <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Abrir AI Global Assistant"
          className="group relative inline-flex items-center gap-2.5 rounded-full border border-amber-400/50 bg-slate-950/95 px-4 py-3 text-xs font-semibold text-slate-100 shadow-xl shadow-black/60 hover:border-amber-400 hover:bg-slate-900 transition-all"
        >
          <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-slate-950">
            <Bot className="h-4 w-4" />
            {pendingConfirmationsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {pendingConfirmationsCount}
              </span>
            )}
          </span>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span>AI Global Assistant</span>
              <Sparkles className="h-3 w-3 text-amber-400" />
            </div>
            <div className="text-[10px] font-normal text-slate-400">
              {TAB_LABELS[activeTab]} · {currentModule.weekLabel}
            </div>
          </div>
        </button>
      </div>

      {/* Slide-over Chat Panel (Non-intrusive overlay preserving current screen) */}
      {isOpen && (
        <aside
          aria-label="Panel AI Global Assistant"
          className="fixed bottom-20 right-5 z-50 flex h-[calc(100vh-7rem)] max-h-[680px] w-[calc(100vw-2.5rem)] max-w-md flex-col overflow-hidden rounded-2xl border border-slate-700/90 bg-slate-950/98 shadow-2xl shadow-black/80 backdrop-blur-md"
        >
          {/* Header with active context indicator */}
          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/15 border border-amber-400/40 text-amber-400">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                  AI Global Assistant
                  <span className="rounded bg-amber-500/20 px-1.5 py-0.5 font-mono text-[10px] text-amber-300">
                    Function Calling
                  </span>
                </h2>
                <p className="text-[11px] text-slate-400">
                  Contexto: <span className="text-slate-200">{TAB_LABELS[activeTab]}</span> ·{' '}
                  <span className="text-amber-300">{currentModule.weekLabel}</span> (Nivel{' '}
                  {currentLevel}/4)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  const welcomeMsg: GlobalAssistantMessage = {
                    id: `welcome-${Date.now()}`,
                    role: 'assistant',
                    content:
                      'Historial de chat limpiado. Tu progreso del curso sigue intacto. ¿Qué lección, ejercicio o consulta quieres realizar?',
                    timestamp: new Date().toISOString(),
                    modelUsed: 'Global Assistant · Ready',
                  };
                  setMessages([welcomeMsg]);
                  setRequestError(null);
                }}
                title="Limpiar conversación del asistente"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Cerrar AI Global Assistant"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Quick Action Bar for instant testing & navigation */}
          <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-800/80 bg-slate-900/40 px-3 py-2 text-[11px]">
            <button
              type="button"
              onClick={() => handleSend('Llévame a arrays')}
              disabled={isSending}
              className="inline-flex items-center gap-1 rounded-md border border-slate-700/80 bg-slate-900 px-2 py-1 text-slate-200 hover:border-amber-400/50 hover:text-amber-300 whitespace-nowrap shrink-0 transition-colors"
            >
              <Compass className="h-3 w-3 text-amber-400" />
              Llévame a arrays
            </button>
            <button
              type="button"
              onClick={() => handleSend('Abre el siguiente ejercicio')}
              disabled={isSending}
              className="inline-flex items-center gap-1 rounded-md border border-slate-700/80 bg-slate-900 px-2 py-1 text-slate-200 hover:border-amber-400/50 hover:text-amber-300 whitespace-nowrap shrink-0 transition-colors"
            >
              <Play className="h-3 w-3 text-emerald-400" />
              Siguiente ejercicio
            </button>
            <button
              type="button"
              onClick={() =>
                handleSend('¿Qué lecciones he completado, cuáles tengo pendientes y cuál es mi próximo objetivo?')
              }
              disabled={isSending}
              className="inline-flex items-center gap-1 rounded-md border border-slate-700/80 bg-slate-900 px-2 py-1 text-slate-200 hover:border-amber-400/50 hover:text-amber-300 whitespace-nowrap shrink-0 transition-colors"
            >
              <Layers className="h-3 w-3 text-sky-400" />
              Mi progreso
            </button>
            <button
              type="button"
              onClick={() => handleSend('Busca lecciones y ejercicios sobre punteros y SQL')}
              disabled={isSending}
              className="inline-flex items-center gap-1 rounded-md border border-slate-700/80 bg-slate-900 px-2 py-1 text-slate-200 hover:border-amber-400/50 hover:text-amber-300 whitespace-nowrap shrink-0 transition-colors"
            >
              <Search className="h-3 w-3 text-amber-400" />
              Buscar temas
            </button>
          </div>

          {/* Conversation Messages Stream */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[92%] rounded-xl p-3 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-amber-500/15 border border-amber-400/40 text-slate-100'
                      : 'bg-slate-900/95 border border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400 mb-1">
                    <span className="font-semibold text-slate-300">
                      {msg.role === 'user' ? 'Tú' : 'AI Global Assistant'}
                    </span>
                    {msg.modelUsed && (
                      <span className="font-mono text-[9px] text-slate-500">{msg.modelUsed}</span>
                    )}
                  </div>

                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {/* Executed Function Calling Badges */}
                  {msg.executedActions && msg.executedActions.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800/90 space-y-1">
                      {msg.executedActions.map((act, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-300"
                        >
                          <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-400" />
                          <span>{act.summary}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Interactive Natural Language Search Results */}
                  {msg.searchResults && msg.searchResults.length > 0 && (
                    <div className="mt-3 space-y-2 border-t border-slate-800 pt-2.5">
                      <p className="text-[11px] font-semibold text-slate-300">
                        Resultados interactivos ({msg.searchResults.length}):
                      </p>
                      {msg.searchResults.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-lg border border-slate-800 bg-slate-950/90 p-2.5 hover:border-slate-700 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-mono uppercase text-amber-400">
                                {item.category}
                              </span>
                              <h4 className="text-xs font-semibold text-slate-100">
                                {item.title}
                              </h4>
                              <p className="text-[11px] text-slate-400">{item.subtitle}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                if (item.moduleId) {
                                  const mod = CS50_MODULES.find((m) => m.id === item.moduleId);
                                  if (mod) {
                                    if (item.category === 'exercise') {
                                      onStartExerciseInSandbox(mod);
                                    } else {
                                      onOpenLessonModule(mod, item.targetScreen);
                                    }
                                    return;
                                  }
                                }
                                onNavigateScreen(item.targetScreen);
                              }}
                              className="inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-[11px] font-semibold text-amber-300 hover:bg-amber-400 hover:text-slate-950 shrink-0 transition-colors"
                            >
                              Abrir <ChevronRight className="h-3 w-3" />
                            </button>
                          </div>
                          <p className="mt-1 text-[11px] text-slate-400 line-clamp-2">
                            {item.snippet}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Interactive Student Progress Report Card */}
                  {msg.progressReport && (
                    <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950 p-3 space-y-2.5">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="rounded border border-slate-800 bg-slate-900/60 p-2">
                          <div className="text-sm font-bold text-emerald-400 tabular-nums">
                            {msg.progressReport.masteredModules.length}
                          </div>
                          <div className="text-[10px] text-slate-400">Dominadas</div>
                        </div>
                        <div className="rounded border border-slate-800 bg-slate-900/60 p-2">
                          <div className="text-sm font-bold text-amber-300 tabular-nums">
                            {msg.progressReport.inProgressModules.length}
                          </div>
                          <div className="text-[10px] text-slate-400">En curso</div>
                        </div>
                        <div className="rounded border border-slate-800 bg-slate-900/60 p-2">
                          <div className="text-sm font-bold text-slate-300 tabular-nums">
                            {msg.progressReport.pendingModules.length}
                          </div>
                          <div className="text-[10px] text-slate-400">Pendientes</div>
                        </div>
                      </div>

                      <div className="rounded border border-amber-500/30 bg-amber-950/15 p-2.5">
                        <div className="text-[10px] font-semibold uppercase text-amber-300">
                          Próximo Objetivo Recomendado
                        </div>
                        <div className="text-xs font-semibold text-slate-100 mt-0.5">
                          {msg.progressReport.nextObjective.weekLabel}:{' '}
                          {msg.progressReport.nextObjective.title}
                        </div>
                        <p className="text-[11px] text-slate-300 mt-0.5">
                          {msg.progressReport.nextObjective.reason}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const mod = CS50_MODULES.find(
                                (m) => m.id === msg.progressReport?.nextObjective.moduleId
                              );
                              if (mod) onOpenLessonModule(mod, 'tutor');
                            }}
                            className="inline-flex items-center gap-1 rounded bg-amber-400 px-2.5 py-1 text-[11px] font-semibold text-slate-950 hover:bg-amber-300"
                          >
                            <BookOpen className="h-3 w-3" /> Ir a la Lección
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const mod = CS50_MODULES.find(
                                (m) => m.id === msg.progressReport?.nextObjective.moduleId
                              );
                              if (mod) onStartExerciseInSandbox(mod);
                            }}
                            className="inline-flex items-center gap-1 rounded border border-slate-700 bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-slate-200 hover:bg-slate-800"
                          >
                            <Code2 className="h-3 w-3 text-amber-400" /> Abrir Ejercicio
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Confirmation Gate for Actions that Modify Progress, Delete Data, or Change Study Plan */}
                  {msg.pendingConfirmation && (
                    <div className="mt-3 rounded-lg border border-amber-400/50 bg-amber-950/25 p-3 space-y-2">
                      <div className="flex items-start gap-2">
                        <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-semibold text-amber-200">
                            Confirmación requerida para modificar datos
                          </div>
                          <p className="text-[11px] text-slate-300 mt-0.5">
                            {msg.pendingConfirmation.reason}
                          </p>
                        </div>
                      </div>

                      {msg.pendingConfirmation.status === 'pending' ? (
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() =>
                              handleConfirmPendingAction(msg.id, msg.pendingConfirmation!)
                            }
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-400 px-3 py-1.5 text-[11px] font-semibold text-slate-950 hover:bg-emerald-300 transition-colors"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Confirmar y Aplicar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCancelPendingAction(msg.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-slate-300 hover:bg-slate-800 transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <div className="text-[11px] font-mono text-slate-400">
                          Estado:{' '}
                          {msg.pendingConfirmation.status === 'confirmed'
                            ? 'Confirmado por el alumno'
                            : 'Cancelado'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading & Exponential Backoff Indicator */}
            {isSending && (
              <div
                role="status"
                aria-live="polite"
                className="rounded-xl border border-amber-500/30 bg-slate-900/90 p-3 text-xs text-slate-200 space-y-1.5"
              >
                <div className="flex items-center gap-2">
                  <RotateCcw className="h-3.5 w-3.5 text-amber-400 animate-spin shrink-0" />
                  <span>
                    {retryState
                      ? `Reintentando automáticamente (${retryState.attempt}/${retryState.maxRetries})...`
                      : 'Procesando consulta y verificando herramientas...'}
                  </span>
                </div>
                {retryState && (
                  <p className="pl-5 font-mono text-[10px] text-amber-300">
                    Espera progresiva: {(retryState.delayMs / 1000).toFixed(1)}s · Tu mensaje está
                    guardado.
                  </p>
                )}
              </div>
            )}

            {/* Error Alert with Manual Retry & Message Preservation */}
            {requestError && !isSending && (
              <div
                role="alert"
                className="rounded-xl border border-red-500/40 bg-red-950/30 p-3 text-xs text-slate-200 space-y-2"
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-300">
                      Error al procesar la solicitud
                      {requestError.status ? ` (HTTP ${requestError.status})` : ''}
                    </p>
                    <p className="text-[11px] text-slate-300 mt-0.5">{requestError.message}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSend(requestError.originalText, true)}
                    className="inline-flex items-center gap-1 rounded-lg bg-amber-400 px-3 py-1.5 text-[11px] font-semibold text-slate-950 hover:bg-amber-300"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reintentar manualmente
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInput(requestError.originalText);
                      setRequestError(null);
                    }}
                    className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-[11px] text-slate-300 hover:bg-slate-800"
                  >
                    Editar mensaje
                  </button>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="border-t border-slate-800 bg-slate-900/90 p-3"
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ej. «Llévame a arrays», «Abre el siguiente ejercicio» o pide una pista..."
                className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-amber-400 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isSending || !input.trim()}
                aria-label="Enviar al AI Global Assistant"
                className="inline-flex items-center justify-center rounded-lg bg-amber-400 p-2 text-slate-950 hover:bg-amber-300 disabled:opacity-40 transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </aside>
      )}
    </>
  );
};
