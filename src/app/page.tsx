"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useAuthStore } from "@/hooks/useAuthStore";
import { 
  ShoppingCart, Package, BarChart3, Users, Sparkles, 
  ChevronLeft, LogOut, Wallet, Truck, Contact, Settings 
} from "lucide-react";

const ALL_MODULES = [
  {
    title: "الكاشير الذكي",
    desc: "نقطة البيع السريعة",
    icon: ShoppingCart,
    href: "/cashier",
    color: "from-cyan-500 to-blue-600",
    roles: ["admin", "manager", "cashier"],
  },
  {
    title: "المخزن",
    desc: "المنتجات والأقسام",
    icon: Package,
    href: "/inventory",
    color: "from-teal-400 to-emerald-600",
    roles: ["admin", "manager"],
  },
  {
    title: "التقارير",
    desc: "الأرباح والمبيعات",
    icon: BarChart3,
    href: "/reports",
    color: "from-violet-500 to-indigo-600",
    roles: ["admin", "manager"],
  },
  {
    title: "العملاء",
    desc: "الدليفري ونقاط الولاء",
    icon: Truck,
    href: "/customers",
    color: "from-rose-500 to-orange-500",
    roles: ["admin", "manager", "cashier"],
  },
  {
    title: "المصروفات",
    desc: "الكهرباء والرواتب",
    icon: Wallet,
    color: "from-pink-500 to-rose-600",
    href: "/expenses",
    roles: ["admin", "manager"],
  },
  {
    title: "التجار",
    desc: "الموردين والمشتريات",
    icon: Contact,
    href: "/traders",
    color: "from-slate-700 to-slate-900",
    roles: ["admin", "manager"],
  },
  {
    title: "المستخدمين",
    desc: "الصلاحيات والإعدادات",
    icon: Settings,
    href: "/users",
    color: "from-amber-400 to-orange-600",
    roles: ["admin"],
  },
];

const roleLabel: Record<string, string> = {
  admin: "المالك",
  manager: "مدير الفرع",
  cashier: "كاشير",
};

export default function Home() {
  const router = useRouter();
  const { user, isChecked } = useRequireAuth();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  if (!isChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const visibleModules = ALL_MODULES.filter(
    (m) => user && m.roles.includes(user.role)
  );

  return (
    <main className="min-h-screen p-6 md:p-12 lg:p-20 flex items-center justify-center overflow-hidden">
      <div className="w-full max-w-7xl animate-premium-in">
        
        {/* Top Navigation / Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 glass-card flex items-center justify-center animate-float">
              <Sparkles className="w-12 h-12 text-cyan-600" />
            </div>
            <div>
              <h1 className="text-5xl font-black text-slate-900 mb-2">روانكو للمنظفات</h1>
              <p className="text-xl text-slate-400 font-medium">نظام المتجر الذكي المتكامل</p>
            </div>
          </div>

          <div className="glass-card px-8 py-5 flex items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 flex items-center justify-center">
                <Users className="w-6 h-6 text-cyan-600" />
              </div>
              <div className="text-right">
                <div className="font-black text-slate-900 text-lg">{user?.name}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{roleLabel[user?.role || "cashier"]}</div>
              </div>
            </div>
            <div className="w-px h-10 bg-slate-100" />
            <button
              onClick={handleLogout}
              className="p-3 rounded-2xl text-rose-500 hover:bg-rose-50 transition-all hover:scale-110"
              title="خروج"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Dynamic Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {visibleModules.map((mod, idx) => (
            <Link 
              key={mod.href} 
              href={mod.href} 
              className="group"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="glass-card h-full p-8 flex flex-col items-center text-center hover:-translate-y-4 transition-all duration-500 group-hover:bg-white relative overflow-hidden">
                {/* Glow Effect */}
                <div className={`absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br ${mod.color} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity`} />
                
                <div className={`w-20 h-20 rounded-[2rem] bg-gradient-to-br ${mod.color} flex items-center justify-center mb-6 shadow-2xl group-hover:rotate-12 transition-transform duration-500`}>
                  <mod.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-cyan-600 transition-colors">{mod.title}</h3>
                <p className="text-sm text-slate-400 font-bold mb-8">{mod.desc}</p>
                
                <div className="mt-auto w-full pt-6 border-t border-slate-50 flex items-center justify-between text-cyan-600 font-black">
                  <span className="text-sm">دخول القسم</span>
                  <ChevronLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-24 text-center">
          <p className="text-slate-400 font-bold text-sm">
            نظام روانكو &copy; {new Date().getFullYear()} — تم التصميم بأعلى معايير الجودة
          </p>
        </div>
      </div>
    </main>
  );
}