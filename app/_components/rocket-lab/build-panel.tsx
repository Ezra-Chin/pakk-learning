import type { Dispatch } from "react";

import {
  type Parts,
  type SlotId,
  currentOption,
} from "@/lib/rocket-lab/parts";
import type { Action, Phase } from "@/lib/rocket-lab/state";
import { zoneHandlers, zoneStyles } from "./drop-zone";
import { RocketView } from "./rocket-view";
import { PANEL, PANEL_LABEL } from "./styles";

export function BuildPanel({
  parts,
  angle,
  phase,
  dragging,
  over,
  reject,
  onLaunch,
  dispatch,
}: {
  parts: Parts;
  angle: number;
  phase: Phase;
  dragging: SlotId | null;
  over: SlotId | null;
  reject: boolean;
  onLaunch: () => void;
  dispatch: Dispatch<Action>;
}) {
  const frame = zoneStyles("body", dragging, over);

  return (
    <div
      className={`${PANEL} flex min-w-[300px] flex-[2_1_330px] flex-col items-center gap-3 p-[18px]`}
    >
      <div className={`${PANEL_LABEL} self-start`}>YOUR ROCKET</div>

      <RocketView
        parts={parts}
        dragging={dragging}
        over={over}
        reject={reject}
        dispatch={dispatch}
      />

      <div
        {...zoneHandlers("body", dispatch)}
        className="w-full max-w-[290px] cursor-pointer rounded-[10px] px-[14px] py-[9px] text-center text-[14px] font-extrabold text-rl-ink shadow-[0_2px_6px_rgba(16,45,64,.1)]"
        style={{ border: frame.border, background: frame.bg2 }}
      >
        Frame, {currentOption("body", parts).label}
      </div>

      <div className="w-full max-w-[310px] rounded-[11px] bg-white px-[15px] py-[11px] shadow-[0_3px_10px_rgba(16,45,64,.1)]">
        <div className="mb-1 flex justify-between text-[13.5px] font-extrabold">
          <span className="text-rl-slate">Launch angle</span>
          <span>{angle} degrees</span>
        </div>
        <input
          type="range"
          min={35}
          max={90}
          step={1}
          value={angle}
          onChange={(e) =>
            dispatch({ type: "set-angle", angle: Number(e.target.value) })
          }
          aria-label="Launch angle in degrees"
          className="rl-range h-6 w-full"
        />
      </div>

      <button
        type="button"
        onClick={onLaunch}
        disabled={phase === "count" || phase === "fly"}
        className="cursor-pointer rounded-xl border-none bg-rl-orange px-[46px] py-[14px] text-[20px] font-black tracking-[.8px] text-white shadow-[0_6px_14px_rgba(216,110,15,.45),inset_0_1px_0_rgba(255,255,255,.6)] transition-transform duration-[120ms] [text-shadow:0_1px_2px_rgba(140,60,0,.45)] hover:-translate-y-0.5 active:translate-y-0.5"
      >
        LAUNCH
      </button>
    </div>
  );
}
