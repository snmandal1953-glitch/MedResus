export type Rhythm = "VF" | "pVT" | "PEA" | "Asystole" | "Unknown" | "ROSC";

// Role types
export type RoleId = 'compressor1' | 'compressor2' | 'airway' | 'drugs' | 'ivio' | 'defib' | 'lead' | 'recorder';

export type RoleAssignment = {
  roleId: RoleId;
  name: string;
  assignedAt: number;
  notes?: string;
};

// Base event types
export interface BaseEvent {
  id: string;
  ts: number;
  tRelMs: number;
  who?: string;
  section: string;
  action: string;
  details?: string;
  role?: RoleId;
}

export interface RoleTransitionEvent extends BaseEvent {
  type: 'role_transition';
  name: string;
  fromRole?: RoleId;
  toRole: RoleId;
}

export interface AirwayEvent extends BaseEvent {
  type: 'airway';
  technique: 'basic' | 'advanced';
  step: string;
}

export interface TeamAction extends BaseEvent {
  type: 'team_action';
  actor: string; // explicit actor if different from who
  roleName?: string; // human readable role label
}

export interface ResourceUse extends BaseEvent {
  type: 'resource_use';
  resource: string; // e.g., "Defibrillator", "Ventilator"
  quantity?: number;
  purpose?: string;
}

export interface QualityMetric extends BaseEvent {
  type: 'quality_metric';
  metric: string;
  value: string | number;
  benchmark?: string;
}

export type EventLog =
  | BaseEvent
  | RoleTransitionEvent
  | RescEndedEvent
  | RoscEvent
  | ReversibleCauseEvent
  | RhythmAnalysisEvent
  | AirwayEvent
  | TeamAction
  | ResourceUse
  | QualityMetric;

// Event types for enhanced documentation
export interface RescEndedEvent extends BaseEvent {
  type: 'resuscitation_ended';
  reason: string;
  cause: string;
  notes?: string;
}

export interface RoscEvent extends BaseEvent {
  type: 'rosc_achieved';
  cause: string;
  team: string;
  notes?: string;
}

export interface ReversibleCauseEvent extends BaseEvent {
  type: 'reversible_cause_note';
  cause: string;
  discussion: string;
  intervention: string;
}

export interface RhythmAnalysisEvent extends BaseEvent {
  type: 'rhythm_analysis';
  rhythm: string;
  analysis: string;
  plan: string;
}

export type CaseState = {
  caseId: string;
  startedAt: number;
  events: EventLog[];
  shockCount?: number;
  lastAdrenalineTs?: number;
  location?: string;
  uhid?: string;
  airwayAdvanced?: boolean;
  paused?: boolean;
  cycleCount?: number;
  rhythm?: Rhythm;
  weightKg?: number;
  role?: "Nurse" | "Doctor" | "EMT";
};

export type ProcedureChip = {
  group: string; // e.g., "Airway", "Breathing", "Access"
  label: string; // e.g., "OPA Size 3"
  value?: string; // size/value like "3", "7.5 mm", "28 Fr"
  note?: string; // any quick tip
};

export type ArchivedCase = {
  id: string;
  startedAt: number; // epoch ms
  log: EventLog[];
};
