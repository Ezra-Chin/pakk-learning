import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "Rocket Lab runs entirely in your browser. No accounts, no cookies, no tracking.",
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="m-0 text-[18px] font-black">{title}</h2>
      {children}
    </section>
  );
}

function P({ children }: { children: ReactNode }) {
  return (
    <p className="m-0 text-[15px] leading-[1.6] font-bold text-rl-body">
      {children}
    </p>
  );
}

export default function PrivacyPolicy() {
  return (
    <div className="flex-1 bg-rl-sky px-[18px] pt-6 pb-14">
      <div className="mx-auto flex max-w-[760px] flex-col gap-[14px]">
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
              Privacy policy
            </div>
            <div className="text-[13px] font-bold text-rl-mist">
              Rocket Lab. Last updated 10 September 2026.
            </div>
          </div>
          <Link
            href="/"
            className="rounded-[9px] bg-white/16 px-[14px] py-2 text-[13.5px] font-extrabold text-white no-underline hover:text-white"
          >
            Back to the game
          </Link>
        </header>

        <main className="flex flex-col gap-[22px] rounded-2xl bg-white/95 px-7 py-[26px] shadow-[0_10px_24px_rgba(16,45,64,.16)]">
          <Section title="The short version">
            <P>
              Rocket Lab runs entirely in your browser. We do not ask for your
              name, email or age, we do not run accounts, and we do not send
              your play data anywhere. There is no server behind the game.
            </P>
          </Section>

          <Section title="What the game stores">
            <P>
              One item, saved in your browser local storage under the key
              rocketlab.bests.v2. It holds your best score for each challenge
              and the rocket parts that scored it, so the game can tell you what
              you changed between attempts.
            </P>
            <P>
              That data never leaves your device. Clear your browser storage for
              this site and it is gone. Nobody else can read it.
            </P>
          </Section>

          <Section title="Cookies and tracking">
            <P>
              None. No cookies, no analytics, no advertising, no fingerprinting,
              no third party pixels.
            </P>
          </Section>

          <Section title="Third party requests">
            <P>
              None. The page uses Arial, a font already on your device, so no
              external font or script is fetched. Everything the game needs,
              including the rocket art and the physics model, is part of the
              page.
            </P>
          </Section>

          <Section title="Children">
            <P>
              Rocket Lab is built for students aged roughly 8 to 15 and collects
              no personal information from anyone, so there is nothing for a
              parent, teacher or school to opt out of.
            </P>
          </Section>

          <Section title="Changes">
            <P>
              If the game ever stores or sends something new, this page changes
              first and the date at the top updates with it.
            </P>
          </Section>

          <Section title="Contact">
            <P>
              <a
                href="mailto:ezrachin05@gmail.com"
                className="text-rl-navy underline"
              >
                ezrachin05@gmail.com
              </a>
            </P>
          </Section>
        </main>
      </div>
    </div>
  );
}
