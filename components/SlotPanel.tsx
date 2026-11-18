"use client";

import { Check, ColorRow, Section, Slider } from "./ui";
import {
  BOUNDARY_SPECS,
  COLOR_SPECS,
  DEF,
  FINISH_SPECS,
  LOOK_KEYS,
  PRESETS,
  SHADOW_SPECS,
  TONE_SPECS,
} from "@/lib/defaults";
import type {
  ComposerState,
  NumericAdjustmentKey,
  SliderSpec,
} from "@/lib/types";

type SideKey = "eL" | "eR" | "eT" | "eB";

interface Props {
  state: ComposerState;
  index: number;
  onDraw: () => void;
  onRefresh: () => void;
  onUpload: (index: number) => void;
}

export default function SlotPanel({
  state,
  index,
  onDraw,
  onRefresh,
  onUpload,
}: Props) {
  const sl = state.slots[index];
  const a = sl.adj;

  const sliders = (specs: SliderSpec<NumericAdjustmentKey>[]) =>
    specs.map((spec) => (
      <Slider
        key={spec.k}
        spec={spec}
        value={a[spec.k]}
        fallback={DEF[spec.k]}
        onChange={(v) => {
          a[spec.k] = v;
          onDraw();
        }}
      />
    ));

  const applyPreset = (name: string) => {
    LOOK_KEYS.forEach((k) => {
      a[k] = DEF[k];
    });
    Object.assign(a, PRESETS[name]);
    onRefresh();
    onDraw();
  };

  return (
    <>
      <h3 className="title">
        Photo {index + 1}
        {sl.img ? "" : " (empty)"}
      </h3>

      <Section title="Image">
        <div className="btns">
          <button className="primary" onClick={() => onUpload(index)}>
            {sl.img ? "Replace" : "Upload"}
          </button>
          {sl.img && (
            <>
              <button
                className="danger"
                onClick={() => {
                  sl.img = null;
                  onRefresh();
                  onDraw();
                }}
              >
                Remove
              </button>
              <button
                onClick={() => {
                  sl.flipH = !sl.flipH;
                  onDraw();
                }}
              >
                Flip ↔
              </button>
              <button
                onClick={() => {
                  sl.flipV = !sl.flipV;
                  onDraw();
                }}
              >
                Flip ↕
              </button>
            </>
          )}
        </div>
        <Slider
          spec={{ k: "zoom", label: "Zoom", min: 100, max: 500, u: "%" }}
          value={sl.zoom}
          fallback={100}
          onChange={(v) => {
            sl.zoom = v;
            onDraw();
          }}
        />
        <button
          onClick={() => {
            sl.ox = 0;
            sl.oy = 0;
            sl.zoom = 100;
            onRefresh();
            onDraw();
          }}
        >
          Reset position
        </button>
        <p className="hint">
          Drag the photo on the canvas to reposition it, scroll to zoom.
          Double-click a slider to reset it.
        </p>
      </Section>

      <Section title="Look presets">
        <div className="chips">
          {Object.keys(PRESETS).map((name) => (
            <button key={name} onClick={() => applyPreset(name)}>
              {name}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Tone">{sliders(TONE_SPECS)}</Section>

      <Section title="Color">{sliders(COLOR_SPECS)}</Section>

      <Section title="Fade & finish">{sliders(FINISH_SPECS)}</Section>

      <Section title="Boundaries">
        <Slider
          spec={{
            k: "edge",
            label: "Edge fade (blend into background)",
            min: 0,
            max: 400,
            u: "px",
          }}
          value={a.edge}
          fallback={DEF.edge}
          onChange={(v) => {
            a.edge = v;
            onDraw();
          }}
        />
        <div className="two">
          {(
            [
              ["eL", "Left"],
              ["eR", "Right"],
              ["eT", "Top"],
              ["eB", "Bottom"],
            ] as Array<[SideKey, string]>
          ).map(([k, label]) => (
            <Check
              key={k}
              label={label}
              value={a[k]}
              onChange={(v) => {
                a[k] = v;
                onDraw();
              }}
            />
          ))}
        </div>
        {sliders(BOUNDARY_SPECS)}
        <ColorRow
          label="Border color"
          value={a.borderC}
          onChange={(v) => {
            a.borderC = v;
            onDraw();
          }}
        />
      </Section>

      <Section title="Shadow">
        {sliders(SHADOW_SPECS)}
        <ColorRow
          label="Shadow color"
          value={a.shadowC}
          onChange={(v) => {
            a.shadowC = v;
            onDraw();
          }}
        />
        <p className="hint">
          Shadows show when columns have a margin or gutter.
        </p>
      </Section>

      <Section title="Batch">
        <div className="btns">
          <button
            onClick={() => {
              Object.assign(a, DEF);
              onRefresh();
              onDraw();
            }}
          >
            Reset this photo
          </button>
          <button
            onClick={() => {
              state.slots.forEach((o) => {
                if (o !== sl) o.adj = { ...a };
              });
              onDraw();
            }}
          >
            Apply look to all photos
          </button>
        </div>
      </Section>
    </>
  );
}
