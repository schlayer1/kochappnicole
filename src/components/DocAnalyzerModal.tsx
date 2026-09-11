'use client';

import React, { useState } from 'react';
import { X, UploadCloud, FileText, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import { NutritionProfile } from '@/lib/types';

interface DocAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: NutritionProfile;
  onUpdateProfile: (newProfile: NutritionProfile) => void;
  userApiKey?: string;
  profileName?: string;
}

export const DocAnalyzerModal: React.FC<DocAnalyzerModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onUpdateProfile,
  userApiKey,
  profileName,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      let pdfBase64 = undefined;
      if (file) {
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        pdfBase64 = btoa(binary);
      }

      const res = await fetch('/api/analyze-doc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfBase64,
          text: pastedText,
          fileName: file?.name || 'Ernährungsbericht.pdf',
          userApiKey,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analyse fehlgeschlagen');

      setExtractedData(data.profile);
    } catch (err: any) {
      setErrorMsg(err.message || 'Verbindung zum Analyse-Service fehlgeschlagen.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!extractedData) return;
    const updated: NutritionProfile = {
      ...currentProfile,
      lastUpdated: new Date().toLocaleDateString('de-DE'),
      sourceDocName: extractedData.sourceDocName || 'Neuer Bericht.pdf',
      targetGoals: extractedData.targetGoals || currentProfile.targetGoals,
      allowedProteins: extractedData.allowedProteins?.length ? extractedData.allowedProteins : currentProfile.allowedProteins,
      avoidProteins: extractedData.avoidProteins?.length ? extractedData.avoidProteins : currentProfile.avoidProteins,
    };
    onUpdateProfile(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#111C1E]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-[#E0EAE9] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-[#F0F5F4] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EBF2F2] border border-[#C5D8D7] flex items-center justify-center">
              <FileText className="w-4 h-4 text-[#789A99]" />
            </div>
            <div>
              <h3 className="font-bold text-[#111C1E] text-base">Ernährungsanalyse einlesen</h3>
              <p className="text-xs text-[#586F73]">
                Aktualisiert Zielwerte für Profil: <span className="font-semibold text-[#1B4332] bg-[#EBF3E8] px-1.5 py-0.5 rounded-md border border-[#D5E5D0]">{profileName || 'Aktives Profil'}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#111C1E] hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {!extractedData ? (
            <>
              {/* File Drop Area */}
              <div className="border-2 border-dashed border-[#C5D8D7] hover:border-[#789A99] rounded-2xl p-6 text-center bg-[#F8FAFA] transition-colors">
                <UploadCloud className="w-8 h-8 text-[#789A99] mx-auto mb-2" />
                <label className="cursor-pointer">
                  <span className="text-xs font-bold text-[#789A99] hover:underline">
                    PDF-Datei auswählen
                  </span>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-slate-400 mt-1">
                  {file ? `Ausgewählt: ${file.name}` : 'Oder PDF hierher ziehen'}
                </p>
              </div>

              <div className="text-center text-xs text-slate-400">— ODER TEXT EINFÜGEN —</div>

              <textarea
                rows={3}
                placeholder="Text oder Notizen aus dem Ernährungsbericht hier einfügen..."
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                className="w-full p-3 text-xs rounded-xl bg-[#F8FAFA] border border-[#E0EAE9] focus:outline-none focus:border-[#789A99]"
              />

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
                  {errorMsg}
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={loading || (!file && !pastedText)}
                className="w-full py-3 rounded-xl font-bold text-xs bg-[#789A99] hover:bg-[#658584] text-white transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Dokument wird von KI analysiert...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 text-[#FFD2C2]" /> Dokument analysieren & anpassen
                  </>
                )}
              </button>
            </>
          ) : (
            /* Diff preview */
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Neue Zielvorgaben aus Dokument erkannt!
              </div>

              {/* Comparison table */}
              <div className="rounded-xl border border-[#E0EAE9] overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-[#F8FAFA] border-b border-[#E0EAE9] text-[#586F73]">
                    <tr>
                      <th className="p-2.5 font-semibold">Makro</th>
                      <th className="p-2.5 font-semibold">Bisher</th>
                      <th className="p-2.5 font-semibold text-[#789A99]">Neu erkannt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F5F4]">
                    <tr>
                      <td className="p-2.5 font-medium">Kalorien</td>
                      <td className="p-2.5 font-mono text-slate-500">{currentProfile.targetGoals.calories} kcal</td>
                      <td className="p-2.5 font-mono font-bold text-[#111C1E]">{extractedData.targetGoals?.calories} kcal</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium">Fett (Limit)</td>
                      <td className="p-2.5 font-mono text-slate-500">{currentProfile.targetGoals.fat} g</td>
                      <td className="p-2.5 font-mono font-bold text-[#789A99]">{extractedData.targetGoals?.fat} g</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium">Protein (Ziel)</td>
                      <td className="p-2.5 font-mono text-slate-500">{currentProfile.targetGoals.protein} g</td>
                      <td className="p-2.5 font-mono font-bold text-emerald-700">{extractedData.targetGoals?.protein} g</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium">Kohlenhydrate</td>
                      <td className="p-2.5 font-mono text-slate-500">{currentProfile.targetGoals.carbs} g</td>
                      <td className="p-2.5 font-mono font-bold text-[#111C1E]">{extractedData.targetGoals?.carbs} g</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium">Ballaststoffe</td>
                      <td className="p-2.5 font-mono text-slate-500">{currentProfile.targetGoals.fiber} g</td>
                      <td className="p-2.5 font-mono font-bold text-[#111C1E]">{extractedData.targetGoals?.fiber} g</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setExtractedData(null)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-medium text-[#586F73] bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Zurück
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[#789A99] hover:bg-[#658584] text-white transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  Werte übernehmen <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
