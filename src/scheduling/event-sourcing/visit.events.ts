/** The full life of a visit, as facts. Every state change is one of these. */
export type VisitEvent =
  | { type: 'VisitScheduled'; clientId: string; scheduledStart: string; tasks: { id: string; kind: string; description: string }[] }
  | { type: 'CaregiverAssigned'; caregiverId: string }
  | { type: 'VisitStarted'; at: string }
  | { type: 'TaskCompleted'; taskId: string }
  | { type: 'VisitCompleted'; at: string; durationMinutes: number }
  | { type: 'VisitCancelled'; at: string };
