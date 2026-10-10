import { z } from 'zod';
import { sanitizeText } from './sanitize.js';

export const USER_TYPES = ['Student', 'Customer', 'Other'];
export const STATUSES = ['New', 'Contacted', 'In Progress', 'Closed'];

const clean = (min, max, label) =>
  z
    .string({ required_error: `${label} is required`, invalid_type_error: `${label} must be text` })
    .transform(sanitizeText)
    .pipe(
      z
        .string()
        .min(min, min === 1 ? `${label} is required` : `${label} must be at least ${min} characters`)
        .max(max, `${label} must be at most ${max} characters`),
    );

const phone = z
  .string({ required_error: 'Phone number is required', invalid_type_error: 'Phone number must be text' })
  .transform((v) => v.trim())
  .pipe(
    z
      .string()
      .min(1, 'Phone number is required')
      .regex(/^\+?[0-9\s-]{10,16}$/, 'Enter a valid phone number (10-13 digits)')
      .refine((v) => {
        const digits = v.replace(/\D/g, '').length;
        return digits >= 10 && digits <= 13;
      }, 'Enter a valid phone number (10-13 digits)'),
  );

const email = z
  .string({ required_error: 'Email is required', invalid_type_error: 'Email must be text' })
  .transform((v) => v.trim().toLowerCase())
  .pipe(z.string().min(1, 'Email is required').max(150, 'Email is too long').email('Enter a valid email address'));

const userType = z.enum(USER_TYPES, {
  errorMap: () => ({ message: 'Choose Student, Customer or Other' }),
});

export const createEnquirySchema = z.object({
  name: clean(2, 100, 'Name'),
  email,
  phone,
  userType,
  interest: clean(1, 150, 'Service or course of interest'),
  message: clean(5, 2000, 'Message'),
  source: z.enum(['form', 'chatbot']).optional().default('form'),
});

export const updateEnquirySchema = z
  .object({
    name: clean(2, 100, 'Name'),
    email,
    phone,
    userType,
    interest: clean(1, 150, 'Service or course of interest'),
    message: clean(5, 2000, 'Message'),
    status: z.enum(STATUSES, { errorMap: () => ({ message: `Status must be one of: ${STATUSES.join(', ')}` }) }),
  })
  .partial()
  .refine((obj) => Object.keys(obj).length > 0, { message: 'Send at least one field to update' });

export const listQuerySchema = z.object({
  search: z.string().optional().default('').transform((v) => sanitizeText(v).slice(0, 100)),
  userType: z.enum(USER_TYPES).optional(),
  status: z.enum(STATUSES).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  sort: z.enum(['newest', 'oldest', 'name']).optional().default('newest'),
});

export const loginSchema = z.object({
  email: z.string({ required_error: 'Email is required' }).min(1, 'Email is required').max(150),
  password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required').max(200),
});
