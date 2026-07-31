import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  Vibration,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Audio } from 'expo-av';
import { X, Camera as CameraIcon, Sparkles, ShoppingCart, Scale } from 'lucide-react-native';
import { CartItem } from '../types';
import { POPULAR_BARCODES, PreseedProduct } from '../data/mockDatabase';
import { formatBRL, calculateUnitPrice, getBaseUnitLabel } from '../utils/calculator';

// Helper to play scanner beep and trigger vibration in React Native / Expo
const playBeep = async () => {
  try {
    // Triggers short haptic/vibration feedback (100ms)
    Vibration.vibrate(100);

    // Loads and plays the beep wav sound
    const { sound } = await Audio.Sound.createAsync(
      require('../../assets/beep.wav')
    );
    await sound.playAsync();

    // Automatically unload from memory once playback finishes to prevent memory leaks
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch (error) {
    console.warn('Failed to play mobile beep sound:', error);
  }
};

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: Omit<CartItem, 'id' | 'addedAt'>) => void;
  onOpenCompareWithOptions?: (item: CartItem) => void;
  onBulkAdd?: (items: Omit<CartItem, 'id' | 'addedAt'>[]) => void;
}

// Configuração do IP do Backend (Substitua pelo IP local do seu computador para testar no dispositivo físico)
const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.64.178:3333';

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onAddToCart,
  onOpenCompareWithOptions,
  onBulkAdd,
}) => {
  console.log('BarcodeScannerModal rendering!');
  const [permission, requestPermission] = useCameraPermissions();
  const [detectedProduct, setDetectedProduct] = useState<PreseedProduct | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const [isParsingNfce, setIsParsingNfce] = useState(false);
  const [useRealCamera, setUseRealCamera] = useState(true);
  
  const cameraRef = useRef<any>(null);

  // Request permissions automatically when the camera is requested
  useEffect(() => {
    if (isOpen && useRealCamera && (!permission || !permission.granted)) {
      requestPermission();
    }
  }, [isOpen, useRealCamera, permission]);

  // Simula detecção automática quando abre o scanner no modo simulado
  useEffect(() => {
    if (isOpen && !useRealCamera) {
      setIsScanning(true);
      const timer = setTimeout(() => {
        setDetectedProduct(POPULAR_BARCODES[0]); // Detergente Ypê
        setIsScanning(false);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setDetectedProduct(null);
    }
  }, [isOpen, useRealCamera]);

  const handleSelectBarcodeSimulated = (prod: PreseedProduct) => {
    setIsScanning(true);
    setDetectedProduct(null);
    setTimeout(() => {
      playBeep();
      setDetectedProduct(prod);
      setIsScanning(false);
    }, 450);
  };

  const handleNfceScanned = async (url: string) => {
    setIsScanning(false);
    setIsParsingNfce(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/parse-nfce`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const resJson = await response.json();
      if (resJson.success && resJson.items && resJson.items.length > 0) {
        if (onBulkAdd) {
          onBulkAdd(resJson.items);
        }
        onClose();
      } else {
        throw new Error(resJson.error || 'Nenhum item encontrado na Nota Fiscal.');
      }
    } catch (err: any) {
      Alert.alert('Erro ao importar Nota Fiscal', err.message || 'Erro de conexão.');
      setIsScanning(true);
    } finally {
      setIsParsingNfce(false);
    }
  };

  const handleBarcodeScannedReal = ({ data }: { data: string }) => {
    if (!isScanning) return;
    if (data.startsWith('http://') || data.startsWith('https://')) {
      handleNfceScanned(data);
      return;
    }
    setIsScanning(false);
    playBeep();
    
    // Busca na lista local primeiro
    const localMatch = POPULAR_BARCODES.find((b) => b.barcode === data);
    if (localMatch) {
      setDetectedProduct(localMatch);
    } else {
      // Se não achar, faz a requisição para o nosso backend Fastify na rota de EAN
      fetch(`${BACKEND_URL}/api/v1/products/${data}`)
        .then((res) => res.json())
        .then((resJson) => {
          if (resJson.success && resJson.data) {
            setDetectedProduct({
              barcode: data,
              name: resJson.data.name,
              brand: resJson.data.brand,
              price: 5.50, // Preço padrão para novos itens biados
              unitAmount: resJson.data.unit_weight_grams || 1000,
              unitType: resJson.data.unit_type || 'g',
              category: 'Outros',
              imageUrl: '',
            });
          }
        })
        .catch(() => {
          // Fallback silencioso
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
        });
    }
  };

  const handleTakePhotoAndAnalyze = async () => {
    if (!cameraRef.current) return;
    try {
      setIsAnalyzingPhoto(true);
      setDetectedProduct(null);

      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.5,
      });

      if (!photo.base64) {
        throw new Error('Falha ao obter imagem');
      }

      // Envia para o backend Fastify
      const response = await fetch(`${BACKEND_URL}/api/scan-price-tag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: `data:image/jpeg;base64,${photo.base64}` }),
      });

      const data = await response.json();
      
      setDetectedProduct({
        barcode: 'AI_' + Date.now(),
        name: data.name || 'Produto Identificado',
        brand: data.brand || 'Marca',
        price: data.price || 5.90,
        unitAmount: data.quantity || 500,
        unitType: data.unit || 'g',
        category: data.category || 'Outros',
        imageUrl: photo.uri,
      });
      playBeep();
    } catch (err) {
      console.error('Error scanning tag:', err);
      Alert.alert(
        'Erro na Leitura da Etiqueta',
        'Não foi possível conectar ao backend ou processar a imagem. Usando produto simulado.',
        [{ text: 'OK', onPress: () => setDetectedProduct(POPULAR_BARCODES[0]) }]
      );
    } finally {
      setIsAnalyzingPhoto(false);
    }
  };

  const toggleCameraMode = async () => {
    if (!permission || !permission.granted) {
      const res = await requestPermission();
      if (res.granted) {
        setUseRealCamera(true);
      } else {
        Alert.alert('Permissão Necessária', 'Precisamos de acesso à câmera para escanear.');
      }
    } else {
      setUseRealCamera(!useRealCamera);
    }
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

  return (
    <Modal visible={isOpen} animationType="slide" transparent={false}>
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <X size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>CustoCerto Scanner</Text>
          <TouchableOpacity onPress={toggleCameraMode} style={styles.toggleModeBtn} activeOpacity={0.7}>
            <Text style={styles.toggleModeBtnText}>
              {useRealCamera ? 'Simulador' : 'Câmera'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Scan Area */}
        <View style={styles.scannerWrapper}>
          {useRealCamera && permission?.granted ? (
            <CameraView
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
              facing="back"
              barcodeScannerSettings={{
                barcodeTypes: ['ean13', 'ean8', 'upc_a', 'qr'],
              }}
              onBarcodeScanned={isScanning ? handleBarcodeScannedReal : undefined}
            />
          ) : (
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=60',
              }}
              style={StyleSheet.absoluteFill}
            />
          )}

          {/* Viewfinder frame */}
          <View style={styles.viewfinder}>
            {/* Animated Laser line */}
            <View style={styles.laser} />
            {/* Corners */}
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
          </View>

          <Text style={styles.hintText}>
            {useRealCamera
              ? 'Alinhe o código de barras ou fotografe a etiqueta de preço'
              : 'Detecção Simulada Ativa (Toque abaixo para testar)'}
          </Text>

          {/* Quick Presets for simulator */}
          {!useRealCamera && (
            <View style={styles.presetButtons}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetScroll}>
                <TouchableOpacity
                  onPress={() => handleNfceScanned('https://www.sefaz.rs.gov.br/NFCE/NFCE-COM.aspx?chNFe=43211092702069012896651040001234561001234567')}
                  style={[styles.presetItem, { backgroundColor: '#d97706', borderColor: '#d97706' }]}
                >
                  <Text style={styles.presetItemText}>🧾 Simular Nota (Sefaz)</Text>
                </TouchableOpacity>
                {POPULAR_BARCODES.map((prod) => (
                  <TouchableOpacity
                    key={prod.barcode}
                    onPress={() => handleSelectBarcodeSimulated(prod)}
                    style={styles.presetItem}
                  >
                    <Text style={styles.presetItemText}>
                      {prod.name.split(' ')[0]} - R$ {prod.price.toFixed(2)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Tag Scan Button */}
          {useRealCamera && (
            <TouchableOpacity
              onPress={handleTakePhotoAndAnalyze}
              style={styles.scanTagBtn}
              activeOpacity={0.8}
            >
              <Sparkles size={16} color="#004d1a" />
              <Text style={styles.scanTagBtnText}>Analisar Etiqueta com IA</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Bottom Sheet Details */}
        <View style={styles.bottomSheet}>
          {isParsingNfce ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#d97706" />
              <Text style={styles.loadingText}>Importando Nota Fiscal...</Text>
            </View>
          ) : isAnalyzingPhoto ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#006e28" />
              <Text style={styles.loadingText}>Analisando etiqueta com IA...</Text>
            </View>
          ) : detectedProduct ? (
            <View style={styles.detectedCard}>
              <View style={styles.cardInfoRow}>
                <View style={styles.imageContainer}>
                  {detectedProduct.imageUrl ? (
                    <Image source={{ uri: detectedProduct.imageUrl }} style={styles.cardImage as any} />
                  ) : (
                    <Text style={styles.imagePlaceholder}>🛒</Text>
                  )}
                </View>

                <View style={styles.cardTexts}>
                  <Text style={styles.detectedLabel}>PRODUTO IDENTIFICADO</Text>
                  <Text style={styles.detectedName} numberOfLines={1}>
                    {detectedProduct.name}
                  </Text>
                  <View style={styles.detectedPriceRow}>
                    <Text style={styles.detectedPrice}>{formatBRL(detectedProduct.price)}</Text>
                    <Text style={styles.detectedUnitPrice}>
                      {formatBRL(
                        calculateUnitPrice(
                          detectedProduct.price,
                          detectedProduct.unitAmount,
                          detectedProduct.unitType
                        )
                      )}{' '}
                      / {getBaseUnitLabel(detectedProduct.unitType)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity onPress={handleAddCurrent} style={styles.addBtn} activeOpacity={0.8}>
                  <ShoppingCart size={18} color="#004d1a" />
                  <Text style={styles.addBtnText}>Adicionar ao Carrinho</Text>
                </TouchableOpacity>

                {onOpenCompareWithOptions && (
                  <TouchableOpacity
                    onPress={() => {
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
                    style={styles.compareBtn}
                    activeOpacity={0.8}
                  >
                    <Scale size={16} color="#006e28" />
                    <Text style={styles.compareBtnText}>Comparar</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ) : (
            <View style={styles.noDetectionContainer}>
              <ActivityIndicator size="small" color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.noDetectionText}>Aguardando detecção de produto...</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    height: 90,
    paddingTop: 45,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    zIndex: 10,
  },
  closeBtn: {
    padding: 6,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  toggleModeBtn: {
    backgroundColor: '#006e28',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  toggleModeBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  scannerWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  viewfinder: {
    width: 240,
    height: 240,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: 'rgba(52, 199, 89, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#34c759',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  laser: {
    position: 'absolute',
    left: 10,
    right: 10,
    height: 2,
    backgroundColor: '#34c759',
    shadowColor: '#34c759',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 3,
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#34c759',
  },
  topRight: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 16,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 16,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 16,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 16,
  },
  hintText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 20,
    textAlign: 'center',
  },
  presetButtons: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    height: 48,
  },
  presetScroll: {
    paddingHorizontal: 20,
    gap: 8,
    alignItems: 'center',
  },
  presetItem: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderColor: 'rgba(255,255,255,0.25)',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  presetItemText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  scanTagBtn: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  scanTagBtnText: {
    color: '#004d1a',
    fontSize: 12,
    fontWeight: '800',
  },
  bottomSheet: {
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 10,
    minHeight: 180,
    justifyContent: 'center',
  },
  noDetectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  noDetectionText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontWeight: '600',
  },
  loadingContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1a1b1f',
  },
  detectedCard: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 16,
    gap: 16,
  },
  cardInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  imageContainer: {
    width: 68,
    height: 68,
    borderRadius: 14,
    backgroundColor: '#f4f3f8',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
  },
  imagePlaceholder: {
    fontSize: 22,
  },
  cardTexts: {
    flex: 1,
    gap: 2,
  },
  detectedLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#006e28',
    letterSpacing: 0.5,
  },
  detectedName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a1b1f',
  },
  detectedPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 2,
  },
  detectedPrice: {
    fontSize: 20,
    fontWeight: '900',
    color: '#006e28',
  },
  detectedUnitPrice: {
    fontSize: 11,
    color: '#6d7b6b',
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  addBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34c759',
    borderRadius: 14,
    height: 44,
    gap: 6,
  },
  addBtnText: {
    color: '#004d1a',
    fontSize: 13,
    fontWeight: '800',
  },
  compareBtn: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eeedf3',
    borderRadius: 14,
    height: 44,
    gap: 6,
  },
  compareBtnText: {
    color: '#004d1a',
    fontSize: 13,
    fontWeight: '800',
  },
});
