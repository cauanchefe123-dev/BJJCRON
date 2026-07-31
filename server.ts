import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './src/db/index.ts';
import * as schema from './src/db/schema.ts';
import { eq, desc } from 'drizzle-orm';
import {
  INITIAL_STUDENTS,
  INITIAL_TEACHERS,
  INITIAL_CLASSES,
  INITIAL_ATTENDANCE,
  INITIAL_PAYMENTS,
  INITIAL_BELT_REQUESTS,
  INITIAL_TRAINING_LOGS,
  INITIAL_TEACHER_OBSERVATIONS,
  INITIAL_ACADEMY_CONFIG,
} from './src/data/mockData.ts';

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // CORS headers for local development and iframe preview
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    next();
  });

  // Health Check Endpoint
  app.get('/api/health', async (req, res) => {
    try {
      // Try a simple select to ensure DB connection
      const count = await db.select().from(schema.academies).limit(1);
      res.json({ status: 'ok', database: 'connected', postgres: true });
    } catch (error: any) {
      console.warn('Database check warning on /api/health:', error?.message);
      res.json({ status: 'ok', database: 'fallback_or_disconnected', error: error?.message });
    }
  });

  // ==========================================
  // ACADEMY CONFIG ENDPOINTS
  // ==========================================
  app.get('/api/academy-config', async (req, res) => {
    try {
      const records = await db.select().from(schema.academies).limit(1);
      if (records.length > 0) {
        const row = records[0];
        res.json({
          name: row.name,
          fantasyName: row.fantasyName,
          cnpj: row.cnpj || '',
          headCoachName: row.headCoachName || '',
          headCoachBelt: (row.headCoachBelt || 'PRETA') as any,
          phone: row.phone || '',
          email: row.email || '',
          address: row.address || '',
          logoUrl: row.logoUrl || '',
          pixKey: row.pixKey || '',
          graduationCriteria: INITIAL_ACADEMY_CONFIG.graduationCriteria,
          supabaseConfig: INITIAL_ACADEMY_CONFIG.supabaseConfig,
        });
      } else {
        // Seed default academy if empty
        const [inserted] = await db.insert(schema.academies).values({
          name: INITIAL_ACADEMY_CONFIG.name,
          fantasyName: INITIAL_ACADEMY_CONFIG.fantasyName,
          cnpj: INITIAL_ACADEMY_CONFIG.cnpj,
          headCoachName: INITIAL_ACADEMY_CONFIG.headCoachName,
          headCoachBelt: INITIAL_ACADEMY_CONFIG.headCoachBelt,
          phone: INITIAL_ACADEMY_CONFIG.phone,
          email: INITIAL_ACADEMY_CONFIG.email,
          address: INITIAL_ACADEMY_CONFIG.address,
          logoUrl: INITIAL_ACADEMY_CONFIG.logoUrl,
          pixKey: INITIAL_ACADEMY_CONFIG.pixKey,
        }).returning();

        res.json({
          name: inserted.name,
          fantasyName: inserted.fantasyName,
          cnpj: inserted.cnpj || '',
          headCoachName: inserted.headCoachName || '',
          headCoachBelt: (inserted.headCoachBelt || 'PRETA') as any,
          phone: inserted.phone || '',
          email: inserted.email || '',
          address: inserted.address || '',
          logoUrl: inserted.logoUrl || '',
          pixKey: inserted.pixKey || '',
          graduationCriteria: INITIAL_ACADEMY_CONFIG.graduationCriteria,
          supabaseConfig: INITIAL_ACADEMY_CONFIG.supabaseConfig,
        });
      }
    } catch (err: any) {
      console.warn('Error fetching /api/academy-config from Postgres:', err?.message);
      res.json(INITIAL_ACADEMY_CONFIG);
    }
  });

  app.put('/api/academy-config', async (req, res) => {
    try {
      const data = req.body;
      const records = await db.select().from(schema.academies).limit(1);
      if (records.length > 0) {
        await db.update(schema.academies)
          .set({
            name: data.name,
            fantasyName: data.fantasyName,
            cnpj: data.cnpj,
            headCoachName: data.headCoachName,
            headCoachBelt: data.headCoachBelt,
            phone: data.phone,
            email: data.email,
            address: data.address,
            logoUrl: data.logoUrl,
            pixKey: data.pixKey,
          })
          .where(eq(schema.academies.id, records[0].id));
      } else {
        await db.insert(schema.academies).values({
          name: data.name,
          fantasyName: data.fantasyName,
          cnpj: data.cnpj,
          headCoachName: data.headCoachName,
          headCoachBelt: data.headCoachBelt,
          phone: data.phone,
          email: data.email,
          address: data.address,
          logoUrl: data.logoUrl,
          pixKey: data.pixKey,
        });
      }
      res.json({ success: true, config: data });
    } catch (err: any) {
      console.error('Error updating academy config:', err?.message);
      res.status(500).json({ error: 'Failed to save to database' });
    }
  });

  // ==========================================
  // STUDENTS ENDPOINTS
  // ==========================================
  app.get('/api/students', async (req, res) => {
    try {
      const all = await db.select().from(schema.students).orderBy(desc(schema.students.id));
      if (all.length === 0) {
        // Automatically seed sample students if table is empty
        for (const s of INITIAL_STUDENTS) {
          await db.insert(schema.students).values({
            registrationNumber: s.registrationNumber,
            name: s.name,
            email: s.email,
            phone: s.phone,
            cpf: s.cpf,
            birthDate: s.birthDate,
            photoUrl: s.photoUrl,
            belt: s.belt,
            stripes: s.stripes,
            startDate: s.startDate,
            totalClassesAttended: s.totalClassesAttended,
            classesSinceLastGraduation: s.classesSinceLastGraduation,
            weightCategory: s.weightCategory,
            ageCategory: s.ageCategory,
            active: s.active,
            notes: s.notes,
            emergencyContact: s.emergencyContact,
            planName: s.planName,
            planPrice: s.planPrice,
            paymentDueDateDay: s.paymentDueDateDay,
            paymentStatus: s.paymentStatus,
            lastPaymentDate: s.lastPaymentDate,
            qrCodeToken: s.qrCodeToken,
          }).onConflictDoNothing();
        }
        const seeded = await db.select().from(schema.students).orderBy(desc(schema.students.id));
        return res.json(seeded.map(formatStudentFromDb));
      }
      res.json(all.map(formatStudentFromDb));
    } catch (err: any) {
      console.warn('Postgres /api/students fallback:', err?.message);
      res.json(INITIAL_STUDENTS);
    }
  });

  app.post('/api/students', async (req, res) => {
    try {
      const s = req.body;
      const [inserted] = await db.insert(schema.students).values({
        registrationNumber: s.registrationNumber || `BJJ-${Date.now()}`,
        name: s.name,
        email: s.email,
        phone: s.phone || '',
        cpf: s.cpf || '',
        birthDate: s.birthDate || '',
        photoUrl: s.photoUrl || '',
        belt: s.belt || 'BRANCA',
        stripes: s.stripes || 0,
        startDate: s.startDate || new Date().toISOString().split('T')[0],
        totalClassesAttended: s.totalClassesAttended || 0,
        classesSinceLastGraduation: s.classesSinceLastGraduation || 0,
        weightCategory: s.weightCategory || 'MÉDIO',
        ageCategory: s.ageCategory || 'ADULTO',
        active: s.active ?? true,
        notes: s.notes || '',
        emergencyContact: s.emergencyContact || '',
        planName: s.planName || 'Mensal Padrão',
        planPrice: s.planPrice || 150,
        paymentDueDateDay: s.paymentDueDateDay || 10,
        paymentStatus: s.paymentStatus || 'PAGO',
        lastPaymentDate: s.lastPaymentDate || '',
        qrCodeToken: s.qrCodeToken || `token-${Date.now()}`,
      }).returning();
      res.json(formatStudentFromDb(inserted));
    } catch (err: any) {
      console.error('Error creating student in Postgres:', err?.message);
      res.status(500).json({ error: err?.message || 'Failed to create student' });
    }
  });

  app.put('/api/students/:id', async (req, res) => {
    try {
      const idStr = req.params.id;
      const idNum = parseInt(idStr, 10);
      const updates = req.body;
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.email !== undefined) dbUpdates.email = updates.email;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
      if (updates.cpf !== undefined) dbUpdates.cpf = updates.cpf;
      if (updates.birthDate !== undefined) dbUpdates.birthDate = updates.birthDate;
      if (updates.photoUrl !== undefined) dbUpdates.photoUrl = updates.photoUrl;
      if (updates.belt !== undefined) dbUpdates.belt = updates.belt;
      if (updates.stripes !== undefined) dbUpdates.stripes = updates.stripes;
      if (updates.startDate !== undefined) dbUpdates.startDate = updates.startDate;
      if (updates.totalClassesAttended !== undefined) dbUpdates.totalClassesAttended = updates.totalClassesAttended;
      if (updates.classesSinceLastGraduation !== undefined) dbUpdates.classesSinceLastGraduation = updates.classesSinceLastGraduation;
      if (updates.weightCategory !== undefined) dbUpdates.weightCategory = updates.weightCategory;
      if (updates.ageCategory !== undefined) dbUpdates.ageCategory = updates.ageCategory;
      if (updates.active !== undefined) dbUpdates.active = updates.active;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      if (updates.emergencyContact !== undefined) dbUpdates.emergencyContact = updates.emergencyContact;
      if (updates.planName !== undefined) dbUpdates.planName = updates.planName;
      if (updates.planPrice !== undefined) dbUpdates.planPrice = updates.planPrice;
      if (updates.paymentDueDateDay !== undefined) dbUpdates.paymentDueDateDay = updates.paymentDueDateDay;
      if (updates.paymentStatus !== undefined) dbUpdates.paymentStatus = updates.paymentStatus;
      if (updates.lastPaymentDate !== undefined) dbUpdates.lastPaymentDate = updates.lastPaymentDate;

      if (!isNaN(idNum)) {
        await db.update(schema.students).set(dbUpdates).where(eq(schema.students.id, idNum));
      } else {
        await db.update(schema.students).set(dbUpdates).where(eq(schema.students.registrationNumber, idStr));
      }
      res.json({ success: true });
    } catch (err: any) {
      console.error('Error updating student:', err?.message);
      res.status(500).json({ error: err?.message });
    }
  });

  app.delete('/api/students/:id', async (req, res) => {
    try {
      const idStr = req.params.id;
      const idNum = parseInt(idStr, 10);
      if (!isNaN(idNum)) {
        await db.delete(schema.students).where(eq(schema.students.id, idNum));
      } else {
        await db.delete(schema.students).where(eq(schema.students.registrationNumber, idStr));
      }
      res.json({ success: true });
    } catch (err: any) {
      console.error('Error deleting student:', err?.message);
      res.status(500).json({ error: err?.message });
    }
  });

  // ==========================================
  // TEACHERS ENDPOINTS
  // ==========================================
  app.get('/api/teachers', async (req, res) => {
    try {
      const all = await db.select().from(schema.teachers).orderBy(desc(schema.teachers.id));
      if (all.length === 0) {
        for (const t of INITIAL_TEACHERS) {
          await db.insert(schema.teachers).values({
            name: t.name,
            email: t.email,
            phone: t.phone,
            belt: t.belt,
            degrees: t.degrees,
            specialty: t.specialty,
            cref: t.cref,
            photoUrl: t.photoUrl,
            bio: t.bio,
            active: t.active,
            startDate: t.startDate,
          }).onConflictDoNothing();
        }
        const seeded = await db.select().from(schema.teachers).orderBy(desc(schema.teachers.id));
        return res.json(seeded.map(formatTeacherFromDb));
      }
      res.json(all.map(formatTeacherFromDb));
    } catch (err: any) {
      console.warn('Postgres /api/teachers fallback:', err?.message);
      res.json(INITIAL_TEACHERS);
    }
  });

  app.post('/api/teachers', async (req, res) => {
    try {
      const t = req.body;
      const [inserted] = await db.insert(schema.teachers).values({
        name: t.name,
        email: t.email,
        phone: t.phone || '',
        belt: t.belt || 'PRETA',
        degrees: t.degrees || 0,
        specialty: t.specialty || 'BJJ',
        cref: t.cref || '',
        photoUrl: t.photoUrl || '',
        bio: t.bio || '',
        active: t.active ?? true,
        startDate: t.startDate || new Date().toISOString().split('T')[0],
      }).returning();
      res.json(formatTeacherFromDb(inserted));
    } catch (err: any) {
      res.status(500).json({ error: err?.message });
    }
  });

  app.put('/api/teachers/:id', async (req, res) => {
    try {
      const idNum = parseInt(req.params.id, 10);
      const updates = req.body;
      if (!isNaN(idNum)) {
        await db.update(schema.teachers).set(updates).where(eq(schema.teachers.id, idNum));
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err?.message });
    }
  });

  app.delete('/api/teachers/:id', async (req, res) => {
    try {
      const idNum = parseInt(req.params.id, 10);
      if (!isNaN(idNum)) {
        await db.delete(schema.teachers).where(eq(schema.teachers.id, idNum));
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err?.message });
    }
  });

  // ==========================================
  // CLASSES ENDPOINTS
  // ==========================================
  app.get('/api/classes', async (req, res) => {
    try {
      const all = await db.select().from(schema.classes);
      if (all.length === 0) {
        for (const c of INITIAL_CLASSES) {
          await db.insert(schema.classes).values({
            title: c.title,
            professorId: c.professorId,
            professorName: c.professorName,
            daysOfWeek: JSON.stringify(c.daysOfWeek),
            time: c.time,
            durationMinutes: c.durationMinutes,
            category: c.category,
            maxCapacity: c.maxCapacity,
            active: c.active,
            description: c.description,
          }).onConflictDoNothing();
        }
        const seeded = await db.select().from(schema.classes);
        return res.json(seeded.map(formatClassFromDb));
      }
      res.json(all.map(formatClassFromDb));
    } catch (err: any) {
      res.json(INITIAL_CLASSES);
    }
  });

  app.post('/api/classes', async (req, res) => {
    try {
      const c = req.body;
      const [inserted] = await db.insert(schema.classes).values({
        title: c.title,
        professorId: c.professorId || '1',
        professorName: c.professorName || 'Mestre',
        daysOfWeek: JSON.stringify(c.daysOfWeek || [1, 3, 5]),
        time: c.time || '19:00',
        durationMinutes: c.durationMinutes || 90,
        category: c.category || 'FUNDAMENTAL',
        maxCapacity: c.maxCapacity || 30,
        active: c.active ?? true,
        description: c.description || '',
      }).returning();
      res.json(formatClassFromDb(inserted));
    } catch (err: any) {
      res.status(500).json({ error: err?.message });
    }
  });

  app.delete('/api/classes/:id', async (req, res) => {
    try {
      const idNum = parseInt(req.params.id, 10);
      if (!isNaN(idNum)) {
        await db.delete(schema.classes).where(eq(schema.classes.id, idNum));
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err?.message });
    }
  });

  // ==========================================
  // ATTENDANCES ENDPOINTS
  // ==========================================
  app.get('/api/attendances', async (req, res) => {
    try {
      const all = await db.select().from(schema.attendances).orderBy(desc(schema.attendances.id));
      if (all.length === 0) {
        for (const a of INITIAL_ATTENDANCE) {
          await db.insert(schema.attendances).values({
            studentId: a.studentId,
            studentName: a.studentName,
            classId: a.classId,
            className: a.className,
            date: a.date,
            timestamp: a.timestamp,
            method: a.method,
            verifiedBy: a.verifiedBy,
          }).onConflictDoNothing();
        }
        const seeded = await db.select().from(schema.attendances).orderBy(desc(schema.attendances.id));
        return res.json(seeded.map(formatAttendanceFromDb));
      }
      res.json(all.map(formatAttendanceFromDb));
    } catch (err: any) {
      res.json(INITIAL_ATTENDANCE);
    }
  });

  app.post('/api/attendances', async (req, res) => {
    try {
      const a = req.body;
      const [inserted] = await db.insert(schema.attendances).values({
        studentId: a.studentId,
        studentName: a.studentName,
        classId: a.classId,
        className: a.className,
        date: a.date || new Date().toISOString().split('T')[0],
        timestamp: a.timestamp || new Date().toLocaleTimeString(),
        method: a.method || 'QR_CODE_STUDENT',
        verifiedBy: a.verifiedBy || '',
      }).returning();
      res.json(formatAttendanceFromDb(inserted));
    } catch (err: any) {
      res.status(500).json({ error: err?.message });
    }
  });

  // ==========================================
  // PAYMENTS ENDPOINTS
  // ==========================================
  app.get('/api/payments', async (req, res) => {
    try {
      const all = await db.select().from(schema.payments).orderBy(desc(schema.payments.id));
      if (all.length === 0) {
        for (const p of INITIAL_PAYMENTS) {
          await db.insert(schema.payments).values({
            studentId: p.studentId,
            studentName: p.studentName,
            amount: p.amount,
            dueDate: p.dueDate,
            paymentDate: p.paymentDate,
            status: p.status,
            paymentMethod: p.paymentMethod,
            referenceMonth: p.referenceMonth,
            receiptUrl: p.receiptUrl,
            pixCode: p.pixCode,
          }).onConflictDoNothing();
        }
        const seeded = await db.select().from(schema.payments).orderBy(desc(schema.payments.id));
        return res.json(seeded.map(formatPaymentFromDb));
      }
      res.json(all.map(formatPaymentFromDb));
    } catch (err: any) {
      res.json(INITIAL_PAYMENTS);
    }
  });

  app.post('/api/payments', async (req, res) => {
    try {
      const p = req.body;
      const [inserted] = await db.insert(schema.payments).values({
        studentId: p.studentId,
        studentName: p.studentName,
        amount: p.amount,
        dueDate: p.dueDate,
        paymentDate: p.paymentDate || '',
        status: p.status || 'PENDENTE',
        paymentMethod: p.paymentMethod || 'PIX',
        referenceMonth: p.referenceMonth,
        receiptUrl: p.receiptUrl || '',
        pixCode: p.pixCode || '',
      }).returning();
      res.json(formatPaymentFromDb(inserted));
    } catch (err: any) {
      res.status(500).json({ error: err?.message });
    }
  });

  app.put('/api/payments/:id', async (req, res) => {
    try {
      const idNum = parseInt(req.params.id, 10);
      const updates = req.body;
      if (!isNaN(idNum)) {
        await db.update(schema.payments).set(updates).where(eq(schema.payments.id, idNum));
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err?.message });
    }
  });

  // ==========================================
  // BELT REQUESTS ENDPOINTS
  // ==========================================
  app.get('/api/belt-requests', async (req, res) => {
    try {
      const all = await db.select().from(schema.beltRequests).orderBy(desc(schema.beltRequests.id));
      if (all.length === 0) {
        for (const b of INITIAL_BELT_REQUESTS) {
          await db.insert(schema.beltRequests).values({
            studentId: b.studentId,
            studentName: b.studentName,
            currentBelt: b.currentBelt,
            currentStripes: b.currentStripes,
            requestedBelt: b.requestedBelt,
            requestedStripes: b.requestedStripes,
            requestDate: b.requestDate,
            notes: b.notes,
            status: b.status,
            reviewedBy: (b as any).reviewedBy || null,
            reviewedAt: (b as any).reviewedAt || null,
          }).onConflictDoNothing();
        }
        const seeded = await db.select().from(schema.beltRequests).orderBy(desc(schema.beltRequests.id));
        return res.json(seeded.map(formatBeltRequestFromDb));
      }
      res.json(all.map(formatBeltRequestFromDb));
    } catch (err: any) {
      res.json(INITIAL_BELT_REQUESTS);
    }
  });

  app.post('/api/belt-requests', async (req, res) => {
    try {
      const b = req.body;
      const [inserted] = await db.insert(schema.beltRequests).values({
        studentId: b.studentId,
        studentName: b.studentName,
        currentBelt: b.currentBelt,
        currentStripes: b.currentStripes,
        requestedBelt: b.requestedBelt,
        requestedStripes: b.requestedStripes,
        requestDate: b.requestDate || new Date().toISOString().split('T')[0],
        notes: b.notes || '',
        status: b.status || 'PENDING',
      }).returning();
      res.json(formatBeltRequestFromDb(inserted));
    } catch (err: any) {
      res.status(500).json({ error: err?.message });
    }
  });

  app.put('/api/belt-requests/:id', async (req, res) => {
    try {
      const idNum = parseInt(req.params.id, 10);
      const updates = req.body;
      if (!isNaN(idNum)) {
        await db.update(schema.beltRequests).set(updates).where(eq(schema.beltRequests.id, idNum));
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err?.message });
    }
  });

  // ==========================================
  // TRAINING LOGS ENDPOINTS
  // ==========================================
  app.get('/api/training-logs', async (req, res) => {
    try {
      const all = await db.select().from(schema.trainingLogs).orderBy(desc(schema.trainingLogs.id));
      if (all.length === 0) {
        for (const l of INITIAL_TRAINING_LOGS) {
          await db.insert(schema.trainingLogs).values({
            studentId: l.studentId,
            date: l.date,
            durationMinutes: l.durationMinutes,
            techniquesLearned: JSON.stringify(l.techniquesLearned),
            roundsCount: l.roundsCount,
            notes: l.notes,
            moodRating: l.moodRating,
          }).onConflictDoNothing();
        }
        const seeded = await db.select().from(schema.trainingLogs).orderBy(desc(schema.trainingLogs.id));
        return res.json(seeded.map(formatTrainingLogFromDb));
      }
      res.json(all.map(formatTrainingLogFromDb));
    } catch (err: any) {
      res.json(INITIAL_TRAINING_LOGS);
    }
  });

  app.post('/api/training-logs', async (req, res) => {
    try {
      const l = req.body;
      const [inserted] = await db.insert(schema.trainingLogs).values({
        studentId: l.studentId,
        date: l.date || new Date().toISOString().split('T')[0],
        durationMinutes: l.durationMinutes || 60,
        techniquesLearned: JSON.stringify(l.techniquesLearned || []),
        roundsCount: l.roundsCount || 4,
        notes: l.notes || '',
        moodRating: l.moodRating || 5,
      }).returning();
      res.json(formatTrainingLogFromDb(inserted));
    } catch (err: any) {
      res.status(500).json({ error: err?.message });
    }
  });

  // ==========================================
  // TEACHER OBSERVATIONS ENDPOINTS
  // ==========================================
  app.get('/api/teacher-observations', async (req, res) => {
    try {
      const all = await db.select().from(schema.teacherObservations).orderBy(desc(schema.teacherObservations.id));
      if (all.length === 0) {
        for (const o of INITIAL_TEACHER_OBSERVATIONS) {
          await db.insert(schema.teacherObservations).values({
            studentId: o.studentId,
            studentName: o.studentName || '',
            teacherId: o.teacherId,
            teacherName: o.teacherName,
            date: o.date,
            title: o.title,
            content: o.content,
            category: o.category,
          }).onConflictDoNothing();
        }
        const seeded = await db.select().from(schema.teacherObservations).orderBy(desc(schema.teacherObservations.id));
        return res.json(seeded.map(formatObservationFromDb));
      }
      res.json(all.map(formatObservationFromDb));
    } catch (err: any) {
      res.json(INITIAL_TEACHER_OBSERVATIONS);
    }
  });

  app.post('/api/teacher-observations', async (req, res) => {
    try {
      const o = req.body;
      const [inserted] = await db.insert(schema.teacherObservations).values({
        studentId: o.studentId,
        studentName: o.studentName || '',
        teacherId: o.teacherId,
        teacherName: o.teacherName,
        date: o.date || new Date().toISOString().split('T')[0],
        title: o.title,
        content: o.content,
        category: o.category || 'GERAL',
      }).returning();
      res.json(formatObservationFromDb(inserted));
    } catch (err: any) {
      res.status(500).json({ error: err?.message });
    }
  });

  app.delete('/api/teacher-observations/:id', async (req, res) => {
    try {
      const idNum = parseInt(req.params.id, 10);
      if (!isNaN(idNum)) {
        await db.delete(schema.teacherObservations).where(eq(schema.teacherObservations.id, idNum));
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err?.message });
    }
  });

  // ==========================================
  // RESET / CLEAR ENDPOINTS
  // ==========================================
  app.post('/api/reset-data', async (req, res) => {
    try {
      await db.delete(schema.attendances);
      await db.delete(schema.payments);
      await db.delete(schema.beltRequests);
      await db.delete(schema.trainingLogs);
      await db.delete(schema.teacherObservations);
      await db.delete(schema.classes);
      await db.delete(schema.students);
      await db.delete(schema.teachers);

      // Re-seed all tables
      for (const s of INITIAL_STUDENTS) {
        await db.insert(schema.students).values({
          registrationNumber: s.registrationNumber,
          name: s.name, email: s.email, phone: s.phone, cpf: s.cpf,
          birthDate: s.birthDate, photoUrl: s.photoUrl, belt: s.belt,
          stripes: s.stripes, startDate: s.startDate,
          totalClassesAttended: s.totalClassesAttended,
          classesSinceLastGraduation: s.classesSinceLastGraduation,
          weightCategory: s.weightCategory, ageCategory: s.ageCategory,
          active: s.active, notes: s.notes, emergencyContact: s.emergencyContact,
          planName: s.planName, planPrice: s.planPrice,
          paymentDueDateDay: s.paymentDueDateDay, paymentStatus: s.paymentStatus,
          lastPaymentDate: s.lastPaymentDate, qrCodeToken: s.qrCodeToken,
        }).onConflictDoNothing();
      }
      for (const t of INITIAL_TEACHERS) {
        await db.insert(schema.teachers).values({
          name: t.name, email: t.email, phone: t.phone, belt: t.belt,
          degrees: t.degrees, specialty: t.specialty, cref: t.cref,
          photoUrl: t.photoUrl, bio: t.bio, active: t.active, startDate: t.startDate,
        }).onConflictDoNothing();
      }
      for (const c of INITIAL_CLASSES) {
        await db.insert(schema.classes).values({
          title: c.title, professorId: c.professorId, professorName: c.professorName,
          daysOfWeek: JSON.stringify(c.daysOfWeek), time: c.time,
          durationMinutes: c.durationMinutes, category: c.category,
          maxCapacity: c.maxCapacity, active: c.active, description: c.description,
        }).onConflictDoNothing();
      }
      for (const a of INITIAL_ATTENDANCE) {
        await db.insert(schema.attendances).values({
          studentId: a.studentId, studentName: a.studentName, classId: a.classId,
          className: a.className, date: a.date, timestamp: a.timestamp,
          method: a.method, verifiedBy: a.verifiedBy,
        }).onConflictDoNothing();
      }
      for (const p of INITIAL_PAYMENTS) {
        await db.insert(schema.payments).values({
          studentId: p.studentId, studentName: p.studentName, amount: p.amount,
          dueDate: p.dueDate, paymentDate: p.paymentDate, status: p.status,
          paymentMethod: p.paymentMethod, referenceMonth: p.referenceMonth,
          receiptUrl: p.receiptUrl, pixCode: p.pixCode,
        }).onConflictDoNothing();
      }

      res.json({ success: true, message: 'All tables reset to default BJJCRON data' });
    } catch (err: any) {
      console.error('Error in /api/reset-data:', err?.message);
      res.status(500).json({ error: err?.message });
    }
  });

  app.post('/api/clear-all-data', async (req, res) => {
    try {
      await db.delete(schema.attendances);
      await db.delete(schema.payments);
      await db.delete(schema.beltRequests);
      await db.delete(schema.trainingLogs);
      await db.delete(schema.teacherObservations);
      await db.delete(schema.classes);
      await db.delete(schema.students);
      await db.delete(schema.teachers);
      res.json({ success: true, message: 'All tables emptied (Zero tests/robots)' });
    } catch (err: any) {
      console.error('Error in /api/clear-all-data:', err?.message);
      res.status(500).json({ error: err?.message });
    }
  });

  // Vite Middleware or Static Production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BJJCRON Server running on http://0.0.0.0:${PORT} (PostgreSQL + Express)`);
  });
}

