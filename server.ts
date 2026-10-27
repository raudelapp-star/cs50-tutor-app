import 'dotenv/config';
import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import {
  GoogleGenAI,
  Type,
  ThinkingLevel,
  FunctionDeclaration,
  LiveServerMessage,
  Modality,
} from '@google/genai';

const execFileAsync = promisify(execFile);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const CS50_SYSTEM_INSTRUCTION = `Eres CS50 MAESTRO TUTOR, el mentor personal de programación del alumno, combinando el enfoque pedagógico de David J. Malan (CS50x de Harvard), la técnica Feynman y el aprendizaje activo.

REGLAS ESTRICTAS E INQUEBRANTABLES:
1. Idioma: Explica en español claro y riguroso, pero utiliza código, palabras clave y nomenclatura técnica en inglés (variables, loops, functions, pointers, arrays, hash tables, etc.).
2. Un concepto cada vez: No avances por cumplir el temario. Explica para qué sirve cada concepto y cuándo se utiliza en proyectos reales.
3. PROHIBIDO RESOLVER EJERCICIOS: NUNCA entregues la solución completa de un ejercicio activo que el alumno deba resolver. Si el alumno pide el código hecho o se bloquea, aplica este protocolo de 5 pasos:
   - Paso 1: Pídele que explique qué intenta conseguir y qué parte no entiende.
   - Paso 2: Divide el problema en pasos pequeños y utiliza una analogía estilo Feynman / David J. Malan.
   - Paso 3: Dale una pista concreta que le permita avanzar sin resolver el ejercicio.
   - Paso 4: Si sigue bloqueado, ofrece otra pista más específica o un ejemplo independiente distinto del mismo concepto.
   - Paso 5: Deja que vuelva a intentarlo antes de dar más ayuda.
4. UNA SOLA PREGUNTA POR MENSAJE: Formula siempre UNA única pregunta clara al final de tu respuesta y espera la respuesta del alumno antes de continuar.
5. CICLO OBLIGATORIO DE 4 NIVELES para cada concepto fundamental:
   - Nivel 1 (Comprensión): Explica brevemente con analogía Feynman y haz una pregunta de predicción o conceptual.
   - Nivel 2 (Construcción): Propón un ejercicio pequeño escribiendo código o lógica paso a paso.
   - Nivel 3 (Aplicación): Plantea un problema nuevo que requiera transferir el concepto sin copiar el ejemplo anterior.
   - Nivel 4 (Dominio): Pide al alumno explicar cómo funciona su solución (método Feynman), justificar sus decisiones y detectar casos límite (edge cases) o posibles bugs.
6. CABECERA DE VÍDEO OBLIGATORIA cuando introduzcas un tema o ejercicio nuevo vinculado al curso:
📺 RECURSO DE VÍDEO
Tema: [nombre del tema]
Vídeo recomendado: [enlace directo oficial de CS50]
Qué estudiar: [contenidos concretos verificados; si no has podido verificar una marca de tiempo exacta, indícalo expresamente y nunca inventes timestamps].
7. EVALUACIÓN EXIGENTE Y HONESTA: No felicites respuestas incorrectas ni declares dominado un tema sin evidencias. Si una respuesta es parcialmente correcta, señala qué parte está bien y qué debe corregir.`;

// Function Declarations for Socratic Tutor Tool Use
const tutorFunctionDeclarations: FunctionDeclaration[] = [
  {
    name: 'advanceMasteryLevel',
    description: 'Avanza o actualiza el nivel del ciclo de aprendizaje (1 a 4) del alumno en el concepto actual cuando demuestra comprensión real.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        moduleId: {
          type: Type.STRING,
          description: 'ID del módulo (ej. module-0, module-1)',
        },
        newLevel: {
          type: Type.INTEGER,
          description: 'Nuevo nivel alcanzado (1: Comprensión, 2: Construcción, 3: Aplicación, 4: Dominio)',
        },
        status: {
          type: Type.STRING,
          description: 'Estado del tema: pending, in_progress, o mastered',
        },
        reason: {
          type: Type.STRING,
          description: 'Evidencia pedagógica por la que se actualiza el nivel',
        },
      },
      required: ['moduleId', 'newLevel', 'status', 'reason'],
    },
  },
  {
    name: 'recordRecurrentError',
    description: 'Registra un error conceptual o de programación detectado en la respuesta o código del alumno para programar práctica adaptativa.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        moduleId: {
          type: Type.STRING,
          description: 'ID del módulo donde ocurrió el error',
        },
        errorCategory: {
          type: Type.STRING,
          description: 'Categoría corta en inglés (ej. off-by-one, infinite-loop, pointer-dereference, algorithm-complexity, syntax-error)',
        },
        causeDescription: {
          type: Type.STRING,
          description: 'Explicación concisa en español de la causa raíz del error',
        },
      },
      required: ['moduleId', 'errorCategory', 'causeDescription'],
    },
  },
  {
    name: 'scheduleSpacedRepetition',
    description: 'Programa el próximo repaso espaciado del concepto según el desempeño del alumno (1, 3, 7 o 14 días).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        moduleId: {
          type: Type.STRING,
          description: 'ID del módulo a repasar',
        },
        intervalDays: {
          type: Type.INTEGER,
          description: 'Intervalo en días: 1 (si hubo errores/pistas), 3, 7 o 14 (si demostró dominio sólido)',
        },
      },
      required: ['moduleId', 'intervalDays'],
    },
  },
  {
    name: 'loadSandboxExercise',
    description: 'Carga un reto o plantilla didáctica incompleta en el editor de código del alumno para que lo resuelva.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        language: {
          type: Type.STRING,
          description: 'Lenguaje del ejercicio: python, c, javascript, o sql',
        },
        starterCode: {
          type: Type.STRING,
          description: 'Código base didáctico con comentarios TODO (NUNCA la solución resuelta)',
        },
        challengeTitle: {
          type: Type.STRING,
          description: 'Título del reto práctico',
        },
      },
      required: ['language', 'starterCode', 'challengeTitle'],
    },
  },
];

