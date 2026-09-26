import React from "react";
import type { SleepChartProps } from "@/services/types";

const lastSevenDays = () =>
  Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    // Sleep entries are keyed by UTC date, so match that here.
    return date.toISOString().split("T")[0];
  });

// Hours slept on each of the last seven nights, with the week's average.
const SleepChart: React.FC<SleepChartProps> = ({ sleepEntries }) => {
  const entries = Array.isArray(sleepEntries) ? sleepEntries : [];

  const data = lastSevenDays().map((date) => {
    const minutes = entries
      .filter((e) => e.date === date && !e.isActive && e.duration)
      .reduce((sum, e) => sum + (e.duration || 0), 0);
    return {
      date,
      hours: Math.round((minutes / 60) * 10) / 10,
      day: new Date(date).toLocaleDateString("en-GB", { weekday: "short" }),
    };
  });

  const logged = data.filter((d) => d.hours > 0);
  const average = logged.length
    ? logged.reduce((sum, d) => sum + d.hours, 0) / logged.length
    : 0;
  const max = Math.max(9, ...data.map((d) => d.hours));

  return (
    <figure>
      <div
        className="relative h-48"
        role="img"
        aria-label={`Hours slept over the last seven nights. ${
          logged.length ? `Average ${average.toFixed(1)} hours.` : "No nights logged."
        }`}
      >
        {[0, 3, 6, 9].map((h) => (
          <div
            key={h}
            className="absolute inset-x-0 border-t border-paper-rule"
            style={{ bottom: `${(h / max) * 100}%` }}
          >
            <span className="absolute -top-2 left-0 bg-transparent font-ledger text-[10px] text-ink-faint">
              {h}h
            </span>
          </div>
        ))}

        {average > 0 && (
          <div
            className="absolute inset-x-0 border-t border-dashed border-clay"
            style={{ bottom: `${(average / max) * 100}%` }}
          >
            <span className="absolute -top-5 right-0 font-ledger text-[10px] uppercase tracking-[0.12em] text-clay">
              avg {average.toFixed(1)}h
            </span>
          </div>
        )}

        <div className="absolute inset-0 left-8 flex items-end justify-around gap-2">
          {data.map((d) => (
            <div
              key={d.date}
              className="group relative flex h-full w-full max-w-[2.5rem] items-end"
              title={`${d.day}: ${d.hours ? `${d.hours}h` : "not logged"}`}
            >
              <div
                className={`w-full rounded-t-[4px] transition-colors ${
                  d.hours ? "bg-ink group-hover:bg-ink/80" : ""
                }`}
                style={{ height: `${(d.hours / max) * 100}%` }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="ml-8 mt-2 flex justify-around gap-2 border-t border-ink pt-2">
        {data.map((d) => (
          <div key={d.date} className="w-full max-w-[2.5rem] text-center">
            <p className="font-ledger text-[10px] uppercase tracking-[0.12em] text-ink-faint">
              {d.day}
            </p>
            <p className="font-ledger text-xs tabular-nums">
              {d.hours ? `${d.hours}h` : "—"}
            </p>
          </div>
        ))}
      </div>
    </figure>
  );
};

export default SleepChart;
