'use client';

interface CreateButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export function CreateButton({ label, onClick, disabled = false }: CreateButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium
        shadow-sm transition-all duration-150
        ${disabled
          ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
          : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 hover:shadow-md'
        }
      `}
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      {label}
    </button>
  );
}
