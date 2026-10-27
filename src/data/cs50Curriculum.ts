export interface CS50Module {
  id: string;
  weekLabel: string;
  title: string;
  subtitle: string;
  videoUrl: string;
  youtubeId: string;
  language: 'python' | 'c' | 'javascript' | 'sql';
  verifiedTopics: string;
  realWorldUseCase: string;
  feynmanPrompt: string;
  starterChallengeTitle: string;
  starterCode: string;
  isAiExtension?: boolean;
}

export const INITIAL_CLASS_0_WELCOME = `¡Bienvenido a **CS50 Maestro Tutor**!

A partir de hoy trabajarás conmigo como tu mentor personal de programación, combinando el rigor y la energía de **David J. Malan (CS50x de Harvard)**, la **técnica Feynman** y el **aprendizaje activo**.

### Cómo trabajaremos (Confirmación de tu punto de partida y meta)
- **Partes desde cero**: No necesitas conocimientos previos. Mi prioridad absoluta es que aprendas a **pensar como programador** (resolver problemas con lógica y criterio propio), no que memorices sintaxis ni que dependas de la IA para que te escriba el código.
- **Tu objetivo final**: Construir aplicaciones reales, automatizaciones y soluciones de **Inteligencia Artificial** entendiendo qué ocurre por debajo.
- **Sesiones diarias de 2 horas**: Divididas en recuperación activa (10 min), concepto nuevo y vídeo (20 min), práctica guiada (40 min), reto práctico (35 min) y cierre Feynman con registro de progreso (15 min).
- **Ciclo obligatorio de 4 niveles**: Cada concepto pasará por *1. Comprensión*, *2. Construcción*, *3. Aplicación* y *4. Dominio*. **Nunca resolveré los ejercicios por ti**: si te bloqueas, te guiaré con pistas graduales y preguntas socráticas.

### Ruta Resumida (De Cero a Ingeniería de IA)
1. **Fundamentos y Pensamiento Computacional** (Clase 0: Algoritmos, binario, abstracción).
2. **Bajo nivel y rigor mental en C** (Clases 1 a 5: Condiciones, 'loops', 'arrays', eficiencia algorítmica O(n), memoria, 'pointers' y estructuras de datos).
3. **Alto nivel, Datos y Web** (Clases 6 a 9: 'Python', 'SQL', 'HTML/CSS/JS', 'Flask', 'APIs' y 'JSON').
4. **Inteligencia Artificial y Automatización Aplicada** (Clase Especial IA + Proyectos Guiados: Modelos de lenguaje, llamadas a APIs, persistencia, evaluación de costes/límites y proyecto final).

---

📺 **RECURSO DE VÍDEO**

**Tema:** Pensamiento Computacional y Algoritmos (Clase 0)

**Vídeo recomendado:** https://www.youtube.com/watch?v=nfYOp3_SyqM

**Qué estudiar:** Representación de información (sistema binario y ASCII), qué es un algoritmo como caja negra entre 'input' y 'output', el ejemplo clásico de buscar un nombre en una guía telefónica (búsqueda lineal vs. dividir a la mitad) y cómo expresar soluciones en 'pseudocode'. *(Contenido verificado del programa introductorio de CS50x; revisa la primera mitad de la clase para la demostración de la guía telefónica).*

---

### Nivel 1. Comprensión: ¿Qué es realmente un Algoritmo?

Antes de tocar un solo lenguaje de programación, piensa en una computadora como una máquina extremadamente rápida pero completamente literal: **no intuye nada**.

Un **algoritmo** ('algorithm') no es más que una secuencia de instrucciones paso a paso, precisas y sin ambigüedad, para transformar una entrada ('input') en un resultado ('output').

Imagina la analogía clásica de David J. Malan en la Clase 0: tienes una **guía telefónica física de 1.000 páginas** ordenada alfabéticamente de la A a la Z, y buscas a **"John Harvard"**.
- **Enfoque A**: Abres la página 1, miras si está John Harvard. Si no, pasas a la página 2, luego a la 3, una por una.
- **Enfoque B**: Abres el libro exactamente por la mitad (página 500). Ves la letra "M". Como sabes que la "J" va *antes* que la "M", descartas de golpe las 500 páginas de la derecha y vuelves a dividir por la mitad las 500 páginas que te quedan.

### Primer Ejercicio (Sin código)
Supón que el año que viene la guía telefónica crece el doble y pasa de tener **1.000 páginas a 2.000 páginas**.

**Pregunta única para ti:**
En el peor de los casos, ¿cuántos pasos adicionales tendrás que dar con el **Enfoque A** frente a cuántos pasos adicionales necesitarás con el **Enfoque B** para encontrar a alguien en esa nueva guía de 2.000 páginas?`;

