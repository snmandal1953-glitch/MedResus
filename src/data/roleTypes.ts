export type RoleId = 'compressor1' | 'compressor2' | 'airway' | 'drugs' | 'ivio' | 'defib' | 'lead' | 'recorder';

export interface RoleAssignment {
  roleId: RoleId;
  name: string;
  assignedAt: number;
  action?: string;
}

export interface RoleTransitionEvent {
  type: 'role_transition';
  name: string;
  fromRole?: RoleId;
  toRole: RoleId;
  action?: string;
  timestamp: number;
  tSec: number;
}

export interface RoleEventDetails {
  actor?: string;
  role?: RoleId;
  action?: string;
}