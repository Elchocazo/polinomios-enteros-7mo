/**
 * PolyClay 7° - Banco Curricular de Niveles, Sets de Examen y Generador de Polinomios
 * Diseñado específicamente para los estándares de 7° grado de secundaria / educación básica
 */

// ==========================================================================
// GENERADOR PROCEDURAL DINÁMICO DE POLINOMIOS (ANTI-COPIA EN AULA)
// ==========================================================================

class PolynomialGenerator {
  // Entero aleatorio entre min y max (evitando 0 para mayor dinamismo)
  static randInt(min, max, avoidZero = true) {
    let val = 0;
    do {
      val = Math.floor(Math.random() * (max - min + 1)) + min;
    } while (avoidZero && val === 0);
    return val;
  }

  static randSign() {
    return Math.random() > 0.5 ? '+' : '-';
  }

  static formatTerm(num) {
    return num >= 0 ? '+ ' + num : '- ' + Math.abs(num);
  }

  // Genera un polinomio según el nivel curricular con validación matemática
  static generate(level = 1) {
    let attempts = 0;
    while (attempts < 15) {
      attempts++;
      const expr = this._generateRaw(level);
      
      // Validar si el motor matemático está disponible en el entorno
      let engine = null;
      if (typeof PolyEngine !== 'undefined') {
        engine = new PolyEngine();
      } else if (typeof window !== 'undefined' && window.PolyEngine) {
        engine = new window.PolyEngine();
      }

      if (engine) {
        const val = engine.validateBrackets(expr);
        if (val.valid) {
          let curr = expr;
          let steps = 0;
          let solvable = true;
          while (steps < 25) {
            const step = engine.getNextStep(curr);
            if (!step) { solvable = false; break; }
            if (step.type === 'FINISHED') break;
            if (!step.nextExpr) { solvable = false; break; }
            curr = step.nextExpr;
            steps++;
          }
          if (solvable && steps < 25) {
            return expr;
          }
        }
      } else {
        return expr;
      }
    }

    // Fallbacks pedagógicos aleatorizados si excediera los intentos
    const r1 = this.randInt(-9, 12);
    const r2 = this.randInt(-8, 8);
    const r3 = this.randInt(2, 9);
    if (level === 1) return `${r1} - (${r2} + ${r3})`;
    if (level === 2) return `${r1} + [ ${r2} - (${r3} + 4) ]`;
    if (level === 3) return `${r1} - { -3 + [ 8 - (-4 + ${r3}) ] - 2 }`;
    return `${r1} - { 6 - [ -4 + (3 - 8) - (-2 + 5) ] - 1 }`;
  }

  static _generateRaw(level) {
    const a = this.randInt(-12, 16);
    const b = this.randInt(-9, 9);
    const c = this.randInt(-9, 9);
    const s1 = this.randSign();
    const s2 = this.randSign();

    if (level === 1) {
      // 4 plantillas dinámicas de paréntesis
      const variant = Math.floor(Math.random() * 4);
      if (variant === 0) {
        return `${a} ${s1} (${b} ${this.formatTerm(c)})`;
      } else if (variant === 1) {
        const d = this.randInt(-9, 9);
        return `(${a} ${this.formatTerm(b)}) ${s1} (${c} ${this.formatTerm(d)})`;
      } else if (variant === 2) {
        const d = this.randInt(-9, 9);
        return `${a} ${s1} (${b} ${this.formatTerm(c)}) ${this.formatTerm(d)}`;
      } else {
        return `${a} - (${b} ${this.formatTerm(c)})`;
      }
    }

    if (level === 2) {
      // 3 plantillas de corchetes y paréntesis [ ( ) ]
      const d = this.randInt(-9, 9);
      const e = this.randInt(-8, 8);
      const variant = Math.floor(Math.random() * 3);
      if (variant === 0) {
        return `${a} ${s1} [ ${b} ${s2} (${c} ${this.formatTerm(d)}) ]`;
      } else if (variant === 1) {
        return `${a} ${s1} [ ${b} ${s2} (${c} ${this.formatTerm(d)}) ${this.formatTerm(e)} ]`;
      } else {
        return `[ ${a} ${s1} (${b} ${this.formatTerm(c)}) ] ${this.formatTerm(d)}`;
      }
    }

    if (level === 3) {
      // 2 plantillas de llaves, corchetes y paréntesis { [ ( ) ] }
      const d = this.randInt(-8, 8);
      const e = this.randInt(-8, 8);
      const f = this.randInt(-7, 7);
      const variant = Math.floor(Math.random() * 2);
      if (variant === 0) {
        return `${a} ${s1} { ${b} + [ ${c} ${s2} (${d} ${this.formatTerm(e)}) ] ${this.formatTerm(f)} }`;
      } else {
        return `${a} ${s1} { ${b} - [ ${c} ${s2} (${d} ${this.formatTerm(e)}) ] }`;
      }
    }

    // Nivel 4: Gran Desafío de Maestría con múltiples ramas
    const d = this.randInt(-8, 8);
    const e = this.randInt(-8, 8);
    const f = this.randInt(-8, 8);
    const g = this.randInt(-8, 8);
    const h = this.randInt(-7, 7);
    const variant = Math.floor(Math.random() * 2);
    if (variant === 0) {
      return `${a} ${s1} { ${b} - [ ${c} + (${d} ${this.formatTerm(e)}) - (${f} ${this.formatTerm(g)}) ] ${this.formatTerm(h)} }`;
    } else {
      return `[ ${a} - (${b} ${this.formatTerm(c)}) ] - { ${d} - [ ${e} ${s2} (${f} ${this.formatTerm(g)}) ] }`;
    }
  }

