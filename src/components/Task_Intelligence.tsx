import React, { useState } from "react";
import { CheckSquare, Square, Calendar, Tag, AlertCircle, Plus, Sparkles, Trash2, ArrowDown, Search, Inbox, BarChart4 } from "lucide-react";
import { Task } from "../types";

interface TaskIntelligenceProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, "id" | "dateAdded">) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

export default function TaskIntelligence({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
}: TaskIntelligenceProps) {
  const [taskInput, setTaskInput] = useState("");
  const [loadingNLP, setLoadingNLP] = useState(false);
  const [nlpError, setNlpError] = useState<string | null>(null);

  // Fallback / manual states
  const [manualName, setManualName] = useState("");
  const [manualPriority, setManualPriority] = useState<"P1" | "P2" | "P3" | "P4">("P3");
  const [manualCategory, setManualCategory] = useState<"Work" | "Personal" | "Urgent">("Personal");
  const [manualDeadline, setManualDeadline] = useState("");

  const [activeFilter, setActiveFilter] = useState<"all" | "P1" | "Work" | "Personal" | "Urgent">("all");
  const [internalTab, setInternalTab] = useState<"active" | "completed">("active");
  const [completedSearch, setCompletedSearch] = useState("");

  const [nlpPreview, setNlpPreview] = useState<{
    name: string;
    category: "Work" | "Personal" | "Urgent";
    priority: "P1" | "P2" | "P3" | "P4";
    deadline: string | null;
  } | null>(null);

  const handleNLPAIDetection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskInput.trim()) return;
    setLoadingNLP(true);
    setNlpError(null);
    setNlpPreview(null);

    try {
      const response = await fetch("/api/gemini/parse-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: taskInput,
          currentDate: new Date().toISOString().split("T")[0],
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to parse. Check API secrets or backend status.");
      }

      const parsed = await response.json();
      if (parsed) {
        setNlpPreview(parsed);
        // Pre-fill manual builder in case they want to adjust
        setManualName(parsed.name || "");
        setManualCategory(parsed.category || "Personal");
        setManualPriority(parsed.priority || "P3");
        setManualDeadline(parsed.deadline || "");
      }
    } catch (err: any) {
      setNlpError(err.message || "Failed to utilize natural language intelligence.");
    } finally {
      setLoadingNLP(false);
    }
  };

  const executeAddFromPreview = () => {
    if (!manualName) return;
    onAddTask({
      name: manualName,
      priority: manualPriority,
      category: manualCategory,
      deadline: manualDeadline || null,
      completed: false,
    });
    setNlpPreview(null);
    setTaskInput("");
    setManualName("");
    setManualDeadline("");
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) return;
    onAddTask({
      name: manualName,
      priority: manualPriority,
      category: manualCategory,
      deadline: manualDeadline || null,
      completed: false,
    });
    setManualName("");
    setManualDeadline("");
  };

  const getPriorityBadgeColor = (p: string) => {
    switch (p) {
      case "P1": return "bg-rose-50 dark:bg-rose-955/30 text-rose-700 dark:text-rose-400 border-rose-205 dark:border-rose-900/30";
      case "P2": return "bg-amber-50 dark:bg-amber-955/30 text-amber-700 dark:text-amber-450 border-amber-205 dark:border-amber-900/30";
      case "P3": return "bg-yellow-50 dark:bg-yellow-955/35 text-yellow-850 dark:text-yellow-405 border-yellow-205 dark:border-yellow-905/30";
      default: return "bg-blue-50 dark:bg-blue-955/30 text-blue-700 dark:text-blue-400 border-blue-205 dark:border-blue-900/30";
    }
  };

  // Active / Complete subsets
  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  // Filter dynamic outputs
  const filteredActiveTasks = activeTasks.filter((t) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "P1") return t.priority === "P1";
    return t.category === activeFilter;
  });

  const filteredCompletedTasks = completedTasks.filter((t) => {
    return t.name.toLowerCase().includes(completedSearch.toLowerCase());
  });

  const completionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;

  return (
    <div id="tasks-intelligence-panel" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* Header Panel with Subtabs */}
      <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-5 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-550" />
            <h2 className="text-base font-bold font-display text-slate-800 dark:text-slate-150">Task Intelligence Module</h2>
          </div>

          <div className="flex bg-slate-100/80 dark:bg-slate-800 p-1 rounded-xl border border-slate-205/45 dark:border-slate-750/50 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setInternalTab("active")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-3xs font-bold rounded-lg transition-all cursor-pointer ${
                internalTab === "active"
                  ? "bg-white dark:bg-slate-900 text-indigo-650 dark:text-indigo-400 shadow-3xs"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <span>Current ({activeTasks.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setInternalTab("completed")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-3xs font-bold rounded-lg transition-all cursor-pointer ${
                internalTab === "completed"
                  ? "bg-white dark:bg-slate-900 text-indigo-650 dark:text-indigo-400 shadow-3xs"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <span>Completed Log ({completedTasks.length})</span>
            </button>
          </div>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-505 mt-1">AI-assisted natural language task scheduling and archived workflow statistics.</p>
      </div>

      <div className="p-5">
        
        {/* 1. INTERNAL ACTIVE TASKS VIEW */}
        {internalTab === "active" && (
          <div className="space-y-5">
            {/* NLP Entry Field */}
            <div className="bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl p-4 border border-indigo-100/60 dark:border-indigo-900/30">
              <h3 className="text-xs font-semibold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5 mb-2.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                <span>NLP Quick-scheduler / Deep Parse</span>
              </h3>

              <form onSubmit={handleNLPAIDetection} className="flex gap-2">
                <input
                  type="text"
                  id="nlp-task-input"
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  placeholder="e.g., Draft medical co-pays tomorrow morning P1, purchase baby milk work urgent..."
                  disabled={loadingNLP}
                  className="flex-1 text-sm bg-white dark:bg-slate-900 text-slate-805 dark:text-slate-100 border border-slate-202 dark:border-slate-800 rounded-xl px-3 py-2 focus:outline-hidden focus:ring-1 focus:ring-indigo-500/30 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={loadingNLP || !taskInput.trim()}
                  className="bg-indigo-650 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold text-xs px-4 py-2 rounded-xl h-9 flex items-center gap-1.5 transition-all active:scale-97 cursor-pointer disabled:opacity-50"
                >
                  {loadingNLP ? "Parsing..." : "AI Parse"}
                </button>
              </form>

              {nlpError && (
                <p className="text-2xs text-rose-600 dark:text-rose-450 font-mono mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {nlpError}
                </p>
              )}

              {/* NLP Suggestion Preview Drawer */}
              {nlpPreview && (
                <div className="mt-4 bg-white dark:bg-slate-900 rounded-xl border border-indigo-100/80 dark:border-indigo-900/50 p-4 shadow-3xs">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">
                    <span className="text-2xs font-bold text-indigo-700 dark:text-indigo-400 font-mono flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                      Life-Sync Categorized Result
                    </span>
                    <span className="text-3xs bg-slate-100 dark:bg-slate-805 text-slate-450 dark:text-slate-400 px-1.5 py-0.5 rounded font-mono font-medium">Verify Options</span>
                  </div>

                  <div className="space-y-3">
                    {/* Editable output parameter lists */}
                    <div>
                      <label className="block text-3xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Parsed Task Title (Adjustable)</label>
                      <input
                        type="text"
                        value={manualName}
                        onChange={(e) => setManualName(e.target.value)}
                        className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-3xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Category</label>
                        <select
                          value={manualCategory}
                          onChange={(e) => setManualCategory(e.target.value as any)}
                          className="w-full text-3xs bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-850 rounded p-1"
                        >
                          <option value="Work">Work</option>
                          <option value="Personal">Personal</option>
                          <option value="Urgent">Urgent</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-3xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Priority</label>
                        <select
                          value={manualPriority}
                          onChange={(e) => setManualPriority(e.target.value as any)}
                          className="w-full text-3xs bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-850 rounded p-1"
                        >
                          <option value="P1">P1 (Max)</option>
                          <option value="P2">P2</option>
                          <option value="P3">P3</option>
                          <option value="P4">P4</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-3xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Due / Deadline</label>
                        <input
                          type="text"
                          placeholder="e.g. YYYY-MM-DD"
                          value={manualDeadline}
                          onChange={(e) => setManualDeadline(e.target.value)}
                          className="w-full text-3xs bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-805 rounded p-1 text-center font-mono font-semibold"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-850">
                      <button
                        type="button"
                        onClick={() => setNlpPreview(null)}
                        className="text-3xs font-bold text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 px-2.5 py-1"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={executeAddFromPreview}
                        className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold text-3xs px-4 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" /> Commit Task File
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-3xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mr-1.5 font-display">Filters:</span>
              {(["all", "P1", "Work", "Personal", "Urgent"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`text-2xs font-semibold px-2.5 py-1 rounded-md cursor-pointer transition-colors ${
                    activeFilter === filter
                      ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-bold"
                      : "text-slate-505 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950/30 hover:text-slate-805 dark:hover:text-slate-200"
                  }`}
                >
                  {filter === "all" ? "All Active" : filter === "P1" ? "⚠️ P1" : filter}
                </button>
              ))}
            </div>

            {/* Task list render */}
            {filteredActiveTasks.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 dark:bg-slate-955/20 rounded-xl border border-dashed border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-400 dark:text-slate-500">Every task matches. No items logged here.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {filteredActiveTasks
                  .sort((a, b) => {
                    const pVal = { P1: 1, P2: 2, P3: 3, P4: 4 };
                    return pVal[a.priority] - pVal[b.priority];
                  })
                  .map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-100/85 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 shadow-3xs rounded-xl"
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <button
                          onClick={() => onToggleTask(task.id)}
                          className="mt-0.5 text-slate-350 hover:text-indigo-600 dark:text-slate-650 transition-colors flex-shrink-0 cursor-pointer animate-none"
                          title="Complete Task"
                        >
                          <Square className="w-5 h-5" />
                        </button>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-750 dark:text-slate-200 truncate">
                            {task.name}
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                            <span className={`text-3xs font-extrabold border rounded-sm px-1.5 py-0.5 leading-none ${getPriorityBadgeColor(task.priority)}`}>
                              {task.priority}
                            </span>
                            <span className={`text-3xs px-1.5 py-0.5 rounded-sm font-medium leading-none ${
                              task.category === "Urgent" ? "bg-rose-100 dark:bg-rose-955/40 text-rose-800 dark:text-rose-300" :
                              task.category === "Work" ? "bg-slate-105 dark:bg-slate-800 text-slate-700 dark:text-slate-300" : "bg-blue-50 dark:bg-blue-955/30 text-blue-700 dark:text-blue-400"
                            }`}>
                              {task.category}
                            </span>
                            {task.deadline && (
                              <span className="flex items-center gap-1 text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm font-mono font-medium">
                                <Calendar className="w-2.5 h-2.5 text-rose-500" />
                                <span>{task.deadline}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="text-slate-300 hover:text-rose-600 dark:text-slate-600 dark:hover:text-rose-400 p-1 rounded-lg cursor-pointer transition-colors flex-shrink-0"
                        title="Delete task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
              </div>
            )}

            {/* Manual Quick Add */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-3xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2.5">Manual Entry Build</h4>
              <form onSubmit={handleManualAdd} className="flex flex-col md:flex-row gap-2">
                <input
                  type="text"
                  required
                  placeholder="Draft medical report, renew passport..."
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="flex-1 text-xs bg-white dark:bg-slate-900 border border-slate-202 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                />
                <div className="flex flex-wrap gap-2">
                  <select
                    value={manualCategory}
                    onChange={(e) => setManualCategory(e.target.value as any)}
                    className="text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-250 rounded-lg px-2 py-1 select-none font-semibold"
                  >
                    <option value="Personal">Personal</option>
                    <option value="Work">Work</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                  <select
                    value={manualPriority}
                    onChange={(e) => setManualPriority(e.target.value as any)}
                    className="text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-250 rounded-lg px-2 py-1 select-none font-semibold"
                  >
                    <option value="P1">P1</option>
                    <option value="P2">P2</option>
                    <option value="P3">P3</option>
                    <option value="P4">P4</option>
                  </select>
                  <input
                    type="date"
                    value={manualDeadline}
                    onChange={(e) => setManualDeadline(e.target.value)}
                    className="text-xs bg-slate-50 dark:bg-slate-900 border border-slate-202 dark:border-slate-800 text-slate-705 dark:text-slate-200 rounded-lg px-2.5 py-1"
                  />
                  <button
                    type="submit"
                    disabled={!manualName.trim()}
                    className="bg-slate-850 hover:bg-slate-900 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-1 rounded-lg border border-slate-800 dark:border-indigo-650 cursor-pointer disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 2. COMPLETED TASK HISTORY LOGS (THE "PAST DETAILS") */}
        {internalTab === "completed" && (
          <div className="space-y-4">
            {/* KPI overview */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-slate-50/50 dark:bg-slate-950/20 p-3 rounded-xl border border-slate-100 dark:border-slate-805">
              <div className="flex flex-col items-center justify-center p-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850/50 rounded-lg">
                <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Total Cleared</span>
                <span className="text-base font-black font-display text-emerald-600 dark:text-emerald-450">{completedTasks.length} Done</span>
              </div>
              <div className="flex flex-col items-center justify-center p-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850/50 rounded-lg">
                <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Efficacy Index</span>
                <span className="text-base font-black font-display text-indigo-700 dark:text-indigo-400 font-mono">{completionRate.toFixed(0)}%</span>
              </div>
              <div className="col-span-2 md:col-span-1 flex flex-col items-center justify-center p-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850/50 rounded-lg">
                <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold font-display">Backlog remaining</span>
                <span className="text-sm font-bold text-slate-650 dark:text-slate-300 font-mono">{activeTasks.length} Pending</span>
              </div>
            </div>

            {/* Completed Task Search bar */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-450 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search past completed tasks..."
                value={completedSearch}
                onChange={(e) => setCompletedSearch(e.target.value)}
                className="w-full bg-slate-50/20 dark:bg-slate-950/20 text-xs border border-slate-201 dark:border-slate-805 rounded-lg pl-8 p-1.5 text-slate-800 dark:text-slate-100 focus:outline-hidden"
              />
            </div>

            {/* List */}
            <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
              {filteredCompletedTasks.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 dark:bg-slate-955/25 rounded-md border border-dashed border-slate-201 dark:border-slate-800">
                  <p className="text-xs text-slate-400 dark:text-slate-500">No completed tasks match your description search.</p>
                </div>
              ) : (
                [...filteredCompletedTasks].map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-2.5 bg-slate-55/35 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-805 hover:bg-slate-50/80 dark:hover:bg-slate-850 rounded-xl"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        onClick={() => onToggleTask(task.id)}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-slate-400 transition-colors flex-shrink-0 cursor-pointer animate-none"
                        title="Re-open task"
                      >
                        <CheckSquare className="w-5 h-5" />
                      </button>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 line-through truncate leading-relaxed">
                          {task.name}
                        </p>
                        <span className="text-[10px] text-slate-400 dark:text-slate-505 font-mono block">
                          Logged: {task.dateAdded} {task.deadline ? `| Deadline: ${task.deadline}` : ""}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-3xs bg-slate-100 dark:bg-slate-800 text-slate-450 dark:text-slate-400 border border-slate-150 px-1.5 py-0.5 rounded uppercase font-mono font-bold leading-none">
                        Completed
                      </span>
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="text-slate-305 hover:text-rose-600 dark:text-slate-650 dark:hover:text-rose-400 p-0.5 transition-colors cursor-pointer"
                        title="Purge record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
