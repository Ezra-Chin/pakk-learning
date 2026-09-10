/** Flight model: mass/drag bookkeeping, the trajectory integrator, scoring and coaching. */

import {
  BODY_OPTS,
  type BodyOption,
  type ChallengeId,
  ENGINE_OPTS,
  type EngineOption,
  FINS_OPTS,
  type FinsOption,
  FUEL_OPTS,
  type FuelOption,
  findOpt,
  type InfoKey,
  NOSE_OPTS,
  type NoseOption,
  PAYLOAD_OPTS,
  type PayloadOption,
  type Parts,
} from "./parts";

export type Metrics = {
  n: NoseOption;
  b: BodyOption;
  f: FinsOption;
  e: EngineOption;
  fu: FuelOption;
  p: PayloadOption;
  /** Mass with the tanks empty, kg. */
  dry: number;
  /** Liftoff mass, kg. */
  total: number;
  /** Combined drag coefficient. */
  cd: number;
  /** Stability, 0 to 1. */
  stab: number;
  /** Thrust to weight ratio. */
  twr: number;
  /** Burn time, seconds. */
  burn: number;
};

export function calc(parts: Parts): Metrics {
  const n = findOpt(NOSE_OPTS, parts.nose);
  const b = findOpt(BODY_OPTS, parts.body);
  const f = findOpt(FINS_OPTS, parts.fins);
  const e = findOpt(ENGINE_OPTS, parts.engine);
  const fu = findOpt(FUEL_OPTS, parts.fuel);
  const p = findOpt(PAYLOAD_OPTS, parts.payload);

  const dry = n.mass + b.mass + f.mass + e.mass + p.mass;
  const total = dry + fu.mass;
  const cd = n.drag * b.drag * f.drag;
  const base = Math.max(0, f.stab * b.stab - 0.014 * p.mass);
  const stab = Math.max(0.05, Math.min(0.97, 1 - Math.exp(-1.7 * base)));

  return {
    n,
    b,
    f,
    e,
    fu,
    p,
    dry,
    total,
    cd,
    stab,
    twr: e.thrust / (total * 9.81),
    burn: fu.mass / e.burn,
  };
}

export type TrajPoint = {
  x: number;
  y: number;
  /** Nose heading in degrees, for rotating the sprite. */
  r: number;
  burning: boolean;
};

export type Sim = {
  m: Metrics;
  traj: TrajPoint[];
  maxY: number;
  dist: number;
  time: number;
  vmax: number;
  lifted: boolean;
};

export function simulate(parts: Parts, angleDeg: number): Sim {
  const m = calc(parts);
  const dt = 0.03;
  const k = 0.012 * m.cd * (1 + (1 - m.stab) * 1.6);
  const a0 = (angleDeg * Math.PI) / 180;

  let fuel = m.fu.mass;
  let x = 0;
  let y = 0.02;
  let vx = 0;
  let vy = 0;
  let t = 0;
  let maxY = 0;
  let vmax = 0;
  let wp = 0;

  const traj: TrajPoint[] = [];
  const wobMax = (1 - m.stab) * 0.75;

  while (t < 90 && y >= 0 && traj.length < 3600) {
    const mass = m.dry + Math.max(fuel, 0);
    const v = Math.hypot(vx, vy);
    const velDir = v > 4 ? Math.atan2(vy, vx) : a0;
    wp += dt * 5;

    let ax = 0;
    let ay = -9.81;

    if (fuel > 0) {
      fuel -= m.e.burn * dt;
      // A wobbly rocket follows its velocity vector instead of holding the
      // commanded angle, so thrust ends up pointing partly sideways.
      const follow = 0.15 + (1 - m.stab) * 0.5;
      const nominal = a0 + (velDir - a0) * follow;
      const d = Math.max(
        a0 - wobMax - 0.25,
        Math.min(a0 + wobMax + 0.25, nominal + wobMax * Math.sin(wp)),
      );
      ax += (m.e.thrust * Math.cos(d)) / mass;
      ay += (m.e.thrust * Math.sin(d)) / mass;
    }

    if (v > 0.1) {
      const fd = k * v * v;
      ax -= (fd * (vx / v)) / mass;
      ay -= (fd * (vy / v)) / mass;
    }

    vx += ax * dt;
    vy += ay * dt;
    x += vx * dt;
    y += vy * dt;
    t += dt;

    if (y > maxY) maxY = y;
    if (v > vmax) vmax = v;

    traj.push({
      x,
      y: Math.max(y, 0),
      r: 90 - (Math.atan2(vy, vx) * 180) / Math.PI,
      burning: fuel > 0,
    });
  }

  if (!traj.length) traj.push({ x: 0, y: 0, r: 0, burning: false });

  return { m, traj, maxY, dist: Math.abs(x), time: t, vmax, lifted: maxY > 3 };
}

