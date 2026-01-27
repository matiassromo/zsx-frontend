'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronRight, SendHorizontal } from 'lucide-react';
import { Drawer } from '@/app/components/ui/Drawer';
import { analyzePrompt } from '@/lib/api/analyst';
import type { QueryResult, AnalysisMetadata, MultiQueryAnalysisResponse } from '@/lib/api/types';

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
      queries?: QueryResult[];
      metadata?: AnalysisMetadata;
      error?: string;
    };

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function buildAssistantMessage(response: MultiQueryAnalysisResponse): ChatMessage {
  return {
    id: createId(),
    role: 'assistant',
    content: response.analysis,
    queries: response.queries,
    metadata: response.metadata,
  };
}

interface QueryResultCardProps {
  query: QueryResult;
  index: number;
}

function QueryResultCard({ query, index }: QueryResultCardProps) {
  const [showSql, setShowSql] = useState(false);
  const [showData, setShowData] = useState(false);
  const hasError = Boolean(query.error);
  const hasData = query.data && query.data.length > 0;
  const columns = hasData ? Object.keys(query.data[0]) : [];
  const displayRows = query.data?.slice(0, 20) ?? [];

  return (
    <div
      className={`rounded-lg border ${hasError ? 'border-red-200 bg-red-50/50' : 'border-gray-200 bg-gray-50'}`}
    >
      <div className="flex items-start gap-3 px-3 py-2">
        <span
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
            hasError ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
          }`}
        >
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-gray-800">{query.purpose}</div>
          {hasError && (
            <div className="mt-1 text-xs text-red-600">{query.error}</div>
          )}
          {!hasError && (
            <div className="mt-1 text-xs text-gray-500">
              {query.row_count} {query.row_count === 1 ? 'fila' : 'filas'}
            </div>
          )}
        </div>
      </div>

      {!hasError && (
        <div className="border-t border-gray-200 px-3 py-2 text-xs">
          <button
            type="button"
            onClick={() => setShowSql(!showSql)}
            className="flex w-full items-center gap-1 text-gray-600 hover:text-gray-800"
          >
            {showSql ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            Ver SQL
          </button>
          {showSql && (
            <pre className="mt-2 whitespace-pre-wrap rounded-md bg-gray-100 p-2 font-mono text-[11px] text-gray-700">
              {query.sql_query}
            </pre>
          )}
        </div>
      )}

      {hasData && (
        <div className="border-t border-gray-200 px-3 py-2 text-xs">
          <button
            type="button"
            onClick={() => setShowData(!showData)}
            className="flex w-full items-center gap-1 text-gray-600 hover:text-gray-800"
          >
            {showData ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            Ver datos
          </button>
          {showData && (
            <div className="mt-2 overflow-x-auto">
              <table className="min-w-full text-left text-[11px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    {columns.map((col) => (
                      <th key={col} className="whitespace-nowrap px-2 py-1 font-semibold text-gray-700">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayRows.map((row, rowIdx) => (
                    <tr key={rowIdx} className="border-b border-gray-100 last:border-0">
                      {columns.map((col) => (
                        <td key={col} className="whitespace-nowrap px-2 py-1 text-gray-600">
                          {row[col] == null ? '-' : String(row[col])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {query.row_count > 20 && (
                <div className="mt-2 text-[10px] text-gray-400">
                  Mostrando 20 de {query.row_count} filas
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface MetadataBadgesProps {
  metadata: AnalysisMetadata;
}

function MetadataBadges({ metadata }: MetadataBadgesProps) {
  const allSuccess = metadata.successful_queries === metadata.total_queries;
  const queriesBadgeColor = allSuccess ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700';

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${queriesBadgeColor}`}>
        {metadata.successful_queries}/{metadata.total_queries} consultas
      </span>
      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
        {metadata.total_rows} filas totales
      </span>
      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
        {metadata.execution_time_ms}ms
      </span>
    </div>
  );
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
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const canSend = useMemo(() => input.trim().length > 4 && !isLoading, [input, isLoading]);

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

                  {!isUser && message.metadata && (
                    <MetadataBadges metadata={message.metadata} />
                  )}

                  {!isUser && message.queries && message.queries.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {message.queries.map((query, index) => (
                        <QueryResultCard
                          key={query.query_id}
                          query={query}
                          index={index}
                        />
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
    </Drawer>
  );
}
