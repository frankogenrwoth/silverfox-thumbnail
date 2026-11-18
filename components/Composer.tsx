'use client';

import { useCallback, useEffect, useRef, useState, type DragEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { Slider } from './ui';
import SlotPanel from './SlotPanel';
import TextPanel from './TextPanel';
import { createInitialState, createText, nextId, SIZE_PRESETS, WEIGHT_PRESETS } from '@/lib/defaults';
import { layoutRects, render, textBox } from '@/lib/render';
import type { ColumnCount, ComposerState, ExportType, PhotoSlot, TextItem } from '@/lib/types';

type Drag =
  | { type: 'text'; t: TextItem; px: number; py: number; ox: number; oy: number }
  | { type: 'slot'; sl: PhotoSlot; px: number; py: number; ox: number; oy: number };

const clamp = (v: number, a: number, b: number): number => Math.min(b, Math.max(a, v));

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('bad image')); };
    img.src = url;
  });
}

export default function Composer() {
  const stateRef = useRef<ComposerState | null>(null);
  if (!stateRef.current) stateRef.current = createInitialState();
  const state = stateRef.current;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileMultiRef = useRef<HTMLInputElement>(null);
  const fileOneRef = useRef<HTMLInputElement>(null);
  const fontFileRef = useRef<HTMLInputElement>(null);
  const rafRef = useRef(0);
  const dragRef = useRef<Drag | null>(null);

  const [version, setVersion] = useState(0);
  const [listVersion, setListVersion] = useState(0);
  const [format, setFormat] = useState<ExportType>('image/png');
  const [scale, setScale] = useState(1);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);
  const refreshList = useCallback(() => setListVersion((v) => v + 1), []);

  const draw = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      const canvas = canvasRef.current;
      if (canvas) render(canvas, 1, false, stateRef.current!);
    });
  }, []);

  const toCanvas = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current!;
    const r = canvas.getBoundingClientRect();
    return {
      x: (clientX - r.left) * canvas.width / r.width,
      y: (clientY - r.top) * canvas.height / r.height,
    };
  };

  const slotAt = (p: { x: number; y: number }): number => {
    const rects = layoutRects(state);
    for (let i = 0; i < rects.length; i++) {
      const r = rects[i];
      if (p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h) return i;
    }
    return -1;
  };

  const addFiles = async (files: FileList | File[], target: number | null) => {
    const list = Array.from(files).filter((f) => /^image\/(jpeg|png|webp)$/.test(f.type));
    if (!list.length) { window.alert('Please choose JPEG, PNG or WebP images.'); return; }
    const n = state.cols;
    const queue: number[] = [];
    if (target != null) queue.push(target);
    for (let k = 0; k < n; k++) if (!state.slots[k].img && !queue.includes(k)) queue.push(k);
    for (let k = 0; k < n; k++) if (!queue.includes(k)) queue.push(k);
    let first: number | null = null;
    for (let j = 0; j < list.length && j < queue.length; j++) {
      try {
        const img = await loadImage(list[j]);
        const sl = state.slots[queue[j]];
        sl.img = img;
        sl.ox = 0;
        sl.oy = 0;
        sl.zoom = 100;
        if (first === null) first = queue[j];
      } catch {
        window.alert('Could not open ' + list[j].name);
      }
    }
    if (first !== null) state.sel = { type: 'slot', i: first };
    refreshList();
    refresh();
    draw();
  };

  const deleteSelectedText = () => {
    if (state.sel.type !== 'text') return;
    const id = state.sel.id;
    state.texts = state.texts.filter((t) => t.id !== id);
    state.sel = { type: 'slot', i: 0 };
    refreshList();
    refresh();
    draw();
  };

  const setCols = (n: ColumnCount) => {
    state.cols = n;
    state.weights = [...WEIGHT_PRESETS[n][0][1]];
    if (state.sel.type === 'slot' && state.sel.i >= n) state.sel = { type: 'slot', i: 0 };
    refresh();
    draw();
  };

  const setSize = (w: number, h: number) => {
    const width = clamp(Math.round(w) || state.W, 200, 6000);
    const height = clamp(Math.round(h) || state.H, 200, 6000);
    const rx = width / state.W;
    const ry = height / state.H;
    state.texts.forEach((t) => { t.x *= rx; t.y *= ry; t.size = Math.round(t.size * ry); });
    state.W = width;
    state.H = height;
    refresh();
    draw();
  };

  const download = () => {
    const c = document.createElement('canvas');
    render(c, scale, true, state);
    c.toBlob((blob) => {
      if (!blob) { window.alert('Export failed. Try a smaller scale or canvas size.'); return; }
      const ext = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' }[format];
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'composition.' + ext;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    }, format, 0.95);
    draw();
  };

  useEffect(() => {
    draw();
    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, [draw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onWheel = (e: WheelEvent) => {
      const i = slotAt(toCanvas(e.clientX, e.clientY));
      if (i < 0) return;
      const sl = state.slots[i];
      if (!sl.img) return;
      e.preventDefault();
      sl.zoom = clamp(sl.zoom * (e.deltaY < 0 ? 1.06 : 1 / 1.06), 100, 500);
      if (state.sel.type === 'slot' && state.sel.i === i) refresh();
      draw();
    };
    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draw, refresh]);

  useEffect(() => {
    const prevent = (e: Event) => e.preventDefault();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName ?? '')) {
        deleteSelectedText();
      }
    };
    window.addEventListener('dragover', prevent);
    window.addEventListener('drop', prevent);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('dragover', prevent);
      window.removeEventListener('drop', prevent);
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPointerDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const p = toCanvas(e.clientX, e.clientY);
    for (let i = state.texts.length - 1; i >= 0; i--) {
      const t = state.texts[i];
      const b = textBox(t);
      if (p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h) {
        state.sel = { type: 'text', id: t.id };
        dragRef.current = { type: 'text', t, px: p.x, py: p.y, ox: t.x, oy: t.y };
        e.currentTarget.setPointerCapture(e.pointerId);
        refreshList();
        refresh();
        draw();
        return;
      }
    }
    const si = slotAt(p);
    if (si >= 0) {
      state.sel = { type: 'slot', i: si };
      const sl = state.slots[si];
      if (sl.img) dragRef.current = { type: 'slot', sl, px: p.x, py: p.y, ox: sl.ox, oy: sl.oy };
      e.currentTarget.setPointerCapture(e.pointerId);
      refreshList();
      refresh();
      draw();
    }
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const p = toCanvas(e.clientX, e.clientY);
    if (drag.type === 'text') {
      drag.t.x = drag.ox + p.x - drag.px;
      drag.t.y = drag.oy + p.y - drag.py;
    } else {
      drag.sl.ox = drag.ox + p.x - drag.px;
      drag.sl.oy = drag.oy + p.y - drag.py;
    }
    draw();
  };

  const onDrop = (e: DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const i = slotAt(toCanvas(e.clientX, e.clientY));
    if (e.dataTransfer.files.length) void addFiles(e.dataTransfer.files, i >= 0 ? i : null);
  };

  const onFontFiles = async (files: FileList | null) => {
    for (const f of Array.from(files ?? [])) {
      const name = f.name.replace(/\.[^.]+$/, '').replace(/[^\w\- ]/g, ' ').trim() || 'Custom font';
      try {
        const face = new FontFace(name, await f.arrayBuffer(), { weight: '100 900' });
        await face.load();
        document.fonts.add(face);
        if (!state.fonts.includes(name)) state.fonts.push(name);
        state.lastFont = name;
        const sel = state.sel;
        if (sel.type === 'text') {
          const t = state.texts.find((item) => item.id === sel.id);
          if (t) t.font = name;
        }
      } catch {
        window.alert('Could not load font ' + f.name);
      }
    }
    if (fontFileRef.current) fontFileRef.current.value = '';
    refresh();
    draw();
  };

  const sel = state.sel;
  const selectedText = sel.type === 'text' ? state.texts.find((t) => t.id === sel.id) : undefined;
  const customFonts = state.fonts.slice(10);

  return (
    <>
      <header className="top">
        <h1>Panel Composer</h1>
        <div className="spacer" />
        <label>
          Format
          <select value={format} onChange={(e) => setFormat(e.target.value as ExportType)}>
            <option value="image/png">PNG</option>
            <option value="image/jpeg">JPEG</option>
            <option value="image/webp">WebP</option>
          </select>
        </label>
        <label>
          Scale
          <select value={scale} onChange={(e) => setScale(+e.target.value)}>
            <option value="1">1×</option>
            <option value="2">2×</option>
            <option value="3">3×</option>
          </select>
        </label>
        <button className="primary" onClick={download}>Download</button>
      </header>

      <div className="app">
        <aside id="left">
          <section>
            <h2>Canvas</h2>
            <select
              style={{ marginBottom: 8 }}
              onChange={(e) => {
                const [w, h] = e.target.value.split('x').map(Number);
                setSize(w, h);
              }}
            >
              {SIZE_PRESETS.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <div className="two">
              <label>W <input key={`cw-${version}`} type="number" min={200} max={6000} defaultValue={state.W} onChange={(e) => setSize(+e.target.value, state.H)} /></label>
              <label>H <input key={`ch-${version}`} type="number" min={200} max={6000} defaultValue={state.H} onChange={(e) => setSize(state.W, +e.target.value)} /></label>
            </div>
            <div className="inline">
              <span>Background</span>
              <input key={`bg-${version}`} type="color" defaultValue={state.bg} onInput={(e) => { state.bg = e.currentTarget.value; draw(); }} />
            </div>
          </section>

          <section>
            <h2>Columns</h2>
            <div className="seg">
              {([2, 3, 4] as ColumnCount[]).map((n) => (
                <button key={n} className={state.cols === n ? 'on' : ''} onClick={() => setCols(n)}>{n}</button>
              ))}
            </div>
            <div className="inline">
              <span>Width preset</span>
              <select
                key={`wPreset-${state.cols}`}
                style={{ width: 150 }}
                onChange={(e) => { state.weights = [...WEIGHT_PRESETS[state.cols as ColumnCount][+e.target.value][1]]; refresh(); draw(); }}
              >
                {WEIGHT_PRESETS[state.cols as ColumnCount].map(([name], i) => <option key={name} value={i}>{name}</option>)}
              </select>
            </div>
            <div>
              {state.weights.slice(0, state.cols).map((value, i) => (
                <Slider
                  key={`w-${version}-${i}`}
                  spec={{ k: String(i), label: 'Column ' + (i + 1) + ' width', min: 5, max: 100 }}
                  value={value}
                  onChange={(v) => { state.weights[i] = v; draw(); }}
                />
              ))}
            </div>
            <div>
              {([
                { k: 'gutter', label: 'Spacing between photos', max: 120 },
                { k: 'margin', label: 'Outer margin', max: 200 },
              ] as const).map((s) => (
                <Slider
                  key={`${s.k}-${version}`}
                  spec={{ k: s.k, label: s.label, min: 0, max: s.max, u: 'px' }}
                  value={state[s.k]}
                  fallback={0}
                  onChange={(v) => { state[s.k] = v; draw(); }}
                />
              ))}
            </div>
          </section>

          <section>
            <h2>Photos</h2>
            <button className="primary wide" onClick={() => fileMultiRef.current?.click()}>Upload photos</button>
            <p className="hint">Select several at once and they fill the columns in order. You can also drag files onto any column. Click a column to edit its photo.</p>
          </section>

          <section>
            <h2>Text &amp; fonts</h2>
            <div className="btns">
              <button onClick={() => {
                const t = createText({ x: state.W / 2, y: state.H / 2, size: Math.round(state.H / 8) }, state);
                state.texts.push(t);
                state.sel = { type: 'text', id: t.id };
                refreshList();
                refresh();
                draw();
              }}>+ Add text</button>
              <button onClick={() => fontFileRef.current?.click()}>Load font…</button>
            </div>
            <p className="hint">
              {customFonts.length ? 'Loaded: ' + customFonts.join(', ') : 'Load TTF, OTF, WOFF or WOFF2 files. They appear in the font menu.'}
            </p>
            <div className="tl" key={listVersion}>
              {state.texts.map((t) => (
                <button
                  key={t.id}
                  className={sel.type === 'text' && sel.id === t.id ? 'on' : ''}
                  onClick={() => { state.sel = { type: 'text', id: t.id }; refreshList(); refresh(); draw(); }}
                >
                  {(t.text.split('\n')[0] || '(empty)').slice(0, 28)}
                </button>
              ))}
            </div>
          </section>
        </aside>

        <main id="stage">
          <canvas
            id="cv"
            ref={canvasRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={() => { dragRef.current = null; }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
          />
        </main>

        <aside id="right">
          {sel.type === 'slot' && (
            <SlotPanel
              key={`slot-${version}-${sel.i}`}
              state={state}
              index={sel.i}
              onDraw={draw}
              onRefresh={refresh}
              onUpload={(i) => { state.target = i; fileOneRef.current?.click(); }}
            />
          )}
          {sel.type === 'text' && selectedText && (
            <TextPanel
              key={`text-${version}-${selectedText.id}`}
              state={state}
              text={selectedText}
              onDraw={draw}
              onRefresh={refresh}
              onTextChange={refreshList}
              onDelete={deleteSelectedText}
            />
          )}
          {sel.type === 'none' && <p className="hint">Click a column or a text on the canvas to edit it.</p>}
        </aside>
      </div>

      <input
        ref={fileMultiRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        hidden
        onChange={(e) => { void addFiles(e.target.files ?? [], null); e.target.value = ''; }}
      />
      <input
        ref={fileOneRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        onChange={(e) => { void addFiles([...(e.target.files ?? [])].filter(Boolean), state.target); e.target.value = ''; }}
      />
      <input
        ref={fontFileRef}
        type="file"
        accept=".ttf,.otf,.woff,.woff2"
        multiple
        hidden
        onChange={(e) => { void onFontFiles(e.target.files); }}
      />
    </>
  );
}
