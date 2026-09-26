// The eight modules, described as the controls on the Taskify instrument.
// Listed on the landing page.

export type InstrumentModule = {
  code: string;
  name: string;
  control: string;
  line: string;
};

export const MODULES: InstrumentModule[] = [
  { code: "01", name: "Tasks", control: "Key", line: "Write it, rank it, tick it off. Overdue items are flagged." },
  { code: "02", name: "Focus", control: "Dial", line: "A Pomodoro timer with your own focus and break lengths." },
  { code: "03", name: "Projects", control: "Board", line: "Four stages, drag between them. Progress, due dates, tags." },
  { code: "04", name: "Habits", control: "Matrix", line: "Tick today. Every day of the year becomes one lit square." },
  { code: "05", name: "Money", control: "Readout", line: "What came in, what went out, in rupees. Totals and a trend." },
  { code: "06", name: "Sleep", control: "Switch", line: "Check in at lights out, check out when you're up. Hours are worked out." },
  { code: "07", name: "Health", control: "Program", line: "Workout plans by weekday and meal plans, with today highlighted." },
  { code: "08", name: "Journal", control: "Tape", line: "A page a day. Saves itself five seconds after you stop typing." },
];

