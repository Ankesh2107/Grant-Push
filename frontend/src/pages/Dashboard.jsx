import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Link } from "react-router-dom";
import { Radar, Play, ArrowUpRight, Bell } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [notif, setNotif] = useState([]);
  const [grants, setGrants] = useState([]);
  const [scouting, setScouting] = useState(false);
  const { user } = useAuth();

  const load = async () => {
    const [m, n, g] = await Promise.all([
      api.get("/dashboard/metrics"),
      api.get("/notifications"),
      api.get("/grants"),
    ]);
    setMetrics(m.data);
    setNotif(n.data);
    setGrants(g.data.slice(0, 5));
  };

  useEffect(() => { load(); }, []);

  const runScout = async () => {
    setScouting(true);
    try {
      const { data } = await api.post("/scout/run");
      if (data.error === "persona_not_set") {
        toast.error("Set up your Company Persona first");
        return;
      }
      toast.success(`Scan complete — ${data.created} new, ${data.high_match} high-match`);
      await load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Scout failed");
    } finally {
      setScouting(false);
    }
  };

  const cards = [
    { label: "Active Scouts", value: metrics?.active_scouts ?? "—", sub: "4-hour cadence" },
    { label: "Pipeline", value: metrics?.total_grants ?? "—", sub: "Total opportunities" },
    { label: "High Match", value: metrics?.high_match ?? "—", sub: ">85% PoW", accent: true },
    { label: "Review Queue", value: metrics?.review ?? "—", sub: "Awaiting approval" },
  ];

  return (
    <div className="space-y-12" data-testid="dashboard-page">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-500 mb-3">/ Command</div>
          <h1 className="font-display font-black text-4xl sm:text-5xl tracking-tighter">Operator deck.</h1>
          <p className="text-sm text-neutral-500 mt-2">Signed in as <span className="font-mono text-neutral-300">{user?.email}</span></p>
        </div>
        <button
          data-testid="run-scout-btn"
          onClick={runScout}
          disabled={scouting}
          className="inline-flex items-center gap-3 bg-amber-500 hover:bg-amber-400 text-black text-xs uppercase tracking-[0.2em] font-medium px-5 py-3 rounded-sm transition-colors disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5" />
          {scouting ? "Scouting…" : "Run Scout Now"}
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-neutral-900 border border-neutral-900" data-testid="metrics-grid">
        {cards.map((c) => (
          <div key={c.label} className="bg-[#0a0a0a] p-6 md:p-8">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-500 mb-5">{c.label}</div>
            <div className={`font-mono text-4xl md:text-5xl font-light tracking-tight ${c.accent ? "text-amber-500" : "text-white"}`}>{c.value}</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-600 mt-3">{c.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent pipeline */}
        <div className="lg:col-span-2 bg-[#0a0a0a] border border-neutral-900 p-6 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-500 mb-2">/ Feed</div>
              <h3 className="font-display font-bold text-xl">Latest matches</h3>
            </div>
            <Link to="/pipeline" className="text-xs uppercase tracking-[0.2em] text-amber-500 hover:underline inline-flex items-center gap-1" data-testid="view-pipeline-link">
              Pipeline <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          {grants.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-neutral-800">
              <Radar className="w-6 h-6 text-neutral-700 mx-auto mb-4" />
              <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-600">No opportunities yet. Run the scout to begin.</div>
            </div>
          ) : (
            <div className="divide-y divide-neutral-900" data-testid="recent-grants">
              {grants.map((g) => (
                <Link key={g.id} to={`/grants/${g.id}`} className="flex items-center gap-6 py-4 hover:bg-[#0f0f0f] -mx-4 px-4 transition-colors" data-testid={`grant-row-${g.id}`}>
                  <div className={`font-mono text-2xl font-light tracking-tight w-20 flex-shrink-0 ${g.pow_score >= 85 ? "text-amber-500" : "text-neutral-400"}`}>{g.pow_score}%</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{g.title}</div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-600 mt-1">{g.agency || "Unknown Agency"} · {g.stage}</div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-neutral-600" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="bg-[#0a0a0a] border border-neutral-900 p-6 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-500 mb-2">/ Alerts</div>
              <h3 className="font-display font-bold text-xl">Priority signals</h3>
            </div>
            <Bell className="w-4 h-4 text-neutral-600" />
          </div>
          {notif.length === 0 ? (
            <div className="text-xs text-neutral-600 font-mono uppercase tracking-wider py-10 text-center">No signals</div>
          ) : (
            <div className="space-y-3" data-testid="notifications-list">
              {notif.slice(0, 6).map((n) => (
                <div key={n.id} className="border-l-2 border-amber-500 pl-4 py-1">
                  <div className="text-xs text-neutral-300 leading-relaxed">{n.message}</div>
                  <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-600 mt-1">
                    {new Date(n.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
