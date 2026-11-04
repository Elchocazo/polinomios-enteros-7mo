/**
 * PolyClay 7° - Controlador Principal de la Aplicación y Lógica Gamificada
 * Incluye Modo Práctica por Niveles y Modo Examen Oficial con Calificación de 1.0 a 5.0 y Ranking
 */

class PolyClayApp {
  constructor() {
    this.engine = new PolyEngine();
    this.sound = window.soundCtrl;
    
    // Estado del juego en modo práctica
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

    // Estado de Modo Examen y Evaluación Gamificada
    this.isExamMode = false;
    this.examStudentName = '';
    this.examStudentNombre = '';
    this.examStudentApellido = '';
    this.examCurrentAttempt = 1; // 1, 2 o 3
    this.examCurrentQuestionIdx = 0; // 0 a 9
    this.examQuestions = [];
    this.examQuestionErrors = 0;
    this.examAciertos = 0;
    this.examQuestionResults = [];
    this.evalEngine = typeof EvaluationEngine !== 'undefined' ? new EvaluationEngine() : null;

    // Inicializar referencias DOM y eventos
    this.cacheDom();
    this.bindEvents();
    this.initConfetti();
    if (typeof PolynomialGenerator !== 'undefined' && PolynomialGenerator.refreshCurriculumLevels) {
      PolynomialGenerator.refreshCurriculumLevels();
    }
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
    this.btnExamMode = document.getElementById('btn-exam-mode');
    this.btnRankingView = document.getElementById('btn-ranking-view');

    // Navegación de niveles
    this.levelsContainer = document.getElementById('levels-container');

    // Banner activo de Modo Examen y estadísticas en vivo
    this.examActiveBanner = document.getElementById('exam-active-banner');
    this.examBannerName = document.getElementById('exam-banner-name');
    this.examBannerAttempt = document.getElementById('exam-banner-attempt');
    this.examDotsContainer = document.getElementById('exam-dots-container');
    this.examLiveShieldsCount = document.getElementById('exam-live-shields-count');
    this.examLiveGradeVal = document.getElementById('exam-live-grade-val');
    this.btnExamExit = document.getElementById('btn-exam-exit');

    // Guía del robot
    this.guideBanner = document.getElementById('guide-banner');
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

    // Modales de práctica y reglas
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

    // Tienda de Recompensas y Escudos
    this.btnStoreModal = document.getElementById('btn-store-modal');
    this.modalRewardsStore = document.getElementById('modal-rewards-store');
    this.btnCloseRewardsStore = document.getElementById('btn-close-rewards-store');
    this.btnCloseRewardsStore2 = document.getElementById('btn-close-rewards-store-2');
    this.storeStudentPoints = document.getElementById('store-student-points');
    this.storeStudentShields = document.getElementById('store-student-shields');
    this.storeStudentGems = document.getElementById('store-student-gems');
    this.btnBuyShield = document.getElementById('btn-buy-shield');
    this.btnBuyGem = document.getElementById('btn-buy-gem');
    this.storeFeedbackMsg = document.getElementById('store-feedback-msg');

    // Modales de Examen y Ranking
    this.modalExamRegister = document.getElementById('modal-exam-register');
    this.btnCloseExamRegister = document.getElementById('btn-close-exam-register');
    this.examInputNombre = document.getElementById('exam-input-nombre');
    this.examInputApellido = document.getElementById('exam-input-apellido');
    this.examStudentHistoryBanner = document.getElementById('exam-student-history-banner');
    this.examHistoryGreeting = document.getElementById('exam-history-greeting');
    this.examHistoryDetail = document.getElementById('exam-history-detail');
    this.examRegisterError = document.getElementById('exam-register-error');
    this.btnStartExamConfirm = document.getElementById('btn-start-exam-confirm');
    this.btnExamRegRanking = document.getElementById('btn-exam-reg-ranking');

    this.modalExamResults = document.getElementById('modal-exam-results');
    this.btnCloseExamResults = document.getElementById('btn-close-exam-results');
    this.examFinalGrade = document.getElementById('exam-final-grade');
    this.examDesempenoBadge = document.getElementById('exam-desempeno-badge');
    this.examStatBaseGrade = document.getElementById('exam-stat-base-grade');
    this.examStatErrors = document.getElementById('exam-stat-errors');
    this.examStatShields = document.getElementById('exam-stat-shields');
    this.examStatCorrect = document.getElementById('exam-stat-correct');
    this.examStatAttempt = document.getElementById('exam-stat-attempt');
    this.examStatBest = document.getElementById('exam-stat-best');
    this.btnExamRedeemTenth = document.getElementById('btn-exam-redeem-tenth');
    this.examRedeemedCountBadge = document.getElementById('exam-redeemed-count-badge');
    this.examSaveCloudStatus = document.getElementById('exam-save-cloud-status');
    this.examRetryCard = document.getElementById('exam-retry-card');
    this.examRetryHeading = document.getElementById('exam-retry-heading');
    this.examRetryText = document.getElementById('exam-retry-text');
    this.btnExamResultsFinish = document.getElementById('btn-exam-results-finish');
    this.btnExamResultsRanking = document.getElementById('btn-exam-results-ranking');
    this.btnExamRetry = document.getElementById('btn-exam-retry');

    this.modalRanking = document.getElementById('modal-ranking');
    this.btnCloseRankingModal = document.getElementById('btn-close-ranking-modal');
    this.btnCloseRankingModal2 = document.getElementById('btn-close-ranking-modal-2');
    this.rankingSearchInput = document.getElementById('ranking-search-input');
    this.btnRankingExportCsv = document.getElementById('btn-ranking-export-csv');
    this.btnRankingClearAll = document.getElementById('btn-ranking-clear-all');
    this.rankingTableBody = document.getElementById('ranking-table-body');
    this.rankingEmptyState = document.getElementById('ranking-empty-state');
    this.btnRankingStartExam = document.getElementById('btn-ranking-start-exam');
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

    // Tienda de Recompensas
    if (this.btnStoreModal) {
      this.btnStoreModal.addEventListener('click', () => {
        this.sound.playClick();
        this.openRewardsStore();
      });
    }
    if (this.btnCloseRewardsStore) {
      this.btnCloseRewardsStore.addEventListener('click', () => {
        this.modalRewardsStore.classList.add('hidden');
      });
    }
    if (this.btnCloseRewardsStore2) {
      this.btnCloseRewardsStore2.addEventListener('click', () => {
        this.modalRewardsStore.classList.add('hidden');
      });
    }
    if (this.btnBuyShield) {
      this.btnBuyShield.addEventListener('click', () => {
        this.buyReward('escudo');
      });
    }
    if (this.btnBuyGem) {
      this.btnBuyGem.addEventListener('click', () => {
        this.buyReward('gema');
      });
    }

    // Modal de Modo Examen: Botones de apertura
    this.btnExamMode.addEventListener('click', () => {
      this.sound.playClick();
      this.openExamRegisterModal();
    });

    this.btnCloseExamRegister.addEventListener('click', () => {
      this.modalExamRegister.classList.add('hidden');
    });

    // Chequeo en tiempo real al escribir nombre o apellido del estudiante
    if (this.examInputNombre) {
      this.examInputNombre.addEventListener('input', () => {
        this.checkStudentHistoryPreview();
      });
    }
    if (this.examInputApellido) {
      this.examInputApellido.addEventListener('input', () => {
        this.checkStudentHistoryPreview();
      });
    }

    this.btnStartExamConfirm.addEventListener('click', () => {
      this.startExamSession();
    });

    this.btnExamRegRanking.addEventListener('click', () => {
      this.modalExamRegister.classList.add('hidden');
      this.openRankingModal();
    });

    // Botón de salir del examen
    this.btnExamExit.addEventListener('click', () => {
      if (confirm('¿Estás seguro de que deseas salir del examen? Tu progreso en este intento no se guardará.')) {
        this.exitExamMode();
      }
    });

    // Modales de resultados
    this.btnCloseExamResults.addEventListener('click', () => {
      this.modalExamResults.classList.add('hidden');
    });
    this.btnExamResultsFinish.addEventListener('click', () => {
      this.modalExamResults.classList.add('hidden');
      this.exitExamMode();
    });
    this.btnExamResultsRanking.addEventListener('click', () => {
      this.modalExamResults.classList.add('hidden');
      this.openRankingModal();
    });
    this.btnExamRetry.addEventListener('click', () => {
      this.modalExamResults.classList.add('hidden');
      this.retryExamAttempt();
    });

    // Modal de Ranking
    this.btnRankingView.addEventListener('click', () => {
      this.sound.playClick();
      this.openRankingModal();
    });
    this.btnCloseRankingModal.addEventListener('click', () => {
      this.modalRanking.classList.add('hidden');
    });
    this.btnCloseRankingModal2.addEventListener('click', () => {
      this.modalRanking.classList.add('hidden');
    });
    this.btnRankingStartExam.addEventListener('click', () => {
      this.modalRanking.classList.add('hidden');
      this.openExamRegisterModal();
    });

    // Búsqueda en el ranking
    this.rankingSearchInput.addEventListener('input', (e) => {
      this.renderRankingTable(e.target.value);
    });

    // Exportar CSV
    this.btnRankingExportCsv.addEventListener('click', () => {
      this.exportRankingCSV();
    });

    // Limpiar ranking
    this.btnRankingClearAll.addEventListener('click', () => {
      if (confirm('¿Profesor(a), está seguro de que desea reiniciar la tabla del ranking? Esta acción borrará todas las calificaciones almacenadas en este navegador.')) {
        RankingManager.clearAll();
        this.renderRankingTable();
        alert('El ranking ha sido reiniciado correctamente.');
      }
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

    // Reiniciar ejercicio (en práctica genera un ejercicio nuevo y diferente)
    this.btnResetCurrent.addEventListener('click', () => {
      this.sound.playClick();
      if (!this.isExamMode) {
        this.loadExercise(this.currentLevelIdx, this.currentExerciseIdx);
      } else {
        this.currentExpression = this.originalExpression;
        this.stepsHistory = [];
        this.updateStepsHistoryDisplay();
        this.processCurrentExpressionState();
      }
    });
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
        if (this.isExamMode) {
          this.advanceExamQuestion();
        } else {
          this.advanceToNextExercise();
        }
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

  // ==========================================================================
  // Navegación de Niveles y Modo Práctica
  // ==========================================================================

  renderLevelSelector() {
    this.levelsContainer.innerHTML = '';

    // Niveles curriculares
    CURRICULUM_LEVELS.forEach((lvl, idx) => {
      const chip = document.createElement('button');
      chip.className = `level-chip ${!this.isExamMode && idx === this.currentLevelIdx ? 'active' : ''}`;
      chip.innerHTML = `<span>${lvl.badge}</span>: ${lvl.name.split(':')[1] || lvl.name}`;
      chip.addEventListener('click', () => {
        if (this.isExamMode) {
          if (!confirm('Estás en Modo Examen. ¿Deseas salir a la práctica?')) return;
          this.exitExamMode();
        }
        this.sound.playClick();
        this.loadExercise(idx, 0);
      });
      this.levelsContainer.appendChild(chip);
    });

    // Chip especial directo a Modo Examen
    const examChip = document.createElement('button');
    examChip.className = `level-chip ${this.isExamMode ? 'active' : ''}`;
    examChip.style.borderColor = '#FDA4AF';
    examChip.innerHTML = `<span>📝</span> Modo Examen (10 Preguntas)`;
    examChip.addEventListener('click', () => {
      this.sound.playClick();
      this.openExamRegisterModal();
    });
    this.levelsContainer.appendChild(examChip);

    // Chip directo a Ranking
    const rankChip = document.createElement('button');
    rankChip.className = 'level-chip';
    rankChip.style.borderColor = '#C7D2FE';
    rankChip.innerHTML = `<span>🏆</span> Tabla de Ranking`;
    rankChip.addEventListener('click', () => {
      this.sound.playClick();
      this.openRankingModal();
    });
    this.levelsContainer.appendChild(rankChip);
  }

  loadExercise(levelIdx, exerciseIdx) {
    this.isExamMode = false;
    this.examActiveBanner.classList.add('hidden');

    this.currentLevelIdx = levelIdx;
    const level = CURRICULUM_LEVELS[levelIdx];
    this.currentExerciseIdx = exerciseIdx % (level.exercises.length || 5);

    // Generar SIEMPRE un ejercicio nuevo, dinámico y único cada vez que se entra o avanza
    let expr = '';
    if (typeof PolynomialGenerator !== 'undefined' && PolynomialGenerator.generate) {
      expr = PolynomialGenerator.generate(level.id);
      level.exercises[this.currentExerciseIdx] = expr;
    } else {
      expr = level.exercises[this.currentExerciseIdx] || '8 - (-3 + 5)';
    }

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

  startCustomExercise(expr, customTitle = "Ejercicio Personalizado") {
    this.isExamMode = false;
    this.examActiveBanner.classList.add('hidden');

    this.originalExpression = expr;
    this.currentExpression = expr;
    this.stepsHistory = [];
    this.currentLevelNameEl.textContent = customTitle;
    this.exerciseProgressBar.style.width = `100%`;
    this.exerciseCounterEl.textContent = `Personalizado`;
    this.updateStepsHistoryDisplay();
    this.processCurrentExpressionState();
  }

  // ==========================================================================
  // TIENDA DE RECOMPENSAS Y ECONOMÍA DE PUNTOS
  // ==========================================================================

  openRewardsStore() {
    const studentId = this.examStudentNombre && this.examStudentApellido
      ? EvaluationEngine.generateStudentId(this.examStudentNombre, this.examStudentApellido)
      : 'std_jugador_local';

    const inv = EvaluationEngine.getInventory(studentId);
    if (this.storeStudentPoints) this.storeStudentPoints.textContent = inv.puntos;
    if (this.storeStudentShields) this.storeStudentShields.textContent = inv.escudosDisponibles || 0;
    if (this.storeStudentGems) this.storeStudentGems.textContent = inv.gemasObtenidas || 0;
    if (this.storeFeedbackMsg) this.storeFeedbackMsg.classList.add('hidden');

    if (this.modalRewardsStore) {
      this.modalRewardsStore.classList.remove('hidden');
    }
  }

  buyReward(rewardType) {
    const studentId = this.examStudentNombre && this.examStudentApellido
      ? EvaluationEngine.generateStudentId(this.examStudentNombre, this.examStudentApellido)
      : 'std_jugador_local';

    const result = EvaluationEngine.purchaseReward(studentId, rewardType);
    if (result.success) {
      this.sound.playSuccess();
      if (this.storeFeedbackMsg) {
        this.storeFeedbackMsg.textContent = `¡Excelente! Compraste ${result.reward.name} ${result.reward.icon}`;
        this.storeFeedbackMsg.className = 'clay-alert-error';
        this.storeFeedbackMsg.style.background = '#ECFDF5';
        this.storeFeedbackMsg.style.borderColor = '#6EE7B7';
        this.storeFeedbackMsg.style.color = '#065F46';
        this.storeFeedbackMsg.classList.remove('hidden');
      }
      if (this.storeStudentPoints) this.storeStudentPoints.textContent = result.inventory.puntos;
      if (this.storeStudentShields) this.storeStudentShields.textContent = result.inventory.escudosDisponibles;
      if (this.storeStudentGems) this.storeStudentGems.textContent = result.inventory.gemasObtenidas;

      // Actualizar puntos de la barra superior
      this.score = result.inventory.puntos;
      if (this.scoreCountEl) this.scoreCountEl.textContent = this.score;

      // Si está en examen activo, actualizar escudos disponibles
      if (this.isExamMode && this.evalEngine && this.evalEngine.currentSession) {
        this.evalEngine.currentSession.escudosDisponiblesActuales = result.inventory.escudosDisponibles;
        this.updateLiveExamStats();
      }
    } else {
      this.sound.playError();
      if (this.storeFeedbackMsg) {
        this.storeFeedbackMsg.textContent = result.message;
        this.storeFeedbackMsg.className = 'clay-alert-error';
        this.storeFeedbackMsg.style.background = '#FEF2F2';
        this.storeFeedbackMsg.style.borderColor = '#FCA5A5';
        this.storeFeedbackMsg.style.color = '#991B1B';
        this.storeFeedbackMsg.classList.remove('hidden');
      }
    }
  }

  updateLiveExamStats() {
    if (!this.isExamMode || !this.evalEngine || !this.evalEngine.currentSession) return;
    if (this.examLiveShieldsCount) {
      this.examLiveShieldsCount.textContent = this.evalEngine.currentSession.escudosDisponiblesActuales;
    }
    if (this.examLiveGradeVal) {
      this.examLiveGradeVal.textContent = this.evalEngine.getProvisionalBaseGrade().toFixed(1);
    }
  }

  updateDesempenoBadge(grade) {
    if (!this.examDesempenoBadge) return;
    this.examDesempenoBadge.className = 'desempeno-badge';
    if (grade >= 4.6) {
      this.examDesempenoBadge.classList.add('desempeno-superior');
      this.examDesempenoBadge.innerHTML = '🌟 Desempeño Superior';
    } else if (grade >= 4.0) {
      this.examDesempenoBadge.classList.add('desempeno-alto');
      this.examDesempenoBadge.innerHTML = '👏 Desempeño Alto';
    } else if (grade >= 3.0) {
      this.examDesempenoBadge.classList.add('desempeno-basico');
      this.examDesempenoBadge.innerHTML = '👍 Desempeño Básico';
    } else {
      this.examDesempenoBadge.classList.add('desempeno-bajo');
      this.examDesempenoBadge.innerHTML = '⚠️ Desempeño Bajo';
    }
  }

  // ==========================================================================
  // LÓGICA DE MODO EXAMEN GAMIFICADO (10 PREGUNTAS, NOTA 5.0 - ERRORES * 0.2, 3 OPORTUNIDADES)
  // ==========================================================================

  openExamRegisterModal() {
    this.modalExamRegister.classList.remove('hidden');
    this.examRegisterError.classList.add('hidden');
    
    // Si ya había ingresado datos, precargarlos
    if (this.examStudentNombre && this.examInputNombre) {
      this.examInputNombre.value = this.examStudentNombre;
    }
    if (this.examStudentApellido && this.examInputApellido) {
      this.examInputApellido.value = this.examStudentApellido;
    }
    this.checkStudentHistoryPreview();
    if (this.examInputNombre) this.examInputNombre.focus();
  }

  checkStudentHistoryPreview() {
    const nom = this.examInputNombre ? this.examInputNombre.value.trim() : '';
    const ape = this.examInputApellido ? this.examInputApellido.value.trim() : '';

    if (!nom && !ape) {
      this.examStudentHistoryBanner.classList.add('hidden');
      this.btnStartExamConfirm.textContent = '🚀 Iniciar Intento 1 de 3';
      return;
    }

    const fullName = `${nom} ${ape}`.trim();
    const existing = RankingManager.getStudent(fullName);
    if (existing) {
      this.examStudentHistoryBanner.classList.remove('hidden');
      this.examHistoryGreeting.textContent = `¡Hola de nuevo, ${existing.name}!`;

      const attempts = existing.attemptsCount || 1;
      const best = existing.bestGrade ? existing.bestGrade.toFixed(1) : '1.0';

      if (attempts >= 3) {
        this.examHistoryDetail.innerHTML = `Ya completaste tus <strong>3 oportunidades</strong> oficiales.<br>Tu mejor calificación definitiva es: <strong>${best} / 5.0</strong>.`;
        this.btnStartExamConfirm.textContent = '👀 Ver tu posición en el Ranking';
      } else {
        const remaining = 3 - attempts;
        const nextAttempt = attempts + 1;
        this.examHistoryDetail.innerHTML = `Llevas <strong>${attempts} de 3 intentos</strong>. Tu mejor nota actual es <strong>${best} / 5.0</strong>.<br>Te quedan <strong>${remaining} oportunidad(es)</strong> para mejorar tu nota.`;
        this.btnStartExamConfirm.textContent = `🚀 Iniciar Intento ${nextAttempt} de 3 (10 Preguntas)`;
      }
    } else {
      this.examStudentHistoryBanner.classList.add('hidden');
      this.btnStartExamConfirm.textContent = '🚀 Iniciar Intento 1 de 3 (10 Preguntas)';
    }
  }

  startExamSession() {
    const nom = this.examInputNombre ? this.examInputNombre.value.trim() : '';
    const ape = this.examInputApellido ? this.examInputApellido.value.trim() : '';

    if (nom.length < 2 || ape.length < 2) {
      this.examRegisterError.textContent = 'Por favor escribe tu Nombre y tu Apellido (ambos campos son obligatorios).';
      this.examRegisterError.classList.remove('hidden');
      this.sound.playError();
      return;
    }

    const fullName = `${nom} ${ape}`;
    const existing = RankingManager.getStudent(fullName);
    if (existing && existing.attemptsCount >= 3) {
      alert(`Hola ${existing.name}, ya has presentado tus 3 oportunidades reglamentarias. Tu nota definitiva registrada es ${existing.bestGrade.toFixed(1)} / 5.0.`);
      this.modalExamRegister.classList.add('hidden');
      this.openRankingModal(existing.name);
      return;
    }

    let attemptNum = 1;
    if (existing) {
      attemptNum = (existing.attemptsCount || 0) + 1;
    }

    this.examStudentNombre = nom;
    this.examStudentApellido = ape;
    this.examStudentName = fullName;
    this.examCurrentAttempt = attemptNum;

    // Inicializar sesión en el motor de evaluación oficial
    if (this.evalEngine) {
      this.evalEngine.startExamSession(nom, ape, attemptNum);
    }

    this.launchExamAttempt(attemptNum);
  }

  retryExamAttempt() {
    const fullName = this.examStudentName || `${this.examStudentNombre} ${this.examStudentApellido}`.trim();
    const existing = RankingManager.getStudent(fullName);
    const nextAttempt = existing ? (existing.attemptsCount || 1) + 1 : this.examCurrentAttempt + 1;

    if (nextAttempt > 3) {
      alert('Has alcanzado el límite máximo de 3 oportunidades.');
      this.openRankingModal(fullName);
      return;
    }

    this.examCurrentAttempt = nextAttempt;
    if (this.evalEngine) {
      this.evalEngine.startExamSession(this.examStudentNombre, this.examStudentApellido, nextAttempt);
    }
    this.launchExamAttempt(nextAttempt);
  }

  launchExamAttempt(attemptNum) {
    this.modalExamRegister.classList.add('hidden');
    this.modalExamResults.classList.add('hidden');
    this.sound.playSuccess();

    this.isExamMode = true;
    this.examCurrentQuestionIdx = 0;
    this.examQuestionErrors = 0;
    this.examAciertos = 0;
    this.examQuestionResults = new Array(10).fill(null);

    // Generar un set de 10 preguntas dinámicas y únicas:
    // Asegura que dos estudiantes contiguos en la sala de sistemas tengan ejercicios completamente diferentes.
    if (typeof PolynomialGenerator !== 'undefined' && PolynomialGenerator.generateExamSet) {
      this.examQuestions = PolynomialGenerator.generateExamSet();
    } else {
      const setIdx = (attemptNum - 1) % EXAM_SETS.length;
      this.examQuestions = [...EXAM_SETS[setIdx]];
    }

    // Actualizar banner superior de examen
    this.examActiveBanner.classList.remove('hidden');
    this.examBannerName.textContent = `Estudiante: ${this.examStudentName}`;
    this.examBannerAttempt.textContent = `Intento ${attemptNum} de 3 • Nota Base 5.0`;

    // Actualizar contadores en vivo
    this.updateLiveExamStats();

    this.renderExamDots();
    this.renderLevelSelector();
    this.loadExamQuestion(0);
  }

  renderExamDots() {
    this.examDotsContainer.innerHTML = '';
    for (let i = 0; i < 10; i++) {
      const dot = document.createElement('div');
      dot.className = 'tracker-dot';
      dot.id = `exam-dot-${i}`;
      dot.textContent = i + 1;

      if (i === this.examCurrentQuestionIdx) {
        dot.classList.add('active');
      } else if (this.examQuestionResults[i] === true) {
        dot.classList.add('correct');
        dot.textContent = '✓';
      } else if (this.examQuestionResults[i] === false) {
        dot.classList.add('wrong');
        dot.textContent = '✗';
      }
      this.examDotsContainer.appendChild(dot);
    }
  }

  loadExamQuestion(qIdx) {
    this.examCurrentQuestionIdx = qIdx;
    this.examQuestionErrors = 0;

    const expr = this.examQuestions[qIdx];
    this.originalExpression = expr;
    this.currentExpression = expr;
    this.stepsHistory = [];

    // Indicadores visuales de cabecera
    this.currentLevelNameEl.textContent = `📝 EXAMEN: Pregunta ${qIdx + 1} de 10 (Intento ${this.examCurrentAttempt}/3)`;
    const progressPercent = ((qIdx + 1) / 10) * 100;
    this.exerciseProgressBar.style.width = `${progressPercent}%`;
    this.exerciseCounterEl.textContent = `Pregunta ${qIdx + 1} de 10`;

    this.renderExamDots();
    this.updateStepsHistoryDisplay();
    this.updateLiveExamStats();
    this.processCurrentExpressionState();
  }

  advanceExamQuestion() {
    const nextIdx = this.examCurrentQuestionIdx + 1;
    if (nextIdx < 10) {
      this.loadExamQuestion(nextIdx);
    } else {
      this.finishExamSession();
    }
  }

  recordExamQuestionResult(isCorrect) {
    this.examQuestionResults[this.examCurrentQuestionIdx] = isCorrect;
    if (isCorrect) {
      this.examAciertos++;
    }
    this.renderExamDots();
  }

  setupTenthRedemption(finalResult, studentData) {
    if (!this.btnExamRedeemTenth) return;

    const refreshTenthUI = () => {
      const inv = EvaluationEngine.getInventory(finalResult.studentId);
      const decimas = this.evalEngine && this.evalEngine.currentSession
        ? this.evalEngine.currentSession.decimasCanjeadasEnExamen
        : 0;

      if (this.examRedeemedCountBadge) {
        this.examRedeemedCountBadge.textContent = `Canjeadas: ${decimas} / 2 (+${(decimas * 0.1).toFixed(1)})`;
      }

      if (decimas >= 2) {
        this.btnExamRedeemTenth.disabled = true;
        this.btnExamRedeemTenth.classList.add('disabled');
        this.btnExamRedeemTenth.textContent = '⭐ Límite de 2 décimas alcanzado';
      } else if (finalResult.notaFinal >= 5.0) {
        this.btnExamRedeemTenth.disabled = true;
        this.btnExamRedeemTenth.classList.add('disabled');
        this.btnExamRedeemTenth.textContent = '⭐ Ya tienes la nota máxima (5.0)';
      } else if (inv.puntos < 100) {
        this.btnExamRedeemTenth.disabled = true;
        this.btnExamRedeemTenth.classList.add('disabled');
        this.btnExamRedeemTenth.textContent = `⭐ Canjear +0.1 (Tienes ${inv.puntos} de 100 pts)`;
      } else {
        this.btnExamRedeemTenth.disabled = false;
        this.btnExamRedeemTenth.classList.remove('disabled');
        this.btnExamRedeemTenth.textContent = `⭐ Canjear +0.1 (100 Puntos - Tienes ${inv.puntos} pts)`;
      }
    };

    refreshTenthUI();

    this.btnExamRedeemTenth.onclick = () => {
      if (!this.evalEngine) return;
      const res = this.evalEngine.redeemAdditionalTenth();
      if (res.success) {
        this.sound.playSuccess();
        const newFinalGrade = Number(Math.min(5.0, finalResult.notaBase + (res.decimasCanjeadas * 0.1)).toFixed(1));
        finalResult.notaFinal = newFinalGrade;
        finalResult.decimasCanjeadas = res.decimasCanjeadas;
        this.examFinalGrade.textContent = newFinalGrade.toFixed(1);
        this.updateDesempenoBadge(newFinalGrade);

        // Actualizar ranking local y Firestore
        const updatedStudent = RankingManager.saveAttempt(
          this.examStudentName,
          newFinalGrade,
          finalResult.aciertos,
          this.examCurrentAttempt
        );
        this.examStatBest.textContent = `${updatedStudent.bestGrade.toFixed(1)} / 5.0`;

        if (window.FirebaseService) {
          window.FirebaseService.saveEvaluation(finalResult);
        }

        refreshTenthUI();
      } else {
        this.sound.playError();
        alert(res.message);
      }
    };
  }

  finishExamSession() {
    this.sound.playFanfare();
    this.triggerConfetti();

    // Consolidar calificación mediante el motor de evaluación oficial
    let finalResult = null;
    if (this.evalEngine) {
      finalResult = this.evalEngine.finalizeExam();
    }

    if (!finalResult) {
      // Fallback de contingencia si no se hubiera iniciado sesión formal
      const defErr = (10 - this.examAciertos) * 2;
      const calcBase = Math.max(1.0, 5.0 - (defErr * 0.2));
      finalResult = {
        studentId: EvaluationEngine.generateStudentId(this.examStudentNombre || 'Estudiante', this.examStudentApellido || '7mo'),
        nombreCompleto: this.examStudentName || 'Estudiante 7mo',
        notaBase: Number(calcBase.toFixed(1)),
        notaFinal: Number(calcBase.toFixed(1)),
        erroresEfectivos: defErr,
        erroresCometidosTotal: defErr,
        escudosUsados: 0,
        decimasCanjeadas: 0,
        aciertos: this.examAciertos,
        totalPreguntas: 10,
        puntosGanados: 100
      };
    }

    // Guardar o actualizar en el Ranking local persistente
    const studentData = RankingManager.saveAttempt(
      this.examStudentName,
      finalResult.notaFinal,
      finalResult.aciertos,
      this.examCurrentAttempt
    );

    // Salir del modo de juego de examen en la pizarra
    this.isExamMode = false;
    this.examActiveBanner.classList.add('hidden');
    this.renderLevelSelector();

    // Actualizar datos del modal de resultados
    this.examFinalGrade.textContent = finalResult.notaFinal.toFixed(1);
    if (this.examStatBaseGrade) this.examStatBaseGrade.textContent = finalResult.notaBase.toFixed(1);
    if (this.examStatCorrect) this.examStatCorrect.textContent = `${finalResult.aciertos} / 10`;
    if (this.examStatErrors) this.examStatErrors.textContent = `${finalResult.erroresEfectivos} (-${(finalResult.erroresEfectivos * 0.2).toFixed(1)})`;
    if (this.examStatShields) this.examStatShields.textContent = `${finalResult.escudosUsados} activo(s)`;
    if (this.examStatAttempt) this.examStatAttempt.textContent = `Intento ${this.examCurrentAttempt} de 3`;
    if (this.examStatBest) this.examStatBest.textContent = `${studentData.bestGrade.toFixed(1)} / 5.0`;

    // Actualizar puntos de la barra general
    const inv = EvaluationEngine.getInventory(finalResult.studentId);
    this.score = inv.puntos;
    if (this.scoreCountEl) this.scoreCountEl.textContent = this.score;

    // Actualizar badge de desempeño pedagógico
    this.updateDesempenoBadge(finalResult.notaFinal);

    // Configurar canje de décimas
    this.setupTenthRedemption(finalResult, studentData);

    // Sincronizar con Firebase Firestore
    if (this.examSaveCloudStatus) {
      this.examSaveCloudStatus.textContent = '☁️ Sincronizando calificación con el panel del docente...';
      this.examSaveCloudStatus.style.color = '#2563EB';
    }
    if (window.FirebaseService) {
      window.FirebaseService.saveEvaluation(finalResult).then(res => {
        if (this.examSaveCloudStatus) {
          if (res && res.success) {
            this.examSaveCloudStatus.textContent = '☁️ Calificación sincronizada con el panel docente';
            this.examSaveCloudStatus.style.color = '#059669';
          } else {
            this.examSaveCloudStatus.textContent = '💾 Calificación guardada localmente (se sincronizará al conectar)';
            this.examSaveCloudStatus.style.color = '#D97706';
          }
        }
      }).catch(() => {
        if (this.examSaveCloudStatus) {
          this.examSaveCloudStatus.textContent = '💾 Calificación guardada localmente';
          this.examSaveCloudStatus.style.color = '#D97706';
        }
      });
    }

    // Configurar oportunidad de reintento si le quedan intentos (< 3)
    const attemptsUsed = studentData.attemptsCount || this.examCurrentAttempt;
    if (attemptsUsed < 3) {
      const remaining = 3 - attemptsUsed;
      this.examRetryCard.classList.remove('hidden');
      this.examRetryHeading.textContent = `🔄 ¿Deseas mejorar tu calificación? (Oportunidad ${attemptsUsed + 1} de 3)`;
      this.examRetryText.innerHTML = `Te quedan <strong>${remaining} oportunidad(es)</strong> disponibles. Si vuelves a presentar el examen, <strong>siempre conservaremos tu nota más alta</strong> en el ranking.`;
      this.btnExamRetry.classList.remove('hidden');
      this.btnExamRetry.textContent = `🔄 Usar Oportunidad (Intento ${attemptsUsed + 1} de 3)`;
    } else {
      this.examRetryCard.classList.remove('hidden');
      this.examRetryHeading.textContent = `🏁 Oportunidades Completadas (3 de 3)`;
      this.examRetryText.innerHTML = `Has realizado tus 3 oportunidades. Tu mejor calificación final es <strong>${studentData.bestGrade.toFixed(1)} / 5.0</strong> y ha quedado registrada en la tabla de posiciones.`;
      this.btnExamRetry.classList.add('hidden');
    }

    this.modalExamResults.classList.remove('hidden');
  }

  exitExamMode() {
    this.isExamMode = false;
    this.examActiveBanner.classList.add('hidden');
    this.renderLevelSelector();
    this.loadExercise(0, 0);
  }

  // ==========================================================================
  // RANKING Y TABLA DE POSICIONES
  // ==========================================================================

  openRankingModal(highlightName = '') {
    this.modalRanking.classList.remove('hidden');
    this.rankingSearchInput.value = highlightName || '';
    this.renderRankingTable(highlightName);
  }

  renderRankingTable(filterQuery = '') {
    const list = RankingManager.getAll();
    this.rankingTableBody.innerHTML = '';

    const query = filterQuery.trim().toLowerCase();
    const filtered = list.filter(item => {
      return item.name.toLowerCase().includes(query);
    });

    if (filtered.length === 0) {
      this.rankingEmptyState.classList.remove('hidden');
      return;
    }

    this.rankingEmptyState.classList.add('hidden');

    filtered.forEach((student, index) => {
      const tr = document.createElement('tr');
      if (this.examStudentName && student.name.toLowerCase() === this.examStudentName.toLowerCase()) {
        tr.classList.add('highlight-student');
      }

      // Medalla o posición
      let posMarkup = `<span class="rank-pos-number">${index + 1}°</span>`;
      if (index === 0) posMarkup = `<span class="medal-badge">🥇</span> 1°`;
      else if (index === 1) posMarkup = `<span class="medal-badge">🥈</span> 2°`;
      else if (index === 2) posMarkup = `<span class="medal-badge">🥉</span> 3°`;

      // Badge de nota
      let badgeClass = 'desempeno-bajo';
      if (student.bestGrade >= 4.6) badgeClass = 'desempeno-superior';
      else if (student.bestGrade >= 4.0) badgeClass = 'desempeno-alto';
      else if (student.bestGrade >= 3.0) badgeClass = 'desempeno-basico';

      tr.innerHTML = `
        <td style="text-align: center;">${posMarkup}</td>
        <td><strong>${student.name}</strong></td>
        <td style="text-align: center;">
          <span class="grade-badge-cell ${badgeClass}">${student.bestGrade.toFixed(1)}</span>
        </td>
        <td style="text-align: center;">${student.bestScore}/10</td>
        <td style="text-align: center;">${student.attemptsCount}/3</td>
        <td style="font-size: 0.82rem; color: #64748B;">${student.lastDate}</td>
      `;
      this.rankingTableBody.appendChild(tr);
    });
  }

  exportRankingCSV() {
    const csvContent = RankingManager.exportCSV();
    if (!csvContent) {
      alert('No hay registros en el ranking para exportar.');
      return;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Ranking_Polinomios_7mo_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // ==========================================================================
  // Renderizado Matemático de Expresiones
  // ==========================================================================

  renderMathDisplay(targetMatch = null) {
    this.mathDisplayEl.innerHTML = '';
    const expr = this.currentExpression;
    
    let i = 0;
    while (i < expr.length) {
      const char = expr[i];

      // Signos de agrupación con colores diferenciados
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
        i++;
      }
    }
  }

  updateHierarchyPills(activeBracketType) {
    this.pillParen.classList.toggle('active', activeBracketType === 'paren');
    this.pillBracket.classList.toggle('active', activeBracketType === 'square');
    this.pillBrace.classList.toggle('active', activeBracketType === 'curly');
  }

  // Evaluar estado actual de la expresión y decidir la siguiente fase didáctica
  processCurrentExpressionState() {
    this.feedbackMessage.classList.add('hidden');
    this.renderMathDisplay();

    const step = this.engine.getNextStep(this.currentExpression);
    this.currentStepData = step;

    if (step.type === 'FINISHED') {
      this.showFinalCelebration(step.finalResult);
      return;
    }

    if (step.innermost) {
      this.updateHierarchyPills(step.innermost.type);
    } else {
      this.updateHierarchyPills(null);
    }

    if (step.type === 'SOLVE_INSIDE' && this.shouldAskWhereToStart()) {
      this.startPhaseIdentify(step);
    } else if (step.type === 'SUPPRESS_SIGN') {
      this.startPhaseSignRule(step);
    } else {
      this.startPhaseSolve(step);
    }
  }

  shouldAskWhereToStart() {
    const hasParen = this.currentExpression.includes('(');
    const hasSquare = this.currentExpression.includes('[');
    const hasCurly = this.currentExpression.includes('{');
    return (hasParen && hasSquare) || (hasSquare && hasCurly) || (hasParen && hasCurly) || this.stepsHistory.length === 0;
  }

  // FASE 1: ¿Por dónde empezar?
  startPhaseIdentify(step) {
    this.guideStepTag.textContent = this.isExamMode 
      ? `EXAMEN (PREGUNTA ${this.examCurrentQuestionIdx + 1}/10) - PASO 1: JERARQUÍA` 
      : 'PASO 1: ¿POR DÓNDE EMPEZAR?';
    this.guideInstructionText.textContent = 'Observa la expresión completa. ¿Qué signo o bloque de agrupación debemos resolver primero?';

    this.phaseIdentify.classList.remove('hidden');
    this.phaseSolve.classList.add('hidden');
    this.phaseSignRule.classList.add('hidden');

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

      if (this.isExamMode) {
        this.examQuestionErrors++;
        let errorReg = { protected: false, effective: true };
        if (this.evalEngine) {
          errorReg = this.evalEngine.registerStepError(this.examCurrentQuestionIdx, 'identify', opt.feedback);
        }
        this.updateLiveExamStats();

        if (this.examQuestionErrors >= 2) {
          // Agotó las oportunidades en esta pregunta del examen
          this.recordExamQuestionResult(false);
          if (this.evalEngine) {
            this.evalEngine.registerQuestionCompletion(this.examCurrentQuestionIdx, false, this.originalExpression, this.examQuestionErrors);
          }
          this.showFeedback(
            false,
            `Pregunta ${this.examCurrentQuestionIdx + 1} no superada`,
            `En este examen debíamos resolver primero: ${step.innermost ? step.innermost.name : 'el paréntesis'}. ¡Pasemos a la siguiente pregunta!`,
            () => {
              this.advanceExamQuestion();
            }
          );
          return;
        } else {
          const shieldNotice = errorReg.protected
            ? ' 🛡️ ¡Tu escudo absorbió este error y protegió tu nota!'
            : ' (-0.2 en tu nota).';
          this.showFeedback(false, '¡Cuidado con la jerarquía!', `${opt.feedback}${shieldNotice} Tienes una última oportunidad para corregir en esta pregunta.`);
          return;
        }
      }

      this.showFeedback(false, '¡Atención a la Jerarquía!', opt.feedback);
    }
  }

  // FASE 2: Resolver la operación matemática interna
  startPhaseSolve(step) {
    this.guideStepTag.textContent = this.isExamMode 
      ? `EXAMEN (PREGUNTA ${this.examCurrentQuestionIdx + 1}/10) - PASO 2: CÁLCULO` 
      : 'PASO 2: RESUELVE LA MATEMÁTICA';
    this.guideInstructionText.textContent = 'Aplica las reglas de números enteros (suma, resta y signos) para calcular el resultado.';

    this.phaseIdentify.classList.add('hidden');
    this.phaseSolve.classList.remove('hidden');
    this.phaseSignRule.classList.add('hidden');

    this.targetSubexprText.textContent = step.subexpr;

    this.inputSign = '';
    this.inputNum = '';
    this.updatePreviewDisplay();
  }

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
    let userSign = this.inputSign;
    if (!userSign) {
      userSign = '+';
    }

    const expectedSign = step.expectedSign;
    const expectedNum = step.expectedNum;

    if (userNum === expectedNum && (userSign === expectedSign || (expectedNum === 0))) {
      // ¡Acierto en este paso!
      this.sound.playSuccess();
      this.addScore(150);
      this.increaseStreak();

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
      // Error de cálculo
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

      if (this.isExamMode) {
        this.examQuestionErrors++;
        let errorReg = { protected: false, effective: true };
        if (this.evalEngine) {
          errorReg = this.evalEngine.registerStepError(this.examCurrentQuestionIdx, 'solve', errorDetail);
        }
        this.updateLiveExamStats();

        if (this.examQuestionErrors >= 2) {
          this.recordExamQuestionResult(false);
          if (this.evalEngine) {
            this.evalEngine.registerQuestionCompletion(this.examCurrentQuestionIdx, false, this.originalExpression, this.examQuestionErrors);
          }
          this.showFeedback(
            false,
            `Pregunta ${this.examCurrentQuestionIdx + 1} no superada`,
            `El resultado correcto era ${expectedSign === '-' ? '-' : ''}${expectedNum}. ¡Pasemos a la siguiente pregunta!`,
            () => {
              this.advanceExamQuestion();
            }
          );
          return;
        } else {
          const shieldNotice = errorReg.protected
            ? ' 🛡️ ¡Tu escudo absorbió este error y protegió tu nota!'
            : ' (-0.2 en tu nota).';
          this.showFeedback(false, 'Revisemos la operación', `${errorDetail}${shieldNotice} Tienes 1 última oportunidad para corregir.`);
          return;
        }
      }

      this.showFeedback(false, 'Revisemos la operación', errorDetail);
    }
  }

  // FASE 3: Ley de signos / Supresión de signo de agrupación
  startPhaseSignRule(step) {
    this.guideStepTag.textContent = this.isExamMode 
      ? `EXAMEN (PREGUNTA ${this.examCurrentQuestionIdx + 1}/10) - PASO 3: LEY DE SIGNOS` 
      : 'PASO 3: LEY DE SIGNOS (SUPRESIÓN)';
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

      if (this.isExamMode) {
        this.examQuestionErrors++;
        let errorReg = { protected: false, effective: true };
        if (this.evalEngine) {
          errorReg = this.evalEngine.registerStepError(this.examCurrentQuestionIdx, 'sign_rule', 'Error en ley de signos');
        }
        this.updateLiveExamStats();

        if (this.examQuestionErrors >= 2) {
          this.recordExamQuestionResult(false);
          if (this.evalEngine) {
            this.evalEngine.registerQuestionCompletion(this.examCurrentQuestionIdx, false, this.originalExpression, this.examQuestionErrors);
          }
          this.showFeedback(
            false,
            `Pregunta ${this.examCurrentQuestionIdx + 1} no superada`,
            `Signos contrarios dan menos (-), signos iguales dan más (+). ¡Pasemos a la siguiente pregunta!`,
            () => {
              this.advanceExamQuestion();
            }
          );
          return;
        } else {
          const shieldNotice = errorReg.protected
            ? ' 🛡️ ¡Tu escudo absorbió este error y protegió tu nota!'
            : ' (-0.2 en tu nota).';
          this.showFeedback(
            false,
            '¡Ojo con la ley de signos!',
            `Recuerda: signos iguales dan más (+), signos contrarios dan menos (-).${shieldNotice} Tienes una última oportunidad para corregir.`
          );
          return;
        }
      }

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

    if (this.isExamMode) {
      this.recordExamQuestionResult(true);
      if (this.evalEngine) {
        this.evalEngine.registerQuestionCompletion(this.examCurrentQuestionIdx, true, this.originalExpression, this.examQuestionErrors);
      }

      this.guideStepTag.textContent = `¡PREGUNTA ${this.examCurrentQuestionIdx + 1} COMPLETADA!`;
      this.guideInstructionText.textContent = `¡Excelente! Respuesta final: ${finalValue}. ¡Acierto sumado para tu nota!`;

      this.mathDisplayEl.innerHTML = `
        <div style="font-size: 2.5rem; color: #059669; display: flex; align-items: center; gap: 0.8rem;">
          <span>🎯 Resultado =</span>
          <span style="background: #D1FAE5; padding: 0.3rem 1rem; border-radius: 16px; border: 3px solid #10B981; box-shadow: 4px 4px 12px rgba(16,185,129,0.3);">${finalValue}</span>
        </div>
      `;

      this.phaseIdentify.classList.add('hidden');
      this.phaseSolve.classList.add('hidden');
      this.phaseSignRule.classList.add('hidden');

      this.showFeedback(
        true,
        `¡Pregunta ${this.examCurrentQuestionIdx + 1} de 10 Acertada! 🌟`,
        `Has simplificado correctamente todo el polinomio. Continuemos con la siguiente pregunta de tu evaluación.`,
        () => {
          this.advanceExamQuestion();
        }
      );
      return;
    }

    // Modo Práctica normal
    this.guideStepTag.textContent = '¡POLINOMIO RESUELTO CON ÉXITO!';
    this.guideInstructionText.textContent = `¡Felicidades! El resultado final simplificado es ${finalValue}.`;

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
      if (this.currentLevelIdx + 1 < CURRICULUM_LEVELS.length) {
        this.loadExercise(this.currentLevelIdx + 1, 0);
      } else {
        if (typeof PolynomialGenerator !== 'undefined' && PolynomialGenerator.refreshCurriculumLevels) {
          PolynomialGenerator.refreshCurriculumLevels();
        }
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

    if (nextCallback) {
      this.btnNextStep.classList.remove('hidden');
      this.btnNextStep.onclick = () => {
        this.feedbackMessage.classList.add('hidden');
        nextCallback();
      };
    } else {
      this.btnNextStep.classList.add('hidden');
    }
  }

  // Sistema de partículas de confetti
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

if (typeof window !== 'undefined') {
  window.PolyClayApp = PolyClayApp;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PolyClayApp;
}

// Inicializar la aplicación cuando cargue la página
window.addEventListener('DOMContentLoaded', () => {
  window.app = new PolyClayApp();
  if (typeof AdminPanel !== 'undefined') {
    window.adminPanel = new AdminPanel();
  }
});
