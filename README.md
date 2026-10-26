# 🧠 PolyClay 7° — El Maestro de los Polinomios Aritméticos con Enteros ($\mathbb{Z}$)

Aplicación web interactiva y gamificada diseñada especialmente para estudiantes de **Grado 7° de Educación Básica Secundaria**, desarrollada con una interfaz táctil moderna basada en **Claymorphism 3D** (estilo arcilla/plastilina suave y amigable para adolescentes).

---

## 🚀 ¿Cómo abrir la aplicación?

1. No requiere instalaciones ni servidores externos.
2. Simplemente haz doble clic o abre el archivo [`index.html`](file:///e:/Desarrollo%20de%20apps/Desarrollo%20de%20polinomios/index.html) en cualquier navegador moderno (Google Chrome, Microsoft Edge, Firefox, Safari).
3. Funciona en computadores, laptops, tabletas y tableros interactivos (Smartboards) de aula.

---

## 🎯 Enfoque Pedagógico y Didáctico

La aplicación cubre integralmente el currículo de aritmética de enteros para grado 7:

1. **Jerarquía de las Operaciones y Signos de Agrupación:**
   - La regla de oro: **de adentro hacia afuera**.
   - Paréntesis `( )` ➜ Corchetes `[ ]` ➜ Llaves `{ }`.
   - La aplicación guía al estudiante preguntándole o indicándole el bloque más interno por el cual debe comenzar.

2. **Resolución Matemática Activa (Cálculo y Signos):**
   - El estudiante no es un espectador pasivo: debe ingresar el resultado numérico y su respectivo signo (`+` o `-`).
   - **Retroalimentación formativa inmediata:**
     - *Signos iguales:* Se suman sus valores absolutos y se conserva el mismo signo.
     - *Signos contrarios:* Se restan sus valores absolutos y gana el signo del número con mayor valor absoluto.

3. **Ley de Signos y Supresión de Signos de Agrupación:**
   - Supresión directa: `+` exterior no altera; `-` exterior invierte el signo interior.
   - Multiplicación de signos: `(-) · (-) = +`, `(-) · (+) = -`.

4. **Historial de Demostración Formal:**
   - Cada paso resuelto se registra en la pizarra inferior, permitiendo al docente y al alumno visualizar el procedimiento completo paso a paso como si se hiciera en el cuaderno.

---

## 🎮 Mecánicas de Gamificación

- **Rachas de Fuego (Streaks):** Premia la consistencia y aciertos continuos sin errores.
- **Puntos de Experiencia (XP ⭐):** Recompensa el esfuerzo en cada micro-paso completado.
- **Sintetizador Web Audio API:** Efectos de sonido táctiles ("bloop", "acorde mayor de acierto", "fanfarria final") sintetizados en tiempo real sin requerir archivos de audio pesados.
- **Efecto Confetti Arcilla:** Animación festiva de partículas 3D al resolver cada polinomio.
- **Niveles Curriculares Progresivos:**
  - *Nivel 1:* El Reino de los Paréntesis `( )`.
  - *Nivel 2:* La Fortaleza de los Corchetes `[ ]`.
  - *Nivel 3:* El Templo de las Llaves `{ }`.
  - *Nivel 4:* Desafío de Maestría (agrupaciones complejas).

---

## 👨‍🏫 Herramientas para el Docente

- **Generador Aleatorio Infinito:** Crea ejercicios nuevos al instante para práctica ilimitada.
- **Creador de Ejercicios Personalizados:** Permite al profesor escribir cualquier polinomio aritmético en la pizarra digital de clase con validación automática de signos de agrupación.
- **Guía Rápida "Reglas de Oro":** Modal accesible con un clic con el resumen de conceptos clave.
