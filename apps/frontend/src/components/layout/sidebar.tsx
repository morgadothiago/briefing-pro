"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Kanban,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Pipeline", href: "/dashboard/pipeline", icon: Kanban },
  { label: "Leads", href: "/dashboard/leads", icon: Users },
  { label: "Configurações", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-[#0A0F1E] border-r border-[#1F2937] shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-[#1F2937]">
        <span className="text-lg font-bold text-white">
          Briefing<span className="text-[#3B82F6]">Pro</span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#3B82F6] ml-1 mb-1 align-middle" />
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
                isActive
                  ? "bg-[#3B82F6]/10 text-white border-l-2 border-[#3B82F6] pl-[10px]"
                  : "text-gray-400 hover:bg-[#1F2937]/60 hover:text-white"
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="px-3 py-4 border-t border-[#1F2937]">
        <div className="px-3 py-2 mb-1">
          <p className="text-xs font-medium text-white truncate">
            {user?.name ?? "Admin"}
          </p>
          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-red-900/20 hover:text-red-400 transition-colors"
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </aside>
  );
}
