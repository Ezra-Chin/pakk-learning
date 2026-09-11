import type { Dispatch } from "react";

import { CHALLENGES, type ChallengeId } from "@/lib/rocket-lab/parts";
import type { Action } from "@/lib/rocket-lab/state";
import { dimClass } from "./styles";

export function ChallengeBar({
  challenge,
  dimmed = false,
  dispatch,
}: {
  challenge: ChallengeId;
  dimmed?: boolean;
  dispatch: Dispatch<Action>;
}) {
  return (
    <section
      className={`flex flex-wrap gap-2 rounded-[14px] bg-white/55 p-2 shadow-[0_6px_16px_rgba(16,45,64,.12)] ${dimClass(dimmed)}`}
    >
      {CHALLENGES.map((c) => {
        const on = c.id === challenge;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => dispatch({ type: "pick-challenge", id: c.id })}
            className="flex min-w-[190px] flex-1 cursor-pointer items-center gap-[11px] rounded-[11px] border-none px-[14px] py-[10px] text-left transition-transform duration-[140ms]"
            style={{
              background: on ? "#F0801A" : "rgba(255,255,255,.85)",
              boxShadow: on
                ? "0 4px 10px rgba(216,110,15,.4), inset 0 1px 0 rgba(255,255,255,.5)"
                : "0 1px 3px rgba(16,45,64,.1)",
            }}
          >
            <span
              className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-lg text-[13px] font-black"
              style={{
                background: on ? "rgba(255,255,255,.28)" : "#EEF4F8",
                color: on ? "#FFFFFF" : "#5C7284",
              }}
            >
              {c.mark}
            </span>
            <span>
              <span
                className="block text-[15.5px] font-black"
                style={{ color: on ? "#FFFFFF" : "#223A4B" }}
              >
                {c.name}
              </span>
              <span
                className="block text-[12.5px] font-bold"
                style={{ color: on ? "rgba(255,255,255,.92)" : "#7C93A4" }}
              >
                {c.goal}
              </span>
            </span>
          </button>
        );
      })}
    </section>
  );
}
