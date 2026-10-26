/**
 * PolyClay 7° - Controlador Principal de la Aplicación y Lógica Gamificada
 */

class PolyClayApp {
  constructor() {
    this.engine = new PolyEngine();
    this.sound = window.soundCtrl;
    
    // Estado del juego
    this.currentLevelIdx = 0;
    this.currentExerciseIdx = 0;
    this.score = 0;
    this.streak = 0;
    this.hearts = 3;

    // Estado del ejercicio activo
    this.originalExpression = '';
    this.currentExpression = '';
    this.currentStepData = null;
    this.stepsHistory = [];

    // Entrada del usuario en el teclado
    this.inputSign = '';
    this.inputNum = '';

    // Inicializar referencias DOM y eventos
    this.cacheDom();
    this.bindEvents();
    this.initConfetti();
    this.renderLevelSelector();
    this.loadExercise(0, 0);
  }

  cacheDom() {
    // Header & Stats
    this.streakCountEl = document.getElementById('streak-count');
    this.scoreCountEl = document.getElementById('score-count');
    this.heartsCountEl = document.getElementById('hearts-count');
    this.btnSoundToggle = document.getElementById('btn-sound-toggle');
    this.btnHelpModal = document.getElementById('btn-help-modal');

    // Navegación de niveles
    this.levelsContainer = document.getElementById('levels-container');

    // Guía del robot
    this.guideStepTag = document.getElementById('guide-step-tag');
    this.guideInstructionText = document.getElementById('guide-instruction-text');

    // Pizarra de expresión
    this.currentLevelNameEl = document.getElementById('current-level-name');
    this.exerciseProgressBar = document.getElementById('exercise-progress');
    this.exerciseCounterEl = document.getElementById('exercise-counter');
    this.mathDisplayEl = document.getElementById('math-expression-display');

    // Píldoras de jerarquía
    this.pillParen = document.getElementById('rule-pill-paren');
    this.pillBracket = document.getElementById('rule-pill-bracket');
    this.pillBrace = document.getElementById('rule-pill-brace');

    // Fases de interacción
    this.phaseIdentify = document.getElementById('phase-identify');
    this.phaseSolve = document.getElementById('phase-solve');
    this.phaseSignRule = document.getElementById('phase-sign-rule');
    this.identifyOptionsGrid = document.getElementById('identify-options-grid');

    // Entrada de resolución
    this.targetSubexprText = document.getElementById('target-subexpr-text');
    this.pedagogicalHintBox = document.getElementById('pedagogical-hint-box');
    this.previewSign = document.getElementById('preview-sign');
    this.previewNum = document.getElementById('preview-num');

    // Ley de signos
    this.signTransformBefore = document.getElementById('sign-transform-before');
    this.signTransformAfter = document.getElementById('sign-transform-after');

    // Feedback
    this.feedbackMessage = document.getElementById('feedback-message');
    this.feedbackIcon = document.getElementById('feedback-icon');
    this.feedbackHeading = document.getElementById('feedback-heading');
    this.feedbackDetail = document.getElementById('feedback-detail');
    this.btnNextStep = document.getElementById('btn-next-step');

    // Historial
    this.stepsHistoryList = document.getElementById('steps-history-list');

    // Modales
    this.modalRules = document.getElementById('modal-rules');
    this.btnCloseModal = document.getElementById('btn-close-modal');
    this.btnCloseModal2 = document.getElementById('btn-close-modal-2');

    this.modalCustom = document.getElementById('modal-custom-exercise');
    this.btnCustomExercise = document.getElementById('btn-custom-exercise');
    this.btnCloseCustomModal = document.getElementById('btn-close-custom-modal');
    this.btnCancelCustom = document.getElementById('btn-cancel-custom');
    this.btnLoadCustom = document.getElementById('btn-load-custom');
    this.customPolyInput = document.getElementById('custom-poly-input');
    this.customErrorMsg = document.getElementById('custom-error-msg');

    this.btnRandomExercise = document.getElementById('btn-random-exercise');
    this.btnResetCurrent = document.getElementById('btn-reset-current');
  }

