"use client";

import { Search, Bell } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function TopBar() {
  const { user } = useAuth();

  return (
    <header className="h-14 bg-[#0A0F1E] border-b border-[#1F2937] flex items-center justify-between px-6 shrink-0">
      {/* Search */}
      <div className="relative max-w-xs w-full">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
        />
        <input
          type="text"
          placeholder="Buscar leads..."
          className="w-full bg-[#111827] border border-[#1F2937] rounded-lg pl-9 pr-4 py-2 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-[#3B82F6] transition-colors"
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-[#1F2937] transition-colors">
          <Bell size={16} />
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-xs font-bold text-white">
          {user?.name?.charAt(0)?.toUpperCase() ?? "A"}
        </div>
      </div>
    </header>
  );
}
