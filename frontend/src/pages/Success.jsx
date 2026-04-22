import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { api } from "@/lib/api";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Success() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [status, setStatus] = useState("pending");
  const [attempts, setAttempts] = useState(0);
  const { refresh } = useAuth();

  useEffect(() => {
    if (!sessionId) { setStatus("error"); return; }
    let cancelled = false;
    const poll = async (n = 0) => {
      if (n >= 8) { if (!cancelled) setStatus("timeout"); return; }
      try {
        const { data } = await api.get(`/payments/status/${sessionId}`);
        if (data.payment_status === "paid") {
          if (!cancelled) { setStatus("paid"); refresh(); }
          return;
        }
        if (data.status === "expired") { if (!cancelled) setStatus("expired"); return; }
      } catch {}
      setAttempts(n + 1);
      setTimeout(() => poll(n + 1), 2000);
    };
    poll(0);
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center" data-testid="success-page">
      <div className="max-w-md w-full text-center bg-[#0a0a0a] border border-neutral-900 p-12">
        {status === "paid" ? (
          <>
            <CheckCircle2 className="w-10 h-10 text-amber-500 mx-auto mb-6" />
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-500 mb-3">/ Upgrade Complete</div>
            <h1 className="font-display font-black text-3xl tracking-tighter mb-4">Pro agent deployed.</h1>
            <p className="text-sm text-neutral-400 mb-8">Unlimited scouting and AI drafting are now active. Your next autonomous scan is scheduled.</p>
            <Link to="/dashboard" className="inline-block bg-amber-500 hover:bg-amber-400 text-black text-xs uppercase tracking-[0.2em] font-medium px-6 py-3 rounded-sm" data-testid="success-dashboard-link">Go to Command Deck →</Link>
          </>
        ) : status === "pending" ? (
          <>
            <div className="animate-pulse w-10 h-10 rounded-full bg-amber-500/20 mx-auto mb-6 flex items-center justify-center"><div className="w-3 h-3 rounded-full bg-amber-500" /></div>
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-500 mb-3">Polling payment status ({attempts}/8)</div>
            <h1 className="font-display font-black text-2xl tracking-tighter">Verifying…</h1>
          </>
        ) : (
          <>
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-6" />
            <h1 className="font-display font-black text-2xl tracking-tighter mb-3">Payment {status}</h1>
            <Link to="/pricing" className="text-amber-500 text-xs uppercase tracking-[0.2em] hover:underline">← Try again</Link>
          </>
        )}
      </div>
    </div>
  );
}
