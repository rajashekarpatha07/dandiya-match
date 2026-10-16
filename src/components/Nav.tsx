"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePendingReceivedCount } from "@/lib/queries/requests";
import { useIsAdmin } from "@/lib/queries/admin";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Map" },
  { href: "/dashboard", label: "Requests" },
  { href: "/profile", label: "Profile" },
];

export function Nav() {
  const pathname = usePathname();
  const { data: pending = 0 } = usePendingReceivedCount();
  const { data: isAdmin = false } = useIsAdmin();

  const navItems = isAdmin ? [...items, { href: "/admin", label: "Admin" }] : items;

  return (
    <nav className="sticky bottom-0 z-30 border-t border-line bg-card/95 backdrop-blur md:top-0 md:bottom-auto md:border-b md:border-t-0">
      <div className="mx-auto flex max-w-3xl items-center justify-around px-2 py-1 md:justify-start md:gap-2 md:px-4">
        <Link
          href="/"
          className="hidden font-display text-lg text-red md:mr-6 md:block"
        >
          Dandiya Match
        </Link>
        {navItems.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex min-h-11 min-w-11 flex-1 items-center justify-center rounded-full px-3 text-sm font-semibold md:flex-none",
                active ? "text-orange-deep" : "text-muted",
              )}
            >
              {item.label}
              {item.href === "/dashboard" && pending > 0 ? (
                <span className="absolute top-1 right-2 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red px-1 text-[10px] text-white md:right-0">
                  {pending > 9 ? "9+" : pending}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
