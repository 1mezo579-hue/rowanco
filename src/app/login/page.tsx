"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/hooks/useAuthStore";
import toast from "react-hot-toast";
import { Sparkles, LogIn, User, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { isLoggedIn, isChecked, login, loadFromStorage } = useAuthStore();

  useEffect(() => {
    loadFromStorage();
  }, []);

  useEffect(() => {
    if (isChecked && isLoggedIn) {
      router.replace("/");
    }
  }, [isChecked, isLoggedIn, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("يرجى ملء جميع الحقول");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        login(data);
        toast.success(`مرحباً ${data.name}!`);
        router.replace("/");
      } else {
        toast.error(data.error || "فشل تسجيل الدخول");
      }
    } catch {
      toast.error("خطأ في الاتصال بالسيرفر");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 overflow-hidden relative">
      {/* Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-100/30 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/30 rounded-full blur-[120px] -z-10" />

      <div className="w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-2 glass-card overflow-hidden animate-premium-in">
        
        {/* Left Side: Branding (Visible on Desktop) */}
        <div className="hidden lg:flex flex-col justify-center p-16 bg-gradient-to-br from-cyan-600 to-blue-700 text-white relative">
          <div className="relative z-10">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center mb-8 animate-float">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-6xl font-black mb-6 leading-tight">روانكو<br/>للمنظفات</h1>
            <p className="text-xl font-medium text-cyan-50 leading-relaxed max-w-sm">
              نظام إدارة متطور يجمع بين السرعة، الدقة، والسهولة في واجهة واحدة مبتكرة.
            </p>
          </div>
          
          {/* Abstract Pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] border-[40px] border-white rounded-full" />
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-12 md:p-16 flex flex-col justify-center bg-white/40">
          <div className="mb-12">
            <h2 className="text-4xl font-black text-slate-900 mb-2">تسجيل الدخول</h2>
            <p className="text-slate-400 font-bold">يرجى إدخال بياناتك للوصول للنظام</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-4">
              <label className="block text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                <User className="w-4 h-4 text-cyan-600" />
                اسم المستخدم
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="input-luxury text-lg font-bold"
                autoFocus
                dir="ltr"
              />
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                <Lock className="w-4 h-4 text-cyan-600" />
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-luxury text-lg font-bold pl-16"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-cyan-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-5 text-xl flex items-center justify-center gap-4 group"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>دخول للنظام</span>
                  <LogIn className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-slate-100 text-center">
            <p className="text-slate-300 font-bold text-sm">
              جميع الحقوق محفوظة &copy; {new Date().getFullYear()}
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}