/** Maps a trajectory sample into the 1000x420 flight-stage viewBox. */
export function stagePos(sim: Sim, i: number): { x: number; y: number } {
  const p = sim.traj[Math.min(Math.max(i, 0), sim.traj.length - 1)];
  const sx = 880 / Math.max(sim.dist, 260);
  const sy = 330 / Math.max(sim.maxY, 260);
  return {
    x: Math.round(Math.max(24, Math.min(976, 80 + p.x * sx))),
    y: Math.round(Math.max(24, Math.min(376, 342 - p.y * sy))),
  };
}

export type Cats = {
  aero: number;
  weight: number;
  thrust: number;
  stability: number;
  efficiency: number;
};

export type Score = { cats: Cats; goal: number; total: number };

export function score(sim: Sim, challenge: ChallengeId): Score {
  const m = sim.m;
  const cl = (v: number) => Math.max(0, Math.min(100, v));
  const map = (v: number, a: number, b: number) => cl(((v - a) / (b - a)) * 100);

  const cats: Cats = {
    aero: map(1.55 - m.cd, 0, 0.95),
    weight: 100 - map(m.total, 22, 92),
    thrust: map(m.twr, 1.0, 6.5),
    stability: m.stab * 100,
    efficiency: map(sim.maxY / (m.fu.mass + 2), 4, 42),
  };

  let goal = 0;
  if (challenge === "altitude") goal = map(sim.maxY, 80, 3800);
  else if (challenge === "distance") goal = map(sim.dist, 150, 8000);
  else goal = map((m.p.mass * sim.maxY) / 1000, 0, 26);

  const avg =
    (cats.aero + cats.weight + cats.thrust + cats.stability + cats.efficiency) /
    5;

  return { cats, goal, total: Math.round(cl(0.55 * goal + 0.45 * avg)) };
}

export type FeedbackItem = {
  title: string;
  delta: string;
  text: string;
  key: InfoKey;
  border: string;
  bg: string;
  deltaColor: string;
};

type Tone = Pick<FeedbackItem, "border" | "bg" | "deltaColor">;

const GOOD: Tone = { border: "#43AF67", bg: "#EDF9F1", deltaColor: "#2F8F52" };
const WARN: Tone = { border: "#E3A32C", bg: "#FEF7E7", deltaColor: "#A57717" };
const BAD: Tone = { border: "#E4553F", bg: "#FDEEEB", deltaColor: "#BE3D29" };
const NOTE: Tone = { border: "#3D9BE9", bg: "#EDF5FD", deltaColor: "#2872B5" };

