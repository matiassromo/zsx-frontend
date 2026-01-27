import type { AnalystAnalysisRequestDto, MultiQueryAnalysisResponse } from './types';

export async function analyzePrompt(prompt: string, maxQueries = 5): Promise<MultiQueryAnalysisResponse> {
  const payload: AnalystAnalysisRequestDto = { prompt, max_queries: maxQueries };

  const response = await fetch('/api/analyst/analysis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let errorMessage = `${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.error) errorMessage = errorData.error;
    } catch {
      const text = await response.text().catch(() => '');
      if (text) errorMessage = text;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}