// Helpers for Drizzle -> Frontend types formatting
function formatStudentFromDb(row: any) {
  return {
    id: String(row.id),
    registrationNumber: row.registrationNumber,
    name: row.name,
    email: row.email,
    phone: row.phone || '',
    cpf: row.cpf || '',
    birthDate: row.birthDate || '',
    photoUrl: row.photoUrl || '',
    belt: row.belt as any,
    stripes: row.stripes || 0,
    startDate: row.startDate || '',
    totalClassesAttended: row.totalClassesAttended || 0,
    classesSinceLastGraduation: row.classesSinceLastGraduation || 0,
    weightCategory: row.weightCategory || 'MÉDIO',
    ageCategory: row.ageCategory || 'ADULTO',
    active: row.active ?? true,
    notes: row.notes || '',
    emergencyContact: row.emergencyContact || '',
    planName: row.planName || 'Mensal Padrão',
    planPrice: row.planPrice || 150,
    paymentDueDateDay: row.paymentDueDateDay || 10,
    paymentStatus: row.paymentStatus || 'PAGO',
    lastPaymentDate: row.lastPaymentDate || '',
    qrCodeToken: row.qrCodeToken || '',
  };
}

function formatTeacherFromDb(row: any) {
  return {
    id: String(row.id),
    name: row.name,
    email: row.email,
    phone: row.phone || '',
    belt: row.belt as any,
    degrees: row.degrees || 0,
    specialty: row.specialty || '',
    cref: row.cref || '',
    photoUrl: row.photoUrl || '',
    bio: row.bio || '',
    active: row.active ?? true,
    startDate: row.startDate || '',
  };
}

