import type { ComposerState, PhotoSlot, Rect, TextItem } from './types';


const clamp = (v: number, a: number, b: number): number => Math.min(b, Math.max(a, v));

export function hexToRgba(hex: string, alpha: number): string {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

function rr(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, radius: number): void {
  const r = Math.max(0, Math.min(radius, w / 2, h / 2));
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

export function layoutRects(state: ComposerState): Rect[] {
  const { W, H, cols, weights, gutter, margin } = state;
  const innerW = W - 2 * margin - gutter * (cols - 1);
  const sum = weights.slice(0, cols).reduce((a, b) => a + b, 0);
  let x = margin;
  const out: Rect[] = [];
  for (let i = 0; i < cols; i++) {
    const w = innerW * weights[i] / sum;
    out.push({ x, y: margin, w, h: H - 2 * margin });
    x += w + gutter;
  }
  return out;
}

let noiseCv: HTMLCanvasElement | null = null;
function noise(): HTMLCanvasElement {
  if (!noiseCv) {
    noiseCv = document.createElement('canvas');
    noiseCv.width = noiseCv.height = 256;
    const n = noiseCv.getContext('2d')!;
    const d = n.createImageData(256, 256);
    for (let i = 0; i < d.data.length; i += 4) {
      const v = Math.random() * 255;
      d.data[i] = d.data[i + 1] = d.data[i + 2] = v;
      d.data[i + 3] = 255;
    }
    n.putImageData(d, 0, 0);
  }
  return noiseCv;
}

function drawSlot(
  ctx: CanvasRenderingContext2D, sl: PhotoSlot, r: Rect, s: number,
  exportMode: boolean, idx: number,
): void {
  const X = r.x * s;
  const Y = r.y * s;
  const Wd = Math.max(1, Math.round(r.w * s));
  const Ht = Math.max(1, Math.round(r.h * s));

  if (!sl.img) {
    if (!exportMode) {
      ctx.save();
      ctx.fillStyle = 'rgba(255,255,255,.045)';
      ctx.fillRect(X, Y, Wd, Ht);
      ctx.fillStyle = 'rgba(255,255,255,.4)';
      ctx.textAlign = 'center';
      ctx.font = '600 20px system-ui,sans-serif';
      ctx.fillText('Photo ' + (idx + 1), X + Wd / 2, Y + 44);
      ctx.font = '14px system-ui,sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,.28)';
      ctx.fillText('Drop a photo here', X + Wd / 2, Y + 68);
      ctx.restore();
    }
    return;
  }

  const a = sl.adj;
  const off = document.createElement('canvas');
  off.width = Wd;
  off.height = Ht;
  const o = off.getContext('2d')!;
  const iw = sl.img.naturalWidth;
  const ih = sl.img.naturalHeight;
  const base = Math.max(Wd / iw, Ht / ih) * (sl.zoom / 100) * (1 + a.blur * 0.012);
  const dw = iw * base;
  const dh = ih * base;
  const maxX = Math.max(0, (dw - Wd) / 2);
  const maxY = Math.max(0, (dh - Ht) / 2);
  const ox = clamp(sl.ox * s, -maxX, maxX);
  const oy = clamp(sl.oy * s, -maxY, maxY);
  sl.ox = ox / s;
  sl.oy = oy / s;

  o.save();
  o.filter = `brightness(${a.brightness}%) contrast(${a.contrast}%) saturate(${a.saturation}%) grayscale(${a.gray}%) sepia(${a.sepia}%) hue-rotate(${a.hue}deg) blur(${a.blur * s}px)`;
  o.translate(Wd / 2 + ox, Ht / 2 + oy);
  o.scale(sl.flipH ? -1 : 1, sl.flipV ? -1 : 1);
  o.drawImage(sl.img, -dw / 2, -dh / 2, dw, dh);
  o.restore();

  o.globalCompositeOperation = 'source-atop';
  if (a.warmth) {
    o.fillStyle = a.warmth > 0
      ? `rgba(255,150,50,${a.warmth / 100 * 0.38})`
      : `rgba(50,120,255,${-a.warmth / 100 * 0.38})`;
    o.fillRect(0, 0, Wd, Ht);
  }
  if (a.fade > 0) {
    o.fillStyle = `rgba(205,205,215,${a.fade / 100 * 0.2})`;
    o.fillRect(0, 0, Wd, Ht);
    o.globalCompositeOperation = 'lighten';
    const v = Math.round(a.fade / 100 * 120);
    o.fillStyle = `rgb(${v},${v},${v})`;
    o.fillRect(0, 0, Wd, Ht);
    o.globalCompositeOperation = 'source-atop';
  }
  if (a.vignette > 0) {
    const R = Math.hypot(Wd, Ht) / 2;
    const g = o.createRadialGradient(Wd / 2, Ht / 2, R * 0.25, Wd / 2, Ht / 2, R);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, `rgba(0,0,0,${a.vignette / 100 * 0.95})`);
    o.fillStyle = g;
    o.fillRect(0, 0, Wd, Ht);
  }
  if (a.grain > 0) {
    o.globalAlpha = a.grain / 100 * 0.6;
    o.globalCompositeOperation = 'overlay';
    const pattern = o.createPattern(noise(), 'repeat');
    if (pattern) o.fillStyle = pattern;
    o.fillRect(0, 0, Wd, Ht);
    o.globalAlpha = 1;
    o.globalCompositeOperation = 'source-atop';
  }
  if (a.edge > 0) {
    o.globalCompositeOperation = 'destination-out';
    const eh = Math.min(a.edge * s, Wd / 2);
    const ev = Math.min(a.edge * s, Ht / 2);
    const side = (x0: number, y0: number, x1: number, y1: number, rx: number, ry: number, rw: number, rh: number): void => {
      const g = o.createLinearGradient(x0, y0, x1, y1);
      g.addColorStop(0, 'rgba(0,0,0,1)');
      g.addColorStop(0.5, 'rgba(0,0,0,.35)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      o.fillStyle = g;
      o.fillRect(rx, ry, rw, rh);
    };
    if (a.eL) side(0, 0, eh, 0, 0, 0, eh, Ht);
    if (a.eR) side(Wd, 0, Wd - eh, 0, Wd - eh, 0, eh, Ht);
    if (a.eT) side(0, 0, 0, ev, 0, 0, Wd, ev);
    if (a.eB) side(0, Ht, 0, Ht - ev, 0, Ht - ev, Wd, ev);
  }
  if (a.radius > 0) {
    o.globalCompositeOperation = 'destination-in';
    rr(o, 0, 0, Wd, Ht, a.radius * s);
    o.fillStyle = '#000';
    o.fill();
  }
  o.globalCompositeOperation = 'source-over';

  ctx.save();
  ctx.globalAlpha = a.opacity / 100;
  if (a.shadow > 0) {
    ctx.shadowColor = hexToRgba(a.shadowC, a.shadow / 100);
    ctx.shadowBlur = a.shadowBlur * s;
    ctx.shadowOffsetX = a.shadowX * s;
    ctx.shadowOffsetY = a.shadowY * s;
  }
  ctx.drawImage(off, X, Y, Wd, Ht);
  ctx.restore();

  if (a.borderW > 0) {
    const bw = a.borderW * s;
    ctx.save();
    ctx.globalAlpha = a.opacity / 100;
    ctx.strokeStyle = a.borderC;
    ctx.lineWidth = bw;
    rr(ctx, X + bw / 2, Y + bw / 2, Wd - bw, Ht - bw, a.radius * s - bw / 2);
    ctx.stroke();
    ctx.restore();
  }
}

let scratch: CanvasRenderingContext2D | null = null;
type SpacedContext = CanvasRenderingContext2D & { letterSpacing?: string };

function setLetterSpacing(c: CanvasRenderingContext2D, value: string): void {
  (c as SpacedContext).letterSpacing = value;
}

function fontStr(t: TextItem, s: number): string {
  return `${t.italic ? 'italic ' : ''}${t.weight} ${t.size * s}px "${t.font}", serif`;
}

function textLines(t: TextItem): string[] {
  return (t.upper ? t.text.toUpperCase() : t.text).split('\n');
}

export function textBox(t: TextItem): Rect {
  if (!scratch) scratch = document.createElement('canvas').getContext('2d');
  const lines = textLines(t);
  if (scratch) {
    scratch.font = fontStr(t, 1);
    setLetterSpacing(scratch, t.ls + 'px');
  }
  let w = 0;
  lines.forEach((l) => { w = Math.max(w, scratch ? scratch.measureText(l).width : 0); });
  const h = t.size * t.lh * lines.length;
  const p = t.box ? t.pad : 6;
  return { x: t.x - w / 2 - p, y: t.y - h / 2 - p, w: w + 2 * p, h: h + 2 * p };
}

function drawText(ctx: CanvasRenderingContext2D, t: TextItem, s: number): void {
  const lines = textLines(t);
  const lh = t.size * t.lh;
  const totalH = lh * lines.length;
  const top = t.y - totalH / 2;
  ctx.save();
  ctx.font = fontStr(t, s);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  setLetterSpacing(ctx, t.ls * s + 'px');
  if (t.box) {
    let w = 0;
    lines.forEach((l) => { w = Math.max(w, ctx.measureText(l).width); });
    ctx.fillStyle = hexToRgba(t.boxC, t.boxO / 100);
    rr(ctx, t.x * s - w / 2 - t.pad * s, top * s - t.pad * s, w + 2 * t.pad * s, totalH * s + 2 * t.pad * s, 8 * s);
    ctx.fill();
  }
  if (t.shadow > 0) {
    ctx.shadowColor = hexToRgba('#000000', t.shadow / 100);
    ctx.shadowBlur = t.shadowBlur * s;
    ctx.shadowOffsetY = Math.max(2, t.size * 0.03) * s;
  }
  lines.forEach((l, i) => {
    const y = (top + lh * (i + 0.5)) * s;
    if (t.strokeW > 0) {
      ctx.lineWidth = t.strokeW * s;
      ctx.strokeStyle = t.strokeC;
      ctx.lineJoin = 'round';
      ctx.strokeText(l, t.x * s, y);
    }
    ctx.fillStyle = t.color;
    ctx.fillText(l, t.x * s, y);
  });
  ctx.restore();
}

export function render(canvas: HTMLCanvasElement, s: number, exportMode: boolean, state: ComposerState): void {
  canvas.width = Math.round(state.W * s);
  canvas.height = Math.round(state.H * s);
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = state.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const rects = layoutRects(state);
  for (let i = 0; i < state.cols; i++) drawSlot(ctx, state.slots[i], rects[i], s, exportMode, i);
  state.texts.forEach((t) => drawText(ctx, t, s));
  if (!exportMode) {
    const sel = state.sel;
    ctx.save();
    ctx.strokeStyle = '#7c9cff';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    if (sel.type === 'slot' && sel.i < state.cols) {
      const r = rects[sel.i];
      ctx.strokeRect(r.x + 1, r.y + 1, r.w - 2, r.h - 2);
    } else if (sel.type === 'text') {
      const t = state.texts.find((item) => item.id === sel.id);
      if (t) {
        const b = textBox(t);
        ctx.strokeRect(b.x, b.y, b.w, b.h);
      }
    }
    ctx.restore();
  }
}
