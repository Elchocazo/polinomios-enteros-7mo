/**
 * PolyClay 7° - Motor de Evaluación Gamificada y Tienda de Recompensas
 * Implementa nota base 5.0, descuento de 0.2 por error efectivo,
 * escudos, bonificación por décimas, gemas e inventario persistente.
 */

const REWARDS_CONFIG = {
  ESCUDO: {
    id: 'escudo',
    name: 'Escudo Protector',
    icon: '🛡️',
    cost: 60,
    description: 'Neutraliza el descuento de 0.2 provocado por un error.'
  },
  DECIMA: {
    id: 'decima',
    name: 'Décima Adicional (+0.1)',
    icon: '⭐',
    cost: 100,
    description: 'Suma 0.1 a la nota final del examen (máximo 2 décimas por examen).'
  },
  GEMA: {
    id: 'gema',
    name: 'Gema del Saber',
    icon: '💎',
    cost: 40,
    description: 'Recompensa coleccionable que premia la constancia académica.'
  }
};

const POINTS_RULES = {
  PREGUNTA_CORRECTA: 40,
  SIN_ERRORES_EXTRA: 20,
  EXAMEN_COMPLETADO: 100,
  BONUS_RACHA: 30
};

class EvaluationEngine {
  constructor() {
    this.currentSession = null;
  }

  // Normaliza nombres para búsquedas e identificadores seguros
  static normalizeName(rawName) {
    if (!rawName) return '';
    return rawName
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ');
  }

  static generateStudentId(nombre, apellido) {
    const cleanNombre = this.normalizeName(nombre);
    const cleanApellido = this.normalizeName(apellido);
    return `std_${cleanNombre.replace(/\s+/g, '_')}_${cleanApellido.replace(/\s+/g, '_')}`;
  }

  // ==========================================================================
  // GESTIÓN DE INVENTARIO DEL ESTUDIANTE (LOCAL + FIRESTORE)
  // ==========================================================================

  static getInventory(studentId) {
    const key = `polyclay_inv_${studentId}`;
    try {
      const data = localStorage.getItem(key);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Error leyendo inventario local:', e);
    }

    // Inventario inicial por defecto para un nuevo estudiante
    return {
      studentId,
      puntos: 120, // Puntos de bienvenida para poder explorar la tienda de escudos
      escudosDisponibles: 1, // 1 escudo inicial de cortesía didáctica
      escudosUsadosTotal: 0,
      gemasObtenidas: 0,
      decimasCanjeadasTotal: 0,
      historialCompras: [],
      historialUso: []
    };
  }

  static saveInventory(studentId, inventory) {
    const key = `polyclay_inv_${studentId}`;
    try {
      localStorage.setItem(key, JSON.stringify(inventory));
    } catch (e) {
      console.error('Error guardando inventario local:', e);
    }

    // Sincronizar en segundo plano con Firestore si está disponible
    if (window.FirebaseService) {
      window.FirebaseService.saveStudentProfile(studentId, inventory);
    }
  }

  // Comprar recompensa con puntos
  static purchaseReward(studentId, rewardId) {
    const inv = this.getInventory(studentId);
    let reward = null;
    let cost = 0;

    if (rewardId === 'escudo') {
      reward = REWARDS_CONFIG.ESCUDO;
      cost = reward.cost;
      if (inv.puntos < cost) {
        return { success: false, message: `Puntos insuficientes. Necesitas ${cost} puntos y tienes ${inv.puntos}.` };
      }
      inv.puntos -= cost;
      inv.escudosDisponibles = (inv.escudosDisponibles || 0) + 1;
    } else if (rewardId === 'gema') {
      reward = REWARDS_CONFIG.GEMA;
      cost = reward.cost;
      if (inv.puntos < cost) {
        return { success: false, message: `Puntos insuficientes. Necesitas ${cost} puntos y tienes ${inv.puntos}.` };
      }
      inv.puntos -= cost;
      inv.gemasObtenidas = (inv.gemasObtenidas || 0) + 1;
    } else {
      return { success: false, message: 'Tipo de recompensa no válida para compra directa en tienda.' };
    }

    const tx = {
      tipo: 'COMPRA',
      item: reward.name,
      costo: cost,
      fecha: new Date().toISOString()
    };
    inv.historialCompras.push(tx);
    this.saveInventory(studentId, inv);

    if (window.FirebaseService) {
      window.FirebaseService.saveTransaction({
        studentId,
        ...tx
      });
    }

    return { success: true, reward, inventory: inv };
  }

  // ==========================================================================
  // SESIÓN DE EXAMEN ACTIVO
  // ==========================================================================

