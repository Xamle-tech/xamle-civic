// ============================================================
// Xamle Civic — Shared DTOs (validated via Zod)
// ============================================================

import { z } from 'zod';
import { PolicyStatus, PolicyTheme, ContributionType, SenegalRegion, SourceType } from './enums';

// ─── Pagination ─────────────────────────────────────────────
export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type PaginationDto = z.infer<typeof PaginationSchema>;

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ─── Policy ─────────────────────────────────────────────────
export const CreatePolicySchema = z.object({
  title: z.string().min(5).max(300),
  description: z.string().min(20).max(10000),
  ministryId: z.string().uuid(),
  theme: z.nativeEnum(PolicyTheme),
  status: z.nativeEnum(PolicyStatus).default(PolicyStatus.NOT_STARTED),
  budget: z.number().positive().optional(),
  budgetSpent: z.number().min(0).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  targetKpis: z
    .array(
      z.object({
        name: z.string(),
        target: z.number(),
        current: z.number().default(0),
        unit: z.string(),
      }),
    )
    .optional()
    .default([]),
  region: z.nativeEnum(SenegalRegion).optional(),
});
export type CreatePolicyDto = z.infer<typeof CreatePolicySchema>;

export const UpdatePolicySchema = CreatePolicySchema.partial();
export type UpdatePolicyDto = z.infer<typeof UpdatePolicySchema>;

export const PolicyFilterSchema = z.object({
  theme: z.nativeEnum(PolicyTheme).optional(),
  status: z.nativeEnum(PolicyStatus).optional(),
  ministryId: z.string().uuid().optional(),
  region: z.nativeEnum(SenegalRegion).optional(),
  search: z.string().max(200).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  ...PaginationSchema.shape,
});
export type PolicyFilterDto = z.infer<typeof PolicyFilterSchema>;

export const ChangeStatusSchema = z.object({
  status: z.nativeEnum(PolicyStatus),
  reason: z.string().max(1000).optional(),
});
export type ChangeStatusDto = z.infer<typeof ChangeStatusSchema>;

// ─── Source ─────────────────────────────────────────────────
export const CreateSourceSchema = z.object({
  url: z.string().url(),
  title: z.string().min(3).max(500),
  type: z.nativeEnum(SourceType).default(SourceType.UNVERIFIED),
});
export type CreateSourceDto = z.infer<typeof CreateSourceSchema>;

// ─── Auth ───────────────────────────────────────────────────
export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Must contain uppercase, lowercase and digit'),
  name: z.string().min(2).max(100),
  phone: z
    .string()
    .regex(/^\+221[0-9]{9}$/)
    .optional(),
  consent: z.boolean().refine((v) => v === true, 'Consent is required'),
});
export type RegisterDto = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().email().transform(v => v.trim().toLowerCase()),
  password: z.string().min(1),
});
export type LoginDto = z.infer<typeof LoginSchema>;

export const OtpVerifySchema = z.object({
  phone: z.string().regex(/^\+221[0-9]{9}$/),
  code: z.string().length(6),
});
export type OtpVerifyDto = z.infer<typeof OtpVerifySchema>;

// ─── Contribution ───────────────────────────────────────────
export const CreateContributionSchema = z.object({
  policyId: z.string().uuid(),
  type: z.nativeEnum(ContributionType),
  content: z.string().min(10).max(5000),
  location: z.string().max(200).optional(),
  region: z.nativeEnum(SenegalRegion).optional(),
});
export type CreateContributionDto = z.infer<typeof CreateContributionSchema>;

// ─── Comment ────────────────────────────────────────────────
export const CreateCommentSchema = z.object({
  policyId: z.string().uuid(),
  parentId: z.string().uuid().optional(),
  body: z.string().min(3).max(2000),
});
export type CreateCommentDto = z.infer<typeof CreateCommentSchema>;

// ─── Vote ───────────────────────────────────────────────────
export const VoteSchema = z.object({
  targetId: z.string().uuid(),
  targetType: z.enum(['POLICY', 'CONTRIBUTION', 'COMMENT']),
  value: z.union([z.literal(1), z.literal(-1)]),
});
export type VoteDto = z.infer<typeof VoteSchema>;

// ─── API responses ──────────────────────────────────────────
export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface AuthTokens {
  accessToken: string;
  expiresIn: number;
}
