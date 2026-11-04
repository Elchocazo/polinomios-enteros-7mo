/**
 * PolyClay 7° - Panel Administrativo y Privado del Docente
 * Maneja autenticación Google, control de acceso, métricas estadísticas,
 * visualización de evaluaciones, detalle individual y exportación CSV.
 */

class AdminPanel {
  constructor() {
    this.isAuthenticated = false;
    this.teacherUser = null;
    this.allEvaluations = [];
    this.filteredEvaluations = [];
    this.selectedStudent = null;

    this.cacheDom();
    this.bindEvents();
    this.listenAuth();
  }

  cacheDom() {
    // Botón de acceso al panel docente (pie de página)
    this.btnOpenAdmin = document.getElementById('btn-open-admin-panel');

    // Modales y contenedores
    this.modalAdmin = document.getElementById('modal-admin-panel');
    this.btnCloseAdmin = document.getElementById('btn-close-admin-panel');
    this.btnCloseAdmin2 = document.getElementById('btn-close-admin-panel-2');

    // Secciones de autenticación
    this.adminAuthSection = document.getElementById('admin-auth-section');
    this.adminDashboardSection = document.getElementById('admin-dashboard-section');
    this.btnLoginGoogle = document.getElementById('btn-admin-login-google');
    this.btnLogoutGoogle = document.getElementById('btn-admin-logout');
    this.adminAuthError = document.getElementById('admin-auth-error');
    this.teacherNameDisplay = document.getElementById('admin-teacher-name');

    // Métricas del Dashboard
    this.statTotalStudents = document.getElementById('admin-stat-total-students');
    this.statTotalExams = document.getElementById('admin-stat-total-exams');
    this.statAverageGrade = document.getElementById('admin-stat-average-grade');
    this.statHighestGrade = document.getElementById('admin-stat-highest-grade');
    this.statLowestGrade = document.getElementById('admin-stat-lowest-grade');

    // Barras de distribución
    this.barSuperior = document.getElementById('dist-bar-superior');
    this.barAlto = document.getElementById('dist-bar-alto');
    this.barBasico = document.getElementById('dist-bar-basico');
    this.barBajo = document.getElementById('dist-bar-bajo');
    this.countSuperior = document.getElementById('dist-count-superior');
    this.countAlto = document.getElementById('dist-count-alto');
    this.countBasico = document.getElementById('dist-count-basico');
    this.countBajo = document.getElementById('dist-count-bajo');

    // Filtros y tabla
    this.searchStudentInput = document.getElementById('admin-search-student');
    this.filterDesempeno = document.getElementById('admin-filter-desempeno');
    this.btnExportCsv = document.getElementById('btn-admin-export-csv');
    this.btnRefreshData = document.getElementById('btn-admin-refresh');
    this.tableBody = document.getElementById('admin-evaluations-tbody');
    this.emptyState = document.getElementById('admin-table-empty');

    // Modal de Detalle Individual del Estudiante
    this.modalStudentDetail = document.getElementById('modal-student-detail');
    this.btnCloseStudentDetail = document.getElementById('btn-close-student-detail');
    this.detailStudentName = document.getElementById('detail-student-name');
    this.detailStudentMeta = document.getElementById('detail-student-meta');
    this.detailAttemptsList = document.getElementById('detail-attempts-list');
  }

  bindEvents() {
    if (this.btnOpenAdmin) {
      this.btnOpenAdmin.addEventListener('click', () => {
        this.openModal();
      });
    }

    if (this.btnCloseAdmin) {
      this.btnCloseAdmin.addEventListener('click', () => this.closeModal());
    }
    if (this.btnCloseAdmin2) {
      this.btnCloseAdmin2.addEventListener('click', () => this.closeModal());
    }

    if (this.btnLoginGoogle) {
      this.btnLoginGoogle.addEventListener('click', () => this.handleGoogleLogin());
    }

    if (this.btnLogoutGoogle) {
      this.btnLogoutGoogle.addEventListener('click', () => this.handleLogout());
    }

    if (this.searchStudentInput) {
      this.searchStudentInput.addEventListener('input', () => this.applyFilters());
    }

    if (this.filterDesempeno) {
      this.filterDesempeno.addEventListener('change', () => this.applyFilters());
    }

    if (this.btnExportCsv) {
      this.btnExportCsv.addEventListener('click', () => this.exportCsv());
    }

    if (this.btnRefreshData) {
      this.btnRefreshData.addEventListener('click', () => this.loadData());
    }

    if (this.btnCloseStudentDetail) {
      this.btnCloseStudentDetail.addEventListener('click', () => {
        this.modalStudentDetail.classList.add('hidden');
      });
    }
  }

