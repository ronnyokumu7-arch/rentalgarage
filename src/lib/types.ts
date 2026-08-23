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
  | "maintenance" | "awaiting_mileage" | "retired";

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
}

export interface VehicleUpdate {
  make?: string;
  model?: string;
  year?: number;
  plate_number?: string;
  vin?: string | null;
  daily_rate?: number;
  status?: VehicleStatus;
  current_mileage?: number;
  next_service_km?: number | null;
  insurance_number?: string | null;
  insurance_expiry?: string | null;
  insurance_doc?: string | null;
  registration_doc?: string | null;
  inspection_doc?: string | null;
  notes?: string | null;
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
  | "pending" | "confirmed" | "active" | "awaiting_mileage"
  | "completed" | "cancelled" | "no_show";

// ✅ MILESTONE 1.1: Service type enum (backend-defined catalog)
export type ServiceType = 
  | "selfdrive" 
  | "chauffeur_pro_driver" 
  | "chauffeur_wedding"
  // Parked (defined in backend, not yet active):
  | "chauffeur_hourly"
  | "corporate"
  | "city_excursion"
  | "airport_transfer"
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

// ✅ MILESTONE 1.1: Service catalog (from GET /services/)
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

  // ✅ MILESTONE 1: Service type + exact times + pricing snapshot
  service_type: ServiceType;
  pickup_at?: string | null;
  scheduled_return_at?: string | null;
  pricing_day_hours?: number | null;
  pricing_grace_minutes?: number | null;
  pricing_overtime_hourly_rate?: number | string | null;

  // ✅ MILESTONE 2: Driver assignment (scalar FK)
  driver_id?: number | null;

  // Joined Relations
  client?: BookingClientRelation | null;
  vehicle?: BookingVehicleRelation | null;
  driver?: Driver | null;  // ✅ MILESTONE 2: nested DriverOut (full detail for detail views)
  
  // ✅ Nested relations often returned by backend
  contract?: Contract | null;
  invoices?: Invoice[];
  total_price?: string | number | null;
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
  total_amount: number;
  currency_code?: string;
  
  // ✅ MILESTONE 1: Service type + exact times
  service_type?: ServiceType;
  pickup_at?: string;
  scheduled_return_at?: string;

  // ✅ MILESTONE 2: Optional driver assignment
  driver_id?: number | null;
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
  status?: BookingStatus;
  
  // ✅ MILESTONE 1: Service type + exact times
  service_type?: ServiceType;
  pickup_at?: string;
  scheduled_return_at?: string;

  // ✅ MILESTONE 2: Optional driver reassignment / unassignment (null clears)
  driver_id?: number | null;
}

// ✅ MILESTONE 1.1: Live pricing preview request (no DB writes)
export interface BookingQuote {
  vehicle_id: number;
  service_type: ServiceType;
  pickup_at: string;
  return_at: string;
  // ✅ MILESTONE 2: Optional driver for per-driver fee resolution
  driver_id?: number | null;
  // ✅ Future-proof for distance_time, fixed_route, route_stops
  distance_km?: number;
  route_key?: string;
  stops?: number;
}

// ✅ MILESTONE 1: Pricing breakdown response from /quote endpoint
export interface PricingLine {
  description: string;
  quantity: string;
  amount: number | string;
}

export interface PricingResult {
  service_type: ServiceType;
  service_label: string;
  billing_model: BillingModel;  // ✅ MILESTONE 1.1: strategy used
  pickup_at: string;
  return_at: string;
  daily_rate: number | string;
  day_hours: number;
  grace_minutes: number;
  overtime_hourly_rate: number | string;
  included_days: number;
  extra_hours: number;
  grace_used_minutes: number;
  base_charge: number | string;
  overtime_charge: number | string;
  overtime_waivable: boolean;
  driver_daily_fee: number | string;
  driver_overtime_fee: number | string;
  driver_accommodation_fee: number | string;
  driver_charge: number | string;
  total: number | string;
  lines: PricingLine[];
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
  client_signed_at: string | null;
  signed_at: string | null; 
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

  // ✅ NEW: Owning Tenant's branding (resolved from the contract's tenant)
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

export interface Invoice {
  id: number;
  tenant_id: number;
  booking_id: number | null;
  invoice_number: string;
  status: InvoiceStatus;
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
  status?: InvoiceStatus;
}

// ─── Public Invoice Views ────────────────────────────────────────────────────
export interface PublicPaymentDetails {
  method_type?: string | null;
  mpesa_paybill?: string | null;
  mpesa_paybill_account?: string | null;
  mpesa_till?: string | null;
  mpesa_pochi?: string | null;
  mpesa_number?: string | null;
  airtel_number?: string | null;
  
  bank_name?: string | null;
  bank_account?: string | null;
  bank_account_name?: string | null;
  bank_account_number?: string | null;
  business_shortcode?: string | null;
  till_number?: string | null;
  account_number?: string | null;
  account_name?: string | null;
  branch_code?: string | null;
  swift_code?: string | null;
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
  due_date: string;
  remaining_balance?: number | string | null;
  payment_details?: PublicPaymentDetails | null;
  created_at: string;

  // ✅ MILESTONE 2: Assigned driver (null for self-drive bookings)
  driver_name?: string | null;
  driver_phone?: string | null;
  driver_dl_number?: string | null;
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
