"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="home-nav">
      <div className="home-nav-inner">
        <Link href="/" className="home-logo">
          sEAFOOD  MARKET
        </Link>
        <div className="home-nav-links">
          <Link 
            href="/claim" 
            className={`home-nav-link ${pathname === '/claim' ? 'home-nav-link-active' : ''}`}
          >
            CLAIM AGENT
          </Link>
          <Link
            href="/directory"
            className={`home-nav-link ${pathname === '/directory' ? 'home-nav-link-active' : ''}`}
          >
            DIRECTORY
          </Link>

          <Link 
            href="/dashboard" 
            className={`home-nav-link ${pathname === '/dashboard' ? 'home-nav-link-active' : ''}`}
          >
            DASHBOARD
          </Link>
        </div>
      </div>
    </nav>
  );
}