  bindEvents() {
    // Sonido
    this.btnSoundToggle.addEventListener('click', () => {
      const isMuted = this.sound.toggleMute();
      this.btnSoundToggle.textContent = isMuted ? '🔇' : '🔊';
      this.btnSoundToggle.title = isMuted ? 'Sonido silenciado' : 'Sonido activado';
    });

    // Modal de reglas
    this.btnHelpModal.addEventListener('click', () => {
      this.sound.playClick();
      this.modalRules.classList.remove('hidden');
    });
    this.btnCloseModal.addEventListener('click', () => {
      this.sound.playClick();
      this.modalRules.classList.add('hidden');
    });
    this.btnCloseModal2.addEventListener('click', () => {
      this.sound.playClick();
      this.modalRules.classList.add('hidden');
    });

    // Modal de ejercicio personalizado
    this.btnCustomExercise.addEventListener('click', () => {
      this.sound.playClick();
      this.modalCustom.classList.remove('hidden');
      this.customErrorMsg.classList.add('hidden');
    });
    this.btnCloseCustomModal.addEventListener('click', () => {
      this.modalCustom.classList.add('hidden');
    });
    this.btnCancelCustom.addEventListener('click', () => {
      this.modalCustom.classList.add('hidden');
    });

    // Chips de ejemplo en el modal
    document.querySelectorAll('.clay-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        this.sound.playClick();
        this.customPolyInput.value = e.currentTarget.dataset.example;
      });
    });

    // Cargar ejercicio personalizado
    this.btnLoadCustom.addEventListener('click', () => {
      const val = this.customPolyInput.value.trim();
      const validation = this.engine.validateBrackets(val);
      if (!validation.valid) {
        this.customErrorMsg.textContent = `Error: ${validation.error}`;
        this.customErrorMsg.classList.remove('hidden');
        this.sound.playError();
        return;
      }
      this.sound.playSuccess();
      this.modalCustom.classList.add('hidden');
      this.startCustomExercise(val);
    });

    // Generar aleatorio
    this.btnRandomExercise.addEventListener('click', () => {
      this.sound.playClick();
      const generated = PolynomialGenerator.generate(this.currentLevelIdx + 1);
      this.startCustomExercise(generated, `Ejercicio Generado (${CURRICULUM_LEVELS[this.currentLevelIdx].name})`);
    });

    // Reiniciar ejercicio
    this.btnResetCurrent.addEventListener('click', () => {
      this.sound.playClick();
      this.currentExpression = this.originalExpression;
      this.stepsHistory = [];
      this.updateStepsHistoryDisplay();
      this.processCurrentExpressionState();
    });

    // Teclado en pantalla
    document.querySelectorAll('.key-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.action;
        const val = e.currentTarget.dataset.val;
        this.handleKeypadInput(action, val);
      });
    });

    // Opciones de Ley de signos
    document.querySelectorAll('.clay-btn-sign').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.handleSignRuleChoice(e.currentTarget.dataset.sign);
      });
    });

    // Botón continuar en el banner de feedback
    this.btnNextStep.addEventListener('click', () => {
      this.sound.playClick();
      this.feedbackMessage.classList.add('hidden');
      if (this.currentStepData && this.currentStepData.type === 'FINISHED') {
        this.advanceToNextExercise();
      } else {
        this.processCurrentExpressionState();
      }
    });

    // Soporte para teclado físico de computadora
    window.addEventListener('keydown', (e) => {
      if (!this.phaseSolve.classList.contains('hidden')) {
        if (e.key >= '0' && e.key <= '9') {
          this.handleKeypadInput('num', e.key);
        } else if (e.key === '+' || e.key === '-') {
          this.handleKeypadInput('set-sign', e.key);
        } else if (e.key === 'Backspace') {
          this.handleKeypadInput('backspace');
        } else if (e.key === 'Enter') {
          this.handleKeypadInput('submit');
        } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
          this.handleKeypadInput('clear');
        }
      }
    });
  }

  // Renderizar botones de la lista de niveles
  renderLevelSelector() {
    this.levelsContainer.innerHTML = '';
    CURRICULUM_LEVELS.forEach((lvl, idx) => {
      const chip = document.createElement('button');
      chip.className = `level-chip ${idx === this.currentLevelIdx ? 'active' : ''}`;
      chip.innerHTML = `<span>${lvl.badge}</span>: ${lvl.name.split(':')[1] || lvl.name}`;
      chip.addEventListener('click', () => {
        this.sound.playClick();
        this.loadExercise(idx, 0);
      });
      this.levelsContainer.appendChild(chip);
    });
  }

  // Cargar un ejercicio del currículo
  loadExercise(levelIdx, exerciseIdx) {
    this.currentLevelIdx = levelIdx;
    const level = CURRICULUM_LEVELS[levelIdx];
    this.currentExerciseIdx = exerciseIdx % level.exercises.length;

    const expr = level.exercises[this.currentExerciseIdx];
    this.originalExpression = expr;
    this.currentExpression = expr;
    this.stepsHistory = [];

    // Actualizar indicador de nivel
    this.currentLevelNameEl.textContent = `${level.name} - Ejercicio ${this.currentExerciseIdx + 1}`;
    const progressPercent = ((this.currentExerciseIdx + 1) / level.exercises.length) * 100;
    this.exerciseProgressBar.style.width = `${progressPercent}%`;
    this.exerciseCounterEl.textContent = `${this.currentExerciseIdx + 1} de ${level.exercises.length}`;

    this.renderLevelSelector();
    this.updateStepsHistoryDisplay();
    this.processCurrentExpressionState();
  }

  // Iniciar un ejercicio personalizado o generado al vuelo
  startCustomExercise(expr, customTitle = "Ejercicio Personalizado") {
    this.originalExpression = expr;
    this.currentExpression = expr;
    this.stepsHistory = [];
    this.currentLevelNameEl.textContent = customTitle;
    this.exerciseProgressBar.style.width = `100%`;
    this.exerciseCounterEl.textContent = `Personalizado`;
    this.updateStepsHistoryDisplay();
    this.processCurrentExpressionState();
  }

  // Renderizar la expresión matemática resaltando llaves, corchetes y paréntesis con estilo
  renderMathDisplay(targetMatch = null) {
    this.mathDisplayEl.innerHTML = '';
    const expr = this.currentExpression;
    
    // Tokens para estilizado con clases según tipo de corchete
    let i = 0;
    while (i < expr.length) {
      const char = expr[i];

      // Signos de agrupación
      if (char === '(' || char === ')') {
        const span = document.createElement('span');
        span.className = 'math-token token-bracket paren';
        span.textContent = char;
        this.mathDisplayEl.appendChild(span);
        i++;
      } else if (char === '[' || char === ']') {
        const span = document.createElement('span');
        span.className = 'math-token token-bracket square';
        span.textContent = char;
        this.mathDisplayEl.appendChild(span);
        i++;
      } else if (char === '{' || char === '}') {
        const span = document.createElement('span');
        span.className = 'math-token token-bracket curly';
        span.textContent = char;
        this.mathDisplayEl.appendChild(span);
        i++;
      } else if (char === '+' || char === '-' || char === '*' || char === '·') {
        const span = document.createElement('span');
        span.className = 'math-token token-op';
        span.textContent = ` ${char} `;
        this.mathDisplayEl.appendChild(span);
        i++;
      } else if (/\d/.test(char)) {
        let numStr = '';
        while (i < expr.length && /\d/.test(expr[i])) {
          numStr += expr[i];
          i++;
        }
        const span = document.createElement('span');
        span.className = 'math-token token-num';
        span.textContent = numStr;
        this.mathDisplayEl.appendChild(span);
      } else {
        // Espacios u otros
        i++;
      }
    }
  }

  // Actualizar píldoras de jerarquía visual
  updateHierarchyPills(activeBracketType) {
    this.pillParen.classList.toggle('active', activeBracketType === 'paren');
    this.pillBracket.classList.toggle('active', activeBracketType === 'square');
    this.pillBrace.classList.toggle('active', activeBracketType === 'curly');
  }

  // Evaluar estado actual de la expresión y decidir la siguiente fase didáctica
  processCurrentExpressionState() {
    this.feedbackMessage.classList.add('hidden');
    this.renderMathDisplay();

    // Obtener el siguiente paso del motor
    const step = this.engine.getNextStep(this.currentExpression);
    this.currentStepData = step;

    // Caso: Ejercicio terminado con éxito
    if (step.type === 'FINISHED') {
      this.showFinalCelebration(step.finalResult);
      return;
    }

    // Actualizar píldora de jerarquía
    if (step.innermost) {
      this.updateHierarchyPills(step.innermost.type);
    } else {
      this.updateHierarchyPills(null);
    }

    // Decidir fase:
    // Si la expresión tiene signos de agrupación y aún no se ha seleccionado por dónde empezar
    if (step.type === 'SOLVE_INSIDE' && this.shouldAskWhereToStart()) {
      this.startPhaseIdentify(step);
    } else if (step.type === 'SUPPRESS_SIGN') {
      this.startPhaseSignRule(step);
    } else {
      // Resolver cálculo matemático
      this.startPhaseSolve(step);
    }
  }

  // Preguntar por dónde empezar si hay corchetes o llaves presentes
  shouldAskWhereToStart() {
    const hasParen = this.currentExpression.includes('(');
    const hasSquare = this.currentExpression.includes('[');
    const hasCurly = this.currentExpression.includes('{');
    // Si tiene más de un tipo de signo de agrupación, o es el inicio de un polinomio con agrupación
    return (hasParen && hasSquare) || (hasSquare && hasCurly) || (hasParen && hasCurly) || this.stepsHistory.length === 0;
  }

  // FASE 1: ¿Por dónde empezar?
  startPhaseIdentify(step) {
    this.guideStepTag.textContent = 'PASO 1: ¿POR DÓNDE EMPEZAR?';
    this.guideInstructionText.textContent = 'Observa la expresión completa. ¿Qué signo o bloque de agrupación debemos resolver primero?';

    this.phaseIdentify.classList.remove('hidden');
    this.phaseSolve.classList.add('hidden');
    this.phaseSignRule.classList.add('hidden');

    // Generar opciones con el motor
    const options = this.engine.generateIdentifyOptions(this.currentExpression, step.innermost);
    this.identifyOptionsGrid.innerHTML = '';

    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'option-clay-btn';
      btn.innerHTML = `
        <span class="option-tag">${opt.tag}</span>
        <span class="option-text">${opt.text}</span>
      `;
      btn.addEventListener('click', () => {
        this.handleIdentifyChoice(opt, step);
      });
      this.identifyOptionsGrid.appendChild(btn);
    });
  }

  handleIdentifyChoice(opt, step) {
    if (opt.isCorrect) {
      this.sound.playSuccess();
      this.addScore(100);
      this.increaseStreak();

      this.showFeedback(true, '¡Excelente elección de jerarquía!', opt.feedback, () => {
        this.startPhaseSolve(step);
      });
    } else {
      this.sound.playError();
      this.resetStreak();
      this.showFeedback(false, '¡Atención a la Jerarquía!', opt.feedback);
    }
  }

  // FASE 2: Resolver la operación matemática interna
  startPhaseSolve(step) {
    this.guideStepTag.textContent = 'PASO 2: RESUELVE LA MATEMÁTICA';
    this.guideInstructionText.textContent = 'Aplica las reglas de números enteros (suma, resta y signos) para calcular el resultado.';

    this.phaseIdentify.classList.add('hidden');
    this.phaseSolve.classList.remove('hidden');
    this.phaseSignRule.classList.add('hidden');

    this.targetSubexprText.textContent = step.subexpr;
    this.pedagogicalHintBox.innerHTML = `💡 <strong>Recuerda:</strong> ${step.pedagogicalRule || 'Resuelve respetando los signos de cada número.'}`;

    // Limpiar entrada
    this.inputSign = '';
    this.inputNum = '';
    this.updatePreviewDisplay();
  }

  // Manejar teclado en pantalla y físico
  handleKeypadInput(action, val) {
    this.sound.playClick();

    if (action === 'set-sign') {
      this.inputSign = val;
    } else if (action === 'num') {
      if (this.inputNum.length < 4) {
        this.inputNum += val;
      }
    } else if (action === 'backspace') {
      if (this.inputNum.length > 0) {
        this.inputNum = this.inputNum.slice(0, -1);
      } else {
        this.inputSign = '';
      }
    } else if (action === 'clear') {
      this.inputSign = '';
      this.inputNum = '';
    } else if (action === 'submit') {
      this.submitAnswer();
      return;
    }

    this.updatePreviewDisplay();
  }

  updatePreviewDisplay() {
    this.previewSign.textContent = this.inputSign;
    this.previewNum.textContent = this.inputNum || (this.inputSign ? '' : '?');
  }

  submitAnswer() {
    if (!this.inputNum) {
      this.sound.playError();
      this.showFeedback(false, 'Ingresa un número', 'Por favor ingresa el valor numérico del resultado antes de comprobar.');
      return;
    }

    const step = this.currentStepData;
    const userNum = parseInt(this.inputNum, 10);
    // Si no puso signo y el valor esperado es positivo, asumimos positivo (convención matemática estándar)
    let userSign = this.inputSign;
    if (!userSign) {
      userSign = '+';
    }

    const expectedSign = step.expectedSign;
    const expectedNum = step.expectedNum;

    // Validación detallada
    if (userNum === expectedNum && (userSign === expectedSign || (expectedNum === 0))) {
      // ¡Acierto perfecto!
      this.sound.playSuccess();
      this.addScore(150);
      this.increaseStreak();

      // Guardar en el historial de pasos
      this.stepsHistory.push({
        exprBefore: this.currentExpression,
        action: `Resuelto: ${step.subexpr} = ${expectedSign === '-' ? '-' : ''}${expectedNum}`,
        exprAfter: step.nextExpr
      });

      this.currentExpression = step.nextExpr;
      this.updateStepsHistoryDisplay();

      this.showFeedback(
        true,
        '¡Cálculo Correcto! 🎯',
        `Muy bien: ${step.subexpr} da como resultado ${expectedSign === '-' ? '-' : ''}${expectedNum}. ${step.pedagogicalRule}`,
        () => {
          this.processCurrentExpressionState();
        }
      );
    } else {
      // Error: Retroalimentación pedagógica formativa
      this.sound.playError();
      this.resetStreak();

      let errorDetail = '';
      if (userNum !== expectedNum && userSign === expectedSign) {
        errorDetail = `El signo (${userSign}) es correcto, pero el valor numérico falló. Recuerda: revisa la suma o resta de los valores.`;
      } else if (userNum === expectedNum && userSign !== expectedSign) {
        errorDetail = `El número ${userNum} es correcto, ¡pero cuidado con el signo! Gana el signo del número con mayor valor absoluto.`;
      } else {
        errorDetail = `Revisa con calma: ${step.pedagogicalRule}`;
      }

      this.showFeedback(false, 'Revisemos la operación', errorDetail);
    }
  }

  // FASE 3: Ley de signos / Supresión de signo de agrupación
  startPhaseSignRule(step) {
    this.guideStepTag.textContent = 'PASO 3: LEY DE SIGNOS (SUPRESIÓN)';
    this.guideInstructionText.textContent = 'Hay un signo justo antes del bloque. ¿Qué signo resulta al suprimirlo?';

    this.phaseIdentify.classList.add('hidden');
    this.phaseSolve.classList.add('hidden');
    this.phaseSignRule.classList.remove('hidden');

    this.signTransformBefore.textContent = step.transformBefore;
    this.signTransformAfter.textContent = `? ${step.absNum}`;
  }

  handleSignRuleChoice(chosenSign) {
    const step = this.currentStepData;
    this.sound.playClick();

    if (chosenSign === step.expectedSign) {
      this.sound.playSuccess();
      this.addScore(120);
      this.increaseStreak();

      this.stepsHistory.push({
        exprBefore: this.currentExpression,
        action: `Ley de signos: ${step.transformBefore} ➔ ${step.transformAfter}`,
        exprAfter: step.nextExpr
      });

      this.currentExpression = step.nextExpr;
      this.updateStepsHistoryDisplay();

      this.showFeedback(
        true,
        '¡Excelente aplicación de la ley de signos!',
        step.ruleExplanation,
        () => {
          this.processCurrentExpressionState();
        }
      );
    } else {
      this.sound.playError();
      this.resetStreak();

      const opposingName = step.expectedSign === '+' ? 'positivo (+)' : 'negativo (-)';
      this.showFeedback(
        false,
        '¡Ojo con la ley de signos!',
        `Recuerda: signos iguales dan más (+), signos contrarios dan menos (-). En este caso debe ser ${opposingName}.`
      );
    }
  }

  // Actualizar la lista visual del historial paso a paso
  updateStepsHistoryDisplay() {
    this.stepsHistoryList.innerHTML = '';
    
    // Paso inicial
    const initialItem = document.createElement('div');
    initialItem.className = 'step-item';
    initialItem.innerHTML = `
      <span class="step-number-bubble">0</span>
      <span class="step-math">${this.originalExpression}</span>
      <span class="step-note">Inicio</span>
    `;
    this.stepsHistoryList.appendChild(initialItem);

    // Pasos sucesivos
    this.stepsHistory.forEach((step, idx) => {
      const item = document.createElement('div');
      item.className = 'step-item';
      item.innerHTML = `
        <span class="step-number-bubble">${idx + 1}</span>
        <span class="step-math">${step.exprAfter}</span>
        <span class="step-note">${step.action}</span>
      `;
      this.stepsHistoryList.appendChild(item);
    });
  }

  // Celebración final al resolver el polinomio completo
  showFinalCelebration(finalValue) {
    this.sound.playFanfare();
    this.triggerConfetti();
    this.addScore(300);

    this.guideStepTag.textContent = '¡POLINOMIO RESUELTO CON ÉXITO!';
    this.guideInstructionText.textContent = `¡Felicidades! El resultado final simplificado es ${finalValue}.`;

    // Renderizar solo el resultado final en grande
    this.mathDisplayEl.innerHTML = `
      <div style="font-size: 2.8rem; color: #059669; display: flex; align-items: center; gap: 0.8rem;">
        <span>🏆 Resultado Final =</span>
        <span style="background: #D1FAE5; padding: 0.3rem 1rem; border-radius: 16px; border: 3px solid #10B981; box-shadow: 4px 4px 12px rgba(16,185,129,0.3);">${finalValue}</span>
      </div>
    `;

    this.phaseIdentify.classList.add('hidden');
    this.phaseSolve.classList.add('hidden');
    this.phaseSignRule.classList.add('hidden');

    this.showFeedback(
      true,
      '¡Misión Cumplida, Gran Matemático! 🌟',
      `Has destruido todos los signos de agrupación y aplicado la ley de signos con maestría.`,
      () => {
        this.advanceToNextExercise();
      }
    );
  }

  advanceToNextExercise() {
    const level = CURRICULUM_LEVELS[this.currentLevelIdx];
    if (this.currentExerciseIdx + 1 < level.exercises.length) {
      this.loadExercise(this.currentLevelIdx, this.currentExerciseIdx + 1);
    } else {
      // Subir de nivel automáticamente si completó todos los de ese nivel
      if (this.currentLevelIdx + 1 < CURRICULUM_LEVELS.length) {
        this.loadExercise(this.currentLevelIdx + 1, 0);
      } else {
        // Volver a empezar o generar
        this.loadExercise(0, 0);
      }
    }
  }

  // Manejo de puntuación y rachas
  addScore(pts) {
    this.score += pts;
    this.scoreCountEl.textContent = this.score;
  }

  increaseStreak() {
    this.streak++;
    this.streakCountEl.textContent = this.streak;
  }

  resetStreak() {
    this.streak = 0;
    this.streakCountEl.textContent = this.streak;
  }

  // Mostrar pancarta de feedback
  showFeedback(isSuccess, heading, detail, nextCallback = null) {
    this.feedbackMessage.className = `feedback-banner ${isSuccess ? '' : 'error'}`;
    this.feedbackIcon.textContent = isSuccess ? '🎉' : '🤔';
    this.feedbackHeading.textContent = heading;
    this.feedbackDetail.textContent = detail;
    this.feedbackMessage.classList.remove('hidden');

    if (isSuccess && nextCallback) {
      this.btnNextStep.classList.remove('hidden');
      this.btnNextStep.onclick = () => {
        this.feedbackMessage.classList.add('hidden');
        nextCallback();
      };
    } else {
      this.btnNextStep.classList.add('hidden');
    }
  }

  // Sistema de partículas de confetti (Plastilina multicolor)
  initConfetti() {
    this.canvas = document.getElementById('confetti-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.confettiPieces = [];

    const resize = () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();
  }

  triggerConfetti() {
    const colors = ['#7C3AED', '#2563EB', '#059669', '#F59E0B', '#E11D48', '#38BDF8'];
    this.confettiPieces = [];

    for (let i = 0; i < 90; i++) {
      this.confettiPieces.push({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        vx: (Math.random() - 0.5) * 18,
        vy: (Math.random() - 0.8) * 18,
        size: Math.random() * 12 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
        gravity: 0.35,
        opacity: 1
      });
    }

    if (!this.confettiRunning) {
      this.confettiRunning = true;
      this.animateConfetti();
    }
  }

  animateConfetti() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.confettiPieces.length - 1; i >= 0; i--) {
      const p = this.confettiPieces[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.rotation += p.rotSpeed;
      p.opacity -= 0.008;

      if (p.opacity <= 0) {
        this.confettiPieces.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.globalAlpha = Math.max(0, p.opacity);
      this.ctx.fillStyle = p.color;

      // Forma redondeada suave tipo arcilla
      this.ctx.beginPath();
      this.ctx.roundRect(-p.size / 2, -p.size / 2, p.size, p.size, [4]);
      this.ctx.fill();
      this.ctx.restore();
    }

    if (this.confettiPieces.length > 0) {
      requestAnimationFrame(() => this.animateConfetti());
    } else {
      this.confettiRunning = false;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

// Inicializar la aplicación cuando cargue la página
window.addEventListener('DOMContentLoaded', () => {
  window.app = new PolyClayApp();
});
