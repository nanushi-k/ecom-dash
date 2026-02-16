"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/hooks/use-theme";
import { classNames } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Orders", href: "/dashboard/orders" },
  { name: "Products", href: "/dashboard/products" },
  { name: "Settings", href: "/dashboard/settings" },
];

export default function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme, mounted } = useTheme();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* Mobile header */}
      <div className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 lg:hidden">
        <button onClick={() => setOpen(true)} className="text-gray-600 dark:text-gray-400">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500 text-white text-xs font-bold">
          E
        </span>
        <span className="text-sm font-bold text-gray-900 dark:text-white">ecom-dash</span>
      </div>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-gray-900 dark:bg-gray-950 flex flex-col">
            <div className="flex h-14 items-center justify-between px-4 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500 text-white text-xs font-bold">
                  E
                </span>
                <span className="text-sm font-bold text-white">ecom-dash</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-gray-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={classNames(
                    "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-brand-500/10 text-brand-400"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="border-t border-gray-800 p-3 space-y-1">
              {mounted && (
                <button
                  onClick={toggleTheme}
                  className="flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
                >
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </button>
              )}
              <button
                onClick={handleSignOut}
                className="flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-red-400 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
