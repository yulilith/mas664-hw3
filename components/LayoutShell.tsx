"use client";

import { usePathname } from "next/navigation";
import Nav from "./Nav";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <div className="home-page">
      <Nav />
      {isHome ? (
        children
      ) : (
        <div className="page-content">
          <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
        </div>
      )}
    </div>
  );
}
