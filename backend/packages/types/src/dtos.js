"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoteSchema = exports.CreateCommentSchema = exports.CreateContributionSchema = exports.OtpVerifySchema = exports.LoginSchema = exports.RegisterSchema = exports.CreateSourceSchema = exports.ChangeStatusSchema = exports.PolicyFilterSchema = exports.UpdatePolicySchema = exports.CreatePolicySchema = exports.PaginationSchema = void 0;
const zod_1 = require("zod");
const enums_1 = require("./enums");
exports.PaginationSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
});
exports.CreatePolicySchema = zod_1.z.object({
    title: zod_1.z.string().min(5).max(300),
    description: zod_1.z.string().min(20).max(10000),
    ministryId: zod_1.z.string().uuid(),
    theme: zod_1.z.nativeEnum(enums_1.PolicyTheme),
    status: zod_1.z.nativeEnum(enums_1.PolicyStatus).default(enums_1.PolicyStatus.NOT_STARTED),
    budget: zod_1.z.number().positive().optional(),
    budgetSpent: zod_1.z.number().min(0).optional(),
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
    targetKpis: zod_1.z
        .array(zod_1.z.object({
        name: zod_1.z.string(),
        target: zod_1.z.number(),
        current: zod_1.z.number().default(0),
        unit: zod_1.z.string(),
    }))
        .optional()
        .default([]),
    region: zod_1.z.nativeEnum(enums_1.SenegalRegion).optional(),
});
exports.UpdatePolicySchema = exports.CreatePolicySchema.partial();
exports.PolicyFilterSchema = zod_1.z.object({
    theme: zod_1.z.nativeEnum(enums_1.PolicyTheme).optional(),
    status: zod_1.z.nativeEnum(enums_1.PolicyStatus).optional(),
    ministryId: zod_1.z.string().uuid().optional(),
    region: zod_1.z.nativeEnum(enums_1.SenegalRegion).optional(),
    search: zod_1.z.string().max(200).optional(),
    from: zod_1.z.string().datetime().optional(),
    to: zod_1.z.string().datetime().optional(),
    ...exports.PaginationSchema.shape,
});
exports.ChangeStatusSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(enums_1.PolicyStatus),
    reason: zod_1.z.string().max(1000).optional(),
});
exports.CreateSourceSchema = zod_1.z.object({
    url: zod_1.z.string().url(),
    title: zod_1.z.string().min(3).max(500),
    type: zod_1.z.nativeEnum(enums_1.SourceType).default(enums_1.SourceType.UNVERIFIED),
});
exports.RegisterSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z
        .string()
        .min(8)
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Must contain uppercase, lowercase and digit'),
    name: zod_1.z.string().min(2).max(100),
    phone: zod_1.z
        .string()
        .regex(/^\+221[0-9]{9}$/)
        .optional(),
    consent: zod_1.z.boolean().refine((v) => v === true, 'Consent is required'),
});
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email().transform(v => v.trim().toLowerCase()),
    password: zod_1.z.string().min(1),
});
exports.OtpVerifySchema = zod_1.z.object({
    phone: zod_1.z.string().regex(/^\+221[0-9]{9}$/),
    code: zod_1.z.string().length(6),
});
exports.CreateContributionSchema = zod_1.z.object({
    policyId: zod_1.z.string().uuid(),
    type: zod_1.z.nativeEnum(enums_1.ContributionType),
    content: zod_1.z.string().min(10).max(5000),
    location: zod_1.z.string().max(200).optional(),
    region: zod_1.z.nativeEnum(enums_1.SenegalRegion).optional(),
});
exports.CreateCommentSchema = zod_1.z.object({
    policyId: zod_1.z.string().uuid(),
    parentId: zod_1.z.string().uuid().optional(),
    body: zod_1.z.string().min(3).max(2000),
});
exports.VoteSchema = zod_1.z.object({
    targetId: zod_1.z.string().uuid(),
    targetType: zod_1.z.enum(['POLICY', 'CONTRIBUTION', 'COMMENT']),
    value: zod_1.z.union([zod_1.z.literal(1), zod_1.z.literal(-1)]),
});
//# sourceMappingURL=dtos.js.map