/**
 * PolyClay 7° - Servicio de Conexión a Firebase (Auth & Firestore)
 * Diseñado para compatibilidad con GitHub Pages y ejecución offline resiliente.
 */

const FIREBASE_CONFIG = {
  projectId: "studio-8591179971-23f76",
  appId: "1:945300080155:web:7e3cc03a88a5e54c431abe",
  storageBucket: "studio-8591179971-23f76.firebasestorage.app",
  apiKey: "AIzaSyA8dHH4CRxLOhvliKH4SiRvqaw2wIM8z8U",
  authDomain: "studio-8591179971-23f76.firebaseapp.com",
  messagingSenderId: "945300080155",
  projectNumber: "945300080155"
};

// UID del docente administrador autorizado
const AUTHORIZED_TEACHER_UID = "IHTD7bDOqETqQgqJ0vpZLoViORB2";
const AUTHORIZED_TEACHER_EMAIL = "moz658@gmail.com";

class FirebaseService {
  constructor() {
    this.app = null;
    this.auth = null;
    this.db = null;
    this.isOnline = navigator.onLine;
    this.currentUser = null;
    this.init();
  }

  init() {
    if (typeof firebase !== 'undefined' && !firebase.apps.length) {
      try {
        this.app = firebase.initializeApp(FIREBASE_CONFIG);
        this.auth = firebase.auth();
        this.db = firebase.firestore();

        // Habilitar persistencia offline en Firestore si está disponible
        try {
          this.db.enablePersistence({ synchronizeTabs: true }).catch(err => {
            if (err.code !== 'failed-precondition' && err.code !== 'unimplemented') {
              console.warn('Firestore offline persistence notice:', err.message);
            }
          });
        } catch (e) {
          // Navegadores que no soportan múltiples tabs
        }

        window.addEventListener('online', () => {
          this.isOnline = true;
          this.flushPendingEvaluations();
        });

        window.addEventListener('offline', () => {
          this.isOnline = false;
        });

      } catch (err) {
        console.error('Error inicializando Firebase:', err);
      }
    } else if (typeof firebase !== 'undefined' && firebase.apps.length) {
      this.app = firebase.app();
      this.auth = firebase.auth();
      this.db = firebase.firestore();
    }
  }

  // Comprobar si el usuario actual es el docente autorizado
  isTeacherAdmin(user = this.currentUser) {
    if (!user) return false;
    if (user.uid === AUTHORIZED_TEACHER_UID) return true;
    if (user.email && user.email.toLowerCase() === AUTHORIZED_TEACHER_EMAIL.toLowerCase()) return true;
    return false;
  }

