import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const SetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(6),
});

export const CreateEmployeeSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  entityCode: z.enum(['EHM', 'CAG']),
  departmentCode: z.enum(['MAR', 'DEV', 'OPS', 'HR', 'FIN']),
  designation: z.string().min(1),
  salary: z.number().positive(),
  role: z.enum(['ADMIN', 'MANAGER', 'EMPLOYEE']),
});

export const CreateTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  entityCode: z.enum(['EHM', 'CAG']),
  departmentCode: z.enum(['MAR', 'DEV', 'OPS', 'HR', 'FIN']),
  sprintWeek: z.string().min(1),
  assigneeIds: z.array(z.string().uuid()).min(1),
  reviewingLeadId: z.string().uuid().optional(),
  deliverableUrl: z.string().url().optional().or(z.literal('')),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  dueDate: z.string(),
  parentTaskId: z.string().uuid().optional(),
  dependencyTaskId: z.string().uuid().optional(),
});

export const CreateMeetingSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  startTime: z.string(),
  endTime: z.string(),
  location: z.string().default('Google Meet'),
  inviteeIds: z.array(z.string().uuid()),
});

export const ClockInSchema = z.object({
  workMode: z.enum(['IN_OFFICE', 'REMOTE', 'HYBRID']),
});

export const CreateApplicationSchema = z.object({
  type: z.enum(['REMOTE_WORK', 'REIMBURSEMENT', 'EQUIPMENT']),
  reason: z.string().min(1),
});

export const CreateAnnouncementSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  priority: z.enum(['NORMAL', 'IMPORTANT', 'URGENT']),
  isPinned: z.boolean().default(false),
  targetEntityCode: z.enum(['EHM', 'CAG']).optional(),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type SetPasswordInput = z.infer<typeof SetPasswordSchema>;
export type CreateEmployeeInput = z.infer<typeof CreateEmployeeSchema>;
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type CreateMeetingInput = z.infer<typeof CreateMeetingSchema>;
export type ClockInInput = z.infer<typeof ClockInSchema>;
export type CreateApplicationInput = z.infer<typeof CreateApplicationSchema>;
export type CreateAnnouncementInput = z.infer<typeof CreateAnnouncementSchema>;
