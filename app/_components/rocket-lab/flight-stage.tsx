import { STAGE, type Sim, stagePos, stageSpan } from "@/lib/rocket-lab/physics";
import type { Phase } from "@/lib/rocket-lab/state";
import { dimClass } from "./styles";

const PAD = { x: STAGE.padX, y: STAGE.groundY };

/** Round steps (1, 2 or 5 times a power of ten) across a span. */
function ticks(span: number, target: number): number[] {
  const raw = span / target;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / mag;
  const step = (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * mag;
  const out: number[] = [];
  for (let v = step; v <= span; v += step) out.push(v);
  return out;
}

const metres = (v: number) =>
  v >= 1000 ? +(v / 1000).toFixed(1) + " km" : Math.round(v) + " m";

export function FlightStage({
  sim,
  phase,
  fi,
  count,
  hasResult,
  goal,
  dimmed = false,
}: {
  sim: Sim | null;
  phase: Phase;
  fi: number;
  count: number;
  hasResult: boolean;
  goal: string;
  dimmed?: boolean;
}) {
  // Clamped at both ends, the same way stagePos reads the trajectory: the frame
  // index comes from an animation and must never index off either edge.
  const point = sim
    ? sim.traj[Math.min(Math.max(fi, 0), sim.traj.length - 1)]
    : null;
  // Back on the pad: either nothing has flown yet, or the last flight was
  // cleared (a new challenge) and its trajectory no longer describes anything.
  const idle = phase === "build" && !hasResult;
  const onPad = !sim || idle || phase === "count";

  // The dotted trail is drawn up to the current frame, thinned to ~160 points.
  let trail = "";
  if (sim && !idle) {
    const upto = phase === "count" ? 0 : fi;
    const stride = Math.max(1, Math.floor(sim.traj.length / 160));
    const pts: string[] = [];
    for (let i = 0; i <= upto; i += stride) {
      const q = stagePos(sim, i);
      pts.push(q.x + "," + q.y);
    }
    trail = pts.join(" ");
  }

  // Labelled gridlines, so the flight can be read in metres rather than guessed
  // at. Held back during the countdown, which would otherwise give away the
  // height of a flight that has not happened yet.
  const showScale = !!sim && !idle && phase !== "count";
  const span = sim ? stageSpan(sim) : null;
  const altTicks = showScale && span ? ticks(span.y, 6) : [];
  const distTicks = showScale && span ? ticks(span.x, 8) : [];
  const climb = STAGE.groundY - STAGE.topY;
  const run = STAGE.rightX - STAGE.padX;

  const pos = onPad ? PAD : stagePos(sim, fi);
  const rot =
    !point || (phase !== "fly" && phase !== "result")
      ? 0
      : Math.round(Math.max(-160, Math.min(160, point.r)));
  const showFlame = phase === "fly" && !!point?.burning;

  let readout = "";
  if (idle || phase === "count") {
    readout = "On the pad. " + goal;
  } else if (sim && point) {
    readout =
      phase === "fly"
        ? "Altitude " +
          Math.round(point.y) +
          " m, distance " +
          Math.round(point.x) +
          " m"
        : "Peak " +
          Math.round(sim.maxY) +
          " m, distance " +
          Math.round(sim.dist) +
          " m";
  }

  return (
    <section
      className={`overflow-hidden rounded-2xl shadow-[0_10px_24px_rgba(16,45,64,.16)] ${dimClass(dimmed)}`}
    >
      <div className="flex items-center justify-between gap-3 bg-rl-navy px-[18px] py-[11px]">
        <span className="text-[12.5px] font-black tracking-[1.4px] text-white">
          FLIGHT
        </span>
        <span className="text-[13.5px] font-extrabold text-rl-mist">
          {readout}
        </span>
      </div>

      <div className="relative">
        <svg viewBox="0 0 1000 420" className="block h-auto w-full">
          <rect x="0" y="0" width="1000" height="420" fill="#96D6F2" />

          <g style={{ animation: "rl-drift 30s linear infinite" }} opacity=".85">
            <ellipse cx="210" cy="86" rx="58" ry="20" fill="#FFFFFF" />
            <ellipse cx="252" cy="74" rx="34" ry="17" fill="#FFFFFF" />
            <ellipse cx="620" cy="146" rx="64" ry="22" fill="#FFFFFF" />
            <ellipse cx="668" cy="134" rx="36" ry="17" fill="#FFFFFF" />
            <ellipse cx="900" cy="66" rx="48" ry="18" fill="#FFFFFF" />
            <ellipse cx="1180" cy="110" rx="56" ry="20" fill="#FFFFFF" />
          </g>

          {altTicks.map((v) => {
            const y = STAGE.groundY - (v / span!.y) * climb;
            return (
              <g key={"alt" + v}>
                <line
                  x1="10"
                  y1={y}
                  x2="990"
                  y2={y}
                  stroke="#FFFFFF"
                  strokeOpacity=".55"
                  strokeWidth="1.5"
                  strokeDasharray="5 9"
                />
                <text
                  x="12"
                  y={y - 5}
                  fontSize="11.5"
                  fontWeight="800"
                  fill="#2C485C"
                  fillOpacity=".5"
                >
                  {metres(v)}
                </text>
              </g>
            );
          })}

          <path
            d="M0 322 C 150 288 260 336 400 314 C 540 292 660 340 810 318 C 920 302 960 318 1000 310 L1000 420 L0 420 Z"
            fill="#A9DFEF"
            opacity=".75"
          />
          <path
            d="M0 352 C 180 326 300 366 470 348 C 640 330 800 368 1000 344 L1000 420 L0 420 Z"
            fill="#8ACB84"
          />
          <path
            d="M0 380 C 220 364 420 392 660 376 C 860 362 940 386 1000 378 L1000 420 L0 420 Z"
            fill="#6FB86C"
          />

          <rect x="46" y="358" width="72" height="20" rx="6" fill="#B6A489" />

          {distTicks.map((v) => {
            const x = STAGE.padX + (v / span!.x) * run;
            return (
              <g key={"dist" + v}>
                <line
                  x1={x}
                  y1={STAGE.groundY}
                  x2={x}
                  y2={STAGE.groundY + 11}
                  stroke="#2C485C"
                  strokeOpacity=".3"
                  strokeWidth="2"
                />
                <text
                  x={x}
                  y={STAGE.groundY + 26}
                  textAnchor="middle"
                  fontSize="11.5"
                  fontWeight="800"
                  fill="#2C485C"
                  fillOpacity=".55"
                >
                  {metres(v)}
                </text>
              </g>
            );
          })}

          <polyline
            points={trail}
            fill="none"
            stroke="rgba(255,255,255,.85)"
            strokeWidth="5"
            strokeDasharray="3 13"
            strokeLinecap="round"
          />

          <g transform={`translate(${pos.x} ${pos.y}) rotate(${rot})`}>
            {showFlame && (
              <>
                <path
                  d="M-8 13 L8 13 Q0 46 0 46 Z"
                  fill="#FFC24D"
                  style={{ animation: "rl-flicker .12s linear infinite" }}
                />
                <path d="M-4 13 L4 13 Q0 32 0 32 Z" fill="#FFF3C4" />
              </>
            )}
            <path d="M-10 13 L-23 30 L-10 27 Z" fill="#2F76AE" />
            <path d="M10 13 L23 30 L10 27 Z" fill="#2F76AE" />
            <rect x="-10" y="-14" width="20" height="28" rx="7" fill="#EEF4F8" />
            <path d="M-10 -12 L0 -33 L10 -12 Z" fill="#F5891F" />
          </g>
        </svg>

        {phase === "count" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="flex h-32 min-w-32 items-center justify-center rounded-[20px] bg-[rgba(31,56,73,.55)] px-[18px] text-[64px] font-black text-white"
              style={{ animation: "rl-pop .25s ease-out" }}
            >
              {count > 0 ? String(count) : "GO"}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
