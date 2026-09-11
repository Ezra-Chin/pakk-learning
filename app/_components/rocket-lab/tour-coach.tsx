import type { Dispatch } from "react";

import type { Action } from "@/lib/rocket-lab/state";
import type { TourStep } from "@/lib/rocket-lab/tour";

export function TourCoach({
  step,
  index,
  total,
  onEnd,
  dispatch,
}: {
  step: TourStep;
  index: number;
  total: number;
  onEnd: () => void;
  dispatch: Dispatch<Action>;
}) {
  const isLast = index === total - 1;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center p-[18px]">
      <div
        className="pointer-events-auto w-full max-w-[440px] rounded-2xl bg-white p-5 shadow-[0_20px_50px_rgba(10,30,45,.4)]"
        style={{ animation: "rl-pop .2s ease-out" }}
      >
        <div className="mb-1 flex items-baseline justify-between gap-3">
          <div className="text-[19px] font-black">{step.title}</div>
          <div className="text-[12px] font-extrabold tracking-[1px] text-rl-steel">
            {index + 1} / {total}
          </div>
        </div>

        <div className="text-[14px] leading-[1.5] font-bold text-rl-body">
          {step.body}
        </div>

        {step.where && (
          <div className="mt-2.5 rounded-[10px] bg-[#EDF9F1] px-3 py-2 text-[13px] leading-[1.45] font-bold text-[#2F6D46]">
            Where to look: {step.where}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onEnd}
            className="cursor-pointer rounded-lg border-none bg-transparent px-2 py-2 text-[13px] font-extrabold text-rl-slate hover:text-rl-orange"
          >
            Skip
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => dispatch({ type: "tour-back" })}
              disabled={index === 0}
              className="cursor-pointer rounded-[10px] border-none bg-[#EEF4F8] px-[18px] py-2.5 text-[14px] font-black text-rl-ink disabled:cursor-default disabled:opacity-40"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() =>
                isLast ? onEnd() : dispatch({ type: "tour-next" })
              }
              className="cursor-pointer rounded-[10px] border-none bg-rl-orange px-[18px] py-2.5 text-[14px] font-black text-white shadow-[0_4px_10px_rgba(216,110,15,.4),inset_0_1px_0_rgba(255,255,255,.5)] active:translate-y-px"
            >
              {isLast ? "Start building" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
