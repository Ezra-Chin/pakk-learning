import { type Dispatch, useCallback } from "react";

import {
  GRAD,
  PARTS,
  type Parts,
  optionsFor,
  withPart,
} from "@/lib/rocket-lab/parts";
import { calc, dragPct, massPct, pct } from "@/lib/rocket-lab/physics";
import type { Action, Draft } from "@/lib/rocket-lab/state";
import { useModal } from "./use-modal";

export function DraftModal({
  draft,
  parts,
  dispatch,
}: {
  draft: Draft;
  parts: Parts;
  dispatch: Dispatch<Action>;
}) {
  const close = useCallback(() => dispatch({ type: "close-draft" }), [dispatch]);
  const panel = useModal(close);

  const slot = PARTS[draft.slot];
  const now = calc(parts);
  const next = calc(withPart(parts, draft.slot, draft.value));

  // "If you apply this" compares the drafted build against the current one.
  const preview = [
    {
      label: "Mass",
      v: massPct(next.total),
      d: Math.round(next.total - now.total),
      unit: " kg",
      color: GRAD.mass,
    },
    {
      label: "Drag",
      v: dragPct(next.cd),
      // A real percentage change, so swapping one part reports the same figure
      // whatever the rest of the rocket is made of, and matches the flight notes.
      d: Math.round((next.cd / now.cd - 1) * 100),
      unit: " percent",
      color: GRAD.drag,
    },
    {
      label: "Stability",
      v: next.stab * 100,
      d: Math.round((next.stab - now.stab) * 100),
      unit: " points",
      color: GRAD.stab,
    },
  ].map((r) => ({
    label: r.label,
    width: pct(r.v),
    color: r.color,
    delta:
      r.d === 0
        ? "no change"
        : (r.d > 0 ? "up " : "down ") + Math.abs(r.d) + r.unit,
    // More stability is good; more mass or drag is not.
    deltaColor:
      r.d === 0
        ? "#7C93A4"
        : (r.label === "Stability" ? r.d > 0 : r.d < 0)
          ? "#2F8F52"
          : "#BE3D29",
  }));

  return (
    <div
      onClick={close}
      className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(22,45,60,.5)] p-[18px]"
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="rl-draft-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[88vh] w-full max-w-[440px] overflow-auto rounded-2xl bg-white p-[22px] shadow-[0_20px_50px_rgba(10,30,45,.4)] outline-none"
        style={{ animation: "rl-pop .2s ease-out" }}
      >
        <div className="flex items-center justify-between gap-2.5">
          <div id="rl-draft-title" className="text-[20px] font-black">
            {slot.label}
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="h-8 w-8 cursor-pointer rounded-lg border-none bg-[#EEF4F8] text-[15px] font-extrabold text-rl-slate"
          >
            X
          </button>
        </div>

        <div className="mt-[5px] mb-[14px] text-[13px] font-bold text-rl-slate">
          {slot.hint}
        </div>

        <div className="flex flex-col gap-2">
          {optionsFor(draft.slot).map((o) => {
            const picked = o.id === draft.value;
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => dispatch({ type: "choose-draft", value: o.id })}
                className="flex cursor-pointer items-center gap-3 rounded-[11px] px-[14px] py-[11px] text-left"
                style={{
                  border: picked ? "2px solid #43AF67" : "2px solid transparent",
                  background: picked ? "#EDF9F1" : "#F5F8FA",
                  boxShadow: picked ? "0 3px 8px rgba(67,175,103,.22)" : "none",
                }}
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-extrabold">
                    {o.label}
                  </span>
                  <span className="block text-[12.5px] font-bold text-rl-slate">
                    {o.blurb}
                  </span>
                </span>
                <span className="text-[14px] font-black text-[#2F8F52]">
                  {picked ? "PICKED" : ""}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-[15px] flex flex-col gap-[9px] rounded-xl bg-[#F2F7FA] px-[15px] py-[13px]">
          <div className="text-[11.5px] font-black tracking-[1.2px] text-rl-steel">
            IF YOU APPLY THIS
          </div>
          {preview.map((p) => (
            <div key={p.label}>
              <div className="mb-[3px] flex justify-between text-[12.5px] font-extrabold">
                <span>{p.label}</span>
                <span style={{ color: p.deltaColor }}>{p.delta}</span>
              </div>
              <div className="h-[9px] overflow-hidden rounded-[4px] bg-[#E1EAF0]">
                <div
                  className="h-full rounded-[4px] transition-[width] duration-300 ease-out"
                  style={{ width: p.width, background: p.color }}
                />
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => dispatch({ type: "apply-draft" })}
          className="mt-[15px] w-full cursor-pointer rounded-[11px] border-none bg-[#43AF67] p-3 text-[17px] font-black text-white shadow-[0_5px_12px_rgba(50,150,90,.35),inset_0_1px_0_rgba(255,255,255,.45)] active:translate-y-0.5"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
