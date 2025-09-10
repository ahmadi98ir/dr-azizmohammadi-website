export type Role = 'patient' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  passwordHash: string;
  passwordSalt: string;
  createdAt: string;
}

export type AppointmentStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'completed';

export type AppointmentType = 'visit' | 'consult';

export interface Appointment {
  id: string;
  patientId: string;
  date: string; // ISO time
  type: AppointmentType;
  status: AppointmentStatus;
  note?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  appointmentId: string;
  senderId: string;
  text: string;
  createdAt: string;
}

export interface SessionRecord {
  token: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

export type PaymentStatus = 'initiated' | 'paid' | 'failed' | 'cancelled';

export interface Payment {
  id: string;
  appointmentId: string;
  amount: number;
  status: PaymentStatus;
  authority?: string;
  createdAt: string;
  paidAt?: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  published: boolean;
  createdAt: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
}

export interface NotificationRecord {
  id: string;
  type: 'email' | 'sms';
  to: string;
  subject: string;
  body: string;
  status: 'queued' | 'sent' | 'failed';
  createdAt: string;
  error?: string;
}
