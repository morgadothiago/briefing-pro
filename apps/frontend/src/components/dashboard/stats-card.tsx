import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: string;
}

export function StatsCard({
  label,
  value,
  icon: Icon,
  iconColor = "text-[#3B82F6]",
  iconBg = "bg-[#3B82F6]/10",
}: StatsCardProps) {
  return (
    <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 hover:-translate-y-0.5 transition-all duration-200 hover:shadow-lg hover:shadow-black/30 hover:border-[#3B82F6]/20">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-2">{label}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", iconBg)}>
          <Icon size={20} className={iconColor} />
        </div>
      </div>
    </div>
  );
}