/** Notes worth showing, most urgent first. Only the first four are displayed. */
export function feedback(sim: Sim, parts: Parts): FeedbackItem[] {
  const m = sim.m;
  const out: FeedbackItem[] = [];

  if (!sim.lifted) {
    out.push({
      title: "It never left the pad",
      delta: "ratio " + m.twr.toFixed(2),
      text:
        "Your engine pushes with " +
        m.e.thrust +
        " N, but the rocket weighs " +
        Math.round(m.total * 9.81) +
        " N. Push has to beat weight before anything moves. Go lighter, or fit a bigger engine.",
      key: "Thrust",
      ...BAD,
    });
  }
  if (parts.nose === "pointed") {
    out.push({
      title: "Aerodynamics",
      delta: "up 14",
      text: "Your pointed nose cut air resistance by about 34 percent compared with a round one. Less air pushing back means more of the engine push actually moves you.",
      key: "Drag",
      ...GOOD,
    });
  }
  if (parts.nose === "round") {
    out.push({
      title: "Blunt nose",
      delta: "down 14",
      text: "The round nose shoves a wall of air ahead of it. Try the pointed cone and watch your top speed climb without adding a gram of engine.",
      key: "Drag",
      ...WARN,
    });
  }
  if (parts.fins === "large") {
    out.push({
      title: "Stability, with a catch",
      delta: "up " + Math.round(m.stab * 100 - 55),
      text: "Big fins held the rocket on course, and they also raised drag by about 38 percent. Good engineers hunt for the balance point.",
      key: "Stability",
      ...GOOD,
    });
  }
  if (parts.fins === "small" && m.stab < 0.6) {
    out.push({
      title: "Wobble",
      delta: "stability " + Math.round(m.stab * 100),
      text: "Those small fins let the nose swing around. Every wobble aims the engine sideways, so the push is wasted instead of lifting you.",
      key: "Stability",
      ...BAD,
    });
  }
  if (m.total > 55) {
    out.push({
      title: "Heavy rocket",
      delta: Math.round(m.total) + " kg",
      text:
        "At " +
        Math.round(m.total) +
        " kg your engine has a lot of mass to accelerate, so the climb is slow. Force equals mass times acceleration. Trim mass or add push.",
      key: "Mass",
      ...BAD,
    });
  }
  if (m.fu.id === "large") {
    out.push({
      title: "Fuel tradeoff",
      delta: m.burn.toFixed(1) + " s burn",
      text:
        "The big tank burns for " +
        m.burn.toFixed(1) +
        " seconds. It is also 30 kg, which is " +
        Math.round((30 / m.total) * 100) +
        " percent of your liftoff mass, and you haul all of it off the pad.",
      key: "Efficiency",
      ...WARN,
    });
  }
  if (m.burn < 3 && sim.lifted) {
    out.push({
      title: "Ran dry early",
      delta: m.burn.toFixed(1) + " s",
      text:
        "The engine quit after only " +
        m.burn.toFixed(1) +
        " seconds and gravity took over. A bigger tank buys more burn at the cost of mass.",
      key: "Gravity",
      ...WARN,
    });
  }
  if (m.p.mass > 0) {
    out.push({
      title: "Cargo aboard",
      delta: m.p.mass + " kg",
      text:
        "Your " +
        m.p.mass +
        " kg payload rides up front. It adds mass and shifts the balance point forward, which costs acceleration. Worth it only when the mission pays for cargo.",
      key: "Mass",
      ...NOTE,
    });
  }
  if (m.twr > 4.5) {
    out.push({
      title: "Serious push",
      delta: "ratio " + m.twr.toFixed(1),
      text:
        "Thrust of " +
        m.twr.toFixed(1) +
        " times your weight means the engine pushes several times harder than gravity pulls. You hit about " +
        Math.round(sim.vmax) +
        " m/s.",
      key: "Thrust",
      ...GOOD,
    });
  }
  if (sim.lifted && m.twr <= 4.5) {
    out.push({
      title: "Push against weight",
      delta: "ratio " + m.twr.toFixed(1),
      text:
        "Your engine pushes " +
        m.twr.toFixed(1) +
        " times harder than gravity pulls on " +
        Math.round(m.total) +
        " kg. Only the leftover force accelerates you, so the first seconds off the pad are the slowest part of the climb.",
      key: "Weight",
      ...NOTE,
    });
  }
  if (sim.lifted) {
    out.push({
      title: "Fuel spent",
      delta: Math.round(sim.maxY / m.fu.mass) + " m per kg",
      text:
        "You burned " +
        m.fu.mass +
        " kg of fuel for " +
        Math.round(sim.maxY) +
        " m of altitude, about " +
        Math.round(sim.maxY / m.fu.mass) +
        " m per kilogram. Try one tank size down and see whether the lighter rocket climbs just as well.",
      key: "Efficiency",
      ...GOOD,
    });
    out.push({
      title: "Flight log",
      delta: Math.round(sim.maxY) + " m",
      text:
        "Peak altitude " +
        Math.round(sim.maxY) +
        " m. Distance " +
        Math.round(sim.dist) +
        " m. Top speed " +
        Math.round(sim.vmax) +
        " m/s. Airborne for " +
        sim.time.toFixed(1) +
        " s.",
      key: "Angle",
      ...NOTE,
    });
  }

  return out.slice(0, 4);
}

export function mascotLine(sim: Sim, total: number): string {
  const m = sim.m;
  if (!sim.lifted) return "That one just sat there. Push has to beat weight.";
  if (m.total > 60) return "This rocket is heavy. The engine is working hard.";
  if (m.stab < 0.5) return "That flight wobbled. Try a little more fin.";
  if (m.f.id === "large" && m.cd > 1.3) return "Those fins are huge. Steady, but slow.";
  if (total > 80) return "That is a clean design. Nice work.";
  if (m.n.id === "pointed") return "The pointed nose is slicing right through the air.";
  return "Solid start. Change one part and see what moves.";
}

/* Bar-width helpers shared by the stats panel and the draft preview. */
export const pct = (v: number) => Math.max(2, Math.min(100, v)) + "%";
export const dragPct = (cd: number) =>
  Math.max(0, Math.min(100, ((cd - 0.5) / 1.15) * 100));
export const massPct = (total: number) => Math.min(100, (total / 95) * 100);
export const thrustPct = (twr: number) => Math.min(100, (twr / 7) * 100);
