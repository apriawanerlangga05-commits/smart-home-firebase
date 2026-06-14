import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mic, MicOff, BookOpen, Headset } from "lucide-react";

interface VoiceVisualizerProps {
  isListening: boolean;
  transcript: string;
  toggleSpeechRecognition: () => void;
}

export default function VoiceVisualizer({
  isListening,
  transcript,
  toggleSpeechRecognition,
}: VoiceVisualizerProps) {
  return (
    <div className="bg-gradient-to-br from-[#0c0f1e] to-[#0e1627] border border-gray-800/60 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/4 rounded-full blur-3xl pointer-events-none" />
      
      {/* Top Header info */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-cyan-500/10 rounded-lg text-cyan-400 border border-cyan-500/15">
            <Headset className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-white text-sm tracking-wide">Asisten Suara Pintar IoT</h3>
        </div>
        <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold tracking-wider transition-all duration-300 ${
          isListening 
          ? "bg-rose-500/15 text-rose-450 border border-rose-500/25 animate-pulse" 
          : "bg-gray-800/40 text-gray-400"
        }`}>
          {isListening ? "MENDENGARKAN" : "STANDBY"}
        </span>
      </div>

      {/* Dynamic Voice Interactive Waveform */}
      <div className="bg-[#05070e]/85 rounded-2xl border border-gray-900/80 p-4 mb-4 flex flex-col items-center justify-center min-h-[95px] relative overflow-hidden">
        <AnimatePresence mode="wait">
          {isListening ? (
            <div className="flex flex-col items-center justify-center w-full py-1">
              {/* Dynamic Sound bars that pulsate smoothly */}
              <div className="flex items-end justify-center gap-1.5 h-8 mb-2.5">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      height: [8, i % 2 === 0 ? 32 : 22, 12, i % 3 === 0 ? 28 : 16, 8],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.75 + (i * 0.1),
                      ease: "easeInOut",
                    }}
                    className="w-1 bg-gradient-to-t from-cyan-400 to-indigo-400 rounded-full"
                  />
                ))}
              </div>
              <p className="text-[11.5px] text-cyan-400 animate-pulse font-mono font-medium text-center max-w-xs break-words px-2 lowercase">
                "{transcript}"
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              <p className="text-xs text-gray-400 leading-normal max-w-[280px] font-mono select-none">
                {transcript || '"menunggu perintah suara..."'}
              </p>
              <span className="text-[9px] text-gray-600 uppercase tracking-widest mt-2 block font-mono">Klik tombol mikrofon untuk bicara</span>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Interactive Microphone Toggle Bar */}
      <div className="flex items-center gap-4 justify-between bg-[#05070e]/40 border border-gray-900 p-3 rounded-2xl">
        <div className="text-left">
          <h4 className="text-xs font-bold text-gray-300 tracking-wide">Metodologi Mic Tunggal</h4>
          <p className="text-[10px] text-gray-550 font-mono">Panduan suara terangkum di bawah</p>
        </div>

        <div className="relative cursor-pointer" onClick={toggleSpeechRecognition}>
          <AnimatePresence>
            {isListening && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0.8 }}
                animate={{ scale: 1.7, opacity: 0 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 1.2, ease: "easeOut" }}
                className="absolute inset-0 bg-rose-500/25 rounded-full"
              />
            )}
          </AnimatePresence>

          <button className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all cursor-pointer outline-none ${
            isListening 
            ? "bg-rose-500 border-transparent text-white shadow-[0_0_20px_rgba(244,63,94,0.4)]" 
            : "bg-[#05070e] border-gray-800 text-cyan-400 hover:text-white hover:border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.05)] hover:scale-105 active:scale-95"
          }`}>
            {isListening ? (
              <Mic className="w-4 h-4 text-white" />
            ) : (
              <MicOff className="w-4 h-4 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Simplified Handbook Content within the Visualizer */}
      <div className="mt-5 pt-4 border-t border-gray-900">
        <div className="flex items-center gap-2 mb-2.5 p-1 bg-cyan-500/5 rounded-lg border border-cyan-500/10 w-fit">
          <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[9.5px] font-bold text-cyan-400 uppercase tracking-widest font-mono">Buku Panduan Perintah Suara</span>
        </div>
        <div className="space-y-2 bg-[#05070e] border border-gray-900 rounded-xl p-3 text-[11px] text-gray-400 leading-relaxed font-mono">
          <div className="flex items-start gap-1.5">
            <span className="text-cyan-400 mt-0.5 select-none">✦</span>
            <div>
              <strong className="text-white font-semibold">"Nyalakan lampu [1-4]"</strong> / <span className="text-gray-500">"Matikan"</span>
              <p className="text-[10px] text-gray-500 mt-0.5">Contoh: "Nyalakan lampu satu", "Matikan lampu tiga".</p>
            </div>
          </div>
          <div className="flex items-start gap-1.5 border-t border-gray-900/60 pt-2">
            <span className="text-cyan-400 mt-0.5 select-none">✦</span>
            <div>
              <strong className="text-white font-semibold">"Nyalakan semua"</strong> / <span className="text-gray-500">"Matikan semua"</span>
              <p className="text-[10px] text-gray-500 mt-0.5">Mematikan atau menyalakan seluruh relay saklar sekaligus.</p>
            </div>
          </div>
          <div className="flex items-start gap-1.5 border-t border-gray-900/60 pt-2">
            <span className="text-cyan-400 mt-0.5 select-none">✦</span>
            <div>
              <strong className="text-white font-semibold">"Aktifkan mode satu / dua"</strong> / <strong className="text-white font-semibold">"hentikan mode"</strong>
              <p className="text-[10px] text-gray-500 mt-0.5">Membuka loop sekuens demo lampu dekoratif atau memadamkannya.</p>
            </div>
          </div>
          <div className="flex items-start gap-1.5 border-t border-gray-900/60 pt-2">
            <span className="text-cyan-400 mt-0.5 select-none">✦</span>
            <div>
              <strong className="text-white font-semibold">"Cek status sensor"</strong>
              <p className="text-[10px] text-gray-500 mt-0.5">Mendengarkan laporan audio status suhu & kelembaban dari sistem.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
