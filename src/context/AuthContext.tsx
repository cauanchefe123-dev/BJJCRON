import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, BeltType, AgeCategory, WeightCategory } from '../types';
import { INITIAL_USERS } from '../data/mockData';
import { DEFAULT_BLACK_GI_AVATAR } from '../constants/avatar';

export interface LoginResult {
  success: boolean;
  message?: string;
  reason?: 'PENDING' | 'REJECTED' | 'NEEDS_FIRST_ACCESS' | 'INVALID_CREDENTIALS' | 'NOT_FOUND';
  user?: User;
}

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  loginWithPassword: (email: string, password?: string) => Promise<LoginResult> | LoginResult;
  firstAccessActivate: (email: string, newPassword?: string) => { success: boolean; message: string };
  registerStudentSelfService: (studentData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    belt?: BeltType;
    ageCategory?: AgeCategory;
    weightCategory?: WeightCategory;
  }) => { success: boolean; message: string };
  registerTeacherSelfService: (teacherData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    belt?: BeltType;
    degrees?: number;
    specialty?: string;
  }) => { success: boolean; message: string };
  registerAdminSelfService: (adminData: {
    name: string;
    academyName: string;
    email: string;
    phone: string;
    password: string;
    belt?: BeltType;
  }) => { success: boolean; message: string };
  approveUser: (emailOrStudentId: string) => void;
  rejectUser: (emailOrStudentId: string) => void;
  switchRole: (role: UserRole) => void;
  switchUser: (userId: string) => void;
  logout: () => void;
  deleteMyAccount: () => { success: boolean; message: string };
  refreshUsersFromStorage: () => void;
  requestPasswordRecovery: (email: string) => { success: boolean; code?: string; message: string };
  resetPasswordWithCode: (email: string, code: string, expectedCode: string, newPassword: string) => { success: boolean; message: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to ensure every student in bjjcron_students or INITIAL_STUDENTS has a corresponding User
const getSyncedInitialUsers = (): User[] => {
  const savedUsers = localStorage.getItem('bjjcron_users');
  let baseUsers: User[] = savedUsers ? JSON.parse(savedUsers) : INITIAL_USERS;

  // Ensure all INITIAL_USERS (including admin cauanchefe123@gmail.com) are always present
  INITIAL_USERS.forEach(initU => {
    if (!baseUsers.some(u => u.email.trim().toLowerCase() === initU.email.trim().toLowerCase() || u.id === initU.id)) {
      baseUsers.push(initU);
    }
  });

  // Replace unsplash avatars with DEFAULT_BLACK_GI_AVATAR
  baseUsers = baseUsers.map(u => ({
    ...u,
    avatarUrl: (!u.avatarUrl || u.avatarUrl.includes('unsplash.com')) ? DEFAULT_BLACK_GI_AVATAR : u.avatarUrl
  }));

  const savedStudents = localStorage.getItem('bjjcron_students');
  if (savedStudents) {
    try {
      const studentsList = JSON.parse(savedStudents);
      let changed = false;
      studentsList.forEach((std: any) => {
        if (!std.email) return;
        const cleanEmail = std.email.trim().toLowerCase();
        const exists = baseUsers.some(u => u.email.trim().toLowerCase() === cleanEmail || u.studentId === std.id);
        if (!exists) {
          baseUsers.push({
            id: `user-${std.id}`,
            name: std.name,
            email: cleanEmail,
            role: 'ALUNO',
            studentId: std.id,
            phone: std.phone || '',
            password: std.password || '123',
            approvalStatus: std.approvalStatus || (std.active !== false ? 'APPROVED' : 'PENDING'),
            isActivated: std.hasActivatedAccount !== undefined ? std.hasActivatedAccount : false,
            avatarUrl: (std.photoUrl && !std.photoUrl.includes('unsplash.com')) ? std.photoUrl : DEFAULT_BLACK_GI_AVATAR
          });
          changed = true;
        }
      });
      if (changed) {
        localStorage.setItem('bjjcron_users', JSON.stringify(baseUsers));
      }
    } catch (e) {
      console.error('Error syncing students to users on load:', e);
    }
  }

  return baseUsers;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(getSyncedInitialUsers);

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('bjjcron_current_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (u && (!u.avatarUrl || u.avatarUrl.includes('unsplash.com'))) {
          u.avatarUrl = DEFAULT_BLACK_GI_AVATAR;
        }
        return u;
      } catch (e) {}
    }
    return null;
  });

  const fetchUsersFromApi = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setUsers(prev => {
            const isDiff = JSON.stringify(prev) !== JSON.stringify(data);
            return isDiff ? data : prev;
          });
          localStorage.setItem('bjjcron_users', JSON.stringify(data));
        }
      }
    } catch (e) {
      // Offline fallback
    }
  };

  useEffect(() => {
    localStorage.setItem('bjjcron_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    fetchUsersFromApi();
    const timer = setInterval(fetchUsersFromApi, 3000);

    const syncFromStorage = () => {
      fetchUsersFromApi();
      const saved = localStorage.getItem('bjjcron_users');
      if (saved) {
        try {
          setUsers(JSON.parse(saved));
        } catch (e) {}
      }
    };
    window.addEventListener('storage', syncFromStorage);
    window.addEventListener('bjjcron_users_updated', syncFromStorage);
    window.addEventListener('bjjcron_students_updated', syncFromStorage);
    return () => {
      clearInterval(timer);
      window.removeEventListener('storage', syncFromStorage);
      window.removeEventListener('bjjcron_users_updated', syncFromStorage);
      window.removeEventListener('bjjcron_students_updated', syncFromStorage);
    };
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('bjjcron_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('bjjcron_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      const updatedUser = users.find(u => u.id === currentUser.id);
      if (updatedUser && updatedUser.approvalStatus !== currentUser.approvalStatus) {
        setCurrentUser(updatedUser);
      }
    }
  }, [users]);

  const refreshUsersFromStorage = () => {
    const saved = localStorage.getItem('bjjcron_users');
    if (saved) {
      setUsers(JSON.parse(saved));
    }
  };

  const loginWithPassword = async (email: string, password?: string): Promise<LoginResult> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return {
        success: false,
        reason: 'NOT_FOUND',
        message: 'Por favor, informe seu e-mail cadastrado.'
      };
    }

    // Try backend /api/auth/login first for Postgres accuracy
    try {
      const resp = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: password || '' })
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.success && data.user) {
          const u: User = data.user;
          u.isActivated = true;
          setCurrentUser(u);

          // Update users state list
          setUsers(prev => {
            const next = prev.map(existing => existing.email.trim().toLowerCase() === cleanEmail ? u : existing);
            if (!next.some(existing => existing.email.trim().toLowerCase() === cleanEmail)) {
              next.push(u);
            }
            localStorage.setItem('bjjcron_users', JSON.stringify(next));
            return next;
          });
          window.dispatchEvent(new Event('bjjcron_users_updated'));
          return {
            success: true,
            user: u,
            message: data.message || `Bem-vindo(a) de volta, ${u.name}!`
          };
        } else if (data.reason === 'WRONG_PASSWORD') {
          return {
            success: false,
            reason: 'WRONG_PASSWORD',
            message: data.message || 'Senha incorreta. Verifique sua senha e tente novamente.'
          };
        } else if (data.reason === 'NOT_FOUND') {
          return {
            success: false,
            reason: 'NOT_FOUND',
            message: data.message || 'E-mail não cadastrado! Por favor, solicite seu cadastro ao Mestre ou crie uma conta.'
          };
        }
      }
    } catch (e) {
      console.warn('Backend login fallback to local memory check:', e);
    }

    let currentUsers = [...users];
    INITIAL_USERS.forEach(initU => {
      if (!currentUsers.some(u => u.email.trim().toLowerCase() === initU.email.trim().toLowerCase() || u.id === initU.id)) {
        currentUsers.push(initU);
      }
    });
    const savedUsers = localStorage.getItem('bjjcron_users');
    if (savedUsers) {
      try {
        const parsed: User[] = JSON.parse(savedUsers);
        parsed.forEach(u => {
          if (!currentUsers.some(c => c.id === u.id || c.email.trim().toLowerCase() === u.email.trim().toLowerCase())) {
            currentUsers.push(u);
          }
        });
      } catch (e) {}
    }

    let found = currentUsers.find(u => u.email.trim().toLowerCase() === cleanEmail);

    // If not found in current users array, check bjjcron_students dynamically
    if (!found) {
      const savedStudents = localStorage.getItem('bjjcron_students');
      if (savedStudents) {
        try {
          const studentsList = JSON.parse(savedStudents);
          const studentObj = studentsList.find((s: any) => s.email && s.email.trim().toLowerCase() === cleanEmail);
          if (studentObj) {
            const newUser: User = {
              id: `user-${studentObj.id}`,
              name: studentObj.name,
              email: cleanEmail,
              role: 'ALUNO',
              studentId: studentObj.id,
              phone: studentObj.phone || '',
              password: password || studentObj.password || '123',
              approvalStatus: 'APPROVED',
              isActivated: true,
              avatarUrl: (studentObj.photoUrl && !studentObj.photoUrl.includes('unsplash.com')) ? studentObj.photoUrl : DEFAULT_BLACK_GI_AVATAR
            };
            found = newUser;
            currentUsers.push(newUser);
            setUsers(currentUsers);
            localStorage.setItem('bjjcron_users', JSON.stringify(currentUsers));
          }
        } catch (e) {
          console.error('Error finding student in localStorage:', e);
        }
      }
    }

    // If not found in students, check bjjcron_teachers dynamically
    if (!found) {
      const savedTeachers = localStorage.getItem('bjjcron_teachers');
      if (savedTeachers) {
        try {
          const teachersList = JSON.parse(savedTeachers);
          const teacherObj = teachersList.find((t: any) => t.email && t.email.trim().toLowerCase() === cleanEmail);
          if (teacherObj) {
            const newUser: User = {
              id: `user-${teacherObj.id}`,
              name: teacherObj.name,
              email: cleanEmail,
              role: 'PROFESSOR',
              phone: teacherObj.phone || '',
              password: password || teacherObj.password || '123',
              approvalStatus: 'APPROVED',
              isActivated: true,
              avatarUrl: (teacherObj.avatarUrl && !teacherObj.avatarUrl.includes('unsplash.com')) ? teacherObj.avatarUrl : DEFAULT_BLACK_GI_AVATAR
            };
            found = newUser;
            currentUsers.push(newUser);
            setUsers(currentUsers);
            localStorage.setItem('bjjcron_users', JSON.stringify(currentUsers));
          }
        } catch (e) {
          console.error('Error finding teacher in localStorage:', e);
        }
      }
    }

    if (!found) {
      return {
        success: false,
        reason: 'NOT_FOUND',
        message: 'E-mail não cadastrado! Por favor, solicite seu cadastro ao Mestre ou crie uma conta.'
      };
    }

    if (password && found.password && found.password !== password && found.password !== '123') {
      return {
        success: false,
        reason: 'WRONG_PASSWORD',
        message: 'Senha incorreta. Verifique sua senha e tente novamente.'
      };
    }

    found.isActivated = true;
    if (password) {
      found.password = password;
    }

    window.dispatchEvent(new Event('bjjcron_users_updated'));
    setCurrentUser(found);
    return {
      success: true,
      user: found,
      message: `Bem-vindo(a) de volta, ${found.name}!`
    };
  };

  const firstAccessActivate = (email: string, newPassword?: string): { success: boolean; message: string } => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return {
        success: false,
        message: 'Por favor, informe seu e-mail para ativar o 1º acesso.'
      };
    }

    // Tenta ativar também no backend Postgres de forma assíncrona/imediata
    fetch('/api/auth/first-access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, newPassword: newPassword || '123' })
    }).then(res => res.json()).then(data => {
      if (data && data.success && data.user) {
        // Recarrega lista de usuários do backend para manter sincronizado
        fetch('/api/users')
          .then(r => r.json())
          .then(list => {
            if (Array.isArray(list)) {
              setUsers(list);
              localStorage.setItem('bjjcron_users', JSON.stringify(list));
              window.dispatchEvent(new Event('bjjcron_users_updated'));
            }
          })
          .catch(() => {});
      }
    }).catch(() => {});

    let currentUsers = [...users];
    const savedUsers = localStorage.getItem('bjjcron_users');
    if (savedUsers) {
      try {
        const parsed: User[] = JSON.parse(savedUsers);
        parsed.forEach(u => {
          if (!currentUsers.some(c => c.id === u.id || c.email.trim().toLowerCase() === u.email.trim().toLowerCase())) {
            currentUsers.push(u);
          }
        });
      } catch (e) {}
    }

    let userIndex = currentUsers.findIndex(u => u.email.trim().toLowerCase() === cleanEmail);

    // If not found in users state, check bjjcron_students dynamically
    if (userIndex === -1) {
      const savedStudents = localStorage.getItem('bjjcron_students');
      if (savedStudents) {
        try {
          const studentsList = JSON.parse(savedStudents);
          const studentObj = studentsList.find((s: any) => s.email && s.email.trim().toLowerCase() === cleanEmail);
          if (studentObj) {
            const newUser: User = {
              id: `user-${studentObj.id}`,
              name: studentObj.name,
              email: cleanEmail,
              role: 'ALUNO',
              studentId: studentObj.id,
              phone: studentObj.phone || '',
              password: newPassword || '123',
              approvalStatus: 'APPROVED',
              isActivated: true,
              avatarUrl: (studentObj.photoUrl && !studentObj.photoUrl.includes('unsplash.com')) ? studentObj.photoUrl : DEFAULT_BLACK_GI_AVATAR
            };
            currentUsers.push(newUser);
            userIndex = currentUsers.length - 1;
          }
        } catch (e) {
          console.error('Error finding student for first access:', e);
        }
      }
    }

    // If not found in students, check bjjcron_teachers dynamically
    if (userIndex === -1) {
      const savedTeachers = localStorage.getItem('bjjcron_teachers');
      if (savedTeachers) {
        try {
          const teachersList = JSON.parse(savedTeachers);
          const teacherObj = teachersList.find((t: any) => t.email && t.email.trim().toLowerCase() === cleanEmail);
          if (teacherObj) {
            const newUser: User = {
              id: `user-${teacherObj.id}`,
              name: teacherObj.name,
              email: cleanEmail,
              role: 'PROFESSOR',
              phone: teacherObj.phone || '',
              password: newPassword || teacherObj.password || '123',
              approvalStatus: 'APPROVED',
              isActivated: true,
              avatarUrl: (teacherObj.avatarUrl && !teacherObj.avatarUrl.includes('unsplash.com')) ? teacherObj.avatarUrl : DEFAULT_BLACK_GI_AVATAR
            };
            currentUsers.push(newUser);
            userIndex = currentUsers.length - 1;
          }
        } catch (e) {
          console.error('Error finding teacher for first access:', e);
        }
      }
    }

    // Do not allow auto-creation of accounts; user must be registered beforehand
    if (userIndex === -1) {
      return {
        success: false,
        message: 'E-mail não cadastrado no sistema! Por favor, realize o seu cadastro antes de acessar sua conta.'
      };
    }

    const targetUser = currentUsers[userIndex];

    const updatedUser: User = {
      ...targetUser,
      password: newPassword || targetUser.password || '123',
      isActivated: true,
      approvalStatus: 'APPROVED',
    };

    currentUsers[userIndex] = updatedUser;
    setUsers(currentUsers);
    localStorage.setItem('bjjcron_users', JSON.stringify(currentUsers));

    // Also activate matching student in bjjcron_students
    const savedStudents = localStorage.getItem('bjjcron_students');
    if (savedStudents) {
      try {
        const studentsList = JSON.parse(savedStudents);
        const studentIdx = studentsList.findIndex((s: any) => s.email && s.email.trim().toLowerCase() === cleanEmail);
        if (studentIdx !== -1) {
          studentsList[studentIdx].hasActivatedAccount = true;
          studentsList[studentIdx].approvalStatus = 'APPROVED';
          studentsList[studentIdx].password = newPassword || '123';
          studentsList[studentIdx].active = true;
          localStorage.setItem('bjjcron_students', JSON.stringify(studentsList));
        }
      } catch (e) {
        console.error('Error activating student in bjjcron_students:', e);
      }
    }

    window.dispatchEvent(new Event('bjjcron_users_updated'));
    setCurrentUser(updatedUser);

    return {
      success: true,
      message: `Conta ativada com sucesso! Senha configurada. Bem-vindo(a) à equipe, ${updatedUser.name}.`
    };
  };

  const registerStudentSelfService = (studentData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    belt?: BeltType;
    ageCategory?: AgeCategory;
    weightCategory?: WeightCategory;
  }): { success: boolean; message: string } => {
    const cleanEmail = studentData.email.trim().toLowerCase();

    if (users.some(u => u.email.trim().toLowerCase() === cleanEmail)) {
      return {
        success: false,
        message: 'Este e-mail já possui cadastro no sistema! Para usar o mesmo e-mail em outro perfil (Mestre, Professor ou Aluno), você precisa excluir os dados da conta atual primeiro clicando em "Excluir Conta & Recadastrar".'
      };
    }

    const newStudentId = `std-self-${Date.now()}`;
    const newUserId = `user-self-${Date.now()}`;

    // Create User with APPROVED status so student has instant access
    const newUser: User = {
      id: newUserId,
      name: studentData.name,
      email: cleanEmail,
      role: 'ALUNO',
      studentId: newStudentId,
      phone: studentData.phone,
      password: studentData.password,
      approvalStatus: 'PENDING',
      isActivated: true,
      avatarUrl: DEFAULT_BLACK_GI_AVATAR
    };

    setUsers(prev => [...prev, newUser]);
    const updatedUsers = [...users, newUser];
    localStorage.setItem('bjjcron_users', JSON.stringify(updatedUsers));
    fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    }).then(() => {
      window.dispatchEvent(new Event('bjjcron_users_updated'));
    }).catch(() => {});

    // Create Student in bjjcron_students
    const savedStudents = localStorage.getItem('bjjcron_students');
    const studentsList = savedStudents ? JSON.parse(savedStudents) : [];

    const newStudentObj = {
      id: newStudentId,
      registrationNumber: `BJJ-2026-${String(studentsList.length + 1).padStart(3, '0')}`,
      name: studentData.name,
      email: cleanEmail,
      phone: studentData.phone,
      birthDate: '2000-01-01',
      photoUrl: DEFAULT_BLACK_GI_AVATAR,
      belt: studentData.belt || 'BRANCA',
      stripes: 0,
      startDate: new Date().toISOString().split('T')[0],
      totalClassesAttended: 0,
      classesSinceLastGraduation: 0,
      weightCategory: studentData.weightCategory || 'MÉDIO',
      ageCategory: studentData.ageCategory || 'ADULTO',
      active: true,
      planName: 'Plano Mensal Padrão',
      planPrice: 240,
      paymentDueDateDay: 10,
      paymentStatus: 'PENDENTE',
      qrCodeToken: `BJJCRON-${newStudentId}`,
      approvalStatus: 'PENDING',
      notes: 'Nova solicitação de vínculo aguardando aprovação na equipe.',
      hasActivatedAccount: true,
      password: studentData.password
    };

    const filteredStudents = studentsList.filter((s: any) => s.email && s.email.trim().toLowerCase() !== cleanEmail);
    filteredStudents.unshift(newStudentObj);
    localStorage.setItem('bjjcron_students', JSON.stringify(filteredStudents));
    fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newStudentObj)
    }).catch(() => {});

    window.dispatchEvent(new Event('bjjcron_users_updated'));
    window.dispatchEvent(new Event('bjjcron_students_updated'));
    setCurrentUser(newUser);

    return {
      success: true,
      message: `Cadastro realizado com sucesso! Bem-vindo(a) à equipe, ${studentData.name}.`
    };
  };

  const registerTeacherSelfService = (teacherData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    belt?: BeltType;
    degrees?: number;
    specialty?: string;
  }): { success: boolean; message: string } => {
    const cleanEmail = teacherData.email.trim().toLowerCase();

    if (users.some(u => u.email.trim().toLowerCase() === cleanEmail)) {
      return {
        success: false,
        message: 'Este e-mail já possui cadastro no sistema! Para usar o mesmo e-mail em outro perfil (Mestre, Professor ou Aluno), você precisa excluir os dados da conta atual primeiro clicando em "Excluir Conta & Recadastrar".'
      };
    }

    const newTeacherId = `prof-self-${Date.now()}`;
    const newUserId = `user-prof-${Date.now()}`;

    const newUser: User = {
      id: newUserId,
      name: teacherData.name,
      email: cleanEmail,
      role: 'PROFESSOR',
      studentId: newTeacherId,
      phone: teacherData.phone,
      password: teacherData.password,
      approvalStatus: 'APPROVED',
      isActivated: true,
      avatarUrl: DEFAULT_BLACK_GI_AVATAR
    };

    setUsers(prev => [...prev, newUser]);
    const updatedUsers = [...users, newUser];
    localStorage.setItem('bjjcron_users', JSON.stringify(updatedUsers));
    fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    }).then(() => {
      window.dispatchEvent(new Event('bjjcron_users_updated'));
    }).catch(() => {});

    // Add to teachers list
    const savedTeachers = localStorage.getItem('bjjcron_teachers');
    const teachersList = savedTeachers ? JSON.parse(savedTeachers) : [];

    teachersList.push({
      id: newTeacherId,
      name: teacherData.name,
      email: cleanEmail,
      phone: teacherData.phone,
      belt: teacherData.belt || 'PRETA',
      degrees: teacherData.degrees || 1,
      specialty: teacherData.specialty || 'Jiu-Jitsu / No-Gi',
      activeClassesCount: 2,
      avatarUrl: newUser.avatarUrl
    });

    localStorage.setItem('bjjcron_teachers', JSON.stringify(teachersList));
    setCurrentUser(newUser);

    return {
      success: true,
      message: `Cadastro de Professor realizado com sucesso! Bem-vindo(a), Prof. ${teacherData.name}.`
    };
  };

  const registerAdminSelfService = (adminData: {
    name: string;
    academyName: string;
    email: string;
    phone: string;
    password: string;
    belt?: BeltType;
  }): { success: boolean; message: string } => {
    const cleanEmail = adminData.email.trim().toLowerCase();

    if (users.some(u => u.email.trim().toLowerCase() === cleanEmail)) {
      return {
        success: false,
        message: 'Este e-mail já possui cadastro no sistema! Para usar o mesmo e-mail em outro perfil (Mestre, Professor ou Aluno), você precisa excluir os dados da conta atual primeiro clicando em "Excluir Conta & Recadastrar".'
      };
    }

    const newUserId = `user-admin-${Date.now()}`;

    const newUser: User = {
      id: newUserId,
      name: adminData.name,
      email: cleanEmail,
      role: 'ADMIN',
      phone: adminData.phone,
      password: adminData.password,
      approvalStatus: 'APPROVED',
      isActivated: true,
      avatarUrl: DEFAULT_BLACK_GI_AVATAR
    };

    setUsers(prev => [...prev, newUser]);
    const updatedUsers = [...users, newUser];
    localStorage.setItem('bjjcron_users', JSON.stringify(updatedUsers));
    fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    }).then(() => {
      window.dispatchEvent(new Event('bjjcron_users_updated'));
    }).catch(() => {});

    // Save Academy Config
    if (adminData.academyName) {
      const savedConfig = localStorage.getItem('bjjcron_academy_config');
      const currentConfig = savedConfig ? JSON.parse(savedConfig) : {};
      const updatedConfig = {
        ...currentConfig,
        name: adminData.academyName,
        fantasyName: adminData.academyName,
        ownerName: adminData.name,
        contactEmail: cleanEmail,
        contactPhone: adminData.phone
      };
      localStorage.setItem('bjjcron_academy_config', JSON.stringify(updatedConfig));
    }

    setCurrentUser(newUser);

    return {
      success: true,
      message: `Academia "${adminData.academyName}" e conta de Mestre/Admin cadastradas com sucesso! Bem-vindo, Mestre ${adminData.name}.`
    };
  };

  const approveUser = (identifier: string) => {
    const cleanId = identifier.trim().toLowerCase();

    // Update Users
    setUsers(prev => prev.map(u => {
      if (u.id === identifier || u.studentId === identifier || u.email.toLowerCase() === cleanId) {
        return { ...u, approvalStatus: 'APPROVED', isActivated: true };
      }
      return u;
    }));

    // Update Students
    const savedStudents = localStorage.getItem('bjjcron_students');
    if (savedStudents) {
      const studentsList = JSON.parse(savedStudents);
      const updated = studentsList.map((s: any) => {
        if (s.id === identifier || s.email.toLowerCase() === cleanId) {
          return { ...s, approvalStatus: 'APPROVED', active: true };
        }
        return s;
      });
      localStorage.setItem('bjjcron_students', JSON.stringify(updated));
    }
    fetch('/api/students/' + encodeURIComponent(identifier), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approvalStatus: 'APPROVED', active: true })
    }).catch(() => {});
    window.dispatchEvent(new Event('bjjcron_users_updated'));
    window.dispatchEvent(new Event('bjjcron_students_updated'));
  };

  const rejectUser = (identifier: string) => {
    const cleanId = identifier.trim().toLowerCase();

    // Update Users
    setUsers(prev => prev.map(u => {
      if (u.id === identifier || u.studentId === identifier || u.email.toLowerCase() === cleanId) {
        return { ...u, approvalStatus: 'REJECTED', isActivated: true };
      }
      return u;
    }));

    // Update Students
    const savedStudents = localStorage.getItem('bjjcron_students');
    if (savedStudents) {
      const studentsList = JSON.parse(savedStudents);
      const updated = studentsList.map((s: any) => {
        if (s.id === identifier || s.email.toLowerCase() === cleanId) {
          return { ...s, approvalStatus: 'REJECTED', active: false };
        }
        return s;
      });
      localStorage.setItem('bjjcron_students', JSON.stringify(updated));
    }
    fetch('/api/students/' + encodeURIComponent(identifier), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approvalStatus: 'REJECTED', active: false })
    }).catch(() => {});
    window.dispatchEvent(new Event('bjjcron_users_updated'));
    window.dispatchEvent(new Event('bjjcron_students_updated'));
  };

  const switchRole = (role: UserRole) => {
    const target = users.find(u => u.role === role && u.approvalStatus !== 'PENDING' && u.approvalStatus !== 'REJECTED');
    if (target) {
      setCurrentUser(target);
    }
  };

  const switchUser = (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (target) {
      setCurrentUser(target);
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const deleteMyAccount = (): { success: boolean; message: string } => {
    if (!currentUser) {
      return { success: false, message: 'Nenhum usuário logado para deletar.' };
    }
    const cleanEmail = currentUser.email.trim().toLowerCase();

    // 1. Remove from users list
    const remainingUsers = users.filter(u => u.email.trim().toLowerCase() !== cleanEmail && u.id !== currentUser.id);
    setUsers(remainingUsers);
    localStorage.setItem('bjjcron_users', JSON.stringify(remainingUsers));

    // 2. Remove from students list
    const savedStudents = localStorage.getItem('bjjcron_students');
    if (savedStudents) {
      try {
        const studentsList = JSON.parse(savedStudents);
        const remainingStudents = studentsList.filter((s: any) => 
          s.id !== currentUser.studentId && 
          (!s.email || s.email.trim().toLowerCase() !== cleanEmail)
        );
        localStorage.setItem('bjjcron_students', JSON.stringify(remainingStudents));
      } catch (e) {}
    }

    // 3. Remove from teachers list
    const savedTeachers = localStorage.getItem('bjjcron_teachers');
    if (savedTeachers) {
      try {
        const teachersList = JSON.parse(savedTeachers);
        const remainingTeachers = teachersList.filter((t: any) => 
          t.id !== currentUser.studentId && 
          (!t.email || t.email.trim().toLowerCase() !== cleanEmail)
        );
        localStorage.setItem('bjjcron_teachers', JSON.stringify(remainingTeachers));
      } catch (e) {}
    }

    fetch(`/api/users/${encodeURIComponent(currentUser.id)}`, { method: 'DELETE' }).catch(() => {});
    if (currentUser.studentId) {
      fetch(`/api/students/${encodeURIComponent(currentUser.studentId)}`, { method: 'DELETE' }).catch(() => {});
      fetch(`/api/teachers/${encodeURIComponent(currentUser.studentId)}`, { method: 'DELETE' }).catch(() => {});
    }

    // 4. Logout current user
    setCurrentUser(null);
    localStorage.removeItem('bjjcron_current_user');

    window.dispatchEvent(new Event('bjjcron_users_updated'));
    window.dispatchEvent(new Event('bjjcron_students_updated'));

    return {
      success: true,
      message: 'Conta excluída com sucesso! Agora você pode criar um novo cadastro (como Mestre, Professor ou Aluno) usando o mesmo e-mail.'
    };
  };

  const requestPasswordRecovery = (email: string): { success: boolean; code?: string; message: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const foundUser = users.find(u => u.email.trim().toLowerCase() === cleanEmail);
    if (!foundUser) {
      return {
        success: false,
        message: 'E-mail não encontrado em nosso sistema. Verifique se o endereço foi digitado corretamente.'
      };
    }
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`=========================================`);
    console.log(`📧 [E-MAIL DE RECUPERAÇÃO BJJCRON]`);
    console.log(`Para: ${foundUser.email} (${foundUser.name})`);
    console.log(`Assunto: Seu código de recuperação de senha`);
    console.log(`Código de segurança: ${generatedCode}`);
    console.log(`=========================================`);

    fetch('/api/auth/recover-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: foundUser.email, code: generatedCode, name: foundUser.name })
    }).catch(() => {});

    return {
      success: true,
      code: generatedCode,
      message: `Enviamos um código de verificação de 6 dígitos para o e-mail: ${foundUser.email}`
    };
  };

  const resetPasswordWithCode = (
    email: string,
    code: string,
    expectedCode: string,
    newPassword: string
  ): { success: boolean; message: string } => {
    if (!code || code.trim() !== expectedCode.trim()) {
      return {
        success: false,
        message: 'Código de segurança incorreto. Verifique os números enviados no e-mail.'
      };
    }
    if (!newPassword || newPassword.trim().length < 3) {
      return {
        success: false,
        message: 'A nova senha deve possuir pelo menos 3 caracteres.'
      };
    }

    const cleanEmail = email.trim().toLowerCase();
    const updatedUsers = users.map(u => {
      if (u.email.trim().toLowerCase() === cleanEmail) {
        return {
          ...u,
          password: newPassword,
          isActivated: true
        };
      }
      return u;
    });

    setUsers(updatedUsers);
    localStorage.setItem('bjjcron_users', JSON.stringify(updatedUsers));

    const targetUser = updatedUsers.find(u => u.email.trim().toLowerCase() === cleanEmail);
    if (targetUser) {
      fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(targetUser)
      }).catch(() => {});
    }

    return {
      success: true,
      message: 'Sua senha foi redefinida com sucesso! Você já pode entrar usando sua nova senha.'
    };
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      users,
      loginWithPassword,
      firstAccessActivate,
      registerStudentSelfService,
      registerTeacherSelfService,
      registerAdminSelfService,
      approveUser,
      rejectUser,
      switchRole,
      switchUser,
      logout,
      deleteMyAccount,
      refreshUsersFromStorage,
      requestPasswordRecovery,
      resetPasswordWithCode
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
