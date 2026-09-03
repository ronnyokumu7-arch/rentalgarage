// ─── Users & Auth ───────────────────────────────────────────────────────────
export type UserRole = "super_admin" | "tenant_admin" | "tenant_staff";

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  tenant_id?: number | null;
  
  // Account Status
  is_active: boolean;
  is_suspended: boolean;
  suspension_reason?: string | null;
  
  // Tenant Ownership (Agency Owner)
  is_tenant_owner?: boolean;
  
  // Contact & Role Details
  phone_number?: string | null;
  department?: string | null;
  job_title?: string | null;
  
  // Security & Access
  permissions?: string[];
  two_factor_enabled?: boolean;
  last_login_at?: string | null;
  
  // Compliance
  id_number?: string | null;
  dl_number?: string | null;
  dl_expiry?: string | null;
  
  // Media & Documents (Base64 or external URLs)
  avatar_url?: string | null;
  id_image_url?: string | null;
  dl_image_url?: string | null;
  
  // Verification & Onboarding Lifecycle
  email_verified?: boolean;
  phone_verified?: boolean;
  is_onboarded?: boolean;
  
  // Invite System
  invite_token?: string | null;
  invite_expires_at?: string | null;
  
  // Security Audit
  account_locked_until?: string | null;
  
  // UI Preferences
  theme_preference?: string | null;
  density_preference?: string | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
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
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface MessageResponse {
  message: string;
}

// ── Clients ─────────────────────────────────────────────────────────────────
export type ClientStatus = "pending" | "active" | "inactive" | "suspended";

export interface Client {
  id: number;
  tenant_id: number;
  full_name: string;
  email: string | null;
  phone: string;
  id_type?: "national_id" | "passport";  // ✅ Identity slot type (national ID or passport)
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

  // ✅ Backend often returns these variations
  name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  driver_license_number?: string | null;
}

export type ClientCreate = Omit<
  Client,
  | "id" | "tenant_id" | "status" | "created_at" | "updated_at" 
  | "is_archived" | "archived_at" | "avatar_image" 
  | "id_image_front" | "id_image_back" | "dl_image_front"
>;

export type ClientCreatePayload = ClientCreate;

export type ClientUpdate = Partial<
  Omit<Client, "id" | "tenant_id" | "created_at" | "updated_at">
>;

// ─── Vehicles ────────────────────────────────────────────────────────────────
export type VehicleStatus =
  | "pending_activation" | "available" | "rented" 
  | "maintenance" | "retired";  // ✅ awaiting_mileage removed

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
  
  // ✅ LIFECYCLE: return mileage not yet logged (vehicle stays rentable)
  mileage_due: boolean;
  
  // ✅ MILESTONE 2 & 3: Service Support Flags
  supports_airport_transfer: boolean;
  airport_transfer_base_rate: number | null;
  supports_wedding_service: boolean;
  wedding_base_rate: number | null;
  
  insurance_number: string | null;
  insurance_expiry: string | null;
  insurance_doc: string | null;
  registration_doc: string | null;
  inspection_doc: string | null;
  notes: string | null;
  is_archived: boolean;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface VehicleCreate {
  make: string;
  model: string;
  year: number;
  plate_number: string;
  vin?: string | null;
  daily_rate: number;
  current_mileage?: number;
  next_service_km?: number | null;
  insurance_number?: string | null;
  insurance_expiry?: string | null;
  notes?: string | null;
  
  // ✅ MILESTONE 2 & 3: Service Support Flags
  supports_airport_transfer?: boolean;
  airport_transfer_base_rate?: number | null;
  supports_wedding_service?: boolean;
  wedding_base_rate?: number | null;
}

export interface VehicleUpdate {
  make?: string;
  model?: string;
  year?: number;
  plate_number?: string;
  vin?: string | null;
  daily_rate?: number;
  // ✅ SECURITY: status removed (transitions via lifecycle endpoints only)
  // ✅ SECURITY: doc URLs removed (set via file upload endpoint only)
  current_mileage?: number;
  next_service_km?: number | null;
  insurance_number?: string | null;
  insurance_expiry?: string | null;
  notes?: string | null;

  // ✅ MILESTONE 2 & 3: Service Support Flags
  supports_airport_transfer?: boolean;
  airport_transfer_base_rate?: number | null;
  supports_wedding_service?: boolean;
  wedding_base_rate?: number | null;
}

