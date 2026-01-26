import type { AnalystAnalysisRequestDto, AnalystAnalysisResponse } from './types';

const ANALYST_API_BASE_URL = process.env.NEXT_PUBLIC_ANALYST_API_URL || 'http://localhost:8000/api/v1';

type RequestOptions = {
  method?: 'GET' | 'POST';
  body?: unknown;
};

async function analystClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body } = options;
  const url = `${ANALYST_API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body !== undefined) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(errorText || `${response.status} ${response.statusText}`);
  }

  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return undefined as T;
  }

  return response.json();
}

export async function analyzePrompt(prompt: string): Promise<AnalystAnalysisResponse> {
  const payload: AnalystAnalysisRequestDto = { prompt };
  return analystClient<AnalystAnalysisResponse>('/analysis', {
    method: 'POST',
    body: payload,
  });
}
