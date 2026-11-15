/** Commands the saga sends. Each is handled by ONE context; the saga only coordinates. */
export class ReleaseCaregiver { constructor(public readonly visitId: string, public readonly caregiverId: string) {} }
export class RefundInvoice { constructor(public readonly visitId: string) {} }
export class ReassignCaregiver { constructor(public readonly visitId: string, public readonly caregiverId: string) {} }
export class ReinstateVisit { constructor(public readonly visitId: string) {} }