  listenAuth() {
    if (!window.FirebaseService) return;
    window.FirebaseService.onAuthStateChanged((user, isTeacherAdmin) => {
      this.teacherUser = user;
      this.isAuthenticated = isTeacherAdmin;

      if (user && isTeacherAdmin) {
        this.adminAuthSection.classList.add('hidden');
        this.adminDashboardSection.classList.remove('hidden');
        this.teacherNameDisplay.textContent = user.displayName || user.email;
        this.loadData();
      } else if (user && !isTeacherAdmin) {
        this.adminAuthSection.classList.remove('hidden');
        this.adminDashboardSection.classList.add('hidden');
        this.adminAuthError.textContent = `La cuenta ${user.email} no tiene permisos de docente administrador.`;
        this.adminAuthError.classList.remove('hidden');
      } else {
        this.adminAuthSection.classList.remove('hidden');
        this.adminDashboardSection.classList.add('hidden');
        this.adminAuthError.classList.add('hidden');
      }
    });
  }

  openModal() {
    this.modalAdmin.classList.remove('hidden');
    if (this.isAuthenticated) {
      this.loadData();
    }
  }

  closeModal() {
    this.modalAdmin.classList.add('hidden');
  }

  async handleGoogleLogin() {
    try {
      this.adminAuthError.classList.add('hidden');
      this.btnLoginGoogle.disabled = true;
      this.btnLoginGoogle.textContent = 'Iniciando sesión con Google...';

      const user = await window.FirebaseService.signInWithGoogle();
      if (!window.FirebaseService.isTeacherAdmin(user)) {
        this.adminAuthError.textContent = `Acceso denegado: ${user.email} no está registrado como docente administrador.`;
        this.adminAuthError.classList.remove('hidden');
      }
    } catch (err) {
      console.error('Error login docente:', err);
      this.adminAuthError.textContent = `Error de autenticación: ${err.message}`;
      this.adminAuthError.classList.remove('hidden');
    } finally {
      this.btnLoginGoogle.disabled = false;
      this.btnLoginGoogle.innerHTML = '<span>G</span> Iniciar Sesión con Google';
    }
  }

  async handleLogout() {
    await window.FirebaseService.signOut();
    this.isAuthenticated = false;
    this.adminAuthSection.classList.remove('hidden');
    this.adminDashboardSection.classList.add('hidden');
  }

  // ==========================================================================
  // CARGA DE DATOS Y CONSOLIDACIÓN DE EVALUACIONES
  // ==========================================================================

