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
    return saved ? JSON.parse(saved) : INITIAL_ACADEMY_CONFIG;
  });

  // Local Storage Persistence
  useEffect(() => { localStorage.setItem('bjjcron_students', JSON.stringify(students)); }, [students]);
  useEffect(() => { localStorage.setItem('bjjcron_teachers', JSON.stringify(teachers)); }, [teachers]);
  useEffect(() => { localStorage.setItem('bjjcron_classes', JSON.stringify(classes)); }, [classes]);
  useEffect(() => { localStorage.setItem('bjjcron_attendances', JSON.stringify(attendances)); }, [attendances]);
  useEffect(() => { localStorage.setItem('bjjcron_payments', JSON.stringify(payments)); }, [payments]);
  useEffect(() => { localStorage.setItem('bjjcron_graduations', JSON.stringify(graduations)); }, [graduations]);
  useEffect(() => { localStorage.setItem('bjjcron_belt_requests', JSON.stringify(beltRequests)); }, [beltRequests]);
  useEffect(() => { localStorage.setItem('bjjcron_training_logs', JSON.stringify(trainingLogs)); }, [trainingLogs]);
  useEffect(() => { localStorage.setItem('bjjcron_teacher_observations', JSON.stringify(teacherObservations)); }, [teacherObservations]);
  useEffect(() => { localStorage.setItem('bjjcron_academy_config', JSON.stringify(academyConfig)); }, [academyConfig]);

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
      approvalStatus: 'APPROVED',
      hasActivatedAccount: false,
    };

    setStudents(prev => {
      const updated = [newStudent, ...prev];
      localStorage.setItem('bjjcron_students', JSON.stringify(updated));
      return updated;
    });

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
            approvalStatus: 'APPROVED',
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

    window.dispatchEvent(new Event('bjjcron_students_updated'));
    return newStudent;
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    setStudents(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, ...updates } : s);
      localStorage.setItem('bjjcron_students', JSON.stringify(updated));
      return updated;
    });

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

    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          belt: newBelt,
          stripes: newStripes,
          classesSinceLastGraduation: 0,
        };
      }
      return s;
    }));
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

    setBeltRequests(prev => [newRequest, ...prev]);
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

    setBeltRequests(prev =>
      prev.map(r =>
        r.id === requestId
          ? {
              ...r,
              status: 'APPROVED',
              reviewedBy: reviewerName,
              reviewedAt: new Date().toISOString().split('T')[0],
            }
          : r
      )
    );
  };

  const rejectBeltChange = (requestId: string, reviewerName: string) => {
    setBeltRequests(prev =>
      prev.map(r =>
        r.id === requestId
          ? {
              ...r,
              status: 'REJECTED',
              reviewedBy: reviewerName,
              reviewedAt: new Date().toISOString().split('T')[0],
            }
          : r
      )
    );
  };

  // Teacher CRUD
  const addTeacher = (teacherData: Omit<Teacher, 'id'>): Teacher => {
    const newTeacher: Teacher = {
      ...teacherData,
      id: `prof-${Date.now()}`,
    };
    setTeachers(prev => [newTeacher, ...prev]);
    return newTeacher;
  };

  const updateTeacher = (id: string, updates: Partial<Teacher>) => {
    setTeachers(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTeacher = (id: string) => {
    setTeachers(prev => prev.filter(t => t.id !== id));
  };

  // Class CRUD
  const addClass = (classData: Omit<BJJClass, 'id'>) => {
    const newClass: BJJClass = {
      ...classData,
      id: `cls-${Date.now()}`,
    };
    setClasses(prev => [...prev, newClass]);
  };

  const updateClass = (id: string, updates: Partial<BJJClass>) => {
    setClasses(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteClass = (id: string) => {
    setClasses(prev => prev.filter(c => c.id !== id));
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

    setAttendances(prev => [newRecord, ...prev]);

    // Update student's class counter
    setStudents(prev => prev.map(s => {
      if (s.id === student.id) {
        return {
          ...s,
          totalClassesAttended: s.totalClassesAttended + 1,
          classesSinceLastGraduation: s.classesSinceLastGraduation + 1,
        };
      }
      return s;
    }));

    return {
      success: true,
      message: `Oss! Presença confirmada para ${student.name} na aula de ${bjjClass.title}.`,
    };
  };

  const removeAttendance = (id: string) => {
    const record = attendances.find(a => a.id === id);
    if (record) {
      setAttendances(prev => prev.filter(a => a.id !== id));
      setStudents(prev => prev.map(s => {
        if (s.id === record.studentId) {
          return {
            ...s,
            totalClassesAttended: Math.max(0, s.totalClassesAttended - 1),
            classesSinceLastGraduation: Math.max(0, s.classesSinceLastGraduation - 1),
          };
        }
        return s;
      }));
    }
  };

  // Payments
  const addPayment = (paymentData: Omit<PaymentRecord, 'id'>) => {
    const newPayment: PaymentRecord = {
      ...paymentData,
      id: `pay-${Date.now()}`,
    };
    setPayments(prev => [newPayment, ...prev]);
  };

  const markPaymentAsPaid = (paymentId: string, method: 'PIX' | 'CARTAO' | 'DINHEIRO' | 'BOLETO') => {
    const todayStr = new Date().toISOString().split('T')[0];
    setPayments(prev => prev.map(p => {
      if (p.id === paymentId) {
        // Also update student status
        setStudents(sPrev => sPrev.map(st => st.id === p.studentId ? { ...st, paymentStatus: 'PAGO' as PaymentStatus, lastPaymentDate: todayStr } : st));
        return {
          ...p,
          status: 'PAGO' as PaymentStatus,
          paymentDate: todayStr,
          paymentMethod: method,
        };
      }
      return p;
    }));
  };

  // Training Logs
  const addTrainingLog = (logData: Omit<TrainingLog, 'id'>) => {
    const newLog: TrainingLog = {
      ...logData,
      id: `log-${Date.now()}`,
    };
    setTrainingLogs(prev => [newLog, ...prev]);
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
    setTeacherObservations(prev => [newObs, ...prev]);
  };

  const deleteTeacherObservation = (id: string) => {
    setTeacherObservations(prev => prev.filter(o => o.id !== id));
  };

  // Config
  const updateAcademyConfig = (updates: Partial<AcademyConfig>) => {
    setAcademyConfig(prev => ({ ...prev, ...updates }));
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
