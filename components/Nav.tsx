"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/directory", label: "Directory" },
  { href: "/proposals", label: "Proposals" },
  { href: "/activity", label: "Activity" },
  { href: "/claim", label: "Claim Agent" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-[#30363d] bg-[#0d1117]">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold">
          <span className="text-2xl">🐾</span>
          <span>Animal Society</span>
        </Link>
        <div className="flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                pathname === link.href
                  ? "bg-[#21262d] text-white"
                  : "text-[#9ca3af] hover:text-white hover:bg-[#161b22]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
