import React, { useState } from "react";
import { Sparkles, RefreshCw, AlertCircle, Calendar, Heart, ShoppingBag, DollarSign } from "lucide-react";
import { Task, Medication, GroceryItem, Expense, DailySnapshot, UserProfile, GymSession } from "../types";

interface AIBrieferProps {
  tasks: Task[];
  medications: Medication[];
  groceries: GroceryItem[];
  budgets: Expense[];
  currentBriefing: DailySnapshot | null;
  onUpdateBriefing: (briefing: DailySnapshot) => void;
  userProfile: UserProfile;
  gymSessions: GymSession[];
}

// Custom Premium Markdown/Bullet Parser to display beautiful micro-elements
const parseCustomMarkdown = (markdown: string) => {
  const lines = markdown.split("\n");
  return lines.map((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={idx} className="h-2" />;

    // Headers
    if (trimmed.startsWith("###")) {
      return (
        <h4 key={idx} className="text-sm font-semibold tracking-wide uppercase text-slate-500 dark:text-slate-400 mt-4 mb-2 first:mt-0 font-display">
          {trimmed.replace(/^###\s*/, "")}
        </h4>
      );
    }
    if (trimmed.startsWith("##")) {
      return (
        <h3 key={idx} className="text-base font-semibold text-slate-800 dark:text-slate-250 mt-5 border-b border-slate-100 dark:border-slate-800 pb-1.5 mb-2.5 font-display flex items-center gap-1.5">
          {trimmed.replace(/^##\s*/, "")}
        </h3>
      );
    }
    if (trimmed.startsWith("#")) {
      return (
        <h2 key={idx} className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-6 mb-3 font-display">
          {trimmed.replace(/^#\s*/, "")}
        </h2>
      );
    }

    // List item
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const content = trimmed.replace(/^[-*]\s*/, "");
      // Check if it's an urgent or reminder item to apply specific badges
      const isPriority = content.toLowerCase().includes("priority") || content.toLowerCase().includes("urgent") || content.toLowerCase().includes("important") || content.toLowerCase().includes("care");
      const isConflict = content.toLowerCase().includes("conflict") || content.toLowerCase().includes("overlap");

      return (
        <li
          key={idx}
          className={`flex items-start gap-2.5 py-1.5 px-3 rounded-lg mb-1.5 text-sm transition-colors ${
            isConflict
              ? "bg-amber-50/70 dark:bg-amber-950/40 border-l-2 border-amber-500 text-amber-900 dark:text-amber-200"
              : isPriority
              ? "bg-rose-50/70 dark:bg-rose-950/40 border-l-2 border-rose-500 text-rose-900 dark:text-rose-200"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850/50"
          }`}
        >
          <div className="mt-1 flex-shrink-0">
            {isConflict ? (
              <AlertCircle className="w-4 h-4 text-amber-500" />
            ) : isPriority ? (
              <Sparkles className="w-4 h-4 text-rose-400" />
            ) : (
              <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 mt-1" />
            )}
          </div>
          <span className="leading-relaxed">
            {renderBoldText(content)}
          </span>
        </li>
      );
    }

    // Standard paragraph
    return (
      <p key={idx} className="text-sm text-slate-600 dark:text-slate-355 leading-relaxed mb-3">
        {renderBoldText(trimmed)}
      </p>
    );
  });
};

// Helper to split and render bold strings safely
const renderBoldText = (text: string) => {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return <strong key={i} className="font-semibold text-slate-900 dark:text-white">{part}</strong>;
    }
    return part;
  });
};

export default function AIBriefer({
  tasks,
  medications,
  groceries,
  budgets,
  currentBriefing,
  onUpdateBriefing,
  userProfile,
  gymSessions,
}: AIBrieferProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);

  const loadingSteps = [
    "Contacting Life-Sync Intellect...",
    "Correlating medical schedules & dosage remaining...",
    "Scanning task deadlines & priority configurations...",
    "Evaluating daily expenses & grocery statuses...",
    "Checking schedule overlaps & resolving appointment conflicts...",
    "Synthesizing your personalized snapshot...",
  ];

  const handleGenerateBriefing = async () => {
    setLoading(true);
    setError(null);
    setLoadingStep(0);

    // Progressive step titles for gorgeous UX
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
    }, 1200);

    try {
      const response = await fetch("/api/gemini/briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tasks,
          medications,
          groceries,
          budgets,
          userProfile,
          gymSessions,
          currentDate: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Ecosystem connection issue. Please check API credentials.");
      }

      const data = await response.json();
      if (data.markdown) {
        onUpdateBriefing({
          markdown: data.markdown,
          generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      } else {
        throw new Error("No briefing synthesized in response.");
      }
    } catch (err: any) {
      setError(err.message || "Ecosystem synchronization failed.");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  // Helper stats for custom briefing badges
  const medicalAlerts = medications.filter(m => m.remainingPills <= m.refillThreshold).length;
  const highPriorityTasks = tasks.filter(t => !t.completed && (t.priority === "P1" || t.priority === "P2")).length;
  const pendingGroceries = groceries.filter(g => !g.purchased).length;

  return (
    <div id="ai-briefing-panel" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* Header section with sparkles status */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-linear-to-r from-slate-50 to-slate-100/50 dark:from-slate-900/60 dark:to-slate-900/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-slate-800 dark:text-slate-150">Ecosystem Snapshot</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">Powered by Life-Sync Intellect</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {currentBriefing && (
            <span className="text-xs text-slate-400 dark:text-slate-300 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200/40 dark:border-slate-700/40">
              Synced: {currentBriefing.generatedAt}
            </span>
          )}
          <button
            id="sync-ecosystem-btn"
            onClick={handleGenerateBriefing}
            disabled={loading}
            className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-xs ${
              loading
                ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                : "bg-indigo-600 dark:bg-indigo-5050 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 text-white active:scale-97 cursor-pointer"
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            {currentBriefing ? "Recalibrate Snapshot" : "Synchronize Ecosystem"}
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* If Loading show immersive progress card */}
        {loading && (
          <div className="py-12 px-4 flex flex-col items-center text-center">
            <div className="relative mb-6">
              <div className="w-16 h-16 rounded-full border-4 border-indigo-100 dark:border-indigo-950/45 border-t-indigo-600 dark:border-t-indigo-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-indigo-500 animate-pulse" />
              </div>
            </div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1.5 transition-all duration-300">
              {loadingSteps[loadingStep]}
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm">
              Cross-referencing medical databases, upcoming schedules, daily spendings, and shopping lists to ensure balanced coordination.
            </p>
          </div>
        )}

        {/* If Error */}
        {error && !loading && (
          <div className="flex items-start gap-3 p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 rounded-xl text-rose-800 dark:text-rose-200">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-500" />
            <div>
              <h4 className="font-semibold text-sm">Briefing Generation Halted</h4>
              <p className="text-xs text-rose-600 dark:text-rose-300 mt-1">{error}</p>
              <button
                onClick={handleGenerateBriefing}
                className="mt-2.5 text-xs underline font-semibold text-rose-700 dark:text-rose-400 hover:text-rose-955 hover:dark:text-rose-300 block"
              >
                Attempt Recalibration
              </button>
            </div>
          </div>
        )}

        {/* Static State Indicator Bar if no briefing yet generated */}
        {!currentBriefing && !loading && !error && (
          <div className="text-center py-10 px-4">
            <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mx-auto mb-4 text-slate-400 dark:text-slate-500">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-1">Synchronized AI Briefing Pending</h3>
            <p className="text-sm text-slate-400 dark:text-slate-400 max-w-md mx-auto mb-5">
              Click the synchronization button above to align medication inventories, prioritize active task files, categorise essentials, check budget scopes, and screen for medical schedule overlaps.
            </p>
            
            {/* Quick overview pills */}
            <div className="flex flex-wrap justify-center gap-3 max-w-md mx-auto">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-750 dark:text-rose-300 text-xs">
                <Heart className="w-3.5 h-3.5" />
                <span>Med Refills Flagged: {medicalAlerts}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 text-amber-700 dark:text-amber-300 text-xs">
                <Calendar className="w-3.5 h-3.5" />
                <span>Focus Tasks: {highPriorityTasks}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Shopping Items: {pendingGroceries}</span>
              </div>
            </div>
          </div>
        )}

        {/* Display completed briefing */}
        {currentBriefing && !loading && !error && (
          <div className="bg-slate-50/70 dark:bg-slate-950/30 border border-slate-100/50 dark:border-slate-800/80 rounded-xl p-5 md:p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider font-display">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span>Dynamic Daily Snapshot Report</span>
              </div>
              <span className="text-2xs bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-mono px-2 py-0.5 rounded-sm uppercase border border-indigo-100/40 dark:border-indigo-900/40">Active Sync</span>
            </div>
            <div className="markdown-body divide-y divide-slate-150 dark:divide-slate-800">
              {parseCustomMarkdown(currentBriefing.markdown)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