export const CS50_MODULES: CS50Module[] = [
  {
    id: 'module-0',
    weekLabel: 'Clase 0',
    title: 'Pensamiento Computacional, Algoritmos y Scratch',
    subtitle: 'Representación binaria, abstracción, pseudocode y eficiencia intuitiva',
    videoUrl: 'https://www.youtube.com/watch?v=nfYOp3_SyqM',
    youtubeId: 'nfYOp3_SyqM',
    language: 'python',
    verifiedTopics:
      'Sistema binario (bits y bytes), representación de texto/color/sonido, definición de algoritmo (input -> algorithm -> output), eficiencia logarítmica con la guía telefónica y estructuras básicas (functions, conditionals, Boolean expressions, loops) en Scratch.',
    realWorldUseCase:
      'Antes de automatizar un proceso empresarial o diseñar un flujo con IA, necesitas descomponer el problema en entradas, reglas de decisión y salidas exactas sin ambigüedades.',
    feynmanPrompt:
      'Explica con tus propias palabras, como si hablaras con alguien que nunca ha usado un ordenador, por qué dividir un problema ordenado por la mitad es radicalmente más rápido que revisar elemento por elemento.',
    starterChallengeTitle: 'Simulador de Pseudocódigo: Búsqueda en Guía Telefónica',
    starterCode: `# Clase 0 — Pensamiento Computacional
# Objetivo: Completa la lógica paso a paso (sin que la IA lo haga por ti)
# Imagina que tenemos páginas numeradas del 1 al 1000 y buscamos la página 342.

low = 1
high = 1000
target = 342
steps = 0

# TODO: Razona qué condición mantiene vivo el bucle mientras queden páginas
# y cómo calculas el punto medio (mid) en cada paso.
print("Iniciando simulación de búsqueda...")
`,
  },
  {
    id: 'module-1',
    weekLabel: 'Clase 1',
    title: 'C, Tipos de Datos, Condiciones, Loops y Funciones',
    subtitle: 'Compilación, variables tipadas, control de flujo y precisión numérica',
    videoUrl: 'https://www.youtube.com/watch?v=ev96qUufJYI',
    youtubeId: 'ev96qUufJYI',
    language: 'c',
    verifiedTopics:
      'Código fuente vs código máquina, compilador, header files (#include <stdio.h>), types (int, float, char, long), conditionals (if/else), loops (while, for), abstracción en functions y límites de memoria (integer overflow, truncamiento).',
    realWorldUseCase:
      'Comprender tipos estáticos y límites numéricos evita errores financieros críticos (redondeo de coma flotante) y bucles infinitos que bloquean servidores en producción.',
    feynmanPrompt:
      'Explica qué diferencia hay entre el código fuente que tú escribes en C y el archivo binario que ejecuta el procesador, y qué papel juega el compilador en medio.',
    starterChallengeTitle: 'Pirámide de Mario y Control de Bucle en C',
    starterCode: `#include <stdio.h>

int main(void)
{
    int height = 4;
    // TODO: Usa bucles (for loops) anidados para imprimir una escalera de '#'
    // Antes de escribir código, piensa: ¿cuántos espacios y cuántos '#' van en la fila i?
    printf("Altura configurada: %d\\n", height);
    return 0;
}
`,
  },
  {
    id: 'module-2',
    weekLabel: 'Clase 2',
    title: 'Arrays, Strings, Argumentos de Línea de Comandos y Criptografía',
    subtitle: 'Memoria contigua, caracteres NUL (\\0), debugging y cifrado clásico',
    videoUrl: 'https://www.youtube.com/watch?v=G7erq8mRYdk',
    youtubeId: 'G7erq8mRYdk',
    language: 'c',
    verifiedTopics:
      'Las 4 fases de compilación (preprocessing, compiling, assembling, linking), herramientas de debugging, arrays en memoria contigua, strings como arrays de char terminados en \\0, argc/argv y bases de criptografía (Caesar/Substitution).',
    realWorldUseCase:
      'Toda entrada de texto, tokenización para modelos de lenguaje (LLMs) y procesamiento de lotes de datos se apoya en recorrer secuencias indexadas sin salirse de sus límites (off-by-one errors).',
    feynmanPrompt:
      '¿Por qué un string en C necesita un byte extra oculto al final (\\0) y qué pasa si intentas leer una posición más allá del tamaño de un array?',
    starterChallengeTitle: 'Inspección de Strings y Desplazamiento de Caracteres',
    starterCode: `#include <stdio.h>

int main(void)
{
    char word[] = "HI!";
    // TODO: Imprime cada carácter y su valor numérico ASCII
    // ¿Qué hay en word[3]? Comprúebalo tú mismo.
    printf("Palabra: %s\\n", word);
    return 0;
}
`,
  },
  {
    id: 'module-3',
    weekLabel: 'Clase 3',
    title: 'Algoritmos: Búsqueda, Ordenamiento, Big O y Recursividad',
    subtitle: 'Linear Search, Binary Search, Bubble/Selection/Merge Sort y Structs',
    videoUrl: 'https://www.youtube.com/watch?v=zU0DbilHvYM',
    youtubeId: 'zU0DbilHvYM',
    language: 'python',
    verifiedTopics:
      'Notación asintótica (Big O, Omega, Theta), Linear Search O(n), Binary Search O(log n), Selection Sort O(n²), Bubble Sort O(n²), tipos personalizados con structs, Recursividad (caso base y caso recursivo) y Merge Sort O(n log n).',
    realWorldUseCase:
      'Cuando tu base de datos o catálogo de documentos para IA crece de 100 a 1.000.000 de registros, un algoritmo cuadrático O(n²) hace colapsar tu aplicación mientras que uno O(n log n) u O(log n) responde en milisegundos.',
    feynmanPrompt:
      'Explica por qué toda función recursiva necesita obligatoriamente un "base case" (caso base) y qué ocurre en la memoria (call stack) si lo olvidas.',
    starterChallengeTitle: 'Comparador Empírico de Pasos: Lineal vs Binario',
    starterCode: `# Clase 3 — Eficiencia Algorítmica y Recursividad
# Analiza cuántos pasos toma encontrar un elemento en una lista ordenada

def linear_search_steps(arr, target):
    steps = 0
    # TODO: Recorre arr y cuenta cuántos pasos necesitas hasta hallar target
    return steps

numbers = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
print("Pasos para buscar 72:", linear_search_steps(numbers, 72))
`,
  },
  {
    id: 'module-4',
    weekLabel: 'Clase 4',
    title: 'Memoria, Punteros, Direcciones y Gestión Dinámica',
    subtitle: 'Hexadecimal, & y *, malloc/free, buffer overflow, stack vs heap',
    videoUrl: 'https://www.youtube.com/watch?v=xRW70LgrEho',
    youtubeId: 'xRW70LgrEho',
    language: 'c',
    verifiedTopics:
      'Sistema hexadecimal (0x...), direcciones de memoria (&) e indirección (*), punteros (pointers), aritmética de punteros, comparación de strings vs direcciones, asignación dinámica con malloc y liberación con free, valgrind, garbage values y el stack vs heap.',
    realWorldUseCase:
      'Entender referencias de memoria explica por qué al modificar una lista o diccionario dentro de una función en Python o JavaScript puedes alterar accidentalmente el objeto original en toda tu app.',
    feynmanPrompt:
      'Usa la analogía de un buzón de correo y su dirección postal para explicar la diferencia entre una variable normal, un puntero (int *p) y desreferenciar ese puntero (*p).',
    starterChallengeTitle: 'Intercambio por Valor vs Referencia (Swap)',
    starterCode: `#include <stdio.h>

int main(void)
{
    int a = 10;
    int b = 20;
    // TODO: Razona por qué hacer swap en una función sin punteros solo cambia copias locales.
    printf("Antes: a = %d, b = %d\\n", a, b);
    return 0;
}
`,
  },
  {
    id: 'module-5',
    weekLabel: 'Clase 5',
    title: 'Estructuras de Datos: Listas Enlazadas, Hash Tables y Árboles',
    subtitle: 'Queues, Stacks, Linked Lists, Binary Search Trees, Hash Functions y Tries',
    videoUrl: 'https://www.youtube.com/watch?v=Q0xvQT87ekA',
    youtubeId: 'Q0xvQT87ekA',
    language: 'python',
    verifiedTopics:
      'Estructuras abstractas (Queues FIFO, Stacks LIFO), redimensionar arrays vs Singly Linked Lists, Binary Search Trees (BST), Hash Tables y colisiones, Tries y el equilibrio fundamental entre tiempo de CPU y consumo de memoria.',
    realWorldUseCase:
      'Los diccionarios de Python y objetos JSON que usarás todos los días con APIs de IA son Hash Tables por debajo; saber cómo funcionan te permite indexar datos en O(1).',
    feynmanPrompt:
      '¿Qué ventaja y qué desventaja tiene una Linked List frente a un Array tradicional en cuanto a inserción de datos y búsqueda aleatoria?',
    starterChallengeTitle: 'Simulación de Tabla Hash y Colisiones',
    starterCode: `# Clase 5 — Estructuras de Datos
# Diseña una función hash sencilla para palabras y observa cuándo ocurren colisiones

def simple_hash(word, bucket_count=10):
    # TODO: Calcula un índice entre 0 y bucket_count - 1 a partir de los caracteres de word
    return 0

words = ["apple", "banana", "avocado", "blueberry"]
for w in words:
    print(w, "-> bucket:", simple_hash(w))
`,
  },
  {
    id: 'module-6',
    weekLabel: 'Clase 6',
    title: 'Python: De C a Alto Nivel, Librerías y Manejo de Excepciones',
    subtitle: 'Sintaxis expresiva, dicts, lists, comprenhensions, try/except y módulos',
    videoUrl: 'https://www.youtube.com/watch?v=N3zVFYQu3bU',
    youtubeId: 'N3zVFYQu3bU',
    language: 'python',
    verifiedTopics:
      'Traducción conceptual de C a Python, tipado dinámico, listas, tuplas, diccionarios (hash tables nativas), manejo de excepciones (try/except), lectura de archivos CSV y uso de librerías estándar.',
    realWorldUseCase:
      'Python es la lengua franca de la automatización, ciencia de datos e ingeniería de IA. Aquí conectas tu base sólida de lógica y memoria con productividad real.',
    feynmanPrompt:
      'Si Python gestiona la memoria y los tipos automáticamente por ti, ¿por qué fue tan valioso que aprendieras primero C, punteros y estructuras de datos?',
    starterChallengeTitle: 'Procesador de Datos y Frecuencia con Diccionarios',
    starterCode: `# Clase 6 — Python Aplicado
# Cuenta la frecuencia de palabras clave en un registro de soporte sin usar librerías externas aún

logs = ["error_auth", "ok", "timeout", "error_auth", "ok", "error_db", "error_auth"]
counts = {}

# TODO: Recorre logs y actualiza el diccionario counts para cada evento
print("Frecuencias calculadas:", counts)
`,
  },
  {
    id: 'module-7',
    weekLabel: 'Clase 7',
    title: 'SQL, Bases de Datos Relacionales y Prevención de SQL Injection',
    subtitle: 'Tablas, Primary/Foreign Keys, JOINs, índices y consultas seguras',
    videoUrl: 'https://www.youtube.com/watch?v=VnfMRaZUSrc',
    youtubeId: 'VnfMRaZUSrc',
    language: 'sql',
    verifiedTopics:
      'De archivos planos CSV a bases de datos relacionales (SQLite), operaciones CRUD (CREATE, SELECT, INSERT, UPDATE, DELETE), agregaciones (COUNT, AVG, GROUP BY), relaciones (Primary Key, Foreign Key, JOIN), índices B-Tree, condiciones de carrera y SQL Injection.',
    realWorldUseCase:
      'Toda aplicación seria de IA o automatización necesita persistir usuarios, historiales, logs y métricas en bases de datos estructuradas y consultarlas sin vulnerabilidades de inyección.',
    feynmanPrompt:
      'Explica qué es un ataque de SQL Injection y por qué concatenar texto del usuario directamente dentro de una consulta SQL es peligroso.',
    starterChallengeTitle: 'Consultas Relacionales en el Sandbox SQL',
    starterCode: `-- Clase 7 — SQL Relacional
-- La base de datos de prueba tiene las tablas:
-- students (id, name, house, grade) y courses (id, title, week)
-- TODO: Escribe una consulta que filtre estudiantes con grade >= 90 ordenados de mayor a menor.

SELECT name, house, grade FROM students;
`,
  },
  {
    id: 'module-8',
    weekLabel: 'Clase 8',
    title: 'HTML, CSS, JavaScript y el Modelo Cliente-Servidor (HTTP)',
    subtitle: 'TCP/IP, DNS, HTTP status codes, DOM y eventos asíncronos en el navegador',
    videoUrl: 'https://www.youtube.com/watch?v=3Ph5G_sfrFM',
    youtubeId: '3Ph5G_sfrFM',
    language: 'javascript',
    verifiedTopics:
      'Cómo funciona Internet (routers, TCP/IP, DNS, HTTP GET/POST, códigos 200/404/500), estructura semántica HTML, diseño en CSS y manipulación dinámica del DOM con JavaScript y eventos.',
    realWorldUseCase:
      'Para ofrecer tus herramientas de IA a usuarios reales o clientes, debes comprender cómo el navegador envía peticiones HTTP a un servidor y actualiza la interfaz.',
    feynmanPrompt:
      'Describe qué ocurre exactamente desde que escribes una dirección web en tu navegador hasta que ves la página en pantalla (DNS, petición HTTP, código de estado y renderizado DOM).',
    starterChallengeTitle: 'Transformación de Payloads JSON en JavaScript',
    starterCode: `// Clase 8 — JavaScript y Manipulación de Datos
// Simula la validación de un formulario antes de enviarlo por HTTP POST

const payload = {
  username: "  raudel_cs50  ",
  score: "95"
};

// TODO: Limpia los espacios de username, convierte score a número entero y valida que esté entre 0 y 100
console.log("Payload inicial:", payload);
`,
  },
  {
    id: 'module-9',
    weekLabel: 'Clase 9',
    title: 'Flask, Backend, APIs, Formularios y Sesiones',
    subtitle: 'Arquitectura MVC, rutas dinámicas, validación en servidor, JSON y cookies',
    videoUrl: 'https://www.youtube.com/watch?v=i_GmZgveqpw',
    youtubeId: 'i_GmZgveqpw',
    language: 'python',
    verifiedTopics:
      'Del contenido estático al backend dinámico con Python y Flask, rutas (@app.route), parámetros GET vs POST, validación en el servidor (nunca confiar solo en el cliente), sesiones/cookies y creación de endpoints que devuelven JSON.',
    realWorldUseCase:
      'El backend es donde proteges tus claves de API (variables de entorno), conectas con la base de datos y orquestas llamadas a modelos de IA de forma segura.',
    feynmanPrompt:
      '¿Por qué nunca debes validar los datos de un usuario únicamente en el navegador (JavaScript) ni guardar claves privadas de API en el código frontend?',
    starterChallengeTitle: 'Validador de Endpoint Backend y Sanitización',
    starterCode: `# Clase 9 — Lógica de Servidor y Validación de Peticiones
def validate_api_request(request_body):
    # TODO: Comprueba que request_body sea un dict, contenga 'prompt' no vacío
    # y que no supere los 500 caracteres. Devuelve (es_valido, mensaje).
    return False, "Pendiente de implementar"

test_req = {"prompt": "Explica qué es una API REST"}
print(validate_api_request(test_req))
`,
  },
  {
    id: 'module-10',
    weekLabel: 'Clase Especial IA',
    title: 'Fundamentos de IA, Modelos de Lenguaje, APIs y Límites',
    subtitle: 'Árboles de decisión, Minimax, Machine Learning, LLMs, Embeddings y Prompting',
    videoUrl: 'https://www.youtube.com/watch?v=MTSE0ZOpyDc',
    youtubeId: 'MTSE0ZOpyDc',
    language: 'python',
    verifiedTopics:
      'Búsqueda y juegos (Minimax), aprendizaje automático supervisado y por refuerzo, redes neuronales, Transformers, predicción estadística de tokens en Large Language Models (LLMs), embeddings vectoriales, alucinaciones y diferencia entre entrenar un modelo vs consumir una API de IA.',
    realWorldUseCase:
      'Diferenciar cuándo un problema requiere una regla determinista en Python/SQL y cuándo aporta valor un modelo generativo, controlando alucinaciones, latencia y coste por token.',
    feynmanPrompt:
      'Explica claramente cuál es la diferencia entre entrenar un modelo de IA desde cero y consumir un modelo mediante una API en tu aplicación, y por qué un LLM puede "alucinar" datos falsos con total seguridad.',
    starterChallengeTitle: 'Calculadora de Costes de Tokens y Validador de Esquema',
    starterCode: `# Clase Especial IA — Control de Tokens y Validación de Salida Estructurada
# Un ingeniero de IA no confía ciegamente en la respuesta del modelo: la valida.

raw_llm_output = '{"category": "billing", "confidence": 0.92}'

# TODO: Parsea el JSON con json.loads, verifica que existan las claves requeridas
# y que confidence sea un float entre 0.0 y 1.0.
import json
print("Salida cruda del modelo:", raw_llm_output)
`,
    isAiExtension: true,
  },
  {
    id: 'module-11',
    weekLabel: 'Clase 10 + Proyectos IA',
    title: 'Arquitectura Práctica: Automatizaciones, Integración de APIs y Proyecto Final',
    subtitle: 'Orquestación Python + SQL + APIs + IA, manejo de errores, retries y despliegue',
    videoUrl: 'https://www.youtube.com/watch?v=AUnI1XwWj-g',
    youtubeId: 'AUnI1XwWj-g',
    language: 'python',
    verifiedTopics:
      'Síntesis de CS50x (C, Python, SQL, Web) y ampliación formativa de ingeniería de IA: diseño de pipelines de automatización, variables de entorno (.env), reintentos con exponential backoff, structured outputs, function calling y arquitectura del proyecto final.',
    realWorldUseCase:
      'Construir tus propios sistemas completos: desde un clasificador y automatizador de tareas conectado a base de datos hasta un agente con herramientas verificadas.',
    feynmanPrompt:
      'Antes de escribir la primera línea de código de un proyecto propio con IA, ¿qué decisiones de arquitectura (datos, flujo de errores, seguridad de claves y validación) debes definir en papel?',
    starterChallengeTitle: 'Pipeline de Automatización con Retry y Persistencia',
    starterCode: `# Clase 10 y Proyectos Guiados de IA
# Diseña la estructura de un pipeline que procesa entradas, maneja errores y registra resultados

def process_automation_item(item):
    # TODO: Implementa validación de entrada, transformación y estructura de respuesta auditable
    return {"status": "pending", "item": item}

items = [{"id": 1, "Task": "Resumen diario"}, {"id": 2, "Task": ""}]
for it in items:
    print(process_automation_item(it))
`,
    isAiExtension: true,
  },
];

