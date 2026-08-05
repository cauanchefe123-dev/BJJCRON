import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AcademyConfig,
  AttendanceRecord,
  BeltChangeRequest,
  BeltType,
  BJJClass,
  Graduation,
  PaymentRecord,
  PaymentStatus,
  Student,
  Teacher,
  TeacherObservation,
  TrainingLog,
} from '../types';
import { DEFAULT_BLACK_GI_AVATAR } from '../constants/avatar';
import { checkClassCheckinAvailability } from '../utils/checkin';
import {
  INITIAL_ACADEMY_CONFIG,
  INITIAL_ATTENDANCE,
  INITIAL_BELT_REQUESTS,
  INITIAL_CLASSES,
  INITIAL_GRADUATIONS,
  INITIAL_PAYMENTS,
  INITIAL_STUDENTS,
  INITIAL_TEACHERS,
  INITIAL_TEACHER_OBSERVATIONS,
  INITIAL_TRAINING_LOGS,
} from '../data/mockData';
import {
  saveToFirestore,
  removeFromFirestore,
  saveConfigToFirestore,
  subscribeFirestoreCollection,
  subscribeFirestoreConfig,
  seedInitialFirestoreData,
} from '../lib/firebaseStore';

interface DataContextType {
  students: Student[];
  teachers: Teacher[];
  classes: BJJClass[];
  attendances: AttendanceRecord[];
  payments: PaymentRecord[];
  graduations: Graduation[];
  beltRequests: BeltChangeRequest[];
  trainingLogs: TrainingLog[];
  teacherObservations: TeacherObservation[];
  academyConfig: AcademyConfig;

  // Student Actions
  addStudent: (student: Omit<Student, 'id' | 'registrationNumber' | 'qrCodeToken' | 'totalClassesAttended' | 'classesSinceLastGraduation'>) => Student;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  promoteStudent: (studentId: string, newBelt: BeltType, newStripes: number, promotedBy: string, notes?: string) => void;
  requestBeltChange: (studentId: string, requestedBelt: BeltType, requestedStripes: number, notes?: string) => { success: boolean; message: string };
  approveBeltChange: (requestId: string, reviewerName: string) => void;
  rejectBeltChange: (requestId: string, reviewerName: string) => void;

  // Teacher Actions
  addTeacher: (teacher: Omit<Teacher, 'id'>) => Teacher;
  updateTeacher: (id: string, updates: Partial<Teacher>) => void;
  deleteTeacher: (id: string) => void;

  // Class Actions
  addClass: (bjjClass: Omit<BJJClass, 'id'>) => void;
  updateClass: (id: string, updates: Partial<BJJClass>) => void;
  deleteClass: (id: string) => void;

  // Attendance Actions
  recordAttendance: (studentId: string, classId: string, method?: 'MANUAL' | 'QR_CODE_STUDENT' | 'QR_CODE_TEACHER', verifiedBy?: string, bypassTimeCheck?: boolean) => { success: boolean; message: string };
  removeAttendance: (id: string) => void;

  // Payment Actions
  addPayment: (payment: Omit<PaymentRecord, 'id'>) => void;
  markPaymentAsPaid: (paymentId: string, method: 'PIX' | 'CARTAO' | 'DINHEIRO' | 'BOLETO') => void;
  
  // Training Log Actions
  addTrainingLog: (log: Omit<TrainingLog, 'id'>) => void;

  // Teacher Observation Actions
  addTeacherObservation: (obs: Omit<TeacherObservation, 'id' | 'date'>) => void;
  deleteTeacherObservation: (id: string) => void;

  // Config Actions
  updateAcademyConfig: (updates: Partial<AcademyConfig>) => void;