  async loadData() {
    if (!this.isAuthenticated) return;

    try {
      if (this.btnRefreshData) {
        this.btnRefreshData.textContent = '🔄 Cargando...';
      }

      // 1. Obtener todas las evaluaciones desde Firestore
      let remoteEvals = [];
      try {
        remoteEvals = await window.FirebaseService.getAllEvaluations();
      } catch (e) {
        console.warn('No se pudieron obtener evaluaciones remotas, usando respaldo local:', e);
      }

      // 2. Obtener también evaluaciones locales pendientes o históricas
      const localEvals = JSON.parse(localStorage.getItem('polyclay_pending_evaluations') || '[]');
      const rankingLocal = JSON.parse(localStorage.getItem('polyclay_7mo_ranking') || '[]');

      // Combinar evitando duplicados por attemptId
      const map = new Map();
      remoteEvals.forEach(ev => map.set(ev.attemptId, ev));
      localEvals.forEach(ev => {
        if (!map.has(ev.attemptId)) map.set(ev.attemptId, ev);
      });

      // Si no hay datos en colecciones nuevas pero hay ranking histórico, sintetizar registros
      if (map.size === 0 && rankingLocal.length > 0) {
        rankingLocal.forEach(r => {
          const attemptId = `hist_${r.name.replace(/\s+/g, '_')}`;
          map.set(attemptId, {
            attemptId,
            nombreCompleto: r.name,
            fecha: r.lastDate,
            intentoNumero: r.attemptsCount || 1,
            aciertos: r.bestScore || 8,
            erroresEfectivos: Math.max(0, Math.round((5.0 - (r.bestGrade || 5.0)) / 0.2)),
            notaBase: r.bestGrade || 5.0,
            bonificacionDecimas: 0.0,
            notaFinal: r.bestGrade || 5.0,
            desempeno: r.bestGrade >= 4.6 ? 'Superior' : (r.bestGrade >= 4.0 ? 'Alto' : (r.bestGrade >= 3.0 ? 'Básico' : 'Bajo')),
            escudosUsados: 0,
            decimasCanjeadas: 0,
            puntosGanados: 200,
            duracionTexto: 'Completado'
          });
        });
      }

      this.allEvaluations = Array.from(map.values());
      this.computeMetrics();
      this.applyFilters();
    } catch (err) {
      console.error('Error cargando datos del panel docente:', err);
    } finally {
      if (this.btnRefreshData) {
        this.btnRefreshData.textContent = '🔄 Actualizar';
      }
    }
  }

  computeMetrics() {
    const totalExams = this.allEvaluations.length;
    const studentsSet = new Set(this.allEvaluations.map(e => (e.studentId || e.nombreCompleto).toLowerCase()));
    const totalStudents = studentsSet.size;

    if (totalExams === 0) {
      this.statTotalStudents.textContent = '0';
      this.statTotalExams.textContent = '0';
      this.statAverageGrade.textContent = '0.0';
      this.statHighestGrade.textContent = '0.0';
      this.statLowestGrade.textContent = '0.0';
      this.renderDistributionBars(0, 0, 0, 0, 0);
      return;
    }

    let sumGrades = 0;
    let maxGrade = -1;
    let minGrade = 999;
    let countSup = 0;
    let countAlt = 0;
    let countBas = 0;
    let countBaj = 0;

    this.allEvaluations.forEach(ev => {
      const g = Number(ev.notaFinal) || 1.0;
      sumGrades += g;
      if (g > maxGrade) maxGrade = g;
      if (g < minGrade) minGrade = g;

      if (g >= 4.6) countSup++;
      else if (g >= 4.0) countAlt++;
      else if (g >= 3.0) countBas++;
      else countBaj++;
    });

    const avgGrade = (sumGrades / totalExams).toFixed(1);

    this.statTotalStudents.textContent = totalStudents;
    this.statTotalExams.textContent = totalExams;
    this.statAverageGrade.textContent = avgGrade;
    this.statHighestGrade.textContent = maxGrade >= 0 ? maxGrade.toFixed(1) : '5.0';
    this.statLowestGrade.textContent = minGrade <= 5.0 ? minGrade.toFixed(1) : '1.0';

    this.renderDistributionBars(countSup, countAlt, countBas, countBaj, totalExams);
  }

  renderDistributionBars(sup, alt, bas, baj, total) {
    if (total === 0) {
      this.barSuperior.style.width = '0%';
      this.barAlto.style.width = '0%';
      this.barBasico.style.width = '0%';
      this.barBajo.style.width = '0%';
      return;
    }

    this.barSuperior.style.width = `${(sup / total) * 100}%`;
    this.barAlto.style.width = `${(alt / total) * 100}%`;
    this.barBasico.style.width = `${(bas / total) * 100}%`;
    this.barBajo.style.width = `${(baj / total) * 100}%`;

    this.countSuperior.textContent = `${sup} (${Math.round((sup / total) * 100)}%)`;
    this.countAlto.textContent = `${alt} (${Math.round((alt / total) * 100)}%)`;
    this.countBasico.textContent = `${bas} (${Math.round((bas / total) * 100)}%)`;
    this.countBajo.textContent = `${baj} (${Math.round((baj / total) * 100)}%)`;
  }

