// ============================================================
// Xamle Civic — Shared Model Types
// ============================================================

import {
  PolicyStatus,
  PolicyTheme,
  SourceType,
  ContributionType,
  ContributionStatus,
  UserRole,
  UserLevel,
  WorkflowStatus,
  VoteTargetType,
  NotificationChannel,
  SenegalRegion,
} from './enums';

export interface Ministry {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { policies: number };
}

export interface PolicyKpi {
  name: string;
  target: number;
  current: number;
  unit: string;
}

export interface Policy {
  id: string;
  title: string;
  slug: string;
  description: string;
  ministryId: string;
  ministry?: Ministry;
  theme: PolicyTheme;
  status: PolicyStatus;
  workflowStatus: WorkflowStatus;
  budget: number | null;
  budgetSpent: number | null;
  startDate: string | null;
  endDate: string | null;
  targetKpis: PolicyKpi[];
  version: number;
  publishedAt: string | null;
  region: SenegalRegion | null;
  createdAt: string;
  updatedAt: string;
  indicators?: Indicator[];
  sources?: Source[];
  statusHistory?: StatusHistory[];
  _count?: {
    contributions: number;
    comments: number;
    indicators: number;
  };
}

export interface PolicyVersion {
  id: string;
  policyId: string;
  version: number;
  snapshot: Omit<Policy, 'indicators' | 'sources' | 'statusHistory' | '_count'>;
  changedBy: string;
  createdAt: string;
}

export interface Indicator {
  id: string;
  policyId: string;
  name: string;
  unit: string;
  targetValue: number;
  currentValue: number;
  measuredAt: string;
  createdAt: string;
}

export interface StatusHistory {
  id: string;
  policyId: string;
  fromStatus: PolicyStatus | null;
  toStatus: PolicyStatus;
  changedBy: string;
  changedByUser?: Pick<User, 'id' | 'email' | 'name'>;
  reason: string | null;
  createdAt: string;
}

export interface Source {
  id: string;
  policyId: string;
  url: string;
  title: string;
  type: SourceType;
  archivedUrl: string | null;
  addedBy: string;
  addedByUser?: Pick<User, 'id' | 'email' | 'name'>;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: UserRole;
  level: UserLevel;
  oauthProvider: string | null;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
  _count?: {
    contributions: number;
    comments: number;
    votes: number;
  };
}

export interface Contribution {
  id: string;
  userId: string;
  user?: Pick<User, 'id' | 'email' | 'name' | 'avatarUrl' | 'level'>;
  policyId: string;
  policy?: Pick<Policy, 'id' | 'title' | 'slug'>;
  type: ContributionType;
  content: string;
  filePath: string | null;
  location: string | null;
  region: SenegalRegion | null;
  status: ContributionStatus;
  reliability: number;
  moderatorNote: string | null;
  votes?: Vote[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  user?: Pick<User, 'id' | 'email' | 'name' | 'avatarUrl' | 'level'>;
  policyId: string;
  parentId: string | null;
  children?: Comment[];
  body: string;
  votes?: Vote[];
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Vote {
  id: string;
  userId: string;
  targetId: string;
  targetType: VoteTargetType;
  value: 1 | -1;
  createdAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  policyId: string;
  policy?: Pick<Policy, 'id' | 'title' | 'slug'>;
  channels: NotificationChannel[];
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actor?: Pick<User, 'id' | 'email' | 'name'>;
  action: string;
  entity: string;
  entityId: string;
  payload: Record<string, unknown>;
  ipAddress: string | null;
  createdAt: string;
}

export interface MinistryStats {
  ministry: Ministry;
  totalPolicies: number;
  completedPolicies: number;
  inProgressPolicies: number;
  delayedPolicies: number;
  completionRate: number;
  totalBudget: number;
  budgetExecutionRate: number;
}

export interface GlobalStats {
  totalPolicies: number;
  completedPolicies: number;
  inProgressPolicies: number;
  delayedPolicies: number;
  globalCompletionRate: number;
  totalBudgetAllocated: number;
  totalBudgetSpent: number;
  totalContributions: number;
  totalUsers: number;
  byTheme: Record<PolicyTheme, { total: number; completed: number; rate: number }>;
  byRegion: Record<SenegalRegion, { total: number; completed: number }>;
}
