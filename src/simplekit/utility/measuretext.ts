let canvasBuffer: HTMLCanvasElement;

export function measureText(text: string, font: string): TextMetrics | null {
  if (!canvasBuffer) canvasBuffer = document.createElement("canvas");
  if (!canvasBuffer) return null;
  const gc = canvasBuffer.getContext("2d");
  if (!gc) return null;

  // do the measurement
  gc.font = font;
  return gc.measureText(text);
}
