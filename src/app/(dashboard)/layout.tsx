import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { LayoutDashboard, LogOut, Settings, Trophy, Gamepad2, ChevronRight, User } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen flex bg-[#f8fafc]">
      {/* Sidebar */}
      <aside className="w-72 bg-brand-navy hidden md:flex flex-col flex-shrink-0 fixed h-full z-20 text-white shadow-xl">
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
           <img src="/logo.png" alt="OneVOnePlay Logo" className="h-[75px] w-auto object-contain" />
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="text-xs font-bold text-brand-greenLight uppercase tracking-widest mb-4 px-4 mt-4">
            Management
          </div>
          <nav className="space-y-2 px-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-brand-green/20 text-brand-greenLight font-semibold border border-brand-green/30 transition-all shadow-[0_0_15px_rgba(0,255,136,0.1)]"
            >
              <LayoutDashboard className="w-5 h-5" />
              Campaigns
            </Link>
            
            <Link
              href="/dashboard/tournaments"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-colors group"
            >
              <Trophy className="w-5 h-5 group-hover:text-brand-greenLight transition-colors" />
              <span className="font-medium">Tournaments</span>
            </Link>

            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-colors group"
            >
              <Settings className="w-5 h-5 group-hover:text-brand-greenLight transition-colors" />
              <span className="font-medium">Settings</span>
            </Link>
          </nav>
        </div>
        
        <div className="p-4 border-t border-white/10 m-4 rounded-2xl bg-white/5 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-brand-green/20 flex items-center justify-center text-brand-greenLight border border-brand-green/30">
              <User className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-semibold truncate text-white">
                {session.user?.name || "Admin User"}
              </div>
              <div className="text-xs text-gray-400 truncate">
                {session.user?.email}
              </div>
            </div>
          </div>
          <Link
            href="/api/auth/signout"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 font-medium transition-all text-sm border border-red-500/20"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-72 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="md:hidden bg-brand-navy text-white px-4 py-4 flex items-center justify-between sticky top-0 z-20 shadow-md">
          <Link href="/dashboard" className="flex items-center gap-2">
            <img src="/logo.png" alt="OneVOnePlay Logo" className="h-[75px] w-auto object-contain" />
          </Link>
          <Link
            href="/api/auth/signout"
            className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20"
          >
            <LogOut className="w-5 h-5" />
          </Link>
        </header>

        <main className="flex-1 p-6 md:p-12 w-full max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
