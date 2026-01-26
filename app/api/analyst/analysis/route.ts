import { NextRequest, NextResponse } from 'next/server';
import type { AnalystAnalysisRequestDto, AnalystAnalysisResponse } from '@/lib/api/types';

const ANALYST_API_URL = process.env.ANALYST_API_URL || 'http://localhost:8000/api/v1';

export async function POST(request: NextRequest) {
  try {
    const body: AnalystAnalysisRequestDto = await request.json();

    if (!body.prompt || typeof body.prompt !== 'string') {
      return NextResponse.json({ error: 'El campo "prompt" es requerido' }, { status: 400 });
    }

    const response = await fetch(`${ANALYST_API_URL}/analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error('[analyst-proxy] Error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Error al procesar la consulta de análisis' },
        { status: response.status >= 500 ? 502 : response.status }
      );
    }

    const data: AnalystAnalysisResponse = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[analyst-proxy] Error interno:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
