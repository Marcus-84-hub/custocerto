import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Zap, Sparkles, ShoppingCart, Scale, Upload, Image as ImageIcon } from 'lucide-react';
import { CartItem } from '../types';
import { POPULAR_BARCODES, PreseedProduct } from '../data/mockDatabase';
import { formatBRL, calculateUnitPrice, getBaseUnitLabel } from '../utils/calculator';
import { motion, AnimatePresence } from 'motion/react';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: Omit<CartItem, 'id' | 'addedAt'>) => void;
  onOpenCompareWithOptions?: (item: CartItem) => void;
}

// Helper to play a synthesized scanner beep using Web Audio API
const playBeep = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime); // 1200Hz sharp beep

    gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.15);

    setTimeout(() => {
      audioCtx.close();
    }, 200);
  } catch (error) {
    console.warn('AudioContext beep failed:', error);
  }
};

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onAddToCart,
  onOpenCompareWithOptions,
}) => {
  const [detectedProduct, setDetectedProduct] = useState<PreseedProduct | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isScanningRef = useRef(isScanning);
  useEffect(() => {
    isScanningRef.current = isScanning;
  }, [isScanning]);

  const handleBarcodeScannedReal = async (data: string) => {
    setIsScanning(false);
    playBeep();

    // Busca na lista local primeiro
    const localMatch = POPULAR_BARCODES.find((b) => b.barcode === data);
    if (localMatch) {
      setDetectedProduct(localMatch);
    } else {
      try {
        const response = await fetch(`/api/v1/products/${data}`);
        const resJson = await response.json();
        if (resJson.success && resJson.data) {
          setDetectedProduct({
            barcode: data,
            name: resJson.data.name,
            brand: resJson.data.brand,
            price: 5.50, // Preço padrão para novos itens
            unitAmount: resJson.data.unit_weight_grams || 1000,
            unitType: resJson.data.unit_type || 'g',
            category: 'Outros',
            imageUrl: '',
          });
        }
      } catch (err) {
        // Fallback
        setDetectedProduct({
          barcode: data,
          name: `Item EAN ${data}`,
          brand: 'Desconhecida',
          price: 5.50,
          unitAmount: 1,
          unitType: 'un',
          category: 'Outros',
          imageUrl: '',
        });
      }
    }
  };

  // Start camera stream when open, and clean up when closed
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    let animationFrameId: number;
    let isComponentMounted = true;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (!isComponentMounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        activeStream = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);

          // Se o navegador suportar o BarcodeDetector nativo, rodar detecção em tempo real
          if ('BarcodeDetector' in window) {
            const detector = new (window as any).BarcodeDetector({
              formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e']
            });

            const scanFrame = async () => {
              if (videoRef.current && isScanningRef.current && isComponentMounted) {
                try {
                  const barcodes = await detector.detect(videoRef.current);
                  if (barcodes.length > 0 && isComponentMounted && isScanningRef.current) {
                    const scannedData = barcodes[0].rawValue;
                    handleBarcodeScannedReal(scannedData);
                  }
                } catch (err) {
                  // ignorar erros de frame individual
                }
              }
              if (isOpen && isComponentMounted) {
                animationFrameId = requestAnimationFrame(scanFrame);
              }
            };

            videoRef.current.onplay = () => {
              scanFrame();
            };
          }
        }
      } catch (e) {
        console.warn('Camera access error or unsupported in environment:', e);
      }
    };

    if (isOpen) {
      setIsScanning(true);
      startCamera();

      return () => {
        isComponentMounted = false;
        cancelAnimationFrame(animationFrameId);
        if (activeStream) {
          activeStream.getTracks().forEach(track => track.stop());
        }
      };
    } else {
      setDetectedProduct(null);
      setCameraActive(false);
    }
  }, [isOpen]);

  const handleSelectBarcode = (prod: PreseedProduct) => {
    setIsScanning(true);
    setDetectedProduct(null);
    setTimeout(() => {
      playBeep();
      setDetectedProduct(prod);
      setIsScanning(false);
    }, 400);
  };

  // Upload/Take Photo of Price Tag for Gemini AI Recognition
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzingPhoto(true);
    setDetectedProduct(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        const response = await fetch('/api/scan-price-tag', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64 }),
        });
        const data = await response.json();
        
        setDetectedProduct({
          barcode: 'AI_' + Date.now(),
          name: data.name || 'Produto Identificado',
          brand: data.brand || 'Marca',
          price: data.price || 2.15,
          unitAmount: data.quantity || 500,
          unitType: data.unit || 'mL',
          category: data.category || 'Limpeza',
          imageUrl: URL.createObjectURL(file),
        });
        playBeep();
      } catch (err) {
        console.error('Error scanning tag:', err);
        setDetectedProduct(POPULAR_BARCODES[0]);
      } finally {
        setIsAnalyzingPhoto(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddCurrent = () => {
    if (!detectedProduct) return;
    onAddToCart({
      barcode: detectedProduct.barcode,
      name: detectedProduct.name,
      brand: detectedProduct.brand,
      price: detectedProduct.price,
      quantity: 1,
      unitAmount: detectedProduct.unitAmount,
      unitType: detectedProduct.unitType,
      category: detectedProduct.category,
      imageUrl: detectedProduct.imageUrl,
      previousPrice: detectedProduct.previousPrice,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between overflow-hidden font-sans">
      {/* Top Header */}
      <div className="relative z-20 flex justify-between items-center p-5 pt-8 bg-gradient-to-b from-black/80 to-transparent">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition-all"
        >
          <X className="w-6 h-6" />
        </button>
        <span className="font-extrabold text-lg text-white tracking-tight">CustoCerto Scanner</span>
        <div className="bg-[#006e28]/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-xs font-bold text-white">
          Modo Bipagem
        </div>
      </div>

      {/* Viewfinder Camera Layer */}
      <div className="relative flex-1 flex flex-col items-center justify-center -mt-12">
        {/* Real camera video or background mockup image */}
        {cameraActive ? (
          <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center filter brightness-90"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDhTyfKE1UZOMcBnq23n3UKhqPN7REU2zK4-Z3LErb2od9_wEN_0qMUeblp45vP9yiwIU54Un_PoVC_M2DJahF2b1ZDb10sgB8SZcF6xBpMB6YX_f2YIpwZrgZBoUYmLUuEZ-j3EImZawotvTTaMSG8bPeeqx9AhoclP81X6wGLI69-1qTCngdD-1UBhxKY0cPcoxe20L0cBqvZn_PXbgQeck7ePqdJbYCR3XcVb8EKBzuIbqN8FWVGvQ')",
            }}
          />
        )}

        {/* Viewfinder frame */}
        <div className="relative z-10 w-64 h-64 border-2 border-[#34c759]/60 rounded-[36px] overflow-hidden flex items-center justify-center shadow-[0_0_50px_rgba(52,199,89,0.3)]">
          {/* Animated Laser Scan Line */}
          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#34c759] to-transparent animate-[bounce_2s_infinite]" />

          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#34c759] rounded-tl-2xl" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#34c759] rounded-tr-2xl" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#34c759] rounded-bl-2xl" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#34c759] rounded-br-2xl" />
        </div>

        <p className="relative z-10 mt-6 text-white text-xs font-semibold tracking-widest uppercase opacity-80 bg-black/40 px-4 py-1.5 rounded-full backdrop-blur-sm text-center max-w-xs">
          {'BarcodeDetector' in window 
            ? 'Alinhe o código de barras para bipar' 
            : 'Leitor real requer Chrome no Android/PC. Use foto ou botões abaixo.'}
        </p>

        {/* Quick Barcode Selector for Demo Testing */}
        <div className="relative z-10 mt-4 px-4 w-full max-w-xs flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
          {POPULAR_BARCODES.map((prod) => (
            <button
              key={prod.barcode}
              onClick={() => handleSelectBarcode(prod)}
              className="flex-shrink-0 bg-black/60 hover:bg-black/80 text-white text-[11px] font-bold px-3 py-1.5 rounded-full border border-white/20 active:scale-95 transition-all whitespace-nowrap"
            >
              {prod.name.split(' ')[0]} {prod.price.toFixed(2)}
            </button>
          ))}
        </div>

        {/* Upload Price Tag Button */}
        <div className="relative z-10 mt-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handlePhotoUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-full border border-white/30 flex items-center gap-1.5 active:scale-95 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Escanear Etiqueta com IA</span>
          </button>
        </div>
      </div>

      {/* Bottom Sheet - Detected Product Card */}
      <div className="relative z-30 max-w-md mx-auto w-full px-4 pb-6">
        {isAnalyzingPhoto ? (
          <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-6 text-center space-y-3 shadow-2xl">
            <Sparkles className="w-8 h-8 text-[#006e28] animate-spin mx-auto" />
            <p className="font-bold text-base text-[#1a1b1f] dark:text-white">
              Analisando etiqueta de preço com IA...
            </p>
          </div>
        ) : detectedProduct ? (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white dark:bg-zinc-900 rounded-[32px] p-5 shadow-[0_-8px_40px_rgba(0,0,0,0.25)] border border-[#e3e2e7] dark:border-zinc-800"
          >
            {/* Grabber Handle */}
            <div className="w-12 h-1 bg-[#bccbb8] dark:bg-zinc-700 rounded-full mx-auto mb-4" />

            <div className="flex gap-4 items-center">
              {/* Product Thumbnail */}
              <div className="w-20 h-20 rounded-2xl bg-[#f4f3f8] dark:bg-zinc-800 overflow-hidden flex-shrink-0 border border-black/5">
                <img
                  src={detectedProduct.imageUrl}
                  alt={detectedProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-[#006e28] dark:text-[#53e16f] tracking-widest uppercase block mb-0.5">
                  ITEM IDENTIFICADO
                </span>
                <h3 className="font-bold text-lg text-[#1a1b1f] dark:text-white leading-tight truncate">
                  {detectedProduct.name}
                </h3>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xs text-[#6d7b6b]">Melhor preço:</span>
                  <span className="text-2xl font-bold text-[#006e28] dark:text-[#53e16f]">
                    {formatBRL(detectedProduct.price)}
                  </span>
                </div>
                <span className="text-xs text-[#6d7b6b] font-medium block mt-0.5">
                  {formatBRL(
                    calculateUnitPrice(
                      detectedProduct.price,
                      detectedProduct.unitAmount,
                      detectedProduct.unitType
                    )
                  )}{' '}
                  / {getBaseUnitLabel(detectedProduct.unitType)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 gap-2.5 mt-5">
              <button
                onClick={handleAddCurrent}
                className="bg-[#34c759] hover:bg-[#2cb04e] text-[#004d1a] font-bold h-12 rounded-2xl flex items-center justify-center gap-2 text-base shadow-sm active:scale-98 transition-all"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Adicionar ao Carrinho</span>
              </button>

              {onOpenCompareWithOptions && (
                <button
                  onClick={() => {
                    onOpenCompareWithOptions({
                      id: 'scanned-temp',
                      name: detectedProduct.name,
                      brand: detectedProduct.brand,
                      price: detectedProduct.price,
                      quantity: 1,
                      unitAmount: detectedProduct.unitAmount,
                      unitType: detectedProduct.unitType,
                      category: detectedProduct.category,
                      addedAt: new Date().toISOString(),
                    });
                    onClose();
                  }}
                  className="bg-[#eeedf3] dark:bg-zinc-800 hover:bg-[#e3e2e7] text-[#1a1b1f] dark:text-white font-semibold h-11 rounded-2xl flex items-center justify-center gap-2 text-sm active:scale-98 transition-all"
                >
                  <Scale className="w-4 h-4 text-[#006e28] dark:text-[#53e16f]" />
                  <span>Ver Outras Opções (Comparar)</span>
                </button>
              )}
            </div>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
};
