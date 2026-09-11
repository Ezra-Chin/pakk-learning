import type { Dispatch } from "react";

import type { Parts, SlotId } from "@/lib/rocket-lab/parts";
import type { Action } from "@/lib/rocket-lab/state";
import { zoneHandlers, zoneStyles } from "./drop-zone";

/** Drawing measurements in the 200x480 rocket viewBox, derived from the build. */
function geometry(parts: Parts) {
  const long = parts.body === "long";
  return {
    bodyH: long ? 274 : 214,
    finY: long ? 58 : 0,
    fuelTop: long ? 190 : 150,
    fuelH: parts.fuel === "small" ? 50 : parts.fuel === "medium" ? 86 : 118,
    engTop: long ? 360 : 300,
    engBottom: long ? 404 : 344,
    engFlare: long ? 418 : 358,
    payloadR:
      parts.payload === "small" ? 11 : parts.payload === "medium" ? 17 : 23,
  };
}

type ZoneDef = {
  slot: SlotId;
  label: string;
  left: string;
  top: string;
  width: string;
  height: string;
};

function zoneDefs(parts: Parts): ZoneDef[] {
  return [
    { slot: "nose", label: "NOSE", left: "29%", top: "3%", width: "42%", height: "16%" },
    { slot: "payload", label: "PAYLOAD", left: "29%", top: "19.5%", width: "42%", height: "11%" },
    { slot: "fuel", label: "FUEL", left: "29%", top: "31%", width: "42%", height: "21%" },
    { slot: "fins", label: "FINS", left: "2%", top: "46%", width: "25%", height: "20%" },
    {
      slot: "engine",
      label: "ENGINE",
      left: "29%",
      top: parts.body === "long" ? "73%" : "62%",
      width: "42%",
      height: "12%",
    },
  ];
}

export function RocketView({
  parts,
  dragging,
  over,
  reject,
  highlightSlot = null,
  dispatch,
}: {
  parts: Parts;
  dragging: SlotId | null;
  over: SlotId | null;
  reject: boolean;
  highlightSlot?: SlotId | null;
  dispatch: Dispatch<Action>;
}) {
  const g = geometry(parts);

  return (
    <div
      className="relative h-[450px] w-[250px]"
      style={{ animation: reject ? "rl-shake .45s ease-in-out" : "none" }}
    >
      <svg
        viewBox="0 0 200 480"
        width={250}
        height={450}
        className="absolute inset-0 overflow-visible"
      >
        <ellipse cx="100" cy="452" rx="70" ry="10" fill="rgba(16,45,64,.13)" />

        <g transform={`translate(0 ${g.finY})`}>
          {parts.fins === "small" && (
            <>
              <path d="M64 250 L34 288 Q30 292 36 292 L64 292 Z" fill="#2F76AE" />
              <path d="M136 250 L166 288 Q170 292 164 292 L136 292 Z" fill="#2F76AE" />
            </>
          )}
          {parts.fins === "medium" && (
            <>
              <path d="M64 226 L22 292 Q18 296 25 296 L64 296 Z" fill="#2F76AE" />
              <path d="M136 226 L178 292 Q182 296 175 296 L136 296 Z" fill="#2F76AE" />
            </>
          )}
          {parts.fins === "large" && (
            <>
              <path d="M64 196 L6 296 Q2 301 10 301 L64 301 Z" fill="#2F76AE" />
              <path d="M136 196 L194 296 Q198 301 190 301 L136 301 Z" fill="#2F76AE" />
            </>
          )}
        </g>

        <path
          d={`M70 ${g.engTop} L130 ${g.engTop} L148 ${g.engBottom} Q100 ${g.engFlare} 52 ${g.engBottom} Z`}
          fill="#B9C6D1"
        />

        <rect x="62" y="88" width="76" height={g.bodyH} rx="16" fill="#EDF3F7" />
        <rect x="70" y={g.fuelTop} width="60" height={g.fuelH} rx="11" fill="#F5C044" />

        {parts.nose === "pointed" && (
          <path d="M63 92 L100 16 L137 92 Q100 82 63 92 Z" fill="#F5891F" />
        )}
        {parts.nose === "round" && (
          <path d="M63 92 Q100 30 137 92 Q100 82 63 92 Z" fill="#F5891F" />
        )}
        {parts.nose === "parabolic" && (
          <path d="M63 92 C70 30 130 30 137 92 Q100 82 63 92 Z" fill="#F5891F" />
        )}

        {parts.payload !== "none" && (
          <circle cx="100" cy="126" r={g.payloadR} fill="#5CC47C" />
        )}
      </svg>

      {zoneDefs(parts).map((z) => {
        const s = zoneStyles(z.slot, dragging, over, highlightSlot);
        return (
          <div
            key={z.slot}
            {...zoneHandlers(z.slot, dispatch)}
            className="absolute flex cursor-pointer items-end justify-center rounded-[10px]"
            style={{
              left: z.left,
              top: z.top,
              width: z.width,
              height: z.height,
              border: s.border,
              background: s.bg,
              animation:
                highlightSlot === z.slot
                  ? "rl-glow 1.6s ease-in-out infinite"
                  : undefined,
            }}
          >
            <span
              className="rounded-[5px] px-[7px] py-0.5 text-[10.5px] font-extrabold tracking-[1px]"
              style={{ color: s.labelColor, background: s.labelBg }}
            >
              {z.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
