import React from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

const paperFieldClass = (hasError: boolean) =>
  `w-full border-0 border-b bg-transparent px-0 py-2.5 text-lg text-ink placeholder:text-ink-faint/70 focus:outline-none focus:ring-0 transition-colors duration-200 ${
    hasError ? "border-clay focus:border-clay" : "border-ink/30 focus:border-ink"
  }`;

const PaperLabel: React.FC<{
  htmlFor: string;
  children: React.ReactNode;
}> = ({ htmlFor, children }) => (
  <label
    htmlFor={htmlFor}
    className="font-ledger text-[11px] uppercase tracking-[0.16em] text-ink-soft"
  >
    {children}
  </label>
);

export const PaperError: React.FC<{ id: string; message?: string }> = ({
  id,
  message,
}) =>
  message ? (
    <p id={id} className="mt-2 text-sm text-[#8A4526]">
      {message}
    </p>
  ) : null;

export const PaperAlert: React.FC<{ message?: string }> = ({ message }) =>
  message ? (
    <p
      role="alert"
      className="border-l-2 border-clay bg-clay/10 px-3 py-2.5 text-[15px] text-[#8A4526]"
    >
      {message}
    </p>
  ) : null;

type PaperInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  name: string;
  label: string;
  error?: string;
  labelAside?: React.ReactNode;
};

export const PaperInput: React.FC<PaperInputProps> = ({
  name,
  label,
  error,
  labelAside,
  ...rest
}) => (
  <div>
    <div className="flex items-baseline justify-between">
      <PaperLabel htmlFor={name}>{label}</PaperLabel>
      {labelAside}
    </div>
    <input
      id={name}
      name={name}
      aria-invalid={!!error}
      aria-describedby={error ? `${name}-error` : undefined}
      className={paperFieldClass(!!error)}
      {...rest}
    />
    <PaperError id={`${name}-error`} message={error} />
  </div>
);

export const PaperPasswordInput: React.FC<
  Omit<PaperInputProps, "type"> & { children?: React.ReactNode }
> = ({ name, label, error, labelAside, children, ...rest }) => {
  const [visible, setVisible] = React.useState(false);
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <PaperLabel htmlFor={name}>{label}</PaperLabel>
        {labelAside}
      </div>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={visible ? "text" : "password"}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
          className={`${paperFieldClass(!!error)} pr-10`}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="paper-focus absolute right-0 top-1/2 -translate-y-1/2 p-1 text-ink-faint transition-colors duration-200 hover:text-ink"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {children}
      <PaperError id={`${name}-error`} message={error} />
    </div>
  );
};

export const PaperSubmit: React.FC<{
  loading: boolean;
  loadingLabel: string;
  children: React.ReactNode;
}> = ({ loading, loadingLabel, children }) => (
  <button
    type="submit"
    disabled={loading}
    className="paper-focus group flex w-full items-center justify-center gap-3 rounded-sm bg-ink px-6 py-3.5 text-[15px] font-medium text-paper transition-colors duration-200 hover:bg-clay disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:bg-ink"
  >
    {loading ? (
      <>
        <Loader2 className="h-4 w-4 animate-spin" />
        {loadingLabel}
      </>
    ) : (
      <>
        {children}
        <ArrowRight
          size={16}
          className="transition-transform duration-200 group-hover:translate-x-0.5"
        />
      </>
    )}
  </button>
);

type PaperAuthLayoutProps = {
  kicker: string;
  heading: React.ReactNode;
  headerPrompt: string;
  headerLink: { to: string; label: string };
  formTitle: string;
  children: React.ReactNode;
};

export const PaperAuthLayout: React.FC<PaperAuthLayoutProps> = ({
  kicker,
  heading,
  headerPrompt,
  headerLink,
  formTitle,
  children,
}) => {
  const reduce = useReducedMotion();
  return (
    <div className="paper-grain flex min-h-screen flex-col overflow-x-clip font-paper text-ink antialiased selection:bg-clay/20">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Link
          to="/"
          className="paper-focus font-display text-[28px] leading-none tracking-tight"
        >
          Taskify
        </Link>
        <p className="text-[15px] text-ink-soft">
          <span className="hidden sm:inline">{headerPrompt} </span>
          <Link to={headerLink.to} className="paper-focus ink-link text-ink">
            {headerLink.label}
          </Link>
        </p>
      </header>

      <main className="mx-auto grid w-full max-w-6xl flex-1 content-start items-center gap-12 px-4 pb-16 pt-8 sm:px-6 lg:grid-cols-12 lg:content-center lg:gap-10 lg:pb-24">
        <motion.div
          className="lg:col-span-6"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
        >
          <p className="mb-6 font-ledger text-[11px] uppercase tracking-[0.18em] text-ink-soft">
            — {kicker}
          </p>
          <h1 className="font-display text-[3.25rem] leading-[0.95] tracking-[-0.02em] sm:text-7xl lg:text-[5.25rem]">
            {heading}
          </h1>
        </motion.div>

        <motion.div
          className="lg:col-span-5 lg:col-start-8"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.1 }}
        >
          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute inset-0 -rotate-[1.6deg] rounded-[3px] bg-paper-deep shadow-[0_1px_0_#d3cdb7]" />
            <div className="relative rounded-[3px] bg-[#F9F7EF] shadow-[0_1px_0_#d3cdb7,0_30px_60px_-30px_rgba(20,45,30,0.4)]">
              <div className="absolute bottom-0 left-8 top-0 w-px bg-clay/40 sm:left-10" />
              <div className="relative space-y-7 py-9 pl-14 pr-7 sm:pl-16 sm:pr-9">
                <div className="flex items-baseline justify-between">
                  <h2 className="font-display text-3xl italic leading-none">
                    {formTitle}
                  </h2>
                  <span className="font-ledger text-[11px] text-ink-faint">
                    p. 1
                  </span>
                </div>
                {children}
              </div>
            </div>
          </div>

          <p className="mt-10 text-center">
            <Link
              to="/"
              className="paper-focus inline-flex items-center gap-2 font-ledger text-[11px] uppercase tracking-[0.16em] text-ink-soft transition-colors duration-200 hover:text-ink"
            >
              <ArrowLeft size={14} />
              Back to the front page
            </Link>
          </p>
        </motion.div>
      </main>
    </div>
  );
};
