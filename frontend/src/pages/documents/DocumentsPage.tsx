import { useState, type ChangeEvent, type FormEvent } from "react";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { summarizeDocument } from "../../api/documents.api";

type SummaryType = "normal" | "brief" | "detailed";

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

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    if (selected) {
      setFile(selected);
      setError(null);
      setResult(null);
    }
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

    try {
      const response = await summarizeDocument(file, summaryType);
      const data = response.data;

      setResult({
        filename: data.filename,
        summary: data.summary,
        cached: data.cached ?? false,
      });
    } catch {
      setError("Unable to summarize the document. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setFile(null);
    setResult(null);
    setError(null);
  }

  return (
    <div className="space-y-4">
      <Card
        title="Document Summarizer"
        description="Upload a document to get an AI-generated summary."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="doc-file"
              className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2"
            >
              Select document
            </label>
            <input
              id="doc-file"
              type="file"
              accept=".pdf,.txt,.doc,.docx,image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/30 dark:file:text-indigo-300"
            />
            {file && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Selected: {file.name}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="summary-type"
              className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2"
            >
              Summary type
            </label>
            <select
              id="summary-type"
              value={summaryType}
              onChange={(e) =>
                setSummaryType(e.target.value as SummaryType)
              }
              className="block w-full max-w-xs rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1.5 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="normal">Normal</option>
              <option value="brief">Brief</option>
              <option value="detailed">Detailed</option>
            </select>
          </div>

          {error && (
            <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={!file || loading}
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="mr-2 h-3 w-3 rounded-full border-2 border-white/70 border-t-transparent animate-spin" />
                  Summarizing…
                </>
              ) : (
                "Summarize"
              )}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center rounded-md border border-slate-300 dark:border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
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
        >
          <div className="rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 p-4">
            <p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {result.summary}
            </p>
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
