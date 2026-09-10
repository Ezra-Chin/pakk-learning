/** Part catalogue, challenges and glossary for Rocket Lab. */

export type SlotId = "nose" | "body" | "fins" | "engine" | "fuel" | "payload";

export type NoseId = "round" | "pointed" | "parabolic";
export type BodyId = "short" | "long";
export type FinsId = "small" | "medium" | "large";
export type EngineId = "low" | "medium" | "high";
export type FuelId = "small" | "medium" | "large";
export type PayloadId = "none" | "small" | "medium" | "heavy";

export type Parts = {
  nose: NoseId;
  body: BodyId;
  fins: FinsId;
  engine: EngineId;
  fuel: FuelId;
  payload: PayloadId;
};

type BaseOption = { id: string; label: string; mass: number; blurb: string };

export type NoseOption = BaseOption & { id: NoseId; drag: number };
export type BodyOption = BaseOption & { id: BodyId; drag: number; stab: number };
export type FinsOption = BaseOption & { id: FinsId; drag: number; stab: number };
export type EngineOption = BaseOption & {
  id: EngineId;
  thrust: number;
  burn: number;
};
export type FuelOption = BaseOption & { id: FuelId };
export type PayloadOption = BaseOption & { id: PayloadId };

export const NOSE_OPTS: readonly NoseOption[] = [
  {
    id: "round",
    label: "Round",
    mass: 3,
    drag: 1.0,
    blurb: "Blunt. Air piles up in front of it.",
  },
  {
    id: "pointed",
    label: "Pointed",
    mass: 2,
    drag: 0.66,
    blurb: "Sharp. Slices the air open.",
  },
  {
    id: "parabolic",
    label: "Parabolic",
    mass: 3.5,
    drag: 0.78,
    blurb: "Curved. Smooth and steady.",
  },
];

export const BODY_OPTS: readonly BodyOption[] = [
  {
    id: "short",
    label: "Short and light",
    mass: 7,
    drag: 0.92,
    stab: 0.85,
    blurb: "Light and quick. Tips over more easily.",
  },
  {
    id: "long",
    label: "Long and sturdy",
    mass: 13,
    drag: 1.06,
    stab: 1.2,
    blurb: "Heavier, but it holds a line.",
  },
];

export const FINS_OPTS: readonly FinsOption[] = [
  {
    id: "small",
    label: "Small fins",
    mass: 1,
    drag: 1.0,
    stab: 0.5,
    blurb: "Almost no drag. Wobbly flight.",
  },
  {
    id: "medium",
    label: "Medium fins",
    mass: 2,
    drag: 1.14,
    stab: 0.9,
    blurb: "A good balance of steady and slippery.",
  },
  {
    id: "large",
    label: "Large fins",
    mass: 3.5,
    drag: 1.38,
    stab: 1.15,
    blurb: "Very steady, but they drag a lot.",
  },
];

export const ENGINE_OPTS: readonly EngineOption[] = [
  {
    id: "low",
    label: "Low thrust",
    mass: 5,
    thrust: 620,
    burn: 1.2,
    blurb: "620 N of push. Sips fuel slowly.",
  },
  {
    id: "medium",
    label: "Medium thrust",
    mass: 8,
    thrust: 1050,
    burn: 2.3,
    blurb: "1050 N of push. Good all round.",
  },
  {
    id: "high",
    label: "High thrust",
    mass: 12,
    thrust: 1750,
    burn: 4.2,
    blurb: "1750 N of push. Drinks fuel fast.",
  },
];

export const FUEL_OPTS: readonly FuelOption[] = [
  { id: "small", label: "Small tank", mass: 8, blurb: "8 kg. Short, light burn." },
  {
    id: "medium",
    label: "Medium tank",
    mass: 16,
    blurb: "16 kg. A sensible middle.",
  },
  {
    id: "large",
    label: "Large tank",
    mass: 30,
    blurb: "30 kg. Long burn, heavy load.",
  },
];

export const PAYLOAD_OPTS: readonly PayloadOption[] = [
  {
    id: "none",
    label: "Empty bay",
    mass: 0,
    blurb: "Nothing on board. Fastest climb.",
  },
  {
    id: "small",
    label: "Small payload",
    mass: 5,
    blurb: "5 kg science pod.",
  },
  {
    id: "medium",
    label: "Medium payload",
    mass: 11,
    blurb: "11 kg cargo crate.",
  },
  {
    id: "heavy",
    label: "Heavy payload",
    mass: 22,
    blurb: "22 kg of rock. Needs serious thrust.",
  },
];

