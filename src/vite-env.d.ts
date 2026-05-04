/// <reference types="vite/client" />

interface BarcodeDetector {
  detect(image: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement | ImageData): Promise<{ rawValue: string; format: string }[]>
}

declare const BarcodeDetector: {
  new(options?: { formats: string[] }): BarcodeDetector
  getSupportedFormats(): Promise<string[]>
}
