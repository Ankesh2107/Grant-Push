import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Radar } from "lucide-react";

const TOPO = "https://static.prod-images.emergentagent.com/jobs/3ce85cff-a5e6-4f79-8b95-ddedb9f011d0/images/a1e0326af2900e36309660ff868abff2f7b92fbbb622e615eda9332fbb83145c.png";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await login(email, pw);
      toast.success("Agent online");
      nav("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#030303] text-white">
      <div className="relative hidden lg:block border-r border-neutral-900 overflow-hidden">
        <img src={TOPO} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#030303] via-transparent to-[#030303]" />
        <div className="relative h-full flex flex-col justify-between p-12">
          <Link to="/" className="flex items-center gap-2" data-testid="login-logo">
            <Radar className="w-5 h-5 text-amber-500" />
            <span className="font-display font-black tracking-tighter text-lg">GRANTPULSE</span>
          </Link>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-500 mb-4">/ Operator Login</div>
            <h1 className="font-display font-black tracking-tighter text-5xl leading-none">Resume your<br />pipeline.</h1>
            <p className="mt-6 text-sm text-neutral-500 max-w-sm">Your scout agent has been running on schedule. Log in to triage new high-match opportunities.</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center p-8 md:p-16">
        <form onSubmit={submit} className="w-full max-w-sm space-y-8" data-testid="login-form">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-500 mb-3">/ Auth</div>
            <h2 className="font-display font-bold text-3xl tracking-tighter">Login</h2>
          </div>
          <div className="space-y-5">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.25em] text-neutral-500 mb-2">Email</label>
              <input
                data-testid="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black border border-neutral-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-sm px-3 py-3 text-sm outline-none font-mono"
                placeholder="operator@company.io"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.25em] text-neutral-500 mb-2">Password</label>
              <input
                data-testid="login-password"
                type="password"
                required
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                className="w-full bg-black border border-neutral-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-sm px-3 py-3 text-sm outline-none font-mono"
              />
            </div>
          </div>
          <button
            data-testid="login-submit"
            disabled={busy}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black text-xs uppercase tracking-[0.2em] font-medium py-4 rounded-sm transition-colors"
          >
            {busy ? "Authenticating…" : "Login"}
          </button>
          <div className="text-xs text-neutral-500">
            No account? <Link to="/signup" className="text-amber-500 hover:underline" data-testid="login-to-signup">Deploy your agent →</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
