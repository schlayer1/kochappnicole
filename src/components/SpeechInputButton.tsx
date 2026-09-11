'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface SpeechInputButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
  placeholderText?: string;
  size?: 'sm' | 'md';
}

export const SpeechInputButton: React.FC<SpeechInputButtonProps> = ({
  onTranscript,
  className = '',
  placeholderText = 'Sprechen...',
  size = 'sm',
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsSupported(true);
      }
    }
  }, []);

  const toggleListening = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isSupported) {
      alert('Die Diktierfunktion wird von deinem aktuellen Browser leider nicht unterstützt.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          // ignore
        }
      }
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'de-DE';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        if (event.results && event.results[0] && event.results[0][0]) {
          const text = event.results[0][0].transcript;
          if (text) {
            onTranscript(text.trim());
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Could not start speech recognition:', err);
      setIsListening(false);
    }
  };

  if (!isSupported) return null;

  const btnSize = size === 'sm' ? 'w-7 h-7' : 'w-8 h-8';
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`rounded-lg flex items-center justify-center transition-all cursor-pointer ${btnSize} ${
        isListening
          ? 'bg-rose-500 text-white animate-pulse shadow-md ring-2 ring-rose-300'
          : 'bg-slate-100 hover:bg-[#EBF2F2] text-slate-500 hover:text-[#3D5B5A]'
      } ${className}`}
      title={isListening ? 'Zuhören beenden' : 'Diktieren (Sprache zu Text)'}
    >
      {isListening ? (
        <Mic className={`${iconSize} animate-bounce`} />
      ) : (
        <Mic className={iconSize} />
      )}
    </button>
  );
};