// ─── Drivers ────────────────────────────────────────────────────────────────
export type DriverEmploymentType = "in_house" | "contracted";
export type DriverStatus = "available" | "on_trip" | "on_leave" | "suspended";
export type DriverPayMode = "commission" | "fixed_per_job" | "payroll";

export interface DriverBase {
  full_name: string;
  phone: string;
  email?: string | null;
  id_number: string;
  dl_number: string;
  dl_expiry?: string | null;
}

export interface DriverCreate extends DriverBase {
  employment_type?: DriverEmploymentType;
  status?: DriverStatus;
  pay_mode?: DriverPayMode;
  daily_fee?: number | string | null;
  overtime_hourly_fee?: number | string | null;
  night_accommodation_fee?: number | string | null;
  delivery_commission?: number | string | null;
  profile_photo_key?: string | null;
  id_front_key?: string | null;
  id_back_key?: string | null;
  dl_photo_key?: string | null;
}

export interface DriverUpdate {
  full_name?: string;
  phone?: string;
  email?: string | null;
  id_number?: string;
  dl_number?: string;
  dl_expiry?: string | null;
  employment_type?: DriverEmploymentType;
  status?: DriverStatus;
  pay_mode?: DriverPayMode;
  daily_fee?: number | string | null;
  overtime_hourly_fee?: number | string | null;
  night_accommodation_fee?: number | string | null;
  delivery_commission?: number | string | null;
  profile_photo_key?: string | null;
  id_front_key?: string | null;
  id_back_key?: string | null;
  dl_photo_key?: string | null;
}

export interface Driver {
  id: number;
  tenant_id: number;
  full_name: string;
  phone: string;
  email?: string | null;
  id_number: string;
  dl_number: string;
  dl_expiry?: string | null;
  profile_photo_key?: string | null;
  id_front_key?: string | null;
  id_back_key?: string | null;
  dl_photo_key?: string | null;
  employment_type: DriverEmploymentType;
  status: DriverStatus;
  pay_mode: DriverPayMode;
  daily_fee?: number | string | null;
  overtime_hourly_fee?: number | string | null;
  night_accommodation_fee?: number | string | null;
  delivery_commission?: number | string | null;
  user_id?: number | null;
  is_archived: boolean;
  archived_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DriverListItem {
  id: number;
  full_name: string;
  phone: string;
  status: DriverStatus;
  employment_type: DriverEmploymentType;
  pay_mode: DriverPayMode;
  dl_expiry?: string | null;
  daily_fee?: number | string | null;
  delivery_commission?: number | string | null;
  is_archived: boolean;
  created_at: string;
  id_number_masked?: string | null;
  dl_number_masked?: string | null;
}

// ─── Bookings ────────────────────────────────────────────────────────────────
export type BookingStatus =
  | "pending" | "confirmed" | "active"
  | "completed" | "cancelled";  // ✅ no_show + awaiting_mileage removed (now 5 states)

// ✅ LIFECYCLE: WHY a booking was cancelled (preserved as data, not a status)
export type CancellationReason =
  | "client_cancelled"   // client backed out in advance
  | "agency_cancelled"   // operator voided it
  | "no_show"            // client never arrived (forfeit tier)
  | "expired_unpaid";    // quotation/invoice lapsed unpaid

// ✅ MILESTONE 1.1 & 3: Service type enum (aligned with backend constants)
export type ServiceType =
  | "selfdrive"
  | "airport_transfer"
  | "wedding"          // ✅ Aligned with backend (was "chauffeur_wedding")
  | "pro_driver"       // ✅ Aligned with backend (was "chauffeur_pro_driver")
  | "chauffeur_hourly"
  | "corporate"
  | "city_excursion"
  | "chauffeur_taxi"
  | "route_stops_service";

export type BillingModel =
  | "rolling_24h"
  | "event_base"
  | "hourly"
  | "package"
  | "fixed_route"
  | "distance_time"
  | "route_stops";

export interface ServiceConfig {
  billing_model: BillingModel | null;
  day_hours: number;
  grace_minutes: number;
  overtime_hourly_rate: number | string | null;
  overtime_cap_at_day_rate: boolean;
  driver_daily_fee: number | string | null;
  driver_overtime_hourly_fee: number | string | null;
  driver_night_accommodation_fee: number | string | null;
  rate_extras: Record<string, any>;
}

export interface ServiceDefinition {
  key: ServiceType;
  display_name: string;
  category: string;
  billing_model: BillingModel;
  base_hours: number;
  requires_driver: boolean;
  is_live: boolean;
  description: string;
  effective_billing_model: BillingModel;
  config: ServiceConfig | null;
}

export interface ServicesResponse {
  services: ServiceDefinition[];
  categories: Record<string, ServiceDefinition[]>;
}

export interface BookingClientRelation {
  id: number;
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  company_name?: string | null;
  company?: string | null;
  avatar_url?: string | null;
}

export interface BookingVehicleRelation {
  id: number;
  make: string;
  model: string;
  year?: number | null;
  plate_number?: string | null;
  current_mileage?: number | null;
  daily_rate?: number | null;
  status?: VehicleStatus;
}

export interface Booking {
  id: number;
  booking_number?: string | null;
  tenant_id: number;
  client_id: number;
  vehicle_id: number;
  destination?: string | null;
  pickup_location?: string | null;
  return_location?: string | null;
  start_date: string;
  end_date: string;
  original_end_date?: string | null;
  daily_rate?: number | string | null;
  total_amount: number;
  currency_code: string;
  status: BookingStatus;
  is_archived: boolean;
  archived_at: string | null;
  created_at: string;
  updated_at: string;

