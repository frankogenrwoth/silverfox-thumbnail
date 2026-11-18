'use client';

import { useState, type ReactNode } from 'react';
import type { SliderSpec } from '@/lib/types';

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

interface SliderProps {
  spec: SliderSpec;
  value: number;
  fallback?: number;
  onChange: (value: number) => void;
}

export function Slider({ spec, value, fallback, onChange }: SliderProps) {
  const [display, setDisplay] = useState(value);
  const set = (v: number) => { setDisplay(v); onChange(v); };
  return (
    <div className="row">
      <div className="lab">
        <span>{spec.label}</span>
        <span className="val">{Math.round(display * 100) / 100}{spec.u ?? ''}</span>
      </div>
      <input
        type="range"
        min={spec.min}
        max={spec.max}
        step={spec.step ?? 1}
        value={display}
        onChange={(e) => set(+e.target.value)}
        onDoubleClick={() => { if (fallback !== undefined) set(fallback); }}
      />
    </div>
  );
}

export function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="inline">
      <span>{label}</span>
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export function Check({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="inline chk">
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}
