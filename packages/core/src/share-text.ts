export type BuildShareTextInput = {
  promptText: string;
  localDate: string;
  isDailyShare?: boolean;
  appName?: string;
};

export function buildShareText(input: BuildShareTextInput): string {
  const appName = input.appName?.trim() || "Improv";
  const title = input.isDailyShare ? `${appName} of the day` : `${appName} practice`;

  return [title, `Prompt: ${input.promptText}`, `Date: ${input.localDate}`].join("\n");
}