export interface GuidedAiProject {
  id: string;
  phase: string;
  title: string;
  prerequisiteModules: string[];
  architectureSummary: string;
  technicalDecisions: string[];
  socraticMilestones: string[];
}

export const GUIDED_AI_PROJECTS: GuidedAiProject[] = [
  {
    id: 'proj-1',
    phase: 'Proyecto Guiado 1 · Nivel Intermedio (Tras Clases 0–7)',
    title: 'CLI de Automatización y Auditoría de Datos con Python + SQLite',
    prerequisiteModules: ['module-0', 'module-6', 'module-7'],
    architectureSummary:
      'Script modular en Python que ingiere archivos CSV/JSON, limpia anomalías, almacena registros normalizados en SQLite mediante consultas parametrizadas y genera reportes estadísticos.',
    technicalDecisions: [
      '¿Qué esquema de tablas evita duplicidad de registros?',
      '¿Cómo manejar filas corruptas sin detener todo el proceso por lotes?',
      '¿Cómo garantizar cero riesgo de SQL Injection con placeholders (?)?',
    ],
    socraticMilestones: [
      'Hito 1: Definir el esquema CREATE TABLE y justificar cada tipo de dato.',
      'Hito 2: Implementar el parser de archivos con bloques try/except específicos.',
      'Hito 3: Escribir las consultas de agregación y verificar casos límite (archivos vacíos).',
    ],
  },
  {
    id: 'proj-2',
    phase: 'Proyecto Guiado 2 · Nivel Avanzado (Tras Clases 8–10)',
    title: 'Microservicio Backend con Salidas Estructuradas de IA y Caché SQL',
    prerequisiteModules: ['module-6', 'module-7', 'module-9', 'module-10'],
    architectureSummary:
      'API HTTP que recibe textos o tickets no estructurados, verifica primero en una base de datos SQL si ya fueron procesados (ahorro de costes y latencia), y si no, consulta un LLM exigiendo un JSON Schema estricto.',
    technicalDecisions: [
      '¿Cómo proteger la API Key usando variables de entorno en el servidor?',
      '¿Qué ocurre si la API externa devuelve un error 429 (Rate Limit) o 500?',
      '¿Cómo calcular un hash SHA-256 del prompt para usarlo como clave de caché en SQL?',
    ],
    socraticMilestones: [
      'Hito 1: Construir el endpoint HTTP y validar el payload de entrada.',
      'Hito 2: Implementar la capa de caché en base de datos y medir el ahorro de llamadas.',
      'Hito 3: Integrar la validación del esquema JSON devuelto por el modelo y manejar fallos.',
    ],
  },
  {
    id: 'proj-3',
    phase: 'Proyecto Guiado 3 · Capstone Final (Dominio Integral)',
    title: 'Agente de Automatización con Function Calling y Flujos Verificados',
    prerequisiteModules: ['module-5', 'module-9', 'module-10', 'module-11'],
    architectureSummary:
      'Sistema completo donde un modelo de lenguaje analiza una solicitud del usuario, decide qué función local invocar (consultar SQL, programar evento o calcular métricas), ejecuta la acción de forma controlada y registra una traza auditable.',
    technicalDecisions: [
      '¿Qué funciones debe poder ejecutar el modelo de forma autónoma y cuáles exigen confirmación humana?',
      '¿Cómo evitar bucles infinitos de llamadas a herramientas (max_iterations)?',
      '¿Cómo evaluar la precisión del sistema con una batería de 10 casos de prueba?',
    ],
    socraticMilestones: [
      'Hito 1: Diseñar las declaraciones de funciones (Function Declarations) con tipos estrictos.',
      'Hito 2: Programar el despachador seguro (dispatcher) en Python/TypeScript.',
      'Hito 3: Construir el panel de observabilidad de errores, latencia y coste estimado.',
    ],
  },
];