  // Iniciar sesión con Google (exclusivo para el docente)
  async signInWithGoogle() {
    if (!this.auth) throw new Error('Servicio de autenticación no disponible');
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
    try {
      const result = await this.auth.signInWithPopup(provider);
      this.currentUser = result.user;
      return result.user;
    } catch (err) {
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/cancelled-popup-request') {
        return await this.auth.signInWithRedirect(provider);
      }
      throw err;
    }
  }

  async signOut() {
    if (!this.auth) return;
    await this.auth.signOut();
    this.currentUser = null;
  }

  onAuthStateChanged(callback) {
    if (!this.auth) return;
    return this.auth.onAuthStateChanged(user => {
      this.currentUser = user;
      callback(user, this.isTeacherAdmin(user));
    });
  }

  // ==========================================================================
  // PERSISTENCIA DE EVALUACIONES (IDEMPOTENTE Y RESILIENTE OFFLINE)
  // ==========================================================================

  async saveEvaluation(evaluationData) {
    // Generar o conservar un ID único e idempotente
    const attemptId = evaluationData.attemptId || (
      'eval_' + evaluationData.studentId + '_att' + evaluationData.intentoNumero + '_' + Date.now()
    );
    evaluationData.attemptId = attemptId;

    if (!this.db) {
      this.queueOfflineEvaluation(evaluationData);
      return { success: true, offline: true, attemptId };
    }

    try {
      // Guardar con doc(attemptId).set() para garantizar idempotencia estricta
      const docRef = this.db.collection('polyclay_evaluations').doc(attemptId);
      await docRef.set({
        ...evaluationData,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        syncedAt: new Date().toISOString()
      }, { merge: true });

      return { success: true, offline: false, attemptId };
    } catch (err) {
      console.warn('Fallo guardado en Firestore. Guardando en cola local:', err);
      this.queueOfflineEvaluation(evaluationData);
      return { success: true, offline: true, attemptId, error: err.message };
    }
  }

  // Cola local para guardar si se cae la red durante el examen
  queueOfflineEvaluation(data) {
    try {
      const pending = JSON.parse(localStorage.getItem('polyclay_pending_evaluations') || '[]');
      // Evitar duplicados por attemptId
      const exists = pending.some(item => item.attemptId === data.attemptId);
      if (!exists) {
        pending.push(data);
        localStorage.setItem('polyclay_pending_evaluations', JSON.stringify(pending));
      }
    } catch (e) {
      console.error('Error guardando en cola offline:', e);
    }
  }

  // Sincronizar cola local pendiente al recuperar conexión
  async flushPendingEvaluations() {
    if (!this.db || !this.isOnline) return;
    try {
      const pending = JSON.parse(localStorage.getItem('polyclay_pending_evaluations') || '[]');
      if (!pending.length) return;

      const remaining = [];
      for (const item of pending) {
        try {
          await this.db.collection('polyclay_evaluations').doc(item.attemptId).set({
            ...item,
            syncedAt: new Date().toISOString()
          }, { merge: true });
        } catch (e) {
          remaining.push(item);
        }
      }
      localStorage.setItem('polyclay_pending_evaluations', JSON.stringify(remaining));
      if (!remaining.length) {
        console.log('✅ Todas las evaluaciones pendientes se sincronizaron con Firestore.');
      }
    } catch (e) {
      console.error('Error sincronizando cola pendiente:', e);
    }
  }

  // ==========================================================================
  // PERFIL DE ESTUDIANTE, PUNTOS E INVENTARIO
  // ==========================================================================

  async getStudentProfile(studentId) {
    if (!this.db) return null;
    try {
      const doc = await this.db.collection('polyclay_students').doc(studentId).get();
      return doc.exists ? doc.data() : null;
    } catch (err) {
      console.warn('Error obteniendo perfil desde Firestore:', err);
      return null;
    }
  }

  async saveStudentProfile(studentId, profileData) {
    if (!this.db) return;
    try {
      await this.db.collection('polyclay_students').doc(studentId).set({
        ...profileData,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.warn('Error guardando perfil de estudiante en Firestore:', err);
    }
  }

  async saveTransaction(transactionData) {
    if (!this.db) return;
    try {
      const txId = 'tx_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
      await this.db.collection('polyclay_transactions').doc(txId).set({
        ...transactionData,
        txId,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (err) {
      console.warn('Error guardando transacción en Firestore:', err);
    }
  }

  // ==========================================================================
  // CONSULTAS PARA EL PANEL ADMINISTRATIVO DEL DOCENTE
  // ==========================================================================

  async getAllEvaluations() {
    if (!this.db) throw new Error('Firestore no disponible');
    const snapshot = await this.db.collection('polyclay_evaluations')
      .orderBy('fecha', 'desc')
      .get();

    const evals = [];
    snapshot.forEach(doc => {
      evals.push({ id: doc.id, ...doc.data() });
    });
    return evals;
  }

  async getAllStudents() {
    if (!this.db) throw new Error('Firestore no disponible');
    const snapshot = await this.db.collection('polyclay_students').get();
    const students = [];
    snapshot.forEach(doc => {
      students.push({ id: doc.id, ...doc.data() });
    });
    return students;
  }
}

window.FirebaseService = new FirebaseService();
window.AUTHORIZED_TEACHER_UID = AUTHORIZED_TEACHER_UID;
window.AUTHORIZED_TEACHER_EMAIL = AUTHORIZED_TEACHER_EMAIL;