  startExamSession(nombre, apellido, intentoNumero = 1) {
    const studentId = EvaluationEngine.generateStudentId(nombre, apellido);
    const nombreCompleto = `${nombre.trim()} ${apellido.trim()}`;
    const inv = EvaluationEngine.getInventory(studentId);

    this.currentSession = {
      attemptId: `eval_${studentId}_att${intentoNumero}_${Date.now()}`,
      studentId,
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      nombreCompleto,
      intentoNumero,
      fechaInicio: new Date(),
      
      // Contadores y estado
      notaInicial: 5.0,
      totalPreguntas: 10,
      preguntasRespondidas: 0,
      aciertos: 0,
      erroresCometidosTotal: 0,
      erroresEfectivos: 0,
      escudosUsadosEnExamen: 0,
      decimasCanjeadasEnExamen: 0, // Máx 2
      puntosGanadosEnExamen: 0,

      // Registro detallado de cada pregunta
      preguntasDetalle: [],

      // Set de eventos de error para evitar deducciones duplicadas
      eventosErrorRegistrados: new Set(),

      // Escudos activos al iniciar el examen
      escudosDisponiblesAlIniciar: inv.escudosDisponibles || 0,
      escudosDisponiblesActuales: inv.escudosDisponibles || 0,
      escudosConsumidosLog: []
    };

    return this.currentSession;
  }

  // Registrar un error durante un paso de la pregunta
  // Devuelve si el error fue protegido por un escudo o si es efectivo
  registerStepError(questionIdx, stepPhase, stepDetails = '') {
    if (!this.currentSession) return { protected: false, effective: true };

    const eventKey = `q_${questionIdx}_phase_${stepPhase}`;
    if (this.currentSession.eventosErrorRegistrados.has(eventKey)) {
      // Error repetido en el mismo paso: no duplica descuento
      return { protected: false, effective: false, duplicated: true };
    }

    this.currentSession.eventosErrorRegistrados.add(eventKey);
    this.currentSession.erroresCometidosTotal++;

    // Verificar si el estudiante tiene escudos disponibles para absorber el error
    if (this.currentSession.escudosDisponiblesActuales > 0) {
      this.currentSession.escudosDisponiblesActuales--;
      this.currentSession.escudosUsadosEnExamen++;
      
      const shieldLog = {
        questionIdx: questionIdx + 1,
        stepPhase,
        descuentoEvitado: 0.2,
        fecha: new Date().toISOString()
      };
      this.currentSession.escudosConsumidosLog.push(shieldLog);

      // Consumir del inventario del estudiante de inmediato
      const inv = EvaluationEngine.getInventory(this.currentSession.studentId);
      inv.escudosDisponibles = Math.max(0, (inv.escudosDisponibles || 1) - 1);
      inv.escudosUsadosTotal = (inv.escudosUsadosTotal || 0) + 1;
      inv.historialUso.push({
        tipo: 'USO_ESCUDO',
        motivo: `Protección de error en Pregunta ${questionIdx + 1} (${stepPhase})`,
        fecha: new Date().toISOString()
      });
      EvaluationEngine.saveInventory(this.currentSession.studentId, inv);

      return {
        protected: true,
        effective: false,
        escudosRestantes: this.currentSession.escudosDisponiblesActuales,
        message: '🛡️ ¡Escudo activado! Ha neutralizado el descuento de 0.2 puntos de este error.'
      };
    }

    // No hay escudos: el error es efectivo y descuenta 0.2 puntos
    this.currentSession.erroresEfectivos++;
    return {
      protected: false,
      effective: true,
      descuento: 0.2,
      message: '⚠️ Error registrado: descuenta 0.2 puntos de tu nota base.'
    };
  }

  // Registrar la finalización de una pregunta (correcta o incorrecta)
  registerQuestionCompletion(questionIdx, isCorrect, expression, errorsInQuestion = 0) {
    if (!this.currentSession) return;

    this.currentSession.preguntasRespondidas++;
    if (isCorrect) {
      this.currentSession.aciertos++;
      let puntosSumados = POINTS_RULES.PREGUNTA_CORRECTA;
      if (errorsInQuestion === 0) {
        puntosSumados += POINTS_RULES.SIN_ERRORES_EXTRA;
      }
      this.currentSession.puntosGanadosEnExamen += puntosSumados;
    }

    this.currentSession.preguntasDetalle.push({
      numero: questionIdx + 1,
      expression,
      correcta: isCorrect,
      erroresCometidos: errorsInQuestion
    });
  }

  // Calcular la nota base provisional en cualquier momento:
  // notaBase = Math.max(1.0, 5.0 - (erroresEfectivos * 0.2))
  getProvisionalBaseGrade() {
    if (!this.currentSession) return 5.0;
    const descuento = this.currentSession.erroresEfectivos * 0.2;
    const nota = Math.max(1.0, 5.0 - descuento);
    return Number(nota.toFixed(1));
  }