export interface TechStepGuide {
  number: number;
  name: string;
  status: 'active_in_app' | 'ready_with_user_setup';
  scopeClassification: string;
  summary: string;
  steps: string[];
  codeSnippet: string;
  whereInApp: string;
}

export const EIGHT_TECH_GUIDES: TechStepGuide[] = [
  {
    number: 1,
    name: 'Gemini API (@google/genai Server-Side Socratic Tutor)',
    status: 'active_in_app',
    scopeClassification: 'Implementado en servidor (server.ts)',
    summary: 'Integrado en el backend Express (server.ts) con instrucciones de sistema socráticas, historial de conversación y modelos especializados sin exponer la API Key al cliente.',
    steps: [
      'Instalar el SDK oficial: npm install @google/genai.',
      'Inicializar en el servidor: const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }).',
      'Configurar systemInstruction con reglas socráticas (explicar en español, código en inglés, prohibido resolver ejercicios, 1 pregunta por turno).',
      'Enviar el historial de conversación (contents) para mantener el contexto entre turnos.',
    ],
    codeSnippet: `const response = await ai.models.generateContent({
  model: "gemini-3.8-flash",
  contents: conversationContents,
  config: {
    systemInstruction: CS50_SYSTEM_INSTRUCTION,
  },
});`,
    whereInApp: 'Pestaña Tutor Socrático (selector de motor IA), Tutor por Voz en Vivo y Analizador de Vídeo.',
  },
  {
    number: 2,
    name: 'Structured Outputs (JSON Schema Estricto en Gemini API)',
    status: 'active_in_app',
    scopeClassification: 'Implementado en servidor (/api/gemini/tutor)',
    summary: 'Cada respuesta del tutor socrático devuelve un objeto JSON validado por esquema que separa la respuesta pedagógica de los metadatos de evaluación adaptativa.',
    steps: [
      'Importar Type desde @google/genai en el backend (server.ts).',
      'En config, definir responseMimeType: "application/json" y responseSchema con Type.OBJECT.',
      'Declarar propiedades tipadas: socraticReply (STRING), singleQuestion (STRING), detectedLevel (INTEGER 1-4), passedCurrentLevel (BOOLEAN), hintGiven (BOOLEAN), errorDetected (BOOLEAN), errorCategory (STRING) y recommendedIntervalDays (INTEGER).',
      'Parsear response.text con JSON.parse() y actualizar la interfaz y Firestore de forma determinista.',
    ],
    codeSnippet: `config: {
  systemInstruction: CS50_SYSTEM_INSTRUCTION,
  responseMimeType: "application/json",
  responseSchema: {
    type: Type.OBJECT,
    properties: {
      socraticReply: { type: Type.STRING },
      singleQuestion: { type: Type.STRING },
      detectedLevel: { type: Type.INTEGER },
      passedCurrentLevel: { type: Type.BOOLEAN },
      errorDetected: { type: Type.BOOLEAN },
      errorCategory: { type: Type.STRING },
      recommendedIntervalDays: { type: Type.INTEGER }
    },
    required: ["socraticReply", "singleQuestion", "detectedLevel", "passedCurrentLevel"]
  }
}`,
    whereInApp: 'Motor principal en /api/gemini/tutor y panel de metadatos estructurados bajo cada mensaje del tutor.',
  },
  {
    number: 3,
    name: 'Function Calling (Herramientas del Tutor con Gemini API)',
    status: 'active_in_app',
    scopeClassification: 'Implementado en servidor + cliente',
    summary: 'Permite a Gemini invocar funciones de la aplicación cuando detecta que superaste un nivel, cometiste un error recurrente o necesitas una plantilla en el sandbox.',
    steps: [
      'Definir objetos FunctionDeclaration (advanceMasteryLevel, recordRecurrentError, scheduleSpacedRepetition, loadSandboxExercise) usando Type.OBJECT.',
      'Pasar las declaraciones en config: { tools: [{ functionDeclarations: tutorFunctionDeclarations }] }.',
      'Inspeccionar response.functionCalls en la respuesta del modelo.',
      'Ejecutar la función local correspondiente (actualizar estado en React y persistir en Cloud Firestore).',
    ],
    codeSnippet: `const advanceLevelTool: FunctionDeclaration = {
  name: "advanceMasteryLevel",
  description: "Actualiza el nivel (1 a 4) cuando el alumno demuestra comprensión.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      moduleId: { type: Type.STRING },
      newLevel: { type: Type.INTEGER },
      status: { type: Type.STRING }
    },
    required: ["moduleId", "newLevel", "status"]
  }
};`,
    whereInApp: 'Modo "Search Grounding + Function Calling" en el Tutor Socrático.',
  },
  {
    number: 4,
    name: 'Firebase Authentication (Google Sign-In)',
    status: 'active_in_app',
    scopeClassification: 'Implementado y provisionado (src/firebase.ts)',
    summary: 'Autenticación de usuarios mediante Google Sign-In con popup compatible con el entorno iframe de AI Studio.',
    steps: [
      'Provisionar el proyecto Firebase y cargar firebase-applet-config.json.',
      'Inicializar getAuth(app) y configurar GoogleAuthProvider().',
      'Invocar signInWithPopup(auth, provider) desde el botón de inicio de sesión.',
      'Escuchar cambios de sesión con onAuthStateChanged para cargar automáticamente el perfil y progreso del alumno.',
    ],
    codeSnippet: `const provider = new GoogleAuthProvider();
const result = await signInWithPopup(auth, provider);
onAuthStateChanged(auth, (user) => {
  if (user) ensureUserProfile(user);
});`,
    whereInApp: 'Botón "Sign in with Google" en la barra superior.',
  },
  {
    number: 5,
    name: 'Cloud Firestore (Persistencia de Sesiones, Ejercicios y Errores)',
    status: 'active_in_app',
    scopeClassification: 'Implementado con reglas Zero-Trust desplegadas',
    summary: 'Almacena temas estudiados, conceptos dominados/en proceso, ejercicios completados, errores recurrentes, pistas usadas y el historial de sesión para reanudar en cualquier momento.',
    steps: [
      'Modelar las colecciones en firebase-blueprint.json (/users, /topicProgress, /errorRecords, /tutorSessions).',
      'Escribir y auditar reglas de seguridad estrictas en firestore.rules verificando request.auth.uid y esquemas.',
      'Suscribirse en tiempo real con onSnapshot(query(collection(db, "topicProgress"), where("ownerId", "==", user.uid))).',
      'Restaurar automáticamente la última conversación guardada en /tutorSessions al iniciar sesión.',
    ],
    codeSnippet: `const q = query(collection(db, "topicProgress"), where("ownerId", "==", user.uid));
onSnapshot(q, (snapshot) => {
  // Sincroniza temas dominados, intentos, pistas e intervalos SRS
});`,
    whereInApp: 'Pestaña Memoria & SRS y restauración automática al iniciar sesión.',
  },
  {
    number: 6,
    name: 'Code Execution / Sandboxed Code Runner',
    status: 'active_in_app',
    scopeClassification: 'Implementado en servidor (/api/code/run)',
    summary: 'Entorno de ejecución aislado en el backend para Python 3, C, JavaScript y SQLite con límite de ejecución de 5 segundos.',
    steps: [
      'Crear un directorio temporal efímero por petición usando fs.mkdtemp(path.join(os.tmpdir(), "cs50-sandbox-")).',
      'Ejecutar el código en un proceso hijo aislado con execFile y timeout: 5000ms.',
      'Capturar stdout, stderr, exitCode y limpiar el directorio temporal en el bloque finally.',
    ],
    codeSnippet: `const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "cs50-sandbox-"));
const result = await execFileAsync("python3", ["-I", filePath], {
  cwd: tmpDir,
  timeout: 5000
});`,
    whereInApp: 'Pestaña Laboratorio de Código & Depuración Socrática.',
  },
  {
    number: 7,
    name: 'Google Search Grounding for Gemini',
    status: 'active_in_app',
    scopeClassification: 'Implementado en servidor (/api/gemini/tutor)',
    summary: 'Conecta Gemini con Google Search en tiempo real para verificar documentación técnica oficial y contenidos de CS50 sin inventar enlaces.',
    steps: [
      'Añadir { googleSearch: {} } en el arreglo tools de ai.models.generateContent.',
      'Para usarlo junto con Function Calling en modelos Gemini 3/4, activar toolConfig: { includeServerSideToolInvocations: true }.',
      'Extraer las citas y URLs verificadas desde response.candidates?.[0]?.groundingMetadata?.groundingChunks.',
      'Renderizar los enlaces web verificados debajo de la respuesta del tutor.',
    ],
    codeSnippet: `const response = await ai.models.generateContent({
  model: "gemini-3.8-flash",
  contents: conversationContents,
  config: {
    tools: [{ googleSearch: {} }, { functionDeclarations }],
    toolConfig: { includeServerSideToolInvocations: true }
  }
});
const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;`,
    whereInApp: 'Modo "Search Grounding + Function Calling" en el Tutor Socrático.',
  },
  {
    number: 8,
    name: 'GitHub Integration (Guardado de Snippets / Gists y Versionado)',
    status: 'ready_with_user_setup',
    scopeClassification: 'Gist API + OAuth Popup implementados · Claves OAuth de usuario opcionales',
    summary: 'Permite guardar tus fragmentos de código y registro Markdown en un GitHub Gist privado. El versionado Git completo de repositorios multi-rama se plantea como tarea de fase posterior cuando completes los fundamentos.',
    steps: [
      'Opción A (Inmediata): Generar un Personal Access Token (con permiso "gist") en GitHub y pegarlo en la pestaña Memoria & SRS para exportar tu código y progreso en 1 clic.',
      'Opción B (OAuth Popup): Crear una OAuth App en https://github.com/settings/developers.',
      'Configurar el Authorization callback URL con la URL exacta del contenedor (/auth/github/callback).',
      'Añadir GITHUB_CLIENT_ID y GITHUB_CLIENT_SECRET en Settings > Secrets. (Tarea futura opcional: commits directos a ramas de repositorios mediante la API REST /repos/{owner}/{repo}/contents).',
    ],
    codeSnippet: `// Exportación directa a GitHub Gist (/api/github/export-gist)
const gistRes = await fetch("https://api.github.com/gists", {
  method: "POST",
  headers: {
    Authorization: \`Bearer \${activeToken}\`,
    Accept: "application/vnd.github+json"
  },
  body: JSON.stringify({
    description: "CS50 Maestro Tutor — Progreso y Código",
    public: false,
    files: { "CS50_PROGRESO.md": { content } }
  })
});`,
    whereInApp: 'Pestaña Memoria & SRS (sección Exportar a GitHub Gist) y pestaña Arquitectura & Paso a Paso.',
  },
];
