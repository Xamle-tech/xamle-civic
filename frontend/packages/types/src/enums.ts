// ============================================================
// Xamle Civic — Shared Enums
// ============================================================

export enum PolicyStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  DELAYED = 'DELAYED',
  COMPLETED = 'COMPLETED',
  ABANDONED = 'ABANDONED',
  REFORMULATED = 'REFORMULATED',
}

export enum PolicyTheme {
  HEALTH = 'HEALTH',
  EDUCATION = 'EDUCATION',
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  AGRICULTURE = 'AGRICULTURE',
  JUSTICE = 'JUSTICE',
  SECURITY = 'SECURITY',
  DIGITAL = 'DIGITAL',
  ENVIRONMENT = 'ENVIRONMENT',
  OTHER = 'OTHER',
}

export enum SourceType {
  OFFICIAL = 'OFFICIAL',
  VERIFIED = 'VERIFIED',
  REPORTED = 'REPORTED',
  UNVERIFIED = 'UNVERIFIED',
}

export enum ContributionType {
  TESTIMONY = 'TESTIMONY',
  DOCUMENT = 'DOCUMENT',
  LINK = 'LINK',
  PHOTO = 'PHOTO',
}

export enum ContributionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  EDITOR = 'EDITOR',
  CONTRIBUTOR = 'CONTRIBUTOR',
  VISITOR = 'VISITOR',
}

export enum UserLevel {
  OBSERVER = 'OBSERVER',
  CONTRIBUTOR = 'CONTRIBUTOR',
  EXPERT = 'EXPERT',
  AMBASSADOR = 'AMBASSADOR',
}

export enum WorkflowStatus {
  DRAFT = 'DRAFT',
  REVIEW = 'REVIEW',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum VoteTargetType {
  POLICY = 'POLICY',
  CONTRIBUTION = 'CONTRIBUTION',
  COMMENT = 'COMMENT',
}

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  IN_APP = 'IN_APP',
}

export enum SenegalRegion {
  DAKAR = 'DAKAR',
  THIES = 'THIES',
  SAINT_LOUIS = 'SAINT_LOUIS',
  LOUGA = 'LOUGA',
  FATICK = 'FATICK',
  KAOLACK = 'KAOLACK',
  DIOURBEL = 'DIOURBEL',
  ZIGUINCHOR = 'ZIGUINCHOR',
  KOLDA = 'KOLDA',
  TAMBACOUNDA = 'TAMBACOUNDA',
  KEDOUGOU = 'KEDOUGOU',
  MATAM = 'MATAM',
  KAFFRINE = 'KAFFRINE',
  SEDHIOU = 'SEDHIOU',
}
