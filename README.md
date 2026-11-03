# 🧠 PolyClay 7° — El Maestro de los Polinomios Aritméticos con Números Enteros

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

---

## 📝 Modo Examen Oficial y Tabla de Ranking

- **10 Preguntas Secuenciales:** Cada intento contiene 10 problemas ordenados por dificultad y jerarquía pedagógica.
- **Escala de Calificación de 1.0 a 5.0:**
  - $\text{Nota} = 1.0 + \left(\frac{\text{Aciertos}}{10}\right) \times 4.0$
  - 10 aciertos = 5.0 (Desempeño Superior 🌟)
  - 8 aciertos = 4.2 (Desempeño Alto 👏)
  - 6 aciertos = 3.4 (Desempeño Básico 👍)
  - Menos de 5 aciertos = Desempeño Bajo ⚠️ (Aprobación mínima: 3.0)
- **3 Oportunidades para Mejorar:**
  - El estudiante registra su nombre completo.
  - Puede presentar hasta 3 intentos oficiales; las preguntas varían entre oportunidades para evitar memorización.
  - La calificación que se guarda en el Ranking oficial es siempre **la mejor nota alcanzada**.
- **Tabla de Ranking en Vivo:**
  - Medallas (🥇 1°, 🥈 2°, 🥉 3°) y clasificación por mejor nota y número de intentos.
  - Buscador en tiempo real por nombre de estudiante.
  - **Botón de Exportar a Excel (CSV):** Permite al docente descargar la planilla completa con un solo clic.
  - **Opción de Reinicio:** El profesor puede limpiar el ranking para iniciar una nueva clase o período.
