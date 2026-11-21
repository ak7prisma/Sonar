export interface MathOcrResult {
  latex: string;
  confidence: number;
  provider: string;
}

/**
 * Pluggable Math OCR adapter interface (allows swapping Gemini Vision with Mathpix
 * or another specialized math recognizer without modifying pipeline callers).
 */
export interface MathOcrProvider {
  readonly name: string;
  recognizeEquationImage(options: {
    imageBase64: string;
    contextHint?: string;
  }): Promise<MathOcrResult>;
}