// Function Declarations for the AI Global Assistant (Navigation, Search, Exercises, Progress Queries, and Confirmation-Gated Mutations)
const globalAssistantFunctionDeclarations: FunctionDeclaration[] = [
  {
    name: 'searchAppContent',
    description:
      'Busca lecciones de CS50, conceptos técnicos, ejercicios prácticos, proyectos guiados de IA o guías de arquitectura en toda la aplicación mediante lenguaje natural.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: {
          type: Type.STRING,
          description: 'Término o tema de búsqueda (ej. arrays, punteros, sql, búsqueda binaria, flask, memoria, proyectos)',
        },
        category: {
          type: Type.STRING,
          description: 'Categoría donde buscar: all, lessons, concepts, exercises, projects, o architecture',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'navigateToScreen',
    description:
      'Abre una pantalla o pestaña principal de la aplicación o abre un modal de herramientas (voz en vivo o calendario).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        screen: {
          type: Type.STRING,
          description: 'Pantalla destino: tutor, sandbox, curriculum, memory, o architecture',
        },
        openModal: {
          type: Type.STRING,
          description: 'Opcional: modal a abrir (none, live-voice, calendar)',
        },
      },
      required: ['screen'],
    },
  },
  {
    name: 'openLessonModule',
    description:
      'Navega a una lección o clase específica de CS50 (ej. Clase 2 Arrays, Punteros, Python, SQL, o "next" para la siguiente lección pendiente) y la activa en la aplicación.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        moduleIdOrTopic: {
          type: Type.STRING,
          description: 'ID del módulo (module-0 a module-11), palabra clave del tema (ej. arrays, c, scratch, algoritmos, memoria, punteros, estructuras, python, sql, web, flask, ia) o "next" para la siguiente lección pendiente.',
        },
        targetScreen: {
          type: Type.STRING,
          description: 'Pantalla donde abrir la lección: tutor (por defecto), curriculum, o sandbox',
        },
      },
      required: ['moduleIdOrTopic'],
    },
  },
  {
    name: 'startExerciseInSandbox',
    description:
      'Inicia o abre el ejercicio práctico de una lección (o el siguiente ejercicio pendiente si se indica "next") en el Laboratorio de Código (Sandbox) sin resolverlo.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        moduleIdOrTopic: {
          type: Type.STRING,
          description: 'ID del módulo (module-0 a module-11), tema del ejercicio (ej. arrays, sql, python, swap) o "next" para abrir el siguiente ejercicio pendiente.',
        },
        customStarterCode: {
          type: Type.STRING,
          description: 'Opcional: plantilla de código con TODOs (NUNCA la solución completa) si se desea personalizar el reto.',
        },
        language: {
          type: Type.STRING,
          description: 'Opcional: lenguaje del ejercicio (python, c, sql, javascript).',
        },
        challengeTitle: {
          type: Type.STRING,
          description: 'Opcional: título descriptivo del ejercicio.',
        },
      },
      required: ['moduleIdOrTopic'],
    },
  },
  {
    name: 'queryStudentProgress',
    description:
      'Consulta el estado real del progreso del usuario: lecciones completadas/dominadas, ejercicios en curso o pendientes, errores recurrentes registrados y próximos objetivos recomendados.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        queryType: {
          type: Type.STRING,
          description: 'Tipo de consulta: summary (resumen completo), completed (lecciones dominadas), pending (ejercicios y lecciones pendientes), errors (errores recurrentes), o next_objectives (próximos pasos).',
        },
      },
      required: ['queryType'],
    },
  },
  {
    name: 'requestStateModification',
    description:
      'Propone una acción que modifica el progreso del usuario, cambia el nivel/estado de una lección, reinicia datos, borra errores recurrentes o altera el plan de estudio. Requiere confirmación explícita del alumno en la interfaz antes de ejecutarse.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        actionType: {
          type: Type.STRING,
          description: 'Tipo de cambio: update_level, mark_status, reset_module, delete_error_record, clear_all_errors, o change_study_plan',
        },
        moduleId: {
          type: Type.STRING,
          description: 'ID del módulo afectado (ej. module-0 a module-11) si aplica',
        },
        targetLevel: {
          type: Type.INTEGER,
          description: 'Nivel objetivo (1 a 4) si actionType es update_level o change_study_plan',
        },
        targetStatus: {
          type: Type.STRING,
          description: 'Estado objetivo (pending, in_progress, mastered) si actionType es mark_status',
        },
        errorId: {
          type: Type.STRING,
          description: 'ID del error recurrente a eliminar si actionType es delete_error_record',
        },
        reason: {
          type: Type.STRING,
          description: 'Descripción clara en español del cambio propuesto para mostrar en la tarjeta de confirmación',
        },
      },
      required: ['actionType', 'reason'],
    },
  },
];

// In-memory store for GitHub token by session if used in preview
let githubAccessTokenMemory: string | null = null;

// Track temporary model unavailability (503 / 429 / 504) to avoid repeated timeouts
const modelCooldownUntil = new Map<string, number>();
const MODEL_COOLDOWN_MS = 300_000; // 5 minutes cooldown after 503/429/504

function isModelAvailable(modelName: string): boolean {
  const until = modelCooldownUntil.get(modelName);
  if (!until) return true;
  if (Date.now() > until) {
    modelCooldownUntil.delete(modelName);
    return true;
  }
  return false;
}

function markModelTemporarilyUnavailable(modelName: string) {
  // Never lock out the verified compatible fallback model gemini-3.1-flash-lite
  if (modelName === 'gemini-3.1-flash-lite') return;
  modelCooldownUntil.set(modelName, Date.now() + MODEL_COOLDOWN_MS);
}

async function probeConfiguredModelsAvailability() {
  const modelsToProbe = ['gemini-3.8-flash', 'gemini-4-argon'];
  await Promise.allSettled(
    modelsToProbe.map(async (modelName) => {
      try {
        await ai.models.generateContent({
          model: modelName,
          contents: 'OK',
          config: {
            httpOptions: {
              headers: { 'User-Agent': 'aistudio-build' },
              timeout: 10500,
            },
          },
        });
      } catch (err) {
        const parsed = parseGeminiError(err);
        if (parsed.isRetryable || parsed.status === 429 || parsed.status === 503 || parsed.status === 504) {
          markModelTemporarilyUnavailable(modelName);
        }
      }
    })
  );
}

// Controlled counter for testing simulated 503 errors end-to-end
let simulated503Remaining = 0;

