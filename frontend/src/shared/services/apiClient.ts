import { buildApiUrl } from '../../config/api';

type JsonValue = string | number | boolean | null | undefined | JsonObject | JsonValue[];

type JsonObject = {
  [key: string]: JsonValue;
};

type ApiRequestInit = Omit<RequestInit, 'body'> & {
  body?: JsonObject;
};

const extractErrorMessage = (status: number, responseBody: unknown) => {
  if (responseBody && typeof responseBody === 'object' && 'error' in responseBody) {
    const maybeError = responseBody.error;
    if (typeof maybeError === 'string' && maybeError.trim()) {
      return maybeError;
    }
  }

  if (responseBody && typeof responseBody === 'object' && 'message' in responseBody) {
    const maybeMessage = responseBody.message;
    if (typeof maybeMessage === 'string' && maybeMessage.trim()) {
      return maybeMessage;
    }
  }

  return `הבקשה נכשלה (${status})`;
};

export const requestJson = async <T>(endpoint: string, init: ApiRequestInit = {}): Promise<T> => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(init.headers ?? {})
  };

  const response = await fetch(buildApiUrl(endpoint), {
    ...init,
    headers,
    body: init.body ? JSON.stringify(init.body) : undefined
  });

  const contentType = response.headers.get('content-type') ?? '';
  const responseBody = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : await response.text().catch(() => null);

  if (!response.ok) {
    throw new Error(extractErrorMessage(response.status, responseBody));
  }

  return responseBody as T;
};

export const postJson = async <T>(endpoint: string, body: JsonObject): Promise<T> =>
  requestJson<T>(endpoint, { method: 'POST', body });
