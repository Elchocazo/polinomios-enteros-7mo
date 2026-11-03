/**
 * PolyClay 7° - Banco Curricular de Niveles, Sets de Examen y Generador de Polinomios
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

// Sets oficiales de 10 preguntas para Modo Examen (progresión pedagógica garantizada)
const EXAM_SETS = [
  // Intento 1
  [
    "8 - (-3 + 5)",
    "-12 + (7 - 15)",
    "15 - (-4 - 6)",
    "-5 - (8 - 14)",
    "6 + [ 4 - (-2 + 7) ]",
    "-10 + [ 12 - (5 - 9) - 3 ]",
    "[ -8 - (-3 + 6) ] + 5",
    "18 - { -4 + [ 7 - (-2 + 5) ] - 1 }",
    "-7 + { 10 - [ -3 + (-5 + 9) ] + 2 }",
    "25 - { 8 - [ -6 + (4 - 11) - (-3 + 5) ] - 2 }"
  ],
  // Intento 2 (Números y expresiones equivalentes para segunda oportunidad)
  [
    "10 - (-5 + 9)",
    "-8 + (6 - 14)",
    "14 - (-3 - 7)",
    "-9 - (4 - 11)",
    "7 + [ 3 - (-4 + 9) ]",
    "-8 + [ 15 - (6 - 11) - 4 ]",
    "[ -9 - (-5 + 8) ] + 6",
    "16 - { -2 + [ 9 - (-3 + 6) ] - 3 }",
    "-6 + { 12 - [ -4 + (-3 + 8) ] + 1 }",
    "22 - { 7 - [ -5 + (3 - 9) - (-4 + 6) ] - 3 }"
  ],
  // Intento 3 (Tercera y última oportunidad)
  [
    "9 - (-4 + 7)",
    "-11 + (5 - 13)",
    "16 - (-5 - 8)",
    "-7 - (6 - 15)",
    "5 + [ 6 - (-3 + 8) ]",
    "-12 + [ 14 - (7 - 12) - 2 ]",
    "[ -10 - (-4 + 9) ] + 7",
    "20 - { -5 + [ 8 - (-4 + 7) ] - 2 }",
    "-8 + { 11 - [ -2 + (-6 + 10) ] + 3 }",
    "24 - { 9 - [ -4 + (5 - 12) - (-2 + 6) ] - 1 }"
  ]
];

// Gestor de Ranking y Persistencia (localStorage)
class RankingManager {
  static STORAGE_KEY = 'polyclay_7mo_ranking';

  static getAll() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error al leer el ranking de localStorage:', e);
      return [];
    }
  }

  static getStudent(name) {
    if (!name) return null;
    const list = this.getAll();
    const clean = name.trim().toLowerCase();
    return list.find(s => s.name.trim().toLowerCase() === clean) || null;
  }

  static saveAttempt(name, grade, score, attemptNum) {
    const list = this.getAll();
    const cleanName = name.trim();
    const lowerName = cleanName.toLowerCase();
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    let student = list.find(s => s.name.trim().toLowerCase() === lowerName);

    if (student) {
      student.attemptsCount = Math.max(student.attemptsCount || 1, attemptNum);
      if (!student.history) student.history = [];
      student.history.push({
        attempt: attemptNum,
        grade: Number(grade.toFixed(1)),
        score: score,
        date: dateFormatted
      });

      // Se guarda siempre la MEJOR NOTA conseguida entre sus oportunidades
      if (grade > student.bestGrade) {
        student.bestGrade = Number(grade.toFixed(1));
        student.bestScore = score;
      }
      student.lastDate = dateFormatted;
    } else {
      student = {
        id: 'std_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        name: cleanName,
        bestGrade: Number(grade.toFixed(1)),
        bestScore: score,
        attemptsCount: attemptNum,
        lastDate: dateFormatted,
        history: [{
          attempt: attemptNum,
          grade: Number(grade.toFixed(1)),
          score: score,
          date: dateFormatted
        }]
      };
      list.push(student);
    }

    // Ordenar de mayor a menor nota; en empate, menor cantidad de intentos usados
    list.sort((a, b) => {
      if (b.bestGrade !== a.bestGrade) return b.bestGrade - a.bestGrade;
      if (a.attemptsCount !== b.attemptsCount) return a.attemptsCount - b.attemptsCount;
      return a.name.localeCompare(b.name);
    });

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Error al guardar en localStorage:', e);
    }

    return student;
  }

  static clearAll() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  static exportCSV() {
    const list = this.getAll();
    if (list.length === 0) return null;

    let csv = '\uFEFF'; // BOM para que Excel en español abra tildes y caracteres correctamente
    csv += 'Puesto;Nombre Completo;Mejor Nota (1.0 a 5.0);Aciertos (de 10);Intentos Usados;Desempeño;Fecha de Registro\n';

    list.forEach((item, idx) => {
      let desempeno = 'Bajo';
      if (item.bestGrade >= 4.6) desempeno = 'Superior';
      else if (item.bestGrade >= 4.0) desempeno = 'Alto';
      else if (item.bestGrade >= 3.0) desempeno = 'Básico';

      csv += `${idx + 1};"${item.name.replace(/"/g, '""')}";${item.bestGrade.toFixed(1).replace('.', ',')};${item.bestScore}/10;${item.attemptsCount}/3;${desempeno};"${item.lastDate}"\n`;
    });

    return csv;
  }
}

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

if (typeof window !== 'undefined') {
  window.CURRICULUM_LEVELS = CURRICULUM_LEVELS;
  window.EXAM_SETS = EXAM_SETS;
  window.RankingManager = RankingManager;
  window.PolynomialGenerator = PolynomialGenerator;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CURRICULUM_LEVELS, EXAM_SETS, RankingManager, PolynomialGenerator };
}
