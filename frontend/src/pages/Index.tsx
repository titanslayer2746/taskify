import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { MODULES } from "@/components/landing/modules";
import TodayPage from "@/components/landing/TodayPage";

const SPECS: { label: string; value: string }[] = [
  { label: "Platform", value: "Web browser, on any device" },
  { label: "Storage", value: "Saved to your account" },
  { label: "Sign-in", value: "Email and password, with an emailed code to verify" },
  { label: "Focus timer", value: "Focus, short break, long break and set length, all adjustable" },
  { label: "Habit view", value: "One square per day, the whole year" },
  { label: "Projects", value: "Four stages, drag and drop between them" },
  { label: "Currency", value: "Indian rupee (₹)" },
  { label: "Sleep", value: "Check in, check out, quality from 1 to 5" },
  { label: "Journal", value: "Saves 5 s after you stop typing, up to 7 tags" },
  { label: "Assistant", value: "Drafts entries for you to confirm (Gemini)" },
];

const Label: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <p
    className={`font-readout text-[11px] font-medium uppercase tracking-[0.14em] ${className}`}
  >
    {children}
  </p>
);

const SignalButton: React.FC<{ to: string; children: React.ReactNode; large?: boolean }> = ({
  to,
  children,
  large,
}) => (
  <Link
    to={to}
    className={`group inline-flex items-center gap-3 bg-signal font-grotesk font-semibold text-graphite transition-colors hover:bg-graphite hover:text-signal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-graphite ${
      large ? "px-8 py-5 text-lg" : "px-5 py-3 text-[15px]"
    }`}
  >
    {children}
    <ArrowRight
      size={large ? 20 : 16}
      className="transition-transform duration-200 group-hover:translate-x-1"
    />
  </Link>
);

// Crop marks at the corners of a figure, like a printed spec sheet.
const CropMarks: React.FC = () => (
  <>
    {[
      "left-3 top-3 border-l border-t",
      "right-3 top-3 border-r border-t",
      "bottom-3 left-3 border-b border-l",
      "bottom-3 right-3 border-b border-r",
    ].map((pos) => (
      <span
        key={pos}
        aria-hidden="true"
        className={`pointer-events-none absolute h-4 w-4 border-graphite ${pos}`}
      />
    ))}
  </>
);

