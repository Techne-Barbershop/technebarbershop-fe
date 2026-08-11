import { CATEGORIES } from "@/lib/constants";

export const ADMIN_DAYS = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
] as const;

export interface AdminCustomer {
  id: string;
  name: string;
  phone: string;
  email: string;
  memberId: string;
  loyaltyPoints: number;
  lastVisit: string;
  status: "Aktif" | "Baru" | "Tidak Aktif";
}

export const ADMIN_CUSTOMERS: AdminCustomer[] = [
  { id: "c1", name: "Budi Santoso", phone: "0812-3456-7890", email: "budi.santoso@gmail.com", memberId: "MB-1001", loyaltyPoints: 450, lastVisit: "10 Agu 2026", status: "Aktif" },
  { id: "c2", name: "Siti Rahayu", phone: "0813-9876-5432", email: "siti.rahayu@yahoo.com", memberId: "MB-1002", loyaltyPoints: 230, lastVisit: "09 Agu 2026", status: "Aktif" },
  { id: "c3", name: "Andi Wijaya", phone: "0821-1122-3344", email: "andi.wijaya@outlook.com", memberId: "MB-1003", loyaltyPoints: 120, lastVisit: "08 Agu 2026", status: "Baru" },
  { id: "c4", name: "Dewi Lestari", phone: "0857-5566-7788", email: "dewi.lestari@gmail.com", memberId: "MB-1004", loyaltyPoints: 680, lastVisit: "07 Agu 2026", status: "Aktif" },
  { id: "c5", name: "Rizky Pratama", phone: "0819-2233-4455", email: "rizky.pratama@gmail.com", memberId: "MB-1005", loyaltyPoints: 95, lastVisit: "05 Agu 2026", status: "Baru" },
  { id: "c6", name: "Maya Anggraini", phone: "0822-3344-5566", email: "maya.anggraini@icloud.com", memberId: "MB-1006", loyaltyPoints: 310, lastVisit: "03 Agu 2026", status: "Aktif" },
  { id: "c7", name: "Fajar Nugroho", phone: "0838-4455-6677", email: "fajar.nugroho@gmail.com", memberId: "MB-1007", loyaltyPoints: 20, lastVisit: "28 Jul 2026", status: "Tidak Aktif" },
  { id: "c8", name: "Intan Permata", phone: "0811-5566-7788", email: "intan.permata@yahoo.com", memberId: "MB-1008", loyaltyPoints: 540, lastVisit: "26 Jul 2026", status: "Aktif" },
  { id: "c9", name: "Agus Salim", phone: "0856-6677-8899", email: "agus.salim@gmail.com", memberId: "MB-1009", loyaltyPoints: 150, lastVisit: "20 Jul 2026", status: "Tidak Aktif" },
  { id: "c10", name: "Rina Marlina", phone: "0823-7788-9900", email: "rina.marlina@gmail.com", memberId: "MB-1010", loyaltyPoints: 400, lastVisit: "18 Jul 2026", status: "Aktif" },
];

export interface AdminStaff {
  id: string;
  name: string;
  role: string;
  schedule: Record<(typeof ADMIN_DAYS)[number], string | null>;
}

export const ADMIN_STAFF: AdminStaff[] = [
  {
    id: "s1",
    name: "Andre Maulana",
    role: "Master Barber",
    schedule: {
      Minggu: null,
      Senin: "11:00 - 17:00",
      Selasa: "11:00 - 17:00",
      Rabu: null,
      Kamis: "11:00 - 19:00",
      Jumat: "11:00 - 17:00",
      Sabtu: "09:00 - 15:00",
    },
  },
  {
    id: "s2",
    name: "Rizky Pratama",
    role: "Barber",
    schedule: {
      Minggu: "10:00 - 16:00",
      Senin: "09:00 - 15:00",
      Selasa: "11:00 - 17:00",
      Rabu: "11:00 - 17:00",
      Kamis: null,
      Jumat: "11:00 - 17:00",
      Sabtu: "10:00 - 16:00",
    },
  },
  {
    id: "s3",
    name: "Kevin Wijaya",
    role: "Color Specialist",
    schedule: {
      Minggu: null,
      Senin: null,
      Selasa: "12:00 - 20:00",
      Rabu: "12:00 - 20:00",
      Kamis: "12:00 - 20:00",
      Jumat: "12:00 - 20:00",
      Sabtu: "10:00 - 16:00",
    },
  },
  {
    id: "s4",
    name: "Fajar Nugroho",
    role: "Texture Specialist",
    schedule: {
      Minggu: "11:00 - 17:00",
      Senin: "11:00 - 17:00",
      Selasa: null,
      Rabu: "11:00 - 17:00",
      Kamis: "11:00 - 17:00",
      Jumat: null,
      Sabtu: "11:00 - 17:00",
    },
  },
  {
    id: "s5",
    name: "Yoga Aditya",
    role: "Barber",
    schedule: {
      Minggu: "09:00 - 15:00",
      Senin: "11:00 - 17:00",
      Selasa: "11:00 - 17:00",
      Rabu: "11:00 - 17:00",
      Kamis: "11:00 - 17:00",
      Jumat: "11:00 - 17:00",
      Sabtu: null,
    },
  },
];

export const ADMIN_SERVICE_CATEGORIES = CATEGORIES.map((category) => ({
  id: category.id,
  name: category.name,
  services: category.services.map((service) => ({
    id: service.id,
    name: service.title,
    durationMinutes: service.durationMinutes,
    price: service.price,
  })),
}));

export const ADMIN_TRANSACTIONS = [
  { id: "TRX-2301", customer: "Budi Santoso", service: "Essential Cut", date: "10 Agu 2026", time: "10:00", amount: 45000 },
  { id: "TRX-2302", customer: "Siti Rahayu", service: "Korean Full Drip", date: "09 Agu 2026", time: "13:30", amount: 220000 },
  { id: "TRX-2303", customer: "Andi Wijaya", service: "Full Face Treatment", date: "08 Agu 2026", time: "15:00", amount: 75000 },
  { id: "TRX-2304", customer: "Dewi Lestari", service: "Black Basic Hair Coloring", date: "07 Agu 2026", time: "11:30", amount: 95000 },
  { id: "TRX-2305", customer: "Rizky Pratama", service: "Skin Fade + Beard", date: "05 Agu 2026", time: "17:00", amount: 90000 },
  { id: "TRX-2306", customer: "Maya Anggraini", service: "Smoothing Treatment", date: "03 Agu 2026", time: "14:00", amount: 160000 },
];
