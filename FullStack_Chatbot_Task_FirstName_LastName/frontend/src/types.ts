export type UserType = 'Student' | 'Customer' | 'Other';
export type Status = 'New' | 'Contacted' | 'In Progress' | 'Closed';

export const USER_TYPES: UserType[] = ['Student', 'Customer', 'Other'];
export const STATUSES: Status[] = ['New', 'Contacted', 'In Progress', 'Closed'];

export interface Enquiry {
  id: number;
  name: string;
  email: string;
  phone: string;
  userType: UserType;
  interest: string;
  message: string;
  status: Status;
  source: 'form' | 'chatbot';
  createdAt: string;
  updatedAt: string;
}

export interface EnquiryInput {
  name: string;
  email: string;
  phone: string;
  userType: UserType;
  interest: string;
  message: string;
  source?: 'form' | 'chatbot';
}

export interface ListMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface Stats {
  total: number;
  new: number;
  contacted: number;
  inProgress: number;
  closed: number;
  students: number;
  customers: number;
  other: number;
  lastSevenDays: number;
}

export interface ListFilters {
  search: string;
  userType: '' | UserType;
  status: '' | Status;
  sort: 'newest' | 'oldest' | 'name';
  page: number;
  limit?: number;
}
