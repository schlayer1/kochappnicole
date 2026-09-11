'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, Loader2 } from 'lucide-react';

interface SpeechInputButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export const SpeechInputButton: React.FC<SpeechInputButtonProps> = ({
  onTranscript,
  className = '',
  size = 'sm',
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [liveHint, setLiveHint] = useState<string>('');
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsSupported(true);
      }
    }
  }, []);

  const stopRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        // ignore
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
    setLiveHint('');
  };

  const toggleListening = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isSupported) {
      alert('Die Diktierfunktion (SpeechRecognition) wird von diesem Browser leider noch nicht unterstützt.');
      return;
    }

    if (isListening) {
      stopRecognition();
      return;
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'de-DE';
      recognition.continuous = true;
      recognition.interimResults = true; // Crucial for iOS: delivers live speech immediately
      recognition.maxAlternatives = 1;

      transcriptRef.current = '';

      recognition.onstart = () => {
        setIsListening(true);
        setLiveHint('Sprechen...');
      };

      recognition.onresult = (event: any) => {
        let currentFullTranscript = '';
        for (let i = 0; i < event.results.length; ++i) {
          if (event.results[i] && event.results[i][0]) {
            currentFullTranscript += event.results[i][0].transcript;
          }
        }

        const trimmed = currentFullTranscript.trim();
        if (trimmed) {
          transcriptRef.current = trimmed;
          setLiveHint(trimmed);
          onTranscript(trimmed);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          alert('Mikrofonzugriff wurde verweigert. Bitte erlaube den Mikrofonzugriff in deinen iPhone-Einstellungen (Safari > Mikrofon).');
        }
        stopRecognition();
      };

      recognition.onend = () => {
        if (transcriptRef.current) {
          onTranscript(transcriptRef.current);
        }
        setIsListening(false);
        setLiveHint('');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Could not start speech recognition:', err);
      setIsListening(false);
      setLiveHint('');
    }
  };

  if (!isSupported) return null;

  const btnSize = size === 'sm' ? 'w-7 h-7' : 'w-8 h-8';
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={toggleListening}
        className={`rounded-lg flex items-center justify-center transition-all cursor-pointer ${btnSize} ${
          isListening
            ? 'bg-rose-500 text-white animate-pulse shadow-md ring-2 ring-rose-300'
            : 'bg-slate-100 hover:bg-[#EBF2F2] text-slate-500 hover:text-[#3D5B5A]'
        } ${className}`}
        title={isListening ? 'Diktieren beenden (Klick zum Stoppen)' : 'Diktieren (Sprache zu Text)'}
      >
        {isListening ? (
          <Mic className={`${iconSize} animate-bounce`} />
        ) : (
          <Mic className={iconSize} />
        )}
      </button>

      {/* Floating Live Speech Feedback Pill */}
      {isListening && liveHint && (
        <span className="absolute -top-7 right-0 whitespace-nowrap text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 text-white shadow-lg pointer-events-none z-50 animate-in fade-in zoom-in-90 duration-150">
          🎙️ {liveHint.length > 20 ? `${liveHint.slice(0, 20)}...` : liveHint}
        </span>
      )}
    </div>
  );
};
