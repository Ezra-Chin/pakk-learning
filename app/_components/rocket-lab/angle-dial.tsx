/** Protractor read-out for the launch angle. A pure function of `angle`. */

const CX = 30;
const CY = 76;
/** Rim radius. */
const R = 56;
/** Radius of the shaded wedge, kept inside the rim. */
const WEDGE_R = 40;

const TICKS = [0, 15, 30, 45, 60, 75, 90];

function polar(deg: number, r: number) {
  const a = (deg * Math.PI) / 180;
  return { x: CX + r * Math.cos(a), y: CY - r * Math.sin(a) };
}

const round = (n: number) => Math.round(n * 10) / 10;

/** Counter-clockwise on screen, so the sweep flag is 0. Never exceeds 90deg. */
function arc(from: number, to: number, r: number) {
  const a = polar(from, r);
  const b = polar(to, r);
  return `M ${round(a.x)} ${round(a.y)} A ${r} ${r} 0 0 0 ${round(b.x)} ${round(b.y)}`;
}

export function AngleDial({ angle }: { angle: number }) {
  const tip = polar(angle, R - 4);
  const wedgeEnd = polar(angle, WEDGE_R);

  return (
    <svg
      viewBox="12 2 82 82"
      className="mx-auto block h-[92px] w-[92px]"
      aria-hidden="true"
    >
      {/* Angle measured up from the ground. */}
      <path
        d={`M ${CX} ${CY} L ${CX + WEDGE_R} ${CY} A ${WEDGE_R} ${WEDGE_R} 0 0 0 ${round(wedgeEnd.x)} ${round(wedgeEnd.y)} Z`}
        fill="rgba(240,128,26,.16)"
      />

      {/* Protractor rim, with the reachable 35-90 band picked out. */}
      <path d={arc(0, 90, R)} fill="none" stroke="#DCE6ED" strokeWidth="2" />
      <path d={arc(35, 90, R)} fill="none" stroke="#B9C6D1" strokeWidth="2" />

      {TICKS.map((deg) => {
        const major = deg === 45 || deg === 90;
        const a = polar(deg, R - (major ? 9 : 5));
        const b = polar(deg, R);
        return (
          <line
            key={deg}
            x1={round(a.x)}
            y1={round(a.y)}
            x2={round(b.x)}
            y2={round(b.y)}
            stroke={major ? "#8DA2B2" : "#C9D6DF"}
            strokeWidth={major ? 2 : 1.5}
          />
        );
      })}

      <text
        x={CX}
        y="11"
        textAnchor="middle"
        fontSize="9"
        fontWeight="800"
        fill="#7C93A4"
      >
        90
      </text>
      <text
        x={round(polar(45, R + 12).x)}
        y={round(polar(45, R + 12).y) + 3}
        textAnchor="middle"
        fontSize="9"
        fontWeight="800"
        fill="#7C93A4"
      >
        45
      </text>

      {/* Ground. */}
      <line
        x1="16"
        y1={CY}
        x2={CX + R + 6}
        y2={CY}
        stroke="#6FB86C"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* The rocket's heading. */}
      <line
        x1={CX}
        y1={CY}
        x2={round(tip.x)}
        y2={round(tip.y)}
        stroke="#F0801A"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M -3.5 3.5 L 0 -5.5 L 3.5 3.5 Z"
        fill="#F5891F"
        transform={`translate(${round(tip.x)} ${round(tip.y)}) rotate(${90 - angle})`}
      />
      <circle cx={CX} cy={CY} r="3.5" fill="#2C485C" />
    </svg>
  );
}
