// Enum-like constants for SQLite compatibility
// These mirror the values that would be in Prisma enums

export const Role = {
  AGENT: 'AGENT',
  ANALYTICS: 'ANALYTICS',
  MANAGEMENT: 'MANAGEMENT',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const CustomerStage = {
  PROSPECTING: 'PROSPECTING',
  PRE_SALES: 'PRE_SALES',
  SALES: 'SALES',
  POST_PURCHASE: 'POST_PURCHASE',
  SERVICE: 'SERVICE',
  FIDELITY: 'FIDELITY',
} as const;

export type CustomerStage = (typeof CustomerStage)[keyof typeof CustomerStage];

export const CustomerSource = {
  REFERRAL: 'REFERRAL',
  WEBSITE: 'WEBSITE',
  PARTNERSHIP: 'PARTNERSHIP',
  DIRECT: 'DIRECT',
  OTHER: 'OTHER',
} as const;

export type CustomerSource = (typeof CustomerSource)[keyof typeof CustomerSource];

export const ProductCategory = {
  SPLIT: 'SPLIT',
  INSTALLATION: 'INSTALLATION',
  MAINTENANCE: 'MAINTENANCE',
  ACCESSORY: 'ACCESSORY',
} as const;

export type ProductCategory = (typeof ProductCategory)[keyof typeof ProductCategory];

export const SaleStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type SaleStatus = (typeof SaleStatus)[keyof typeof SaleStatus];

export const InteractionType = {
  CALL: 'CALL',
  EMAIL: 'EMAIL',
  VISIT: 'VISIT',
  WHATSAPP: 'WHATSAPP',
  NOTE: 'NOTE',
} as const;

export type InteractionType = (typeof InteractionType)[keyof typeof InteractionType];

export const ReferralStatus = {
  PENDING: 'PENDING',
  CONVERTED: 'CONVERTED',
  EXPIRED: 'EXPIRED',
} as const;

export type ReferralStatus = (typeof ReferralStatus)[keyof typeof ReferralStatus];

export const CommissionRuleType = {
  PRODUCT: 'PRODUCT',
  AGENT: 'AGENT',
  VOLUME: 'VOLUME',
  BONUS: 'BONUS',
} as const;

export type CommissionRuleType = (typeof CommissionRuleType)[keyof typeof CommissionRuleType];

export const LeadStatus = {
  NEW: 'NEW',
  CONTACTED: 'CONTACTED',
  QUALIFIED: 'QUALIFIED',
  PROPOSAL: 'PROPOSAL',
  NEGOTIATION: 'NEGOTIATION',
  WON: 'WON',
  LOST: 'LOST',
} as const;

export type LeadStatus = (typeof LeadStatus)[keyof typeof LeadStatus];