  // System Helpers
  resetToDefaultData: () => void;
  clearAllDataToEmpty: () => void;
  exportDatabaseJSON: () => string;
  importDatabaseJSON: (jsonStr: string) => { success: boolean; message: string };
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('bjjcron_students');
    const rawList: Student[] = saved ? JSON.parse(saved) : INITIAL_STUDENTS;
    return rawList.map(s => ({
      ...s,
      photoUrl: (!s.photoUrl || s.photoUrl.includes('unsplash.com')) ? DEFAULT_BLACK_GI_AVATAR : s.photoUrl
    }));
  });

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem('bjjcron_teachers');
    const rawList: Teacher[] = saved ? JSON.parse(saved) : INITIAL_TEACHERS;
    return rawList.map(t => ({
      ...t,
      photoUrl: (!t.photoUrl || t.photoUrl.includes('unsplash.com')) ? DEFAULT_BLACK_GI_AVATAR : t.photoUrl
    }));
  });

  const [classes, setClasses] = useState<BJJClass[]>(() => {
    const saved = localStorage.getItem('bjjcron_classes');
    return saved ? JSON.parse(saved) : INITIAL_CLASSES;
  });

  const [attendances, setAttendances] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('bjjcron_attendances');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    const saved = localStorage.getItem('bjjcron_payments');
    return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
  });

  const [graduations, setGraduations] = useState<Graduation[]>(() => {
    const saved = localStorage.getItem('bjjcron_graduations');
    return saved ? JSON.parse(saved) : INITIAL_GRADUATIONS;
  });

  const [beltRequests, setBeltRequests] = useState<BeltChangeRequest[]>(() => {
    const saved = localStorage.getItem('bjjcron_belt_requests');
    return saved ? JSON.parse(saved) : INITIAL_BELT_REQUESTS;
  });

  const [trainingLogs, setTrainingLogs] = useState<TrainingLog[]>(() => {
    const saved = localStorage.getItem('bjjcron_training_logs');
    return saved ? JSON.parse(saved) : INITIAL_TRAINING_LOGS;
  });

  const [teacherObservations, setTeacherObservations] = useState<TeacherObservation[]>(() => {
    const saved = localStorage.getItem('bjjcron_teacher_observations');
    return saved ? JSON.parse(saved) : INITIAL_TEACHER_OBSERVATIONS;
  });

  const [academyConfig, setAcademyConfig] = useState<AcademyConfig>(() => {
    const saved = localStorage.getItem('bjjcron_academy_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_ACADEMY_CONFIG,
          ...parsed,
          graduationCriteria: parsed.graduationCriteria || INITIAL_ACADEMY_CONFIG.graduationCriteria,
        };
      } catch {
        return INITIAL_ACADEMY_CONFIG;
      }
    }
    return INITIAL_ACADEMY_CONFIG;
  });

  // Safe Local Storage Persistence
  const safeSave = (key: string, val: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.warn(`[Offline-First] Aviso ao salvar chave ${key} no localStorage (possível limite de cota atingido):`, e);
    }
  };

  useEffect(() => { safeSave('bjjcron_students', students); }, [students]);
  useEffect(() => { safeSave('bjjcron_teachers', teachers); }, [teachers]);
  useEffect(() => { safeSave('bjjcron_classes', classes); }, [classes]);
  useEffect(() => { safeSave('bjjcron_attendances', attendances); }, [attendances]);
  useEffect(() => { safeSave('bjjcron_payments', payments); }, [payments]);
  useEffect(() => { safeSave('bjjcron_graduations', graduations); }, [graduations]);
  useEffect(() => { safeSave('bjjcron_belt_requests', beltRequests); }, [beltRequests]);
  useEffect(() => { safeSave('bjjcron_training_logs', trainingLogs); }, [trainingLogs]);
  useEffect(() => { safeSave('bjjcron_teacher_observations', teacherObservations); }, [teacherObservations]);
  useEffect(() => { safeSave('bjjcron_academy_config', academyConfig); }, [academyConfig]);

  // Real-time Firestore Cloud Synchronization
  useEffect(() => {
    const unsubStudents = subscribeFirestoreCollection<Student>('students', (data) => {
      setStudents(data);
      localStorage.setItem('bjjcron_students', JSON.stringify(data));
      window.dispatchEvent(new Event('bjjcron_students_updated'));
    });

    const unsubTeachers = subscribeFirestoreCollection<Teacher>('teachers', (data) => {
      setTeachers(data);
    });

    const unsubClasses = subscribeFirestoreCollection<BJJClass>('classes', (data) => {
      setClasses(data);
    });

    const unsubAttendances = subscribeFirestoreCollection<AttendanceRecord>('attendances', (data) => {
      setAttendances(data);
    });

    const unsubPayments = subscribeFirestoreCollection<PaymentRecord>('payments', (data) => {
      setPayments(data);
    });

    const unsubGraduations = subscribeFirestoreCollection<Graduation>('graduations', (data) => {
      setGraduations(data);
    });

    const unsubBeltRequests = subscribeFirestoreCollection<BeltChangeRequest>('beltRequests', (data) => {
      setBeltRequests(data);
    });

    const unsubTrainingLogs = subscribeFirestoreCollection<TrainingLog>('trainingLogs', (data) => {
      setTrainingLogs(data);
    });

    const unsubTeacherObs = subscribeFirestoreCollection<TeacherObservation>('teacherObservations', (data) => {
      setTeacherObservations(data);
    });

    const unsubConfig = subscribeFirestoreConfig((data) => {
      if (data) {
        setAcademyConfig(prev => ({
          ...INITIAL_ACADEMY_CONFIG,
          ...prev,
          ...data,
          graduationCriteria: data.graduationCriteria || prev.graduationCriteria || INITIAL_ACADEMY_CONFIG.graduationCriteria,
        }));
      }
    });

    return () => {
      unsubStudents();
      unsubTeachers();
      unsubClasses();
      unsubAttendances();
      unsubPayments();
      unsubGraduations();
      unsubBeltRequests();
      unsubTrainingLogs();
      unsubTeacherObs();
      unsubConfig();
    };
  }, []);

  // Sync state when students or users are updated in localStorage by AuthContext or another tab
  useEffect(() => {
    const syncStudentsFromStorage = () => {
      const saved = localStorage.getItem('bjjcron_students');
      if (saved) {
        try {
          const rawList: Student[] = JSON.parse(saved);
          setStudents(rawList.map(s => ({
            ...s,
            photoUrl: (!s.photoUrl || s.photoUrl.includes('unsplash.com')) ? DEFAULT_BLACK_GI_AVATAR : s.photoUrl
          })));
        } catch (e) {}
      }
    };
    window.addEventListener('storage', syncStudentsFromStorage);
    window.addEventListener('bjjcron_students_updated', syncStudentsFromStorage);
    return () => {
      window.removeEventListener('storage', syncStudentsFromStorage);
      window.removeEventListener('bjjcron_students_updated', syncStudentsFromStorage);
    };
  }, []);

  // Student CRUD
  const addStudent = (studentData: Omit<Student, 'id' | 'registrationNumber' | 'qrCodeToken' | 'totalClassesAttended' | 'classesSinceLastGraduation'>): Student => {
    const newId = `std-${Date.now()}`;
    const regNum = `BJJ-2026-${String(students.length + 1).padStart(3, '0')}`;
    const qrToken = `BJJCRON-${newId}-${studentData.name.toUpperCase().replace(/\s+/g, '-')}`;

    const newStudent: Student = {
      ...studentData,
      id: newId,
      registrationNumber: regNum,
      qrCodeToken: qrToken,
      totalClassesAttended: 0,
      classesSinceLastGraduation: 0,
      approvalStatus: studentData.approvalStatus || 'PENDING',
      hasActivatedAccount: false,
    };

    setStudents(prev => {
      const updated = [newStudent, ...prev];
      localStorage.setItem('bjjcron_students', JSON.stringify(updated));
      return updated;
    });
    saveToFirestore('students', newStudent);

    // Automatically create User in bjjcron_users so student can log in / activate immediately with their email
    if (studentData.email) {
      const cleanEmail = studentData.email.trim().toLowerCase();
      try {
        const savedUsers = localStorage.getItem('bjjcron_users');
        const usersList = savedUsers ? JSON.parse(savedUsers) : [];
        if (!usersList.some((u: any) => (u.email && u.email.trim().toLowerCase() === cleanEmail) || u.studentId === newId)) {
          const newUserObj = {
            id: `user-${newId}`,
            name: studentData.name,
            email: cleanEmail,
            role: 'ALUNO',
            studentId: newId,
            phone: studentData.phone || '',
            password: '123',
            approvalStatus: studentData.approvalStatus || 'PENDING',
            isActivated: false,
            avatarUrl: (studentData.photoUrl && !studentData.photoUrl.includes('unsplash.com')) ? studentData.photoUrl : DEFAULT_BLACK_GI_AVATAR
          };
          usersList.push(newUserObj);
          localStorage.setItem('bjjcron_users', JSON.stringify(usersList));
          window.dispatchEvent(new Event('bjjcron_users_updated'));
        }
      } catch (e) {
        console.error('Error syncing student to bjjcron_users:', e);
      }
    }

    // Automatically create first payment record
    const today = new Date();
    const dueDate = new Date(today.getFullYear(), today.getMonth(), studentData.paymentDueDateDay || 10);
    const refMonth = `${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      studentId: newId,
      studentName: studentData.name,
      amount: studentData.planPrice || 240,
      dueDate: dueDate.toISOString().split('T')[0],
      status: 'PENDENTE',
      referenceMonth: refMonth,
    };

    setPayments(prev => [newPayment, ...prev]);
    saveToFirestore('payments', newPayment);

    fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newStudent),
    }).catch(() => {});
    fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPayment),
    }).catch(() => {});

    window.dispatchEvent(new Event('bjjcron_students_updated'));
    return newStudent;
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    let updatedStudent: Student | null = null;
    setStudents(prev => {
      const updated = prev.map(s => {
        if (s.id === id) {
          updatedStudent = { ...s, ...updates };
          return updatedStudent;
        }
        return s;
      });
      localStorage.setItem('bjjcron_students', JSON.stringify(updated));
      return updated;
    });
    if (updatedStudent) saveToFirestore('students', updatedStudent);

    fetch(`/api/students/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch(() => {});

    // Also update corresponding user in bjjcron_users
    try {
      const savedUsers = localStorage.getItem('bjjcron_users');
      if (savedUsers) {
        const usersList = JSON.parse(savedUsers);
        const userIdx = usersList.findIndex((u: any) => u.studentId === id || (updates.email && u.email && u.email.trim().toLowerCase() === updates.email.trim().toLowerCase()));
        if (userIdx !== -1) {
          if (updates.name) usersList[userIdx].name = updates.name;
          if (updates.email) usersList[userIdx].email = updates.email.trim().toLowerCase();
          if (updates.phone) usersList[userIdx].phone = updates.phone;
          if (updates.photoUrl) usersList[userIdx].avatarUrl = updates.photoUrl;
          if (updates.approvalStatus) usersList[userIdx].approvalStatus = updates.approvalStatus;
          localStorage.setItem('bjjcron_users', JSON.stringify(usersList));
          window.dispatchEvent(new Event('bjjcron_users_updated'));
        }
      }
    } catch (e) {
      console.error('Error updating user in bjjcron_users:', e);
    }
    window.dispatchEvent(new Event('bjjcron_students_updated'));
  };

  const deleteStudent = (id: string) => {
    setStudents(prev => {
      const updated = prev.filter(s => s.id !== id);
      localStorage.setItem('bjjcron_students', JSON.stringify(updated));
      return updated;
    });
    removeFromFirestore('students', id);
    fetch(`/api/students/${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => {});
    window.dispatchEvent(new Event('bjjcron_students_updated'));
  };

  const promoteStudent = (
    studentId: string,
    newBelt: BeltType,
    newStripes: number,
    promotedBy: string,
    notes?: string
  ) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const newGraduation: Graduation = {
      id: `grad-${Date.now()}`,
      studentId,
      belt: newBelt,
      stripes: newStripes,
      promotedBy,
      promotedAt: new Date().toISOString().split('T')[0],
      notes,
      classesCountAtPromotion: student.totalClassesAttended,
    };

    setGraduations(prev => [newGraduation, ...prev]);
    saveToFirestore('graduations', newGraduation);

    const updatedStudentObj = {
      ...student,
      belt: newBelt,
      stripes: newStripes,
      classesSinceLastGraduation: 0,
    };

    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        return updatedStudentObj;
      }
      return s;
    }));
    saveToFirestore('students', updatedStudentObj);

    fetch(`/api/students/${encodeURIComponent(studentId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        belt: newBelt,
        stripes: newStripes,
        classesSinceLastGraduation: 0,
      }),
    }).catch(() => {});
  };

  const requestBeltChange = (
    studentId: string,
    requestedBelt: BeltType,
    requestedStripes: number,
    notes?: string
  ): { success: boolean; message: string } => {
    const student = students.find(s => s.id === studentId);
    if (!student) return { success: false, message: 'Aluno não encontrado.' };

    const existingPending = beltRequests.find(
      r => r.studentId === studentId && r.status === 'PENDING'
    );

    if (existingPending) {
      return {
        success: false,
        message: 'Você já possui uma solicitação de alteração de faixa pendente de análise pelo professor.'
      };
    }

    const newRequest: BeltChangeRequest = {
      id: `req-${Date.now()}`,
      studentId,
      studentName: student.name,
      currentBelt: student.belt,
      currentStripes: student.stripes,
      requestedBelt,
      requestedStripes,
      requestDate: new Date().toISOString().split('T')[0],
      notes: notes || 'Solicitação de alteração enviada pelo aluno.',
      status: 'PENDING',
    };

    setBeltRequests(prev => {
      const updated = [newRequest, ...prev];
      localStorage.setItem('bjjcron_belt_requests', JSON.stringify(updated));
      return updated;
    });
    saveToFirestore('beltRequests', newRequest);

    fetch('/api/belt-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRequest),
    }).catch(() => {});

    return {
      success: true,
      message: 'Solicitação de troca de faixa enviada com sucesso! Aguarde a aprovação do seu Professor.'
    };
  };

  const approveBeltChange = (requestId: string, reviewerName: string) => {
    const req = beltRequests.find(r => r.id === requestId);
    if (!req) return;

    promoteStudent(
      req.studentId,
      req.requestedBelt,
      req.requestedStripes,
      reviewerName,
      req.notes ? `[Solicitação Aprovada] ${req.notes}` : 'Solicitação de alteração de faixa aprovada pelo professor.'
    );

    const reviewedAt = new Date().toISOString().split('T')[0];
    const updatedReq = {
      ...req,
      status: 'APPROVED' as const,
      reviewedBy: reviewerName,
      reviewedAt,
    };
    setBeltRequests(prev => {
      const updated = prev.map(r => r.id === requestId ? updatedReq : r);
      localStorage.setItem('bjjcron_belt_requests', JSON.stringify(updated));
      return updated;
    });
    saveToFirestore('beltRequests', updatedReq);

    fetch(`/api/belt-requests/${encodeURIComponent(requestId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'APPROVED',
        reviewedBy: reviewerName,
        reviewedAt,
      }),
    }).catch(() => {});
  };

  const rejectBeltChange = (requestId: string, reviewerName: string) => {
    const req = beltRequests.find(r => r.id === requestId);
    if (!req) return;

    const reviewedAt = new Date().toISOString().split('T')[0];
    const updatedReq = {
      ...req,
      status: 'REJECTED' as const,
      reviewedBy: reviewerName,
      reviewedAt,
    };

    setBeltRequests(prev => {
      const updated = prev.map(r => r.id === requestId ? updatedReq : r);
      localStorage.setItem('bjjcron_belt_requests', JSON.stringify(updated));
      return updated;
    });
    saveToFirestore('beltRequests', updatedReq);

    fetch(`/api/belt-requests/${encodeURIComponent(requestId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'REJECTED',
        reviewedBy: reviewerName,
        reviewedAt,
      }),
    }).catch(() => {});
  };

  // Teacher CRUD
  const addTeacher = (teacherData: Omit<Teacher, 'id'>): Teacher => {
    const newTeacher: Teacher = {
      ...teacherData,
      id: `prof-${Date.now()}`,
    };
    setTeachers(prev => {
      const updated = [newTeacher, ...prev];
      localStorage.setItem('bjjcron_teachers', JSON.stringify(updated));
      return updated;
    });
    saveToFirestore('teachers', newTeacher);

    fetch('/api/teachers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTeacher),
    }).catch(() => {});

    return newTeacher;
  };

  const updateTeacher = (id: string, updates: Partial<Teacher>) => {
    let updatedTeacher: Teacher | null = null;
    setTeachers(prev => {
      const updated = prev.map(t => {
        if (t.id === id) {
          updatedTeacher = { ...t, ...updates };
          return updatedTeacher;
        }
        return t;
      });
      localStorage.setItem('bjjcron_teachers', JSON.stringify(updated));
      return updated;
    });
    if (updatedTeacher) saveToFirestore('teachers', updatedTeacher);

    fetch(`/api/teachers/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch(() => {});
  };

  const deleteTeacher = (id: string) => {
    setTeachers(prev => {
      const updated = prev.filter(t => t.id !== id);
      localStorage.setItem('bjjcron_teachers', JSON.stringify(updated));
      return updated;
    });
    removeFromFirestore('teachers', id);

    fetch(`/api/teachers/${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => {});
  };

  // Class CRUD
  const addClass = (classData: Omit<BJJClass, 'id'>) => {
    const newClass: BJJClass = {
      ...classData,
      id: `cls-${Date.now()}`,
    };
    setClasses(prev => {
      const updated = [...prev, newClass];
      localStorage.setItem('bjjcron_classes', JSON.stringify(updated));
      return updated;
    });
    saveToFirestore('classes', newClass);

    fetch('/api/classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newClass),
    }).catch(() => {});
  };

  const updateClass = (id: string, updates: Partial<BJJClass>) => {
    let updatedClass: BJJClass | null = null;
    setClasses(prev => {
      const updated = prev.map(c => {
        if (c.id === id) {
          updatedClass = { ...c, ...updates };
          return updatedClass;
        }
        return c;
      });
      localStorage.setItem('bjjcron_classes', JSON.stringify(updated));
      return updated;
    });
    if (updatedClass) saveToFirestore('classes', updatedClass);

    fetch(`/api/classes/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch(() => {});
  };

  const deleteClass = (id: string) => {
    setClasses(prev => {
      const updated = prev.filter(c => c.id !== id);
      localStorage.setItem('bjjcron_classes', JSON.stringify(updated));
      return updated;
    });
    removeFromFirestore('classes', id);

    fetch(`/api/classes/${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => {});
  };

  // Attendance
  const recordAttendance = (
    studentId: string,
    classId: string,
    method: 'MANUAL' | 'QR_CODE_STUDENT' | 'QR_CODE_TEACHER' = 'MANUAL',
    verifiedBy: string = 'Sistema',
    bypassTimeCheck: boolean = false
  ): { success: boolean; message: string } => {
    const student = students.find(s => s.id === studentId || s.qrCodeToken === studentId);
    if (!student) {
      return { success: false, message: 'Aluno não encontrado ou QR Code inválido.' };
    }

    if (!student.active) {
      return { success: false, message: `O aluno ${student.name} está inativo no sistema.` };
    }

    const bjjClass = classes.find(c => c.id === classId) || classes[0];

    // Enforce day and 15-minute time window check unless explicitly bypassed
    if (!bypassTimeCheck) {
      const availability = checkClassCheckinAvailability(bjjClass);
      if (!availability.isAvailable) {
        return {
          success: false,
          message: availability.reason || 'Check-in indisponível no momento para esta aula.',
        };
      }
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // Check if student already checked in today for this class
    const alreadyPresent = attendances.some(a => 
      a.studentId === student.id && 
      a.classId === bjjClass.id && 
      a.date === todayStr
    );

    if (alreadyPresent) {
      return { success: false, message: `Atenção: ${student.name} já registrou presença nesta aula hoje!` };
    }

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      classId: bjjClass.id,
      className: bjjClass.title,
      date: todayStr,
      timestamp: new Date().toISOString(),
      method,
      verifiedBy,
    };

    setAttendances(prev => {
      const updated = [newRecord, ...prev];
      localStorage.setItem('bjjcron_attendances', JSON.stringify(updated));
      return updated;
    });
    saveToFirestore('attendances', newRecord);

    fetch('/api/attendances', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRecord),
    }).catch(() => {});

    // Update student's class counter
    setStudents(prev => {
      let updatedStudent: Student | null = null;
      const updated = prev.map(s => {
        if (s.id === student.id) {
          updatedStudent = {
            ...s,
            totalClassesAttended: s.totalClassesAttended + 1,
            classesSinceLastGraduation: s.classesSinceLastGraduation + 1,
          };
          fetch(`/api/students/${encodeURIComponent(s.id)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              totalClassesAttended: updatedStudent.totalClassesAttended,
              classesSinceLastGraduation: updatedStudent.classesSinceLastGraduation,
            }),
          }).catch(() => {});
          return updatedStudent;
        }
        return s;
      });
      localStorage.setItem('bjjcron_students', JSON.stringify(updated));
      if (updatedStudent) saveToFirestore('students', updatedStudent);
      return updated;
    });

    return {
      success: true,
      message: `Oss! Presença confirmada para ${student.name} na aula de ${bjjClass.title}.`,
    };
  };

  const removeAttendance = (id: string) => {
    const record = attendances.find(a => a.id === id);
    if (record) {
      setAttendances(prev => {
        const updated = prev.filter(a => a.id !== id);
        localStorage.setItem('bjjcron_attendances', JSON.stringify(updated));
        return updated;
      });
      removeFromFirestore('attendances', id);
      fetch(`/api/attendances/${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => {});

      setStudents(prev => {
        let updatedStudent: Student | null = null;
        const updated = prev.map(s => {
          if (s.id === record.studentId) {
            updatedStudent = {
              ...s,
              totalClassesAttended: Math.max(0, s.totalClassesAttended - 1),
              classesSinceLastGraduation: Math.max(0, s.classesSinceLastGraduation - 1),
            };
            fetch(`/api/students/${encodeURIComponent(s.id)}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                totalClassesAttended: updatedStudent.totalClassesAttended,
                classesSinceLastGraduation: updatedStudent.classesSinceLastGraduation,
              }),
            }).catch(() => {});
            return updatedStudent;
          }
          return s;
        });
        localStorage.setItem('bjjcron_students', JSON.stringify(updated));
        if (updatedStudent) saveToFirestore('students', updatedStudent);
        return updated;
      });
    }
  };

  // Payments
  const addPayment = (paymentData: Omit<PaymentRecord, 'id'>) => {
    const newPayment: PaymentRecord = {
      ...paymentData,
      id: `pay-${Date.now()}`,
    };
    setPayments(prev => {
      const updated = [newPayment, ...prev];
      localStorage.setItem('bjjcron_payments', JSON.stringify(updated));
      return updated;
    });
    saveToFirestore('payments', newPayment);

    fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPayment),
    }).catch(() => {});
  };

  const markPaymentAsPaid = (paymentId: string, method: 'PIX' | 'CARTAO' | 'DINHEIRO' | 'BOLETO') => {
    const todayStr = new Date().toISOString().split('T')[0];
    let updatedPayment: PaymentRecord | null = null;
    setPayments(prev => {
      const updated = prev.map(p => {
        if (p.id === paymentId) {
          fetch(`/api/payments/${encodeURIComponent(paymentId)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              status: 'PAGO',
              paymentDate: todayStr,
              paymentMethod: method,
            }),
          }).catch(() => {});

          updatedPayment = {
            ...p,
            status: 'PAGO' as PaymentStatus,
            paymentDate: todayStr,
            paymentMethod: method,
          };
          return updatedPayment;
        }
        return p;
      });
      localStorage.setItem('bjjcron_payments', JSON.stringify(updated));
      return updated;
    });
    if (updatedPayment) saveToFirestore('payments', updatedPayment);

    setStudents(sPrev => {
      const targetPayment = payments.find(p => p.id === paymentId);
      let updatedStudent: Student | null = null;
      const updated = sPrev.map(st => {
        if (targetPayment && st.id === targetPayment.studentId) {
          fetch(`/api/students/${encodeURIComponent(st.id)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paymentStatus: 'PAGO',
              lastPaymentDate: todayStr,
            }),
          }).catch(() => {});
          updatedStudent = { ...st, paymentStatus: 'PAGO' as PaymentStatus, lastPaymentDate: todayStr };
          return updatedStudent;
        }
        return st;
      });
      localStorage.setItem('bjjcron_students', JSON.stringify(updated));
      if (updatedStudent) saveToFirestore('students', updatedStudent);
      return updated;
    });
  };

  // Training Logs
  const addTrainingLog = (logData: Omit<TrainingLog, 'id'>) => {
    const newLog: TrainingLog = {
      ...logData,
      id: `log-${Date.now()}`,
    };
    setTrainingLogs(prev => {
      const updated = [newLog, ...prev];
      localStorage.setItem('bjjcron_training_logs', JSON.stringify(updated));
      return updated;
    });
    saveToFirestore('trainingLogs', newLog);

    fetch('/api/training-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLog),
    }).catch(() => {});
  };

  // Teacher Observations
  const addTeacherObservation = (obsData: Omit<TeacherObservation, 'id' | 'date'>) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const targetStudent = students.find(s => s.id === obsData.studentId);
    const newObs: TeacherObservation = {
      ...obsData,
      studentName: targetStudent ? targetStudent.name : obsData.studentName || 'Aluno',
      id: `obs-${Date.now()}`,
      date: todayStr
    };
    setTeacherObservations(prev => {
      const updated = [newObs, ...prev];
      localStorage.setItem('bjjcron_teacher_observations', JSON.stringify(updated));
      return updated;
    });
    saveToFirestore('teacherObservations', newObs);

    fetch('/api/teacher-observations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newObs),
    }).catch(() => {});
  };

  const deleteTeacherObservation = (id: string) => {
    setTeacherObservations(prev => {
      const updated = prev.filter(o => o.id !== id);
      localStorage.setItem('bjjcron_teacher_observations', JSON.stringify(updated));
      return updated;
    });
    removeFromFirestore('teacherObservations', id);

    fetch(`/api/teacher-observations/${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => {});
  };

  // Config
  const updateAcademyConfig = (updates: Partial<AcademyConfig>) => {
    setAcademyConfig(prev => {
      const updated = { ...prev, ...updates };
      saveConfigToFirestore(updated);
      fetch('/api/academy-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      }).catch(() => {});
      return updated;
    });
  };

  const resetToDefaultData = () => {
    localStorage.removeItem('bjjcron_students');
    localStorage.removeItem('bjjcron_teachers');
    localStorage.removeItem('bjjcron_classes');
    localStorage.removeItem('bjjcron_attendances');
    localStorage.removeItem('bjjcron_payments');
    localStorage.removeItem('bjjcron_graduations');
    localStorage.removeItem('bjjcron_belt_requests');
    localStorage.removeItem('bjjcron_training_logs');
    localStorage.removeItem('bjjcron_teacher_observations');
    localStorage.removeItem('bjjcron_academy_config');

    setStudents(INITIAL_STUDENTS);
    setTeachers(INITIAL_TEACHERS);
    setClasses(INITIAL_CLASSES);
    setAttendances(INITIAL_ATTENDANCE);
    setPayments(INITIAL_PAYMENTS);
    setGraduations(INITIAL_GRADUATIONS);
    setBeltRequests(INITIAL_BELT_REQUESTS);
    setTrainingLogs(INITIAL_TRAINING_LOGS);
    setTeacherObservations(INITIAL_TEACHER_OBSERVATIONS);
    setAcademyConfig(INITIAL_ACADEMY_CONFIG);
    fetch('/api/reset-data', { method: 'POST' }).catch(() => {});
  };

  const clearAllDataToEmpty = () => {
    localStorage.removeItem('bjjcron_students');
    localStorage.removeItem('bjjcron_teachers');
    localStorage.removeItem('bjjcron_classes');
    localStorage.removeItem('bjjcron_attendances');
    localStorage.removeItem('bjjcron_payments');
    localStorage.removeItem('bjjcron_graduations');
    localStorage.removeItem('bjjcron_belt_requests');
    localStorage.removeItem('bjjcron_training_logs');
    localStorage.removeItem('bjjcron_teacher_observations');

    setStudents([]);
    setTeachers([]);
    setClasses([]);
    setAttendances([]);
    setPayments([]);
    setGraduations([]);
    setBeltRequests([]);
    setTrainingLogs([]);
    setTeacherObservations([]);
    fetch('/api/clear-all-data', { method: 'POST' }).catch(() => {});
  };

  const exportDatabaseJSON = () => {
    const dbPayload = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      academyConfig,
      students,
      teachers,
      classes,
      attendances,
      payments,
      graduations,
      beltRequests,
      trainingLogs,
      teacherObservations,
    };
    return JSON.stringify(dbPayload, null, 2);
  };

  const importDatabaseJSON = (jsonStr: string): { success: boolean; message: string } => {
    try {
      const data = JSON.parse(jsonStr);
      if (!data || typeof data !== 'object') {
        return { success: false, message: 'Arquivo de backup inválido ou corrompido.' };
      }

      if (data.students && Array.isArray(data.students)) setStudents(data.students);
      if (data.teachers && Array.isArray(data.teachers)) setTeachers(data.teachers);
      if (data.classes && Array.isArray(data.classes)) setClasses(data.classes);
      if (data.attendances && Array.isArray(data.attendances)) setAttendances(data.attendances);
      if (data.payments && Array.isArray(data.payments)) setPayments(data.payments);
      if (data.graduations && Array.isArray(data.graduations)) setGraduations(data.graduations);
      if (data.beltRequests && Array.isArray(data.beltRequests)) setBeltRequests(data.beltRequests);
      if (data.trainingLogs && Array.isArray(data.trainingLogs)) setTrainingLogs(data.trainingLogs);
      if (data.teacherObservations && Array.isArray(data.teacherObservations)) setTeacherObservations(data.teacherObservations);
      if (data.academyConfig && typeof data.academyConfig === 'object') setAcademyConfig(data.academyConfig);

      return { success: true, message: 'Banco de dados restaurado com sucesso do backup!' };
    } catch (err: any) {
      return { success: false, message: `Erro ao importar arquivo: ${err.message || 'Formato JSON inválido'}` };
    }
  };

  return (
    <DataContext.Provider value={{
      students,
      teachers,
      classes,
      attendances,
      payments,
      graduations,
      beltRequests,
      trainingLogs,
      teacherObservations,
      academyConfig,
      addStudent,
      updateStudent,
      deleteStudent,
      promoteStudent,
      requestBeltChange,
      approveBeltChange,
      rejectBeltChange,
      addTeacher,
      updateTeacher,
      deleteTeacher,
      addClass,
      updateClass,
      deleteClass,
      recordAttendance,
      removeAttendance,
      addPayment,
      markPaymentAsPaid,
      addTrainingLog,
      addTeacherObservation,
      deleteTeacherObservation,
      updateAcademyConfig,
      resetToDefaultData,
      clearAllDataToEmpty,
      exportDatabaseJSON,
      importDatabaseJSON,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};
