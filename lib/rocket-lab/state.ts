/** Reducer, persistence and launch bookkeeping for the Rocket Lab screen. */

import {
  CHALLENGES,
  type ChallengeId,
  type InfoKey,
  PARTS,
  type Parts,
  type SlotId,
  findOpt,
  optionsFor,
  withPart,
} from "./parts";
import {
  type FeedbackItem,
  type Score,
  type Sim,
  feedback,
  mascotLine,
  score,
} from "./physics";
import { TOUR_STEPS } from "./tour";

export type Phase = "build" | "count" | "fly" | "result";

export type Best = { score: number; parts: Parts };
export type BestMap = Partial<Record<ChallengeId, Best>>;

export type Draft = { slot: SlotId; value: string };

export type Result = {
  sc: Score;
  feedback: FeedbackItem[];
  isBest: boolean;
  prevScore: number | null;
  changes: { text: string }[];
  sim: Sim;
};

export type State = {
  challenge: ChallengeId;
  parts: Parts;
  angle: number;
  phase: Phase;
  count: number;
  /** Index into the current sim's trajectory. */
  fi: number;
  sim: Sim | null;
  result: Result | null;
  draft: Draft | null;
  info: InfoKey | null;
  dragging: SlotId | null;
  over: SlotId | null;
  reject: boolean;
  scoreShown: number;
  bests: BestMap;
  mascot: string;
  /** Index into TOUR_STEPS, or null when the tour is not running. */
  tourStep: number | null;
};

export const initialState: State = {
  challenge: "altitude",
  parts: {
    nose: "round",
    body: "short",
    fins: "medium",
    engine: "medium",
    fuel: "medium",
    payload: "none",
  },
  angle: 88,
  phase: "build",
  count: 3,
  fi: 0,
  sim: null,
  result: null,
  draft: null,
  info: null,
  dragging: null,
  over: null,
  reject: false,
  scoreShown: 0,
  bests: {},
  mascot: "Press launch and we will see what this thing does.",
  tourStep: null,
};

export type Action =
  | { type: "hydrate-bests"; bests: BestMap }
  | { type: "pick-challenge"; id: ChallengeId }
  | { type: "set-angle"; angle: number }
  | { type: "open-draft"; slot: SlotId }
  | { type: "choose-draft"; value: string }
  | { type: "apply-draft" }
  | { type: "close-draft" }
  | { type: "open-info"; key: InfoKey }
  | { type: "close-info" }
  | { type: "drag-start"; slot: SlotId }
  | { type: "drag-end" }
  | { type: "drag-over"; slot: SlotId }
  | { type: "drag-leave"; slot: SlotId }
  | { type: "drop"; zone: SlotId; payload: string | null }
  | { type: "clear-reject" }
  | { type: "begin-launch"; sim: Sim }
  | { type: "countdown"; count: number }
  | { type: "start-flight" }
  | { type: "frame"; fi: number }
  | { type: "finish"; result: Result; bests: BestMap; mascot: string }
  | { type: "score-shown"; value: number }
  | { type: "start-tour" }
  | { type: "tour-next" }
  | { type: "tour-back" }
  | { type: "end-tour" };