  // ✅ MILESTONE 1 & 3: Service type + exact times + pricing snapshot
  service_type: ServiceType;
  pickup_at?: string | null;
  scheduled_return_at?: string | null;
  actual_return_at?: string | null;  // ✅ LIFECYCLE: set on complete (late-return reconciliation)
  pricing_day_hours?: number | null;
  pricing_grace_minutes?: number | null;
  pricing_overtime_hourly_rate?: number | string | null;

  // ✅ PHASE 1 & MILESTONE 3: Pricing Snapshot (immutable after creation)
  billable_days?: number | null;
  computed_total?: number | string | null;
  manually_adjusted?: boolean;
  price_note?: string | null;

  // ✅ LIFECYCLE: cancellation metadata (replaces removed no_show status)
  cancellation_reason?: CancellationReason | null;
  cancelled_at?: string | null;
  cancelled_by?: number | null;

  // ✅ MILESTONE 2: Driver assignment (scalar FK)
  driver_id?: number | null;

  // ✅ MILESTONE 3: Service-specific details (JSON)
  // Stores add-ons and configurations specific to the service_type 
  // (e.g., wedding extra hours, decoration fees, airport tolls).
  service_details?: Record<string, any> | null;

  // Joined Relations
  client?: BookingClientRelation | null;
  vehicle?: BookingVehicleRelation | null;
  driver?: Driver | null;

  contract?: Contract | null;
  invoices?: Invoice[];
  total_price?: string | number | null;

  // ✅ NEW: Denormalized UI fields (prevents MissingGreenlet errors)
  client_name?: string | null;
  client_phone?: string | null;
  vehicle_plate?: string | null;
  vehicle_name?: string | null;
}

export interface BookingCreate {
  client_id: number;
  vehicle_id: number;
  start_date: string;
  end_date: string;
  destination?: string;
  pickup_location?: string;
  return_location?: string;
  daily_rate?: number;
  total_amount?: number; // ✅ Made optional: backend computes it via pricing engine
  currency_code?: string;

  service_type?: ServiceType;
  pickup_at?: string;
  scheduled_return_at?: string;

  driver_id?: number | null;

  // ✅ MILESTONE 2 & 3: Add-ons and Service Details
  toll_fees?: number;
  parking_fees?: number;
  service_details?: Record<string, any>;
}

export interface BookingUpdate {
  destination?: string | null;
  start_date?: string;
  end_date?: string;
  pickup_location?: string | null;
  return_location?: string | null;
  vehicle_id?: number | null;
  daily_rate?: number;
  total_amount?: number;
  currency_code?: string;
  // ✅ SECURITY: status removed (transitions via lifecycle endpoints only)

  service_type?: ServiceType;
  pickup_at?: string;
  scheduled_return_at?: string;

  driver_id?: number | null;

  // ✅ MILESTONE 2 & 3: Add-ons and Service Details
  toll_fees?: number;
  parking_fees?: number;
  service_details?: Record<string, any>;
}

export interface BookingQuote {
  vehicle_id: number;
  service_type: ServiceType;
  pickup_at: string;
  return_at: string;
  driver_id?: number | null;
  distance_km?: number;
  route_key?: string;
  stops?: number;
  daily_rate_override?: number | null;

