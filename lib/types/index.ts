import type { IconName } from "@/components/icons";

import type { Service } from "./admin";

export interface Feature {
  icon: IconName;
  label: string;
}

export interface MockService {
  id: string;
  categoryId: string;
  title: string;
  durationMinutes: number;
  price: number;
  description: string;
  includes: Feature[];
}

export interface ServiceCategory {
  id: string;
  name: string;
  tagline: string;
  icon: IconName;
  services: MockService[];
}

export interface Artist {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  basePrice: number;
  specialty: string;
}

export interface UserDetails {
  name: string;
  phone: string;
  email: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export type PaymentMethodId = "va" | "qris" | "ewallet";

export interface PaymentMethod {
  id: PaymentMethodId;
  name: string;
  description: string;
  icon: IconName;
  steps: string[];
  detail: { label: string; value: string };
}

export interface BookingState {
  services: Service[];
  artist: Artist | null;
  date: string | null;
  time: string | null;
  user: UserDetails | null;
  paymentMethod: PaymentMethod | null;
  reservationId: string | null;
  expiresAt: string | null;
}

export type ReservationStatus = "Booked" | "Completed" | "Canceled";

export type PaymentStatus = "Not Paid" | "Paid";

export interface Reservation {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  date: string;
  time: string;
  durationMinutes: number;
  workerId: string;
  workerName: string;
  serviceName: string[];
  status: ReservationStatus;
  paymentStatus?: PaymentStatus;
}
