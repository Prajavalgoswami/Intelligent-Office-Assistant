import { useState, useRef, type ChangeEvent, type FormEvent, type DragEvent } from "react";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { summarizeDocument } from "../../api/documents.api";

type SummaryType = "normal" | "brief" | "detailed";

const summaryTypes: { key: SummaryType; label: string; desc: string }[] = [
  { key: "brief", label: "Brief", desc: "Quick overview" },
  { key: "normal", label: "Normal", desc: "Balanced summary" },
  { key: "detailed", label: "Detailed", desc: "In-depth analysis" },
];

function getFileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return "📄";
  if (["doc", "docx"].includes(ext)) return "📝";
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "🖼️";
  if (ext === "txt") return "📃";
  return "📎";
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [summaryType, setSummaryType] = useState<SummaryType>("normal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    filename: string;
    summary: string;
    cached: boolean;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(selected: File) {
    setFile(selected);
    setError(null);
    setResult(null);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    if (selected) handleFileSelect(selected);
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) handleFileSelect(dropped);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setError("Please select a file.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setProgress(0);

    // Simulate progress
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 15, 90));
    }, 400);

    try {
      const response = await summarizeDocument(file, summaryType);
      const data = response.data;
      setProgress(100);

      setResult({
        filename: data.filename,
        summary: data.summary,
        cached: data.cached ?? false,
      });
    } catch {
      setError("Unable to summarize the document. Please try again.");
    } finally {
      clearInterval(interval);
      setLoading(false);
      setTimeout(() => setProgress(0), 500);
    }
  }

  function handleReset() {
    setFile(null);
    setResult(null);
    setError(null);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleCopy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  }

  return (
    <div className="space-y-4">
      <Card
        title="Document Summarizer"
        description="Upload a document to get an AI-generated summary."
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        }
        accentColor="blue"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Drag & Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center
              transition-all duration-300
              ${isDragging
                ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20 scale-[1.02]"
                : file
                  ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50/30 dark:bg-emerald-900/10"
                  : "border-slate-300 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-800/30 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10"
              }
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.doc,.docx,image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            {file ? (
              <div className="flex flex-col items-center gap-2 animate-[scaleIn_0.3s_ease-out]">
                <span className="text-4xl">{getFileIcon(file.name)}</span>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{file.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{formatFileSize(file.size)}</p>
                <p className="text-[11px] text-indigo-600 dark:text-indigo-400">Click or drop to replace</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                  <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Drop your file here, or <span className="text-indigo-600 dark:text-indigo-400">browse</span>
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    PDF, text, Word docs, or images
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Summary Type — Pill Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
              Summary type
            </label>
            <div className="inline-flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-700/40 p-1">
              {summaryTypes.map((st) => (
                <button
                  key={st.key}
                  type="button"
                  onClick={() => setSummaryType(st.key)}
                  className={`flex flex-col items-center rounded-lg px-4 py-2 transition-all duration-200 ${
                    summaryType === st.key
                      ? "bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <span className="text-xs font-medium">{st.label}</span>
                  <span className="text-[10px] opacity-70">{st.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-rose-200 dark:border-rose-800/40 bg-rose-50 dark:bg-rose-900/20 px-3 py-2 animate-[scaleIn_0.3s_ease-out]">
              <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
            </div>
          )}

          {/* Progress bar during loading */}
          {loading && (
            <div className="space-y-1.5 animate-[fadeSlideIn_0.3s_ease-out]">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">Analyzing document…</span>
                <span className="font-medium text-indigo-600 dark:text-indigo-400">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-blue-500 transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={!file || loading}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-md hover:shadow-indigo-500/20 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white/70 border-t-transparent animate-spin" />
                  Summarizing…
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Summarize
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Reset
            </button>
          </div>
        </form>
      </Card>

      {result ? (
        <Card
          title="Summary"
          description={`${result.filename}${result.cached ? " (cached)" : ""}`}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          accentColor="emerald"
        >
          <div className="relative">
            {/* Copy button */}
            <button
              type="button"
              onClick={handleCopy}
              className={`absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-all duration-200 ${
                copied
                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"
              }`}
            >
              {copied ? (
                <>
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </>
              )}
            </button>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 p-5 animate-[fadeSlideIn_0.4s_ease-out]">
              <p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 leading-relaxed pr-16">
                {result.summary}
              </p>
            </div>
          </div>
        </Card>
      ) : !loading && !file ? (
        <Card title="How it works">
          <EmptyState
            title="Upload a document"
            description="Select a PDF, text file, or image. The AI will extract text and generate a summary based on your chosen style."
          />
        </Card>
      ) : null}
    </div>
  );
}
