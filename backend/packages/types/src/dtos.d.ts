import { z } from 'zod';
import { PolicyStatus, PolicyTheme, ContributionType, SenegalRegion, SourceType } from './enums';
export declare const PaginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
}, {
    page?: number | undefined;
    limit?: number | undefined;
}>;
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
export declare const CreatePolicySchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    ministryId: z.ZodString;
    theme: z.ZodNativeEnum<typeof PolicyTheme>;
    status: z.ZodDefault<z.ZodNativeEnum<typeof PolicyStatus>>;
    budget: z.ZodOptional<z.ZodNumber>;
    budgetSpent: z.ZodOptional<z.ZodNumber>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
    targetKpis: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        target: z.ZodNumber;
        current: z.ZodDefault<z.ZodNumber>;
        unit: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        target: number;
        current: number;
        unit: string;
    }, {
        name: string;
        target: number;
        unit: string;
        current?: number | undefined;
    }>, "many">>>;
    region: z.ZodOptional<z.ZodNativeEnum<typeof SenegalRegion>>;
}, "strip", z.ZodTypeAny, {
    status: PolicyStatus;
    title: string;
    description: string;
    ministryId: string;
    theme: PolicyTheme;
    targetKpis: {
        name: string;
        target: number;
        current: number;
        unit: string;
    }[];
    budget?: number | undefined;
    budgetSpent?: number | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    region?: SenegalRegion | undefined;
}, {
    title: string;
    description: string;
    ministryId: string;
    theme: PolicyTheme;
    status?: PolicyStatus | undefined;
    budget?: number | undefined;
    budgetSpent?: number | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    targetKpis?: {
        name: string;
        target: number;
        unit: string;
        current?: number | undefined;
    }[] | undefined;
    region?: SenegalRegion | undefined;
}>;
export type CreatePolicyDto = z.infer<typeof CreatePolicySchema>;
export declare const UpdatePolicySchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    ministryId: z.ZodOptional<z.ZodString>;
    theme: z.ZodOptional<z.ZodNativeEnum<typeof PolicyTheme>>;
    status: z.ZodOptional<z.ZodDefault<z.ZodNativeEnum<typeof PolicyStatus>>>;
    budget: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    budgetSpent: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    startDate: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    endDate: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    targetKpis: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        target: z.ZodNumber;
        current: z.ZodDefault<z.ZodNumber>;
        unit: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        target: number;
        current: number;
        unit: string;
    }, {
        name: string;
        target: number;
        unit: string;
        current?: number | undefined;
    }>, "many">>>>;
    region: z.ZodOptional<z.ZodOptional<z.ZodNativeEnum<typeof SenegalRegion>>>;
}, "strip", z.ZodTypeAny, {
    status?: PolicyStatus | undefined;
    title?: string | undefined;
    description?: string | undefined;
    ministryId?: string | undefined;
    theme?: PolicyTheme | undefined;
    budget?: number | undefined;
    budgetSpent?: number | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    targetKpis?: {
        name: string;
        target: number;
        current: number;
        unit: string;
    }[] | undefined;
    region?: SenegalRegion | undefined;
}, {
    status?: PolicyStatus | undefined;
    title?: string | undefined;
    description?: string | undefined;
    ministryId?: string | undefined;
    theme?: PolicyTheme | undefined;
    budget?: number | undefined;
    budgetSpent?: number | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    targetKpis?: {
        name: string;
        target: number;
        unit: string;
        current?: number | undefined;
    }[] | undefined;
    region?: SenegalRegion | undefined;
}>;
export type UpdatePolicyDto = z.infer<typeof UpdatePolicySchema>;
export declare const PolicyFilterSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    theme: z.ZodOptional<z.ZodNativeEnum<typeof PolicyTheme>>;
    status: z.ZodOptional<z.ZodNativeEnum<typeof PolicyStatus>>;
    ministryId: z.ZodOptional<z.ZodString>;
    region: z.ZodOptional<z.ZodNativeEnum<typeof SenegalRegion>>;
    search: z.ZodOptional<z.ZodString>;
    from: z.ZodOptional<z.ZodString>;
    to: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    status?: PolicyStatus | undefined;
    ministryId?: string | undefined;
    theme?: PolicyTheme | undefined;
    region?: SenegalRegion | undefined;
    search?: string | undefined;
    from?: string | undefined;
    to?: string | undefined;
}, {
    page?: number | undefined;
    limit?: number | undefined;
    status?: PolicyStatus | undefined;
    ministryId?: string | undefined;
    theme?: PolicyTheme | undefined;
    region?: SenegalRegion | undefined;
    search?: string | undefined;
    from?: string | undefined;
    to?: string | undefined;
}>;
export type PolicyFilterDto = z.infer<typeof PolicyFilterSchema>;
export declare const ChangeStatusSchema: z.ZodObject<{
    status: z.ZodNativeEnum<typeof PolicyStatus>;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: PolicyStatus;
    reason?: string | undefined;
}, {
    status: PolicyStatus;
    reason?: string | undefined;
}>;
export type ChangeStatusDto = z.infer<typeof ChangeStatusSchema>;
export declare const CreateSourceSchema: z.ZodObject<{
    url: z.ZodString;
    title: z.ZodString;
    type: z.ZodDefault<z.ZodNativeEnum<typeof SourceType>>;
}, "strip", z.ZodTypeAny, {
    type: SourceType;
    title: string;
    url: string;
}, {
    title: string;
    url: string;
    type?: SourceType | undefined;
}>;
export type CreateSourceDto = z.infer<typeof CreateSourceSchema>;
export declare const RegisterSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    name: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    consent: z.ZodEffects<z.ZodBoolean, boolean, boolean>;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    password: string;
    consent: boolean;
    phone?: string | undefined;
}, {
    name: string;
    email: string;
    password: string;
    consent: boolean;
    phone?: string | undefined;
}>;
export type RegisterDto = z.infer<typeof RegisterSchema>;
export declare const LoginSchema: z.ZodObject<{
    email: z.ZodEffects<z.ZodString, string, string>;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export type LoginDto = z.infer<typeof LoginSchema>;
export declare const OtpVerifySchema: z.ZodObject<{
    phone: z.ZodString;
    code: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: string;
    phone: string;
}, {
    code: string;
    phone: string;
}>;
export type OtpVerifyDto = z.infer<typeof OtpVerifySchema>;
export declare const CreateContributionSchema: z.ZodObject<{
    policyId: z.ZodString;
    type: z.ZodNativeEnum<typeof ContributionType>;
    content: z.ZodString;
    location: z.ZodOptional<z.ZodString>;
    region: z.ZodOptional<z.ZodNativeEnum<typeof SenegalRegion>>;
}, "strip", z.ZodTypeAny, {
    type: ContributionType;
    policyId: string;
    content: string;
    region?: SenegalRegion | undefined;
    location?: string | undefined;
}, {
    type: ContributionType;
    policyId: string;
    content: string;
    region?: SenegalRegion | undefined;
    location?: string | undefined;
}>;
export type CreateContributionDto = z.infer<typeof CreateContributionSchema>;
export declare const CreateCommentSchema: z.ZodObject<{
    policyId: z.ZodString;
    parentId: z.ZodOptional<z.ZodString>;
    body: z.ZodString;
}, "strip", z.ZodTypeAny, {
    policyId: string;
    body: string;
    parentId?: string | undefined;
}, {
    policyId: string;
    body: string;
    parentId?: string | undefined;
}>;
export type CreateCommentDto = z.infer<typeof CreateCommentSchema>;
export declare const VoteSchema: z.ZodObject<{
    targetId: z.ZodString;
    targetType: z.ZodEnum<["POLICY", "CONTRIBUTION", "COMMENT"]>;
    value: z.ZodUnion<[z.ZodLiteral<1>, z.ZodLiteral<-1>]>;
}, "strip", z.ZodTypeAny, {
    value: 1 | -1;
    targetId: string;
    targetType: "POLICY" | "CONTRIBUTION" | "COMMENT";
}, {
    value: 1 | -1;
    targetId: string;
    targetType: "POLICY" | "CONTRIBUTION" | "COMMENT";
}>;
export type VoteDto = z.infer<typeof VoteSchema>;
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