  // Genera un set completo de 10 preguntas únicas para evaluación:
  // Garantiza que dos estudiantes sentados juntos en el aula tengan polinomios diferentes.
  static generateExamSet() {
    const questions = [];
    const used = new Set();

    const addUnique = (level) => {
      let q = '';
      let tries = 0;
      do {
        q = this.generate(level);
        tries++;
      } while (used.has(q) && tries < 20);
      used.add(q);
      questions.push(q);
    };

    // Preguntas 1 a 4: Nivel 1 (Paréntesis)
    addUnique(1);
    addUnique(1);
    addUnique(1);
    addUnique(1);

    // Preguntas 5 a 7: Nivel 2 (Corchetes y paréntesis)
    addUnique(2);
    addUnique(2);
    addUnique(2);

    // Preguntas 8 y 9: Nivel 3 (Llaves, corchetes y paréntesis)
    addUnique(3);
    addUnique(3);

    // Pregunta 10: Nivel 4 (Gran desafío de maestría)
    addUnique(4);

    return questions;
  }

  // Genera ejercicios frescos y aleatorios para la práctica de cada nivel
  static refreshCurriculumLevels() {
    if (typeof CURRICULUM_LEVELS !== 'undefined') {
      CURRICULUM_LEVELS.forEach(lvl => {
        lvl.exercises = [
          this.generate(lvl.id),
          this.generate(lvl.id),
          this.generate(lvl.id),
          this.generate(lvl.id),
          this.generate(lvl.id)
        ];
      });
    }
  }
}

// Niveles curriculares inicializados dinámicamente
const CURRICULUM_LEVELS = [
  {
    id: 1,
    name: "Nivel 1: El Reino de los Paréntesis ( )",
    badge: "1° Nivel",
    description: "Dominio de paréntesis simples, números positivos/negativos y ley de signos básica.",
    colorTheme: "#D97706",
    exercises: [
      PolynomialGenerator.generate(1),
      PolynomialGenerator.generate(1),
      PolynomialGenerator.generate(1),
      PolynomialGenerator.generate(1),
      PolynomialGenerator.generate(1)
    ]
  },
  {
    id: 2,
    name: "Nivel 2: La Fortaleza de los Corchetes [ ]",
    badge: "2° Nivel",
    description: "Jerarquía de dos niveles: resuelve primero los paréntesis ( ) y luego los corchetes [ ].",
    colorTheme: "#2563EB",
    exercises: [
      PolynomialGenerator.generate(2),
      PolynomialGenerator.generate(2),
      PolynomialGenerator.generate(2),
      PolynomialGenerator.generate(2),
      PolynomialGenerator.generate(2)
    ]
  },
  {
    id: 3,
    name: "Nivel 3: El Templo de las Llaves { }",
    badge: "3° Nivel",
    description: "La tríada completa de signos de agrupación: { [ ( ) ] } de adentro hacia afuera.",
    colorTheme: "#7C3AED",
    exercises: [
      PolynomialGenerator.generate(3),
      PolynomialGenerator.generate(3),
      PolynomialGenerator.generate(3),
      PolynomialGenerator.generate(3),
      PolynomialGenerator.generate(3)
    ]
  },
  {
    id: 4,
    name: "Nivel 4: Desafío de Maestría",
    badge: "Gran Maestro",
    description: "Polinomios complejos con múltiples ramas de agrupación simultáneas y operaciones combinadas.",
    colorTheme: "#059669",
    exercises: [
      PolynomialGenerator.generate(4),
      PolynomialGenerator.generate(4),
      PolynomialGenerator.generate(4),
      PolynomialGenerator.generate(4),
      PolynomialGenerator.generate(4)
    ]
  }
];

// Sets de respaldo para compatibilidad
const EXAM_SETS = [
  PolynomialGenerator.generateExamSet(),
  PolynomialGenerator.generateExamSet(),
  PolynomialGenerator.generateExamSet()
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
      return b.bestScore - a.bestScore;
    });

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Error al guardar en el ranking:', e);
    }

    return student;
  }

  static clearAll() {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  static exportToCSV() {
    const list = this.getAll();
    if (list.length === 0) return null;

    // Encabezados con codificación UTF-8 para Excel
    let csv = '\uFEFF';
    csv += 'Puesto;Nombre Completo;Mejor Calificación (1.0 - 5.0);Aciertos Examen;Oportunidades Usadas;Nivel de Desempeño;Última Evaluación\n';

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

if (typeof window !== 'undefined') {
  window.PolynomialGenerator = PolynomialGenerator;
  window.CURRICULUM_LEVELS = CURRICULUM_LEVELS;
  window.EXAM_SETS = EXAM_SETS;
  window.RankingManager = RankingManager;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CURRICULUM_LEVELS, EXAM_SETS, RankingManager, PolynomialGenerator };
}
