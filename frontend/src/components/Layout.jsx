import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutGrid, Kanban, User2, FolderLock, CreditCard, LogOut, Radar } from "lucide-react";

const navItems = [
  { to: "/dashboard", label: "Command", icon: LayoutGrid, testid: "nav-dashboard" },
  { to: "/pipeline", label: "Pipeline", icon: Kanban, testid: "nav-pipeline" },
  { to: "/persona", label: "Persona", icon: User2, testid: "nav-persona" },
  { to: "/vault", label: "Vault", icon: FolderLock, testid: "nav-vault" },
  { to: "/pricing", label: "Billing", icon: CreditCard, testid: "nav-pricing" },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  return (
    <div className="min-h-screen bg-[#030303] text-white flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-60 flex-col border-r border-neutral-900 bg-[#050505] sticky top-0 h-screen" data-testid="sidebar">
        <div className="h-16 flex items-center px-6 border-b border-neutral-900">
          <Link to="/dashboard" className="flex items-center gap-2" data-testid="logo-link">
            <Radar className="w-5 h-5 text-amber-500" />
            <span className="font-display font-black tracking-tighter text-lg">GRANTPULSE</span>
          </Link>
        </div>
        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map(({ to, label, icon: Icon, testid }) => (
            <NavLink
              key={to}
              to={to}
              data-testid={testid}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 text-sm rounded-sm transition-colors ${
                  isActive ? "bg-neutral-900 text-white border-l-2 border-amber-500" : "text-neutral-500 hover:text-white hover:bg-neutral-950"
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-neutral-900 p-3">
          <div className="px-3 py-2 mb-2">
            <div className="text-[10px] uppercase tracking-[0.2em] text-neutral-600">Plan</div>
            <div className={`text-xs font-mono mt-1 ${user?.plan === "pro" ? "text-amber-500" : "text-neutral-400"}`} data-testid="user-plan">
              {user?.plan === "pro" ? "PRO // UNLIMITED" : "FREE // 1 LEAD"}
            </div>
          </div>
          <button
            data-testid="logout-btn"
            onClick={() => { logout(); nav("/"); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-neutral-500 hover:text-white hover:bg-neutral-950 rounded-sm transition-colors"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-40 h-16 bg-[#030303]/80 backdrop-blur-xl border-b border-neutral-900 flex items-center px-6 lg:px-10">
          <div className="lg:hidden flex items-center gap-2" data-testid="mobile-logo">
            <Radar className="w-5 h-5 text-amber-500" />
            <span className="font-display font-black text-lg">GRANTPULSE</span>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-600 hidden md:block" data-testid="user-email">
              {user?.email}
            </div>
            <div className="w-8 h-8 bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 font-mono text-xs rounded-sm">
              {(user?.email || "?")[0].toUpperCase()}
            </div>
          </div>
        </header>
        {/* mobile nav */}
        <nav className="lg:hidden flex overflow-x-auto hide-scrollbar border-b border-neutral-900 bg-[#050505]">
          {navItems.map(({ to, label, icon: Icon, testid }) => (
            <NavLink
              key={to}
              to={to}
              data-testid={`${testid}-mobile`}
              className={({ isActive }) =>
                `flex-shrink-0 flex items-center gap-2 px-4 py-3 text-xs uppercase tracking-wider ${
                  isActive ? "text-amber-500 border-b-2 border-amber-500" : "text-neutral-500"
                }`
              }
            >
              <Icon className="w-3.5 h-3.5" /> {label}
            </NavLink>
          ))}
        </nav>
        <main className="flex-1 p-6 md:p-10 lg:p-12 max-w-[1600px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
