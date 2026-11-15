/**
 * GridScan tuned for deepe light surfaces (`bg-app-canvas`, primary brand).
 * Standalone demo:
 *   <div className="relative h-[600px] w-full">
 *     <GridScan {...GRID_SCAN_LIGHT} />
 *   </div>
 */
export const GRID_SCAN_LIGHT = {
  lightMode: true,
  linesColor: '#9eb0c9',
  scanColor: '#4F86F7',
  cells: 8,
  lineThickness: 1,
  lineStyle: 'solid',
  depth: 6,
  depthFade: 0.48,
  parallax: 0.55,
  shading: 0.65,
  reflection: 0.28,
  points: true,
  scanDirection: 'forward',
  scanDuration: 2.6,
  scanDelay: 1.8,
  scanWidth: 1,
  trail: 0.5,
  glow: 0.55,
  autoScan: true,
  interactive: true,
  clickEffect: 'ping',
  enableWebcam: false,
  showPreview: false,
  intro: true,
}
