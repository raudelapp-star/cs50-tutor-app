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
      'Paso de bloques de Scratch a texto en C, compilador (traductor de código fuente a binario), tipos de datos (int, float, char), condicionales (if/else) y bucles (while, for) para construir la pirámide de Mario.',
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
        chapterTitle: 'Inicio del vídeo · De bloques de Scratch a texto en C y el Compilador',
        analogyTitle: '🗣️ Analogía del traductor simultáneo entre dos idiomas',
        paragraphs: [
          'En la Clase 0 encajabas el bloque "Decir Hola" en Scratch; en la Clase 1 escribes `printf("Hola\\n");` en lenguaje C. Es exactamente la misma idea lógica, solo que ahora la escribes con el teclado en lugar de arrastrarla con el ratón.',
          'Como el ordenador solo entiende ceros y unos (interruptores), necesitamos un programa llamado compilador que actúa como un traductor profesional: lee tu archivo de texto en C y lo convierte en un archivo de ceros y unos listo para ejecutarse.',
        ],
      },
      {
        chapterTitle: 'Mitad del vídeo · Variables tipadas y Bucles (Loops)',
        analogyTitle: '📦 Analogía de cajas etiquetadas según lo que guardas dentro',
        paragraphs: [
          'En C, cada vez que creas una variable debes ponerle una etiqueta indicando qué tipo de dato guardará: `int` es una caja solo para números enteros (como `int height = 4;`), mientras que `char` guarda una sola letra. Así el ordenador sabe exactamente cuánto espacio reservar.',
          'Para no repetir la misma línea diez veces, usamos un bucle `for`, que es como un contador de gimnasio: empieza en la repetición 1, comprueba si ya llegó a `height`, hace el ejercicio y suma 1 en cada vuelta.',
        ],
      },
      {
        chapterTitle: 'Final del vídeo · Cómo pensar la Pirámide de Mario',
        analogyTitle: '🧱 Analogía de colocar ladrillos fila por fila en una cuadrícula',
        paragraphs: [
          'En la pantalla no puedes pegar un ladrillo `#` flotando a la derecha de la nada: el cursor siempre escribe de izquierda a derecha. Por eso, para que la cima de una pirámide de 4 pisos quede a la derecha, primero debes "empujarla" imprimiendo 3 espacios invisibles y luego 1 ladrillo `#`.',
          'En el piso 2 imprimes 2 espacios y 2 ladrillos `#`, y así sucesivamente. Si te fijas, en cada fila la suma de espacios más ladrillos siempre da la altura total.',
        ],
      },
    ],
  },
  {
    id: 'module-2',
    weekLabel: 'Clase 2',
    title: 'Arrays, Strings, Argumentos CLI y Criptografía',
    subtitle: 'Taquillas en fila (arrays), textos como cadenas de letras y cifrado César',
    videoUrl: 'https://www.youtube.com/watch?v=G7erq8mRYdk',
    youtubeId: 'G7erq8mRYdk',
    language: 'c',
    verifiedTopics:
      'Cómo se guarda una lista de datos en memoria contigua (arrays), strings como filas de letras terminadas en el centinela \\0, recorrer letra por letra con un bucle y desplazar letras para cifrar mensajes (Caesar).',
    realWorldUseCase:
      'Procesar cualquier palabra, contraseña o mensaje de texto recorriendo sus letras una por una y transformándolas según una regla.',
    feynmanPrompt:
      '¿Por qué el ordenador coloca un símbolo especial invisible (`\\0`) justo después de la última letra de una palabra guardada en memoria?',
    starterChallengeTitle: 'Problem Set 2: Caesar (Cifrado por Desplazamiento ASCII)',
    starterCode: `#include <stdio.h>

int main(void)
{
    char plaintext[] = "HELLO";
    int key = 1;

    printf("Plaintext: %s\\n", plaintext);
    // TODO: Recorre cada carácter de plaintext hasta encontrar '\\0'
    // Desplaza cada letra mayúscula usando la fórmula:
    // char rotated = ((plaintext[i] - 'A' + key) % 26) + 'A';
    // e imprime el resultado en "Ciphertext: "

    return 0;
}
`,
    allowedConceptsConstraint:
      'SOLO puedes usar conceptos hasta la Clase 2 de CS50 (C básico, arrays, strings con \\0, código ASCII y cifrado César). PROHIBIDO hablar de punteros avanzados, malloc, Python o SQL.',
    officialExercise: {
      title: 'Problem Set 2: Caesar Cipher',
      notesUrl: 'https://cs50.harvard.edu/x/notes/2/',
      psetUrl: 'https://cs50.harvard.edu/x/psets/2/caesar/',
      goal: 'Cifrar un mensaje de texto (`char plaintext[]`) desplazando cada letra en el alfabeto según una clave numérica (`int key`) aplicando la rueda del abecedario `(c - \'A\' + key) % 26 + \'A\'`.',
      specs: [
        'Mantén el arreglo `char plaintext[] = "HELLO";` y la clave `int key = 1;`.',
        'Recorre el arreglo con un bucle `for (int i = 0; plaintext[i] != \'\\0\'; i++)`.',
        'Para cada letra mayúscula, conviértela a posición del abecedario (`0` a `25`) restando `\'A\'`, suma `key`, aplica `% 26` y vuelve a sumar `\'A\'`.',
        'Imprime el texto cifrado precedido por `Ciphertext: ` y finaliza con `\\n`.',
      ],
      usageExample: `$ ./caesar
Plaintext: HELLO
Ciphertext: IFMMP`,
      check50: 'check50 cs50/problems/2024/x/caesar',
      submit50: 'submit50 cs50/problems/2024/x/caesar',
    },
    simpleVideoExplanations: [
      {
        chapterTitle: 'Primera parte del vídeo · ¿Qué es un Array?',
        analogyTitle: '🗄️ Analogía de una fila de taquillas numeradas desde el 0',
        paragraphs: [
          'En lugar de crear veinte variables sueltas (`nota1`, `nota2`, `nota3`...), un array es como un pasillo de taquillas de gimnasio pegadas una al lado de la otra bajo un mismo nombre. La primera taquilla siempre lleva el número 0, la segunda el 1, y así sucesivamente.',
          'Como todas las taquillas están juntas en fila, puedes pedirle a un bucle `for` que vaya abriendo la taquilla `i` paso a paso en una fracción de segundo.',
        ],
      },
      {
        chapterTitle: 'Mitad del vídeo · Palabras (Strings) y el punto final invisible (\\0)',
        analogyTitle: '🚂 Analogía de un tren de letras con un vagón de cola que avisa del final',
        paragraphs: [
          'Para el ordenador, la palabra `"HOLA"` no es más que un array de 4 taquillas seguidas con las letras `H`, `O`, `L`, `A` más una quinta taquilla extra con el símbolo `\\0` (llamado carácter nulo).',
          'Ese `\\0` funciona como el vagón de cola de un tren: le avisa a `printf` de que ahí termina exactamente la palabra y que no debe seguir leyendo las taquillas vecinas.',
        ],
      },
      {
        chapterTitle: 'Final del vídeo · Criptografía y la rueda del Cifrado César',
        analogyTitle: '🎡 Analogía de las agujas de un reloj que vuelven a empezar tras las 12',
        paragraphs: [
          'Cifrar un mensaje con el método de Julio César consiste en mover cada letra unos pasos hacia adelante en el abecedario: si la clave es 1, la `A` se convierte en `B` y `"HELLO"` se convierte en `"IFMMP"`.',
          '¿Y qué pasa si llegas a la `Z` y sumas 1? Igual que un reloj pasa de las 12 de nuevo a la 1 usando el resto de dividir (`%`), en programación usamos `% 26` para dar la vuelta al abecedario y volver suavemente a la `A`.',
        ],
      },
    ],
  },
  {
    id: 'module-3',
    weekLabel: 'Clase 3',
    title: 'Algoritmos: Búsqueda, Ordenamiento, Big O y Recursividad',
    subtitle: 'Velocidad de algoritmos, ordenar cartas y muñecas rusas (recursividad)',
    videoUrl: 'https://www.youtube.com/watch?v=zU0DbilHvYM',
    youtubeId: 'zU0DbilHvYM',
    language: 'python',
    verifiedTopics:
      'Búsqueda lineal vs búsqueda binaria, métodos para ordenar datos (Bubble Sort, Selection Sort, Merge Sort), cómo medir la rapidez (Big O) y funciones que se llaman a sí mismas con un caso base (recursividad).',
    realWorldUseCase:
      'Elegir el método adecuado para buscar y contar datos (como votos en una elección) sin que el ordenador se vuelva lento cuando crecen los participantes.',
    feynmanPrompt:
      '¿Por qué no puedes aplicar búsqueda binaria sobre una lista de nombres que está desordenada?',
    starterChallengeTitle: 'Problem Set 3: Plurality (Conteo Electoral y Búsqueda del Ganador)',
    starterCode: `# CS50 Clase 3 — Plurality Election
# Cuenta los votos de cada candidato y determina el ganador con mayor puntuación.

candidates = [
    {"name": "Alice", "votes": 0},
    {"name": "Bob", "votes": 0},
    {"name": "Charlie", "votes": 0},
]

ballots = ["Alice", "Bob", "Alice", "Charlie", "Alice", "Bob"]

def vote(name):
    # TODO: Busca el candidato cuyo 'name' coincida, suma 1 a 'votes' y devuelve True.
    # Si no existe, devuelve False.
    return False

def print_winner():
    # TODO: Encuentra el número máximo de votos e imprime el nombre del candidato ganador.
    pass

for b in ballots:
    vote(b)

print_winner()
`,
    allowedConceptsConstraint:
      'SOLO puedes hablar de los conceptos de la Clase 3: búsqueda lineal, búsqueda binaria, ordenamiento (Selection/Bubble/Merge Sort), velocidad Big O, candidatos con nombre/votos y recursividad con caso base.',
    officialExercise: {
      title: 'Problem Set 3: Plurality Election',
      notesUrl: 'https://cs50.harvard.edu/x/notes/3/',
      psetUrl: 'https://cs50.harvard.edu/x/psets/3/plurality/',
      goal: 'Implementar las funciones `vote(name)` y `print_winner()` para contabilizar papeletas electorales sobre una lista de candidatos y determinar mediante búsqueda lineal quién obtuvo el máximo número de votos.',
      specs: [
        'En `vote(name)`, recorre la lista `candidates`. Si `candidate["name"] == name`, incrementa `candidate["votes"] += 1` y devuelve `True`.',
        'Si tras recorrer toda la lista el nombre no existe, `vote(name)` debe devolver `False`.',
        'En `print_winner()`, calcula primero el valor máximo de `votes` entre todos los elementos de `candidates`.',
        'Imprime el nombre (`candidate["name"]`) de cada candidato cuyo número de votos sea igual a ese máximo.',
      ],
      usageExample: `$ python3 plurality.py
Winner: Alice (3 votes)`,
      check50: 'check50 cs50/problems/2024/x/plurality',
      submit50: 'submit50 cs50/problems/2024/x/plurality',
    },
    simpleVideoExplanations: [
      {
        chapterTitle: 'Inicio del vídeo · Búsqueda Lineal vs. Binaria y Big O',
        analogyTitle: '🚪 Analogía de buscar a un amigo detrás de 10 puertas cerradas',
        paragraphs: [
          'Si los números detrás de las puertas están mezclados al azar, no tienes más remedio que abrir puerta por puerta desde la primera hasta la última (Búsqueda Lineal). Pero si están ordenados de menor a mayor, puedes abrir directamente la puerta del centro y descartar la mitad de las puertas en cada paso (Búsqueda Binaria).',
          'Los informáticos llaman "Big O" simplemente a responder: "¿Cuánto más tardaré si mañana hay el doble de puertas?".',
        ],
      },
      {
        chapterTitle: 'Mitad del vídeo · Cómo ordena un ordenador (Ordenar una baraja)',
        analogyTitle: '🃏 Analogía de ordenar las cartas que tienes en la mano',
        paragraphs: [
          'Cuando te reparten cartas desordenadas en un juego de mesa, sueles buscar la carta más pequeña de todas y colocarla al principio, luego la segunda más pequeña, y así hasta terminar (eso es Selection Sort).',
          'Otra forma mucho más rápida cuando tienes miles de cartas es dividir el mazo en dos mitades, ordenar cada mitad y luego ir mezclando las dos pilas ordenadas fijándote solo en la carta superior de cada montón (Merge Sort).',
        ],
      },
      {
        chapterTitle: 'Final del vídeo · Recursividad',
        analogyTitle: '🪆 Analogía de las muñecas rusas (Matrioskas) con una muñeca final maciza',
        paragraphs: [
          'Una función recursiva es una tarea que para resolverse abre una versión un poquito más pequeña de sí misma, igual que al abrir una muñeca rusa encuentras otra idéntica pero más pequeña dentro.',
          'Para que no abras muñecas hasta el infinito, toda recursividad necesita una última muñeca pequeñita que ya no se abre (el "caso base"), momento en el que das la tarea por terminada.',
        ],
      },
    ],
  },
  {
    id: 'module-4',
    weekLabel: 'Clase 4',
    title: 'Memoria, Punteros, Direcciones y Gestión Dinámica',
    subtitle: 'Direcciones postales de la memoria (& y *), intercambiar vasos y punteros',
    videoUrl: 'https://www.youtube.com/watch?v=xRW70LgrEho',
    youtubeId: 'xRW70LgrEho',
    language: 'c',
    verifiedTopics:
      'Direcciones de memoria (hexadecimal), el operador & (dime la dirección postal) y * (ve a esa dirección), por qué intercambiar dos variables requiere un vaso auxiliar (swap) y pedir memoria prestada con malloc/free.',
    realWorldUseCase:
      'Entender dónde viven realmente los datos en la memoria RAM y cómo modificar un dato original sin hacer copias innecesarias.',
    feynmanPrompt:
      'Si tienes un vaso lleno de zumo de naranja y otro lleno de agua, ¿por qué necesitas un tercer vaso vacío para intercambiar sus líquidos?',
    starterChallengeTitle: 'Problem Set 4: Pointers & Swap por Referencia en Memoria',
    starterCode: `#include <stdio.h>

int main(void)
{
    int a = 10;
    int b = 20;

    printf("Before swap: a = %d, b = %d\\n", a, b);

    // TODO: Declara una variable temporal 'int tmp' y realiza el intercambio
    // de valores e imprime "After swap: a = %d, b = %d\\n"

    return 0;
}
`,
    allowedConceptsConstraint:
      'SOLO puedes hablar de los conceptos de la Clase 4: memoria RAM, direcciones postales (&), punteros (*), el intercambio de valores con un vaso temporal (swap) y pedir/devolver memoria (malloc/free).',
    officialExercise: {
      title: 'Problem Set 4: Memory Swap & Pointer Indirection',
      notesUrl: 'https://cs50.harvard.edu/x/notes/4/',
      psetUrl: 'https://cs50.harvard.edu/x/psets/4/',
      goal: 'Comprender cómo se intercambian dos valores en memoria utilizando una variable auxiliar `int tmp` evitando sobrescribir el valor original antes de copiarlo.',
      specs: [
        'Conserva las variables iniciales `int a = 10;` e `int b = 20;`.',
        'Utiliza una variable temporal `int tmp` para guardar el valor original de `a` antes de sobrescribirlo.',
        'Asigna el valor de `b` en `a`, y después asigna `tmp` en `b`.',
        'Imprime el estado final exactamente con `printf("After swap: a = %d, b = %d\\n", a, b);`.',
      ],
      usageExample: `$ ./swap
Before swap: a = 10, b = 20
After swap: a = 20, b = 10`,
      check50: 'check50 cs50/problems/2024/x/filter/less',
      submit50: 'submit50 cs50/problems/2024/x/filter/less',
    },
    simpleVideoExplanations: [
      {
        chapterTitle: 'Inicio del vídeo · ¿Qué es un Puntero en C?',
        analogyTitle: '📬 Analogía de la casa de tu amigo frente a su dirección escrita en un papel',
        paragraphs: [
          'Una variable normal (`int a = 10;`) es como una casa donde vive el número 10. Un puntero (`int *p`) no es otra casa, sino un papelito donde apuntas la calle y el número exacto donde está ubicada esa casa en la memoria del ordenador.',
          'El símbolo `&a` significa "¿cuál es la dirección de esta casa?", mientras que el asterisco `*p` significa "camina hasta la dirección escrita en el papel y mira qué hay dentro".',
        ],
      },
      {
        chapterTitle: 'Mitad del vídeo · El problema de intercambiar dos valores (Swap)',
        analogyTitle: '🥤 Analogía de dos vasos llenos y un tercer vaso vacío',
        paragraphs: [
          'Imagina que tienes zumo en el vaso `a` y leche en el vaso `b`. Si viertes directamente el vaso `b` sobre el `a`, pierdes el zumo para siempre. En programación pasa igual: si haces `a = b;`, el valor antiguo de `a` desaparece.',
          'Por eso necesitamos un tercer vaso vacío llamado `int tmp`: primero viertes `a` en `tmp`, luego pasas `b` a `a`, y por último viertes `tmp` en `b`.',
        ],
      },
    ],
  },
  {
    id: 'module-5',
    weekLabel: 'Clase 5',
    title: 'Estructuras de Datos: Listas Enlazadas, Hash Tables y Árboles',
    subtitle: 'Colas de supermercado, búsquedas del tesoro y archivadores alfabéticos',
    videoUrl: 'https://www.youtube.com/watch?v=Q0xvQT87ekA',
    youtubeId: 'Q0xvQT87ekA',
    language: 'python',
    verifiedTopics:
      'Colas (Queues FIFO), Pilas (Stacks LIFO), Listas Enlazadas (nodos conectados por flechas), Tablas Hash (clasificar por inicial en cubetas) y Árboles de búsqueda.',
    realWorldUseCase:
      'Organizar miles de palabras o contactos en cajones ordenados por su primera letra para encontrarlos al instante.',
    feynmanPrompt:
      '¿En qué se parece una Tabla Hash a un archivador con 26 cajones etiquetados de la A a la Z?',
    starterChallengeTitle: 'Problem Set 5: Speller (Función Hash y Tabla de Buckets)',
    starterCode: `# CS50 Clase 5 — Speller Hash Table
# Implementa una función hash que asigne cada palabra a un bucket entre 0 y N - 1.

N = 26
words = ["apple", "banana", "avocado", "blueberry", "cherry"]

def hash_word(word):
    # TODO: Devuelve el índice del bucket (0 a 25) según la primera letra de 'word'
    # Pista: usa (ord(word[0].upper()) - ord('A')) % N
    return 0

for w in words:
    print(f"{w} -> bucket {hash_word(w)}")
`,
    allowedConceptsConstraint:
      'SOLO puedes hablar de los conceptos de la Clase 5: colas, pilas, listas enlazadas, tablas hash (cajones de la A a la Z) y colisiones.',
    officialExercise: {
      title: 'Problem Set 5: Speller (Hash Function & Buckets)',
      notesUrl: 'https://cs50.harvard.edu/x/notes/5/',
      psetUrl: 'https://cs50.harvard.edu/x/psets/5/speller/',
      goal: 'Diseñar e implementar la función `hash_word(word)` del corrector ortográfico Speller de CS50 para clasificar palabras en `N = 26` cubetas (buckets) según su letra inicial.',
      specs: [
        'Toma el primer carácter de la palabra en mayúscula (`word[0].upper()`) y calcula su cajón entre `0` y `25` con `(ord(word[0].upper()) - ord(\'A\')) % N`.',
        'Recorre la lista `words` e imprime cada palabra junto con el número de bucket asignado.',
        'Observa cómo `"apple"` y `"avocado"` caen en el mismo cajón `0` (colisión).',
      ],
      usageExample: `$ python3 speller.py
apple -> bucket 0
banana -> bucket 1
avocado -> bucket 0
blueberry -> bucket 1
cherry -> bucket 2`,
      check50: 'check50 cs50/problems/2024/x/speller',
      submit50: 'submit50 cs50/problems/2024/x/speller',
    },
    simpleVideoExplanations: [
      {
        chapterTitle: 'Inicio del vídeo · Listas Enlazadas (Linked Lists)',
        analogyTitle: '🗺️ Analogía de una gymkana o búsqueda del tesoro con pistas',
        paragraphs: [
          'En un array normal todas las taquillas tienen que estar pegadas en la misma pared. Una Lista Enlazada, en cambio, funciona como una búsqueda del tesoro: el primer cofre guarda un dato y una nota con la dirección exacta de en qué rincón de la casa está escondido el segundo cofre.',
          'Gracias a eso, puedes añadir nuevos cofres en cualquier momento sin tener que mudar toda la fila de sitio.',
        ],
      },
      {
        chapterTitle: 'Mitad del vídeo · Tablas Hash y Colisiones',
        analogyTitle: '🗂️ Analogía del archivador de una clínica con 26 cajones (A–Z)',
        paragraphs: [
          'Si tienes un millón de fichas de pacientes y quieres encontrar a "Beatriz" sin revisar todas las fichas, usas un archivador con 26 cajones de la A a la Z. La "función hash" es simplemente mirar la primera letra ("B") y saber al instante que debes abrir el cajón número 1.',
          'Cuando dos personas empiezan por la misma letra (como "Ana" y "Alberto"), ambas fichas van al mismo cajón A: a eso lo llamamos una "colisión", y lo resolvemos enganchando las fichas de ese cajón una detrás de otra.',
        ],
      },
    ],
  },
  {
    id: 'module-6',
    weekLabel: 'Clase 6',
    title: 'Python: De C a Alto Nivel, Librerías y Manejo de Excepciones',
    subtitle: 'Escribir menos código y más legible en Python para analizar cadenas de ADN',
    videoUrl: 'https://www.youtube.com/watch?v=N3zVFYQu3bU',
    youtubeId: 'N3zVFYQu3bU',
    language: 'python',
    verifiedTopics:
      'Traducción de lo aprendido en C a Python (sin puntos y comas ni gestión manual de memoria), listas, diccionarios y búsqueda de patrones repetidos en texto (análisis de ADN).',
    realWorldUseCase:
      'Analizar textos largos, archivos de datos o secuencias biológicas con pocas líneas de código claro.',
    feynmanPrompt:
      '¿Cómo buscarías cuántas veces aparece la palabra `"AGATC"` dentro de una frase larga usando una ventana deslizante?',
    starterChallengeTitle: 'Problem Set 6: DNA (Conteo de Repeticiones STR en Secuencias)',
    starterCode: `# CS50 Clase 6 — DNA Sequence Analyzer
# Cuenta cuántas veces aparece un marcador genético (ej. "AGATC") en una secuencia de ADN.

sequence = "AAGATCGAGATCGAGATCGT"
subsequence = "AGATC"

def count_occurrences(seq, sub):
    # TODO: Cuenta y devuelve cuántas veces aparece 'sub' dentro de 'seq'
    return 0

print("STR:", subsequence)
print("Repeticiones encontradas:", count_occurrences(sequence, subsequence))
`,
    allowedConceptsConstraint:
      'SOLO puedes hablar de los conceptos de la Clase 6: sintaxis de Python frente a C, cadenas de texto (strings), listas, diccionarios y conteo de subcadenas en el ejercicio de ADN.',
    officialExercise: {
      title: 'Problem Set 6: DNA Profiling in Python',
      notesUrl: 'https://cs50.harvard.edu/x/notes/6/',
      psetUrl: 'https://cs50.harvard.edu/x/psets/6/dna/',
      goal: 'Analizar una cadena de ADN (`sequence`) en Python para identificar cuántas veces aparece un marcador genético corto (`subsequence = "AGATC"`).',
      specs: [
        'Completa la función `count_occurrences(seq, sub)` utilizando el método `.count(sub)` de Python o recorriendo la cadena con una ventana del tamaño `len(sub)`.',
        'Devuelve el número entero total de apariciones e imprímelo por terminal.',
      ],
      usageExample: `$ python3 dna.py
STR: AGATC
Repeticiones encontradas: 3`,
      check50: 'check50 cs50/problems/2024/x/dna',
      submit50: 'submit50 cs50/problems/2024/x/dna',
    },
    simpleVideoExplanations: [
      {
        chapterTitle: 'Inicio del vídeo · Pasar de C a Python',
        analogyTitle: '🚗 Analogía de pasar de un coche con marchas manuales a uno automático',
        paragraphs: [
          'Aprender C primero fue como aprender a conducir con cambio manual: entendiste cómo funcionan el embrague y las revoluciones del motor (la memoria y los tipos de datos). Python es un coche automático moderno: sigue teniendo un motor por debajo, pero cambia de marcha y gestiona la memoria por ti.',
          'Lo que en C te llevaba diez líneas con llaves `{}` y puntos y comas `;`, en Python se escribe casi como una frase normal en inglés.',
        ],
      },
      {
        chapterTitle: 'Segunda mitad del vídeo · Buscar patrones en el ADN',
        analogyTitle: '🔍 Analogía de deslizar una lupa de 5 letras sobre una tira de papel',
        paragraphs: [
          'El ADN humano se representa con cuatro letras (`A`, `C`, `G`, `T`). Para identificar a una persona en un laboratorio forense, los científicos cuentan cuántas veces se repite un trocito concreto, como `"AGATC"`.',
          'En Python puedes deslizar una ventana de 5 letras a lo largo de toda la tira de texto o usar sus herramientas de cadenas para contar al instante cuántas veces aparece ese patrón.',
        ],
      },
    ],
  },
  {
    id: 'module-7',
    weekLabel: 'Clase 7',
    title: 'SQL, Bases de Datos Relacionales y Prevención de SQL Injection',
    subtitle: 'Hojas de cálculo con superpoderes y preguntas en lenguaje SQL',
    videoUrl: 'https://www.youtube.com/watch?v=VnfMRaZUSrc',
    youtubeId: 'VnfMRaZUSrc',
    language: 'sql',
    verifiedTopics:
      'Tablas de bases de datos (filas y columnas), consultas SELECT, filtros WHERE, ordenamiento ORDER BY, relaciones entre tablas (JOIN) y seguridad frente a SQL Injection.',
    realWorldUseCase:
      'Guardar y consultar millones de clientes, películas o pedidos al instante pidiendo exactamente los datos que necesitas.',
    feynmanPrompt:
      '¿Qué diferencia hay entre indicar qué datos quieres (`SELECT ... WHERE`) en SQL frente a programar un bucle manual en C?',
    starterChallengeTitle: 'Problem Set 7: Movies & Fiftyville (Consultas Relacionales SQL)',
    starterCode: `-- CS50 Clase 7 — Consultas SQL sobre SQLite
-- Tablas disponibles en memoria:
-- students (id, name, house, grade)
-- courses (id, title, week)
-- TODO: Selecciona name, house y grade de los estudiantes con grade >= 90
-- ordenados por grade de forma descendente (ORDER BY grade DESC).

SELECT name, house, grade FROM students;
`,
    allowedConceptsConstraint:
      'SOLO puedes hablar de los conceptos de la Clase 7: tablas SQL, SELECT, FROM, WHERE, ORDER BY, COUNT, JOIN e inyección SQL.',
    officialExercise: {
      title: 'Problem Set 7: SQL Queries (Movies & Fiftyville)',
      notesUrl: 'https://cs50.harvard.edu/x/notes/7/',
      psetUrl: 'https://cs50.harvard.edu/x/psets/7/movies/',
      goal: 'Escribir una consulta en SQL (`SELECT`, `WHERE`, `ORDER BY`) sobre la base de datos SQLite para filtrar los alumnos con nota mayor o igual a 90 y ordenarlos de mayor a menor.',
      specs: [
        'Consulta la tabla `students (id, name, house, grade)`.',
        'Añade la cláusula `WHERE grade >= 90` para filtrar únicamente los alumnos sobresalientes.',
        'Añade `ORDER BY grade DESC` al final de la consulta antes del punto y coma.',
      ],
      usageExample: `name | house | grade
------------------------
Hermione | Gryffindor | 100
Luna | Ravenclaw | 96
Harry | Gryffindor | 92`,
      check50: 'check50 cs50/problems/2024/x/movies',
      submit50: 'submit50 cs50/problems/2024/x/movies',
    },
    simpleVideoExplanations: [
      {
        chapterTitle: 'Inicio del vídeo · ¿Qué es SQL y una Base de Datos Relacional?',
        analogyTitle: '📋 Analogía de pedirle un plato al camarero en vez de entrar a cocinarlo',
        paragraphs: [
          'En C o Python tú eres el cocinero: tienes que escribir el bucle paso a paso para abrir el archivo y mirar fila por fila. En SQL tú eres el cliente en la mesa: simplemente le dices al camarero "tráeme el nombre y la nota de los alumnos que tengan más de un 90, ordenados de mayor a menor".',
          'El motor de la base de datos decide por sí solo la forma más rápida de buscar en las tablas y te entrega la bandeja con el resultado.',
        ],
      },
    ],
  },
  {
    id: 'module-8',
    weekLabel: 'Clase 8',
    title: 'HTML, CSS, JavaScript y el Modelo Cliente-Servidor (HTTP)',
    subtitle: 'El esqueleto, la pintura y los músculos de una página web interactiva',
    videoUrl: 'https://www.youtube.com/watch?v=3Ph5G_sfrFM',
    youtubeId: '3Ph5G_sfrFM',
    language: 'javascript',
    verifiedTopics:
      'Cómo viajan los mensajes por Internet (HTTP), estructura de una página (HTML), diseño visual (CSS) y lógica interactiva en el navegador con JavaScript.',
    realWorldUseCase:
      'Comprobar que los datos que un usuario escribe en un formulario web sean limpios y correctos antes de enviarlos.',
    feynmanPrompt:
      'Si una página web fuera una casa, ¿qué parte sería el HTML, qué parte el CSS y qué parte el JavaScript?',
    starterChallengeTitle: 'Problem Set 8: Trivia & Validación de Payloads en JavaScript',
    starterCode: `// CS50 Clase 8 — JavaScript & Validación Cliente-Servidor
const submission = {
  username: "  harvard_cs50  ",
  answer: "binary search",
  score: "95"
};

// TODO:
// 1. Limpia los espacios de submission.username con .trim()
// 2. Convierte submission.score a entero con Number(submission.score)
// 3. Verifica si answer === "binary search" e imprime el objeto validado

console.log("Submission:", submission);
`,
    allowedConceptsConstraint:
      'SOLO puedes hablar de los conceptos de la Clase 8: Internet/HTTP, HTML, CSS y JavaScript básico (objetos, strings, trim, Number y condicionales).',
    officialExercise: {
      title: 'Problem Set 8: Trivia & Client-Side Validation',
      notesUrl: 'https://cs50.harvard.edu/x/notes/8/',
      psetUrl: 'https://cs50.harvard.edu/x/psets/8/trivia/',
      goal: 'Sanitizar y validar en JavaScript los datos de respuesta de un formulario (`username`, `answer`, `score`).',
      specs: [
        'Elimina los espacios sobrantes de `submission.username` usando `.trim()`.',
        'Convierte `submission.score` de texto (`"95"`) a número (`95`) usando `Number(submission.score)`.',
        'Comprueba con `if` si `submission.answer === "binary search"` e imprime `"Correcto!"` junto con el objeto limpio.',
      ],
      usageExample: `$ node main.mjs
Correcto!
{ username: 'harvard_cs50', answer: 'binary search', score: 95 }`,
      check50: 'check50 cs50/problems/2024/x/trivia',
      submit50: 'submit50 cs50/problems/2024/x/trivia',
    },
    simpleVideoExplanations: [
      {
        chapterTitle: 'Mitad del vídeo · HTML, CSS y JavaScript explicados sin tecnicismos',
        analogyTitle: '🏠 Analogía de los ladrillos, la pintura y la electricidad de una casa',
        paragraphs: [
          'Toda página web se construye con tres piezas: HTML son las paredes y puertas (dice dónde hay un título o un botón); CSS es la pintura y la decoración (dice de qué color y tamaño se ve cada botón).',
          'JavaScript es la instalación eléctrica y los motores: hace que cuando pulses un interruptor (un botón en la pantalla), ocurra una acción inmediata como comprobar si acertaste una pregunta del Trivia.',
        ],
      },
    ],
  },
  {
    id: 'module-9',
    weekLabel: 'Clase 9',
    title: 'Flask, Backend, APIs, Formularios y Sesiones',
    subtitle: 'El recepcionista de seguridad en el servidor que valida cada operación',
    videoUrl: 'https://www.youtube.com/watch?v=i_GmZgveqpw',
    youtubeId: 'i_GmZgveqpw',
    language: 'python',
    verifiedTopics:
      'Aplicaciones web dinámicas con Python y Flask, rutas en el servidor, sesiones de usuario y por qué siempre hay que validar el dinero y los datos en el servidor.',
    realWorldUseCase:
      'Evitar que un usuario compre acciones sin saldo o envíe cantidades negativas modificando la página desde su navegador.',
    feynmanPrompt:
      '¿Por qué un banco jamás comprueba si tienes saldo únicamente en la pantalla de tu móvil, sino dentro de su propio servidor central?',
    starterChallengeTitle: 'Problem Set 9: C$50 Finance (Validación de Transacciones en Servidor)',
    starterCode: `# CS50 Clase 9 — C$50 Finance Backend Validator
# Valida una orden de compra de acciones en el servidor antes de tocar la base de datos.

user_cash = 10000.00
stock_price = 185.50

def execute_buy_order(symbol, shares, cash, price):
    # TODO:
    # 1. Verifica que 'symbol' no esté vacío y que 'shares' sea un int > 0
    # 2. Calcula total_cost = shares * price
    # 3. Si total_cost > cash, devuelve {"ok": False, "error": "Fondos insuficientes"}
    # 4. Si es válido, devuelve {"ok": True, "total_cost": total_cost, "remaining_cash": cash - total_cost}
    return {"ok": False, "error": "Pendiente de implementar"}

print(execute_buy_order("AAPL", 10, user_cash, stock_price))
`,
    allowedConceptsConstraint:
      'SOLO puedes hablar de los conceptos de la Clase 9: cliente vs servidor (backend con Python/Flask), validación de compras en C$50 Finance, diccionarios y condicionales.',
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
    return False, "Pendiente de validar"

is_valid, result = validate_ai_response(raw_llm_output)
print("Valid:", is_valid)
print("Result:", result)
`,
    allowedConceptsConstraint:
      'SOLO puedes hablar de los conceptos de la Clase 10: fundamentos de IA explicados en CS50, predicción de palabras, validación de JSON con json.loads y try/except en Python.',
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
