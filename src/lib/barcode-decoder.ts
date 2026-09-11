import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';

let globalReader: BrowserMultiFormatReader | null = null;

export function getBarcodeReader(): BrowserMultiFormatReader {
  if (!globalReader) {
    const hints = new Map();
    // Prioritize retail supermarket formats
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
      BarcodeFormat.CODE_128,
      BarcodeFormat.QR_CODE,
    ]);
    hints.set(DecodeHintType.TRY_HARDER, true);
    globalReader = new BrowserMultiFormatReader(hints);
  }
  return globalReader;
}

/**
 * Decodes a barcode from a HTMLCanvasElement or HTMLImageElement
 */
export async function decodeBarcodeFromCanvasOrImage(
  element: HTMLCanvasElement | HTMLImageElement
): Promise<string | null> {
  try {
    const reader = getBarcodeReader();
    let result: any = null;
    if (typeof HTMLCanvasElement !== 'undefined' && element instanceof HTMLCanvasElement) {
      result = reader.decodeFromCanvas(element);
    } else if (typeof HTMLImageElement !== 'undefined' && element instanceof HTMLImageElement) {
      result = await reader.decodeFromImageElement(element);
    } else {
      result = await reader.decode(element as any);
    }
    if (result && result.getText()) {
      return result.getText().trim();
    }
  } catch (e) {
    // No barcode found in this frame/image
  }
  return null;
}
