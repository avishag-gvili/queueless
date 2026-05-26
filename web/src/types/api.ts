// Types matching backend Pydantic schemas exactly.

export type UserRole = "customer" | "business_owner";

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "no_show";

// ── Auth ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
}

// ── Business ─────────────────────────────────────────────────────────────────

export type BusinessCategory =
  | 'barbershop_men'
  | 'hair_salon_women'
  | 'nail_salon'
  | 'eyebrows'
  | 'makeup'
  | 'cosmetician'
  | 'spa'
  | 'massage'
  | 'tattoo'
  | 'piercing'
  | 'laser_hair_removal'
  | 'doctor'
  | 'dentist'
  | 'physiotherapy'
  | 'psychologist'
  | 'nutritionist'
  | 'alternative_medicine'
  | 'veterinary'
  | 'pet_grooming'
  | 'yoga'
  | 'pilates'
  | 'personal_training'
  | 'dance_studio'
  | 'music_lessons'
  | 'tutoring'
  | 'driving_school'
  | 'photography'
  | 'event_planning'
  | 'car_wash'
  | 'car_repair'
  | 'cleaning_service'
  | 'other';

export const HEBREW_CATEGORY_LABELS: Record<BusinessCategory, string> = {
  barbershop_men: 'מספרת גברים',
  hair_salon_women: 'מספרת נשים',
  nail_salon: 'מניקור ופדיקור',
  eyebrows: 'גבות וריסים',
  makeup: 'איפור',
  cosmetician: 'קוסמטיקה',
  spa: 'ספא',
  massage: 'עיסוי',
  tattoo: 'קעקועים',
  piercing: 'פירסינג',
  laser_hair_removal: 'הסרת שיער בלייזר',
  doctor: 'רופא',
  dentist: 'רופא שיניים',
  physiotherapy: 'פיזיותרפיה',
  psychologist: 'פסיכולוג',
  nutritionist: 'דיאטנית',
  alternative_medicine: 'רפואה משלימה',
  veterinary: 'וטרינר',
  pet_grooming: 'טיפוח חיות מחמד',
  yoga: 'יוגה',
  pilates: 'פילאטיס',
  personal_training: 'מאמן כושר אישי',
  dance_studio: 'סטודיו לריקוד',
  music_lessons: 'שיעורי מוסיקה',
  tutoring: 'שיעורים פרטיים',
  driving_school: 'בית ספר לנהיגה',
  photography: 'צילום',
  event_planning: 'הפקת אירועים',
  car_wash: 'שטיפת רכב',
  car_repair: 'מוסך',
  cleaning_service: 'שירותי ניקיון',
  other: 'אחר',
};

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  city: string | null;
  timezone: string; // always "Asia/Jerusalem", kept for forward compat
  category: BusinessCategory;
  customer_data_retention_days: number;
  created_at: string;
  updated_at: string;
}

export interface BusinessPublicRead {
  id: string;
  name: string;
  description: string | null;
  city: string | null;
  category: BusinessCategory;
}

export interface BusinessCreate {
  name: string;
  description?: string;
  city?: string;
  category?: BusinessCategory;
  customer_data_retention_days?: number;
}

export interface BusinessUpdate {
  name?: string;
  description?: string;
  city?: string;
  category?: BusinessCategory;
  customer_data_retention_days?: number;
}

export interface PublicBusinessList {
  items: BusinessPublicRead[];
  total: number;
  limit: number;
  offset: number;
}

// ── Service ──────────────────────────────────────────────────────────────────

export interface Service {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  duration_minutes: number | null; // null = open duration ("משך פתוח")
  price: string | null; // Decimal serialised as string
  active: boolean;
  customer_data_retention_days_override: number | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceCreate {
  name: string;
  description?: string;
  duration_minutes?: number | null;
  price?: number;
  customer_data_retention_days_override?: number | null;
}

export interface ServiceUpdate {
  name?: string;
  description?: string;
  duration_minutes?: number | null;
  price?: number;
  customer_data_retention_days_override?: number | null;
}

// ── Working Hours ─────────────────────────────────────────────────────────────

export interface WorkingHours {
  id: string;
  business_id: string;
  day_of_week: number; // 0=Sun … 6=Sat
  open_time: string; // "HH:MM:SS"
  close_time: string;
}

export interface WorkingHoursCreate {
  day_of_week: number;
  open_time: string;
  close_time: string;
}

// ── Availability ──────────────────────────────────────────────────────────────

export interface Slot {
  starts_at: string; // ISO datetime UTC
  ends_at: string;
}

// ── Appointment ───────────────────────────────────────────────────────────────

export interface Appointment {
  id: string;
  service_id: string;
  customer_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  starts_at: string;
  ends_at: string;
  status: AppointmentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Denormalised — populated when available
  service_name: string | null;
  business_name: string | null;
  service_duration_minutes: number | null; // null = open duration
  anonymized_at: string | null;
}

export interface AppointmentCreate {
  service_id: string;
  starts_at: string; // UTC ISO
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  notes?: string;
}

export interface AppointmentStatusUpdate {
  status: AppointmentStatus;
}