  applyFilters() {
    const query = (this.searchStudentInput ? this.searchStudentInput.value : '').trim().toLowerCase();
    const filterCat = this.filterDesempeno ? this.filterDesempeno.value : 'TODOS';

    this.filteredEvaluations = this.allEvaluations.filter(ev => {
      const matchName = (ev.nombreCompleto || '').toLowerCase().includes(query);
      if (!matchName) return false;

      if (filterCat === 'TODOS') return true;
      const g = Number(ev.notaFinal) || 1.0;
      if (filterCat === 'SUPERIOR') return g >= 4.6;
      if (filterCat === 'ALTO') return g >= 4.0 && g < 4.6;
      if (filterCat === 'BASICO') return g >= 3.0 && g < 4.0;
      if (filterCat === 'BAJO') return g < 3.0;
      return true;
    });

    this.renderTable();
  }

  renderTable() {
    this.tableBody.innerHTML = '';
    if (this.filteredEvaluations.length === 0) {
      this.emptyState.classList.remove('hidden');
      return;
    }

    this.emptyState.classList.add('hidden');

    this.filteredEvaluations.forEach(ev => {
      const tr = document.createElement('tr');
      const notaF = Number(ev.notaFinal || 1.0).toFixed(1);
      const notaB = Number(ev.notaBase || 1.0).toFixed(1);
      const bonif = Number(ev.bonificacionDecimas || 0.0).toFixed(1);

      let badgeClass = 'desempeno-bajo';
      if (notaF >= 4.6) badgeClass = 'desempeno-superior';
      else if (notaF >= 4.0) badgeClass = 'desempeno-alto';
      else if (notaF >= 3.0) badgeClass = 'desempeno-basico';

      tr.innerHTML = `
        <td>
          <a href="javascript:void(0)" class="student-name-link" style="color: #7C3AED; font-weight: 700; text-decoration: underline;">
            ${ev.nombreCompleto || 'Sin nombre'}
          </a>
        </td>
        <td style="font-size: 0.85rem; color: #64748B;">${ev.fecha || 'N/A'}</td>
        <td style="text-align: center;"><span class="clay-chip-sm">Intento ${ev.intentoNumero || 1}</span></td>
        <td style="text-align: center; color: #059669; font-weight: 700;">${ev.aciertos || 0}/10</td>
        <td style="text-align: center; color: #E11D48; font-weight: 700;">
          ${ev.erroresEfectivos || 0}
          ${ev.escudosUsados ? `<span title="${ev.escudosUsados} error(es) protegidos por escudo" style="font-size: 0.78rem; color: #2563EB;">(🛡️ ${ev.escudosUsados})</span>` : ''}
        </td>
        <td style="text-align: center; font-weight: 700;">${notaB}</td>
        <td style="text-align: center; color: #D97706; font-weight: 700;">+${bonif}</td>
        <td style="text-align: center;">
          <span class="grade-badge-cell ${badgeClass}">${notaF}</span>
        </td>
        <td style="text-align: center;">
          <button class="clay-btn-table-action" title="Ver detalle completo">🔍 Ver</button>
        </td>
      `;

      // Eventos para ver detalle individual
      const viewBtn = tr.querySelector('.clay-btn-table-action');
      const nameLink = tr.querySelector('.student-name-link');
      const showDetail = () => this.showStudentDetail(ev.nombreCompleto, ev.studentId);
      viewBtn.addEventListener('click', showDetail);
      nameLink.addEventListener('click', showDetail);

      this.tableBody.appendChild(tr);
    });
  }

  // ==========================================================================
  // DETALLE INDIVIDUAL DEL ESTUDIANTE
  // ==========================================================================

