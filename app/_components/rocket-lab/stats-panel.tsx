import type { Dispatch } from "react";

import { GRAD, type InfoKey, type Parts } from "@/lib/rocket-lab/parts";
import {
  calc,
  dragPct,
  massPct,
  pct,
  thrustPct,
} from "@/lib/rocket-lab/physics";
import type { Action } from "@/lib/rocket-lab/state";
import { LEARN_BUTTON, PANEL, PANEL_HINT, PANEL_LABEL, TRACK } from "./styles";

export function StatsPanel({
  parts,
  mascot,
  dispatch,
}: {
  parts: Parts;
  mascot: string;
  dispatch: Dispatch<Action>;
}) {
  const m = calc(parts);

  const stats: { label: InfoKey; value: string; width: string; color: string }[] =
    [
      {
        label: "Mass",
        value: Math.round(m.total) + " kg",
        width: pct(massPct(m.total)),
        color: GRAD.mass,
      },
      {
        label: "Drag",
        value: m.cd.toFixed(2),
        width: pct(dragPct(m.cd)),
        color: GRAD.drag,
      },
      {
        label: "Thrust",
        value: m.e.thrust + " N",
        width: pct(thrustPct(m.twr)),
        color: GRAD.thrust,
      },
      {
        label: "Stability",
        value: Math.round(m.stab * 100) + "%",
        width: pct(m.stab * 100),
        color: GRAD.stab,
      },
    ];

  return (
    <div className={`${PANEL} min-w-[225px] flex-[1_1_235px] p-[18px]`}>
      <div className={PANEL_LABEL}>ROCKET STATS</div>
      <div className={`${PANEL_HINT} mt-1 mb-[14px]`}>
        Tap a stat to see what it means.
      </div>

      <div className="flex flex-col gap-[13px]">
        {stats.map((s) => (
          <div key={s.label}>
            <div className="mb-[5px] flex items-baseline justify-between">
              <span className="text-[14px] font-extrabold">{s.label}</span>
              <span className="text-[13.5px] font-extrabold text-rl-slate">
                {s.value}
              </span>
            </div>
            <div className={`${TRACK} h-[11px]`}>
              <div
                className="h-full rounded-[5px] transition-[width] duration-[450ms] ease-[cubic-bezier(.34,1.3,.64,1)]"
                style={{ width: s.width, background: s.color }}
              />
            </div>
            <button
              type="button"
              onClick={() => dispatch({ type: "open-info", key: s.label })}
              className={`${LEARN_BUTTON} mt-1.5 bg-[#EAF4FD] hover:bg-[#DAEBFA]`}
            >
              What is {s.label}?
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-[11px] bg-[#EEF5FA] px-[13px] py-[11px]">
        <div className="mb-[3px] text-[11.5px] font-black tracking-[1px] text-rl-slate">
          FLIGHT ENGINEER
        </div>
        <div className="text-[13px] leading-[1.4] font-bold text-[#33505F]">
          {mascot}
        </div>
      </div>
    </div>
  );
}
