import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { ShieldCheck, ExternalLink, Sparkles, Save, CheckCircle2, Download } from "lucide-react";

export default function GrantDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const [grant, setGrant] = useState(null);
  const [draft, setDraft] = useState(null);
  const [content, setContent] = useState("");
  const [drafting, setDrafting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const load = async () => {
    const { data } = await api.get(`/grants/${id}`);
    setGrant(data);
    if (data.draft_id) {
      const d = await api.get(`/drafts/${data.draft_id}`);
      setDraft(d.data);
      setContent(d.data.content);
    }
  };

  useEffect(() => { load(); }, [id]);

  const generate = async () => {
    if (user?.plan !== "pro") {
      toast.error("AI drafting requires Pro");
      nav("/pricing");
      return;
    }
    setDrafting(true);
    try {
      const { data } = await api.post(`/grants/${id}/draft`);
      setDraft(data);
      toast.info("Drafting engine spinning up — this can take 60-120s");
      // Poll until generation is done
      const pollStart = Date.now();
      const poll = async () => {
        if (Date.now() - pollStart > 240000) {
          toast.error("Draft is taking longer than expected. Try again.");
          setDrafting(false);
          return;
        }
        try {
          const { data: d } = await api.get(`/drafts/${data.id}`);
          if (d.status === "review" || d.status === "submitted") {
            setDraft(d);
            setContent(d.content);
            toast.success("Draft ready for review");
            setDrafting(false);
            await load();
            return;
          }
          if (d.status === "failed") {
            toast.error("Drafting failed: " + (d.error || "unknown"));
            setDrafting(false);
            return;
          }
        } catch {}
        setTimeout(poll, 4000);
      };
      setTimeout(poll, 4000);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Draft failed");
      setDrafting(false);
    }
  };

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      await api.put(`/drafts/${draft.id}`, { content });
      toast.success("Saved");
    } finally { setSaving(false); }
  };

  const approve = async () => {
    if (!draft) return;
    try {
      await api.post(`/drafts/${draft.id}/approve`);
      toast.success("Submitted — Trust Boundary satisfied");
      setConfirmOpen(false);
      await load();
    } catch (e) { toast.error("Approval failed"); }
  };

  const exportDocx = async () => {
    if (!draft) return;
    try {
      const { data } = await api.get(`/drafts/${draft.id}/export`, { responseType: "blob" });
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      const safeTitle = (grant?.title || "grantpulse-draft").replace(/[^A-Za-z0-9 \-_]/g, "").slice(0, 60).trim() || "grantpulse-draft";
      a.download = `${safeTitle}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Draft exported");
    } catch (e) {
      toast.error(e.response?.data?.detail || "Export failed");
    }
  };

  if (!grant) return <div className="font-mono text-xs uppercase tracking-[0.3em] text-neutral-600">Loading…</div>;

  return (
    <div className="space-y-10" data-testid="grant-detail-page">
      <div>
        <Link to="/pipeline" className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500 hover:text-amber-500" data-testid="back-pipeline">← Pipeline</Link>
        <div className="mt-6 flex flex-wrap items-start gap-8">
          <div className="flex-1 min-w-0">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-500 mb-3">{grant.source} / {grant.external_id}</div>
            <h1 className="font-display font-bold text-3xl sm:text-4xl tracking-tight leading-tight">{grant.title}</h1>
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500 mt-4">{grant.agency}</div>
          </div>
          <div className={`font-mono text-6xl font-light tracking-tight ${grant.pow_score >= 85 ? "text-amber-500" : "text-neutral-400"}`} data-testid="pow-score">
            {grant.pow_score}%
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-600 mt-2 font-normal">PoW Score</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-px bg-neutral-900 border border-neutral-900">
          {[
            ["Deadline", grant.deadline || "—"],
            ["Funding", grant.funding_amount || "—"],
            ["Category", grant.category || "—"],
            ["Posted", grant.posted_date || "—"],
            ["Stage", grant.stage.toUpperCase()],
          ].map(([k, v]) => (
            <div key={k} className="bg-[#0a0a0a] p-5 flex justify-between gap-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">{k}</div>
              <div className="font-mono text-xs text-right text-white truncate">{v}</div>
            </div>
          ))}
          {grant.url && (
            <a href={grant.url} target="_blank" rel="noreferrer" className="bg-[#0a0a0a] p-5 flex items-center justify-between hover:bg-[#0f0f0f]" data-testid="source-link">
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">Source</div>
              <ExternalLink className="w-4 h-4 text-amber-500" />
            </a>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0a0a0a] border border-neutral-900 p-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-500 mb-3">/ Match Analysis</div>
            <p className="text-sm text-neutral-300 leading-relaxed">{grant.reasoning || "—"}</p>
          </div>
          <div className="bg-[#0a0a0a] border border-neutral-900 p-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-500 mb-3">/ Executive Summary</div>
            <p className="text-sm text-neutral-300 leading-relaxed">{grant.summary || "—"}</p>
          </div>
          <div className="bg-[#0a0a0a] border border-neutral-900 p-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-500 mb-3">/ Full Description</div>
            <p className="text-sm text-neutral-400 leading-relaxed whitespace-pre-wrap line-clamp-[20]">{grant.description || "—"}</p>
          </div>
        </div>
      </div>

      {/* Draft section */}
      <div className="border-t border-neutral-900 pt-10">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-500 mb-2">/ Drafting Engine</div>
            <h2 className="font-display font-bold text-2xl tracking-tight">AI Draft</h2>
          </div>
          {!draft ? (
            <button
              data-testid="generate-draft-btn"
              onClick={generate}
              disabled={drafting}
              className="inline-flex items-center gap-3 bg-amber-500 hover:bg-amber-400 text-black text-xs uppercase tracking-[0.2em] font-medium px-5 py-3 rounded-sm transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {drafting ? "Drafting…" : "Generate Draft"}
            </button>
          ) : (
            <div className="flex gap-3 flex-wrap">
              <button
                data-testid="export-docx-btn"
                onClick={exportDocx}
                disabled={draft.status === "generating"}
                className="inline-flex items-center gap-2 border border-neutral-700 hover:border-amber-500/50 text-xs uppercase tracking-[0.2em] px-4 py-2.5 rounded-sm transition-colors disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" /> Export DOCX
              </button>
              <button
                data-testid="save-draft-btn"
                onClick={save}
                disabled={saving}
                className="inline-flex items-center gap-2 border border-neutral-700 hover:border-neutral-500 text-xs uppercase tracking-[0.2em] px-4 py-2.5 rounded-sm transition-colors"
              >
                <Save className="w-3.5 h-3.5" /> {saving ? "Saving…" : "Save"}
              </button>
              {draft.status !== "submitted" && (
                <button
                  data-testid="approve-open-btn"
                  onClick={() => setConfirmOpen(true)}
                  className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black text-xs uppercase tracking-[0.2em] font-medium px-5 py-2.5 rounded-sm transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> Approve & Submit
                </button>
              )}
              {draft.status === "submitted" && (
                <div className="inline-flex items-center gap-2 text-amber-500 font-mono text-xs uppercase tracking-[0.2em]">
                  <CheckCircle2 className="w-4 h-4" /> Submitted
                </div>
              )}
            </div>
          )}
        </div>

        {draft ? (
          draft.status === "generating" ? (
            <div className="border border-amber-500/30 bg-amber-500/5 py-20 text-center" data-testid="draft-generating">
              <div className="inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.25em] text-amber-500">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Drafting engine is composing your response…
              </div>
              <div className="text-xs text-neutral-500 mt-4">Typically 60–120 seconds. Feel free to navigate away — results persist.</div>
            </div>
          ) : (
            <textarea
              data-testid="draft-editor"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={draft.status === "submitted"}
              className="w-full h-[600px] bg-black border border-neutral-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm p-6 font-mono leading-relaxed text-neutral-200 outline-none rounded-sm"
            />
          )
        ) : (
          <div className="border border-dashed border-neutral-800 py-20 text-center">
            <Sparkles className="w-6 h-6 text-neutral-700 mx-auto mb-4" />
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-600">No draft yet. Click Generate to let the drafting agent produce a full response using your persona and vault references.</div>
          </div>
        )}
      </div>

      {/* Approve confirm */}
      {confirmOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6" data-testid="approve-modal">
          <div className="bg-[#0a0a0a] border border-amber-500/40 max-w-md w-full p-8 gp-amber-glow">
            <ShieldCheck className="w-6 h-6 text-amber-500 mb-4" />
            <h3 className="font-display font-bold text-xl mb-3 tracking-tight">Trust Boundary</h3>
            <p className="text-sm text-neutral-400 leading-relaxed mb-6">
              You are about to mark this draft as <strong className="text-amber-500">APPROVED & SUBMITTED</strong>. The agent will record this action. Draft content cannot be edited after approval.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmOpen(false)} data-testid="approve-cancel-btn" className="text-xs uppercase tracking-[0.2em] border border-neutral-700 hover:border-neutral-500 px-4 py-2.5">Cancel</button>
              <button onClick={approve} data-testid="approve-confirm-btn" className="text-xs uppercase tracking-[0.2em] bg-amber-500 hover:bg-amber-400 text-black font-medium px-5 py-2.5">Confirm Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