/** True while a launch is counting down or in the air. */
const inFlight = (s: State) => s.phase === "count" || s.phase === "fly";

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "hydrate-bests":
      return { ...state, bests: action.bests };

    case "pick-challenge": {
      const ch = CHALLENGES.find((c) => c.id === action.id) ?? CHALLENGES[0];
      return {
        ...state,
        challenge: ch.id,
        angle: ch.angle,
        result: null,
        phase: inFlight(state) ? state.phase : "build",
      };
    }

    case "set-angle":
      return { ...state, angle: action.angle };

    case "open-draft":
      return {
        ...state,
        draft: { slot: action.slot, value: state.parts[action.slot] },
      };

    case "choose-draft":
      return state.draft
        ? { ...state, draft: { slot: state.draft.slot, value: action.value } }
        : state;

    case "apply-draft":
      return state.draft
        ? {
            ...state,
            parts: withPart(state.parts, state.draft.slot, state.draft.value),
            phase: inFlight(state) ? state.phase : "build",
            draft: null,
          }
        : { ...state, draft: null };

    case "close-draft":
      return { ...state, draft: null };

    case "open-info":
      return { ...state, info: action.key };

    case "close-info":
      return { ...state, info: null };

    case "drag-start":
      return { ...state, dragging: action.slot };

    case "drag-end":
      return { ...state, dragging: null, over: null };

    case "drag-over":
      return state.dragging === action.slot && state.over !== action.slot
        ? { ...state, over: action.slot }
        : state;

    case "drag-leave":
      return state.over === action.slot ? { ...state, over: null } : state;

    case "drop": {
      const slot = action.payload || state.dragging;
      if (slot === action.zone) {
        return {
          ...state,
          draft: { slot: action.zone, value: state.parts[action.zone] },
          over: null,
          dragging: null,
        };
      }
      // Wrong bay: shake the rocket instead of silently accepting the part.
      return { ...state, reject: true, over: null, dragging: null };
    }

    case "clear-reject":
      return { ...state, reject: false };

    case "begin-launch":
      return {
        ...state,
        sim: action.sim,
        fi: 0,
        phase: "count",
        count: 3,
        result: null,
        scoreShown: 0,
      };

    case "countdown":
      return { ...state, count: action.count };

    case "start-flight":
      return { ...state, phase: "fly" };

    case "frame":
      return { ...state, fi: action.fi };

    case "finish":
      return {
        ...state,
        phase: "result",
        result: action.result,
        bests: action.bests,
        mascot: action.mascot,
      };

    case "score-shown":
      return { ...state, scoreShown: action.value };

    // Clear any open modal so it cannot sit on top of the coach card.
    case "start-tour":
      return { ...state, tourStep: 0, draft: null, info: null };

    case "tour-next":
      return state.tourStep === null
        ? state
        : { ...state, tourStep: Math.min(state.tourStep + 1, TOUR_STEPS.length - 1) };

    case "tour-back":
      return state.tourStep === null
        ? state
        : { ...state, tourStep: Math.max(0, state.tourStep - 1) };

    case "end-tour":
      return { ...state, tourStep: null };
  }
}

// v3: the scoring bounds were recalibrated, so v2 totals are not comparable.
const BESTS_KEY = "rocketlab.bests.v3";

export function loadBests(): BestMap | null {
  try {
    const raw = localStorage.getItem(BESTS_KEY);
    return raw ? (JSON.parse(raw) as BestMap) : null;
  } catch {
    return null;
  }
}

function saveBests(bests: BestMap): void {
  try {
    localStorage.setItem(BESTS_KEY, JSON.stringify(bests));
  } catch {
    // Private browsing or a full quota. Scores are a nicety, not the point.
  }
}

const TOUR_KEY = "rocketlab.tour.v1";

/**
 * Returns true when the tour should not auto-start. Storage failures count as
 * "seen" so a private-browsing visitor is not re-prompted on every reload; the
 * header button still reaches the tour on demand.
 */
export function hasSeenTour(): boolean {
  try {
    return localStorage.getItem(TOUR_KEY) !== null;
  } catch {
    return true;
  }
}

export function markTourSeen(): void {
  try {
    localStorage.setItem(TOUR_KEY, "done");
  } catch {
    // Nothing to do. Worst case the tour offers itself again next visit.
  }
}

/** Scores a finished flight, records a new personal best and picks a mascot line. */
export function finishFlight(
  sim: Sim,
  challenge: ChallengeId,
  parts: Parts,
  prevBests: BestMap,
): { result: Result; bests: BestMap; mascot: string } {
  const sc = score(sim, challenge);
  const bests: BestMap = { ...prevBests };
  const prev = bests[challenge];
  const isBest = !prev || sc.total > prev.score;

  const changes: { text: string }[] = [];
  if (isBest && prev) {
    (Object.keys(parts) as SlotId[]).forEach((slot) => {
      if (prev.parts && prev.parts[slot] !== parts[slot]) {
        changes.push({
          text:
            "New " +
            PARTS[slot].label.toLowerCase() +
            ", " +
            findOpt(optionsFor(slot), parts[slot]).label.toLowerCase(),
        });
      }
    });
    if (!changes.length) changes.push({ text: "Same rocket, better launch angle" });
  }

  const result: Result = {
    sc,
    feedback: feedback(sim, parts),
    isBest,
    prevScore: prev ? prev.score : null,
    changes,
    sim,
  };

  if (isBest) {
    bests[challenge] = { score: sc.total, parts: { ...parts } };
    saveBests(bests);
  }

  return { result, bests, mascot: mascotLine(sim, sc.total) };
}