  // Canjear décima adicional (+0.1) antes de cerrar el examen:
  // Máximo 2 décimas por examen (costo: 100 puntos c/u)
  redeemAdditionalTenth() {
    if (!this.currentSession) return { success: false, message: 'No hay examen en curso.' };

    if (this.currentSession.decimasCanjeadasEnExamen >= 2) {
      return { success: false, message: 'Límite alcanzado: solo puedes canjear máximo 2 décimas (+0.2) por examen.' };
    }

    const inv = EvaluationEngine.getInventory(this.currentSession.studentId);
    const cost = REWARDS_CONFIG.DECIMA.cost;

    if (inv.puntos < cost) {
      return { success: false, message: `Puntos insuficientes. Cada décima cuesta ${cost} puntos y tienes ${inv.puntos}.` };
    }

    const currentBase = this.getProvisionalBaseGrade();
    const currentFinal = Math.min(5.0, currentBase + (this.currentSession.decimasCanjeadasEnExamen * 0.1));

    if (currentFinal >= 5.0) {
      return { success: false, message: 'Tu calificación ya es la máxima posible (5.0). No necesitas bonificación.' };
    }

    // Aplicar canje
    inv.puntos -= cost;
    inv.decimasCanjeadasTotal = (inv.decimasCanjeadasTotal || 0) + 1;
    this.currentSession.decimasCanjeadasEnExamen++;

    inv.historialUso.push({
      tipo: 'CANJE_DECIMA',
      bonificacion: 0.1,
      costo: cost,
      fecha: new Date().toISOString()
    });
    EvaluationEngine.saveInventory(this.currentSession.studentId, inv);

    if (window.FirebaseService) {
      window.FirebaseService.saveTransaction({
        studentId: this.currentSession.studentId,
        tipo: 'CANJE_DECIMA',
        bonificacion: 0.1,
        costo: cost,
        fecha: new Date().toISOString()
      });
    }

    return {
      success: true,
      decimasCanjeadas: this.currentSession.decimasCanjeadasEnExamen,
      puntosRestantes: inv.puntos,
      message: '⭐ ¡Décima canjeada con éxito! +0.1 sumado a tu calificación final.'
    };
  }

  // Finalizar el examen y consolidar el resultado oficial inmutable
  finalizeExam() {
    if (!this.currentSession) return null;

    const fechaFin = new Date();
    const duracionSegundos = Math.round((fechaFin - this.currentSession.fechaInicio) / 1000);
    const minutos = Math.floor(duracionSegundos / 60);
    const segundos = duracionSegundos % 60;
    const duracionTexto = `${minutos}m ${segundos}s`;

    // 1. Cálculo de Nota Base:
    // notaBase = Math.max(1.0, 5.0 - (erroresEfectivos * 0.2))
    const descuentoTotal = this.currentSession.erroresEfectivos * 0.2;
    const notaBase = Number(Math.max(1.0, 5.0 - descuentoTotal).toFixed(1));

    // 2. Bonificación por décimas:
    const bonificacion = Number((this.currentSession.decimasCanjeadasEnExamen * 0.1).toFixed(1));

    // 3. Nota Final (entre 1.0 y 5.0):
    const notaFinal = Number(Math.min(5.0, Math.max(1.0, notaBase + bonificacion)).toFixed(1));

    // 4. Puntos por completar examen
    this.currentSession.puntosGanadosEnExamen += POINTS_RULES.EXAMEN_COMPLETADO;

    // Actualizar puntos ganados en el inventario
    const inv = EvaluationEngine.getInventory(this.currentSession.studentId);
    inv.puntos += this.currentSession.puntosGanadosEnExamen;
    EvaluationEngine.saveInventory(this.currentSession.studentId, inv);

    // Desempeño
    let desempeno = 'Bajo';
    if (notaFinal >= 4.6) desempeno = 'Superior';
    else if (notaFinal >= 4.0) desempeno = 'Alto';
    else if (notaFinal >= 3.0) desempeno = 'Básico';

    const resultadoFinal = {
      attemptId: this.currentSession.attemptId,
      studentId: this.currentSession.studentId,
      nombre: this.currentSession.nombre,
      apellido: this.currentSession.apellido,
      nombreCompleto: this.currentSession.nombreCompleto,
      intentoNumero: this.currentSession.intentoNumero,
      fecha: fechaFin.toLocaleDateString('es-CO', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      }),
      fechaIso: fechaFin.toISOString(),
      duracionTexto,
      duracionSegundos,

      // Calificaciones oficiales
      notaInicial: 5.0,
      notaBase,
      bonificacionDecimas: bonificacion,
      notaFinal,
      desempeno,

      // Desglose de errores y aciertos
      aciertos: this.currentSession.aciertos,
      totalPreguntas: this.currentSession.totalPreguntas,
      erroresCometidosTotal: this.currentSession.erroresCometidosTotal,
      erroresEfectivos: this.currentSession.erroresEfectivos,
      escudosUsados: this.currentSession.escudosUsadosEnExamen,
      escudosConsumidosLog: this.currentSession.escudosConsumidosLog,
      decimasCanjeadas: this.currentSession.decimasCanjeadasEnExamen,
      puntosGanados: this.currentSession.puntosGanadosEnExamen,
      puntosSaldoActual: inv.puntos,

      preguntasDetalle: this.currentSession.preguntasDetalle
    };

    return resultadoFinal;
  }
}

if (typeof window !== 'undefined') {
  window.REWARDS_CONFIG = REWARDS_CONFIG;
  window.POINTS_RULES = POINTS_RULES;
  window.EvaluationEngine = EvaluationEngine;
  window.evalEngine = new EvaluationEngine();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { REWARDS_CONFIG, POINTS_RULES, EvaluationEngine };
}
