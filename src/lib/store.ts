export interface WebhookResponse {
  promptId: string;
  imageUrl?: string;
  status: "pending" | "completed" | "failed";
  error?: string;
  createdAt: string;
  updatedAt: string;
}

const store = new Map<string, WebhookResponse>();

export function setResponse(data: WebhookResponse) {
  store.set(data.promptId, data);
}

export function getResponse(promptId: string): WebhookResponse | undefined {
  return store.get(promptId);
}

export function createPending(promptId: string) {
  const now = new Date().toISOString();
  store.set(promptId, {
    promptId,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  });
}
