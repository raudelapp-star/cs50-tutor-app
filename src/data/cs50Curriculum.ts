export interface SimpleVideoConcept {
  chapterTitle: string;
  analogyTitle: string;
  paragraphs: string[];
}

export interface OfficialCS50Exercise {
  title: string;
  notesUrl: string;
  psetUrl: string;
  goal: string;
  specs: string[];
  usageExample?: string;
  check50: string;
  submit50: string;
}

export interface MicroExercise {
  id: string;
  title: string;
  duration: string;
  prompt: string;
  language: 'c' | 'python' | 'sql' | 'javascript' | 'scratch';
  starterCode: string;
  solutionCode: string;
  solutionExplanation: string;
}

export interface VideoChapter {
  id: string;
  chapterNumber: number;
  title: string;
  timeRange: string;
  startSeconds: number;
  summary: string;
  microExercises: MicroExercise[];
}

export interface CS50Module {
  id: string;
  weekLabel: string;
  title: string;
  subtitle: string;
  videoUrl: string;
  youtubeId: string;
  language: 'scratch' | 'python' | 'c' | 'javascript' | 'sql';
  verifiedTopics: string;
  realWorldUseCase: string;
  feynmanPrompt: string;
  starterChallengeTitle: string;
  starterCode: string;
  officialExercise: OfficialCS50Exercise;
  simpleVideoExplanations: SimpleVideoConcept[];
  allowedConceptsConstraint: string;
  chapters: VideoChapter[];
  isAiExtension?: boolean;
}

export const INITIAL_CLASS_0_WELCOME = `¡Bienvenido a **CS50 en Español — Harvard**!`;

