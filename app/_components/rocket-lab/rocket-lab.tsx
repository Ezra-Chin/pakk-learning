"use client";

import Link from "next/link";
import { useCallback, useEffect, useReducer, useRef } from "react";

import { CHALLENGES } from "@/lib/rocket-lab/parts";
import { type Sim, simulate } from "@/lib/rocket-lab/physics";
import {
  finishFlight,
  initialState,
  loadBests,
  reducer,
} from "@/lib/rocket-lab/state";
import { BuildPanel } from "./build-panel";
import { ChallengeBar } from "./challenge-bar";
import { DraftModal } from "./draft-modal";
import { FlightStage } from "./flight-stage";
import { InfoModal } from "./info-modal";
import { PartsBin } from "./parts-bin";
import { ResultPanel } from "./result-panel";
import { StatsPanel } from "./stats-panel";

export function RocketLab() {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Scoring runs from a rAF callback, so it reads state through a ref rather
  // than the closure captured when the launch started.
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  });

  const countdownTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flightRaf = useRef<number | null>(null);
  const scoreRaf = useRef<number | null>(null);

  useEffect(() => {
    const saved = loadBests();
    if (saved) dispatch({ type: "hydrate-bests", bests: saved });
  }, []);

  useEffect(
    () => () => {
      if (countdownTimer.current) clearTimeout(countdownTimer.current);
      if (flightRaf.current) cancelAnimationFrame(flightRaf.current);
      if (scoreRaf.current) cancelAnimationFrame(scoreRaf.current);
    },
    [],
  );

  // A part dropped on the wrong bay shakes the rocket for 450ms.
  useEffect(() => {
    if (!state.reject) return;
    const t = setTimeout(() => dispatch({ type: "clear-reject" }), 450);
    return () => clearTimeout(t);
  }, [state.reject]);

  const finish = useCallback((sim: Sim) => {
    const s = stateRef.current;
    const { result, bests, mascot } = finishFlight(
      sim,
      s.challenge,
      s.parts,
      s.bests,
    );
    dispatch({ type: "finish", result, bests, mascot });

    const t0 = performance.now();
    const anim = (now: number) => {
      const k = Math.min(1, (now - t0) / 900);
      dispatch({
        type: "score-shown",
        value: Math.round(result.sc.total * (1 - Math.pow(1 - k, 3))),
      });
      if (k < 1) scoreRaf.current = requestAnimationFrame(anim);
    };
    scoreRaf.current = requestAnimationFrame(anim);
  }, []);

  const play = useCallback(
    (sim: Sim) => {
      const frames = sim.traj.length;
      const dur = Math.min(4200, Math.max(1400, frames * 12));
      const t0 = performance.now();
      const step = (now: number) => {
        const k = Math.min(1, (now - t0) / dur);
        dispatch({ type: "frame", fi: Math.floor(k * (frames - 1)) });
        if (k < 1) flightRaf.current = requestAnimationFrame(step);
        else finish(sim);
      };
      flightRaf.current = requestAnimationFrame(step);
    },
    [finish],
  );

  const launch = useCallback(() => {
    const s = stateRef.current;
    if (s.phase === "count" || s.phase === "fly") return;

    const sim = simulate(s.parts, s.angle);
    dispatch({ type: "begin-launch", sim });

    const tick = (n: number) => {
      countdownTimer.current = setTimeout(() => {
        if (n > 0) {
          dispatch({ type: "countdown", count: n });
          tick(n - 1);
        } else {
          dispatch({ type: "start-flight" });
          play(sim);
        }
      }, 700);
    };
    tick(2);
  }, [play]);

  const challenge =
    CHALLENGES.find((c) => c.id === state.challenge) ?? CHALLENGES[0];
  const best = state.bests[state.challenge];

  return (
    <div className="relative flex-1 overflow-hidden bg-rl-sky">
      <svg
        viewBox="0 0 1440 420"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="absolute right-0 bottom-0 left-0 h-[420px] w-full opacity-55"
      >
        <path
          d="M0 250 C 180 170 300 250 470 215 C 640 180 760 260 940 225 C 1120 190 1300 250 1440 215 L1440 420 L0 420 Z"
          fill="#9FD9EF"
        />
        <path
          d="M0 320 C 200 265 340 330 520 300 C 700 270 860 335 1060 305 C 1220 282 1340 320 1440 300 L1440 420 L0 420 Z"
          fill="#8ACB84"
        />
        <path
          d="M0 372 C 240 340 420 388 660 366 C 900 344 1120 390 1440 362 L1440 420 L0 420 Z"
          fill="#6FB86C"
        />
      </svg>

      <div className="relative mx-auto flex max-w-[1180px] flex-col gap-[14px] px-[18px] pt-5 pb-12">
        <header className="flex flex-wrap items-center gap-[14px] rounded-2xl bg-rl-navy px-5 py-3 shadow-[0_10px_24px_rgba(16,45,64,.28),inset_0_1px_0_rgba(255,255,255,.18)]">
          <div className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-rl-orange shadow-[inset_0_1px_0_rgba(255,255,255,.55)]">
            <svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true">
              <path d="M16 5 L21 19 L16 16 L11 19 Z" fill="#FFFFFF" />
              <rect
                x="14"
                y="20"
                width="4"
                height="6"
                rx="1.4"
                fill="rgba(255,255,255,.75)"
              />
            </svg>
          </div>
          <div className="min-w-[170px] flex-1">
            <div className="text-[25px] leading-[1.1] font-black tracking-[.4px] text-white">
              Rocket Lab
            </div>
            <div className="text-[13.5px] font-bold text-rl-mist">
              Build a rocket, launch it, find out why it flew that way.
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-[10px] bg-white/14 px-[14px] py-[7px] text-[15px] font-extrabold">
            <span className="text-[11.5px] tracking-[1.1px] text-rl-mist">
              BEST
            </span>
            <span className="text-[19px] text-[#FFD27A]">
              {best ? String(best.score) : "none yet"}
            </span>
          </div>
        </header>

        <ChallengeBar challenge={state.challenge} dispatch={dispatch} />

        <section className="flex flex-wrap items-stretch gap-[14px]">
          <PartsBin parts={state.parts} dispatch={dispatch} />
          <BuildPanel
            parts={state.parts}
            angle={state.angle}
            phase={state.phase}
            dragging={state.dragging}
            over={state.over}
            reject={state.reject}
            onLaunch={launch}
            dispatch={dispatch}
          />
          <StatsPanel
            parts={state.parts}
            mascot={state.mascot}
            dispatch={dispatch}
          />
        </section>

        <FlightStage
          sim={state.sim}
          phase={state.phase}
          fi={state.fi}
          count={state.count}
          hasResult={!!state.result}
          goal={challenge.goal}
        />

        {state.result && (
          <ResultPanel
            result={state.result}
            scoreShown={state.scoreShown}
            challengeName={challenge.name}
            dispatch={dispatch}
          />
        )}

        <footer className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white/70 px-[18px] py-3 text-[12.5px] font-bold text-rl-slate">
          <span>
            Rocket Lab keeps your best scores on your own device. Nothing is
            uploaded.
          </span>
          <Link href="/privacy" className="font-extrabold">
            Privacy policy
          </Link>
        </footer>

        {state.draft && (
          <DraftModal
            draft={state.draft}
            parts={state.parts}
            dispatch={dispatch}
          />
        )}

        {state.info && <InfoModal info={state.info} dispatch={dispatch} />}
      </div>
    </div>
  );
}
