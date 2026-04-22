import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Lock } from "lucide-react";

const STAGES = [
  { key: "matched", label: "Matched" },
  { key: "drafting", label: "Drafting" },
  { key: "review", label: "Review Required" },
  { key: "submitted", label: "Submitted" },
];

export default function Pipeline() {
  const [grants, setGrants] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await api.get("/grants");
    setGrants(data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const move = async (gid, stage) => {
    try {
      await api.post(`/grants/${gid}/stage?stage=${stage}`);
      toast.success(`Moved to ${stage}`);
      await load();
    } catch (e) {
      toast.error("Move failed");
    }
  };

  return (
    <div data-testid="pipeline-page">
      <div className="mb-10">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-500 mb-3">/ Pipeline</div>
        <h1 className="font-display font-black text-4xl sm:text-5xl tracking-tighter">Kanban board.</h1>
        <p className="text-sm text-neutral-500 mt-2">Drag the stages. Trust Boundary enforced at final submit.</p>
      </div>

      {loading ? (
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-600">Loading…</div>
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-8 hide-scrollbar" data-testid="kanban-board">
          {STAGES.map((s) => {
            const items = grants.filter((g) => g.stage === s.key);
            return (
              <div key={s.key} className="w-80 flex-shrink-0 bg-[#0a0a0a] border border-neutral-900 p-4" data-testid={`kanban-col-${s.key}`}>
                <div className="flex items-center justify-between mb-5">
                  <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">{s.label}</div>
                  <div className="font-mono text-[10px] text-neutral-600">{items.length}</div>
                </div>
                <div className="space-y-3">
                  {items.length === 0 && (
                    <div className="border border-dashed border-neutral-900 py-10 text-center">
                      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-700">Empty</div>
                    </div>
                  )}
                  {items.map((g) => (
                    <div key={g.id} className="bg-[#141414] border border-neutral-800 hover:border-amber-500/50 p-4 transition-colors group" data-testid={`card-${g.id}`}>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className={`font-mono text-2xl font-light tracking-tight ${g.pow_score >= 85 ? "text-amber-500" : "text-neutral-400"}`}>
                          {g.pow_score}%
                        </div>
                        {g.locked ? (
                          <Link to="/pricing" className="text-[10px] uppercase tracking-[0.2em] text-amber-500 flex items-center gap-1 hover:underline" data-testid={`locked-${g.id}`}>
                            <Lock className="w-3 h-3" /> Pro
                          </Link>
                        ) : g.high_match ? (
                          <div className="font-mono text-[9px] uppercase tracking-[0.2em] bg-amber-500/10 text-amber-500 border border-amber-500/30 px-2 py-0.5">HIGH</div>
                        ) : null}
                      </div>
                      <Link to={g.locked ? "/pricing" : `/grants/${g.id}`} className="block" data-testid={`open-${g.id}`}>
                        <div className="text-sm font-medium leading-snug line-clamp-3 group-hover:text-amber-500 transition-colors">{g.title}</div>
                        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-600 mt-3">{g.agency || "Agency N/A"}</div>
                      </Link>
                      {!g.locked && (
                        <div className="mt-4 flex gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                          {STAGES.filter((x) => x.key !== g.stage && x.key !== "submitted").map((x) => (
                            <button
                              key={x.key}
                              onClick={() => move(g.id, x.key)}
                              className="text-[9px] uppercase tracking-wider text-neutral-500 hover:text-amber-500 border border-neutral-800 hover:border-amber-500/50 px-2 py-1 transition-colors"
                              data-testid={`move-${g.id}-${x.key}`}
                            >
                              → {x.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
