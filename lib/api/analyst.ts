import type { AnalystAnalysisRequestDto, AnalystAnalysisResponse } from './types';

export async function analyzePrompt(prompt: string): Promise<AnalystAnalysisResponse> {
  const payload: AnalystAnalysisRequestDto = { prompt };

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