export const PARTS = {
  nose: {
    label: "Nose cone",
    mark: "NC",
    hint: "A pointed nose slips through the air more easily.",
    opts: NOSE_OPTS,
  },
  body: {
    label: "Frame",
    mark: "FR",
    hint: "A long frame flies straighter but weighs more.",
    opts: BODY_OPTS,
  },
  fins: {
    label: "Fins",
    mark: "FN",
    hint: "Big fins steer better and grab more air.",
    opts: FINS_OPTS,
  },
  engine: {
    label: "Engine",
    mark: "EN",
    hint: "More push, but big engines are heavy and thirsty.",
    opts: ENGINE_OPTS,
  },
  fuel: {
    label: "Fuel",
    mark: "FU",
    hint: "Fuel burns away, but you carry all of it at liftoff.",
    opts: FUEL_OPTS,
  },
  payload: {
    label: "Payload",
    mark: "PL",
    hint: "Cargo is dead weight unless the challenge pays for it.",
    opts: PAYLOAD_OPTS,
  },
} as const;

export const SLOT_IDS = Object.keys(PARTS) as SlotId[];

/** Falls back to the first option so an unknown id can never blank the rocket. */
export function findOpt<T extends { id: string }>(
  opts: readonly T[],
  id: string,
): T {
  return opts.find((o) => o.id === id) ?? opts[0];
}

/** Widened view of a slot's options, for UI that walks every slot the same way. */
export function optionsFor(slot: SlotId): readonly BaseOption[] {
  return PARTS[slot].opts;
}

export function currentOption(slot: SlotId, parts: Parts): BaseOption {
  return findOpt(optionsFor(slot), parts[slot]);
}

/** The slot ids are exactly the keys of Parts, so the widened write is safe. */
export function withPart(parts: Parts, slot: SlotId, value: string): Parts {
  return { ...parts, [slot]: value } as Parts;
}

export type ChallengeId = "altitude" | "distance" | "payload";

export type Challenge = {
  id: ChallengeId;
  name: string;
  mark: string;
  goal: string;
  angle: number;
};

export const CHALLENGES: readonly Challenge[] = [
  {
    id: "altitude",
    name: "Reach the sky",
    mark: "ALT",
    goal: "Fly as high as you can",
    angle: 88,
  },
  {
    id: "distance",
    name: "Long shot",
    mark: "DIS",
    goal: "Fly as far as you can",
    angle: 45,
  },
  {
    id: "payload",
    name: "Heavy lifter",
    mark: "LIFT",
    goal: "Carry heavy cargo high",
    angle: 85,
  },
];

export type InfoKey =
  | "Mass"
  | "Drag"
  | "Thrust"
  | "Stability"
  | "Efficiency"
  | "Weight"
  | "Aerodynamics"
  | "Gravity"
  | "Angle";

export const INFO: Record<InfoKey, [title: string, body: string]> = {
  Mass: [
    "What is mass?",
    "Mass is how much stuff your rocket is made of.\n\nNewton worked out that force equals mass times acceleration. Double the mass with the same engine and the rocket speeds up half as fast.\n\nEvery kilogram you add, whether fins, fuel or cargo, is a kilogram the engine has to push skyward.",
  ],
  Drag: [
    "What is drag?",
    "Stick your hand out of a moving car. The air pushes back hard.\n\nThat push is drag, and your rocket feels it too. Drag gets much stronger the faster you go.\n\nPointed noses and small fins let air slide past. Blunt noses and giant fins catch it.",
  ],
  Thrust: [
    "What is thrust?",
    "Thrust is the push from the engine. It throws hot gas down, so the rocket goes up. Every action has an equal and opposite reaction.\n\nWhat matters is thrust compared with weight. A big engine on a heavy rocket still crawls off the pad.",
  ],
  Stability: [
    "What is stability?",
    "A stable rocket keeps pointing where it is going, like an arrow with feathers.\n\nFins at the back push the tail into line whenever the nose starts to swing. Without them the rocket wobbles, and wobbling throws the push sideways instead of upward.",
  ],
  Efficiency: [
    "What is efficiency?",
    "Efficiency asks how much altitude you got per kilogram of fuel.\n\nExtra fuel means extra mass the whole way up. Sometimes a smaller tank scores better than a bigger one.",
  ],
  Weight: [
    "Weight and mass",
    "Weight is gravity pulling on your mass. Earth tugs down at about 9.8 metres per second squared for the whole flight.\n\nYour engine has to beat that pull first. Whatever is left over is what actually accelerates you upward.",
  ],
  Aerodynamics: [
    "Aerodynamics",
    "Aerodynamics is how neatly air flows around your rocket.\n\nA streamlined shape leaves the air barely disturbed, so less engine energy goes into shoving air out of the way.",
  ],
  Gravity: [
    "Gravity",
    "Gravity never switches off. It pulls your rocket back toward Earth at about 9.8 metres per second squared, even while the engine is firing.\n\nThat is why a rocket slows after burnout, stops, and falls.",
  ],
  Angle: [
    "Launch angle",
    "Straight up gets you the most height. Tilting over trades height for distance.\n\nWith no air, about 45 degrees flies the furthest. With drag in the way, slightly lower angles often win.",
  ],
};

/** Bar colours shared by the stats, score categories and draft preview. */
export const GRAD = {
  mass: "#F0801A",
  drag: "#2F86D6",
  thrust: "#E4553F",
  stab: "#2E9A93",
  eff: "#43AF67",
} as const;
