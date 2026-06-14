import { Link } from "@tanstack/react-router";
import { Menu, Search, User, Globe } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full bg-emirates text-emirates-foreground shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-2xl tracking-tight">Emirates</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          <Link to="/" className="hover:underline">Plan and book</Link>
          <a className="hover:underline" href="#">Experience</a>
          <a className="hover:underline" href="#">Where we fly</a>
          <a className="hover:underline" href="#">Manage</a>
          <a className="hover:underline" href="#">Help</a>
        </nav>
        <div className="flex items-center gap-4">
          <button className="hidden items-center gap-1 text-sm hover:underline md:inline-flex">
            <Globe className="h-4 w-4" /> NG / EN
          </button>
          <button className="hover:opacity-90"><Search className="h-5 w-5" /></button>
          <button className="hover:opacity-90"><User className="h-5 w-5" /></button>
          <button className="md:hidden"><Menu className="h-5 w-5" /></button>
        </div>
      </div>
    </header>
  );
}
