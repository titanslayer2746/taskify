import React from "react";

const Kicker: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="font-ledger text-[11px] uppercase tracking-[0.18em] text-ink-soft">
    {children}
  </p>
);

// A sample day on a ruled notebook page: tasks, focus, habits, money, sleep, a journal line.
const TodayPage: React.FC<{ date: Date }> = ({ date }) => {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const heading = date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  const todos = [
    { text: "Send the invoice", done: true },
    { text: "Outline chapter three", done: true },
    { text: "Call about the lease", done: false },
    { text: "Groceries: oats, lemons", done: false },
  ];

  const habits = [
    { name: "Read", week: [1, 1, 0, 1, 1, 1, 0] },
    { name: "Run", week: [1, 0, 1, 0, 1, 0, 0] },
    { name: "No phone in bed", week: [0, 1, 1, 1, 0, 1, 0] },
  ];

  return (
    <div className="relative mx-auto w-full max-w-md rotate-[0.8deg]">
      {/* sheet underneath */}
      <div className="absolute inset-0 -rotate-[2.2deg] rounded-[3px] bg-paper-deep shadow-[0_1px_0_#d3cdb7]" />
      <div className="relative rounded-[3px] bg-[#F9F7EF] shadow-[0_1px_0_#d3cdb7,0_30px_60px_-30px_rgba(20,45,30,0.4)]">
        <div className="paper-ruled relative px-6 pb-8 pl-14 pt-6 font-paper text-ink sm:pl-16">
          {/* margin line */}
          <div className="absolute bottom-0 left-10 top-0 w-px bg-clay/40 sm:left-12" />

          <div className="flex h-16 items-end justify-between pb-[6px]">
            <span className="font-display text-3xl italic leading-none text-ink">
              {heading}
            </span>
            <span className="font-ledger text-[11px] text-ink-faint">p. {dayOfYear}</span>
          </div>

          <div className="flex h-8 items-end pb-[5px]">
            <Kicker>To do</Kicker>
          </div>
          <ul>
            {todos.map((t) => (
              <li key={t.text} className="flex h-8 items-end gap-3 pb-[5px]">
                <span
                  className={`mb-[3px] grid h-3.5 w-3.5 shrink-0 place-items-center border border-ink ${
                    t.done ? "bg-ink" : ""
                  }`}
                >
                  {t.done && (
                    <svg viewBox="0 0 10 10" className="h-2.5 w-2.5 text-paper">
                      <path
                        d="M1.5 5.5l2.2 2.2L8.5 2.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                      />
                    </svg>
                  )}
                </span>
                <span
                  className={`text-[15px] ${
                    t.done
                      ? "text-ink-faint line-through decoration-clay decoration-[1.5px]"
                      : "text-ink"
                  }`}
                >
                  {t.text}
                </span>
              </li>
            ))}
          </ul>

          <div className="flex h-8 items-end justify-between pb-[5px]">
            <Kicker>Focus</Kicker>
            <span className="flex items-center gap-1.5">
              {[1, 1, 1, 0].map((f, i) => (
                <span
                  key={i}
                  className={`h-3 w-3 rounded-full border border-clay ${f ? "bg-clay" : ""}`}
                />
              ))}
              <span className="ml-2 font-ledger text-[11px] text-ink-soft">3 × 25 min</span>
            </span>
          </div>

          <div className="flex h-8 items-end pb-[5px]">
            <Kicker>Habits · this week</Kicker>
          </div>
          {habits.map((h) => (
            <div key={h.name} className="flex h-8 items-end justify-between pb-[6px]">
              <span className="text-[15px] text-ink">{h.name}</span>
              <span className="flex gap-1">
                {h.week.map((d, i) => (
                  <span
                    key={i}
                    className={`h-3 w-3 rounded-[2px] ${
                      d ? "bg-ink" : "border border-ink/25"
                    }`}
                  />
                ))}
              </span>
            </div>
          ))}

          <div className="flex h-8 items-end justify-between pb-[5px]">
            <Kicker>Spent</Kicker>
            <span className="font-ledger text-[13px] text-ink">
              ₹640 <span className="text-ink-faint">· lunch, auto, a book</span>
            </span>
          </div>
          <div className="flex h-8 items-end justify-between pb-[5px]">
            <Kicker>Slept</Kicker>
            <span className="font-ledger text-[13px] text-ink">
              7h 10m <span className="text-ink-faint">· rested</span>
            </span>
          </div>

          <div className="flex h-16 items-end pb-[5px]">
            <p className="font-display text-xl italic leading-8 text-ink-soft">
              Slow morning, good afternoon. Finally finished the outline.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodayPage;
