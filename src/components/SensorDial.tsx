import React from "react";
import { motion } from "motion/react";
import { LucideIcon } from "lucide-react";

interface SensorDialProps {
  title: string;
  value: number;
  unit: string;
  status: string;
  statusColor: string; // e.g., 'emerald', 'sky', 'rose', 'blue', 'amber', 'teal'
  max: number;
  icon: LucideIcon;
  gradientId: string;
  gradientColors: { stop1: string; stop2: string; stop3?: string };
}

export default function SensorDial({
  title,
  value,
  unit,
  status,
  statusColor,
  max,
  icon: Icon,
  gradientId,
  gradientColors,
}: SensorDialProps) {
  // Translate status color class to tailwind values safely
  const getBadgeClass = (color: string) => {
    switch (color) {
      case "rose":
        return "bg-rose-500/15 text-rose-400 border border-rose-500/25";
      case "sky":
        return "bg-sky-500/15 text-sky-400 border border-sky-500/25";
      case "blue":
        return "bg-blue-500/15 text-blue-400 border border-blue-500/25";
      case "amber":
        return "bg-orange-500/15 text-orange-400 border border-orange-500/25";
      case "teal":
        return "bg-teal-500/15 text-teal-400 border border-teal-500/25";
      case "emerald":
      default:
        return "bg-purple-500/15 text-purple-400 border border-purple-500/25";
    }
  };

  const circumference = 2 * Math.PI * 52;
  const progressRatio = Math.min(Math.max(value / max, 0), 1);
  const strokeDashoffset = circumference * (1 - progressRatio);

  return (
    <div className="bg-[#130f30]/80 border border-[#251c5a]/60 rounded-[28px] p-5 relative overflow-hidden group hover:border-[#3a2d8a]/80 hover:shadow-[0_15px_40px_rgba(12,9,31,0.4)] transition-all duration-300 flex flex-col items-center text-center">
      <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
      
      {/* Header Info */}
      <div className="w-full flex justify-between items-center mb-3">
        <span className="text-[10px] font-bold tracking-wider text-violet-300/50 uppercase font-mono">{title}</span>
        <div className="p-1.5 bg-[#171141] rounded-xl border border-[#271d64] text-violet-300/70">
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* SVG Circular dial */}
      <div className="relative w-32 h-32 flex items-center justify-center mb-4">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background trail */}
          <circle
            cx="64"
            cy="64"
            r="52"
            stroke="rgba(24, 18, 64, 0.65)"
            strokeWidth="7"
            fill="transparent"
            strokeLinecap="round"
          />
          {/* Active ring progress */}
          <motion.circle
            cx="64"
            cy="64"
            r="52"
            stroke={`url(#${gradientId})`}
            strokeWidth="7"
            fill="transparent"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset }}
            transition={{ type: "spring", damping: 15, stiffness: 60 }}
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={gradientColors.stop1} />
              {gradientColors.stop3 ? (
                <>
                  <stop offset="50%" stopColor={gradientColors.stop2} />
                  <stop offset="100%" stopColor={gradientColors.stop3} />
                </>
              ) : (
                <stop offset="100%" stopColor={gradientColors.stop2} />
              )}
            </linearGradient>
          </defs>
        </svg>

        {/* Centered value overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold font-mono tracking-tight text-white">{value}</span>
          <span className="text-[9px] text-violet-350/60 font-mono tracking-wider font-semibold uppercase mt-0.5">{unit}</span>
        </div>
      </div>

      {/* Badge indicators */}
      <div className="w-full text-left pt-2.5 border-t border-[#231a5b] mt-1">
        <div className="flex justify-between items-center text-[10px]">
          <span className="text-violet-300/40 font-medium font-sans">Status Ruang</span>
          <span className={`px-2 py-0.5 rounded-full font-bold font-mono transition-colors duration-300 ${getBadgeClass(statusColor)}`}>
            {status}
          </span>
        </div>
      </div>
    </div>
  );
}