  // ✅ MILESTONE 2 & 3: Add-ons and Service Details
  toll_fees?: number;
  parking_fees?: number;
  service_details?: Record<string, any>;
}

export interface PricingLine {
  description: string;
  quantity: string;
  amount: number | string;
}

// ✅ MILESTONE 3: Updated to match the clean output from our new pure pricing engines
// ✅ CONTRACT v2: matches backend quote response exactly
export interface PricingResult {
  service_type: ServiceType;
  pickup_at: string;
  scheduled_return_at: string;
  billable_days: number;
  daily_rate: number | string;
  lines: PricingLine[];
  total: number | string;
  currency_code: string;
}

// ─── Dashboard List Enrichments ─────────────────────────────────────────────
export interface BookingListItem extends Booking {
  client_name: string;
  vehicle_details: string;
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
  start_date?: string | null;
  signature_image_path?: string | null;
  share_token?: string | null;
  share_token_expires_at?: string | null;
  signed_by_client: boolean;
  client_signed_at: string | null;  // ✅ set on public sign
  // ✅ REMOVED: signed_at (legacy/stale — backend only sets client_signed_at)
  created_at: string;
  updated_at: string;

  booking_number?: string | null;
  client_id?: number | null;
  client_name?: string | null;
}

export interface PublicContractView {
  contract_number: string;
  booking_id: number;
  booking_number?: string | null;
  tenant_name: string;

  // ✅ Owning Tenant's branding (resolved from the contract's tenant)
  tenant_logo_url?: string | null;
  tenant_address?: string | null;
  tenant_phone?: string | null;
  tenant_email?: string | null;

  client_name: string;
  id_number: string;
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

  // ✅ MILESTONE 2: Assigned driver (null for self-drive bookings)
  driver_name?: string | null;
  driver_phone?: string | null;
  driver_dl_number?: string | null;
}

// ─── Invoices ────────────────────────────────────────────────────────────────
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "void" | "partially_paid";

// ✅ LIFECYCLE: document type (quotation morphs to invoice on client accept)
export type InvoiceDocType = "quotation" | "invoice";

export interface Invoice {
  id: number;
  tenant_id: number;
  booking_id: number | null;
  invoice_number: string;
  status: InvoiceStatus;
  doc_type: InvoiceDocType;  // ✅ LIFECYCLE: quotation | invoice (legacy defaults to invoice)
  share_token?: string | null;
  share_token_expires_at?: string | null;
  amount_due: number;
  amount_paid: number;
  remaining_balance: number;
  discount_amount: number;
  discount_reason?: string | null;
  currency_code: string;
  due_date: string;
  paid_at: string | null;
  pdf_path: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;

  booking_number?: string | null;
  client_id?: number | null;
  client_name?: string | null;

  // ✅ NEW: Denormalized UI fields (prevents MissingGreenlet errors)
  client_phone?: string | null;
  vehicle_plate?: string | null;
  vehicle_name?: string | null;
}

export interface InvoiceCreate {
  booking_id: number;
  due_date: string;
  notes?: string;
  amount_due?: number;
  currency_code?: string;
  discount_amount?: number;
  discount_reason?: string;
}

export interface InvoiceUpdate {
  amount_due?: number;
  currency_code?: string;
  due_date?: string;
  notes?: string;
  discount_amount?: number;
  discount_reason?: string;
  // ✅ SECURITY: status removed (transitions via payment recording / lifecycle only)
}

// ─── Public Invoice Views ────────────────────────────────────────────────────
export interface PublicPaymentDetails {
  // ── M-Pesa (from MpesaConfig) ───────────────────────────────────
  method_type?: string | null;        // "paybill" | "till" | "pochi"
  business_shortcode?: string | null; // Paybill number
  till_number?: string | null;        // Till or Pochi number
  account_number?: string | null;     // Paybill account reference
  account_name?: string | null;       // Display name for clients

  // ── Airtel Money (from AirtelMoneyConfig) ───────────────────────
  airtel_number?: string | null;

  // ── Bank Transfer (from BankAccountConfig) ──────────────────────
  bank_name?: string | null;
  bank_account_number?: string | null;
  bank_account_name?: string | null;
  branch_code?: string | null;
  swift_code?: string | null;
  currency?: string | null;

