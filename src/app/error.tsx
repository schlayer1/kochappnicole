'use client';

import React, { useEffect } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App-level error caught by Next.js Error Boundary:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F6F9F9] flex items-center justify-center p-4 text-[#111C1E] font-sans">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200/80 shadow-2xl text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center border border-amber-200">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">Kurze Unterbrechung</h2>
          <p className="text-xs text-slate-500 mt-1">
            Ein Modul konnte kurzzeitig nicht initialisiert werden.
          </p>
        </div>

        {error?.message && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-left">
            <p className="text-[11px] text-slate-600 font-mono break-all line-clamp-3">
              {error.message}
            </p>
          </div>
        )}

        <button
          onClick={() => reset()}
          className="w-full py-2.5 px-4 bg-[#789A99] hover:bg-[#658584] text-white font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          <RotateCcw className="w-4 h-4" />
          App neu laden & fortfahren
        </button>
      </div>
    </div>
  );
}
