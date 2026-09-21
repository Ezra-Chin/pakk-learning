import type { Dispatch } from "react";

import { GRAD } from "@/lib/rocket-lab/parts";
import { pct } from "@/lib/rocket-lab/physics";
import type { Action, Result } from "@/lib/rocket-lab/state";
import { LEARN_BUTTON, PANEL, PANEL_HINT, PANEL_LABEL, TRACK } from "./styles";

export function ResultPanel({
  result,
  scoreShown,
  challengeName,
  dispatch,
}: {
  result: Result;
  scoreShown: number;
  challengeName: string;
  dispatch: Dispatch<Action>;
}) {
  const bestJump =
    result.prevScore !== null
      ? result.prevScore + " up to " + result.sc.total
      : String(result.sc.total);

  const categories = [
    { label: "Aerodynamics", v: result.sc.cats.aero, color: GRAD.drag },
    { label: "Weight", v: result.sc.cats.weight, color: GRAD.mass },
    { label: "Thrust", v: result.sc.cats.thrust, color: GRAD.thrust },
    { label: "Stability", v: result.sc.cats.stability, color: GRAD.stab },
    { label: "Efficiency", v: result.sc.cats.efficiency, color: GRAD.eff },
  ];

  return (
    <section className="flex flex-col gap-[13px]">
      {result.isBest && (
        <div className="rounded-[14px] bg-[#FFE3A6] px-5 py-[15px] shadow-[0_8px_20px_rgba(16,45,64,.14)]">
          <div className="text-[19px] font-black text-[#6D4A08]">
            New personal best, {bestJump}
          </div>
          {result.changes.length > 0 && (
            <>
              <div className="mt-2 mb-[7px] text-[12px] font-extrabold tracking-[1px] text-[#9A742A]">
                WHAT CHANGED
              </div>
              <div className="flex flex-wrap gap-[7px]">
                {result.changes.map((c) => (
                  <span
                    key={c.text}
                    className="rounded-[7px] bg-white/80 px-[11px] py-[5px] text-[12.5px] font-bold text-[#5C4310]"
                  >
                    {c.text}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-[13px]">
        <div
          className={`${PANEL} min-w-[240px] flex-[1_1_250px] p-5 text-center`}
        >
          <div className={`${PANEL_LABEL} text-[12.5px]`}>SCORE</div>
          <div className="text-[72px] leading-none font-black text-rl-orange">
            {scoreShown}
          </div>
          <div className={`${PANEL_HINT} mb-[14px] text-[13px]`}>
            out of 100 on {challengeName}
          </div>

          <div className="flex flex-col gap-[9px] text-left">
            {categories.map((c) => (
              <div key={c.label}>
                <div className="mb-1 flex justify-between text-[12.8px] font-extrabold">
                  <span>{c.label}</span>
                  <span className="text-rl-slate">{Math.round(c.v)}</span>
                </div>
                <div className={`${TRACK} h-[10px]`}>
                  <div
                    className="h-full rounded-[5px] transition-[width] duration-[600ms] ease-out"
                    style={{ width: pct(c.v), background: c.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`${PANEL} min-w-[260px] flex-[2_1_360px] p-5`}>
          <div className={`${PANEL_LABEL} text-[12.5px]`}>WHAT HAPPENED</div>
          <div className={`${PANEL_HINT} mt-[5px] mb-[14px] text-[13.5px]`}>
            {result.sim.lifted
              ? "Here is why your rocket flew the way it did."
              : "Nothing flew. Here is the physics of why."}
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-[11px]">
            {result.feedback.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border-l-4 px-[15px] py-[13px]"
                style={{ background: f.bg, borderLeftColor: f.border }}
              >
                <div className="mb-[5px] flex items-baseline justify-between gap-2">
                  <span className="text-[14px] font-black">{f.title}</span>
                  <span
                    className="text-[13px] font-black"
                    style={{ color: f.deltaColor }}
                  >
                    {f.delta}
                  </span>
                </div>
                <div className="text-[13px] leading-[1.45] font-bold text-rl-body">
                  {f.text}
                </div>
                <button
                  type="button"
                  onClick={() => dispatch({ type: "open-info", key: f.key })}
                  className={`${LEARN_BUTTON} mt-2 bg-white/85`}
                >
                  Learn more
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
