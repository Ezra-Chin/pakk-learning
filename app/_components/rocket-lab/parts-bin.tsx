import type { Dispatch } from "react";

import {
  PARTS,
  type Parts,
  SLOT_IDS,
  type SlotId,
  currentOption,
} from "@/lib/rocket-lab/parts";
import type { Action } from "@/lib/rocket-lab/state";
import { PANEL, PANEL_HINT, PANEL_LABEL, dimClass } from "./styles";

const BIN_BG = [
  "#FFF3E4",
  "#F1F6FA",
  "#EAF6F5",
  "#FDEEEB",
  "#FEF7E7",
  "#EDF9F1",
];

export function PartsBin({
  parts,
  dimmed = false,
  highlightSlot = null,
  dispatch,
}: {
  parts: Parts;
  dimmed?: boolean;
  highlightSlot?: SlotId | null;
  dispatch: Dispatch<Action>;
}) {
  return (
    <div
      className={`${PANEL} min-w-[225px] flex-[1_1_235px] p-[18px] ${dimClass(dimmed)}`}
    >
      <div className={PANEL_LABEL}>PARTS</div>
      <div className={`${PANEL_HINT} mt-1 mb-3`}>
        Drag a part onto the rocket, or tap it to open the options.
      </div>
      <div className="flex flex-col gap-2">
        {SLOT_IDS.map((slot, i) => {
          const lit = highlightSlot === slot;
          return (
          <div
            key={slot}
            draggable
            role="button"
            tabIndex={0}
            onDragStart={(e) => {
              e.dataTransfer.setData("text/plain", slot);
              e.dataTransfer.effectAllowed = "move";
              dispatch({ type: "drag-start", slot });
            }}
            onDragEnd={() => dispatch({ type: "drag-end" })}
            onClick={() => dispatch({ type: "open-draft", slot })}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                dispatch({ type: "open-draft", slot });
              }
            }}
            className="flex cursor-grab items-center gap-[11px] rounded-[11px] px-3 py-[10px] shadow-[0_2px_5px_rgba(16,45,64,.09)] transition-transform duration-[140ms] hover:translate-x-[3px]"
            style={{
              background: BIN_BG[i],
              outline: lit ? "3px solid #43AF67" : undefined,
              transform: lit ? "translateX(3px)" : undefined,
            }}
          >
            <span className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-white/90 text-[12px] font-black tracking-[.5px] text-[#41586B]">
              {PARTS[slot].mark}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14.5px] font-extrabold text-rl-ink">
                {PARTS[slot].label}
              </span>
              <span className="block text-[12.5px] font-bold text-rl-slate">
                {currentOption(slot, parts).label}
              </span>
            </span>
          </div>
          );
        })}
      </div>
    </div>
  );
}
