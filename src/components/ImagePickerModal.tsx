'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, RotateCcw, Link as LinkIcon, Sparkles } from 'lucide-react';
import { Recipe } from '@/lib/types';
import { PRESET_FOOD_GALLERY } from '@/lib/recipe-images';

interface ImagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: Recipe | null;
  currentImageUrl: string;
  onSaveImage: (recipeId: string, imageUrl: string) => void;
  onResetImage: (recipeId: string) => void;
}

export const ImagePickerModal: React.FC<ImagePickerModalProps> = ({
  isOpen,
  onClose,
  recipe,
  currentImageUrl,
  onSaveImage,
  onResetImage,
}) => {
  const [selectedUrl, setSelectedUrl] = useState('');
  const [customInputUrl, setCustomInputUrl] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('Alle');

  useEffect(() => {
    setSelectedUrl(currentImageUrl);
    setCustomInputUrl('');
    setSelectedCat('Alle');
  }, [currentImageUrl, isOpen]);

  if (!isOpen || !recipe) return null;

  const categories = ['Alle', 'Frühstück', 'Geflügel', 'Fisch', 'Fleisch', 'Vegetarisch', 'Bowls', 'Snacks'];

  const filteredPresets = PRESET_FOOD_GALLERY.filter((p) => {
    if (selectedCat === 'Alle') return true;
    return p.category === selectedCat;
  });

  const handleApply = () => {
    const finalUrl = customInputUrl.trim() || selectedUrl;
    if (finalUrl) {
      onSaveImage(recipe.id, finalUrl);
    }
    onClose();
  };

  const handleReset = () => {
    onResetImage(recipe.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#111C1E]/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200/80 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#789A99] flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Foto anpassen
            </span>
            <h3 className="font-bold text-slate-900 text-base mt-0.5 line-clamp-1">
              {recipe.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* Active Preview */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
            <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-slate-200 bg-white shadow-xs">
              <img
                src={customInputUrl.trim() || selectedUrl}
                alt="Vorschau"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = currentImageUrl;
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Aktuell ausgewählt
              </span>
              <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                Wähle unten ein appetitliches Profi-Foto aus der Galerie oder trage eine eigene Bild-URL ein.
              </p>
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCat === cat
                    ? 'bg-[#789A99] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Curated Gallery Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
            {filteredPresets.map((preset, idx) => {
              const isSelected = (selectedUrl === preset.url && !customInputUrl.trim());

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedUrl(preset.url);
                    setCustomInputUrl('');
                  }}
                  className={`group relative rounded-xl overflow-hidden aspect-4/3 border-2 transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'border-[#789A99] ring-2 ring-[#789A99]/30 shadow-md'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.label}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />
                  <span className="absolute bottom-1 left-1.5 right-1.5 text-[9px] font-medium text-white leading-tight line-clamp-1 drop-shadow-sm">
                    {preset.label}
                  </span>
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#789A99] text-white flex items-center justify-center shadow-xs">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Custom URL Input */}
          <div className="pt-2 border-t border-slate-100">
            <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1 mb-1">
              <LinkIcon className="w-3 h-3 text-[#789A99]" />
              Oder eigene Bild-URL aus dem Web einfügen:
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/... oder Bildlink"
              value={customInputUrl}
              onChange={(e) => setCustomInputUrl(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#789A99] font-mono"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition-colors py-2 px-3"
            title="Auf automatischen Vorschlag zurücksetzen"
          >
            <RotateCcw className="w-3 h-3" />
            Standard-Vorschlag
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60 transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="py-2 px-5 rounded-xl text-xs font-bold bg-[#789A99] hover:bg-[#658584] text-white transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
            >
              <Check className="w-3.5 h-3.5" />
              Bild übernehmen
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
