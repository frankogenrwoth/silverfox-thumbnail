export type ExportType = 'image/png' | 'image/jpeg' | 'image/webp';

export interface ImageAdjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  gray: number;
  sepia: number;
  hue: number;
  blur: number;
  opacity: number;
  warmth: number;
  fade: number;
  vignette: number;
  grain: number;
  edge: number;
  eL: boolean;
  eR: boolean;
  eT: boolean;
  eB: boolean;
  radius: number;
  borderW: number;
  borderC: string;
  shadow: number;
  shadowC: string;
  shadowX: number;
  shadowY: number;
  shadowBlur: number;
}

export type NumericAdjustmentKey = {
  [K in keyof ImageAdjustments]: ImageAdjustments[K] extends number ? K : never;
}[keyof ImageAdjustments];

export type LookKey =
  | 'brightness' | 'contrast' | 'saturation' | 'gray' | 'sepia' | 'hue'
  | 'blur' | 'warmth' | 'fade' | 'vignette' | 'grain';

export type LookPreset = Partial<Pick<ImageAdjustments, LookKey>>;

export interface PhotoSlot {
  img: HTMLImageElement | null;
  ox: number;
  oy: number;
  zoom: number;
  flipH: boolean;
  flipV: boolean;
  adj: ImageAdjustments;
}

export interface TextItem {
  id: number;
  text: string;
  font: string;
  size: number;
  weight: number;
  italic: boolean;
  upper: boolean;
  color: string;
  x: number;
  y: number;
  ls: number;
  lh: number;
  shadow: number;
  shadowBlur: number;
  strokeW: number;
  strokeC: string;
  box: boolean;
  boxC: string;
  boxO: number;
  pad: number;
}

export type NumericTextKey = {
  [K in keyof TextItem]: TextItem[K] extends number ? K : never;
}[keyof TextItem];

export type Selection =
  | { type: 'slot'; i: number }
  | { type: 'text'; id: number }
  | { type: 'none' };

export interface ComposerState {
  W: number;
  H: number;
  cols: number;
  weights: number[];
  gutter: number;
  margin: number;
  bg: string;
  slots: PhotoSlot[];
  texts: TextItem[];
  sel: Selection;
  fonts: string[];
  target: number;
  lastFont: string;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface SliderSpec<K extends string = string> {
  k: K;
  label: string;
  min: number;
  max: number;
  step?: number;
  u?: string;
}

export type ColumnCount = 2 | 3 | 4;
