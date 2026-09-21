import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  description: "That address is not part of Rocket Lab.",
};

/**
 * The root not-found file, so it answers both `notFound()` and any address that
 * matches no route at all. It renders inside the root layout and takes no props.
 */
export default function NotFound() {
  return (
    <div className="flex-1 bg-rl-sky px-[18px] pt-6 pb-14">
      <div className="mx-auto flex max-w-[620px] flex-col gap-[14px]">
        <header className="flex items-center gap-[14px] rounded-2xl bg-rl-navy px-5 py-3 shadow-[0_10px_24px_rgba(16,45,64,.28)]">
          <div className="flex h-10 w-10 flex-none items-center justify-center rounded-[11px] bg-rl-orange">
            <svg viewBox="0 0 32 32" width="24" height="24" aria-hidden="true">
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
          <div className="flex-1">
            <div className="text-[21px] font-black text-white">
              Page not found
            </div>
            <div className="text-[13px] font-bold text-rl-mist">
              Rocket Lab. Error 404.
            </div>
          </div>
        </header>

        <main className="flex flex-col rounded-2xl bg-white/95 p-7 shadow-[0_10px_24px_rgba(16,45,64,.16)]">
          {/* Same vocabulary as the flight stage: dotted trail, pad, green hills. */}
          <div className="overflow-hidden rounded-xl">
            <svg
              viewBox="0 0 560 220"
              className="block h-auto w-full"
              role="img"
              aria-label="A rocket that flew off course and landed nose first in the grass, well past its launch pad."
            >
              <rect x="0" y="0" width="560" height="220" fill="#96D6F2" />

              <g opacity=".85">
                <ellipse cx="118" cy="48" rx="34" ry="12" fill="#FFFFFF" />
                <ellipse cx="143" cy="41" rx="20" ry="10" fill="#FFFFFF" />
                <ellipse cx="392" cy="70" rx="38" ry="13" fill="#FFFFFF" />
                <ellipse cx="420" cy="62" rx="21" ry="10" fill="#FFFFFF" />
              </g>

              <path
                d="M0 168 C 120 150 200 178 300 165 C 400 152 480 176 560 162 L560 220 L0 220 Z"
                fill="#A9DFEF"
                opacity=".75"
              />
              <path
                d="M0 182 C 140 168 240 192 360 180 C 460 170 520 188 560 180 L560 220 L0 220 Z"
                fill="#8ACB84"
              />
              <path
                d="M0 200 C 160 190 300 208 420 198 C 500 191 530 202 560 198 L560 220 L0 220 Z"
                fill="#6FB86C"
              />

              <rect x="52" y="184" width="48" height="13" rx="5" fill="#B6A489" />

              <path
                d="M78 182 Q 292 -34 470 172"
                fill="none"
                stroke="rgba(255,255,255,.85)"
                strokeWidth="5"
                strokeDasharray="3 13"
                strokeLinecap="round"
              />

              <ellipse cx="474" cy="190" rx="30" ry="7" fill="rgba(16,45,64,.13)" />

              <g transform="translate(470 168) rotate(143) scale(.82)">
                <path d="M-10 13 L-23 30 L-10 27 Z" fill="#2F76AE" />
                <path d="M10 13 L23 30 L10 27 Z" fill="#2F76AE" />
                <rect
                  x="-10"
                  y="-14"
                  width="20"
                  height="28"
                  rx="7"
                  fill="#EEF4F8"
                />
                <path d="M-10 -12 L0 -33 L10 -12 Z" fill="#F5891F" />
              </g>
            </svg>
          </div>

          <div className="mt-6 text-[64px] leading-none font-black text-rl-orange">
            404
          </div>

          <h1 className="mt-2 mb-0 text-[24px] leading-[1.2] font-black text-rl-ink">
            This one went off course
          </h1>

          <p className="mt-3 mb-0 text-[15px] leading-[1.6] font-bold text-rl-body">
            There is no page at that address. Either the link was mistyped, or it
            pointed somewhere Rocket Lab does not go. Nothing is broken and your
            best scores are untouched.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-[14px]">
            <Link
              href="/"
              className="rounded-xl bg-rl-orange px-[26px] py-[13px] text-[16px] font-black tracking-[.4px] text-white no-underline shadow-[0_6px_14px_rgba(216,110,15,.45),inset_0_1px_0_rgba(255,255,255,.6)] transition-transform duration-[120ms] hover:-translate-y-0.5 hover:text-white active:translate-y-0.5"
            >
              Back to the launch pad
            </Link>
            <Link href="/privacy" className="text-[14px] font-extrabold">
              Privacy policy
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
