'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { SendHorizontal } from 'lucide-react';
import { Drawer } from '@/app/components/ui/Drawer';
import { Modal } from '@/app/components/ui/Modal';
import { analyzePrompt } from '@/lib/api/analyst';
import type { AnalystChartResponse, AnalystAnalysisResponse } from '@/lib/api/types';

type ChatMessage =
  | {
      id: string;
      role: 'user';
      content: string;
    }
  | {
      id: string;
      role: 'assistant';
      content: string;
      sql?: string;
      charts?: AnalystChartResponse[];
      error?: string;
    };

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function buildAssistantMessage(response: AnalystAnalysisResponse): ChatMessage {
  return {
    id: createId(),
    role: 'assistant',
    content: response.explanation,
    sql: response.sql_query,
    charts: response.charts,
  };
}

interface AnalystChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AnalystChatDrawer({ isOpen, onClose }: AnalystChatDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: createId(),
      role: 'assistant',
      content: 'Hola, soy el analista. Preguntame sobre ventas, tickets o actividad.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [lightboxImage, setLightboxImage] = useState<{ src: string; title: string } | null>(
    null
  );
  const [lightboxZoom, setLightboxZoom] = useState(1);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const canSend = useMemo(() => input.trim().length > 4 && !isLoading, [input, isLoading]);

  const openLightbox = (src: string, title: string) => {
    setLightboxZoom(1);
    setLightboxImage({ src, title });
  };

  const closeLightbox = () => {
    setLightboxImage(null);
  };

  const zoomIn = () => setLightboxZoom((prev) => Math.min(prev + 0.25, 3));
  const zoomOut = () => setLightboxZoom((prev) => Math.max(prev - 0.25, 0.5));
  const resetZoom = () => setLightboxZoom(1);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const prompt = input.trim();
    if (!prompt || isLoading) return;

    setMessages((prev) => [
      ...prev,
      {
        id: createId(),
        role: 'user',
        content: prompt,
      },
    ]);
    setInput('');
    setIsLoading(true);
    setError('');

    try {
      const response = await analyzePrompt(prompt);
      setMessages((prev) => [...prev, buildAssistantMessage(response)]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error consultando servicio';
      setError(message);
      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          role: 'assistant',
          content: 'No pude procesar la consulta. Intentalo de nuevo.',
          error: message,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Chat con analista" size="lg">
      <div className="flex h-full flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50 px-6 py-4">
          {messages.map((message) => {
            const isUser = message.role === 'user';
            return (
              <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                    isUser
                      ? 'bg-blue-600 text-white'
                      : 'border border-black/5 bg-white text-gray-900'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>

                  {!isUser && message.sql && (
                    <details className="mt-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs">
                      <summary className="cursor-pointer select-none text-gray-600">
                        Ver SQL
                      </summary>
                      <pre className="mt-2 whitespace-pre-wrap font-mono text-[11px] text-gray-700">
                        {message.sql}
                      </pre>
                    </details>
                  )}

                  {!isUser && message.charts && message.charts.length > 0 && (
                    <div className="mt-3 space-y-3">
                      {message.charts.map((chart, index) => (
                        <div key={`${message.id}-chart-${index}`} className="space-y-2">
                          <div className="text-xs font-medium text-gray-600">{chart.title}</div>
                          <button
                            type="button"
                            onClick={() =>
                              openLightbox(
                                `data:image/png;base64,${chart.image_base64}`,
                                chart.title
                              )
                            }
                            className="w-full rounded-lg border border-black/10 bg-white p-0 text-left transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            aria-label={`Abrir grafico ${chart.title}`}
                          >
                            <img
                              src={`data:image/png;base64,${chart.image_base64}`}
                              alt={chart.title}
                              className="w-full rounded-lg"
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {!isUser && message.error && (
                    <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                      {message.error}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-2xl border border-black/5 bg-white px-4 py-3 text-sm text-gray-600 shadow-sm">
                Analizando...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSubmit} className="border-t border-gray-200 bg-white px-6 py-4">
          {error && (
            <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-gray-600">Pregunta</label>
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Escribe tu pregunta en espanol..."
                className="min-h-[96px] w-full resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                maxLength={500}
              />
              <div className="mt-1 text-[11px] text-gray-400">Minimo 5 caracteres.</div>
            </div>
            <button
              type="submit"
              disabled={!canSend}
              className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <SendHorizontal size={16} />
              Enviar
            </button>
          </div>
        </form>
      </div>
      <Modal
        isOpen={Boolean(lightboxImage)}
        onClose={closeLightbox}
        title={lightboxImage?.title ?? 'Vista de grafico'}
        size="xl"
      >
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs text-gray-500">
              Zoom {Math.round(lightboxZoom * 100)}%
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={zoomOut}
                className="rounded-md border border-gray-200 px-3 py-1 text-xs text-gray-700 hover:bg-gray-50"
              >
                -
              </button>
              <button
                type="button"
                onClick={resetZoom}
                className="rounded-md border border-gray-200 px-3 py-1 text-xs text-gray-700 hover:bg-gray-50"
              >
                100%
              </button>
              <button
                type="button"
                onClick={zoomIn}
                className="rounded-md border border-gray-200 px-3 py-1 text-xs text-gray-700 hover:bg-gray-50"
              >
                +
              </button>
            </div>
          </div>
          {lightboxImage && (
            <div className="max-h-[70vh] overflow-auto rounded-lg border border-black/10 bg-gray-50 p-3">
              <img
                src={lightboxImage.src}
                alt={lightboxImage.title}
                className="mx-auto max-w-none rounded-lg bg-white"
                style={{ width: `${lightboxZoom * 100}%` }}
              />
            </div>
          )}
        </div>
      </Modal>
    </Drawer>
  );
}
