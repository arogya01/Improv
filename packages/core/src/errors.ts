export class DomainValidationError extends Error {
  readonly cause?: unknown;

  constructor(message: string, options?: { cause?: unknown }) {
    super(message);
    this.name = "DomainValidationError";
    this.cause = options?.cause;
  }
}

export class PromptPackEmptyError extends Error {
  constructor(message = "Prompt pack has no items.") {
    super(message);
    this.name = "PromptPackEmptyError";
  }
}

export class PromptNotFoundError extends Error {
  constructor(promptId: string) {
    super(`Prompt not found: ${promptId}`);
    this.name = "PromptNotFoundError";
  }
}

export class InvalidTransitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidTransitionError";
  }
}
