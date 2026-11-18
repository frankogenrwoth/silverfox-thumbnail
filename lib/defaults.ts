import type {
  ColumnCount, ComposerState, ImageAdjustments, LookKey, LookPreset,
  NumericAdjustmentKey, NumericTextKey, PhotoSlot, SliderSpec, TextItem,
} from './types';

export const DEF: ImageAdjustments = {
  brightness: 100, contrast: 100, saturation: 100, gray: 0, sepia: 0, hue: 0, blur: 0, opacity: 100,
  warmth: 0, fade: 0, vignette: 0, grain: 0,
  edge: 0, eL: true, eR: true, eT: true, eB: true, radius: 0, borderW: 0, borderC: '#ffffff',
  shadow: 0, shadowC: '#000000', shadowX: 0, shadowY: 0, shadowBlur: 30,
};

export const LOOK_KEYS: LookKey[] = [
  'brightness', 'contrast', 'saturation', 'gray', 'sepia', 'hue',
  'blur', 'warmth', 'fade', 'vignette', 'grain',
];

export const TEXT_DEF = { size: 140, ls: 0, lh: 1.1, shadow: 60, shadowBlur: 24, strokeW: 0, boxO: 60, pad: 14 };

export const WEIGHT_PRESETS: Record<ColumnCount, Array<[string, number[]]>> = {
  2: [['Equal', [50, 50]], ['Left wide', [65, 35]], ['Right wide', [35, 65]]],
  3: [
    ['Narrow centre 35/30/35', [35, 30, 35]],
    ['Equal', [33, 33, 33]],
    ['Wide centre 25/50/25', [25, 50, 25]],
    ['Left wide 50/25/25', [50, 25, 25]],
    ['Right wide 25/25/50', [25, 25, 50]],
  ],
  4: [
    ['Equal', [25, 25, 25, 25]],
    ['Wide outer 35/15/15/35', [35, 15, 15, 35]],
    ['Wide centre 15/35/35/15', [15, 35, 35, 15]],
    ['Stepped 40/30/20/10', [40, 30, 20, 10]],
  ],
};

export const PRESETS: Record<string, LookPreset> = {
  Natural: {},
  Cinematic: { brightness: 95, contrast: 125, saturation: 85, warmth: -12, vignette: 45, fade: 10, grain: 15 },
  Vintage: { sepia: 35, contrast: 95, saturation: 80, fade: 30, vignette: 35, grain: 30, warmth: 20 },
  Warm: { warmth: 45, saturation: 110, brightness: 105 },
  Cool: { warmth: -45, saturation: 95 },
  Dramatic: { contrast: 160, saturation: 90, brightness: 90, vignette: 55, grain: 10 },
  Moody: { brightness: 85, contrast: 130, saturation: 65, warmth: -18, fade: 12, vignette: 65, grain: 20 },
  'Black & White': { gray: 100, contrast: 130, vignette: 40, grain: 20 },
};

export const FONT_OPTIONS = [
  'Times New Roman', 'Georgia', 'Palatino Linotype', 'Arial', 'Helvetica', 'Verdana',
  'Trebuchet MS', 'Impact', 'Arial Black', 'Courier New',
];

export const WEIGHT_OPTIONS: Array<[number, string]> = [
  [400, 'Regular 400'], [500, 'Medium 500'], [600, 'Semibold 600'],
  [700, 'Bold 700'], [800, 'Extra bold 800'], [900, 'Black 900'],
];

export const SIZE_PRESETS: Array<[string, string, number, number]> = [
  ['1280x720', 'YouTube thumbnail 1280×720', 1280, 720],
  ['1920x1080', 'Full HD 1920×1080', 1920, 1080],
  ['1080x1080', 'Square 1080×1080', 1080, 1080],
  ['1080x1350', 'Portrait 1080×1350', 1080, 1350],
  ['1080x1920', 'Story 1080×1920', 1080, 1920],
];

export const TONE_SPECS: SliderSpec<NumericAdjustmentKey>[] = [
  { k: 'contrast', label: 'Contrast', min: 0, max: 250, u: '%' },
  { k: 'brightness', label: 'Brightness', min: 0, max: 250, u: '%' },
  { k: 'saturation', label: 'Saturation', min: 0, max: 300, u: '%' },
];