function formatClassFromDb(row: any) {
  let days: number[] = [1, 3, 5];
  try {
    if (typeof row.daysOfWeek === 'string') {
      days = JSON.parse(row.daysOfWeek);
    } else if (Array.isArray(row.daysOfWeek)) {
      days = row.daysOfWeek;
    }
  } catch (e) {}
  return {
    id: String(row.id),
    title: row.title,
    professorId: row.professorId,
    professorName: row.professorName,
    daysOfWeek: days,
    time: row.time,
    durationMinutes: row.durationMinutes,
    category: row.category as any,
    maxCapacity: row.maxCapacity,
    active: row.active ?? true,
    description: row.description || '',
  };
}

function formatAttendanceFromDb(row: any) {
  return {
    id: String(row.id),
    studentId: row.studentId,
    studentName: row.studentName,
    classId: row.classId,
    className: row.className,
    date: row.date,
    timestamp: row.timestamp,
    method: row.method as any,
    verifiedBy: row.verifiedBy || '',
  };
}

function formatPaymentFromDb(row: any) {
  return {
    id: String(row.id),
    studentId: row.studentId,
    studentName: row.studentName,
    amount: row.amount,
    dueDate: row.dueDate,
    paymentDate: row.paymentDate || '',
    status: row.status as any,
    paymentMethod: row.paymentMethod as any,
    referenceMonth: row.referenceMonth,
    receiptUrl: row.receiptUrl || '',
    pixCode: row.pixCode || '',
  };
}