  // ── Fallback (from TenantProfile) ───────────────────────────────
  tenant_phone?: string | null;
}

export interface PublicInvoiceView {
  id: number;
  invoice_number: string;
  tenant_name: string;
  tenant_logo_url?: string | null;
  tenant_phone?: string | null;
  tenant_email?: string | null;
  client_name: string;
  client_phone?: string | null;
  vehicle_name?: string | null;
  vehicle_description?: string | null;
  vehicle_plate?: string | null;
  amount_due: number | string;
  currency_code: string;
  status: InvoiceStatus;
  doc_type: InvoiceDocType;  // ✅ LIFECYCLE: drives morphing page (quotation vs invoice mode)
  due_date: string;
  remaining_balance?: number | string | null;
  payment_details?: PublicPaymentDetails | null;
  created_at: string;

  // ✅ MILESTONE 2: Assigned driver (null for self-drive bookings)
  driver_name?: string | null;
  driver_phone?: string | null;
  driver_dl_number?: string | null;

  // Booking reference
  booking_number?: string | null;
  booking_start_date?: string | null;
  booking_end_date?: string | null;

  // Discount
  discount_amount?: number | string;
  discount_reason?: string | null;
  notes?: string | null;
  paid_at?: string | null;
}

// ─── Payments ────────────────────────────────────────────────────────────────
export type PaymentMethod = "mpesa" | "airtel_money" | "card" | "paypal" | "bank" | "manual";
export type PaymentStatus = "pending" | "completed" | "failed" | "void";

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
  
  booking_id?: number | null;
  invoice_number?: string | null;
  client_id?: number | null;
  client_name?: string | null;
}

// ─── Dashboard List Enrichments ──────────────────────────────────────────────
export interface BookingListItem extends Booking {
  client_name: string;
  vehicle_details: string;
}

export interface InvoiceListItem extends Invoice {
  client_name: string;
  booking_ref: string | null;
}

export interface ContractListItem extends Contract {
  client_name: string;
  booking_ref: string | null;
}

// ─── Roles & Permissions ─────────────────────────────────────────────────────
export interface Permission {
  key: string;
  label: string;
}

export interface PermissionCategory {
  name: string;
  permissions: Permission[];
}

export interface RoleTemplate {
  id: number;
  tenant_id: number;
  job_title: string;
  description?: string | null;
  permissions: string[];
}

