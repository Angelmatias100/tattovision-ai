// ── TattooVision AI — Core domain types ──────────────────────

// Studio & Artists
export interface Studio {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  planId: "starter" | "pro" | "agency";
  tvTokensBalance: number;
  tvTokensUsedThisMonth: number;
  createdAt: string;
}

export interface Artist {
  id: string;
  studioId: string;
  userId: string;
  name: string;
  specialty: string;
  avatarUrl?: string;
  instagramHandle?: string;
  isActive: boolean;
}

// CRM / Leads
export type LeadStatus =
  | "nuevo"
  | "contactado"
  | "cotizacion"
  | "reservado"
  | "completado"
  | "perdido";

export interface Lead {
  id: string;
  studioId: string;
  artistId?: string;
  name: string;
  phone?: string;
  email?: string;
  instagramHandle?: string;
  source: "instagram" | "facebook" | "web" | "referido" | "otro";
  status: LeadStatus;
  tattooDescription?: string;
  estimatedValueUsd?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Agenda / Appointments
export type AppointmentStatus =
  | "pendiente"
  | "confirmada"
  | "completada"
  | "cancelada"
  | "no_show";

export interface Appointment {
  id: string;
  studioId: string;
  artistId: string;
  leadId?: string;
  clientName: string;
  clientPhone?: string;
  startAt: string;
  endAt: string;
  status: AppointmentStatus;
  tattooDescription?: string;
  depositPaidUsd?: number;
  totalPriceUsd?: number;
  notes?: string;
}

// Campaigns (Meta Ads)
export type CampaignStatus =
  | "borrador"
  | "en_revision"
  | "activa"
  | "pausada"
  | "finalizada";

export type CampaignObjective =
  | "awareness"
  | "leads"
  | "conversiones"
  | "trafico";

export interface Campaign {
  id: string;
  studioId: string;
  name: string;
  objective: CampaignObjective;
  status: CampaignStatus;
  budgetDailyUsd: number;
  startDate: string;
  endDate?: string;
  metaCampaignId?: string;
  tvTokensSpent: number;
  impressions?: number;
  clicks?: number;
  leads?: number;
  costPerLeadUsd?: number;
  createdAt: string;
}

// Content
export type ContentType = "copy_post" | "hook_reel" | "historia" | "caption";

export interface ContentIdea {
  id: string;
  studioId: string;
  artistId?: string;
  type: ContentType;
  title: string;
  body: string;
  hook?: string;
  hashtags: string[];
  scheduledAt?: string;
  published: boolean;
  tvTokensSpent: number;
  createdAt: string;
}

// TV Tokens ledger
export type TVTokenAction =
  | "CREATE_CAMPAIGN"
  | "AI_STRATEGY"
  | "CONTENT_IDEA"
  | "AUTOMATION_SENT"
  | "ANALYTICS_REPORT"
  | "PURCHASE"
  | "MONTHLY_RESET";

export interface TVTokenTransaction {
  id: string;
  studioId: string;
  action: TVTokenAction;
  amount: number; // positive = credit, negative = debit
  balanceAfter: number;
  description?: string;
  createdAt: string;
}

// Automations
export type AutomationTrigger =
  | "lead_created"
  | "appointment_reminder"
  | "no_show_followup"
  | "post_appointment";

export interface Automation {
  id: string;
  studioId: string;
  name: string;
  trigger: AutomationTrigger;
  delayMinutes: number;
  messageTemplate: string;
  isActive: boolean;
  sentCount: number;
  tvTokensSpentTotal: number;
}

// API response wrappers
export interface ApiSuccess<T> {
  data: T;
  error: null;
}

export interface ApiError {
  data: null;
  error: { message: string; code?: string };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
