import React, { useState } from "react";
import { Dumbbell, Calendar, Clock, Plus, Trash2, Flame, Sparkles, Activity, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { GymSession, WorkoutExercise } from "../types";

interface GymTrackerProps {
  gymSessions: GymSession[];
  onAddGymSession: (session: GymSession) => void;
  onDeleteGymSession: (id: string) => void;
}

const PRESET_EXERCISES = [
  "Bench Press", "Squats", "Deadlifts", "Overhead Press", "Lat Pulldowns", 
  "Incline Dumbbell Press", "Bicep Curls", "Tricep Pushdowns", "Leg Press", 
  "Leg Extensions", "Plank Core Hold", "Treadmill Cardio Run", "Elliptical Session"
];

export default function GymTracker({ gymSessions, onAddGymSession, onDeleteGymSession }: GymTrackerProps) {
  // New session state
  const [timestamp, setTimestamp] = useState(() => {
    const now = new Date();
    // Format to YYYY-MM-DDTHH:MM
    const localISO = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    return localISO;
  });
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [notes, setNotes] = useState<string>("");
  
  // Workouts builder within the active session form
  const [exercisesList, setExercisesList] = useState<WorkoutExercise[]>([]);
  const [currentExercise, setCurrentExercise] = useState<string>("");
  const [currentSets, setCurrentSets] = useState<number>(3);
  const [currentReps, setCurrentReps] = useState<number>(10);
  const [currentWeight, setCurrentWeight] = useState<number>(60);

  // Expanded card trackers for UX
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  const handleAddExerciseToDraft = () => {
    const name = currentExercise.trim();
    if (!name) return;

    const newExercise: WorkoutExercise = {
      id: `ex-${Math.random().toString(36).substring(2, 9)}`,
      name,
      sets: currentSets,
      reps: currentReps,
      weight: currentWeight
    };

    setExercisesList(prev => [...prev, newExercise]);
    setCurrentExercise("");
    // Keep sets/reps but allow editing easily
  };

  const handleRemoveExerciseFromDraft = (id: string) => {
    setExercisesList(prev => prev.filter(ex => ex.id !== id));
  };

  const handleCommitSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (exercisesList.length === 0) {
      alert("Please add at least one exercise or workout to confirm this check-in.");
      return;
    }

    const newSession: GymSession = {
      id: `gym-${Math.random().toString(36).substring(2, 9)}`,
      timestamp,
      workouts: [...exercisesList],
      notes: notes.trim(),
      durationMinutes
    };

    onAddGymSession(newSession);

    // Reset Form
    setExercisesList([]);
    setNotes("");
    setDurationMinutes(45);
    // Expand the newly created session
    setExpandedSessionId(newSession.id);
  };

  // Compute local quick analytics
  const totalSessions = gymSessions.length;
  const avgDuration = totalSessions > 0 
    ? Math.round(gymSessions.reduce((acc, curr) => acc + curr.durationMinutes, 0) / totalSessions)
    : 0;

  // Count workouts/exercises ever done
  const totalExercisesEver = gymSessions.reduce((acc, curr) => acc + curr.workouts.length, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" id="gym-tracker-widget-panel">
      
      {/* 2-Columns Workout Session Composer (Form) */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* compose card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-805 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                <Flame className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 font-display">New Gym Check-in & Workout Logger</h2>
                <p className="text-[10px] text-slate-400 dark:text-slate-550 font-mono tracking-wider uppercase">Log your physical workouts, sets, and check-in times</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleCommitSession} className="p-6 space-y-6">
            
            {/* Core configuration metadata */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-550 uppercase tracking-widest mb-1.5 font-mono">Date & Check-in Time</label>
                <input
                  type="datetime-local"
                  required
                  value={timestamp}
                  onChange={(e) => setTimestamp(e.target.value)}
                  className="w-full text-xs font-mono font-bold bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-800 dark:text-slate-150"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-550 uppercase tracking-widest mb-1.5 font-mono">Duration (Minutes)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="5"
                    max="300"
                    required
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full text-xs font-mono font-bold bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-800 dark:text-slate-150"
                  />
                  <div className="absolute left-3 top-3 text-slate-400">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-550 uppercase tracking-widest mb-1.5 font-mono font-display">Notes / Body State</label>
                <div className="relative">
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-800 dark:text-slate-150"
                    placeholder="e.g. Great pump, solid focus"
                  />
                  <div className="absolute left-3 top-3 text-slate-400">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Inner Exercises Constructor Block */}
            <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/40 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2">
                <span className="text-xs font-bold text-slate-505 uppercase tracking-wider font-mono">Exercise Builder Matrix</span>
                <span className="text-3xs bg-slate-100 dark:bg-slate-900 border text-slate-500 font-mono px-2 py-0.5 rounded">
                  {exercisesList.length} items staged
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 items-end">
                
                {/* Exercise Name input + quick select options */}
                <div className="md:col-span-2">
                  <label className="block text-3xs font-extrabold text-slate-400 dark:text-slate-500 uppercase font-mono mb-1.5">Exercise Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={currentExercise}
                      onChange={(e) => setCurrentExercise(e.target.value)}
                      className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-500 font-semibold text-slate-800 dark:text-slate-150"
                      placeholder="e.g. Incline Bench Press"
                      list="preset-workouts"
                    />
                    <datalist id="preset-workouts">
                      {PRESET_EXERCISES.map((p, idx) => (
                        <option key={idx} value={p} />
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* Sub-block sets, reps, load */}
                <div className="grid grid-cols-3 gap-2 md:col-span-2">
                  <div>
                    <label className="block text-3xs font-extrabold text-slate-400 dark:text-slate-550 uppercase font-mono mb-1">Sets</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={currentSets}
                      onChange={(e) => setCurrentSets(Number(e.target.value))}
                      className="w-full text-xs text-center font-mono bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-lg py-2 outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-3xs font-extrabold text-slate-400 dark:text-slate-550 uppercase font-mono mb-1">Reps</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={currentReps}
                      onChange={(e) => setCurrentReps(Number(e.target.value))}
                      className="w-full text-xs text-center font-mono bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-lg py-2 outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-3xs font-extrabold text-slate-400 dark:text-slate-550 uppercase font-mono mb-1">Load (kg/lbs)</label>
                    <input
                      type="number"
                      min="0"
                      max="600"
                      value={currentWeight}
                      onChange={(e) => setCurrentWeight(Number(e.target.value))}
                      className="w-full text-xs text-center font-mono bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-805 rounded-lg py-2 outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                    />
                  </div>
                </div>

              </div>

              {/* Workout Quick Select Chips */}
              <div>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase font-mono block mb-1.5">Preset Shortcuts</span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_EXERCISES.slice(0, 8).map((p, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setCurrentExercise(p)}
                      className={`text-3xs px-2.5 py-1 rounded-md border font-bold transition-all transition-colors ${
                        currentExercise === p
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white dark:bg-slate-900 hover:bg-slate-100 border-slate-205 text-slate-650 dark:border-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddExerciseToDraft}
                className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-slate-700/50 cursor-pointer active:scale-99"
              >
                <Plus className="w-4 h-4 font-extrabold" />
                <span>Stage Exercise Into Check-in</span>
              </button>

              {/* Active list of workouts inside this draft session only */}
              {exercisesList.length > 0 && (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800/85 overflow-hidden">
                  {exercisesList.map((item, idx) => (
                    <div key={item.id} className="p-3 text-xs flex items-center justify-between gap-3 bg-white dark:bg-slate-900 leading-tight">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-400 font-mono">{idx + 1}.</span>
                        <div>
                          <p className="font-extrabold text-slate-800 dark:text-slate-200">{item.name}</p>
                          <p className="text-[11px] text-slate-450 font-mono mt-0.5">
                            {item.sets} sets × {item.reps} reps @ <strong>{item.weight} kg</strong>
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveExerciseFromDraft(item.id)}
                        className="text-slate-400 hover:text-rose-500 p-1 rounded-lg transition-colors cursor-pointer"
                        title="Delete exercise from session list"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                disabled={exercisesList.length === 0}
                className={`flex items-center gap-2 text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-md cursor-pointer ${
                  exercisesList.length === 0
                    ? "bg-slate-100 dark:bg-slate-805 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white active:scale-97"
                }`}
              >
                <Dumbbell className="w-4.5 h-4.5" />
                <span>Commit Gym Check-in Session</span>
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* Analytics Gauge and Sessions Journal List */}
      <div className="space-y-6">
        
        {/* Analytics Box */}
        <div className="bg-white dark:bg-slate-900 border border-slate-110 dark:border-slate-805 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
            <Activity className="w-4.5 h-4.5 text-indigo-550 dark:text-indigo-400" />
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-150 font-display">Check-in Summary Metrics</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-indigo-50/45 dark:bg-indigo-950/15 border border-indigo-100/40 rounded-xl text-center">
              <span className="text-[10px] text-indigo-500 dark:text-indigo-400 block font-mono font-extrabold uppercase">Total Visits</span>
              <strong className="text-2xl font-extrabold text-indigo-800 dark:text-indigo-300 font-mono mt-1 block">{totalSessions}</strong>
            </div>

            <div className="p-3 bg-emerald-50/45 dark:bg-emerald-950/15 border border-emerald-100/40 rounded-xl text-center">
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-mono font-extrabold uppercase">Avg Duration</span>
              <strong className="text-2xl font-extrabold text-emerald-800 dark:text-emerald-350 font-mono mt-1 block">{avgDuration} <span className="text-xs">m</span></strong>
            </div>

            <div className="col-span-2 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-805 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-semibold text-slate-505">Total Workouts Completed</span>
              </div>
              <span className="text-sm font-bold font-mono text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded border border-slate-205 dark:border-slate-800">
                {totalExercisesEver} exercises
              </span>
            </div>
          </div>
        </div>

        {/* Sessions archive log */}
        <div className="bg-white dark:bg-slate-900 border border-slate-110 dark:border-slate-805 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
            <Calendar className="w-4.5 h-4.5 text-indigo-550 dark:text-indigo-400" />
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-150 font-display">Gym Check-in Journal</h3>
          </div>

          <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
            {gymSessions.length === 0 ? (
              <p className="text-xs text-slate-450 p-4 text-center border border-dashed rounded-xl border-slate-200">No gym logs recorded yet. Complete check-in form to catalog your sessions.</p>
            ) : (
              gymSessions.map((session) => {
                const isExpanded = expandedSessionId === session.id;
                const d = new Date(session.timestamp);
                const readableDate = d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
                const readableTime = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

                return (
                  <div key={session.id} className="border border-slate-205/60 dark:border-slate-800 rounded-xl overflow-hidden transition-all shadow-3xs hover:border-slate-200">
                    {/* Header trigger */}
                    <div 
                      onClick={() => setExpandedSessionId(isExpanded ? null : session.id)}
                      className="p-3 bg-slate-50/70 hover:bg-slate-100/50 dark:bg-slate-950/20 dark:hover:bg-slate-950/45 flex items-center justify-between cursor-pointer"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <Dumbbell className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{readableDate}</span>
                          <span className="text-3xs text-slate-400 font-mono shrink-0">{readableTime}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 font-mono text-[10px] text-slate-500">
                          <span className="bg-slate-155 dark:bg-slate-900 px-1.5 py-0.2 rounded font-bold">{session.durationMinutes} minutes</span>
                          <span>•</span>
                          <span>{session.workouts.length} workouts</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 ml-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteGymSession(session.id);
                          }}
                          className="p-1 hover:bg-rose-50 hover:text-rose-650 dark:hover:bg-rose-955/25 dark:hover:text-rose-450 rounded-lg text-slate-400 transition-all"
                          title="Delete session"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </div>

                    {/* Detailed info expandable layout */}
                    {isExpanded && (
                      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 space-y-3">
                        {session.notes && (
                          <div className="text-xs italic bg-slate-55/40 dark:bg-slate-950/40 p-2 rounded-lg text-slate-505 border border-slate-100 text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                            <MessageSquare className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
                            <span>"{session.notes}"</span>
                          </div>
                        )}

                        <div className="space-y-2">
                          <span className="text-3xs font-extrabold uppercase font-mono tracking-wider text-slate-400 block">Exercises logged</span>
                          <div className="divide-y divide-slate-100 dark:divide-slate-800 border dark:border-slate-800 rounded-lg overflow-hidden">
                            {session.workouts.map((work, index) => (
                              <div key={work.id} className="p-2.5 text-xs flex justify-between items-center bg-slate-50/20">
                                <span className="font-semibold text-slate-700 dark:text-slate-300">{work.name}</span>
                                <span className="font-mono text-3xs font-bold text-slate-500">
                                  {work.sets} sets × {work.reps} reps @ <strong className="text-slate-700 dark:text-slate-350">{work.weight} kg</strong>
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
