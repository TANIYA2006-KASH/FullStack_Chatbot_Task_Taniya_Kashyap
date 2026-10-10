import type { EnquiryInput, UserType } from '../types';
import { USER_TYPES } from '../types';

// Frontend validation gives instant feedback. The backend validates again and is the real gatekeeper.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[0-9\s-]{10,16}$/;

export const validateName = (v: string): string | null => {
  const s = v.trim();
  if (!s) return 'Name is required';
  if (s.length < 2) return 'Name must be at least 2 characters';
  if (s.length > 100) return 'Name must be at most 100 characters';
  return null;
};

export const validateEmail = (v: string): string | null => {
  const s = v.trim();
  if (!s) return 'Email is required';
  if (s.length > 150 || !EMAIL_RE.test(s)) return 'Enter a valid email address';
  return null;
};

export const validatePhone = (v: string): string | null => {
  const s = v.trim();
  if (!s) return 'Phone number is required';
  const digits = s.replace(/\D/g, '').length;
  if (!PHONE_RE.test(s) || digits < 10 || digits > 13) return 'Enter a valid phone number (10-13 digits)';
  return null;
};

export const validateUserType = (v: string): string | null =>
  USER_TYPES.includes(v as UserType) ? null : 'Choose Student, Customer or Other';

export const validateInterest = (v: string): string | null => {
  const s = v.trim();
  if (!s) return 'Pick a service or course';
  if (s.length > 150) return 'Keep this under 150 characters';
  return null;
};

export const validateMessage = (v: string): string | null => {
  const s = v.trim();
  if (!s) return 'Message is required';
  if (s.length < 5) return 'Message must be at least 5 characters';
  if (s.length > 2000) return 'Message must be at most 2000 characters';
  return null;
};

export type FormErrors = Partial<Record<keyof EnquiryInput, string>>;

export function validateEnquiry(v: EnquiryInput): FormErrors {
  const errors: FormErrors = {
    name: validateName(v.name) ?? undefined,
    email: validateEmail(v.email) ?? undefined,
    phone: validatePhone(v.phone) ?? undefined,
    userType: validateUserType(v.userType) ?? undefined,
    interest: validateInterest(v.interest) ?? undefined,
    message: validateMessage(v.message) ?? undefined,
  };
  (Object.keys(errors) as (keyof FormErrors)[]).forEach((k) => errors[k] === undefined && delete errors[k]);
  return errors;
}
