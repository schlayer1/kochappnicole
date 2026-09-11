'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Barcode,
  Camera,
  Search,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ShoppingCart,
  CalendarPlus,
  RotateCcw,
  Loader2,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Utensils
} from 'lucide-react';
import { ProductNutrition, NicoleProductEvaluation, MealType, Recipe } from '@/lib/types';
import { fetchProductByBarcode, searchProductsByName, evaluateNicoleMatch } from '@/lib/open-food-facts';
import { decodeBarcodeFromCanvasOrImage } from '@/lib/barcode-decoder';
import { SpeechInputButton } from './SpeechInputButton';

interface ProductScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToShoppingList?: (productName: string, amount?: string) => void;
  onLogAsMeal?: (recipe: Recipe, slot: MealType) => void;
  userApiKey?: string;
  groqApiKey?: string;
  geminiApiKey?: string;
  aiProvider?: 'groq' | 'gemini';
}

type ModeTab = 'barcode' | 'ocr' | 'search';

export const ProductScannerModal: React.FC<ProductScannerModalProps> = ({
  isOpen,
  onClose,
  onAddToShoppingList,
  onLogAsMeal,
  userApiKey,
  groqApiKey,
  geminiApiKey,
  aiProvider = 'gemini',
}) => {
  const [activeTab, setActiveTab] = useState<ModeTab>('barcode');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ProductNutrition[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Active product & evaluation
  const [currentProduct, setCurrentProduct] = useState<ProductNutrition | null>(null);
  const [evaluation, setEvaluation] = useState<NicoleProductEvaluation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [addedNotice, setAddedNotice] = useState(false);
  const [loggedNotice, setLoggedNotice] = useState(false);
  const [targetSlot, setTargetSlot] = useState<MealType>('snack');

  // Camera video stream & canvas refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const barcodePhotoInputRef = useRef<HTMLInputElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [hasBarcodeDetector, setHasBarcodeDetector] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
      setHasBarcodeDetector(true);
    }
  }, []);

  // Cleanup camera stream when modal closes
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      handleReset();
    }
  }, [isOpen]);

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const startCameraStream = async () => {
    setErrorMsg('');
    setCameraActive(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia wird von diesem Browser nicht unterstützt');
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
      } catch (e1) {
        // Fallback for strict mobile browsers that fail with ideal width/height
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
      }

      // Allow React render tick to ensure videoRef is bound
      setTimeout(async () => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          videoRef.current.setAttribute('webkit-playsinline', 'true');
          videoRef.current.muted = true;
          try {
            await videoRef.current.play();
          } catch (playErr) {
            console.warn('Video play error:', playErr);
          }
          startBarcodeScanLoop();
        }
      }, 50);
    } catch (err: any) {
      console.warn('Camera access denied or unavailable:', err);
      setCameraActive(false);
      setErrorMsg(
        err?.name === 'NotAllowedError'
          ? 'Kamerazugriff wurde verweigert. Bitte erlaube den Zugriff in den Browser-Einstellungen oder nutze den Foto-Button.'
          : 'Kamera konnte nicht gestartet werden. Nutze den Foto-Button oder tippe die Ziffern ein.'
      );
    }
  };

  const startBarcodeScanLoop = () => {
    if (typeof window === 'undefined') return;

    const interval = setInterval(async () => {
      if (!videoRef.current || !videoRef.current.videoWidth || !isOpen) {
        clearInterval(interval);
        return;
      }

      try {
        // 1. Native BarcodeDetector if available (e.g. Chrome, Android)
        if ('BarcodeDetector' in window) {
          try {
            // @ts-ignore
            const detector = new window.BarcodeDetector({
              formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'qr_code'],
            });
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes.length > 0 && barcodes[0].rawValue) {
              const detectedCode = barcodes[0].rawValue;
              clearInterval(interval);
              stopCamera();
              lookupBarcode(detectedCode);
              return;
            }
          } catch (e) {
            // fallback to zxing below
          }
        }

        // 2. Universal iOS Safari & PWA ZXing Decoder via Canvas frame
        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const zxingCode = await decodeBarcodeFromCanvasOrImage(canvas);
          if (zxingCode) {
            clearInterval(interval);
            stopCamera();
            lookupBarcode(zxingCode);
            return;
          }
        }
      } catch (e) {
        // ignore scan frame errors
      }
    }, 280);
  };

  // Detect barcode from a captured photo file
  const processBarcodePhoto = (file: File) => {
    setIsLoading(true);
    setErrorMsg('');

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);

          // 1. Universal ZXing 1D barcode decoding directly from photo
          const zxingCode = await decodeBarcodeFromCanvasOrImage(canvas);
          if (zxingCode) {
            lookupBarcode(zxingCode);
            return;
          }

          // 2. Native BarcodeDetector check if supported
          if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
            try {
              // @ts-ignore
              const detector = new window.BarcodeDetector({
                formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'qr_code'],
              });
              const barcodes = await detector.detect(canvas);
              if (barcodes.length > 0 && barcodes[0].rawValue) {
                lookupBarcode(barcodes[0].rawValue);
                return;
              }
            } catch (err) {
              console.warn('Photo barcode detection error:', err);
            }
          }

          // 3. Fallback: If no barcode was detected, assume it's a nutrition table photo and call OCR
          const compressed = canvas.toDataURL('image/jpeg', 0.80);
          callOcrApi(compressed);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const lookupBarcode = async (code: string) => {
    setIsLoading(true);
    setErrorMsg('');
    setCurrentProduct(null);
    setEvaluation(null);

    try {
      const product = await fetchProductByBarcode(code);
      if (product) {
        setCurrentProduct(product);
        setEvaluation(evaluateNicoleMatch(product));
      } else {
        setErrorMsg(`Kein Produkt für Barcode ${code} in Open Food Facts gefunden. Versuche das Foto der Nährwerttabelle!`);
      }
    } catch (err: any) {
      setErrorMsg('Fehler bei der Barcode-Abfrage.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (barcodeInput.trim()) {
      lookupBarcode(barcodeInput.trim());
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setErrorMsg('');
    try {
      const results = await searchProductsByName(searchQuery);
      setSearchResults(results);
      if (results.length === 0) {
        setErrorMsg(`Keine Produkte für "${searchQuery}" gefunden.`);
      }
    } catch (err) {
      setErrorMsg('Fehler bei der Produktsuche.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (prod: ProductNutrition) => {
    setCurrentProduct(prod);
    setEvaluation(evaluateNicoleMatch(prod));
    setSearchResults([]);
  };

  // Process OCR label photo
  const processLabelPhoto = (file: File) => {
    setIsLoading(true);
    setErrorMsg('');
    setCurrentProduct(null);
    setEvaluation(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.80);
          callOcrApi(compressed);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const callOcrApi = async (base64Img: string) => {
    try {
      const res = await fetch('/api/scan-label', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Img,
          userApiKey,
          groqApiKey,
          geminiApiKey,
          provider: aiProvider,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Fehler beim Lesen des Fotos');

      const r = data.result;
      const product: ProductNutrition = {
        name: r.productName || 'Fotografiertes Produkt',
        brand: r.brand || '',
        servingSize: r.servingSize || '100g',
        kcal: r.per100g?.kcal || 0,
        protein: r.per100g?.protein || 0,
        fat: r.per100g?.fat || 0,
        saturatedFat: r.per100g?.saturatedFat || 0,
        carbs: r.per100g?.carbs || 0,
        fiber: r.per100g?.fiber || 0,
        source: 'vision-ocr',
      };

      setCurrentProduct(product);
      setEvaluation(evaluateNicoleMatch(product));
    } catch (err: any) {
      setErrorMsg(err.message || 'Konnte Nährwerttabelle nicht erkennen.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentProduct(null);
    setEvaluation(null);
    setErrorMsg('');
    setBarcodeInput('');
    setSearchQuery('');
    setSearchResults([]);
    setAddedNotice(false);
    setLoggedNotice(false);
  };

  const handleAddShopping = () => {
    if (!currentProduct || !onAddToShoppingList) return;
    const title = currentProduct.brand ? `${currentProduct.brand} ${currentProduct.name}` : currentProduct.name;
    onAddToShoppingList(title, currentProduct.servingSize || '1 Packung');
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2500);
  };

  const handleLogToToday = () => {
    if (!currentProduct || !onLogAsMeal) return;
    const title = currentProduct.brand ? `${currentProduct.brand} ${currentProduct.name}` : currentProduct.name;

    const loggedRecipe: Recipe = {
      id: `snack_${Date.now()}`,
      title,
      subtitle: `Supermarkt-Produkt (${currentProduct.servingSize || '100g'})`,
      mealType: targetSlot,
      category: targetSlot === 'breakfast' ? 'Frühstück 2.0' : targetSlot === 'snack' ? 'Snacks & Dessert' : 'Gesunder Teller',
      prepMins: 2,
      kcal: currentProduct.kcal,
      protein: currentProduct.protein,
      fat: currentProduct.fat,
      carbs: currentProduct.carbs,
      fiber: currentProduct.fiber || 2,
      whyNicole: evaluation?.summary || 'Im Supermarkt gescanntes Produkt.',
      ingredients: {
        'Produkt': [`1x ${title} (${currentProduct.servingSize || '100g'})`],
      },
      instructions: ['Direkt verzehrfertig oder wie gewünscht zubereiten.'],
      tags: ['Supermarkt-Check', 'Getrackt'],
    };

    onLogAsMeal(loggedRecipe, targetSlot);
    setLoggedNotice(true);
    setTimeout(() => {
      setLoggedNotice(false);
      onClose();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#111C1E]/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200/80 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-linear-to-r from-[#111C1E] to-[#1F3135] text-white">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FFD2C2]/20 text-[#FFD2C2] border border-[#FFD2C2]/30 flex items-center gap-1">
                <Barcode className="w-3 h-3" /> Supermarkt-Checker
              </span>
              <span className="text-xs text-slate-300">
                Open Food Facts &amp; Gemini Vision
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold mt-1.5 text-white">
              Produkt- &amp; Barcode-Checker
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              Prüfe im Supermarkt in 1 Sekunde: Passt das Produkt zu deinem 44g-Tages-Fettlimit und liefert es hochwertiges Protein?
            </p>
          </div>

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation - Touch-Optimized for Mobile */}
        <div className="p-1.5 bg-slate-100/80 border-b border-slate-200/80 grid grid-cols-3 gap-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab('barcode');
              setErrorMsg('');
            }}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[42px] cursor-pointer ${
              activeTab === 'barcode'
                ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Barcode className="w-4 h-4 text-[#789A99] shrink-0" />
            <span className="truncate">Barcode</span>
          </button>

          <button
            type="button"
            onClick={() => {
              stopCamera();
              setActiveTab('ocr');
              setErrorMsg('');
            }}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[42px] cursor-pointer ${
              activeTab === 'ocr'
                ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Camera className="w-4 h-4 text-[#789A99] shrink-0" />
            <span className="truncate hidden sm:inline">Nährwert-Foto</span>
            <span className="truncate sm:hidden">Foto</span>
          </button>

          <button
            type="button"
            onClick={() => {
              stopCamera();
              setActiveTab('search');
              setErrorMsg('');
            }}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[42px] cursor-pointer ${
              activeTab === 'search'
                ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Search className="w-4 h-4 text-[#789A99] shrink-0" />
            <span className="truncate">Suche</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="p-8 text-center space-y-3">
              <Loader2 className="w-8 h-8 mx-auto text-[#789A99] animate-spin" />
              <p className="text-xs font-bold text-slate-700">Lade Produktdaten &amp; berechne Nicole-Ampel...</p>
            </div>
          )}

          {/* Tab 1: Barcode Scan */}
          {activeTab === 'barcode' && !currentProduct && !isLoading && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-slate-200 flex items-center justify-center mx-auto text-[#789A99]">
                  <Barcode className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">EAN-Strichcode scannen</h3>
                  <p className="text-xs text-slate-500 mt-0.5 max-w-sm mx-auto">
                    Halte die Kamera über den Strichcode auf der Verpackung.
                  </p>
                </div>

                {/* Hidden input for native camera snapshot fallback */}
                <input
                  type="file"
                  ref={barcodePhotoInputRef}
                  onChange={(e) => e.target.files?.[0] && processBarcodePhoto(e.target.files[0])}
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                />

                {/* Persistent Video Element Container */}
                <div className={`space-y-2 ${cameraActive ? 'block' : 'hidden'}`}>
                  <div className="relative rounded-2xl overflow-hidden max-w-sm mx-auto bg-black aspect-video border-2 border-[#789A99] shadow-inner">
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      autoPlay
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 border-2 border-red-500/60 m-6 rounded-lg pointer-events-none flex items-center justify-center animate-pulse">
                      <span className="text-[10px] bg-red-600/80 text-white px-2 py-0.5 rounded font-mono shadow-sm">
                        Barcode hier zentrieren
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
                  >
                    Live-Kamera schließen
                  </button>
                </div>

                {!cameraActive && (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2 max-w-md mx-auto">
                    <button
                      type="button"
                      onClick={startCameraStream}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#789A99] hover:bg-[#658584] text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
                    >
                      <Camera className="w-4 h-4" />
                      Live-Scanner starten
                    </button>

                    <button
                      type="button"
                      onClick={() => barcodePhotoInputRef.current?.click()}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
                    >
                      <Camera className="w-4 h-4 text-[#789A99]" />
                      Barcode knipsen (Foto)
                    </button>
                  </div>
                )}
              </div>

              {/* Manual Barcode Input Form */}
              <form onSubmit={handleManualBarcodeSubmit} className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Strichcode-Nummer manuell eintippen (z. B. 4008400401021)..."
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 focus:bg-white rounded-xl border border-slate-200 text-slate-800 font-mono placeholder-slate-400 focus:outline-none focus:border-[#789A99]"
                />
                <button
                  type="submit"
                  disabled={!barcodeInput.trim()}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 disabled:opacity-50 cursor-pointer active:scale-95 transition-all"
                >
                  Prüfen
                </button>
              </form>
            </div>
          )}

          {/* Tab 2: Nutrition Label Photo OCR */}
          {activeTab === 'ocr' && !currentProduct && !isLoading && (
            <div className="space-y-4">
              <input
                type="file"
                ref={cameraInputRef}
                onChange={(e) => e.target.files?.[0] && processLabelPhoto(e.target.files[0])}
                accept="image/*"
                capture="environment"
                className="hidden"
              />
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => e.target.files?.[0] && processLabelPhoto(e.target.files[0])}
                accept="image/*"
                className="hidden"
              />

              <div className="p-6 rounded-2xl bg-linear-to-b from-slate-50 to-white border-2 border-dashed border-slate-200 hover:border-[#789A99] text-center space-y-3 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-slate-200 flex items-center justify-center mx-auto text-[#789A99]">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Nährwerttabelle fotografieren</h3>
                  <p className="text-xs text-slate-500 mt-0.5 max-w-sm mx-auto leading-relaxed">
                    Fotografiere die Nährwertdeklaration (je 100g) auf der Rückseite. Gemini liest Fett, Eiweiß &amp; Kalorien präzise ab.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="px-4 py-2.5 rounded-xl bg-[#789A99] hover:bg-[#658584] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                  >
                    <Camera className="w-4 h-4" />
                    Tabelle knipsen
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                  >
                    Foto aus Galerie
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Text Search */}
          {activeTab === 'search' && !currentProduct && !isLoading && (
            <div className="space-y-4">
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Produktname (z. B. Alpro Soja, Exquisa, Skyr)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 text-xs bg-slate-50 focus:bg-white rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#789A99]"
                  />
                  <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                    <SpeechInputButton
                      onTranscript={(txt) => setSearchQuery(txt)}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={!searchQuery.trim() || isSearching}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 disabled:opacity-50 cursor-pointer active:scale-95 transition-all flex items-center gap-1 shrink-0"
                >
                  {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  Suchen
                </button>
              </form>

              {/* Search Results List */}
              {searchResults.length > 0 && (
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Gefundene Produkte:
                  </span>
                  <div className="space-y-1.5 max-h-60 overflow-y-auto">
                    {searchResults.map((prod, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectSearchResult(prod)}
                        className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left flex items-center justify-between gap-3 transition-colors cursor-pointer group"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] text-[#789A99] font-bold block">{prod.brand}</span>
                          <span className="text-xs font-bold text-slate-900 truncate block">{prod.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {prod.kcal} kcal • {prod.protein}g Protein • {prod.fat}g Fett
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Result Card: Product Detail & Nicole Evaluation */}
          {currentProduct && evaluation && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              
              {/* Product Header Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  {currentProduct.imageUrl && (
                    <img
                      src={currentProduct.imageUrl}
                      alt={currentProduct.name}
                      className="w-14 h-14 object-contain rounded-xl bg-white border border-slate-200 p-1 shrink-0"
                    />
                  )}
                  <div>
                    {currentProduct.brand && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#789A99] block">
                        {currentProduct.brand}
                      </span>
                    )}
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                      {currentProduct.name}
                    </h3>
                    <span className="text-[11px] text-slate-500 font-mono block mt-0.5">
                      Angabe je 100g {currentProduct.servingSize && `(Portionsgröße: ${currentProduct.servingSize})`}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 self-start sm:self-center hover:underline cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Neuer Scan
                </button>
              </div>

              {/* The Nicole Ampel Banner */}
              <div
                className={`p-4 rounded-2xl border-2 flex items-start gap-3 shadow-xs ${
                  evaluation.suitability === 'great'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : evaluation.suitability === 'caution-fat'
                    ? 'bg-amber-50 border-amber-300 text-amber-950'
                    : 'bg-rose-50 border-rose-300 text-rose-950'
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {evaluation.suitability === 'great' && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  )}
                  {evaluation.suitability === 'caution-fat' && (
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  )}
                  {evaluation.suitability === 'fat-trap' && (
                    <AlertOctagon className="w-5 h-5 text-rose-600" />
                  )}
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {evaluation.suitability === 'great'
                        ? '🟢 Top Nicole-Match'
                        : evaluation.suitability === 'caution-fat'
                        ? '🟡 Auf Portion achten'
                        : '🔴 Fettfalle für Nicole'}
                    </span>
                    <span className="text-[11px] font-mono font-bold">
                      {evaluation.dailyFatPercent}% vom 44g-Tagesbudget
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed font-medium">
                    {evaluation.fatVerdict}
                  </p>
                  <p className="text-xs opacity-90">
                    {evaluation.proteinVerdict}
                  </p>
                </div>
              </div>

              {/* Macro Grid */}
              <div className="grid grid-cols-4 gap-2">
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-center shadow-xs">
                  <span className="text-[10px] text-slate-400 block font-semibold">Kalorien</span>
                  <span className="text-sm sm:text-base font-bold font-mono text-slate-900">{currentProduct.kcal}</span>
                  <span className="text-[9px] text-slate-400 block">kcal / 100g</span>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center shadow-xs">
                  <span className="text-[10px] text-emerald-800 block font-semibold">Protein</span>
                  <span className="text-sm sm:text-base font-bold font-mono text-emerald-700">{currentProduct.protein}g</span>
                  <span className="text-[9px] text-emerald-600 block">{evaluation.dailyProteinPercent}% von 103g</span>
                </div>

                <div
                  className={`p-3 rounded-xl border text-center shadow-xs ${
                    currentProduct.fat <= 3.5
                      ? 'bg-amber-50/60 border-amber-200'
                      : currentProduct.fat <= 10.0
                      ? 'bg-amber-100/70 border-amber-300'
                      : 'bg-rose-50 border-rose-300'
                  }`}
                >
                  <span className="text-[10px] text-slate-600 block font-semibold">Fett</span>
                  <span
                    className={`text-sm sm:text-base font-bold font-mono ${
                      currentProduct.fat <= 3.5
                        ? 'text-[#994931]'
                        : currentProduct.fat <= 10.0
                        ? 'text-amber-800'
                        : 'text-rose-600'
                    }`}
                  >
                    {currentProduct.fat}g
                  </span>
                  <span className="text-[9px] text-slate-400 block">Limit: 44g/Tag</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 text-center shadow-xs">
                  <span className="text-[10px] text-slate-400 block font-semibold">Carbs</span>
                  <span className="text-sm sm:text-base font-bold font-mono text-slate-800">{currentProduct.carbs}g</span>
                  <span className="text-[9px] text-slate-400 block">Kohlenhydrate</span>
                </div>
              </div>

              {/* Action Buttons: Einkaufsliste & Loggen */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleAddShopping}
                  disabled={addedNotice}
                  className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold border shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all ${
                    addedNotice
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  {addedNotice ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      Auf Einkaufsliste gesetzt!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 text-[#789A99]" />
                      Auf Einkaufsliste setzen
                    </>
                  )}
                </button>

                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                  <select
                    value={targetSlot}
                    onChange={(e) => setTargetSlot(e.target.value as MealType)}
                    className="text-xs p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium focus:outline-none focus:border-[#789A99]"
                  >
                    <option value="snack">Als Snack loggen</option>
                    <option value="lunch">Als Mittagessen</option>
                    <option value="dinner">Als Abendbrot</option>
                    <option value="breakfast">Als Frühstück</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleLogToToday}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shrink-0"
                  >
                    <CalendarPlus className="w-4 h-4" />
                    {loggedNotice ? 'Geloggt ✓' : 'In Tag eintragen'}
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
