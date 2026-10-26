/**
 * PolyClay 7° - Banco Curricular de Niveles y Generador de Polinomios
 * Diseñado específicamente para los estándares de 7° grado de secundaria / educación básica
 */

const CURRICULUM_LEVELS = [
  {
    id: 1,
    name: "Nivel 1: El Reino de los Paréntesis ( )",
    badge: "1° Nivel",
    description: "Dominio de paréntesis simples, números positivos/negativos y ley de signos básica.",
    colorTheme: "#D97706",
    exercises: [
      "5 - (-3 + 8)",
      "-7 + (4 - 9)",
      "12 - (-6 - 4)",
      "-15 - (9 - 14)",
      "(-8 + 3) - (-5 + 7)"
    ]
  },
  {
    id: 2,
    name: "Nivel 2: La Fortaleza de los Corchetes [ ]",
    badge: "2° Nivel",
    description: "Jerarquía de dos niveles: resuelve primero los paréntesis ( ) y luego los corchetes [ ].",
    colorTheme: "#2563EB",
    exercises: [
      "-2 + [ 5 - (-3 + 6) + 1 ]",
      "10 - [ -4 + (8 - 12) - 3 ]",
      "[ -7 - (-2 + 5) ] + 8",
      "6 + [ 12 - (-5 - 3) - 9 ]",
      "-14 + [ 20 - (15 - 8) + (-6) ]"
    ]
  },
  {
    id: 3,
    name: "Nivel 3: El Templo de las Llaves { }",
    badge: "3° Nivel",
    description: "La tríada completa de signos de agrupación: { [ ( ) ] } de adentro hacia afuera.",
    colorTheme: "#7C3AED",
    exercises: [
      "15 - { -3 + [ 8 - (-4 + 6) ] - 2 }",
      "-5 + { 7 - [ -2 + (-6 + 10) ] + 4 }",
      "12 - { -4 + [ 9 - (5 - 8) ] - 1 }",
      "- { 8 - [ 14 - (-5 + 9) ] + (-6) }",
      "22 - { 10 - [ -5 + (4 - 11) - 2 ] + 3 }"
    ]
  },
  {
    id: 4,
    name: "Nivel 4: Desafío de Maestría",
    badge: "Gran Maestro",
    description: "Polinomios complejos con múltiples ramas de agrupación simultáneas y operaciones combinadas.",
    colorTheme: "#059669",
    exercises: [
      "20 - { 6 - [ -4 + (3 - 8) - (-2 + 5) ] - 1 }",
      "-8 + { [ -5 - (-3 + 9) ] - [ 4 + (-7 + 2) ] }",
      "14 - { -2 + [ 11 - (-5 - 4) + (8 - 12) ] - 7 }",
      "-{ [ -3 + (-4 + 9) ] - { 7 - [ 2 - (-5 + 1) ] } }"
    ]
  }
];

// Generador procedural aleatorio de polinomios aritméticos con enteros
class PolynomialGenerator {
  // Entero aleatorio entre min y max (evitando 0 para mayor dinamismo)
  static randInt(min, max, avoidZero = true) {
    let val = 0;
    do {
      val = Math.floor(Math.random() * (max - min + 1)) + min;
    } while (avoidZero && val === 0);
    return val;
  }

  // Genera un polinomio según el nivel de dificultad (1 a 3)
  static generate(level = 1) {
    const a = this.randInt(-9, 15);
    const b = this.randInt(-9, 9);
    const c = this.randInt(-9, 9);

    if (level === 1) {
      // Formato: A - ( B + C )
      const signOp = Math.random() > 0.5 ? '-' : '+';
      return `${a} ${signOp} (${b >= 0 ? b : b} ${c >= 0 ? '+ ' + c : '- ' + Math.abs(c)})`;
    }

    if (level === 2) {
      // Formato: A + [ B - ( C + D ) + E ]
      const d = this.randInt(-9, 9);
      const e = this.randInt(-8, 8);
      const sign1 = Math.random() > 0.5 ? '-' : '+';
      const sign2 = Math.random() > 0.5 ? '-' : '+';
      return `${a} ${sign1} [ ${b} ${sign2} (${c} ${d >= 0 ? '+ ' + d : '- ' + Math.abs(d)}) ${e >= 0 ? '+ ' + e : '- ' + Math.abs(e)} ]`;
    }

    // Nivel 3 o mayor: { [ ( ) ] }
    const d = this.randInt(-8, 8);
    const e = this.randInt(-9, 9);
    const f = this.randInt(-7, 7);
    const signOuter = Math.random() > 0.5 ? '-' : '+';
    const signMid = Math.random() > 0.5 ? '-' : '+';
    const signInner = Math.random() > 0.5 ? '-' : '+';

    return `${a} ${signOuter} { ${b} + [ ${c} ${signMid} (${d} ${signInner} ${Math.abs(e)}) ] ${f >= 0 ? '- ' + f : '+ ' + Math.abs(f)} }`;
  }
}

window.CURRICULUM_LEVELS = CURRICULUM_LEVELS;
window.PolynomialGenerator = PolynomialGenerator;
