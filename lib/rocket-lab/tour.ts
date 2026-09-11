/** Step list for the first-run guided tour. */

import { PARTS, SLOT_IDS, type SlotId } from "./parts";

export type TourFocus = "parts" | "angle" | "launch";

export type TourStep = {
  id: string;
  title: string;
  body: string;
  /** Where the part sits on the rocket. Part steps only. */
  where?: string;
  /** Lights up this slot's bin chip and its bay on the rocket. */
  slot?: SlotId;
  focus: TourFocus | null;
};

/**
 * PARTS[slot].hint says what a part does; these say where to look for it.
 * Together they are the whole of a part step's copy.
 */
const WHERE: Record<SlotId, string> = {
  nose: "The tip of the rocket. It meets the air first.",
  body: "The tube everything else bolts onto.",
  fins: "The blue wings at the tail.",
  engine: "The grey bell at the very bottom.",
  fuel: "The yellow tank inside the frame.",
  payload: "The green pod just under the nose.",
};

/** Generated from SLOT_IDS, so the tour always matches the PARTS list order. */
const partSteps: TourStep[] = SLOT_IDS.map((slot) => ({
  id: slot,
  title: PARTS[slot].label,
  body: PARTS[slot].hint,
  where: WHERE[slot],
  slot,
  focus: "parts",
}));

export const TOUR_STEPS: readonly TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to Rocket Lab",
    body: "You build a rocket out of six parts, launch it, and find out why it flew the way it did. Here is what each part is and where it sits.",
    focus: null,
  },
  ...partSteps,
  {
    id: "angle",
    title: "Launch angle",
    body: "Straight up wins height. Tilting over trades height for distance. Each challenge sets a sensible starting angle for you.",
    focus: "angle",
  },
  {
    id: "launch",
    title: "Then launch it",
    body: "Press LAUNCH and watch the flight. Afterwards you get a score and a note on every part that helped or hurt. Change one part at a time and launch again.",
    focus: "launch",
  },
];
