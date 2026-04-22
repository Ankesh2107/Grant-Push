import { useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Check } from "lucide-react";

export default function Pricing() {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);

  const upgrade = async () => {
    setBusy(true);
    try {
      const { data } = await api.post("/payments/checkout", {
        package_id: "pro_monthly",
        origin_url: window.location.origin,
      });
      window.location.href = data.url;
    } catch (e) {
      toast.error(e.response?.data?.detail || "Checkout failed");
      setBusy(false);
    }
  };

  const isPro = user?.plan === "pro";

  return (
    <div className="max-w-5xl mx-auto space-y-12" data-testid="pricing-page">
      <div className="text-center">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-500 mb-3">/ Billing</div>
        <h1 className="font-display font-black text-4xl sm:text-5xl tracking-tighter">Upgrade your agent.</h1>
        <p className="text-sm text-neutral-500 mt-3 max-w-xl mx-auto">Pro unlocks unlimited autonomous scouting, AI drafting, and priority alerts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0a0a0a] border border-neutral-900 p-10">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-500 mb-6">Free Tier {!isPro && "— ACTIVE"}</div>
          <div className="flex items-baseline gap-2 mb-8">
            <span className="font-display text-6xl font-black tracking-tighter">$0</span>
            <span className="text-neutral-500 text-sm">/month</span>
          </div>
          <ul className="space-y-4 mb-10">
            {["1 matched lead / month", "Manual scout on-demand", "Persona + vault", "No AI drafting"].map((i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-neutral-400">
                <Check className="w-4 h-4 text-neutral-600 mt-0.5" />{i}
              </li>
            ))}
          </ul>
          <button disabled className="w-full border border-neutral-800 text-xs uppercase tracking-[0.2em] py-4 rounded-sm text-neutral-600" data-testid="free-plan-btn">
            {isPro ? "Downgraded not available" : "Current Plan"}
          </button>
        </div>
        <div className="relative bg-[#0a0a0a] border border-amber-500/40 p-10 gp-amber-glow">
          <div className="absolute top-0 right-0 bg-amber-500 text-black font-mono text-[10px] uppercase tracking-[0.25em] px-3 py-1">Pro</div>
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-500 mb-6">Pro Autonomous {isPro && "— ACTIVE"}</div>
          <div className="flex items-baseline gap-2 mb-8">
            <span className="font-display text-6xl font-black tracking-tighter text-amber-500">$199</span>
            <span className="text-neutral-500 text-sm">/month</span>
          </div>
          <ul className="space-y-4 mb-10">
            {[
              "Unlimited scouting",
              "4-hour autonomous cron",
              "AI proposal drafting (Claude Sonnet 4.5)",
              "Tone-mirrored from vault PDFs",
              "Priority high-match alerts",
              "Trust Boundary approval flow",
            ].map((i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-neutral-200">
                <Check className="w-4 h-4 text-amber-500 mt-0.5" />{i}
              </li>
            ))}
          </ul>
          {isPro ? (
            <div className="w-full text-center border border-amber-500/40 text-amber-500 text-xs uppercase tracking-[0.2em] py-4 rounded-sm font-medium" data-testid="pro-active">Pro Active</div>
          ) : (
            <button
              data-testid="upgrade-btn"
              disabled={busy}
              onClick={upgrade}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black text-xs uppercase tracking-[0.2em] py-4 rounded-sm font-medium transition-colors"
            >
              {busy ? "Redirecting…" : "Upgrade to Pro"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
