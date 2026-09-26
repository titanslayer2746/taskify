import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const pages = [
  { to: "/habits", label: "Habits" },
  { to: "/todo", label: "Tasks" },
  { to: "/pomodoro", label: "Focus" },
  { to: "/projects", label: "Projects" },
  { to: "/finance-tracker", label: "Money" },
  { to: "/journal", label: "Journal" },
  { to: "/health", label: "Health" },
  { to: "/sleep", label: "Sleep" },
];

const PaperNavbar: React.FC = () => {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const isActive = (to: string) =>
    pathname === to || pathname.startsWith(`${to}/`);

  const signOut = async () => {
    setSigningOut(true);
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setSigningOut(false);
    }
  };

  const firstName = user?.name?.split(" ")[0];

  return (
    <header className="border-b border-ink/15">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4 sm:px-6">
        <Link
          to="/habits"
          className="paper-focus font-display text-[26px] leading-none tracking-tight"
          onClick={() => setMenuOpen(false)}
        >
          Taskify
        </Link>

        <nav aria-label="Pages" className="hidden lg:block">
          <ul className="flex items-center gap-6">
            {pages.map((page) => (
              <li key={page.to}>
                <Link
                  to={page.to}
                  aria-current={isActive(page.to) ? "page" : undefined}
                  className={`paper-focus relative py-1 text-[15px] transition-colors duration-200 ${
                    isActive(page.to)
                      ? "text-ink after:absolute after:inset-x-0 after:-bottom-[3px] after:h-[2px] after:bg-clay"
                      : "text-ink-soft hover:text-ink"
                  }`}
                >
                  {page.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          {firstName && (
            <span className="font-ledger text-[11px] uppercase tracking-[0.16em] text-ink-faint">
              {firstName}
            </span>
          )}
          <button
            onClick={signOut}
            disabled={signingOut}
            className="paper-focus ink-link text-[15px] text-ink-soft hover:text-ink disabled:opacity-60"
          >
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>

        <button
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="paper-mobile-nav"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="paper-focus -mr-1 p-1 text-ink lg:hidden"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <nav
          id="paper-mobile-nav"
          aria-label="Pages"
          className="border-t border-ink/15 lg:hidden"
        >
          <ul className="mx-auto max-w-6xl px-4 py-2 sm:px-6">
            {pages.map((page, i) => (
              <li key={page.to} className="border-b border-paper-rule last:border-0">
                <Link
                  to={page.to}
                  onClick={() => setMenuOpen(false)}
                  aria-current={isActive(page.to) ? "page" : undefined}
                  className="paper-focus flex items-baseline gap-4 py-3"
                >
                  <span className="w-5 font-ledger text-[11px] text-ink-faint">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={`font-display text-2xl ${
                      isActive(page.to) ? "italic text-clay" : "text-ink"
                    }`}
                  >
                    {page.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mx-auto flex max-w-6xl items-center justify-between border-t border-ink/15 px-4 py-4 sm:px-6">
            <span className="font-ledger text-[11px] uppercase tracking-[0.16em] text-ink-faint">
              {user?.name ?? ""}
            </span>
            <button
              onClick={signOut}
              disabled={signingOut}
              className="paper-focus ink-link text-[15px] text-ink disabled:opacity-60"
            >
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </nav>
      )}
    </header>
  );
};

export default PaperNavbar;
