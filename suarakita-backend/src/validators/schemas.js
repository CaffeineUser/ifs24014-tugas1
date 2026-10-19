import { z } from 'zod';

const urgency = z.enum(['rendah', 'sedang', 'tinggi', 'kritis']);
const status = z.enum(['diajukan', 'diverifikasi', 'diproses', 'selesai', 'ditolak']);
const positiveId = z.coerce.number().int().positive();

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(72),
}).strict();
export const loginSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(1).max(72),
}).strict();
export const updateProfileSchema = z.object({ name: z.string().trim().min(2).max(100) }).strict();
export const createReportSchema = z.object({
  category_id: positiveId,
  title: z.string().trim().min(5).max(150),
  description: z.string().trim().min(10).max(5000),
  location_name: z.string().trim().min(3).max(300),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  urgency: urgency.default('sedang'),
}).strict();
export const updateReportSchema = z.object({
  category_id: positiveId.optional(),
  title: z.string().trim().min(5).max(150).optional(),
  description: z.string().trim().min(10).max(5000).optional(),
  location_name: z.string().trim().min(3).max(300).optional(),
  latitude: z.coerce.number().min(-90).max(90).nullable().optional(),
  longitude: z.coerce.number().min(-180).max(180).nullable().optional(),
  urgency: urgency.optional(),
}).strict().refine((value) => Object.keys(value).length > 0, { message: 'Minimal satu kolom harus diubah.' });
export const updateStatusSchema = z.object({
  status,
  note: z.string().trim().max(1000).optional(),
}).strict();
export const updateUrgencySchema = z.object({ urgency }).strict();
export const categorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(500).optional(),
}).strict();
export const idParamSchema = z.object({ id: positiveId });
export const reportListSchema = z.object({
  q: z.string().trim().max(150).optional(),
  category_id: positiveId.optional(),
  status: status.optional(),
  urgency: urgency.optional(),
  sort: z.enum(['priority', 'created_at', 'updated_at', 'support_count']).default('priority'),
  order: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
}).strict();
export const paginationSchema = z.object({ page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20) }).strict();
export const categoryIdQuerySchema = z.object({ category_id: positiveId.optional() }).strict();
