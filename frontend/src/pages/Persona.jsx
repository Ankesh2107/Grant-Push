import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";

function ChipInput({ value, setValue, placeholder, testid }) {
  const [txt, setTxt] = useState("");
  const add = () => {
    const t = txt.trim();
    if (!t) return;
    if (!value.includes(t)) setValue([...value, t]);
    setTxt("");
  };
  return (
    <div>
      <div className="flex gap-2">
        <input
          data-testid={`${testid}-input`}
          value={txt}
          onChange={(e) => setTxt(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          className="flex-1 bg-black border border-neutral-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-sm px-3 py-2.5 text-sm outline-none font-mono"
        />
        <button type="button" onClick={add} data-testid={`${testid}-add`} className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 px-3 rounded-sm">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {value.map((v, i) => (
            <div key={v + i} className="bg-amber-500/10 text-amber-500 border border-amber-500/30 text-xs font-mono px-2.5 py-1 flex items-center gap-2 rounded-sm">
              {v}
              <button type="button" onClick={() => setValue(value.filter((_, idx) => idx !== i))} data-testid={`${testid}-remove-${i}`}>
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Persona() {
  const [form, setForm] = useState({
    company_name: "",
    capabilities: [],
    past_performance: [],
    technical_keywords: [],
    geographic_focus: [],
    narrative: "",
  });
  const [pp, setPp] = useState({ title: "", value: "", year: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get("/persona").then((r) => {
      if (r.data && r.data.company_name) setForm({ ...form, ...r.data });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addPP = () => {
    if (!pp.title.trim()) return;
    setForm({ ...form, past_performance: [...form.past_performance, { ...pp }] });
    setPp({ title: "", value: "", year: "" });
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.put("/persona", form);
      toast.success("Persona saved. Scout knows what to hunt.");
    } catch {
      toast.error("Save failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-10" data-testid="persona-page">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-500 mb-3">/ Persona</div>
        <h1 className="font-display font-black text-4xl sm:text-5xl tracking-tighter">Company persona.</h1>
        <p className="text-sm text-neutral-500 mt-3 max-w-xl">The scout compares every RFP against this profile to compute Probability of Win. Be specific — vague inputs produce vague scores.</p>
      </div>

      <form onSubmit={save} className="space-y-8">
        <div>
          <label className="block text-[10px] uppercase tracking-[0.25em] text-neutral-500 mb-2">Company Name</label>
          <input
            data-testid="persona-company"
            required
            value={form.company_name}
            onChange={(e) => setForm({ ...form, company_name: e.target.value })}
            className="w-full bg-black border border-neutral-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-sm px-3 py-3 text-sm outline-none font-mono"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-[0.25em] text-neutral-500 mb-2">Capabilities</label>
          <ChipInput
            testid="persona-capabilities"
            value={form.capabilities}
            setValue={(v) => setForm({ ...form, capabilities: v })}
            placeholder="e.g. Grid-scale battery storage"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-[0.25em] text-neutral-500 mb-2">Technical Keywords</label>
          <ChipInput
            testid="persona-keywords"
            value={form.technical_keywords}
            setValue={(v) => setForm({ ...form, technical_keywords: v })}
            placeholder="e.g. solar, hydrogen, microgrid"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-[0.25em] text-neutral-500 mb-2">Geographic Focus</label>
          <ChipInput
            testid="persona-geo"
            value={form.geographic_focus}
            setValue={(v) => setForm({ ...form, geographic_focus: v })}
            placeholder="e.g. CA, TX, US-Federal"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-[0.25em] text-neutral-500 mb-2">Past Performance</label>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <input
              data-testid="pp-title"
              value={pp.title}
              onChange={(e) => setPp({ ...pp, title: e.target.value })}
              placeholder="Project title"
              className="md:col-span-2 bg-black border border-neutral-800 focus:border-amber-500 rounded-sm px-3 py-2.5 text-sm outline-none font-mono"
            />
            <input
              data-testid="pp-value"
              value={pp.value}
              onChange={(e) => setPp({ ...pp, value: e.target.value })}
              placeholder="$ value"
              className="bg-black border border-neutral-800 focus:border-amber-500 rounded-sm px-3 py-2.5 text-sm outline-none font-mono"
            />
            <input
              data-testid="pp-year"
              value={pp.year}
              onChange={(e) => setPp({ ...pp, year: e.target.value })}
              placeholder="Year"
              className="bg-black border border-neutral-800 focus:border-amber-500 rounded-sm px-3 py-2.5 text-sm outline-none font-mono"
            />
          </div>
          <button type="button" onClick={addPP} data-testid="pp-add" className="mt-3 text-xs uppercase tracking-[0.2em] text-amber-500 hover:underline">+ Add entry</button>
          {form.past_performance.length > 0 && (
            <div className="mt-4 divide-y divide-neutral-900 border border-neutral-900">
              {form.past_performance.map((p, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3 bg-[#0a0a0a]">
                  <div className="flex-1 text-sm font-medium">{p.title}</div>
                  <div className="font-mono text-xs text-neutral-500">{p.value}</div>
                  <div className="font-mono text-xs text-neutral-500">{p.year}</div>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, past_performance: form.past_performance.filter((_, idx) => idx !== i) })}
                    className="text-neutral-500 hover:text-red-500"
                    data-testid={`pp-remove-${i}`}
                  ><X className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-[0.25em] text-neutral-500 mb-2">Narrative (optional)</label>
          <textarea
            data-testid="persona-narrative"
            value={form.narrative}
            onChange={(e) => setForm({ ...form, narrative: e.target.value })}
            rows={4}
            placeholder="A one-paragraph pitch — used as additional context for the drafting engine."
            className="w-full bg-black border border-neutral-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-sm px-3 py-3 text-sm outline-none"
          />
        </div>

        <button
          data-testid="persona-save"
          disabled={busy}
          className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black text-xs uppercase tracking-[0.2em] font-medium px-6 py-3 rounded-sm transition-colors"
        >
          {busy ? "Saving…" : "Save Persona"}
        </button>
      </form>
    </div>
  );
}
