'use client';

import { Check, ColorRow, Section, Slider } from './ui';
import {
  createText, nextId, TEXT_BOX_SPECS, TEXT_DEF,
  TEXT_SHADOW_SPECS, TEXT_SIZE_SPECS, WEIGHT_OPTIONS,
} from '@/lib/defaults';
import type { ComposerState, NumericTextKey, SliderSpec, TextItem } from '@/lib/types';

interface Props {
  state: ComposerState;
  text: TextItem;
  onDraw: () => void;
  onRefresh: () => void;
  onTextChange: () => void;
  onDelete: () => void;
}

export default function TextPanel({ state, text: t, onDraw, onRefresh, onTextChange, onDelete }: Props) {
  const sliders = (specs: SliderSpec<NumericTextKey>[]) => specs.map((spec) => (
    <Slider
      key={spec.k}
      spec={spec}
      value={t[spec.k]}
      fallback={TEXT_DEF[spec.k as keyof typeof TEXT_DEF]}
      onChange={(v) => { t[spec.k] = v; onDraw(); }}
    />
  ));

  const duplicate = () => {
    const n = createText({ ...t, id: nextId(), x: t.x + 30, y: t.y + 30 }, state);
    state.texts.push(n);
    state.sel = { type: 'text', id: n.id };
    onRefresh();
    onDraw();
  };

  return (
    <>
      <h3 className="title">Text</h3>

      <Section title="Content">
        <textarea value={t.text} onChange={(e) => { t.text = e.target.value; onTextChange(); onDraw(); }} />
        <div className="hint">Font</div>
        <select
          value={t.font}
          style={{ marginTop: 8 }}
          onChange={(e) => { t.font = e.target.value; state.lastFont = t.font; onDraw(); }}
        >
          {state.fonts.map((font) => (
            <option key={font} value={font} style={{ fontFamily: `"${font}"` }}>{font}</option>
          ))}
        </select>
        <select
          value={t.weight}
          style={{ marginTop: 8 }}
          onChange={(e) => { t.weight = +e.target.value; onDraw(); }}
        >
          {WEIGHT_OPTIONS.map(([v, label]) => <option key={v} value={v}>{label}</option>)}
        </select>
        <div className="two" style={{ marginTop: 8 }}>
          <Check label="Italic" value={t.italic} onChange={(v) => { t.italic = v; onDraw(); }} />
          <Check label="UPPERCASE" value={t.upper} onChange={(v) => { t.upper = v; onDraw(); }} />
        </div>
        <ColorRow label="Color" value={t.color} onChange={(v) => { t.color = v; onDraw(); }} />
        <div className="btns">
          <button onClick={() => { t.x = state.W / 2; t.y = state.H / 2; onDraw(); }}>Center on canvas</button>
        </div>
        <p className="hint">Drag the text on the canvas to move it.</p>
      </Section>

      <Section title="Size & spacing">{sliders(TEXT_SIZE_SPECS)}</Section>

      <Section title="Shadow & outline">
        {sliders(TEXT_SHADOW_SPECS)}
        <ColorRow label="Outline color" value={t.strokeC} onChange={(v) => { t.strokeC = v; onDraw(); }} />
      </Section>

      <Section title="Background box (badge)">
        <Check label="Show box" value={t.box} onChange={(v) => { t.box = v; onDraw(); }} />
        <ColorRow label="Box color" value={t.boxC} onChange={(v) => { t.boxC = v; onDraw(); }} />
        {sliders(TEXT_BOX_SPECS)}
      </Section>

      <Section title="Manage">
        <div className="btns">
          <button onClick={duplicate}>Duplicate</button>
          <button className="danger" onClick={onDelete}>Delete</button>
        </div>
      </Section>
    </>
  );
}
