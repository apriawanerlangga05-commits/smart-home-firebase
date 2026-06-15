import React, { useState } from "react";
import { 
  auth 
} from "../firebase-config";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  sendPasswordResetEmail
} from "firebase/auth";
import { 
  LogIn, 
  UserPlus, 
  KeyRound, 
  Mail, 
  Lock, 
  AlertCircle, 
  Cpu, 
  Sparkles,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AuthScreenProps {
  onAuthSuccess: (user: any) => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Helper Translate Firebase Auth Errors to Indonesian
  const getErrorMessage = (errCode: string, originalMsg: string) => {
    switch (errCode) {
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
        return "Email atau password salah. Silakan periksa kembali.";
      case "auth/email-already-in-use":
        return "Alamat email ini sudah terdaftar. Silakan gunakan email lain atau login.";
      case "auth/weak-password":
        return "Kata sandi terlalu lemah. Gunakan minimal 6 karakter.";
      case "auth/invalid-email":
        return "Format alamat email tidak valid.";
      case "auth/missing-password":
        return "Mohon masukkan kata sandi Anda.";
      case "auth/user-disabled":
        return "Akun ini telah dinonaktifkan.";
      case "auth/popup-blocked":
        return "Popup diblokir oleh browser. Izinkan popup untuk menggunakan Google Sign-In.";
      case "auth/popup-closed-by-user":
        return "Proses Google Sign-In dibatalkan oleh pengguna.";
      default:
        return originalMsg || "Terjadi kesalahan proses autentikasi. Silakan coba lagi.";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    if (!email.trim() || !password.trim()) {
      setError("Email dan password wajib diisi.");
      setLoading(false);
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        // Sign In
        const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
        onAuthSuccess(credential.user);
      } else {
        // Sign Up
        const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        setMessage("Akun berhasil dibuat! Mengalihkan ke dashboard...");
        setTimeout(() => {
          onAuthSuccess(credential.user);
        }, 1000);
      }
    } catch (err: any) {
      setError(getErrorMessage(err.code, err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setMessage(null);
    setLoading(true);
    const provider = new GoogleAuthProvider();
    provider.addScope("email");
    provider.addScope("profile");

    try {
      const result = await signInWithPopup(auth, provider);
      onAuthSuccess(result.user);
    } catch (err: any) {
      setError(getErrorMessage(err.code, err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError(null);
    setMessage(null);
    if (!email.trim()) {
      setError("Mohon masukkan email Anda terlebih dahulu pada kolom input di atas untuk mereset password.");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setMessage("Link reset password telah dikirim ke email Anda. Silakan periksa inbox atau folder spam.");
    } catch (err: any) {
      setError(getErrorMessage(err.code, err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080517] text-gray-100 flex items-center justify-center p-4 relative font-sans overflow-hidden">
      {/* Premium Ambient background glowing circles */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-peach-500/5 bg-orange-600/10 rounded-full blur-[140px] pointer-events-none translate-x-1/2 translate-y-1/2" />
      
      {/* Decorative vertical/horizontal circuit-board line trails */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 left-1/3 w-[1px] bg-gradient-to-b from-transparent via-purple-500/10 to-transparent pointer-events-none" />
      
      <div className="max-w-md w-full relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="inline-flex p-3 rounded-2xl bg-[#130f30] border border-[#251c5a] shadow-[0_0_30px_rgba(139,92,246,0.15)] mb-4"
          >
            <Cpu className="w-8 h-8 text-purple-400" />
          </motion.div>
          <motion.h1 
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-2xl font-bold text-white tracking-tight"
          >
            ECSMART HOME <span className="text-orange-400">IoT</span> SYSTEM
          </motion.h1>
          <motion.p 
            initial={{ y: -5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-[10px] text-violet-300/60 mt-1 font-mono tracking-wider uppercase"
          >
            Sistem Dashboard Kendali Realtime & Terpadu
          </motion.p>
        </div>

        {/* Card Frame with glassmorphism */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring", damping: 25 }}
          className="bg-[#130f30]/80 border border-[#251c5a]/80 rounded-[28px] p-6 md:p-8 backdrop-blur-xl shadow-[0_20px_50px_rgba(8,5,23,0.6)] relative"
        >
          {/* Top subtle orange glowing hazard indicator */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-1/3 bg-gradient-to-r from-transparent via-orange-500 to-transparent shadow-[0_0_15px_rgba(249,115,22,0.8)]" />

          {/* Form Tabs */}
          <div className="flex bg-[#0a071d]/80 rounded-xl p-1 mb-6 border border-[#20184c]">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setError(null);
                setMessage(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all duration-300 ${isLogin ? "bg-purple-600/15 text-purple-400 border border-purple-500/20 shadow-[0_0_15px_rgba(139,92,246,0.05)]" : "text-gray-400 hover:text-white border border-transparent"}`}
            >
              <LogIn className="w-3.5 h-3.5" />
              Masuk (Login)
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setError(null);
                setMessage(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all duration-300 ${!isLogin ? "bg-purple-600/15 text-purple-400 border border-purple-500/20 shadow-[0_0_15px_rgba(139,92,246,0.05)]" : "text-gray-400 hover:text-white border border-transparent"}`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Daftar Baru
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? "login" : "signup"}
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -5, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Notifications */}
              {error && (
                <div id="auth-error-notif" className="mb-4 bg-rose-955/20 border border-rose-500/30 text-rose-400 rounded-xl p-3 text-xs flex gap-2.5 items-start">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {message && (
                <div id="auth-success-notif" className="mb-4 bg-emerald-955/20 border border-emerald-500/30 text-emerald-400 rounded-xl p-3 text-xs flex gap-2.5 items-start">
                  <Sparkles className="w-4 h-4 mt-0.5 shrink-0 animate-bounce" />
                  <span>{message}</span>
                </div>
              )}

              {/* Form Input Container */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-violet-300/60 mb-1.5 flex items-center gap-1.5" htmlFor="email-input">
                    <Mail className="w-3 h-3 text-purple-400" />
                    Alamat Email
                  </label>
                  <div className="relative">
                    <input
                      id="email-input"
                      type="email"
                      required
                      placeholder="nama@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      className="w-full bg-[#0a071d]/80 text-white placeholder-gray-600 border border-[#211956] rounded-xl py-2.5 pl-3 pr-10 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all font-mono"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-violet-300/60 flex items-center gap-1.5" htmlFor="password-input">
                      <Lock className="w-3 h-3 text-purple-400" />
                      Kata Sandi (Password)
                    </label>
                    {isLogin && (
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        disabled={loading}
                        className="text-[10px] text-orange-400 hover:underline cursor-pointer focus:outline-none"
                      >
                        Lupa Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      id="password-input"
                      type="password"
                      required
                      placeholder="Masukkan kata sandi..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      className="w-full bg-[#0a071d]/80 text-white placeholder-gray-600 border border-[#211956] rounded-xl py-2.5 pl-3 pr-10 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all font-mono"
                    />
                  </div>
                </div>

                {!isLogin && (
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-violet-300/60 mb-1.5 flex items-center gap-1.5" htmlFor="confirm-password-input">
                      <Lock className="w-3 h-3 text-purple-400 animate-pulse" />
                      Konfirmasi Kata Sandi
                    </label>
                    <div className="relative">
                      <input
                        id="confirm-password-input"
                        type="password"
                        required
                        placeholder="Ulangi kata sandi..."
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={loading}
                        className="w-full bg-[#0a071d]/80 text-white placeholder-gray-600 border border-[#211956] rounded-xl py-2.5 pl-3 pr-10 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* Submit Action Button */}
                <button
                  id="auth-submit-btn"
                  type="submit"
                  disabled={loading}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer border border-transparent select-none transition-all ${loading ? "bg-purple-950/40 text-purple-600 cursor-not-allowed" : "bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-500 hover:to-orange-400 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(249,115,22,0.4)] hover:scale-[1.01] active:scale-[0.99]"}`}
                >
                  {loading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                      Mengeksekusi...
                    </>
                  ) : isLogin ? (
                    <>
                      <LogIn className="w-4 h-4" />
                      Masuk Dashboard
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Buat Akun Baru
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </AnimatePresence>

          {/* Social login divider */}
          <div className="relative flex items-center justify-center my-6">
            <div className="absolute inset-x-0 h-[10%] bg-gradient-to-r from-transparent via-gray-900 to-transparent border-t border-[#1c1445]/60" />
            <span className="relative z-10 px-3 bg-[#130f30] text-[10px] uppercase tracking-wider font-semibold text-violet-300/40">
              Atau Gunakan Akun Lain
            </span>
          </div>

          {/* Sign in with Google Button */}
          <button
            id="google-signin-btn"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className={`w-full flex items-center justify-center gap-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide cursor-pointer transition-all duration-300 bg-[#0a071d]/80 hover:bg-[#130f30] border border-[#211956] hover:border-purple-500/30 text-gray-300 hover:text-white select-none ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {/* Standard Google "G" vector SVG inside a beautiful container */}
            <div className="bg-white p-1 rounded-md shrink-0">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l3.258-3.133C18.41 1.252 15.54 0 12.24 0 5.582 0 0 5.37 0 12s5.582 12 12.24 12c6.96 0 11.57-4.81 11.57-11.758 0-.79-.084-1.393-.203-1.957H12.24z"
                />
              </svg>
            </div>
            <span>Sign in with Google</span>
          </button>

          {/* Guidelines / Tips Footer */}
          <div className="mt-6 pt-4 border-t border-[#20184c] text-[10px] text-violet-350/50 text-gray-500 flex items-start gap-2 leading-relaxed">
            <Info className="w-3.5 h-3.5 text-purple-400/50 shrink-0 mt-0.5" />
            <p>
              Gunakan email yang valid untuk kemudahan reset sandi. Pastikan Google Sign-In dikonfigurasi di Firebase Console Anda.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
