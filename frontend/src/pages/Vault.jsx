import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { UploadCloud, FileText, Trash2 } from "lucide-react";

export default function Vault() {
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);

  const load = async () => {
    const { data } = await api.get("/vault");
    setFiles(data);
  };
  useEffect(() => { load(); }, []);

  const upload = async (f) => {
    if (!f) return;
    if (!f.name.toLowerCase().endsWith(".pdf")) { toast.error("PDF only"); return; }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", f);
      await api.post("/vault/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("PDF indexed for tone training");
      await load();
    } catch (e) {
      toast.error("Upload failed");
    } finally { setBusy(false); if (inputRef.current) inputRef.current.value = ""; }
  };

  const del = async (id) => {
    await api.delete(`/vault/${id}`);
    toast.success("Removed");
    await load();
  };

  return (
    <div className="max-w-3xl space-y-10" data-testid="vault-page">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-500 mb-3">/ Vault</div>
        <h1 className="font-display font-black text-4xl sm:text-5xl tracking-tighter">Past proposals.</h1>
        <p className="text-sm text-neutral-500 mt-3 max-w-xl">Drop winning proposals here. The drafting engine mirrors your voice, structure, and technical language.</p>
      </div>

      <label
        htmlFor="vault-upload-input"
        className="block border border-dashed border-neutral-700 hover:border-amber-500/60 p-12 text-center cursor-pointer transition-colors"
        data-testid="vault-dropzone"
      >
        <UploadCloud className="w-8 h-8 text-neutral-600 mx-auto mb-4" />
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-400">
          {busy ? "Processing PDF…" : "Click to upload PDF"}
        </div>
        <input
          id="vault-upload-input"
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => upload(e.target.files?.[0])}
          data-testid="vault-file-input"
        />
      </label>

      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-500 mb-4">/ Indexed files — {files.length}</div>
        {files.length === 0 ? (
          <div className="text-xs font-mono uppercase tracking-wider text-neutral-600 py-8 text-center border border-dashed border-neutral-900">No files</div>
        ) : (
          <div className="divide-y divide-neutral-900 border border-neutral-900" data-testid="vault-file-list">
            {files.map((f) => (
              <div key={f.id} className="flex items-center gap-4 px-5 py-4 bg-[#0a0a0a]" data-testid={`file-row-${f.id}`}>
                <FileText className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{f.original_filename}</div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-600 mt-0.5">
                    {(f.size / 1024).toFixed(1)} KB · {new Date(f.created_at).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={() => del(f.id)}
                  data-testid={`file-delete-${f.id}`}
                  className="text-neutral-500 hover:text-red-500 p-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