  showStudentDetail(nombreCompleto, studentId) {
    const studentAttempts = this.allEvaluations.filter(ev => {
      if (studentId && ev.studentId) return ev.studentId === studentId;
      return (ev.nombreCompleto || '').toLowerCase() === nombreCompleto.toLowerCase();
    });

    studentAttempts.sort((a, b) => (a.intentoNumero || 1) - (b.intentoNumero || 1));

    this.detailStudentName.textContent = nombreCompleto;
    this.detailStudentMeta.textContent = `${studentAttempts.length} intento(s) registrado(s) en total`;
    this.detailAttemptsList.innerHTML = '';

    studentAttempts.forEach(att => {
      const card = document.createElement('div');
      card.className = 'clay-card student-attempt-detail-card';
      card.style.padding = '1rem 1.25rem';
      card.style.marginBottom = '0.75rem';

      const nota = Number(att.notaFinal || 1.0).toFixed(1);
      const base = Number(att.notaBase || 1.0).toFixed(1);

      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #F1F5F9; padding-bottom: 0.5rem; margin-bottom: 0.6rem;">
          <h4 style="font-family: 'Fredoka', cursive; color: #7C3AED; font-size: 1.15rem;">
            📌 Intento ${att.intentoNumero || 1} de 3
          </h4>
          <span style="font-size: 0.82rem; color: #64748B;">${att.fecha || ''}</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 0.6rem; text-align: center; margin-bottom: 0.75rem;">
          <div style="background: #F8FAFC; padding: 0.5rem; border-radius: 12px; border: 1px solid #E2E8F0;">
            <div style="font-size: 0.75rem; color: #64748B; font-weight: 700;">NOTA FINAL</div>
            <div style="font-family: 'Fredoka', cursive; font-size: 1.4rem; color: #7C3AED; font-weight: 700;">${nota} / 5.0</div>
          </div>
          <div style="background: #F8FAFC; padding: 0.5rem; border-radius: 12px; border: 1px solid #E2E8F0;">
            <div style="font-size: 0.75rem; color: #64748B; font-weight: 700;">NOTA BASE</div>
            <div style="font-family: 'Fredoka', cursive; font-size: 1.2rem; color: #1E293B;">${base}</div>
          </div>
          <div style="background: #F8FAFC; padding: 0.5rem; border-radius: 12px; border: 1px solid #E2E8F0;">
            <div style="font-size: 0.75rem; color: #64748B; font-weight: 700;">ACIERTOS / ERRORES</div>
            <div style="font-size: 1rem; font-weight: 700; color: #0F172A;">${att.aciertos || 0} ✓ / ${att.erroresEfectivos || 0} ✗</div>
          </div>
          <div style="background: #F8FAFC; padding: 0.5rem; border-radius: 12px; border: 1px solid #E2E8F0;">
            <div style="font-size: 0.75rem; color: #64748B; font-weight: 700;">ESCUDOS / DÉCIMAS</div>
            <div style="font-size: 0.95rem; font-weight: 700; color: #2563EB;">🛡️ ${att.escudosUsados || 0} | ⭐ +${att.bonificacionDecimas || 0}</div>
          </div>
        </div>
      `;

      this.detailAttemptsList.appendChild(card);
    });

    this.modalStudentDetail.classList.remove('hidden');
  }

  // ==========================================================================
  // EXPORTACIÓN A EXCEL / CSV
  // ==========================================================================

  exportCsv() {
    if (this.filteredEvaluations.length === 0) {
      alert('No hay evaluaciones filtradas para exportar.');
      return;
    }

    let csv = '\uFEFF'; // BOM para tildes y caracteres en Excel en español
    csv += 'Estudiante;Fecha;Intento;Aciertos;Errores Efectivos;Escudos Usados;Nota Base;Bonificacion Decimas;Nota Final;Desempeno;Puntos Ganados;Duracion\n';

    this.filteredEvaluations.forEach(ev => {
      const notaF = Number(ev.notaFinal || 1.0).toFixed(1).replace('.', ',');
      const notaB = Number(ev.notaBase || 1.0).toFixed(1).replace('.', ',');
      const bonif = Number(ev.bonificacionDecimas || 0.0).toFixed(1).replace('.', ',');

      csv += `"${(ev.nombreCompleto || '').replace(/"/g, '""')}";`;
      csv += `"${ev.fecha || ''}";`;
      csv += `${ev.intentoNumero || 1};`;
      csv += `${ev.aciertos || 0};`;
      csv += `${ev.erroresEfectivos || 0};`;
      csv += `${ev.escudosUsados || 0};`;
      csv += `${notaB};`;
      csv += `${bonif};`;
      csv += `${notaF};`;
      csv += `"${ev.desempeno || 'N/A'}";`;
      csv += `${ev.puntosGanados || 0};`;
      csv += `"${ev.duracionTexto || ''}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Calificaciones_PolyClay_7mo_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

window.AdminPanel = AdminPanel;