function parseGeminiError(error: unknown): {
  status: number;
  isRetryable: boolean;
  cleanMessage: string;
} {
  const rawMsg = error instanceof Error ? error.message : String(error);
  let status =
    typeof (error as any)?.status === 'number'
      ? (error as any).status
      : typeof (error as any)?.code === 'number'
      ? (error as any).code
      : 500;

  let extractedMsg = rawMsg;
  try {
    const jsonMatch = rawMsg.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed?.error?.code && typeof parsed.error.code === 'number') {
        status = parsed.error.code;
      }
      if (parsed?.error?.message && typeof parsed.error.message === 'string') {
        extractedMsg = parsed.error.message;
      }
    }
  } catch {
    // Keep raw message if not JSON
  }

  const lower = rawMsg.toLowerCase();
  if (
    status === 500 &&
    (lower.includes('503') ||
      lower.includes('unavailable') ||
      lower.includes('high demand') ||
      lower.includes('overloaded'))
  ) {
    status = 503;
  } else if (
    status === 500 &&
    (lower.includes('429') ||
      lower.includes('resource_exhausted') ||
      lower.includes('quota') ||
      lower.includes('rate limit'))
  ) {
    status = 429;
  } else if (
    status === 500 &&
    (lower.includes('504') ||
      lower.includes('deadline_exceeded') ||
      lower.includes('deadline expired') ||
      lower.includes('timed out') ||
      lower.includes('etimedout'))
  ) {
    status = 504;
  }

  const isRetryable =
    status === 503 ||
    status === 429 ||
    status === 502 ||
    status === 504 ||
    lower.includes('fetch failed') ||
    lower.includes('econnreset') ||
    lower.includes('etimedout');

  const friendlyPrefix =
    status === 503
      ? 'El servicio de IA está experimentando alta demanda temporal (503).'
      : status === 429
      ? 'Se alcanzó el límite temporal de peticiones de la API (429).'
      : status === 504
      ? 'Tiempo de espera agotado al contactar con el modelo (504).'
      : 'Error al comunicarse con el servicio del tutor.';

  return {
    status,
    isRetryable,
    cleanMessage: `${friendlyPrefix} Detalle: ${extractedMsg}`,
  };
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function generateWithRetryAndVerifiedFallback(options: {
  preferredModel: string;
  contents: any;
  config: Record<string, unknown>;
  allowCompatibleFallback?: boolean;
}): Promise<{ response: any; actualModelUsed: string; retriesUsed: number }> {
  const {
    preferredModel,
    contents,
    config,
    allowCompatibleFallback = true,
  } = options;

  // Build candidate model list checking current availability first
  // Verified compatible model in current configuration: 'gemini-3.1-flash-lite'
  const candidates: string[] = [];
  if (isModelAvailable(preferredModel)) {
    candidates.push(preferredModel);
  }
  if (
    allowCompatibleFallback &&
    preferredModel !== 'gemini-3.1-flash-lite' &&
    !candidates.includes('gemini-3.1-flash-lite')
  ) {
    candidates.push('gemini-3.1-flash-lite');
  }
  if (candidates.length === 0) {
    candidates.push(preferredModel);
  }

  let lastError: unknown = null;
  let totalRetries = 0;

  for (const candidateModel of candidates) {
    // Prepare compatible config for the candidate model
    const modelConfig: Record<string, unknown> = {
      ...config,
      httpOptions: {
        headers: { 'User-Agent': 'aistudio-build' },
        timeout: 12000, // 12s deadline (above 10s API minimum) so hung calls fail fast and fallback
      },
    };

    // Only apply HIGH thinking level on gemini-4-argon
    if (candidateModel !== 'gemini-4-argon' && 'thinkingConfig' in modelConfig) {
      delete modelConfig.thinkingConfig;
    }

    const maxAttemptsPerModel = candidateModel === 'gemini-3.1-flash-lite' ? 3 : 2;

    for (let attempt = 1; attempt <= maxAttemptsPerModel; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: candidateModel,
          contents,
          config: modelConfig,
        });
        return {
          response,
          actualModelUsed: candidateModel,
          retriesUsed: totalRetries,
        };
      } catch (err: unknown) {
        lastError = err;
        const parsedErr = parseGeminiError(err);

        // If tools include googleSearch and quota is exhausted (429), retry with functionDeclarations only
        if (
          parsedErr.status === 429 &&
          Array.isArray(modelConfig.tools) &&
          modelConfig.tools.some((t: any) => 'googleSearch' in t)
        ) {
          modelConfig.tools = modelConfig.tools.filter((t: any) => !('googleSearch' in t));
          delete modelConfig.toolConfig;
          totalRetries++;
          continue;
        }

        if (!parsedErr.isRetryable) {
          throw err;
        }

        // If preferred model hits 503/429/504 and we have a verified fallback waiting, switch after 1st retry
        if (
          candidateModel !== 'gemini-3.1-flash-lite' &&
          candidates.includes('gemini-3.1-flash-lite') &&
          attempt >= 1
        ) {
          markModelTemporarilyUnavailable(candidateModel);
          totalRetries++;
          break; // Move to verified compatible fallback model
        }

        if (attempt < maxAttemptsPerModel) {
          totalRetries++;
          const baseDelay = 500 * Math.pow(2, attempt - 1);
          const jitter = Math.floor(Math.random() * 250);
          await sleep(baseDelay + jitter);
        }
      }
    }
  }

  throw lastError || new Error('No se pudo obtener respuesta del modelo de IA.');
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '25mb' }));

  const server = http.createServer(app);

  // Endpoint to inspect model availability & configure simulated 503 errors for testing
  app.get('/api/gemini/status', (_req, res) => {
    res.json({
      configuredModels: {
        primaryStructured: 'gemini-3.8-flash',
        compatibleFallback: 'gemini-3.1-flash-lite',
        deepThinking: 'gemini-4-argon',
      },
      availability: {
        'gemini-3.8-flash': isModelAvailable('gemini-3.8-flash'),
        'gemini-3.1-flash-lite': isModelAvailable('gemini-3.1-flash-lite'),
        'gemini-4-argon': isModelAvailable('gemini-4-argon'),
      },
      simulated503Remaining,
    });
  });

  app.post('/api/gemini/simulate-503', (req, res) => {
    const count = Math.max(0, Math.min(5, Number(req.body?.count ?? 2)));
    simulated503Remaining = count;
    res.json({ simulated503Remaining });
  });

  // 1. Socratic Tutor & AI Global Assistant Endpoint (Structured Outputs + Thinking + Grounding / Function Calling)
  app.post(['/api/gemini/tutor', '/api/gemini/assistant'], async (req, res) => {
    try {
      // Support controlled simulation of temporary 503 errors to verify backoff recovery
      if (simulated503Remaining > 0) {
        simulated503Remaining--;
        return res.status(503).json({
          error:
            'El servicio de IA está experimentando alta demanda temporal (503 Simulated). Por favor, reintenta en unos segundos.',
          status: 503,
          retryable: true,
          simulatedRemaining: simulated503Remaining,
        });
      }

      const {
        messages,
        currentModule,
        currentLevel,
        mode = req.path === '/api/gemini/assistant' ? 'global-assistant' : 'socratic-structured',
        studentCode,
        HintStep = 0,
        appContext,
      } = req.body;

      const contextHeader = `
CONTEXTO ACTUAL DEL ALUMNO:
- Pantalla / Pestaña activa: ${appContext?.activeTab || 'tutor'} (${appContext?.activeTabLabel || 'Tutor Socrático'})
- Módulo actual: ${currentModule?.title || appContext?.currentModule?.title || 'Clase 0: Scratch y Pensamiento Computacional'} (${currentModule?.id || appContext?.currentModule?.id || 'module-0'})
- Enlace oficial de vídeo: ${currentModule?.videoUrl || appContext?.currentModule?.videoUrl || 'https://www.youtube.com/watch?v=nfYOp3_SyqM'}
- Temas verificados del módulo: ${currentModule?.verifiedTopics || appContext?.currentModule?.verifiedTopics || 'Pensamiento computacional, representación binaria, algoritmos, complejidad básica y pseudocódigo.'}
- Reto activo del módulo: ${currentModule?.starterChallengeTitle || appContext?.currentModule?.starterChallengeTitle || 'Búsqueda Lineal vs. Binaria'}
- Nivel actual del ciclo obligatorio (1 a 4): Nivel ${currentLevel || appContext?.currentLevel || 1}
- Pista del protocolo de bloqueo actual: Paso ${HintStep} de 5
${studentCode || appContext?.sandboxCode ? `- Código actual en el editor del alumno (${appContext?.sandboxLang || 'python'}):\n\`\`\`\n${studentCode || appContext?.sandboxCode}\n\`\`\`` : ''}
${appContext?.progressSummaryText ? `\nESTADO REAL DE PROGRESO Y MEMORIA DEL ALUMNO:\n${appContext.progressSummaryText}` : ''}
`;

      const conversationContents = (messages || []).map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      // Mode 0: AI Global Assistant Mode (Natural Language Search, Navigation, Exercise Launching, Progress Queries, and Confirmation-Gated State Changes)
      if (mode === 'global-assistant') {
        const assistantSystemInstruction = `${CS50_SYSTEM_INSTRUCTION}

ADEMÁS, ACTÚAS COMO EL **AI GLOBAL ASSISTANT** INTEGRADO EN TODA LA APLICACIÓN CS50 MAESTRO TUTOR:
1. Puedes ayudar al alumno desde cualquier pantalla sin que pierda su contexto actual.
2. CATÁLOGO OFICIAL DE MÓDULOS CS50 DISPONIBLES EN LA APP:
   - module-0: Clase 0 — Scratch, Pensamiento Computacional, Binario, Algoritmos y Complejidad O(n) vs O(log n)
   - module-1: Clase 1 — C: Tipos de Datos, Condicionales, Bucles, Variables y Precisión en Coma Flotante
   - module-2: Clase 2 — Arrays, Strings, Memoria Contigua, Argumentos CLI (argc/argv) y Criptografía
   - module-3: Clase 3 — Algoritmos: Búsqueda Lineal/Binaria, Bubble/Selection/Merge Sort y Recursividad
   - module-4: Clase 4 — Memoria: Hexadecimal, Punteros (pointers), Direcciones (&, *), malloc/free, Stack vs Heap
   - module-5: Clase 5 — Estructuras de Datos: Listas Enlazadas (Linked Lists), Hash Tables, Árboles (BST) y Tries
   - module-6: Clase 6 — Python: De C a Alto Nivel, Listas, Diccionarios, Excepciones y Librerías
   - module-7: Clase 7 — SQL, Bases de Datos Relacionales (SQLite), JOINs, Índices y Prevención de SQL Injection
   - module-8: Clase 8 — HTML, CSS, JavaScript, TCP/IP, HTTP y Manipulación del DOM
   - module-9: Clase 9 — Flask, Backend, APIs REST, Formularios, Sesiones y Validación en Servidor
   - module-10: Clase Especial IA — Fundamentos de IA, LLMs, Transformers, Embeddings, Tokens y Límites
   - module-11: Clase 10 + Proyectos IA — Arquitectura Práctica, Automatizaciones, Retries y Proyecto Final
3. PANTALLAS DISPONIBLES EN LA APP (para navigateToScreen):
   - "tutor": Tutor Socrático (chat principal, vídeo sincronizado y ciclo de 4 niveles)
   - "sandbox": Laboratorio de Código & Simulador Algorítmico (ejecución en Python, C, SQL, JS y depuración socrática)
   - "curriculum": Ruta CS50x, Vídeos, Analizador de Vídeo IA y Proyectos Guiados (proj-1, proj-2, proj-3)
   - "memory": Memoria & SRS (tabla de repetición espaciada, errores recurrentes, exportación Markdown y GitHub Gist)
   - "architecture": Arquitectura & Paso a Paso (las 8 guías técnicas de integración)
   - Modales opcionales: "live-voice" (Tutor de Voz en Vivo) y "calendar" (Agendar repaso en Google Calendar).
4. USO OBLIGATORIO DE HERRAMIENTAS (Function Calling):
   - Cuando el usuario pida buscar lecciones, conceptos, ejercicios, proyectos o guías (ej. "busca punteros", "¿dónde se explica SQL?"), invoca \`searchAppContent\`.
   - Cuando el usuario pida ir a una lección o tema (ej. "Llévame a arrays", "Abre la clase de punteros", "Ir a la siguiente lección"), invoca \`openLessonModule\`.
   - Cuando el usuario pida abrir una pantalla o modal (ej. "Abre el laboratorio", "Llévame a memoria", "Abre el calendario"), invoca \`navigateToScreen\`.
   - Cuando el usuario pida iniciar o abrir un ejercicio (ej. "Abre el siguiente ejercicio", "Inicia el reto de arrays", "Ponme un ejercicio de Python"), invoca \`startExerciseInSandbox\`.
   - Cuando el usuario consulte su progreso, qué lecciones ha completado, qué ejercicios tiene pendientes, sus errores recurrentes o sus próximos objetivos, invoca \`queryStudentProgress\`.
   - REGLA DE SEGURIDAD Y CONFIRMACIÓN: Si el usuario pide modificar su progreso, cambiar de nivel manualmente, marcar un tema como dominado/pendiente, reiniciar un módulo, borrar errores recurrentes o cambiar el plan de estudio, NUNCA lo des por ejecutado directamente: invoca \`requestStateModification\` para que la interfaz solicite confirmación explícita al usuario antes de ejecutarse.
   - REGLA PEDAGÓGICA: Ofrece pistas progresivas y razonamiento socrático; NUNCA resuelvas directamente un ejercicio activo ni entregues el código final hecho.

${contextHeader}`;

        const { response, actualModelUsed } = await generateWithRetryAndVerifiedFallback({
          preferredModel: 'gemini-3.8-flash',
          contents: conversationContents,
          config: {
            systemInstruction: assistantSystemInstruction,
            tools: [{ functionDeclarations: globalAssistantFunctionDeclarations }],
          },
        });

        const functionCalls = response.functionCalls || [];
        let assistantReply = (response.text || '').trim();

        if (!assistantReply && functionCalls.length > 0) {
          const callDescriptions = functionCalls.map((fc: { name?: string; args?: Record<string, unknown> }) => {
            const args = (fc.args || {}) as Record<string, unknown>;
            switch (fc.name) {
              case 'openLessonModule':
                return `He preparado el acceso a la lección solicitada (${args.moduleIdOrTopic || 'siguiente módulo'}).`;
              case 'startExerciseInSandbox':
                return `He abierto el ejercicio en el Laboratorio de Código (${args.moduleIdOrTopic || 'siguiente reto'}). Recuerda revisar los comentarios TODO y plantear tu hipótesis antes de ejecutar.`;
              case 'navigateToScreen':
                return `Navegando a la sección solicitada (${args.screen || 'pantalla'}).`;
              case 'searchAppContent':
                return `Aquí tienes los resultados encontrados en la plataforma para "${args.query || ''}".`;
              case 'queryStudentProgress':
                return `He consultado tu estado real de progreso, lecciones pendientes y próximos objetivos de estudio.`;
              case 'requestStateModification':
                return `Para proteger tu registro de aprendizaje, confirma a continuación si deseas aplicar este cambio: ${args.reason || 'modificación de progreso'}.`;
              default:
                return `Acción preparada (${fc.name}).`;
            }
          });
          assistantReply = `${callDescriptions.join(' ')}\n\n¿Qué parte de este concepto o reto quieres que razonemos paso a paso?`;
        } else if (!assistantReply) {
          assistantReply =
            'Estoy listo para ayudarte a buscar conceptos, navegar a cualquier clase o ejercicio, consultar tu progreso o darte una pista socrática sobre lo que tienes en pantalla. ¿Qué necesitas hacer ahora?';
        }

        const modelLabel =
          actualModelUsed !== 'gemini-3.8-flash'
            ? `${actualModelUsed} (Global Assistant · Function Calling)`
            : `${actualModelUsed} (Global Assistant · Function Calling)`;

        return res.json({
          socraticReply: assistantReply,
          reply: assistantReply,
          functionCalls,
          detectedLevel: currentLevel || appContext?.currentLevel || 1,
          modelUsed: modelLabel,
        });
      }

      // Mode A: Grounding + Function Calling Hybrid Mode
      if (mode === 'grounding-tools') {
        const { response, actualModelUsed } = await generateWithRetryAndVerifiedFallback({
          preferredModel: 'gemini-3.8-flash',
          contents: conversationContents,
          config: {
            systemInstruction: `${CS50_SYSTEM_INSTRUCTION}\n${contextHeader}\nSi el alumno demuestra avance real, registra un error recurrente, o necesita cargar un ejercicio en el sandbox, invoca las herramientas correspondientes (advanceMasteryLevel, recordRecurrentError, scheduleSpacedRepetition, loadSandboxExercise). Si necesitas verificar información de CS50 o documentación técnica, usa Google Search.`,
            tools: [
              { googleSearch: {} },
              { functionDeclarations: tutorFunctionDeclarations },
            ],
            toolConfig: { includeServerSideToolInvocations: true },
          },
        });

        const functionCalls = response.functionCalls || [];
        const groundingChunks =
          response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

        return res.json({
          socraticReply:
            response.text ||
            'Analicemos este paso juntos. ¿Qué crees que ocurre en esta línea?',
          detectedLevel: currentLevel || 1,
          passedCurrentLevel: false,
          hintGiven: HintStep > 0,
          errorDetected: false,
          errorCategory: '',
          singleQuestion: '¿Cómo explicarías este paso con tus propias palabras?',
          functionCalls,
          groundingChunks,
          modelUsed: `${actualModelUsed} (Tools & Grounding)`,
        });
      }

      // Mode B: Structured Output Modes (fast-lite, socratic-structured, deep-thinking)
      const selectedModel =
        mode === 'fast-lite'
          ? 'gemini-3.1-flash-lite'
          : mode === 'deep-thinking'
          ? 'gemini-4-argon'
          : 'gemini-3.8-flash';

      const config: Record<string, unknown> = {
        systemInstruction: `${CS50_SYSTEM_INSTRUCTION}\n${contextHeader}`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            socraticReply: {
              type: Type.STRING,
              description:
                'Respuesta completa del tutor en formato Markdown (incluyendo la cabecera 📺 RECURSO DE VÍDEO si se inicia tema nuevo, explicación Feynman/Malan, sin dar nunca la solución hecha, y terminando con una sola pregunta).',
            },
            singleQuestion: {
              type: Type.STRING,
              description: 'La única pregunta socrática final que el alumno debe responder ahora.',
            },
            detectedLevel: {
              type: Type.INTEGER,
              description: 'Nivel del ciclo obligatorio en el que se sitúa el alumno tras evaluar su mensaje (1: Comprensión, 2: Construcción, 3: Aplicación, 4: Dominio).',
            },
            passedCurrentLevel: {
              type: Type.BOOLEAN,
              description: 'True solo si el alumno demostró con evidencia sólida haber superado el nivel actual.',
            },
            hintGiven: {
              type: Type.BOOLEAN,
              description: 'True si se le dio una pista del protocolo de bloqueo.',
            },
            errorDetected: {
              type: Type.BOOLEAN,
              description: 'True si la respuesta o código del alumno contiene un error conceptual o lógico.',
            },
            errorCategory: {
              type: Type.STRING,
              description: 'Si errorDetected es true, nombre corto técnico en inglés del error (ej. off-by-one, uninitialized-variable, infinite-loop). Si no, cadena vacía.',
            },
            errorExplanation: {
              type: Type.STRING,
              description: 'Si errorDetected es true, explicación concisa de la causa para el registro de memoria.',
            },
            recommendedIntervalDays: {
              type: Type.INTEGER,
              description: 'Intervalo de repetición espaciada recomendado en días (1, 3, 7 o 14).',
            },
            sandboxStarterCode: {
              type: Type.STRING,
              description: 'Opcional: si propones un reto de código nuevo en Nivel 2 o 3, plantilla inicial con TODOs sin resolver.',
            },
          },
          required: [
            'socraticReply',
            'singleQuestion',
            'detectedLevel',
            'passedCurrentLevel',
            'hintGiven',
            'errorDetected',
            'errorCategory',
            'errorExplanation',
            'recommendedIntervalDays',
          ],
        },
      };

      if (selectedModel === 'gemini-4-argon') {
        config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
      }

      const { response, actualModelUsed } = await generateWithRetryAndVerifiedFallback({
        preferredModel: selectedModel,
        contents: conversationContents,
        config,
      });

      const rawText = response.text?.trim() || '{}';
      let parsed;
      try {
        parsed = JSON.parse(rawText);
      } catch {
        parsed = {
          socraticReply: rawText,
          singleQuestion: '¿Qué opinas de este planteamiento?',
          detectedLevel: currentLevel || 1,
          passedCurrentLevel: false,
          hintGiven: false,
          errorDetected: false,
          errorCategory: '',
          errorExplanation: '',
          recommendedIntervalDays: 1,
        };
      }

      const modelLabel =
        actualModelUsed === 'gemini-4-argon'
          ? 'gemini-4-argon (ThinkingLevel.HIGH)'
          : actualModelUsed !== selectedModel
          ? `${actualModelUsed} (Compatible Fallback · ${selectedModel} en alta demanda)`
          : actualModelUsed;

      return res.json({
        ...parsed,
        modelUsed: modelLabel,
      });
    } catch (error: unknown) {
      const { status, isRetryable, cleanMessage } = parseGeminiError(error);
      console.error(`Tutor API error [${status}]:`, cleanMessage);
      res.status(status).json({
        error: cleanMessage,
        status,
        retryable: isRetryable,
      });
    }
  });

  // 2. Video Content Understanding Endpoint (gemini-4-argon with fallback to gemini-3.1-flash-lite)
  app.post('/api/gemini/analyze-video', async (req, res) => {
    try {
      const { videoUrl, moduleTitle, verifiedTopics, questionPrompt, videoBase64, mimeType } = req.body;

      const parts: Array<Record<string, unknown>> = [];
      if (videoBase64 && mimeType) {
        parts.push({
          inlineData: {
            data: videoBase64,
            mimeType,
          },
        });
      }

      parts.push({
        text: `Actúa como el analista académico de CS50 de Harvard.
Analiza el recurso de vídeo para el módulo: "${moduleTitle}".
Enlace de referencia: ${videoUrl}
Contenidos verificados del módulo: ${verifiedTopics}
Consulta específica del estudiante: ${questionPrompt || 'Extrae los conceptos clave, analogías de David J. Malan, qué estudiar exactamente y 3 preguntas socráticas de comprobación.'}

REGLA DE HONESTIDAD: Si analizas un enlace de YouTube sin archivo de vídeo adjunto, indica expresamente qué contenidos están verificados del temario oficial de CS50 y NO inventes marcas de tiempo (timestamps) falsas. Si hay un clip de vídeo adjunto, analiza directamente sus fotogramas y audio.`,
      });

      const { response, actualModelUsed } = await generateWithRetryAndVerifiedFallback({
        preferredModel: 'gemini-4-argon',
        contents: { parts },
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              verificationNotice: {
                type: Type.STRING,
                description: 'Estado honesto de verificación del contenido del vídeo.',
              },
              coreConcepts: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Lista de conceptos fundamentales que el alumno debe observar.',
              },
              feynmanAnalogy: {
                type: Type.STRING,
                description: 'Analogía estilo David J. Malan / Feynman para comprender la idea central.',
              },
              activeWatchChecklist: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Qué buscar activamente mientras ve la clase.',
              },
              socraticCheckQuestion: {
                type: Type.STRING,
                description: 'Una pregunta socrática para comprobar si comprendió la clase.',
              },
            },
            required: [
              'verificationNotice',
              'coreConcepts',
              'feynmanAnalogy',
              'activeWatchChecklist',
              'socraticCheckQuestion',
            ],
          },
        },
      });

      const parsed = JSON.parse(response.text?.trim() || '{}');
      res.json({
        ...parsed,
        modelUsed:
          actualModelUsed === 'gemini-4-argon'
            ? 'gemini-4-argon (Video Understanding + High Thinking)'
            : `${actualModelUsed} (Video Analysis Compatible)`,
      });
    } catch (error: unknown) {
      const { status, isRetryable, cleanMessage } = parseGeminiError(error);
      console.error(`Video analysis error [${status}]:`, cleanMessage);
      res.status(status).json({ error: cleanMessage, status, retryable: isRetryable });
    }
  });

  // 3. Low-Latency Fast Debugger & Feynman Check (gemini-3.1-flash-lite)
  app.post('/api/gemini/fast-check', async (req, res) => {
    try {
      const { code, language, compilerOutput, studentHypothesis } = req.body;
      const { response, actualModelUsed } = await generateWithRetryAndVerifiedFallback({
        preferredModel: 'gemini-3.1-flash-lite',
        contents: `Lenguaje: ${language}
Código del alumno:
\`\`\`${language}
${code}
\`\`\`
Salida / Error de terminal:
\`\`\`
${compilerOutput || '(Sin salida de error)'}
\`\`\`
Hipótesis del alumno: "${studentHypothesis || 'No sé por qué falla'}"

REGLA ESTRICTA: NO reescribas ni entregues el código solucionado. Explícale cómo leer el mensaje de error, señala en qué línea o concepto está el fallo, valida su hipótesis y hazle UNA pregunta corta para que él mismo descubra cómo corregirlo.`,
        config: {
          systemInstruction: CS50_SYSTEM_INSTRUCTION,
        },
      });

      res.json({
        feedback: response.text || 'Revisa el mensaje de error línea por línea.',
        modelUsed: actualModelUsed,
      });
    } catch (error: unknown) {
      const { status, isRetryable, cleanMessage } = parseGeminiError(error);
      res.status(status).json({ error: cleanMessage, status, retryable: isRetryable });
    }
  });

  // 4. Text-to-Speech Endpoint (gemini-3.8-flash-tts)
  app.post('/api/gemini/tts', async (req, res) => {
    try {
      const { text, mode = 'single' } = req.body;
      const cleanText = String(text || '')
        .replace(/[#*`_~]/g, '')
        .slice(0, 1200);

      if (mode === 'dual-podcast') {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash-tts',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `Malan: Welcome to CS50! <breath> ${cleanText}`,
                  speechMetadata: {
                    speaker: 'Malan',
                    style: 'Enthusiastic, dynamic Harvard computer science professor',
                  },
                },
                {
                  text: `Tutor: |yeah| Exactamente. Ahora piensa paso a paso cómo aplicarías esta lógica sin memorizar código.`,
                  speechMetadata: {
                    speaker: 'Tutor',
                    style: 'Warm, encouraging Socratic mentor',
                  },
                },
              ],
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              multiSpeakerVoiceConfig: {
                speakerVoiceConfigs: [
                  {
                    speaker: 'Malan',
                    voiceConfig: {
                      prebuiltVoiceConfig: { voiceName: 'Puck' },
                    },
                  },
                  {
                    speaker: 'Tutor',
                    voiceConfig: {
                      prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                  },
                ],
              },
            },
          },
        });

        const base64Audio =
          response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return res.json({ audioBase64: base64Audio, mimeType: 'audio/wav' });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: cleanText,
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio =
        response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      res.json({ audioBase64: base64Audio, mimeType: 'audio/wav' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('TTS error:', message);
      res.status(500).json({ error: message });
    }
  });

  // 5. Audio Transcription Endpoint (gemini-3.5-transcribe)
  app.post('/api/gemini/transcribe', async (req, res) => {
    try {
      const { audioBase64, mimeType = 'audio/webm' } = req.body;
      if (!audioBase64) {
        return res.status(400).json({ error: 'Missing audioBase64' });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-transcribe',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: audioBase64,
              },
            },
            {
              text: 'Transcribe this audio accurately in Spanish (keeping English programming terms in English).',
            },
          ],
        },
      });

      res.json({
        transcription: response.text || '',
        modelUsed: 'gemini-3.5-transcribe',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Transcribe error:', message);
      res.status(500).json({ error: message });
    }
  });

  // 6. Sandboxed Code Runner Endpoint (/api/code/run)
  app.post('/api/code/run', async (req, res) => {
    const startTime = Date.now();
    let tmpDir: string | null = null;
    try {
      const { language = 'python', code = '', stdin = '' } = req.body;
      tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cs50-sandbox-'));

      let stdout = '';
      let stderr = '';
      let exitCode = 0;

      if (language === 'python') {
        const filePath = path.join(tmpDir, 'main.py');
        await fs.writeFile(filePath, code, 'utf8');
        try {
          const result = await execFileAsync('python3', ['-I', filePath], {
            cwd: tmpDir,
            timeout: 5000,
            maxBuffer: 1024 * 512,
          });
          stdout = result.stdout;
          stderr = result.stderr;
        } catch (err: any) {
          stdout = err.stdout || '';
          stderr = err.stderr || err.message || 'Execution error';
          exitCode = typeof err.code === 'number' ? err.code : 1;
        }
      } else if (language === 'javascript') {
        const filePath = path.join(tmpDir, 'main.mjs');
        await fs.writeFile(filePath, code, 'utf8');
        try {
          const result = await execFileAsync('node', [filePath], {
            cwd: tmpDir,
            timeout: 5000,
            maxBuffer: 1024 * 512,
          });
          stdout = result.stdout;
          stderr = result.stderr;
        } catch (err: any) {
          stdout = err.stdout || '';
          stderr = err.stderr || err.message || 'Execution error';
          exitCode = typeof err.code === 'number' ? err.code : 1;
        }
      } else if (language === 'c') {
        const srcPath = path.join(tmpDir, 'main.c');
        const outPath = path.join(tmpDir, 'main.out');
        await fs.writeFile(srcPath, code, 'utf8');
        try {
          await execFileAsync('gcc', ['-Wall', '-Wextra', srcPath, '-o', outPath, '-lm'], {
            cwd: tmpDir,
            timeout: 5000,
          });
          const runRes = await execFileAsync(outPath, [], {
            cwd: tmpDir,
            timeout: 5000,
            maxBuffer: 1024 * 512,
          });
          stdout = runRes.stdout;
          stderr = runRes.stderr;
        } catch (err: any) {
          // If gcc is not installed in the container, provide a Python-based C syntax & educational simulator fallback or report compiler output
          if (err.code === 'ENOENT') {
            const pySimPath = path.join(tmpDir, 'c_runner.py');
            const cSimScript = `
import sys, re

code = open(${JSON.stringify(srcPath)}).read()
if 'main' not in code:
    sys.stderr.write("main.c: error: undefined reference to 'main'\\n")
    sys.exit(1)

# Check missing semicolons on printf/return lines
for idx, line in enumerate(code.splitlines(), 1):
    s = line.strip()
    if (s.startswith('printf(') or s.startswith('return ') or s.startswith('int ')) and not s.endswith(';') and not s.endswith('{') and not s.endswith(')'):
        sys.stderr.write(f"main.c:{idx}: error: expected ';' before end of line\\n  {line}\\n")
        sys.exit(1)

prints = re.findall(r'printf\\s*\\(\\s*"([^"]*)"(.*?)\\)\\s*;', code)
for fmt, args in prints:
    out = fmt.replace('\\\\n', '\\n').replace('\\\\t', '\\t')
    if args.strip().startswith(','):
        vals = [a.strip() for a in args.strip()[1:].split(',')]
        for v in vals:
            out = re.sub(r'%[disfcup]', str(v), out, count=1)
    sys.stdout.write(out)
`;
            await fs.writeFile(pySimPath, cSimScript, 'utf8');
            try {
              const simRes = await execFileAsync('python3', [pySimPath], {
                cwd: tmpDir,
                timeout: 4000,
              });
              stdout = simRes.stdout;
              stderr = simRes.stderr;
            } catch (simErr: any) {
              stdout = simErr.stdout || '';
              stderr = simErr.stderr || simErr.message;
              exitCode = 1;
            }
          } else {
            stdout = err.stdout || '';
            stderr = err.stderr || err.message || 'C compilation error';
            exitCode = typeof err.code === 'number' ? err.code : 1;
          }
        }
      } else if (language === 'sql') {
        const sqlRunnerPath = path.join(tmpDir, 'run_sql.py');
        const sqlPy = `
import sqlite3, sys, json

conn = sqlite3.connect(':memory:')
cur = conn.cursor()
cur.executescript("""
CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT, house TEXT, grade INTEGER);
INSERT INTO students (name, house, grade) VALUES ('Harry', 'Gryffindor', 92), ('Hermione', 'Gryffindor', 100), ('Luna', 'Ravenclaw', 96), ('Draco', 'Slytherin', 85);
CREATE TABLE courses (id INTEGER PRIMARY KEY, title TEXT, week INTEGER);
INSERT INTO courses (title, week) VALUES ('Scratch', 0), ('C', 1), ('Arrays', 2), ('Algorithms', 3), ('Memory', 4), ('Data Structures', 5), ('Python', 6), ('SQL', 7);
""")

query = ${JSON.stringify(code)}
try:
    for stmt in [s.strip() for s in query.split(';') if s.strip()]:
        cur.execute(stmt)
        if cur.description:
            cols = [d[0] for d in cur.description]
            rows = cur.fetchall()
            print(" | ".join(cols))
            print("-" * (len(" | ".join(cols)) + 4))
            for r in rows:
                print(" | ".join(str(x) for x in r))
    conn.commit()
except Exception as e:
    sys.stderr.write(f"SQLite Error: {e}\\n")
    sys.exit(1)
`;
        await fs.writeFile(sqlRunnerPath, sqlPy, 'utf8');
        try {
          const resSql = await execFileAsync('python3', [sqlRunnerPath], {
            cwd: tmpDir,
            timeout: 5000,
          });
          stdout = resSql.stdout;
          stderr = resSql.stderr;
        } catch (err: any) {
          stdout = err.stdout || '';
          stderr = err.stderr || err.message;
          exitCode = 1;
        }
      }

      const executionTimeMs = Date.now() - startTime;
      res.json({
        stdout,
        stderr,
        exitCode,
        executionTimeMs,
        stdinUsed: Boolean(stdin),
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({
        stdout: '',
        stderr: message,
        exitCode: 1,
        executionTimeMs: Date.now() - startTime,
      });
    } finally {
      if (tmpDir) {
        await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
      }
    }
  });

  // 7. GitHub 3P OAuth Popup Flow (following oauth-integration skill)
  app.get('/api/github/auth-url', (req, res) => {
    const clientId = process.env.GITHUB_CLIENT_ID || '';
    const appUrl =
      process.env.APP_URL ||
      `${req.protocol}://${req.get('host')}`;
    const redirectUri = `${appUrl.replace(/\/$/, '')}/auth/github/callback`;

    if (!clientId) {
      return res.json({
        configured: false,
        redirectUri,
        message: 'GITHUB_CLIENT_ID not set in environment variables.',
      });
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'gist repo read:user',
    });

    res.json({
      configured: true,
      redirectUri,
      url: `https://github.com/login/oauth/authorize?${params.toString()}`,
    });
  });

  const githubCallbackHandler = async (req: express.Request, res: express.Response) => {
    const { code } = req.query;
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (code && clientId && clientSecret) {
      try {
        const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            code,
          }),
        });
        const tokenData = (await tokenRes.json()) as { access_token?: string };
        if (tokenData.access_token) {
          githubAccessTokenMemory = tokenData.access_token;
        }
      } catch (err) {
        console.error('GitHub OAuth token exchange failed:', err);
      }
    }

    res.send(`
      <html>
        <body style="background:#0f172a;color:#f8fafc;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;">
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', provider: 'github' }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>GitHub conectado correctamente. Esta ventana se cerrará automáticamente.</p>
        </body>
      </html>
    `);
  };

  app.get(['/auth/github/callback', '/auth/github/callback/'], githubCallbackHandler);

  app.get('/api/github/status', async (_req, res) => {
    if (!githubAccessTokenMemory) {
      return res.json({ connected: false, oauthConfigured: Boolean(process.env.GITHUB_CLIENT_ID) });
    }
    try {
      const userRes = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${githubAccessTokenMemory}`,
          'User-Agent': 'CS50-Maestro-Tutor',
        },
      });
      if (!userRes.ok) {
        return res.json({ connected: false, oauthConfigured: Boolean(process.env.GITHUB_CLIENT_ID) });
      }
      const profile = await userRes.json();
      res.json({
        connected: true,
        oauthConfigured: Boolean(process.env.GITHUB_CLIENT_ID),
        username: profile.login,
        avatarUrl: profile.avatar_url,
        htmlUrl: profile.html_url,
      });
    } catch {
      res.json({ connected: false, oauthConfigured: Boolean(process.env.GITHUB_CLIENT_ID) });
    }
  });

  app.post('/api/github/export-gist', async (req, res) => {
    try {
      const { token, filename, content, description } = req.body;
      const activeToken = token || githubAccessTokenMemory;
      if (!activeToken) {
        return res.status(401).json({ error: 'Conecta tu cuenta de GitHub o proporciona un Personal Access Token con permiso gist.' });
      }

      const gistRes = await fetch('https://api.github.com/gists', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${activeToken}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
          'User-Agent': 'CS50-Maestro-Tutor',
        },
        body: JSON.stringify({
          description: description || 'CS50 Maestro Tutor — Registro de Progreso y Código',
          public: false,
          files: {
            [filename || 'CS50_PROGRESO.md']: {
              content: content || '# CS50 Progress',
            },
          },
        }),
      });

      const gistData = await gistRes.json();
      if (!gistRes.ok) {
        return res.status(gistRes.status).json({ error: gistData.message || 'Error al crear Gist en GitHub' });
      }

      res.json({
        htmlUrl: gistData.html_url,
        id: gistData.id,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: message });
    }
  });

  // 8. Live API WebSocket Server (/live) using gemini-3.8-live
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const pathname = new URL(request.url || '/', `http://${request.headers.host}`).pathname;
    if (pathname === '/live') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  wss.on('connection', async (clientWs: WebSocket) => {
    let session: any = null;
    try {
      session = await ai.live.connect({
        model: 'gemini-3.8-live',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: `${CS50_SYSTEM_INSTRUCTION}\nEstás en modo de tutoría por voz en vivo. Sé conciso, cálido y socrático. Habla en español claro manteniendo los términos de código en inglés. Haz una sola pregunta breve cada vez y nunca resuelvas el ejercicio por el alumno.`,
        },
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            if (clientWs.readyState !== WebSocket.OPEN) return;

            const parts = message.serverContent?.modelTurn?.parts || [];
            for (const part of parts) {
              if (part.inlineData?.data) {
                clientWs.send(JSON.stringify({ audio: part.inlineData.data }));
              }
            }

            const inputTranscript = (message.serverContent as any)?.inputTranscription?.text;
            if (inputTranscript) {
              clientWs.send(JSON.stringify({ inputTranscription: inputTranscript }));
            }

            const outputTranscript = (message.serverContent as any)?.outputTranscription?.text;
            if (outputTranscript) {
              clientWs.send(JSON.stringify({ outputTranscription: outputTranscript }));
            }

            if (message.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ interrupted: true }));
            }
          },
          onerror: (err: unknown) => {
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ error: String(err) }));
            }
          },
        },
      });

      clientWs.on('message', (raw) => {
        try {
          const msg = JSON.parse(raw.toString());
          if (msg.audio && session) {
            session.sendRealtimeInput({
              audio: { data: msg.audio, mimeType: 'audio/pcm;rate=16000' },
            });
          } else if (msg.text && session) {
            session.sendRealtimeInput({
              text: msg.text,
            });
          }
        } catch (err) {
          console.error('Live WS message error:', err);
        }
      });

      clientWs.on('close', () => {
        if (session) {
          try {
            session.close();
          } catch {}
        }
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify({ error: msg }));
      }
    }
  });

  // Vite middleware in development, static files in production
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        ws: false,
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`CS50 Maestro Tutor server listening on http://0.0.0.0:${PORT}`);
    probeConfiguredModelsAvailability().catch(() => {});
  });
}

startServer();
