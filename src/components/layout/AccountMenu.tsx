"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LogOut, User } from "lucide-react";
import type { NavAuthState } from "@/lib/auth/nav-state";
import { signOutAction } from "@/lib/auth/actions";
import { FREE_PLAN_ID } from "@/lib/plans/types";
import { cn } from "@/lib/utils";

export function AccountMenu({ authState }: { authState: NavAuthState }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const initial = (authState.displayName || authState.email || "?").charAt(0).toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg py-1.5 pl-1.5 pr-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-semibold text-white">
          {initial}
        </span>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-semibold",
            // slate-600, not slate-500: on the slate-100 pill the lighter
            // shade measures 4.35:1, just under the AA floor. Only visible
            // while signed in, which is why the anonymous page audits
            // never caught it.
            authState.planId === FREE_PLAN_ID ? "bg-slate-100 text-slate-600" : "bg-emerald-100 text-emerald-700",
          )}
        >
          {authState.planLabel}
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg shadow-slate-900/[0.06]"
        >
          {authState.email && (
            <p className="truncate px-3 py-1.5 text-xs text-slate-400">{authState.email}</p>
          )}
          <Link
            href="/cuenta"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
            role="menuitem"
          >
            <User className="h-4 w-4" />
            Mi cuenta
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
              role="menuitem"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