// ─── Tasks & Action Center ──────────────────────────────────────────────────
export type TaskStatus = "unassigned" | "pending" | "in_progress" | "in_review" | "blocked" | "completed";
export type TaskCategory = "fleet" | "finance" | "hr" | "booking" | "compliance" | "maintenance" | "operations" | "other";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface Task {
  id: number;
  tenant_id: number;
  user_id: number | null;
  created_by: number | null;
  title: string;
  description: string | null;
  category: TaskCategory;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  completed_at: string | null;
  is_system_generated: boolean;
  is_archived: boolean;
  requires_role: string | null;
  target_type: string | null;
  target_id: number | null;
  location_id: number | null;
  start_date?: string | null;
  department?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskCreate {
  title: string;
  description?: string | null;
  category: TaskCategory;
  priority?: TaskPriority;
  due_date?: string | null;
  target_type?: string | null;
  target_id?: number | null;
  location_id?: number | null;
  user_id?: number | null;
  requires_role?: string | null;
  is_system_generated?: boolean;
}

export interface TaskUpdate {
  title?: string;
  description?: string | null;
  category?: TaskCategory;
  priority?: TaskPriority;
  status?: TaskStatus;
  user_id?: number | null;
  due_date?: string | null;
  completed_at?: string | null;
}

// ─── Tenants & Subscriptions ─────────────────────────────────────────────────
export type SubscriptionStatus =
  | "trial" | "starter_trial" | "pending_verification" 
  | "active" | "past_due" | "suspended" | "cancelled";

export type PaymentMethodType = "mpesa" | "airtel_money" | "card" | "paypal" | "bank";

export interface TenantProfile {
  id?: number;
  tenant_id?: number;
  company_name: string;
  business_location: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  tax_number?: string | null;
  logo_url?: string | null;
  kra_pin?: string | null;
  contract_terms?: string | null;
  contract_prefix?: string;
  contract_footer?: string | null;
}

export interface Tenant {
  id: number;
  name: string;
  email: string;
  phone_number?: string | null;
  
  admin_name?: string | null;
  admin_email?: string | null;
  admin_phone?: string | null;
  
  is_active: boolean;
  is_archived: boolean;
  is_trial?: boolean;
  owner_id?: number | null;
  suspended_at?: string | null;
  suspension_reason?: string | null;
  
  last_reset_request_at?: string | null;
  email_change_cooldown_until?: string | null;
  admin_email_changed_at?: string | null;
  admin_changed_by_user_id?: number | null;
  
  plan: string;
  subscription_status: SubscriptionStatus;
  trial_ends_at?: string | null;
  subscription_ends_at?: string | null;
  grace_period_ends_at?: string | null;
  
  default_payment_method?: PaymentMethodType | null;
  stripe_customer_id?: string | null;
  paypal_payer_id?: string | null;
  payment_metadata?: Record<string, any> | null;
  
  profile?: TenantProfile | null;
  
  created_at: string;
  updated_at: string;
}

export interface SubscriptionOut {
  id: number;
  tenant_id: number;
  plan: string;
  billing_cycle: string;
  status: SubscriptionStatus;
  starts_at: string;
  ends_at: string | null;
  grace_period_ends_at: string | null;
  auto_renew: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTenantPayload {
  name: string;
  email: string;
  password: string;
  phone_number?: string;
  plan?: string;
  admin_name?: string;
  admin_email?: string;
  admin_phone?: string;
  business_location?: string;
  kra_pin?: string;
  currency?: string;
  time_zone?: string;
  is_corporate?: boolean;
  billing_cycle?: string;
}

export interface UpdateTenantPayload {
  name?: string;
  email?: string;
  phone_number?: string;
  admin_name?: string;
  admin_email?: string;
  admin_phone?: string;
  is_active?: boolean;
  is_archived?: boolean;
  plan?: string;
  subscription_status?: SubscriptionStatus;
  default_payment_method?: PaymentMethodType;
  stripe_customer_id?: string;
  paypal_payer_id?: string;
  payment_metadata?: Record<string, any>;
}

// ─── Payment Gateways ────────────────────────────────────────────────────────
// Note: "stripe" is used for the gateway type, while "card" might be used 
// for the actual transaction method in the Payment model.
export type GatewayType = "mpesa" | "airtel_money" | "bank" | "stripe" | "paypal";
export type GatewayEnvironment = "sandbox" | "production";

export interface PaymentGatewayConfig {
  id: number;
  tenant_id: number;
  type: GatewayType;
  is_active: boolean;
  environment: GatewayEnvironment;
  // Dynamic masked credentials (e.g., consumer_key: "****1234")
  [key: string]: any; 
}

export interface PaymentGatewayPayload {
  environment?: GatewayEnvironment;
  is_active?: boolean;
  // Dynamic credentials to send to the backend (e.g., consumer_key, secret_key)
  [key: string]: any; 
}

// ─── Agency Health Dashboard Types ───────────────────────────────────────────
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type TrendDirection = 'up' | 'down' | 'stable';

export interface HealthScore { score: number; riskLevel: RiskLevel; trend: TrendDirection; lastCalculatedAt: string; }
export interface ActivityPulse { loginsLast7Days: number; loginsLast30Days: number; activeDaysThisMonth: number; lastActiveAt: string | null; avgSessionDurationMinutes: number; }
export interface FleetUtilization { totalVehicles: number; activeVehicles: number; utilizationPercentage: number; idleVehiclesCount: number; }
export interface RevenueVelocity { bookingsThisWeek: number; bookingsLastWeek: number; bookingsThisMonth: number; trend: TrendDirection; weeklyData: number[]; }
export interface PaymentReliability { currentStreak: number; onTimePaymentRate: number; totalInvoicesPaid: number; overdueInvoicesCount: number; }
export interface FeatureAdoption { modulesUsed: string[]; totalAvailableModules: number; adoptionPercentage: number; mostUsedModule: string; leastUsedModule: string | null; }
export interface SupportTicketTrend { openTickets: number; closedThisMonth: number; avgResolutionTimeHours: number; trend: TrendDirection; }

export interface AgencyHealthData {
  score: HealthScore;
  activity: ActivityPulse;
  utilization: FleetUtilization;
  revenueVelocity: RevenueVelocity;
  paymentReliability: PaymentReliability;
  featureAdoption: FeatureAdoption;
  supportTickets: SupportTicketTrend;
}

// ─── UI & Misc Types ─────────────────────────────────────────────────────────
export interface ActivityLog {
  id: number;
  user_id?: number | null;
  action: string;
  description?: string | null;
  created_at: string;
}

export interface UserUpdatePayload {
  full_name?: string;
  email?: string;
  phone_number?: string;
  theme_preference?: string;
  density_preference?: string;
}

export type BadgeVariant = "success" | "warning" | "danger" | "accent" | "neutral" | "default";

// ─── Pagination ──────────────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