function formatBeltRequestFromDb(row: any) {
  return {
    id: String(row.id),
    studentId: row.studentId,
    studentName: row.studentName,
    currentBelt: row.currentBelt as any,
    currentStripes: row.currentStripes || 0,
    requestedBelt: row.requestedBelt as any,
    requestedStripes: row.requestedStripes || 0,
    requestDate: row.requestDate,
    notes: row.notes || '',
    status: row.status as any,
    reviewedBy: row.reviewedBy || '',
    reviewedAt: row.reviewedAt || '',
  };
}

function formatTrainingLogFromDb(row: any) {
  let techniques: string[] = [];
  try {
    if (typeof row.techniquesLearned === 'string') {
      techniques = JSON.parse(row.techniquesLearned);
    } else if (Array.isArray(row.techniquesLearned)) {
      techniques = row.techniquesLearned;
    }
  } catch (e) {}
  return {
    id: String(row.id),
    studentId: row.studentId,
    date: row.date,
    durationMinutes: row.durationMinutes,
    techniquesLearned: techniques,
    roundsCount: row.roundsCount || 4,
    notes: row.notes || '',
    moodRating: row.moodRating || 5,
  };
}

function formatObservationFromDb(row: any) {
  return {
    id: String(row.id),
    studentId: row.studentId,
    studentName: row.studentName || '',
    teacherId: row.teacherId,
    teacherName: row.teacherName,
    date: row.date,
    title: row.title,
    content: row.content,
    category: row.category as any,
  };
}

startServer();
