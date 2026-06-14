import React from "react";
import { LucideIcon } from "lucide-react";

interface RelaySwitchProps {
  title: string;
  relayNum: number;
  value: number; // 0 or 1
  icon: LucideIcon;
  colorType?: "cyan" | "emerald" | "orange" | "purple";
  onToggle: (num: number, targetState: number) => void;
  description?: string;
  deviceText?: string;
}

export default function RelaySwitch({
  title,
  relayNum,
  value,
  icon: Icon,
  colorType = "cyan",
  onToggle,
  description = "Lorem ipsum dolor sit amet, consectetur.",
  deviceText,
}: RelaySwitchProps) {
  const isActive = value === 1;

  const handleSwitchClick = () => {
    onToggle(relayNum, isActive ? 0 : 1);
  };

  // Determine active colors from mockup
  const getActiveColors = () => {
    switch (colorType) {
      case "orange":
        return {
          bg: "bg-[#130f30] border-orange-500/30 shadow-[0_4px_25px_rgba(249,115,22,0.1)]",
          switchBg: "bg-orange-500",
          text: "text-orange-400",
          ring: "ring-orange-500/30",
        };
      case "purple":
        return {
          bg: "bg-[#130f30] border-purple-500/30 shadow-[0_4px_25px_rgba(139,92,246,0.1)]",
          switchBg: "bg-purple-500",
          text: "text-purple-400",
          ring: "ring-purple-500/30",
        };
      case "emerald":
        return {
          bg: "bg-[#130f30] border-emerald-500/30 shadow-[0_4px_25px_rgba(16,185,129,0.1)]",
          switchBg: "bg-emerald-500",
          text: "text-emerald-400",
          ring: "ring-emerald-500/30",
        };
      default:
        return {
          bg: "bg-[#130f30] border-cyan-500/30 shadow-[0_4px_25px_rgba(6,182,212,0.1)]",
          switchBg: "bg-cyan-500",
          text: "text-cyan-400",
          ring: "ring-cyan-500/30",
        };
    }
  };

  const activeColors = getActiveColors();

  return (
    <div 
      className={`p-5 rounded-[22px] border transition-all duration-500 relative overflow-hidden group ${
        isActive 
          ? `${activeColors.bg}`
          : "bg-[#130f30]/40 border-[#251c5a]/40 hover:border-[#382b85]/60 hover:bg-[#130f30]/65"
      }`}
    >
      {/* Background glow trail on hover */}
      <div className={`absolute -right-6 -bottom-6 w-20 h-20 rounded-full blur-xl pointer-events-none transition-all duration-500 ${
        isActive ? "bg-purple-500/5" : "bg-gray-800/0 group-hover:bg-purple-500/3"
      }`} />

      {/* Header zone */}
      <div className="mb-2">
        <h4 className="text-sm font-bold text-white tracking-wide">{title}</h4>
        <p className="text-[10px] text-violet-300/40 leading-relaxed mt-1 font-mono">{description}</p>
      </div>

      {/* Tactile mockup toggle switch block with OFF / ON text indicator */}
      <div className="flex items-center gap-2 mt-4">
        <span className={`text-[10px] font-bold font-mono tracking-wide ${!isActive ? "text-white/80" : "text-white/30"}`}>
          OFF
        </span>
        
        {/* Mockup styled Slider pill */}
        <button
          type="button"
          onClick={handleSwitchClick}
          className={`w-14 h-7 rounded-full p-1 transition-all duration-500 relative cursor-pointer outline-none flex items-center ${
            isActive 
              ? `${activeColors.switchBg} shadow-[0_0_15px_rgba(139,92,246,0.25)]`
              : "bg-[#251f5c]/50 border border-[#2d2570]"
          }`}
        >
          <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-500 ${
            isActive ? "translate-x-7" : "translate-x-0"
          }`} />
        </button>

        <span className={`text-[10px] font-bold font-mono tracking-wide ${isActive ? "text-white font-black" : "text-white/30"}`}>
          ON
        </span>
      </div>

      {/* Devices count footer */}
      <div className="mt-4 pt-3 border-t border-[#1e174dec] flex justify-between items-center text-[10px]">
        <span className="text-violet-300/40 font-mono">
          Relay #{relayNum}
        </span>
        <span className="font-semibold text-violet-350/70 font-mono text-gray-400">
          {deviceText || (relayNum === 1 ? "3 / 10 Devices" : relayNum === 2 ? "0 / 8 Devices" : relayNum === 3 ? "0 / 5 Devices" : "0 / 2 Devices")}
        </span>
      </div>
    </div>
  );
}
