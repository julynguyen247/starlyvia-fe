import { Platform } from 'react-native';

type ApiClientConfig = {
  getToken: () => string | null;
  onUnauthorized: () => void;
};

type RequestOptions = Omit<RequestInit, 'body' | 'headers'> & {
  body?: unknown;
  authenticated?: boolean;
  headers?: Record<string, string>;
};

const emulatorBaseUrl = Platform.select({
  android: 'http://10.0.2.2:8080',
  default: 'http://localhost:8080',
});

export const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? emulatorBaseUrl ?? 'http://localhost:8080'
).replace(/\/$/, '');

let config: ApiClientConfig = {
  getToken: () => null,
  onUnauthorized: () => undefined,
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function configureApiClient(nextConfig: ApiClientConfig): void {
  config = nextConfig;
}

function messageForStatus(status: number): string {
  switch (status) {
    case 400:
      return 'Please check the information and try again.';
    case 401:
      return 'Your session has expired. Please sign in again.';
    case 403:
      return 'You do not have permission to do that.';
    case 404:
      return 'We could not find what you were looking for.';
    case 409:
      return 'That change conflicts with existing information.';
    case 503:
      return 'This service is temporarily unavailable.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { authenticated = true, body, headers, ...requestOptions } = options;
  const token = config.getToken();

  if (authenticated && !token) {
    throw new ApiError('Please sign in to continue.', 401);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestOptions,
    body: body === undefined ? undefined : JSON.stringify(body),
    headers: {
      Accept: 'application/json',
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(authenticated && token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401 && authenticated) config.onUnauthorized();
    throw new ApiError(messageForStatus(response.status), response.status);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export function queryString(params: Record<string, string | number | undefined>): string {
  const entries = Object.entries(params).filter((entry): entry is [string, string | number] => {
    return entry[1] !== undefined;
  });
  if (!entries.length) return '';
  return `?${entries
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&')}`;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof TypeError) {
    return `Cannot reach Starlyvia at ${API_BASE_URL}. Check the API URL and network.`;
  }
  return 'Something went wrong. Please try again.';
}