export const CS50_MODULES: CS50Module[] = [
  {
    id: 'module-0',
    weekLabel: 'Clase 0',
    title: 'Pensamiento Computacional, Algoritmos y Scratch',
    subtitle: 'Binario con bombillas, guía telefónica y bloques visuales en Scratch',
    videoUrl: 'https://www.youtube.com/watch?v=nfYOp3_SyqM',
    youtubeId: 'nfYOp3_SyqM',
    language: 'c',
    verifiedTopics:
      'Sistema binario (interruptores encendido/apagado), representación de letras (ASCII), colores (RGB) y sonido, qué es un algoritmo (la guía telefónica de David J. Malan) y programación visual con bloques en Scratch (eventos, bucles, condiciones y variables).',
    realWorldUseCase:
      'Aprender a pensar paso a paso encajando piezas lógicas como si fueran bloques de LEGO, sin preocuparte todavía por puntos y comas ni errores de escritura.',
    feynmanPrompt:
      '¿Cómo combinarías un bloque de evento con un bloque de bucle en Scratch para que tu personaje se mueva continuamente?',
    starterChallengeTitle: 'Problem Set 0: Proyecto Interactivo en Scratch',
    starterCode: `// En la Clase 0 los ejercicios se realizan en la plataforma visual de Scratch (scratch.mit.edu).
// Este editor de código se activará con compilador y terminal a partir de la Clase 1 con el Lenguaje C.

#include <stdio.h>

int main(void)
{
    printf("Hola, CS50 en Español\\n");
    return 0;
}
`,
    allowedConceptsConstraint:
      'SOLO puedes hablar de lo visto en la Clase 0: bombillas/binario, ASCII, colores RGB, el ejemplo de romper la guía telefónica por la mitad y bloques visuales de Scratch (Al hacer clic en bandera verde, Por siempre, Repetir, Si... entonces, Variables de puntos/vidas, Enviar mensaje/broadcast y sprites). PROHIBIDO mencionar código escrito en Python, C, while, for o funciones en texto.',
    chapters: [
      {
        id: 'c0-ch1',
        chapterNumber: 1,
        title: 'Sistema Binario, Bits y Bombillas',
        timeRange: '00:00 - 00:35',
        startSeconds: 0,
        summary: 'Cómo los ordenadores representan información únicamente con interruptores de encendido (1) y apagado (0), formando bytes para letras (ASCII) y píxeles (RGB).',
        microExercises: [
          {
            id: 'm0-ex1',
            title: 'Cálculo de Bits a Decimal (8 Bombillas)',
            duration: '5 min',
            prompt: 'En el vídeo David Malan enciende 3 bombillas: la de valor 4, la de valor 2 y la de valor 1 (binario 00000111). Calcula e imprime el valor decimal total usando C.',
            language: 'c',
            starterCode: `#include <stdio.h>

int main(void)
{
    // Las 3 bombillas activas tienen pesos: 4, 2 y 1
    int b2 = 4;
    int b1 = 2;
    int b0 = 1;

    // TODO: Suma las tres variables y muestra "Valor decimal: %d\\n"
    int total = 0;

    printf("Valor decimal: %d\\n", total);
    return 0;
}
`,
            solutionCode: `#include <stdio.h>

int main(void)
{
    int b2 = 4;
    int b1 = 2;
    int b0 = 1;

    int total = b2 + b1 + b0;

    printf("Valor decimal: %d\\n", total);
    return 0;
}
`,
            solutionExplanation: '1. Cada posición binaria representa una potencia de 2: 2^2=4, 2^1=2, 2^0=1.\n2. La suma 4 + 2 + 1 = 7 corresponde al número binario 111.\n3. printf sustituye %d por el valor de la variable total.'
          }
        ]
      },
      {
        id: 'c0-ch2',
        chapterNumber: 2,
        title: 'Algoritmos y la Guía Telefónica',
        timeRange: '00:35 - 01:05',
        startSeconds: 2100,
        summary: 'David Malan busca un nombre rompiendo una guía telefónica de 1000 páginas a la mitad en cada paso, ilustrando la búsqueda binaria (dividir para vencer).',
        microExercises: [
          {
            id: 'm0-ex2',
            title: 'Dividir a la Mitad (Divide and Conquer)',
            duration: '5 min',
            prompt: 'Simula el primer corte de la guía telefónica: calcula la página del medio entre la página 1 y la página 1000 e imprímela.',
            language: 'c',
            starterCode: `#include <stdio.h>

int main(void)
{
    int min_page = 1;
    int max_page = 1000;

    // TODO: Calcula la página media sumando min y max y dividiendo entre 2
    int middle_page = 0;

    printf("Página central: %d\\n", middle_page);
    return 0;
}
`,
            solutionCode: `#include <stdio.h>

int main(void)
{
    int min_page = 1;
    int max_page = 1000;

    int middle_page = (min_page + max_page) / 2;

    printf("Página central: %d\\n", middle_page);
    return 0;
}
`,
            solutionExplanation: '1. (1 + 1000) / 2 = 500 en división entera de C.\n2. Al abrir la página 500, sabemos inmediatamente si el nombre buscado está en la mitad izquierda o derecha, descartando 500 páginas de un solo golpe.'
          }
        ]
      },
      {
        id: 'c0-ch3',
        chapterNumber: 3,
        title: 'Lógica Visual en Scratch (LEGO Blocks)',
        timeRange: '01:05 - Final',
        startSeconds: 3900,
        summary: 'Construcción de programas interactivos en Scratch mediante bloques de eventos (amarillo), bucles (naranja), condicionales y variables de estado.',
        microExercises: [
          {
            id: 'm0-ex3',
            title: 'Planificación de Marcador de Puntos',
            duration: '5 min',
            prompt: 'En Scratch usamos una variable llamada "puntos". Simula en código C cómo empieza en 0 y suma 10 puntos al atrapar un objeto.',
            language: 'c',
            starterCode: `#include <stdio.h>

int main(void)
{
    int puntos = 0;

    // TODO: Suma 10 puntos y muestra el marcador actualizado
    
    printf("Puntos: %d\\n", puntos);
    return 0;
}
`,
            solutionCode: `#include <stdio.h>

int main(void)
{
    int puntos = 0;
    puntos = puntos + 10;

    printf("Puntos: %d\\n", puntos);
    return 0;
}
`,
            solutionExplanation: '1. `puntos = puntos + 10;` incrementa el valor actual de la variable en 10 unidades.\n2. Equivale exactamente al bloque de Scratch: "cambiar [puntos] por (10)".'
          }
        ]
      }
    ],
    officialExercise: {
      title: 'Problem Set 0: Proyecto en Scratch',
      notesUrl: 'https://cs50.harvard.edu/x/notes/0/',
      psetUrl: 'https://cs50.harvard.edu/x/psets/0/scratch/',
      goal: 'Crear una animación, juego o historia interactiva en la plataforma visual Scratch (https://scratch.mit.edu/) utilizando bloques lógicos.',
      specs: [
        'Tener al menos dos personajes (sprites), de los cuales al menos uno no sea el gato predeterminado de Scratch.',
        'Tener al menos tres pilas de bloques (scripts) en total (no necesariamente tres por cada personaje).',
        'Utilizar al menos una condición lógica ("si... entonces" / if-then).',
        'Utilizar al menos un bucle ("repetir" o "por siempre" / forever).',
        'Utilizar al menos una variable (por ejemplo, marcador de puntos, vidas o temporizador).',
        'Utilizar al menos un bloque personalizado (Mi Bloque) con una entrada, o bien difusión de mensajes / sonido.',
      ],
      check50: 'check50 cs50/problems/2024/x/scratch',
      submit50: 'submit50 cs50/problems/2024/x/scratch',
    },
    simpleVideoExplanations: [
      {
        chapterTitle: 'Inicio del vídeo · El idioma de los ordenadores (Binario y Bombillas)',
        analogyTitle: '💡 Analogía de los interruptores de luz en tu habitación',
        paragraphs: [
          'Un ordenador por dentro no entiende letras ni números como nosotros; solo tiene millones de diminutos interruptores eléctricos que pueden estar apagados (0) o encendidos (1). Igual que con una lámpara en tu cuarto sabes si hay alguien despierto o dormido, con un solo interruptor (llamado bit) el ordenador distingue entre dos opciones.',
          'Cuando juntas 8 interruptores en fila (un byte), puedes crear combinaciones distintas para representar cualquier letra del teclado (como la A con el número 65), cualquier color en tu pantalla mezclando rojo, verde y azul, o las notas de una canción.',
        ],
      },
      {
        chapterTitle: 'Mitad del vídeo · ¿Qué es un Algoritmo? (La Guía Telefónica)',
        analogyTitle: '📖 Analogía de buscar un nombre en un libro de 1.000 páginas o seguir una receta',
        paragraphs: [
          'Un algoritmo es simplemente una receta de cocina paso a paso para resolver un problema. En el vídeo, David J. Malan busca a "John Harvard" en una guía telefónica: si pasas las páginas de una en una desde el principio, puedes tardar 1.000 pasos si está al final.',
          'Pero si abres el libro justo por la mitad (página 500), miras la letra y descartas de golpe la mitad donde sabes que no está, solo necesitarás dividir el libro unas 10 veces para encontrar cualquier nombre entre 1.000 páginas. Eso es pensar como programador antes de tocar el teclado.',
        ],
      },
      {
        chapterTitle: 'Segunda mitad del vídeo · Pensar con piezas de LEGO en Scratch',
        analogyTitle: '🧩 Analogía de montar piezas de LEGO que solo encajan si tienen sentido',
        paragraphs: [
          'Antes de escribir código en inglés, Harvard usa Scratch porque funciona como piezas de LEGO de colores: los bloques amarillos son el disparo de salida ("Al hacer clic en la bandera verde"), los bloques naranjas repiten acciones sin cansarse ("Por siempre") y los bloques con forma de diamante hacen preguntas ("¿Estoy tocando el borde?").',
          'Así entrenas tu mente en las 4 piezas universales de toda la programación —eventos, bucles, condiciones y variables (como una caja donde apuntas los puntos de tu juego)— sin frustrarte por olvidar un punto y coma.',
        ],
      },
    ],
  },
  {
    id: 'module-1',
    weekLabel: 'Clase 1',
    title: 'C: Tipos de Datos, Condiciones, Loops y Funciones',
    subtitle: 'De los bloques de Scratch al código escrito en C, compilador y pirámide de Mario',
    videoUrl: 'https://www.youtube.com/watch?v=ev96qUufJYI',
    youtubeId: 'ev96qUufJYI',
    language: 'c',
    verifiedTopics:
      'Paso de bloques de Scratch a texto en C, compilador (traductor de código fuente a binario con gcc y make), tipos de datos (int, float, char), formato con printf, condicionales (if/else), bucles (while, for), funciones personalizadas y Mario.',
    realWorldUseCase:
      'Escribir instrucciones exactas que un compilador traduce directamente al idioma de la máquina a máxima velocidad.',
    feynmanPrompt:
      '¿Qué bloque de Scratch equivale exactamente a escribir `for (int i = 0; i < 4; i++)` en lenguaje C?',
    starterChallengeTitle: 'Problem Set 1: Mario (Pirámide Alineada a la Derecha en C)',
    starterCode: `#include <stdio.h>

int main(void)
{
    int height = 4;

    // TODO: Imprime una pirámide de altura 'height' alineada a la derecha.
    // En cada fila 'row' (de 1 a height):
    // 1. Imprime (height - row) espacios " "
    // 2. Imprime 'row' bloques "#"
    // 3. Imprime un salto de línea "\\n"

    printf("Height: %d\\n", height);
    return 0;
}
`,
    allowedConceptsConstraint:
      'SOLO puedes usar conceptos de la Clase 0 y Clase 1 (lenguaje C básico: printf, variables int/float/char, if/else, while, for anidados y el compilador). PROHIBIDO mencionar arrays, punteros, Python o SQL.',
    chapters: [
      {
        id: 'c1-ch1',
        chapterNumber: 1,
        title: 'Hola Mundo y Compilación (make / gcc)',
        timeRange: '00:00 - 00:30',
        startSeconds: 0,
        summary: 'Introducción al código fuente en C, el compilador como traductor a ceros y unos, la biblioteca estándar <stdio.h>, la función main y printf con saltos de línea \\n.',
        microExercises: [
          {
            id: 'c1-ex1',
            title: 'Mi Primer Saludo con printf y \\n',
            duration: '5 min',
            prompt: 'Escribe un programa en C que imprima exactamente "Hola, mundo desde CS50!" seguido de un salto de línea con \\n.',
            language: 'c',
            starterCode: `#include <stdio.h>

int main(void)
{
    // TODO: Imprime "Hola, mundo desde CS50!\n" usando printf
    
    return 0;
}
`,
            solutionCode: `#include <stdio.h>

int main(void)
{
    printf("Hola, mundo desde CS50!\n");
    return 0;
}
`,
            solutionExplanation: '1. `#include <stdio.h>`: Importa la biblioteca de entrada y salida estándar obligatoria para usar printf.\n2. `int main(void)`: Punto de inicio del programa.\n3. `printf("Hola, mundo desde CS50!\\n");`: Imprime el mensaje y mueve el cursor a la siguiente línea.\n4. `return 0;`: Señala terminación exitosa sin errores.'
          }
        ]
      },
      {
        id: 'c1-ch2',
        chapterNumber: 2,
        title: 'Variables y Entrada de Usuario (get_string / %s)',
        timeRange: '00:31 - 00:55',
        startSeconds: 1860,
        summary: 'Cómo almacenar valores en variables con tipo definido (char, int, float) y formatear salidas dinámicas mediante especificadores de formato como %s y %d.',
        microExercises: [
          {
            id: 'c1-ex2',
            title: 'Saludo Personalizado con Formato %s (greet.c)',
            duration: '5 min',
            prompt: 'En greet.c, define una cadena con tu nombre e imprímela con printf usando el especificador %s para mostrar "Hola, %s!\\n".',
            language: 'c',
            starterCode: `#include <stdio.h>

int main(void)
{
    char name[] = "David";

    // TODO: Usa printf con %s para imprimir "Hola, %s!\n" pasando la variable name
    
    return 0;
}
`,
            solutionCode: `#include <stdio.h>

int main(void)
{
    char name[] = "David";
    printf("Hola, %s!\n", name);
    return 0;
}
`,
            solutionExplanation: '1. `char name[] = "David";`: Declara un array de caracteres con el texto "David".\n2. En `printf("Hola, %s!\\n", name);`, `%s` es sustituido por el contenido de la variable name.\n3. Es el equivalente en C puro al bloque de Scratch "decir (unir [Hola, ] [David])".'
          }
        ]
      },
      {
        id: 'c1-ch3',
        chapterNumber: 3,
        title: 'Condicionales (if, else if, else) y Comparaciones',
        timeRange: '00:55 - 01:22',
        startSeconds: 3300,
        summary: 'Toma de decisiones lógicas en C evaluando expresiones booleanas con operadores de comparación (<, >, ==, !=) sin comprobaciones redundantes.',
        microExercises: [
          {
            id: 'c1-ex3',
            title: 'Comparador de Números (compare.c)',
            duration: '5 min',
            prompt: 'Dadas dos variables enteras x e y, utiliza if, else if y else para determinar si x < y, x > y o si son iguales.',
            language: 'c',
            starterCode: `#include <stdio.h>

int main(void)
{
    int x = 5;
    int y = 10;

    // TODO: Compara x e y con if / else if / else
    // Imprime "x es menor que y\n", "x es mayor que y\n" o "x es igual a y\n"

    return 0;
}
`,
            solutionCode: `#include <stdio.h>

int main(void)
{
    int x = 5;
    int y = 10;

    if (x < y)
    {
        printf("x es menor que y\n");
    }
    else if (x > y)
    {
        printf("x es mayor que y\n");
    }
    else
    {
        printf("x es igual a y\n");
    }

    return 0;
}
`,
            solutionExplanation: '1. `if (x < y)` verifica el primer caso.\n2. `else if (x > y)` se evalúa solo si el primero fue falso.\n3. El bloque `else` final captura el caso restante (son iguales) sin necesidad de una comparación extra ineficiente.'
          }
        ]
      },
      {
        id: 'c1-ch4',
        chapterNumber: 4,
        title: 'Bucles (while y for) con cat.c',
        timeRange: '01:22 - 01:44',
        startSeconds: 4920,
        summary: 'Repetición controlada de instrucciones sin duplicar código. Paso del bucle while manual con contador al bucle for idiomático de C.',
        microExercises: [
          {
            id: 'c1-ex4a',
            title: 'Contador con Bucle while (cat.c)',
            duration: '5 min',
            prompt: 'Utiliza una variable contador `int i = 0` y un bucle `while (i < 3)` para imprimir "meow\\n" 3 veces. ¡Recuerda incrementar i en cada vuelta!',
            language: 'c',
            starterCode: `#include <stdio.h>

int main(void)
{
    int i = 0;

    // TODO: Escribe el bucle while para maullar 3 veces
    // Incrementa i con i++ dentro del bucle

    return 0;
}
`,
            solutionCode: `#include <stdio.h>

int main(void)
{
    int i = 0;
    while (i < 3)
    {
        printf("meow\n");
        i++;
    }
    return 0;
}
`,
            solutionExplanation: '1. `int i = 0;`: El contador arranca en 0 (indexación base 0 estándar).\n2. `while (i < 3)`: Se ejecuta mientras i sea 0, 1 y 2 (un total de 3 veces).\n3. `i++;`: Incrementa i en 1 para que el bucle avance hacia su condición de parada.'
          },
          {
            id: 'c1-ex4b',
            title: 'Refactorización Idiomática con Bucle for',
            duration: '5 min',
            prompt: 'Reescribe el programa de los maullidos compactando inicialización, condición e incremento en la cabecera con `for (int i = 0; i < 3; i++)`.',
            language: 'c',
            starterCode: `#include <stdio.h>

int main(void)
{
    // TODO: Escribe un bucle for que imprima "meow\n" 3 veces

    return 0;
}
`,
            solutionCode: `#include <stdio.h>

int main(void)
{
    for (int i = 0; i < 3; i++)
    {
        printf("meow\n");
    }
    return 0;
}
`,
            solutionExplanation: '1. `for (int i = 0; i < 3; i++)` unifica el ciclo en una sola línea legible.\n2. La variable i queda acotada exclusivamente al cuerpo del bucle, protegiendo el resto de tu código.'
          }
        ]
      },
      {
        id: 'c1-ch5',
        chapterNumber: 5,
        title: 'Crear tus Propias Funciones (void meow(int n))',
        timeRange: '01:44 - 02:02',
        startSeconds: 6240,
        summary: 'Modularización y abstracción en C: declaración de prototipos arriba de main, implementación de funciones con parámetros y paso por valor.',
        microExercises: [
          {
            id: 'c1-ex5',
            title: 'Definir e Invocar una Función meow(int n)',
            duration: '5 min',
            prompt: 'Declara el prototipo `void meow(int n);` arriba de `main`, define la función abajo con un bucle `for`, e invócala desde `main` con `meow(3)`.',
            language: 'c',
            starterCode: `#include <stdio.h>

// TODO 1: Declarar el prototipo de meow(int n) aquí

int main(void)
{
    // TODO 2: Llama a meow(3) para maullar 3 veces
    
    return 0;
}

// TODO 3: Implementa void meow(int n) abajo
`,
            solutionCode: `#include <stdio.h>

void meow(int n);

int main(void)
{
    meow(3);
    return 0;
}

void meow(int n)
{
    for (int i = 0; i < n; i++)
    {
        printf("meow\n");
    }
}
`,
            solutionExplanation: '1. `void meow(int n);`: Prototipo que avisa al compilador de la existencia de la función antes de main.\n2. `meow(3);`: Llamada limpia desde main que pasa el argumento 3.\n3. La definición abajo recibe el valor en el parámetro n y ejecuta el bucle de 0 a n.'
          }
        ]
      },
      {
        id: 'c1-ch6',
        chapterNumber: 6,
        title: 'Desbordamiento Numérico y Reto Integrador (Mario)',
        timeRange: '02:02 - Final',
        startSeconds: 7320,
        summary: 'Limitaciones de memoria física (integer overflow y precisión de punto flotante) y preparación mental para los bucles anidados del Problem Set de Mario.',
        microExercises: [
          {
            id: 'c1-ex6',
            title: 'Construir una Fila de Mario con Almohadillas (#)',
            duration: '5 min',
            prompt: 'Antes de construir la pirámide completa de Mario, imprime una sola fila de `int width = 5` caracteres `#` seguidos de un único salto de línea `\\n` al final.',
            language: 'c',
            starterCode: `#include <stdio.h>

int main(void)
{
    int width = 5;

    // TODO: Usa un bucle for para imprimir 'width' bloques '#'
    // y al terminar el bucle imprime un salto de línea "\n"

    return 0;
}
`,
            solutionCode: `#include <stdio.h>

int main(void)
{
    int width = 5;

    for (int i = 0; i < width; i++)
    {
        printf("#");
    }
    printf("\n");

    return 0;
}
`,
            solutionExplanation: '1. En cada iteración se imprime `printf("#");` sin salto de línea para que los bloques queden pegados horizontalmente.\n2. Tras completarse el bucle, `printf("\\n");` cierra la fila. Este patrón es la base de la pirámide de Mario.'
          }
        ]
      }
    ],
    officialExercise: {
      title: 'Problem Set 1: Mario (Right-Aligned Pyramid)',
      notesUrl: 'https://cs50.harvard.edu/x/notes/1/',
      psetUrl: 'https://cs50.harvard.edu/x/psets/1/mario/less/',
      goal: 'Recrear en lenguaje C la pirámide de bloques de Super Mario Bros. de altura `int height = 4` utilizando bucles `for` anidados para controlar cuántos espacios en blanco y cuántas almohadillas (`#`) se imprimen en cada fila.',
      specs: [
        'Usa la variable `int height = 4;` definida en `main(void)`.',
        'Crea un bucle externo `for (int row = 1; row <= height; row++)` para recorrer cada piso de la pirámide.',
        'Dentro de cada fila, usa un primer bucle interno `for` para imprimir `height - row` espacios (`printf(" ");`).',
        'A continuación, usa un segundo bucle interno `for` para imprimir `row` caracteres `#` (`printf("#");`).',
        'Al terminar cada fila, imprime un salto de línea con `printf("\\n");`.',
      ],
      usageExample: `$ ./mario
Height: 4
   #
  ##
 ###
####`,
      check50: 'check50 cs50/problems/2024/x/mario/less',
      submit50: 'submit50 cs50/problems/2024/x/mario/less',
    },
    simpleVideoExplanations: [
      {
        chapterTitle: 'Inicio del vídeo · Del Scratch a la sintaxis estricta de C',
        analogyTitle: '🧱 Analogía de construir con planos de hormigón en vez de bloques de madera',
        paragraphs: [
          'En Scratch, si ponías un bloque en el sitio equivocado, el gato simplemente no se movía. En C, estás trabajando directamente con el cerebro de la máquina: debes decirle con exactitud si una variable es un número entero (`int`), una letra (`char`) o un decimal (`float`).',
          'El compilador (`make` o `gcc`) es tu revisor más estricto: antes de dejarte ejecutar el programa, verifica cada punto y coma para garantizar que la máquina nunca se confunda.',
        ],
      },
      {
        chapterTitle: 'Mitad del vídeo · Bucles y Funciones (El gato que maúlla)',
        analogyTitle: '🐱 Analogía de entrenar a un perro con una orden en lugar de darle instrucciones cada segundo',
        paragraphs: [
          'Si quieres que tu gato maúlle 100 veces, podrías escribir `printf("meow\\n");` cien veces seguidas. Pero eso es aburrido y fácil de estropear si decides cambiar el maullido por un ladrido.',
          'Con un bucle `for`, le dices a la computadora: "haz esto mientras el contador sea menor que 100". Y si lo envuelves en una función `meow(100)`, le acabas de enseñar un truco nuevo al ordenador para usarlo siempre con una sola palabra.',
        ],
      },
    ],
  },
  {
    id: 'module-2',
    weekLabel: 'Clase 2',
    title: 'Arrays, Strings, Memoria y Criptografía',
    subtitle: 'Casilleros contiguos en memoria, cadenas terminadas en \\0 y el cifrado César',
    videoUrl: 'https://www.youtube.com/watch?v=F2z_A3b905A',
    youtubeId: 'F2z_A3b905A',
    language: 'c',
    verifiedTopics:
      'Compilación en 4 fases (preprocessing, compiling, assembling, linking), depuración paso a paso (debugging con printf o debug50), arrays como bloques contiguos de memoria, strings como arrays de char terminados en byte NUL (\\0), argumentos de línea de comandos (argc, argv) y cifrado César.',
    realWorldUseCase:
      'Procesar texto y colecciones de datos asegurando que no leas fuera de los límites de memoria.',
    feynmanPrompt:
      '¿Por qué una palabra de 4 letras ocupa en realidad 5 bytes en la memoria de un ordenador?',
    starterChallengeTitle: 'Problem Set 2: Caesar (Cifrado por Desplazamiento en C)',
    starterCode: `#include <stdio.h>
#include <ctype.h>

int main(void)
{
    int key = 3;
    char text[] = "HELLO";

    // TODO: Recorre 'text' con un bucle for.
    // Para cada letra mayúscula, desplázala 'key' posiciones en el abecedario:
    // c = ((p - 'A' + key) % 26) + 'A';

    printf("Texto cifrado: %s\\n", text);
    return 0;
}
`,
    allowedConceptsConstraint:
      'SOLO puedes usar conceptos hasta la Clase 2 (arrays, strings, char, strlen, isupper, islower, argc/argv y fórmulas algebraicas con módulo %). PROHIBIDO mencionar punteros con malloc/free o estructuras de datos avanzadas.',
    chapters: [
      {
        id: 'c2-ch1',
        chapterNumber: 1,
        title: 'Arrays y Memoria Contigua',
        timeRange: '00:00 - 00:35',
        startSeconds: 0,
        summary: 'Cómo los arrays reservan casilleros consecutivos en la memoria RAM y cómo acceder a sus elementos mediante índices con base 0.',
        microExercises: [
          {
            id: 'c2-ex1',
            title: 'Cálculo de la Media en un Array de Puntuaciones',
            duration: '5 min',
            prompt: 'Dado un array de 3 notas enteras {72, 73, 33}, suma sus valores en un bucle for y calcula su media como número decimal (float).',
            language: 'c',
            starterCode: `#include <stdio.h>

int main(void)
{
    int scores[3] = {72, 73, 33};

    // TODO: Suma las 3 notas y calcula la media como float
    float average = 0.0;

    printf("Media: %.2f\n", average);
    return 0;
}
`,
            solutionCode: `#include <stdio.h>

int main(void)
{
    int scores[3] = {72, 73, 33};
    int sum = 0;

    for (int i = 0; i < 3; i++)
    {
        sum += scores[i];
    }

    float average = sum / 3.0;
    printf("Media: %.2f\n", average);
    return 0;
}
`,
            solutionExplanation: '1. `scores[i]` accede al valor en la posición i.\n2. Al dividir entre `3.0` (número decimal), C realiza división de punto flotante en lugar de truncar a entero.'
          }
        ]
      },
      {
        id: 'c2-ch2',
        chapterNumber: 2,
        title: 'Strings y el Centinela NUL (\\0)',
        timeRange: '00:35 - 01:10',
        startSeconds: 2100,
        summary: 'Un string no es un tipo primitivo en C: es un array de caracteres que finaliza obligatoriamente con el byte cero especial (\\0).',
        microExercises: [
          {
            id: 'c2-ex2',
            title: 'Recorrer un String hasta el Centinela \\0',
            duration: '5 min',
            prompt: 'Recorre una cadena de caracteres carácter por carácter usando un bucle que se detenga automáticamente cuando encuentre `\\0`. Imprime cada letra en una línea.',
            language: 'c',
            starterCode: `#include <stdio.h>

int main(void)
{
    char word[] = "HI!";

    // TODO: Recorre word[i] mientras word[i] != '\\0' e imprime cada carácter
    
    return 0;
}
`,
            solutionCode: `#include <stdio.h>

int main(void)
{
    char word[] = "HI!";

    for (int i = 0; word[i] != '\0'; i++)
    {
        printf("%c\n", word[i]);
    }
    return 0;
}
`,
            solutionExplanation: '1. `word[i] != \'\\0\'`: Es la forma idiomática en que C sabe dónde termina un texto en memoria sin necesidad de almacenar la longitud por separado.'
          }
        ]
      },
      {
        id: 'c2-ch3',
        chapterNumber: 3,
        title: 'Argumentos de Línea de Comandos (argc, argv)',
        timeRange: '01:10 - Final',
        startSeconds: 4200,
        summary: 'Paso de parámetros desde la terminal al programa (`./program arg1`) utilizando el contador argc y el array de cadenas argv.',
        microExercises: [
          {
            id: 'c2-ex3',
            title: 'Verificación de Argumentos de Entrada',
            duration: '5 min',
            prompt: 'En main, verifica si se pasó exactamente un argumento adicional (`argc == 2`). Si no es así, imprime un mensaje de error y devuelve 1.',
            language: 'c',
            starterCode: `#include <stdio.h>

int main(int argc, char *argv[])
{
    // TODO: Si argc != 2, imprime "Uso: ./programa nombre\n" y return 1;
    // Si es correcto, imprime "Hola, %s\n" con argv[1]
    
    return 0;
}
`,
            solutionCode: `#include <stdio.h>

int main(int argc, char *argv[])
{
    if (argc != 2)
    {
        printf("Uso: ./programa nombre\n");
        return 1;
    }

    printf("Hola, %s\n", argv[1]);
    return 0;
}
`,
            solutionExplanation: '1. `argv[0]` es siempre el nombre del ejecutable.\n2. `argv[1]` es el primer argumento pasado por el usuario.\n3. Devolver 1 indica un error al sistema operativo.'
          }
        ]
      }
    ],
    officialExercise: {
      title: 'Problem Set 2: Caesar (Cifrado por Desplazamiento en C)',
      notesUrl: 'https://cs50.harvard.edu/x/notes/2/',
      psetUrl: 'https://cs50.harvard.edu/x/psets/2/caesar/',
      goal: 'Implementar el algoritmo de cifrado César en C para desplazar cada letra mayúscula de un texto plano `key` posiciones en el abecedario circular.',
      specs: [
        'Usa la fórmula circular: `c = ((p - \'A\' + key) % 26) + \'A\'`.',
        'Conserva los caracteres no alfabéticos sin alteración.',
        'Muestra el resultado final precedido por `ciphertext: `.',
      ],
      usageExample: `$ ./caesar 3
plaintext:  HELLO
ciphertext: KHOOR`,
      check50: 'check50 cs50/problems/2024/x/caesar',
      submit50: 'submit50 cs50/problems/2024/x/caesar',
    },
    simpleVideoExplanations: [
      {
        chapterTitle: 'Mitad del vídeo · ¿Qué es exactamente una cadena de texto en C?',
        analogyTitle: '🏷️ Analogía del cartel con un punto final invisible',
        paragraphs: [
          'En otros lenguajes, un texto parece una sola cosa mágica. En C, es una fila de casilleros de correos contiguos en la memoria RAM, donde cada casillero guarda una letra.',
          'Para que la computadora no siga leyendo la basura que hay en la memoria después de tu palabra, C añade al final un casillero con un cero invisible llamado `\\0` (NUL). Cuando el lector de C llega al `\\0`, sabe que el mensaje ha terminado.',
        ],
      },
    ],
  },
  {
    id: 'module-3',
    weekLabel: 'Clase 3',
    title: 'Algoritmos: Búsqueda, Ordenamiento y Complejidad',
    subtitle: 'Notación Big O, Búsqueda Binaria, Selection Sort y Merge Sort recursivo',
    videoUrl: 'https://www.youtube.com/watch?v=4U-m4i7_5Z0',
    youtubeId: '4U-m4i7_5Z0',
    language: 'c',
    verifiedTopics:
      'Complejidad temporal (Big O y Big Omega), Búsqueda Lineal O(n) vs Búsqueda Binaria O(log n), algoritmos de ordenamiento (Selection Sort, Bubble Sort, Merge Sort) y recursividad.',
    realWorldUseCase:
      'Elegir el algoritmo adecuado para que tu aplicación responda en milisegundos en vez de horas al escalar.',
    feynmanPrompt:
      '¿Por qué ordenar una lista antes de buscar puede ahorrar tiempo a largo plazo?',
    starterChallengeTitle: 'Problem Set 3: Binary Search & Selection Sort en C',
    starterCode: `#include <stdio.h>

int binary_search(int arr[], int size, int target)
{
    int left = 0;
    int right = size - 1;

    // TODO: Implementa el bucle de búsqueda binaria (while left <= right)
    // Calcula mid, compara arr[mid] con target y ajusta left o right
    // Devuelve el índice si se encuentra, o -1 si no existe

    return -1;
}

int main(void)
{
    int numbers[] = {11, 23, 34, 42, 56, 68, 77, 89, 95};
    int target = 42;
    int idx = binary_search(numbers, 9, target);
    printf("Target %d at index: %d\\n", target, idx);
    return 0;
}
`,
    allowedConceptsConstraint:
      'SOLO puedes usar conceptos de la Clase 3 (notación Big O, búsqueda lineal/binaria, bubble sort, selection sort, merge sort y recursión en C).',
    chapters: [
      {
        id: 'c3-ch1',
        chapterNumber: 1,
        title: 'Búsqueda Lineal vs Búsqueda Binaria',
        timeRange: '00:00 - 00:45',
        startSeconds: 0,
        summary: 'Comparación entre revisar elementos uno por uno (O(n)) y dividir la lista ordenada por la mitad en cada paso (O(log n)).',
        microExercises: [
          {
            id: 'c3-ex1',
            title: 'Búsqueda Lineal en una Lista de Números',
            duration: '5 min',
            prompt: 'Implementa una búsqueda lineal que recorra un array y devuelva el índice donde se encuentra el número 42.',
            language: 'c',
            starterCode: `#include <stdio.h>

int linear_search(int arr[], int size, int target)
{
    // TODO: Recorre el array con for. Si arr[i] == target, return i;
    return -1;
}

int main(void)
{
    int numbers[] = {20, 500, 10, 5, 100, 1, 50};
    int idx = linear_search(numbers, 7, 5);
    printf("Encontrado en indice: %d\n", idx);
    return 0;
}
`,
            solutionCode: `#include <stdio.h>

int linear_search(int arr[], int size, int target)
{
    for (int i = 0; i < size; i++)
    {
        if (arr[i] == target)
        {
            return i;
        }
    }
    return -1;
}

int main(void)
{
    int numbers[] = {20, 500, 10, 5, 100, 1, 50};
    int idx = linear_search(numbers, 7, 5);
    printf("Encontrado en indice: %d\n", idx);
    return 0;
}
`,
            solutionExplanation: '1. En el peor caso, la búsqueda lineal inspecciona los n elementos (complejidad O(n)).\n2. Si el elemento no existe, devuelve -1 como convención de error.'
          }
        ]
      },
      {
        id: 'c3-ch2',
        chapterNumber: 2,
        title: 'Ordenamiento: Selection Sort y Bubble Sort',
        timeRange: '00:45 - 01:25',
        startSeconds: 2700,
        summary: 'Cómo comparar y reordenar elementos en memoria para prepararlos para algoritmos de alta velocidad.',
        microExercises: [
          {
            id: 'c3-ex2',
            title: 'Intercambio de Variables (Swap)',
            duration: '5 min',
            prompt: 'Para ordenar una lista necesitamos intercambiar dos elementos usando una variable temporal auxiliar. Completa la función swap.',
            language: 'c',
            starterCode: `#include <stdio.h>

int main(void)
{
    int a = 10;
    int b = 20;

    // TODO: Intercambia los valores de a y b usando una variable temp
    int temp = a;

    printf("a = %d, b = %d\n", a, b);
    return 0;
}
`,
            solutionCode: `#include <stdio.h>

int main(void)
{
    int a = 10;
    int b = 20;

    int temp = a;
    a = b;
    b = temp;

    printf("a = %d, b = %d\n", a, b);
    return 0;
}
`,
            solutionExplanation: '1. Guardamos el valor de `a` en `temp` para no sobrescribirlo.\n2. Asignamos `b` a `a`.\n3. Recuperamos el valor original desde `temp` y lo guardamos en `b`.'
          }
        ]
      },
      {
        id: 'c3-ch3',
        chapterNumber: 3,
        title: 'Recursión y Merge Sort (O(n log n))',
        timeRange: '01:25 - Final',
        startSeconds: 5100,
        summary: 'Funciones que se llaman a sí mismas con un caso base y división recursiva para lograr ordenamiento garantizado en tiempo O(n log n).',
        microExercises: [
          {
            id: 'c3-ex3',
            title: 'Función Recursiva de Factorial',
            duration: '5 min',
            prompt: 'Implementa una función recursiva `int factorial(int n)` con su caso base (`if n <= 1 return 1`) y llamada recursiva.',
            language: 'c',
            starterCode: `#include <stdio.h>

int factorial(int n)
{
    // TODO: Caso base y caso recursivo (n * factorial(n - 1))
    return 1;
}

int main(void)
{
    printf("5! = %d\n", factorial(5));
    return 0;
}
`,
            solutionCode: `#include <stdio.h>

int factorial(int n)
{
    if (n <= 1)
    {
        return 1;
    }
    return n * factorial(n - 1);
}

int main(void)
{
    printf("5! = %d\n", factorial(5));
    return 0;
}
`,
            solutionExplanation: '1. Todo algoritmo recursivo necesita un caso base que detenga la recursión.\n2. La llamada `n * factorial(n - 1)` va apilando marcos en el call stack hasta resolver el caso base.'
          }
        ]
      }
    ],
    officialExercise: {
      title: 'Problem Set 3: Runoff / Plurality (Algoritmos Electorales)',
      notesUrl: 'https://cs50.harvard.edu/x/notes/3/',
      psetUrl: 'https://cs50.harvard.edu/x/psets/3/runoff/',
      goal: 'Implementar el algoritmo de búsqueda y ordenamiento de votos electorales por orden de preferencia para encontrar al ganador o eliminar al candidato con menos votos.',
      specs: [
        'Encuentra el mínimo de votos entre los candidatos no eliminados.',
        'Determina si la elección es un empate entre todos los candidatos restantes.',
        'Elimina al candidato o candidatos con menor cantidad de votos.',
      ],
      usageExample: `$ ./runoff Alice Bob Charlie
Number of voters: 3
Rank 1: Alice
Rank 2: Bob
Rank 3: Charlie
Alice wins!`,
      check50: 'check50 cs50/problems/2024/x/runoff',
      submit50: 'submit50 cs50/problems/2024/x/runoff',
    },
    simpleVideoExplanations: [
      {
        chapterTitle: 'Mitad del vídeo · Búsqueda Binaria y la Guía Telefónica revisada',
        analogyTitle: '📚 Analogía de doblar una servilleta por la mitad',
        paragraphs: [
          'Si tienes una lista desordenada, no te queda más remedio que mirar elemento por elemento. Pero si está ordenada alfabéticamente o de menor a mayor, cada pregunta que haces te permite tachar el 50% de las opciones restantes.',
          'Incluso con 4.000 millones de números, con solo 32 preguntas puedes encontrar cualquiera. Eso es lo que significa O(log n).',
        ],
      },
    ],
  },
  {
    id: 'module-4',
    weekLabel: 'Clase 4',
    title: 'Memoria: Punteros, Direcciones Hexadecimales y malloc',
    subtitle: 'El operador de dirección &, desreferencia *, gestión del heap y valgrind',
    videoUrl: 'https://www.youtube.com/watch?v=F_fP_pY2l_M',
    youtubeId: 'F_fP_pY2l_M',
    language: 'c',
    verifiedTopics:
      'Direcciones de memoria en hexadecimal (0x...), operador de dirección (&), operador de desreferencia (*), qué es un puntero (una variable que almacena una dirección), memoria dinámica con malloc y free, el call stack vs el heap, segmentation fault y detección de fugas con valgrind.',
    realWorldUseCase:
      'Controlar directamente los recursos del ordenador sin desperdiciar memoria RAM en servidores y sistemas embebidos.',
    feynmanPrompt:
      'Explica qué es un puntero utilizando la analogía de la dirección postal de una casa.',
    starterChallengeTitle: 'Problem Set 4: Filter (Manipulación de Píxeles en C)',
    starterCode: `#include <stdio.h>

void swap(int *a, int *b)
{
    // TODO: Usa punteros para intercambiar el contenido de las variables
    // apuntadas por 'a' y 'b'
}

int main(void)
{
    int x = 1;
    int y = 2;
    swap(&x, &y);
    printf("x: %d, y: %d\\n", x, y);
    return 0;
}
`,
    allowedConceptsConstraint:
      'SOLO puedes usar conceptos de la Clase 4 (punteros, &, *, malloc, free, stack vs heap, archivos FILE*, valgrind y aritmética de punteros).',
    chapters: [
      {
        id: 'c4-ch1',
        chapterNumber: 1,
        title: 'Direcciones de Memoria y Punteros (& y *)',
        timeRange: '00:00 - 00:40',
        startSeconds: 0,
        summary: 'Cada byte en la memoria RAM tiene una dirección única en formato hexadecimal. El operador & obtiene la dirección y * accede al valor apuntado.',
        microExercises: [
          {
            id: 'c4-ex1',
            title: 'Imprimir la Dirección de una Variable',
            duration: '5 min',
            prompt: 'Declara un entero `int n = 50;` e imprime su dirección física de memoria con el especificador `%p` y el operador `&`.',
            language: 'c',
            starterCode: `#include <stdio.h>

int main(void)
{
    int n = 50;

    // TODO: Imprime la dirección de n con printf("%p\n", ...)
    
    return 0;
}
`,
            solutionCode: `#include <stdio.h>

int main(void)
{
    int n = 50;
    printf("%p\n", (void *)&n);
    return 0;
}
`,
            solutionExplanation: '1. `&n` obtiene la dirección de memoria donde reside la variable n.\n2. `%p` formatea la dirección en hexadecimal (ej. 0x7ffe...).'
          }
        ]
      },
      {
        id: 'c4-ch2',
        chapterNumber: 2,
        title: 'Asignación Dinámica con malloc y free',
        timeRange: '00:40 - 01:20',
        startSeconds: 2400,
        summary: 'Cómo solicitar memoria al sistema operativo en tiempo de ejecución en el Heap con malloc y devolverla con free para evitar fugas de memoria (memory leaks).',
        microExercises: [
          {
            id: 'c4-ex2',
            title: 'Reservar y Liberar un Entero en el Heap',
            duration: '5 min',
            prompt: 'Usa `malloc(sizeof(int))` para reservar espacio en el heap, asigna el valor 42 mediante `*p = 42;`, imprímelo y libéralo con `free(p)`.',
            language: 'c',
            starterCode: `#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    // TODO: Reserva memoria para un int con malloc
    int *p = NULL;

    // TODO: Asigna el valor 42, imprímelo y libera la memoria con free
    
    return 0;
}
`,
            solutionCode: `#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    int *p = malloc(sizeof(int));
    if (p == NULL)
    {
        return 1;
    }

    *p = 42;
    printf("Valor en heap: %d\n", *p);

    free(p);
    return 0;
}
`,
            solutionExplanation: '1. `malloc(sizeof(int))` solicita 4 bytes en el Heap.\n2. Siempre se comprueba si devolvió `NULL` (memoria agotada).\n3. `free(p)` entrega los bytes de vuelta al sistema operativo.'
          }
        ]
      }
    ],
    officialExercise: {
      title: 'Problem Set 4: Recover (Recuperador de Imágenes JPEG)',
      notesUrl: 'https://cs50.harvard.edu/x/notes/4/',
      psetUrl: 'https://cs50.harvard.edu/x/psets/4/recover/',
      goal: 'Recuperar imágenes JPEG de una tarjeta de memoria forense inspeccionando bloques de 512 bytes y sus cabeceras mágicas (0xff 0xd8 0xff).',
      specs: [
        'Abre el archivo forense con `fopen` en modo binario.',
        'Lee bloques de 512 bytes con `fread`.',
        'Detecta el inicio de un JPEG con `buffer[0] == 0xff && buffer[1] == 0xd8 && buffer[2] == 0xff`.',
        'Escribe bloques consecutivos en archivos `###.jpg` hasta el final.',
      ],
      usageExample: `$ ./recover card.raw
50 JPEGs recovered.`,
      check50: 'check50 cs50/problems/2024/x/recover',
      submit50: 'submit50 cs50/problems/2024/x/recover',
    },
    simpleVideoExplanations: [
      {
        chapterTitle: 'Mitad del vídeo · ¿Qué es realmente un puntero?',
        analogyTitle: '📬 Analogía de apuntar la dirección de la casa de tu amigo en un papelito',
        paragraphs: [
          'Un puntero no es la casa ni los muebles; es simplemente una nota adhesiva donde tienes anotada la dirección de la calle.',
          'Si pasas una variable normal a una función en C, la máquina hace una fotocopia de los datos. Pero si le pasas un puntero (`&variable`), le estás dando la llave de la casa original para que pueda modificarla directamente.',
        ],
      },
    ],
  },
  {
    id: 'module-5',
    weekLabel: 'Clase 5',
    title: 'Estructuras de Datos: Listas Enlazadas, Árboles y Tablas Hash',
    subtitle: 'Nodos struct, punteros next, colisiones y el corrector ortográfico Speller',
    videoUrl: 'https://www.youtube.com/watch?v=2T-A_3vwG3A',
    youtubeId: '2T-A_3vwG3A',
    language: 'c',
    verifiedTopics:
      'Estructuras personalizadas (typedef struct), listas enlazadas dinámicas (singly linked lists), árboles binarios de búsqueda (BST), tablas hash con funciones hash, trie y el proyecto Speller.',
    realWorldUseCase:
      'Organizar millones de registros para búsquedas casi instantáneas en tiempo O(1).',
    feynmanPrompt:
      '¿Por qué una tabla hash bien diseñada puede buscar un elemento mucho más rápido que un array tradicional?',
    starterChallengeTitle: 'Problem Set 5: Speller (Corrector Ortográfico con Tabla Hash en C)',
    starterCode: `#include <stdio.h>
#include <string.h>

unsigned int hash(const char *word)
{
    // TODO: Implementa una función hash simple que sume el código ASCII
    // de los caracteres de 'word' y devuelva la suma módulo 26
    return 0;
}

int main(void)
{
    printf("Hash de 'cat': %u\\n", hash("cat"));
    printf("Hash de 'dog': %u\\n", hash("dog"));
    return 0;
}
`,
    allowedConceptsConstraint:
      'SOLO puedes usar conceptos de la Clase 5 (structs, nodos, listas enlazadas, árboles, tablas hash y proyecto speller).',
    chapters: [
      {
        id: 'c5-ch1',
        chapterNumber: 1,
        title: 'Listas Enlazadas (Linked Lists)',
        timeRange: '00:00 - 00:50',
        startSeconds: 0,
        summary: 'Cómo conectar elementos dispersos en la memoria mediante nodos con un puntero next, superando el tamaño fijo de los arrays.',
        microExercises: [
          {
            id: 'c5-ex1',
            title: 'Definir y Conectar dos Nodos de Lista Enlazada',
            duration: '5 min',
            prompt: 'Define un nodo `struct node` con un entero `val` y un puntero `next`. Enlaza dos nodos en memoria e imprime sus valores.',
            language: 'c',
            starterCode: `#include <stdio.h>
#include <stdlib.h>

typedef struct node
{
    int number;
    struct node *next;
} node;

int main(void)
{
    node *list = malloc(sizeof(node));
    list->number = 1;
    list->next = malloc(sizeof(node));
    list->next->number = 2;
    list->next->next = NULL;

    // TODO: Recorre la lista con un bucle while e imprime cada número
    
    free(list->next);
    free(list);
    return 0;
}
`,
            solutionCode: `#include <stdio.h>
#include <stdlib.h>

typedef struct node
{
    int number;
    struct node *next;
} node;

int main(void)
{
    node *list = malloc(sizeof(node));
    list->number = 1;
    list->next = malloc(sizeof(node));
    list->next->number = 2;
    list->next->next = NULL;

    node *ptr = list;
    while (ptr != NULL)
    {
        printf("%d\n", ptr->number);
        ptr = ptr->next;
    }

    free(list->next);
    free(list);
    return 0;
}
`,
            solutionExplanation: '1. `ptr->next` avanza al siguiente nodo en la cadena.\n2. El bucle termina cuando encuentra `NULL` al final de la lista.'
          }
        ]
      },
      {
        id: 'c5-ch2',
        chapterNumber: 2,
        title: 'Tablas Hash y Funciones Hash',
        timeRange: '00:50 - Final',
        startSeconds: 3000,
        summary: 'Combinación de un array y listas enlazadas para indexar palabras mediante una función matemática, logrando búsquedas en O(1).',
        microExercises: [
          {
            id: 'c5-ex2',
            title: 'Función Hash Básica por Primera Letra',
            duration: '5 min',
            prompt: 'Escribe una función hash que tome la primera letra de una palabra y devuelva su número de cubeta entre 0 y 25.',
            language: 'c',
            starterCode: `#include <stdio.h>
#include <ctype.h>

unsigned int hash_letter(const char *word)
{
    // TODO: Devuelve (toupper(word[0]) - 'A') % 26
    return 0;
}

int main(void)
{
    printf("Cubeta para 'Apple': %u\n", hash_letter("Apple"));
    printf("Cubeta para 'Banana': %u\n", hash_letter("Banana"));
    return 0;
}
`,
            solutionCode: `#include <stdio.h>
#include <ctype.h>

unsigned int hash_letter(const char *word)
{
    return (toupper(word[0]) - 'A') % 26;
}

int main(void)
{
    printf("Cubeta para 'Apple': %u\n", hash_letter("Apple"));
    printf("Cubeta para 'Banana': %u\n", hash_letter("Banana"));
    return 0;
}
`,
            solutionExplanation: '1. `toupper` normaliza a mayúscula.\n2. Restar \'A\' convierte caracteres ASCII (\'A\'=65) en índices de 0 a 25.'
          }
        ]
      }
    ],
    officialExercise: {
      title: 'Problem Set 5: Speller (Corrector Ortográfico en C)',
      notesUrl: 'https://cs50.harvard.edu/x/notes/5/',
      psetUrl: 'https://cs50.harvard.edu/x/psets/5/speller/',
      goal: 'Implementar las funciones `load`, `hash`, `check`, `size` y `unload` para verificar la ortografía de un texto cargando un diccionario en una tabla hash en C.',
      specs: [
        'Carga 140.000 palabras en la tabla hash asignando memoria dinámica.',
        'Implementa la función hash optimizada para evitar colisiones.',
        'Libera toda la memoria asignada en `unload` sin fugas en Valgrind.',
      ],
      usageExample: `$ ./speller texts/holmes.txt
WORDS MISSPELLED:     178
WORDS IN DICTIONARY:  143091
TIME IN load:         0.03s
TIME IN check:        0.04s`,
      check50: 'check50 cs50/problems/2024/x/speller',
      submit50: 'submit50 cs50/problems/2024/x/speller',
    },
    simpleVideoExplanations: [
      {
        chapterTitle: 'Mitad del vídeo · La magia de las Tablas Hash',
        analogyTitle: '🗄️ Analogía del archivador con 26 cajones con letras de la A a la Z',
        paragraphs: [
          'En vez de tener una sola pila gigante de 100.000 papeles, tienes un mueble con 26 cajones. Cuando llega una palabra que empieza por "M", vas directamente al cajón de la M.',
          'Eso es una tabla hash: una función matemática que te dice exactamente en qué cajón buscar sin tener que revisar los demás.',
        ],
      },
    ],
  },
  {
    id: 'module-6',
    weekLabel: 'Clase 6',
    title: 'Python: Sintaxis Limpia, Tipado Dinámico y Estructuras',
    subtitle: 'Adiós a los puntos y comas: indentación, listas, diccionarios y legibilidad',
    videoUrl: 'https://www.youtube.com/watch?v=F_fP_pY2l_M',
    youtubeId: 'LfaMVlDaQ24',
    language: 'python',
    verifiedTopics:
      'Comparativa C vs Python, tipado dinámico, sintaxis con indentación, strings como objetos de primera clase, listas, diccionarios, bucles for sobre colecciones, manejo de excepciones y bibliotecas estándar.',
    realWorldUseCase:
      'Desarrollar prototipos y servicios completos en una fracción del tiempo que requiere C.',
    feynmanPrompt:
      '¿Qué ventaja tiene que Python gestione la memoria automáticamente frente al uso de malloc en C?',
    starterChallengeTitle: 'Problem Set 6: DNA / Sentimental Mario en Python',
    starterCode: `# CS50 Clase 6 — Sentimental Mario en Python

height = 4

# TODO: Imprime la pirámide de Mario en Python usando un bucle 'for'
# Recuerda que en Python puedes multiplicar cadenas: " " * espacios + "#" * bloques

for row in range(1, height + 1):
    print(" " * (height - row) + "#" * row)
`,
    allowedConceptsConstraint:
      'SOLO puedes usar conceptos de Python vistos en la Clase 6 (variables, listas, diccionarios, slicing de strings, range, def y manejo de excepciones).',
    chapters: [
      {
        id: 'c6-ch1',
        chapterNumber: 1,
        title: 'De C a Python: Sintaxis y Tipado Dinámico',
        timeRange: '00:00 - 00:40',
        startSeconds: 0,
        summary: 'Cómo Python elimina la necesidad de declarar tipos explícitos y usa indentación en lugar de llaves {} para definir bloques de código.',
        microExercises: [
          {
            id: 'c6-ex1',
            title: 'Sentimental Mario: Multiplicación de Strings',
            duration: '5 min',
            prompt: 'En Python `"#" * 3` produce `"###"`. Imprime una fila con 3 espacios y 4 almohadillas en una sola línea.',
            language: 'python',
            starterCode: `# TODO: Imprime 3 espacios y 4 almohadillas multiplicando cadenas
print(" " * 3 + "#" * 4)
`,
            solutionCode: `print(" " * 3 + "#" * 4)
`,
            solutionExplanation: '1. En Python las cadenas son objetos con operadores sobrecargados.\n2. `" " * n` repite el espacio n veces de forma concisa e idiomática.'
          }
        ]
      },
      {
        id: 'c6-ch2',
        chapterNumber: 2,
        title: 'Diccionarios y Comprensión de Listas',
        timeRange: '00:40 - Final',
        startSeconds: 2400,
        summary: 'Estructuras de clave-valor nativas en Python y cómo procesar listas con expresiones funcionales de una línea.',
        microExercises: [
          {
            id: 'c6-ex2',
            title: 'Filtrar Estudiantes por Casa en Hogwarts',
            duration: '5 min',
            prompt: 'Dado un diccionario de alumnos y casas, usa un bucle for para imprimir solo los que pertenecen a "Gryffindor".',
            language: 'python',
            starterCode: `students = [
    {"name": "Harry", "house": "Gryffindor"},
    {"name": "Draco", "house": "Slytherin"},
    {"name": "Hermione", "house": "Gryffindor"},
]

# TODO: Imprime los nombres de los estudiantes de Gryffindor
`,
            solutionCode: `students = [
    {"name": "Harry", "house": "Gryffindor"},
    {"name": "Draco", "house": "Slytherin"},
    {"name": "Hermione", "house": "Gryffindor"},
]

for s in students:
    if s["house"] == "Gryffindor":
        print(s["name"])
`,
            solutionExplanation: '1. `for s in students` itera directamente sobre cada diccionario.\n2. `s["house"]` accede al valor asociado a la clave.'
          }
        ]
      }
    ],
    officialExercise: {
      title: 'Problem Set 6: Sentimental / DNA (Identificación Forense)',
      notesUrl: 'https://cs50.harvard.edu/x/notes/6/',
      psetUrl: 'https://cs50.harvard.edu/x/psets/6/dna/',
      goal: 'Identificar a una persona a partir de secuencias de ADN contando repeticiones consecutivas (STRs) en Python.',
      specs: [
        'Abre y lee archivos CSV y de texto en Python con `csv.DictReader`.',
        'Calcula la racha más larga de cada STR en la secuencia de ADN.',
        'Compara los conteos con la base de datos de personas e imprime el nombre coincidente.',
      ],
      usageExample: `$ python dna.py databases/small.csv sequences/1.txt
Bob`,
      check50: 'check50 cs50/problems/2024/x/dna',
      submit50: 'submit50 cs50/problems/2024/x/dna',
    },
    simpleVideoExplanations: [
      {
        chapterTitle: 'Mitad del vídeo · La libertad de Python',
        analogyTitle: '🚲 De conducir un coche con palanca de cambios manual (C) a una bicicleta eléctrica automática (Python)',
        paragraphs: [
          'En C tenías que vigilar el motor, los frenos y la gasolina (la memoria y los tipos).',
          'Python hace todo ese mantenimiento por ti en segundo plano para que tú solo tengas que preocuparte del destino al que quieres llegar.',
        ],
      },
    ],
  },
  {
    id: 'module-7',
    weekLabel: 'Clase 7',
    title: 'SQL: Bases de Datos Relacionales y Consultas',
    subtitle: 'Consultas declarativas, índices, llaves foráneas y filtrado con SQLite',
    videoUrl: 'https://www.youtube.com/watch?v=F_fP_pY2l_M',
    youtubeId: 'vFYbm0h15rU',
    language: 'sql',
    verifiedTopics:
      'Bases de datos relacionales, tablas, filas y columnas, sintaxis declarativa de SQL (SELECT, FROM, WHERE, ORDER BY, LIMIT), funciones de agregación (COUNT, AVG, SUM), JOINs entre múltiples tablas, llaves primarias y foráneas, e índices para acelerar búsquedas.',
    realWorldUseCase:
      'Gestionar y consultar millones de registros de usuarios, pedidos o productos con integridad garantizada.',
    feynmanPrompt:
      '¿En qué se diferencia pedirle a una base de datos lo que quieres (SQL declarativo) de programar el paso a paso en C o Python (imperativo)?',
    starterChallengeTitle: 'Problem Set 7: Fiftyville (Misterio de Deducción con SQL)',
    starterCode: `-- CS50 Clase 7 — Consulta Relacional en SQL
-- Tabla disponible: students (id, name, house, grade)

SELECT name, house, grade
FROM students
WHERE house = 'Gryffindor' AND grade >= 90
ORDER BY grade DESC;
`,
    allowedConceptsConstraint:
      'SOLO puedes usar conceptos de la Clase 7: consultas SQL con SELECT, WHERE, ORDER BY, GROUP BY, HAVING, JOINs y transacciones con SQLite.',
    chapters: [
      {
        id: 'c7-ch1',
        chapterNumber: 1,
        title: 'Consultas Básicas (SELECT, WHERE, ORDER BY)',
        timeRange: '00:00 - 00:40',
        startSeconds: 0,
        summary: 'Aprende a filtrar y ordenar filas de una base de datos especificando condiciones lógicas.',
        microExercises: [
          {
            id: 'c7-ex1',
            title: 'Filtrar Estudiantes con Calificación Sobresaliente',
            duration: '5 min',
            prompt: 'Escribe una consulta SQL que devuelva el nombre y la nota de los alumnos con nota superior o igual a 95 ordenados de mayor a menor.',
            language: 'sql',
            starterCode: `-- TODO: Selecciona name y grade de la tabla students donde grade >= 95 ordenado descendente
SELECT name, grade
FROM students
WHERE grade >= 95
ORDER BY grade DESC;
`,
            solutionCode: `SELECT name, grade
FROM students
WHERE grade >= 95
ORDER BY grade DESC;
`,
            solutionExplanation: '1. `WHERE grade >= 95` filtra las filas antes de presentarlas.\n2. `ORDER BY grade DESC` ordena los resultados de mayor a menor nota.'
          }
        ]
      },
      {
        id: 'c7-ch2',
        chapterNumber: 2,
        title: 'Funciones de Agregación y Agrupación (COUNT, GROUP BY)',
        timeRange: '00:40 - Final',
        startSeconds: 2400,
        summary: 'Cómo resumir datos numéricos calculando promedios, conteos y totales por categoría.',
        microExercises: [
          {
            id: 'c7-ex2',
            title: 'Contar Estudiantes por Casa en Hogwarts',
            duration: '5 min',
            prompt: 'Escribe una consulta que cuente cuántos alumnos hay en cada casa usando `COUNT(*)` y `GROUP BY house`.',
            language: 'sql',
            starterCode: `-- TODO: Cuenta los estudiantes por casa
SELECT house, COUNT(*) AS total
FROM students
GROUP BY house;
`,
            solutionCode: `SELECT house, COUNT(*) AS total
FROM students
GROUP BY house;
`,
            solutionExplanation: '1. `GROUP BY house` divide los datos en grupos según la casa.\n2. `COUNT(*)` calcula cuántas filas pertenecen a cada grupo.'
          }
        ]
      }
    ],
    officialExercise: {
      title: 'Problem Set 7: Fiftyville (El Robo del Pato de CS50)',
      notesUrl: 'https://cs50.harvard.edu/x/notes/7/',
      psetUrl: 'https://cs50.harvard.edu/x/psets/7/fiftyville/',
      goal: 'Resolver el misterio del robo del pato en la ciudad de Fiftyville cruzando registros de cajeros automáticos, llamadas telefónicas, cámaras de seguridad y vuelos en SQL.',
      specs: [
        'Consulta las entrevistas de los testigos (`crime_scene_reports` e `interviews`).',
        'Cruza los retiros de cajeros (`atm_transactions`) con los registros de matrículas en el parking (`bakery_security_logs`).',
        'Identifica al culpable, la ciudad a la que escapó y a su cómplice que compró el billete de avión.',
      ],
      usageExample: `$ sqlite3 fiftyville.db
The THIEF is: Bruce
The city the thief ESCAPED TO: New York City
The ACCOMPLICE is: Robin`,
      check50: 'check50 cs50/problems/2024/x/fiftyville',
      submit50: 'submit50 cs50/problems/2024/x/fiftyville',
    },
    simpleVideoExplanations: [
      {
        chapterTitle: 'Mitad del vídeo · ¿Qué es una base de datos relacional?',
        analogyTitle: '📊 Analogía de varias hojas de cálculo de Excel conectadas por números de identificación',
        paragraphs: [
          'En vez de repetir la dirección de un cliente en cada factura, guardas al cliente en una tabla y las facturas en otra con una etiqueta que apunta al cliente.',
          'SQL es el idioma con el que le pides al bibliotecario del ordenador que junte las dos hojas al instante.',
        ],
      },
    ],
  },
  {
    id: 'module-8',
    weekLabel: 'Clase 8',
    title: 'HTML, CSS y JavaScript: Frontend y la Web',
    subtitle: 'Estructura semántica, selectores CSS, el DOM y eventos interactivos',
    videoUrl: 'https://www.youtube.com/watch?v=F_fP_pY2l_M',
    youtubeId: '3rOwhP_c7g8',
    language: 'javascript',
    verifiedTopics:
      'Protocolos de internet (TCP/IP, DNS, HTTP), estructura de páginas con HTML5, estilos con CSS3 y diseño responsivo, programación interactiva en el navegador con JavaScript y manipulación del Document Object Model (DOM).',
    realWorldUseCase:
      'Construir interfaces visuales modernas que funcionen en cualquier móvil o navegador web.',
    feynmanPrompt:
      '¿Qué papel juega cada una de las tres tecnologías web (HTML, CSS y JS) en un edificio?',
    starterChallengeTitle: 'Problem Set 8: Homepage & Trivia Interactiva',
    starterCode: `// CS50 Clase 8 — Lógica Interactiva con JavaScript
function checkAnswer(selectedOption, correctAnswer) {
    if (selectedOption === correctAnswer) {
        return "¡Correcto! Respuesta acertada.";
    } else {
        return "Incorrecto. Vuelve a intentarlo.";
    }
}

console.log(checkAnswer("Paris", "Paris"));
`,
    allowedConceptsConstraint:
      'SOLO puedes usar conceptos de la Clase 8: HTML semántico, CSS, selectores, funciones JavaScript, eventos DOM y peticiones fetch.',
    chapters: [
      {
        id: 'c8-ch1',
        chapterNumber: 1,
        title: 'Estructura HTML y Estilos CSS',
        timeRange: '00:00 - 00:45',
        startSeconds: 0,
        summary: 'Cómo los navegadores leen el árbol de etiquetas HTML y aplican reglas de estilo en cascada.',
        microExercises: [
          {
            id: 'c8-ex1',
            title: 'Validador de Formatos HTML',
            duration: '5 min',
            prompt: 'Escribe una función en JavaScript que verifique si una cadena contiene etiquetas de apertura `<button>` y cierre `</button>`.',
            language: 'javascript',
            starterCode: `function hasButton(html) {
    // TODO: Comprueba si html incluye "<button>" y "</button>"
    return html.includes("<button>") && html.includes("</button>");
}

console.log(hasButton("<button>Haz clic</button>"));
`,
            solutionCode: `function hasButton(html) {
    return html.includes("<button>") && html.includes("</button>");
}

console.log(hasButton("<button>Haz clic</button>"));
`,
            solutionExplanation: '1. `html.includes` comprueba la presencia de subcadenas específicas dentro de un texto.'
          }
        ]
      },
      {
        id: 'c8-ch2',
        chapterNumber: 2,
        title: 'JavaScript y Eventos del DOM',
        timeRange: '00:45 - Final',
        startSeconds: 2700,
        summary: 'Responde a clics, pulsaciones de teclas y cambios de formulario actualizando la página en tiempo real.',
        microExercises: [
          {
            id: 'c8-ex2',
            title: 'Manejador de Respuestas de Trivia',
            duration: '5 min',
            prompt: 'Crea una función que devuelva un objeto con `{ correct: true, score: score + 1 }` si la respuesta elegida coincide con la correcta.',
            language: 'javascript',
            starterCode: `function evaluateAnswer(userPick, correctPick, currentScore) {
    // TODO: Compara userPick con correctPick y actualiza la puntuación
    if (userPick === correctPick) {
        return { correct: true, score: currentScore + 1 };
    }
    return { correct: false, score: currentScore };
}

console.log(evaluateAnswer("C", "C", 0));
`,
            solutionCode: `function evaluateAnswer(userPick, correctPick, currentScore) {
    if (userPick === correctPick) {
        return { correct: true, score: currentScore + 1 };
    }
    return { correct: false, score: currentScore };
}

console.log(evaluateAnswer("C", "C", 0));
`,
            solutionExplanation: '1. Retornar un objeto estructurado permite que la interfaz actualice tanto el color visual como el marcador de puntos.'
          }
        ]
      }
    ],
    officialExercise: {
      title: 'Problem Set 8: Trivia (Juego de Preguntas con DOM)',
      notesUrl: 'https://cs50.harvard.edu/x/notes/8/',
      psetUrl: 'https://cs50.harvard.edu/x/psets/8/trivia/',
      goal: 'Crear una página web interactiva con preguntas de opción múltiple y respuesta libre que cambie de color a verde o rojo al responder.',
      specs: [
        'Añade botones para preguntas de selección múltiple.',
        'Usa `addEventListener` para capturar el clic y pintar el botón de verde si es correcto o rojo si es incorrecto.',
        'Incluye un campo de texto con validación de respuesta libre.',
      ],
      usageExample: `$ open index.html
Boton verde al acertar, rojo al fallar.`,
      check50: 'check50 cs50/problems/2024/x/trivia',
      submit50: 'submit50 cs50/problems/2024/x/trivia',
    },
    simpleVideoExplanations: [
      {
        chapterTitle: 'Mitad del vídeo · La trinidad de la Web',
        analogyTitle: '🏗️ Analogía del edificio: Vigas, Pintura y Electricidad',
        paragraphs: [
          'HTML son los ladrillos y las vigas: define qué es un encabezado, un párrafo o un botón.',
          'CSS es la pintura, el diseño y las luces: decide qué tamaño, color y espaciado tiene cada habitación.',
          'JavaScript es la instalación eléctrica y los sensores: hace que al pulsar un interruptor se abra la puerta o suene una alarma.',
        ],
      },
    ],
  },
  {
    id: 'module-9',
    weekLabel: 'Clase 9',
    title: 'Flask: Backend, Rutas y Validación en Servidor',
    subtitle: 'Arquitectura cliente-servidor, formularios POST, sesiones y C$50 Finance',
    videoUrl: 'https://www.youtube.com/watch?v=F_fP_pY2l_M',
    youtubeId: '7rPZ_a5t_qg',
    language: 'python',
    verifiedTopics:
      'Frameworks web (Flask), modelo MVC / rutas con decoradores (@app.route), métodos HTTP (GET vs POST), renderizado de plantillas Jinja2, cookies y variables de sesión de usuario, y validación defensiva en el backend con C$50 Finance.',
    realWorldUseCase:
      'Construir aplicaciones completas con autenticación segura y transacciones en base de datos.',
    feynmanPrompt:
      '¿Por qué nunca debes confiar en los datos que envía el navegador del usuario al servidor?',
    starterChallengeTitle: 'Problem Set 9: C$50 Finance (Validador de Compras en Servidor)',
    starterCode: `# CS50 Clase 9 — Backend con Python y Flask (Validación en Servidor)

def execute_buy_order(symbol: str, shares: int, cash: float, price: float):
    # TODO:
    # 1. Valida que symbol no esté vacío y que shares > 0
    # 2. Calcula total_cost = shares * price
    # 3. Si total_cost > cash, devuelve {"ok": False, "error": "Fondos insuficientes"}
    # 4. En caso contrario devuelve {"ok": True, "total_cost": total_cost, "remaining_cash": round(cash - total_cost, 2)}
    return {"ok": False, "error": "No implementado"}

result = execute_buy_order("AAPL", 10, 10000.0, 185.50)
print(result)
`,
    allowedConceptsConstraint:
      'SOLO puedes hablar de los conceptos de la Clase 9: cliente vs servidor (backend con Python/Flask), validación de compras en C$50 Finance, diccionarios y condicionales.',
    chapters: [
      {
        id: 'c9-ch1',
        chapterNumber: 1,
        title: 'Arquitectura Cliente-Servidor y Rutas HTTP',
        timeRange: '00:00 - 00:45',
        startSeconds: 0,
        summary: 'Cómo viajan las peticiones GET y POST desde el navegador hasta los endpoints de Flask en el servidor.',
        microExercises: [
          {
            id: 'c9-ex1',
            title: 'Validador de Transacciones Financieras',
            duration: '5 min',
            prompt: 'Implementa una función en Python que verifique que el número de acciones sea un entero estrictamente positivo antes de procesar una compra.',
            language: 'python',
            starterCode: `def validate_shares(shares_str):
    # TODO: Devuelve True si es un número entero positivo > 0, de lo contrario False
    try:
        shares = int(shares_str)
        return shares > 0
    except ValueError:
        return False

print("Es valido 5:", validate_shares("5"))
print("Es valido -2:", validate_shares("-2"))
print("Es valido abc:", validate_shares("abc"))
`,
            solutionCode: `def validate_shares(shares_str):
    try:
        shares = int(shares_str)
        return shares > 0
    except ValueError:
        return False

print("Es valido 5:", validate_shares("5"))
print("Es valido -2:", validate_shares("-2"))
print("Es valido abc:", validate_shares("abc"))
`,
            solutionExplanation: '1. `int(shares_str)` convierte texto a número, lanzando ValueError si contiene letras o decimales.\n2. `shares > 0` previene fraudes donde un usuario intente comprar cantidades negativas.'
          }
        ]
      }
    ],
    officialExercise: {
      title: 'Problem Set 9: C$50 Finance (Server-Side Transaction Validator)',
      notesUrl: 'https://cs50.harvard.edu/x/notes/9/',
      psetUrl: 'https://cs50.harvard.edu/x/psets/9/finance/',
      goal: 'Construir la lógica de validación en servidor del proyecto C$50 Finance para verificar compras de acciones (`symbol`, `shares`, `user_cash`, `stock_price`) e impedir saldos negativos.',
      specs: [
        'Comprueba en `execute_buy_order` que `symbol` no esté vacío y que `shares > 0`.',
        'Calcula el coste total: `total_cost = shares * price`.',
        'Si `total_cost > cash`, devuelve `{"ok": False, "error": "Fondos insuficientes"}`.',
        'En caso contrario, devuelve `{"ok": True, "total_cost": total_cost, "remaining_cash": round(cash - total_cost, 2)}`.',
      ],
      usageExample: `$ python3 finance.py
{'ok': True, 'total_cost': 1855.0, 'remaining_cash': 8145.0}`,
      check50: 'check50 cs50/problems/2024/x/finance',
      submit50: 'submit50 cs50/problems/2024/x/finance',
    },
    simpleVideoExplanations: [
      {
        chapterTitle: 'Mitad del vídeo · Por qué el Servidor (Backend) nunca confía a ciegas',
        analogyTitle: '🏦 Analogía del cajero del banco que comprueba tu saldo en la caja fuerte',
        paragraphs: [
          'Cualquier persona puede cambiar lo que se muestra en su propio navegador web igual que alguien puede escribir a bolígrafo "Tengo 1.000.000 €" en un recibo de papel.',
          'El código del servidor (Backend en Python/Flask) es el empleado dentro de la cámara acorazada del banco: antes de aprobar la compra de acciones en C$50 Finance, comprueba que el número de acciones sea positivo y que tu saldo real alcance para pagar.',
        ],
      },
    ],
  },
  {
    id: 'module-10',
    weekLabel: 'Clase 10',
    title: 'Inteligencia Artificial, Modelos de Lenguaje y Proyecto Final',
    subtitle: 'Cómo funcionan los modelos de IA y cómo verificar sus respuestas en tus proyectos',
    videoUrl: 'https://www.youtube.com/watch?v=MTSE0ZOpyDc',
    youtubeId: 'MTSE0ZOpyDc',
    language: 'python',
    verifiedTopics:
      'Árboles de decisión en juegos, cómo predice la siguiente palabra un modelo de lenguaje (LLM), por qué las IAs pueden inventar datos y cómo validar sus respuestas JSON con código Python.',
    realWorldUseCase:
      'Conectar un modelo de IA a tu aplicación verificando siempre con Python que la respuesta tenga el formato y la confianza requeridos.',
    feynmanPrompt:
      '¿Por qué un buen programador valida con `try / except` la respuesta de una IA antes de guardarla en su base de datos?',
    starterChallengeTitle: 'Problem Set 10: Validador de Respuesta Estructurada de LLM & Capstone',
    starterCode: `# CS50 Clase 10 — Validación de Salidas Estructuradas de IA (JSON Schema)
import json

raw_llm_output = '{"intent": "schedule_review", "confidence": 0.94, "topic": "Pointers"}'

def validate_ai_response(raw_json):
    # TODO:
    # 1. Parsea raw_json usando json.loads() dentro de un bloque try/except
    # 2. Verifica que contenga las claves "intent", "confidence" y "topic"
    # 3. Comprueba que 0.0 <= data["confidence"] <= 1.0
    # 4. Devuelve (True, data) si es válido o (False, mensaje_error)
    try:
        data = json.loads(raw_json)
        for key in ["intent", "confidence", "topic"]:
            if key not in data:
                return False, f"Falta la clave {key}"
        if not (0.0 <= data["confidence"] <= 1.0):
            return False, "Confianza fuera de rango"
        return True, data
    except Exception as e:
        return False, str(e)

is_valid, result = validate_ai_response(raw_llm_output)
print("Valid:", is_valid)
print("Result:", result)
`,
    allowedConceptsConstraint:
      'SOLO puedes hablar de los conceptos de la Clase 10: fundamentos de IA explicados en CS50, predicción de palabras, validación de JSON con json.loads y try/except en Python.',
    chapters: [
      {
        id: 'c10-ch1',
        chapterNumber: 1,
        title: 'Modelos de Lenguaje (LLMs) y Validación Defensiva',
        timeRange: '00:00 - Final',
        startSeconds: 0,
        summary: 'Cómo los modelos neuronales generan texto predictivo y por qué es imprescindible validar sus salidas JSON antes de persistirlas.',
        microExercises: [
          {
            id: 'c10-ex1',
            title: 'Validador de JSON Schema con try/except',
            duration: '5 min',
            prompt: 'Escribe una función en Python que intente parsear una cadena con `json.loads` y capture cualquier `json.JSONDecodeError`.',
            language: 'python',
            starterCode: `import json

def parse_safe(payload):
    # TODO: Usa try / except para parsear payload de forma segura
    try:
        return json.loads(payload)
    except Exception:
        return None

print(parse_safe('{"ok": true}'))
print(parse_safe('JSON INVALIDO'))
`,
            solutionCode: `import json

def parse_safe(payload):
    try:
        return json.loads(payload)
    except Exception:
        return None

print(parse_safe('{"ok": true}'))
print(parse_safe('JSON INVALIDO'))
`,
            solutionExplanation: '1. `try / except` intercepta fallos de sintaxis sin detener la aplicación bruscamente.\n2. Es el estándar de oro en aplicaciones que consumen APIs de modelos de lenguaje.'
          }
        ]
      }
    ],
    officialExercise: {
      title: 'CS50 Artificial Intelligence & Final Project Validator',
      notesUrl: 'https://cs50.harvard.edu/x/notes/ai/',
      psetUrl: 'https://cs50.harvard.edu/x/project/',
      goal: 'Implementar un validador defensivo en Python (`validate_ai_response`) que parsee la respuesta JSON de un modelo de lenguaje y verifique sus campos obligatorios y rangos numéricos.',
      specs: [
        'Usa un bloque `try / except` para convertir `raw_json` en diccionario con `json.loads(raw_json)`.',
        'Verifica que el diccionario incluya las claves `"intent"`, `"confidence"` y `"topic"`.',
        'Comprueba que `0.0 <= data["confidence"] <= 1.0` y devuelve `(True, data)`.',
      ],
      usageExample: `$ python3 project.py
Valid: True
Result: {'intent': 'schedule_review', 'confidence': 0.94, 'topic': 'Pointers'}`,
      check50: 'check50 cs50/problems/2024/x/project',
      submit50: 'submit50 cs50/problems/2024/x/project',
    },
    simpleVideoExplanations: [
      {
        chapterTitle: 'Mitad del vídeo · Cómo piensa un Modelo de Lenguaje (LLM) y por qué validarlo',
        analogyTitle: '📱 Analogía del texto predictivo de tu móvil multiplicado por mil millones',
        paragraphs: [
          'Un modelo de lenguaje no "sabe" verdades absolutas como una calculadora; funciona como el teclado predictivo de tu teléfono cuando escribes "Buenos..." y te sugiere "...días" porque estadísticamente es la palabra más probable tras haber leído millones de textos.',
          'Como a veces puede equivocarse o desordenar el formato, los ingenieros usan Python como un control de calidad en la puerta: revisan con `json.loads` que la respuesta traiga todas las casillas rellenas antes de darla por buena.',
        ],
      },
    ],
    isAiExtension: true,
  },
];
