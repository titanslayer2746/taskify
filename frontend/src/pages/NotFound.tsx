import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="paper-grain flex min-h-screen items-center justify-center px-4 font-paper text-ink antialiased">
      <div className="max-w-md text-center">
        <p className="font-ledger text-[11px] uppercase tracking-[0.18em] text-ink-soft">
          p. 404
        </p>
        <h1 className="mt-4 font-display text-6xl leading-none">
          A page <span className="italic">torn out.</span>
        </h1>
        <p className="mt-4 text-ink-soft">
          There's nothing at <span className="font-ledger text-sm">{location.pathname}</span>.
        </p>
        <Link
          to="/"
          className="paper-focus mt-8 inline-block rounded-sm bg-ink px-5 py-2.5 text-[15px] font-medium text-paper transition-colors hover:bg-clay"
        >
          Back to the front page
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
