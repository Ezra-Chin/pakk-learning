import type { DragEvent, Dispatch } from "react";

import type { SlotId } from "@/lib/rocket-lab/parts";
import type { Action } from "@/lib/rocket-lab/state";

/** Dashed outlines only appear while a part is in hand; green means "drop here". */
export function zoneStyles(
  slot: SlotId,
  dragging: SlotId | null,
  over: SlotId | null,
) {
  const active = over === slot;
  return {
    border: active
      ? "2px dashed #43AF67"
      : dragging
        ? "2px dashed rgba(47,127,206,.55)"
        : "2px dashed rgba(0,0,0,0)",
    bg: active ? "rgba(67,175,103,.2)" : "transparent",
    bg2: active ? "rgba(67,175,103,.16)" : "#FFFFFF",
    labelColor: dragging ? "#2F86D6" : "rgba(92,114,132,.75)",
    labelBg: dragging ? "rgba(255,255,255,.95)" : "rgba(255,255,255,.6)",
  };
}

export function zoneHandlers(slot: SlotId, dispatch: Dispatch<Action>) {
  return {
    onDragOver: (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      dispatch({ type: "drag-over", slot });
    },
    onDragLeave: () => dispatch({ type: "drag-leave", slot }),
    onDrop: (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      dispatch({
        type: "drop",
        zone: slot,
        payload: e.dataTransfer.getData("text/plain") || null,
      });
    },
    onClick: () => dispatch({ type: "open-draft", slot }),
  };
}