const Index = () => {
  return (
    <div className="min-h-screen bg-shell font-grotesk text-graphite antialiased selection:bg-signal selection:text-graphite">
      {/* Header */}
      <header className="border-b border-graphite">
        <div className="mx-auto flex max-w-[1320px] items-center justify-between px-4 py-4 sm:px-6">
          <Link
            to="/"
            className="flex items-baseline gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
          >
            <span className="text-xl font-bold tracking-[-0.04em]">TASKIFY</span>
            <span className="font-readout text-[11px] font-medium text-graphite-faint">TK-08</span>
          </Link>
          <nav className="flex items-center gap-5">
            <Link
              to="/signin"
              className="font-readout text-[12px] font-medium uppercase tracking-[0.12em] text-graphite-soft underline-offset-4 hover:text-graphite hover:underline"
            >
              Sign in
            </Link>
            <SignalButton to="/signup">Get started</SignalButton>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="border-b border-graphite">
          <div className="mx-auto grid max-w-[1320px] lg:grid-cols-12">
            <div className="flex flex-col justify-between gap-12 border-graphite px-4 py-12 sm:px-6 lg:col-span-5 lg:border-r lg:py-16 lg:pr-10">
              <Label className="text-graphite-soft">[ 00 ] Personal instrument</Label>

              <div>
                <h1 className="text-[3.6rem] font-semibold leading-[0.88] tracking-[-0.05em] sm:text-[5.2rem] lg:text-[5.6rem] xl:text-[6.4rem]">
                  One instrument for the whole day<span className="text-signal">.</span>
                </h1>
                <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
                  <SignalButton to="/signup">Get started</SignalButton>
                  <Link
                    to="/signin"
                    className="font-readout text-[12px] font-medium uppercase tracking-[0.12em] underline underline-offset-4 hover:text-signal"
                  >
                    I have an account
                  </Link>
                </div>
              </div>

              <dl className="grid grid-cols-2 border-t border-graphite">
                {[
                  ["Modules", "08"],
                  ["Runs in", "Browser"],
                  ["Saved to", "Account"],
                  ["Assistant", "Built in"],
                ].map(([k, v], i) => (
                  <div
                    key={k}
                    className={`border-b border-shell-rule py-3 ${
                      i % 2 === 0 ? "pr-4" : "border-l pl-4"
                    }`}
                  >
                    <dt className="font-readout text-[10px] uppercase tracking-[0.14em] text-graphite-faint">
                      {k}
                    </dt>
                    <dd className="mt-1 text-lg font-medium tracking-tight">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <figure className="relative overflow-hidden bg-shell-light lg:col-span-7">
              <CropMarks />
              <figcaption className="absolute left-7 top-7 z-10">
                <Label className="text-graphite-soft">Fig. 01 — A day, on one page</Label>
              </figcaption>
              <div className="flex h-full items-center justify-center px-6 py-20 sm:px-12">
                <TodayPage date={new Date()} />
              </div>
            </figure>
          </div>
        </section>

        {/* Controls */}
        <section id="controls" aria-labelledby="controls-heading" className="border-b border-graphite">
          <div className="mx-auto max-w-[1320px] px-4 sm:px-6">
            <div className="grid gap-6 py-12 lg:grid-cols-12 lg:py-16">
              <Label className="text-graphite-soft lg:col-span-5">[ 01 ] Controls</Label>
              <h2
                id="controls-heading"
                className="text-4xl font-semibold leading-[0.95] tracking-[-0.04em] sm:text-6xl lg:col-span-7"
              >
                Eight modules. One layout<span className="text-signal">.</span>
              </h2>
            </div>

            <ol className="grid border-l border-t border-graphite sm:grid-cols-2 lg:grid-cols-4">
              {MODULES.map((m) => (
                  <li
                    key={m.code}
                    id={`module-${m.code}`}
                    className="flex min-h-[15rem] flex-col justify-between border-b border-r border-graphite bg-shell p-6 transition-colors duration-300 hover:bg-shell-light"
                  >
                    <div className="flex items-start justify-between">
                      <span className="font-readout text-4xl font-bold tracking-tight">
                        {m.code}
                      </span>
                      <span
                        className="border border-graphite/30 px-2 py-0.5 font-readout text-[10px] uppercase tracking-[0.14em] text-graphite-soft"
                      >
                        {m.control}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-3xl font-semibold tracking-[-0.03em]">{m.name}</h3>
                      <p className="mt-2 text-[15px] leading-snug text-graphite-soft">
                        {m.line}
                      </p>
                    </div>
                  </li>
              ))}
            </ol>
            <div className="h-12 lg:h-16" />
          </div>
        </section>

        {/* Specifications */}
        <section id="specs" aria-labelledby="specs-heading" className="border-b border-graphite">
          <div className="mx-auto grid max-w-[1320px] gap-10 px-4 py-12 sm:px-6 lg:grid-cols-12 lg:py-16">
            <div className="lg:col-span-5">
              <Label className="text-graphite-soft">[ 02 ] Specifications</Label>
              <h2
                id="specs-heading"
                className="mt-6 text-4xl font-semibold leading-[0.95] tracking-[-0.04em] sm:text-6xl"
              >
                On the label<span className="text-signal">.</span>
              </h2>
            </div>
            <dl className="border-t border-graphite lg:col-span-7">
              {SPECS.map((row) => (
                <div
                  key={row.label}
                  className="grid grid-cols-[8.5rem_1fr] gap-4 border-b border-shell-rule py-3.5 sm:grid-cols-[11rem_1fr]"
                >
                  <dt className="font-readout text-[11px] uppercase tracking-[0.12em] text-graphite-faint">
                    {row.label}
                  </dt>
                  <dd className="text-[15px]">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Closing */}
        <section className="bg-graphite text-shell">
          <div className="mx-auto flex max-w-[1320px] flex-col items-start justify-between gap-10 px-4 py-20 sm:px-6 lg:flex-row lg:items-end lg:py-28">
            <div>
              <Label className="text-shell/60">[ 03 ] Power</Label>
              <p className="mt-6 text-[4rem] font-semibold leading-[0.88] tracking-[-0.05em] sm:text-[6rem] lg:text-[8rem]">
                Switch it on<span className="text-signal">.</span>
              </p>
            </div>
            <SignalButton to="/signup" large>
              Get started
            </SignalButton>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
