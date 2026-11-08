// ─── Users & Auth ────────────────────────────────────────────────────────────
export type UserRole = "super_admin" | "tenant_admin" | "tenant_staff";

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  tenant_id?: number | null;
  is_active: boolean;
  is_suspended: boolean;
  suspension_reason?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tenant {
  id: number;
  name: string;
  logo_url?: string | null;
  is_active: boolean;
}

export interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface MessageResponse {
  message: string;
}

// ─── Clients ─────────────────────────────────────────────────────────────────
// ✅ FIXED: Removed UI badge variants ("neutral", "success") to match backend exactly
export type ClientStatus = "pending" | "active" | "inactive" | "suspended";

export interface Client {
  id: number;
  tenant_id: number;
  full_name: string;
  email: string | null;
  phone: string;
  id_number: string | null;
  dl_number: string | null;
  dl_expiry: string | null;
  status: ClientStatus;
  residential_address: string | null;
  work_address: string | null;
  id_image_front: string | null;
  id_image_back: string | null;
  dl_image_front: string | null;
  avatar_image: string | null;
  next_of_kin_name: string | null;
  next_of_kin_phone: string | null;
  is_archived: boolean;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export type ClientCreatePayload = Omit<
  Client,
  | "id"
  | "tenant_id"
  | "created_at"
  | "updated_at"
  | "is_archived"
  | "archived_at"
  | "avatar_image"
  | "id_image_front"
  | "id_image_back"
  | "dl_image_front"
>;

export type ClientUpdatePayload = Partial<Omit<Client, "id" | "tenant_id" | "created_at" | "updated_at">>;

// ─── Vehicles ────────────────────────────────────────────────────────────────
export type VehicleStatus = "available" | "rented" | "maintenance" | "retired";

export interface Vehicle {
  id: number;
  tenant_id: number;
  make: string;
  model: string;
  year: number;
  plate_number: string;
  vin: string | null;
  status: VehicleStatus;
  daily_rate: number;
  current_mileage: number;
  next_service_km: number | null;
  insurance_doc: string | null;
  registration_doc: string | null;
  inspection_doc: string | null;
  insurance_expiry: string | null;
  notes: string | null;
  is_archived: boolean;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface VehicleCreatePayload {
  make: string;
  model: string;
  year: number;
  plate_number: string;
  vin?: string | null;
  daily_rate: number;
  current_mileage?: number;
  next_service_km?: number | null;
  notes?: string | null;
}

export interface VehicleUpdatePayload {
  make?: string;
  model?: string;
  year?: number;
  plate_number?: string;
  vin?: string | null;
  daily_rate?: number;
  status?: VehicleStatus;
  current_mileage?: number;
  next_service_km?: number | null;
  insurance_doc?: string | null;
  registration_doc?: string | null;
  inspection_doc?: string | null;
  insurance_expiry?: string | null;
  notes?: string | null;
}


// ─── Bookings ─────────────────────────────────────────────────────────────────
export type BookingStatus = "pending" | "confirmed" | "active" | "completed" | "cancelled" | "no_show";

export interface Booking {
  id: number;
  booking_number: string;
  tenant_id: number;
  client_id: number;
  vehicle_id: number;
  destination?: string | null;
  pickup_location?: string | null;
  return_location?: string | null;
  start_date: string;
  end_date: string;
  total_amount: number;
  currency_code: string;
  status: BookingStatus;
  is_archived: boolean;
  archived_at: string | null;
  quotation_id?: number | null; // ✅ Link to Quotation
  created_at: string;
  updated_at: string;
}

export interface BookingCreatePayload {
  client_id: number;
  vehicle_id: number;
  start_date: string;
  end_date: string;
  destination?: string;
  pickup_location?: string;
  return_location?: string;
  total_amount: number;
  currency_code?: string;
}

export interface BookingUpdatePayload {
  destination?: string;
  start_date?: string;
  end_date?: string;
  pickup_location?: string;
  return_location?: string;
  total_amount?: number;
  currency_code?: string;
  status?: BookingStatus;
}

// ─── Quotations (NEW) ─────────────────────────────────────────────────────────
export type QuotationStatus = "pending" | "accepted" | "expired" | "declined";

export interface Quotation {
  id: number;
  tenant_id: number;
  client_id: number | null;
  vehicle_id: number | null;
  start_date: string;
  end_date: string;
  destination?: string | null;
  pickup_location?: string | null;
  return_location?: string | null;
  total_amount: number;
  currency_code: string;
  status: QuotationStatus;
  share_token: string | null;
  share_token_expires_at: string | null;
  booking_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface QuotationCreatePayload {
  client_id: number;
  vehicle_id: number;
  start_date: string;
  end_date: string;
  destination?: string;
  pickup_location?: string;
  return_location?: string;
  total_amount: number;
  currency_code?: string;
}

// ─── Contracts ───────────────────────────────────────────────────────────────
export type ContractStatus = "draft" | "sent" | "signed" | "void";

export interface Contract {
  id: number;
  booking_id: number;
  tenant_id: number;
  contract_number: string;
  status: ContractStatus;
  pdf_path: string | null;
  signed_at: string | null;
  share_token: string | null;
  share_token_expires_at: string | null;
  signed_by_client: boolean;
  client_signed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PublicContractView {
  contract_number: string;
  booking_id: number;
  tenant_name: string;
  client_name: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_plate: string;
  start_date: string;
  end_date: string;
  total_amount: string;
  currency_code: string;
  status: ContractStatus;
  signed_by_client: boolean;
  created_at: string;
}

// ─── Invoices ────────────────────────────────────────────────────────────────
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "void";

export interface Invoice {
  id: number;
  tenant_id: number;
  subscription_id: number | null;
  booking_id: number | null;
  invoice_number: string;
  status: InvoiceStatus;
  amount_due: number;
  amount_paid: number;
  currency_code: string;
  due_date: string;
  paid_at: string | null;
  pdf_path: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvoiceCreatePayload {
  booking_id?: number;
  subscription_id?: number;
  amount_due: number;
  currency_code?: string;
  due_date: string;
  notes?: string;
}

export interface InvoiceUpdatePayload {
  amount_due?: number;
  currency_code?: string;
  due_date?: string;
  notes?: string;
  status?: InvoiceStatus;
}

// ─── Payments ────────────────────────────────────────────────────────────────
export type PaymentMethod = "mpesa" | "manual";
export type PaymentStatus = "pending" | "completed" | "failed";

export interface Payment {
  id: number;
  invoice_id: number;
  tenant_id: number;
  amount: number;
  currency_code: string;
  method: PaymentMethod;
  reference: string | null;
  status: PaymentStatus;
  paid_at: string | null;
  recorded_by: number | null;
  notes: string | null;
  created_at: string;
}

export interface PaymentCreatePayload {
  invoice_id: number;
  amount: number;
  currency_code?: string;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
}

// ─── PUBLIC PORTAL VIEWS (No Auth Required) ──────────────────────────────────

// 1. Quotation Public View (Matches backend QuotationPublicView)
export interface PublicQuotationView {
  id: number;
  tenant_name: string;
  client_name: string;
  client_email?: string | null;
  client_phone?: string | null;
  vehicle_details: string;
  start_date: string;
  end_date: string;
  pickup_location: string | null;
  return_location: string | null;
  destination: string | null;
  daily_rate: number;
  total_amount: number;
  currency_code: string;
  terms_and_conditions: string | null;
  status: QuotationStatus;
  expires_at: string | null; // Maps to share_token_expires_at
  created_at: string;
}

// 2. Invoice Public View (Matches backend InvoicePublicView)
export interface PublicInvoiceView {
  id: number;
  tenant_name: string;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  invoice_number: string;
  created_at: string;
  booking_ref: string | null;
  amount_due: number;
  amount_paid: number;
  currency_code: string;
  due_date: string;
  status: InvoiceStatus;
  notes: string | null;
  // Optional: If your backend returns granular line items
  line_items?: { description: string; amount: number }[]; 
}

// 3. Contract Public View (Enhancing your existing PublicContractView)
export interface PublicContractView {
  contract_number: string;
  booking_id: number;
  tenant_name: string;
  client_name: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_plate: string;
  start_date: string;
  end_date: string;
  total_amount: string;
  currency_code: string;
  status: ContractStatus;
  terms_and_conditions: string | null; // Added for the UI to display T&Cs
  signed_by_client: boolean;
  signature_data: string | null; // Added to store/display the base64 e-signature
  signed_at: string | null;
  created_at: string;
}

// ─── DASHBOARD LIST ENRICHMENTS (For Data Tables) ────────────────────────────
// These are optional but highly recommended so your DataTables don't show "undefined" for names.

export interface BookingListItem extends Booking {
  client_name: string;
  vehicle_details: string; // e.g., "Toyota Land Cruiser"
}

export interface InvoiceListItem extends Invoice {
  client_name: string;
  booking_ref: string | null;
}

export interface ContractListItem extends Contract {
  client_name: string;
  booking_ref: string | null;
}
