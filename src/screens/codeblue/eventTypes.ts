export type RescEndedEvent = {
  type: 'resuscitation_ended';
  reason: string;
  cause: string;
  notes?: string;
  timestamp: number;
};

export type RoscEvent = {
  type: 'rosc_achieved';
  cause: string;
  team: string;
  notes?: string;
  timestamp: number;
};

export type ReversibleCauseEvent = {
  type: 'reversible_cause_note';
  cause: string;
  discussion: string;
  action: string;
  timestamp: number;
};

export type RhythmAnalysisEvent = {
  type: 'rhythm_analysis';
  rhythm: string;
  analysis: string;
  plan: string;
  timestamp: number;
};

// Helper to create events with timestamps
export const createEvent = {
  rescEnded: (
    reason: string,
    cause: string,
    notes?: string
  ): RescEndedEvent => ({
    type: 'resuscitation_ended',
    reason,
    cause,
    notes,
    timestamp: Date.now(),
  }),

  rosc: (cause: string, team: string, notes?: string): RoscEvent => ({
    type: 'rosc_achieved',
    cause,
    team,
    notes,
    timestamp: Date.now(),
  }),

  reversibleCause: (
    cause: string,
    discussion: string,
    action: string
  ): ReversibleCauseEvent => ({
    type: 'reversible_cause_note',
    cause,
    discussion,
    action,
    timestamp: Date.now(),
  }),

  rhythmAnalysis: (
    rhythm: string,
    analysis: string,
    plan: string
  ): RhythmAnalysisEvent => ({
    type: 'rhythm_analysis',
    rhythm,
    analysis,
    plan,
    timestamp: Date.now(),
  }),
};