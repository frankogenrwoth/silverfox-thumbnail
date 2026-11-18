"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider as SliderPrimitive } from "@/components/ui/slider";
import type { SliderSpec } from "@/lib/types";

export function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Card
      className="rounded-none border-0 border-b border-border/60 bg-transparent py-4 shadow-none last:border-0"
      style={{ boxShadow: "none" }}
    >
      <CardHeader className="px-0 pb-2">
        <CardTitle className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0">{children}</CardContent>
    </Card>
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
  useEffect(() => setDisplay(value), [value]);

  const set = (v: number) => {
    setDisplay(v);
    onChange(v);
  };

  return (
    <div
      className="row"
      onDoubleClick={() => {
        if (fallback !== undefined) set(fallback);
      }}
      title={fallback !== undefined ? "Double-click to reset" : undefined}
    >
      <div className="lab">
        <Label className="cursor-default text-xs font-normal">
          {spec.label}
        </Label>
        <span className="val">
          {Math.round(display * 100) / 100}
          {spec.u ?? ""}
        </span>
      </div>
      <SliderPrimitive
        min={spec.min}
        max={spec.max}
        step={spec.step ?? 1}
        value={display}
        onValueChange={(v) => set(typeof v === "number" ? v : v[0])}
        aria-label={spec.label}
      />
    </div>
  );
}

const SWATCHES = [
  "#ffffff",
  "#000000",
  "#7c9cff",
  "#ff6b6b",
  "#ffd166",
  "#22c55e",
];

export function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [hex, setHex] = useState(value);
  useEffect(() => setHex(value), [value]);

  return (
    <div className="inline">
      <Label className="text-xs font-normal">{label}</Label>
      <Popover>
        <PopoverTrigger className="inline-flex h-8 items-center gap-2 rounded-lg border border-input bg-input/30 px-2 text-xs transition-colors hover:bg-accent">
          <span
            className="size-4 rounded border border-black/30"
            style={{ background: value }}
          />
          <span className="font-mono text-[11px] text-muted-foreground">
            {value.toUpperCase()}
          </span>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-auto gap-3">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-20 w-full cursor-pointer rounded-lg border border-input bg-transparent p-1"
          />
          <Input
            value={hex}
            onChange={(e) => {
              const next = e.target.value;
              setHex(next);
              if (/^#[0-9a-f]{6}$/i.test(next)) onChange(next);
            }}
            className="h-7 font-mono text-xs uppercase"
            aria-label={`${label} hex value`}
          />
          <div className="flex gap-1.5">
            {SWATCHES.map((c) => (
              <button
                key={c}
                type="button"
                className="size-5 rounded-full border border-black/30 p-0"
                style={{ background: c }}
                onClick={() => onChange(c)}
                aria-label={c}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function Check({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <Label className="inline chk cursor-pointer gap-2 text-xs font-normal text-foreground">
      <Checkbox checked={value} onCheckedChange={(v) => onChange(v)} />
      {label}
    </Label>
  );
}
