/** Thrown when a business rule is violated. Carries no HTTP meaning — adapters map it. */
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}
