import { Link } from "react-router-dom";
import { ArrowUpRight, Check, Radar, ShieldCheck, Zap, FileCheck2 } from "lucide-react";

const HERO_BG = "https://static.prod-images.emergentagent.com/jobs/3ce85cff-a5e6-4f79-8b95-ddedb9f011d0/images/01cf2dc0c2ff685bb113c5105ea320d208454f493cde3f9834edc6d54fdf7db1.png";
const TOPO_BG = "https://static.prod-images.emergentagent.com/jobs/3ce85cff-a5e6-4f79-8b95-ddedb9f011d0/images/a1e0326af2900e36309660ff868abff2f7b92fbbb622e615eda9332fbb83145c.png";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#030303] text-white">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-[#030303]/80 backdrop-blur-xl border-b border-neutral-900">
        <div className="max-w-7xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" data-testid="landing-logo">
            <Radar className="w-5 h-5 text-amber-500" />
            <span className="font-display font-black tracking-tighter text-lg">GRANTPULSE</span>
          </Link>
          <nav className="flex items-center gap-6">
            <a href="#features" className="hidden md:inline text-xs uppercase tracking-[0.2em] text-neutral-400 hover:text-white">Features</a>
            <a href="#pricing" className="hidden md:inline text-xs uppercase tracking-[0.2em] text-neutral-400 hover:text-white">Pricing</a>
            <Link to="/login" className="text-xs uppercase tracking-[0.2em] text-neutral-400 hover:text-white" data-testid="landing-login">Login</Link>
            <Link
              to="/signup"
              data-testid="landing-cta-signup"
              className="bg-amber-500 text-black text-[11px] uppercase tracking-[0.15em] font-medium px-4 py-2.5 rounded-sm hover:bg-amber-400 transition-colors"
            >
              Deploy Agent
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-neutral-900">
        <div className="absolute inset-0">
          <img src={HERO_BG} alt="" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-transparent" />
          <div className="absolute inset-0 gp-grid-bg opacity-60" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 md:px-10 py-24 md:py-36">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 border border-amber-500/30 bg-amber-500/5 px-3 py-1.5 rounded-sm mb-10">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-amber-500">Autonomous scouting active</span>
            </div>
            <h1 className="font-display font-black tracking-tighter leading-[0.9] text-5xl sm:text-7xl lg:text-8xl">
              Win the grants<br />
              <span className="text-neutral-500">you deserve.</span>
            </h1>
            <p className="mt-10 text-lg text-neutral-400 max-w-xl leading-relaxed">
              GrantPulse deploys an autonomous agent that scouts Grants.gov and SAM.gov every four hours,
              scores opportunities against your company persona, and drafts winning proposals in your voice.
            </p>
            <div className="mt-12 flex flex-wrap items-center gap-4">
              <Link
                to="/signup"
                data-testid="hero-cta-deploy"
                className="group bg-amber-500 text-black px-6 py-4 rounded-sm hover:bg-amber-400 transition-colors inline-flex items-center gap-3"
              >
                <span className="font-medium tracking-wide uppercase text-xs">Deploy Scout Agent</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="text-xs uppercase tracking-[0.2em] text-neutral-400 hover:text-white border-b border-neutral-700 pb-1"
                data-testid="hero-login-link"
              >
                Already deployed? Login
              </Link>
            </div>
            <div className="mt-20 grid grid-cols-3 gap-px bg-neutral-900 border border-neutral-900 max-w-xl">
              {[
                ["04 hr", "Scout cadence"],
                [">85%", "Match threshold"],
                ["100%", "Manual approval"],
              ].map(([v, l]) => (
                <div key={l} className="bg-[#050505] p-5">
                  <div className="font-mono text-2xl font-light text-amber-500">{v}</div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500 mt-2">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="features" className="border-b border-neutral-900">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-24">
          <div className="flex items-end justify-between flex-wrap gap-6 mb-16">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-500 mb-4">/ Workflow</div>
              <h2 className="font-display font-bold text-4xl sm:text-5xl tracking-tighter max-w-2xl">Four agents. One pipeline. Zero wasted RFPs.</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-neutral-900 border border-neutral-900">
            {[
              { n: "01", i: Radar, t: "Scout", d: "Background agent monitors SAM.gov and Grants.gov on a 4-hour cron. New opportunities flow into your pipeline automatically." },
              { n: "02", i: Zap, t: "Vet", d: "Each RFP is scored against your company persona. Capabilities, keywords, geography, and past performance all weighted." },
              { n: "03", i: FileCheck2, t: "Draft", d: "Claude Sonnet 4.5 writes a full response using your past successful proposals as tone and language references." },
              { n: "04", i: ShieldCheck, t: "Approve", d: "Trust Boundary: the agent drafts, you approve. No proposal leaves your desk without an explicit click." },
            ].map((s) => (
              <div key={s.n} className="bg-[#0a0a0a] p-8 hover:bg-[#0f0f0f] transition-colors">
                <div className="flex items-center justify-between mb-10">
                  <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-600">{s.n}</span>
                  <s.i className="w-4 h-4 text-amber-500" />
                </div>
                <h3 className="font-display font-bold text-2xl tracking-tight mb-3">{s.t}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative border-b border-neutral-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src={TOPO_BG} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 md:px-10 py-24">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-500 mb-4">/ Pricing</div>
            <h2 className="font-display font-bold text-4xl sm:text-5xl tracking-tighter">Two tiers. Transparent economics.</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="bg-[#0a0a0a] border border-neutral-900 p-10">
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-500 mb-6">Free Tier</div>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="font-display text-6xl font-black tracking-tighter">$0</span>
                <span className="text-neutral-500 text-sm">/month</span>
              </div>
              <ul className="space-y-4 mb-10">
                {["1 matched lead / month", "Manual scout on-demand", "Basic PoW scoring", "Persona + vault storage"].map((i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-neutral-400">
                    <Check className="w-4 h-4 text-neutral-600 mt-0.5 flex-shrink-0" />{i}
                  </li>
                ))}
              </ul>
              <Link to="/signup" data-testid="pricing-free-cta" className="block w-full text-center border border-neutral-700 hover:border-neutral-500 text-xs uppercase tracking-[0.2em] py-4 rounded-sm transition-colors">Start Free</Link>
            </div>
            <div className="relative bg-[#0a0a0a] border border-amber-500/40 p-10 gp-amber-glow">
              <div className="absolute top-0 right-0 bg-amber-500 text-black font-mono text-[10px] uppercase tracking-[0.25em] px-3 py-1">Pro</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-500 mb-6">Pro Autonomous</div>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="font-display text-6xl font-black tracking-tighter text-amber-500">$199</span>
                <span className="text-neutral-500 text-sm">/month</span>
              </div>
              <ul className="space-y-4 mb-10">
                {[
                  "Unlimited autonomous scouting",
                  "4-hour cron across all target portals",
                  "AI proposal drafting (Claude Sonnet 4.5)",
                  "Tone-mirrored from your past proposals",
                  "High-match priority notifications",
                  "Manual approval Trust Boundary",
                ].map((i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-neutral-300">
                    <Check className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />{i}
                  </li>
                ))}
              </ul>
              <Link to="/signup" data-testid="pricing-pro-cta" className="block w-full text-center bg-amber-500 hover:bg-amber-400 text-black text-xs uppercase tracking-[0.2em] py-4 rounded-sm font-medium transition-colors">Deploy Pro Agent</Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-10 border-t border-neutral-900">
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-wrap items-center justify-between gap-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-600">© GrantPulse // Autonomous RFP Systems</div>
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-600">v1.0 // Built for operators</div>
        </div>
      </footer>
    </div>
  );
}
