'use client';

import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, ChevronLeft, ChevronRight, CheckCircle2, Clock, Volume2 } from 'lucide-react';
import { Recipe } from '@/lib/types';

interface CookModeModalProps {
  recipe: Recipe | null;
  onClose: () => void;
}

export const CookModeModal: React.FC<CookModeModalProps> = ({ recipe, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    setCurrentStep(0);
    setTimerRunning(false);
    setTimerSeconds(0);
  }, [recipe]);

  // Timer Tick
  useEffect(() => {
    let interval: any;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            playChime();
            setTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch (e) {
      console.error(e);
    }
  };

  if (!recipe) return null;

  const totalSteps = recipe.instructions.length;
  const mins = Math.floor(timerSeconds / 60);
  const secs = timerSeconds % 60;

  return (
    <div className="fixed inset-0 z-50 bg-[#111C1E]/90 backdrop-blur-md flex flex-col justify-between text-white p-4 sm:p-8 animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 max-w-4xl mx-auto w-full pb-4 border-b border-[#2D4348]">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#FFD2C2]">
            Koch-Modus • {recipe.category}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold mt-0.5">{recipe.title}</h2>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-full bg-[#182629] text-slate-300 hover:text-white hover:bg-[#203135] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto w-full py-6 flex-1 flex flex-col justify-center">
        
        {/* Step Counter */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-slate-400">
            Schritt {currentStep + 1} von {totalSteps}
          </span>
          <div className="flex items-center gap-1.5">
            {recipe.instructions.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentStep
                    ? 'w-6 bg-[#FFD2C2]'
                    : i < currentStep
                    ? 'w-3 bg-[#789A99]'
                    : 'w-2 bg-[#2D4348]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Current Instruction Card */}
        <div className="bg-[#182629] border border-[#2D4348] rounded-3xl p-6 sm:p-10 shadow-2xl min-h-[220px] flex items-center">
          <p className="text-lg sm:text-2xl font-medium leading-relaxed text-slate-100">
            {recipe.instructions[currentStep]}
          </p>
        </div>

        {/* Interactive Timer Widget */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#182629]/80 border border-[#2D4348]">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-[#789A99]" />
            <div>
              <div className="text-[11px] text-slate-400">Küchentimer</div>
              <div className="text-xl font-mono tabular-nums font-bold text-white">
                {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTimerSeconds((p) => p + 60)}
              className="px-2.5 py-1 text-xs rounded-lg bg-[#203135] text-slate-200 hover:bg-[#2D4348]"
            >
              +1 Min
            </button>
            <button
              onClick={() => setTimerSeconds((p) => p + 300)}
              className="px-2.5 py-1 text-xs rounded-lg bg-[#203135] text-slate-200 hover:bg-[#2D4348]"
            >
              +5 Min
            </button>
            <button
              onClick={() => setTimerRunning(!timerRunning)}
              disabled={timerSeconds === 0}
              className={`p-2 rounded-xl text-white transition-all ${
                timerRunning ? 'bg-amber-600 hover:bg-amber-500' : 'bg-[#789A99] hover:bg-[#658584]'
              } disabled:opacity-40`}
            >
              {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={() => {
                setTimerRunning(false);
                setTimerSeconds(0);
              }}
              className="p-2 rounded-xl bg-[#203135] text-slate-300 hover:text-white"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Bottom Step Navigation */}
      <div className="flex items-center justify-between max-w-4xl mx-auto w-full pt-4 border-t border-[#2D4348]">
        <button
          onClick={() => setCurrentStep((p) => Math.max(0, p - 1))}
          disabled={currentStep === 0}
          className="flex items-center gap-1 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#182629] text-slate-200 hover:bg-[#203135] disabled:opacity-30 transition-all"
        >
          <ChevronLeft className="w-4 h-4" /> Vorheriger Schritt
        </button>

        {currentStep < totalSteps - 1 ? (
          <button
            onClick={() => setCurrentStep((p) => Math.min(totalSteps - 1, p + 1))}
            className="flex items-center gap-1 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#789A99] hover:bg-[#658584] text-white transition-all active:scale-95 shadow-lg"
          >
            Nächster Schritt <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold bg-[#FFD2C2] text-[#994931] hover:bg-[#F7BFAC] transition-all active:scale-95 shadow-lg"
          >
            <CheckCircle2 className="w-4 h-4" /> Mahlzeit Fertig!
          </button>
        )}
      </div>

    </div>
  );
};
