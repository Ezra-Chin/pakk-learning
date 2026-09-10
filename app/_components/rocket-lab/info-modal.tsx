import type { Dispatch } from "react";

import { INFO, type InfoKey } from "@/lib/rocket-lab/parts";
import type { Action } from "@/lib/rocket-lab/state";

export function InfoModal({
  info,
  dispatch,
}: {
  info: InfoKey;
  dispatch: Dispatch<Action>;
}) {
  const [title, body] = INFO[info];

  return (
    <div
      onClick={() => dispatch({ type: "close-info" })}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(22,45,60,.5)] p-[18px]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[410px] rounded-2xl bg-white p-6 shadow-[0_20px_50px_rgba(10,30,45,.4)]"
        style={{ animation: "rl-pop .2s ease-out" }}
      >
        <div className="mb-2.5 text-[19px] font-black">{title}</div>
        <div className="text-[14.5px] leading-[1.55] font-bold whitespace-pre-line text-rl-body">
          {body}
        </div>
        <button
          type="button"
          onClick={() => dispatch({ type: "close-info" })}
          className="mt-[18px] w-full cursor-pointer rounded-[11px] border-none bg-[#2F7FCE] p-[11px] text-[16px] font-black text-white shadow-[0_5px_12px_rgba(47,127,206,.35),inset_0_1px_0_rgba(255,255,255,.4)]"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
