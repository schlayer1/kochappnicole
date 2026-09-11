'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  Volume2,
  VolumeX,
  FileEdit,
  Sparkles,
  Timer
} from 'lucide-react';
import { Recipe } from '@/lib/types';
import { RecipeImage } from './RecipeImage';

interface CookModeModalProps {
  recipe: Recipe | null;
  onClose: () => void;
  recipeNote?: string;
  onSaveNote?: (recipeId: string, note: string) => void;
}

export const CookModeModal: React.FC<CookModeModalProps> = ({
  recipe,
  onClose,
  recipeNote = '',
  onSaveNote,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [noteText, setNoteText] = useState(recipeNote);
  const [showNoteEditor, setShowNoteEditor] = useState(false);

  useEffect(() => {
    setCurrentStep(0);
    setTimerRunning(false);
    setTimerSeconds(0);
    setIsSpeaking(false);
    setNoteText(recipeNote);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, [recipe, recipeNote]);

  // Cancel speech on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

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

  // Sound Signal via Web Audio API (keine externen Files nötig)
  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      // Zwei melodische Dreiklänge (D5 -> A5)
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

  // Hands-Free Speech Synthesis (Vorlesen auf Deutsch)
  const handleToggleSpeak = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-DE';
    utterance.rate = 0.95; // Angenehme, deutliche Vorlesegeschwindigkeit
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  if (!recipe) return null;

  const totalSteps = recipe.instructions.length;
  const currentInstruction = recipe.instructions[currentStep] || '';
  const mins = Math.floor(timerSeconds / 60);
  const secs = timerSeconds % 60;

  // Erkenne Zeitangaben im aktuellen Schritt (z. B. "15 Min.", "4-5 Minuten", "20 Min")
  const timeMatch = currentInstruction.match(/(\d+)(?:–|-)?(\d+)?\s*(?:minuten|min)\b/i);
  const detectedMins = timeMatch ? parseInt(timeMatch[2] || timeMatch[1], 10) : null;

  const handleStartDetectedTimer = (minutes: number) => {
    setTimerSeconds(minutes * 60);
    setTimerRunning(true);
  };

  const handleSaveCurrentNote = () => {
    if (onSaveNote && recipe) {
      onSaveNote(recipe.id, noteText);
      setShowNoteEditor(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#111C1E]/95 backdrop-blur-md flex flex-col justify-between text-white p-4 sm:p-8 animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 max-w-4xl mx-auto w-full pb-4 border-b border-[#2D4348]">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#FFD2C2]">
            Koch-Modus • {recipe.category}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold mt-0.5">{recipe.title}</h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Note Toggle */}
          <button
            onClick={() => setShowNoteEditor(!showNoteEditor)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              noteText
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-[#182629] text-slate-400 border-[#2D4348] hover:text-white'
            }`}
            title="Persönliche Notiz hinzufügen / ansehen"
          >
            <FileEdit className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{noteText ? 'Notiz vorhanden' : 'Notiz'}</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-[#182629] text-slate-300 hover:text-white hover:bg-[#203135] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Note Editor Drawer / Banner */}
      {showNoteEditor && (
        <div className="max-w-4xl mx-auto w-full bg-[#182629] border border-amber-500/30 rounded-2xl p-4 my-2 space-y-2 animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
              <FileEdit className="w-3.5 h-3.5" /> Persönliche Rezept-Notiz:
            </span>
            <button
              onClick={handleSaveCurrentNote}
              className="text-xs px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors"
            >
              Speichern
            </button>
          </div>
          <textarea
            rows={2}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="z. B. 'Schmeckt besonders gut mit etwas mehr Ceylon-Zimt' oder 'Hähnchen 1 Min. länger anbraten'..."
            className="w-full p-2.5 text-xs rounded-xl bg-[#203135] border border-[#2D4348] text-white focus:outline-none focus:border-amber-400"
          />
        </div>
      )}

      {/* Main Step Display */}
      <div className="max-w-4xl mx-auto w-full py-2 sm:py-4 flex-1 flex flex-col justify-center">
        
        {/* Dish Hero Photo Banner */}
        <div className="relative w-full h-28 sm:h-36 rounded-2xl overflow-hidden mb-4 border border-[#2D4348] shadow-lg shrink-0 bg-slate-900">
          <RecipeImage
            recipe={recipe}
            aspectRatio="banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-[#182629] via-transparent to-black/30" />
          <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-center justify-between">
            <span className="text-xs font-semibold text-white drop-shadow-md">
              {recipe.kcal} kcal • <span className="text-emerald-400 font-bold">{recipe.protein}g Protein</span> • <span className="text-[#FFD2C2]">{recipe.fat}g Fett</span>
            </span>
            <span className="text-[11px] text-white/90 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/20">
              ⏱️ {recipe.prepMins} Min. Zubereitung
            </span>
          </div>
        </div>

        {/* Step Counter & Indicators */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-slate-400">
            Schritt {currentStep + 1} von {totalSteps}
          </span>
          <div className="flex items-center gap-1.5">
            {recipe.instructions.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                    setIsSpeaking(false);
                  }
                  setCurrentStep(i);
                }}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  i === currentStep
                    ? 'w-7 bg-[#FFD2C2]'
                    : i < currentStep
                    ? 'w-3 bg-[#789A99]'
                    : 'w-2 bg-[#2D4348]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Current Instruction Card with Voice & Detected Timer */}
        <div className="bg-[#182629] border border-[#2D4348] rounded-3xl p-6 sm:p-10 shadow-2xl min-h-[220px] flex flex-col justify-between relative">
          
          <p className="text-lg sm:text-2xl font-medium leading-relaxed text-slate-100">
            {currentInstruction}
          </p>

          {/* Quick Actions inside Card (Voice & Auto-Detected Timer) */}
          <div className="flex items-center justify-between gap-3 pt-6 mt-4 border-t border-[#2D4348]/60 flex-wrap">
            
            {/* Hands-Free Voice Button */}
            <button
              onClick={() => handleToggleSpeak(currentInstruction)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
                isSpeaking
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-[#203135] text-slate-300 hover:text-white hover:bg-[#2D4348]'
              }`}
              title="Liest den Schritt per Sprachausgabe vor"
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-4 h-4" /> Vorlesen stoppen
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-[#789A99]" /> Schritt vorlesen
                </>
              )}
            </button>

            {/* Auto-detected Timer chip if minutes mentioned */}
            {detectedMins && (
              <button
                onClick={() => handleStartDetectedTimer(detectedMins)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#789A99]/20 hover:bg-[#789A99]/30 text-[#FFD2C2] border border-[#789A99]/40 transition-all active:scale-95"
              >
                <Timer className="w-4 h-4" />
                <span>Timer für {detectedMins} Min. starten</span>
              </button>
            )}

          </div>
        </div>

        {/* Interactive Timer Dock */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#182629]/80 border border-[#2D4348]">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
              timerRunning ? 'bg-amber-500 text-slate-950 animate-pulse' : 'bg-[#203135] text-[#789A99]'
            }`}>
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400">
                {timerRunning ? 'Timer läuft...' : timerSeconds > 0 ? 'Pausiert' : 'Küchentimer bereit'}
              </div>
              <div className="text-xl font-mono tabular-nums font-bold text-white tracking-wider">
                {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTimerSeconds((p) => p + 60)}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-[#203135] text-slate-200 hover:bg-[#2D4348] active:scale-95 transition-all"
            >
              +1 Min
            </button>
            <button
              onClick={() => setTimerSeconds((p) => p + 300)}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-[#203135] text-slate-200 hover:bg-[#2D4348] active:scale-95 transition-all"
            >
              +5 Min
            </button>
            <button
              onClick={() => setTimerRunning(!timerRunning)}
              disabled={timerSeconds === 0}
              className={`p-2.5 rounded-xl text-white transition-all active:scale-95 ${
                timerRunning ? 'bg-amber-600 hover:bg-amber-500' : 'bg-[#789A99] hover:bg-[#658584]'
              } disabled:opacity-30`}
              title={timerRunning ? 'Timer pausieren' : 'Timer starten'}
            >
              {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={() => {
                setTimerRunning(false);
                setTimerSeconds(0);
              }}
              className="p-2.5 rounded-xl bg-[#203135] text-slate-300 hover:text-white active:scale-95 transition-all"
              title="Timer zurücksetzen"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Bottom Step Navigation */}
      <div className="flex items-center justify-between max-w-4xl mx-auto w-full pt-4 border-t border-[#2D4348]">
        <button
          onClick={() => {
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
              window.speechSynthesis.cancel();
              setIsSpeaking(false);
            }
            setCurrentStep((p) => Math.max(0, p - 1));
          }}
          disabled={currentStep === 0}
          className="flex items-center gap-1 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#182629] text-slate-200 hover:bg-[#203135] disabled:opacity-30 transition-all"
        >
          <ChevronLeft className="w-4 h-4" /> Vorheriger Schritt
        </button>

        {currentStep < totalSteps - 1 ? (
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                setIsSpeaking(false);
              }
              setCurrentStep((p) => Math.min(totalSteps - 1, p + 1));
            }}
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
