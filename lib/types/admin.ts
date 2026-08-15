export interface User {
  user_id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  created_at: string;
  updated_at: string;
  token?: string;
}

export interface LoginResponse {
  data: User;
}

export interface Customer {
  customer_id: string;
  name: string;
  phone: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface CustomersResponse {
  customers: Customer[];
  total: number;
  page: number;
  page_size: number;
}

export interface StaffSchedule {
  staff_schedule_id: string;
  user_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export interface StaffLeave {
  leave_id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  image_url: string;
  leave_date: string;
  reason: string;
}

export interface StaffLeavesResponse {
  leaves: StaffLeave[];
}

export interface Staff {
  user_id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  image_url: string;
  schedules: StaffSchedule[];
}

export interface StaffResponse {
  staff: Staff[];
}

export interface Service {
  service_id: string;
  category_id: string;
  name: string;
  duration_minutes: number;
  price: string;
  description: string;
  image_url: string;
}

export interface Category {
  category_id: string;
  name: string;
  description: string;
  image_url: string;
  services: Service[];
}

export interface CategoriesResponse {
  categories: Category[];
}

export interface Product {
  product_id: string;
  name: string;
  current_stock: number;
  price: string;
  image_url: string;
}

export interface ProductsResponse {
  products: Product[];
}

export type ReservationStatus = "BOOKED" | "COMPLETED" | "CANCELLED";

export interface Reservation {
  reservation_id: string;
  customer_id: string;
  service_id: string;
  capster_id: string;
  booking_date: string;
  start_time: string;
  duration_minutes: number;
  status: ReservationStatus;
  notes: string;
}

export interface ReservationsResponse {
  reservations: Reservation[];
}

export interface TransactionDetail {
  transaction_id: string;
  service_id: string;
  service_name: string;
  price_at_booking: string;
}

export interface Transaction {
  transaction_id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  capster_id: string;
  capster_name: string;
  booking_date: string;
  start_time: string;
  total_duration_minutes: number;
  total_price: string;
  status: string;
  details: TransactionDetail[];
}

export interface TransactionsResponse {
  transactions: Transaction[];
  page: number;
  page_size: number;
}

export interface DashboardStats {
  total_customers: number;
  revenue_month: string;
  visits_today: number;
  active_staff: number;
  total_products: number;
  total_services: number;
  total_categories: number;
  revenue_today: string;
  transactions_today: number;
  transactions_month: number;
  reservations_today: number;
}

export interface ItemSalesSummary {
  jumlah_terjual: string;
  kotor: string;
  diskon_item: string;
  total_diskon_penjualan: string;
  pengembalian: string;
  nett: string;
  pajak: string;
  total_penjualan: string;
  penggunaan_voucher: string;
}

export interface ItemSalesItem {
  tipe: string;
  nama: string;
  sold: number;
  kotor: string;
  diskon: string;
  diskon_penjualan: string;
  pengembalian: string;
  nett: string;
  tax: string;
  penggunaan_voucher: string;
  total_penjualan: string;
}

export interface ItemSalesResponse {
  summary: ItemSalesSummary;
  items: ItemSalesItem[];
}

export interface PaymentSummary {
  total_transaksi: number;
  pendapatan_kotor: string;
  total_pengembalian: string;
  penggunaan_voucher: string;
  kembalian: string;
  total_pembayaran_net: string;
}

export interface PaymentAnalyticsItem {
  payment_name: string;
  total_transaksi: number;
  gross_payment: string;
  refunds: string;
  penggunaan_voucher: string;
  kembalian: string;
  net_payment: string;
}

export interface PaymentAnalyticsResponse {
  summary: PaymentSummary;
  payments: PaymentAnalyticsItem[];
}

export type WorkerReservationStatus = "BOOKED" | "COMPLETED" | "CANCELLED";

export interface WorkerReservation {
  reservation_id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  service_id: string;
  service_name: string;
  service_price: string;
  capster_id: string;
  booking_date: string;
  start_time: string;
  duration_minutes: number;
  status: WorkerReservationStatus;
  notes: string;
}

export interface WorkerReservationsResponse {
  reservations: WorkerReservation[];
}