export const COLOR_SPECS: SliderSpec<NumericAdjustmentKey>[] = [
  { k: 'warmth', label: 'Warm ⟷ Cool', min: -100, max: 100 },
  { k: 'hue', label: 'Hue rotate', min: -180, max: 180, u: '°' },
  { k: 'gray', label: 'Grayscale', min: 0, max: 100, u: '%' },
  { k: 'sepia', label: 'Sepia', min: 0, max: 100, u: '%' },
];

export const FINISH_SPECS: SliderSpec<NumericAdjustmentKey>[] = [
  { k: 'fade', label: 'Fade (matte / lifted blacks)', min: 0, max: 100 },
  { k: 'vignette', label: 'Vignette', min: 0, max: 100 },
  { k: 'grain', label: 'Film grain', min: 0, max: 100 },
  { k: 'blur', label: 'Blur', min: 0, max: 20, step: 0.5, u: 'px' },
  { k: 'opacity', label: 'Opacity', min: 0, max: 100, u: '%' },
];

export const BOUNDARY_SPECS: SliderSpec<NumericAdjustmentKey>[] = [
  { k: 'radius', label: 'Corner radius', min: 0, max: 300, u: 'px' },
  { k: 'borderW', label: 'Border thickness', min: 0, max: 60, u: 'px' },
];

export const SHADOW_SPECS: SliderSpec<NumericAdjustmentKey>[] = [
  { k: 'shadow', label: 'Shadow opacity', min: 0, max: 100, u: '%' },
  { k: 'shadowBlur', label: 'Blur', min: 0, max: 100, u: 'px' },
  { k: 'shadowX', label: 'Offset X', min: -100, max: 100, u: 'px' },
  { k: 'shadowY', label: 'Offset Y', min: -100, max: 100, u: 'px' },
];

export const TEXT_SIZE_SPECS: SliderSpec<NumericTextKey>[] = [
  { k: 'size', label: 'Font size', min: 10, max: 1200, u: 'px' },
  { k: 'ls', label: 'Letter spacing', min: -10, max: 60, u: 'px' },
  { k: 'lh', label: 'Line height', min: 0.6, max: 2.2, step: 0.05 },
];

export const TEXT_SHADOW_SPECS: SliderSpec<NumericTextKey>[] = [
  { k: 'shadow', label: 'Shadow opacity', min: 0, max: 100, u: '%' },
  { k: 'shadowBlur', label: 'Shadow blur', min: 0, max: 100, u: 'px' },
  { k: 'strokeW', label: 'Outline width', min: 0, max: 40, u: 'px' },
];

export const TEXT_BOX_SPECS: SliderSpec<NumericTextKey>[] = [
  { k: 'boxO', label: 'Box opacity', min: 0, max: 100, u: '%' },
  { k: 'pad', label: 'Padding', min: 0, max: 100, u: 'px' },
];

let uid = 1;
export const nextId = (): number => uid++;

export function createSlot(): PhotoSlot {
  return { img: null, ox: 0, oy: 0, zoom: 100, flipH: false, flipV: false, adj: { ...DEF } };
}

type TextContext = Pick<ComposerState, 'W' | 'H' | 'lastFont'>;

export function createText(overrides: Partial<TextItem> = {}, ctx?: TextContext): TextItem {
  const w = ctx?.W ?? 1280;
  const h = ctx?.H ?? 720;
  return {
    id: nextId(), text: 'Your text', font: ctx?.lastFont ?? FONT_OPTIONS[0], size: TEXT_DEF.size,
    weight: 700, italic: false, upper: false, color: '#ffffff', x: w / 2, y: h / 2,
    ls: 0, lh: 1.1, shadow: 60, shadowBlur: 24, strokeW: 0, strokeC: '#000000',
    box: false, boxC: '#000000', boxO: 60, pad: 14,
    ...overrides,
  };
}

export function createInitialState(): ComposerState {
  const state: ComposerState = {
    W: 1280, H: 720, cols: 3, weights: [35, 30, 35], gutter: 0, margin: 0, bg: '#0a0a0a',
    slots: [0, 1, 2, 3].map(() => createSlot()),
    texts: [], sel: { type: 'slot', i: 0 },
    fonts: [...FONT_OPTIONS], target: 0, lastFont: FONT_OPTIONS[0],
  };
  state.texts.push(createText({ text: 'Manifest.', size: 150 }, state));
  return state;
}
