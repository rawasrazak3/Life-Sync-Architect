import React, { useState, useEffect } from "react";
import { Pill, Activity, Calendar, AlertCircle, Plus, Heart, HeartPulse, Trash2, CheckCircle, Search, History, TrendingUp, Sparkles, Eye } from "lucide-react";
import { Medication, SymptomLog, Appointment, MedicationIntakeLog } from "../types";

interface MedicalTrackerProps {
  medications: Medication[];
  symptomLogs: SymptomLog[];
  appointments: Appointment[];
  onAddMedication: (med: Omit<Medication, "id">) => void;
  onTakeMedication: (id: string) => void;
  onRefillMedication: (id: string, customAmount?: number) => void;
  onDeleteMedication: (id: string) => void;
  onAddSymptomLog: (log: Omit<SymptomLog, "id" | "timestamp">) => void;
  onDeleteSymptomLog: (id: string) => void;
  onAddAppointment: (appt: Omit<Appointment, "id">) => void;
  onDeleteAppointment: (id: string) => void;
}

export default function MedicalTracker({
  medications,
  symptomLogs,
  appointments,
  onAddMedication,
  onTakeMedication,
  onRefillMedication,
  onDeleteMedication,
  onAddSymptomLog,
  onDeleteSymptomLog,
  onAddAppointment,
  onDeleteAppointment,
}: MedicalTrackerProps) {
  const [activeTab, setActiveTab] = useState<"medications" | "vitals" | "appointments" | "history">("medications");
  
  // Independent local state for intake history, persisting cleanly to localstorage
  const [intakeLogs, setIntakeLogs] = useState<MedicationIntakeLog[]>(() => {
    const val = localStorage.getItem("lifesync_med_intake_logs");
    if (val) return JSON.parse(val);
    
    // Default initial mock logs to prevent empty history pages
    const now = new Date();
    return [
      {
        id: "intake-1",
        medicationId: "med-1",
        medicationName: "Lisinopril (Blood Pressure)",
        dosage: "10mg",
        timestamp: new Date(now.getTime() - 2 * 3600 * 1000).toISOString(),
      },
      {
        id: "intake-2",
        medicationId: "med-2",
        medicationName: "Vitamin D3 (Immunity Support)",
        dosage: "2000 IU",
        timestamp: new Date(now.getTime() - 28 * 3600 * 1000).toISOString(),
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem("lifesync_med_intake_logs", JSON.stringify(intakeLogs));
  }, [intakeLogs]);

  // States for new medication form
  const [medName, setMedName] = useState("");
  const [medDosage, setMedDosage] = useState("");
  const [medFreq, setMedFreq] = useState("Once daily");
  const [medTotal, setMedTotal] = useState(30);
  const [medThreshold, setMedThreshold] = useState(5);
  const [showAddMed, setShowAddMed] = useState(false);

  // States for symptom/vitals log form
  const [systolic, setSystolic] = useState("120");
  const [diastolic, setDiastolic] = useState("80");
  const [heartRate, setHeartRate] = useState(72);
  const [temp, setTemp] = useState(98.6);
  const [symptomDesc, setSymptomDesc] = useState("");
  const [showAddSymptom, setShowAddSymptom] = useState(false);

  // States for appointment form
  const [apptTitle, setApptTitle] = useState("");
  const [apptDate, setApptDate] = useState("");
  const [apptTime, setApptTime] = useState("");
  const [apptNotes, setApptNotes] = useState("");
  const [showAddAppt, setShowAddAppt] = useState(false);

  // Filter & Search states inside the history hub
  const [historySearch, setHistorySearch] = useState("");
  const [selectedSubHistory, setSelectedSubHistory] = useState<"all" | "intakes" | "symptoms">("all");

  const handleMedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName || !medDosage) return;
    onAddMedication({
      name: medName,
      dosage: medDosage,
      frequency: medFreq,
      remainingPills: medTotal,
      totalPills: medTotal,
      refillThreshold: medThreshold,
      lastIntake: null,
    });
    setMedName("");
    setMedDosage("");
    setMedFreq("Once daily");
    setMedTotal(30);
    setMedThreshold(5);
    setShowAddMed(false);
  };

  const handleSymptomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddSymptomLog({
      bloodPressure: `${systolic}/${diastolic}`,
      heartRate: Number(heartRate),
      temperature: Number(temp),
      description: symptomDesc,
    });
    setSymptomDesc("");
    setSystolic("120");
    setDiastolic("80");
    setHeartRate(72);
    setTemp(98.6);
    setShowAddSymptom(false);
  };

  const handleApptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apptTitle || !apptDate) return;
    onAddAppointment({
      title: apptTitle,
      dateTime: `${apptDate}T${apptTime || "12:00"}`,
      notes: apptNotes,
    });
    setApptTitle("");
    setApptDate("");
    setApptTime("");
    setApptNotes("");
    setShowAddAppt(false);
  };

  // Intercept the onTakeMedication handler from the parent state to create a complete history index item!
  const handleInterceptTakeMedication = (med: Medication) => {
    onTakeMedication(med.id);
    setIntakeLogs((prev) => [
      {
        id: `intake-${Math.random().toString(36).substring(2, 9)}`,
        medicationId: med.id,
        medicationName: med.name,
        dosage: med.dosage,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const handleDeleteIntakeLog = (id: string) => {
    setIntakeLogs((prev) => prev.filter((i) => i.id !== id));
  };


  return (
    <div id="medical-tracker-panel" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* Mini-tab bar Header */}
      <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 px-5 pt-4">
        <div className="flex items-center gap-2 mb-3">
          <HeartPulse className="w-5 h-5 text-rose-500" />
          <h2 className="text-base font-bold font-display text-slate-800 dark:text-slate-150">Medical & Wellness Hub</h2>
        </div>

        <div className="flex gap-1 flex-wrap">
          <button
            id="medication-tab-btn"
            onClick={() => setActiveTab("medications")}
            className={`flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-t-xl transition-all border-b-2 cursor-pointer ${
              activeTab === "medications"
                ? "border-rose-500 text-rose-600 dark:text-rose-455 bg-white dark:bg-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-205"
            }`}
          >
            <Pill className="w-3.5 h-3.5" />
            <span>Medications</span>
            {medications.some(m => m.remainingPills <= m.refillThreshold) && (
              <span className="w-2 h-2 rounded-full bg-rose-500 ring-4 ring-rose-50 dark:ring-rose-950/40" />
            )}
          </button>

          <button
            id="vitals-tab-btn"
            onClick={() => setActiveTab("vitals")}
            className={`flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-t-xl transition-all border-b-2 cursor-pointer ${
              activeTab === "vitals"
                ? "border-rose-500 text-rose-600 dark:text-rose-455 bg-white dark:bg-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-205"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Symptoms & Vitals</span>
          </button>

          <button
            id="appointments-tab-btn"
            onClick={() => setActiveTab("appointments")}
            className={`flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-t-xl transition-all border-b-2 cursor-pointer ${
              activeTab === "appointments"
                ? "border-rose-500 text-rose-600 dark:text-rose-455 bg-white dark:bg-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-205"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Appointments</span>
          </button>

          <button
            id="history-tab-btn"
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-t-xl transition-all border-b-2 cursor-pointer ${
              activeTab === "history"
                ? "border-rose-500 text-rose-600 dark:text-rose-455 bg-white dark:bg-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-205"
            }`}
          >
            <History className="w-3.5 h-3.5 text-rose-550 dark:text-rose-400" />
            <span className="text-rose-600 dark:text-rose-400">History & Vitals database</span>
          </button>
        </div>
      </div>

      <div className="p-5">
        {/* TAB 1: MEDICATIONS */}
        {activeTab === "medications" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">Pill Counts & Dosage Schedules</span>
              <button
                id="show-add-med-btn"
                onClick={() => setShowAddMed(!showAddMed)}
                className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-450 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/10 hover:bg-rose-100 dark:hover:bg-rose-900/20 px-3 py-1.5 rounded-lg font-semibold cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Track Medication</span>
              </button>
            </div>

            {/* Add Medication Form */}
            {showAddMed && (
              <form onSubmit={handleMedSubmit} className="mb-5 p-4 bg-slate-50 dark:bg-slate-955/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-2xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Medication Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Lisinopril, Omega 3"
                      value={medName}
                      onChange={(e) => setMedName(e.target.value)}
                      className="w-full text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-2xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Dosage</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., 10mg, 2 capsules"
                      value={medDosage}
                      onChange={(e) => setMedDosage(e.target.value)}
                      className="w-full text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-2xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Frequency</label>
                    <select
                      value={medFreq}
                      onChange={(e) => setMedFreq(e.target.value)}
                      className="w-full text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                    >
                      <option>Once daily</option>
                      <option>Twice daily</option>
                      <option>Every other day</option>
                      <option>As needed (PRN)</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-2xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Total Pills</label>
                      <input
                        type="number"
                        min="1"
                        value={medTotal}
                        onChange={(e) => setMedTotal(Number(e.target.value))}
                        className="w-full text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-2xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Alert Count limit</label>
                      <input
                        type="number"
                        min="0"
                        value={medThreshold}
                        onChange={(e) => setMedThreshold(Number(e.target.value))}
                        className="w-full text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddMed(false)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
                  >
                    Save Medication
                  </button>
                </div>
              </form>
            )}

            {/* List of Medications */}
            {medications.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 dark:bg-slate-950/20 rounded-xl border border-dashed border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">No tracked medications. Click "Track Medication" to begin.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {medications.map((med) => {
                  const isLow = med.remainingPills <= med.refillThreshold;
                  return (
                    <div
                      key={med.id}
                      className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        isLow ? "bg-rose-50/50 dark:bg-rose-955/20 border-rose-101 dark:border-rose-900/40" : "bg-slate-50/30 dark:bg-slate-950/10 border-slate-100 dark:border-slate-800/60"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Pill className={`w-4 h-4 ${isLow ? "text-rose-550 animate-pulse" : "text-slate-400 dark:text-slate-500"}`} />
                          <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 font-display">{med.name}</h4>
                          <span className="text-2xs bg-slate-100 dark:bg-slate-850 border border-slate-200/50 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-mono px-2 py-0.5 rounded">
                            {med.dosage}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Frequency: <strong className="text-slate-700 dark:text-slate-350 font-medium">{med.frequency}</strong>
                        </p>
                        
                        {/* Remaining Pill Tracker Progress */}
                        <div className="mt-2.5 flex items-center gap-2">
                          <div className="w-24 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full ${isLow ? "bg-rose-500" : "bg-teal-550 dark:bg-teal-500"}`}
                              style={{ width: `${Math.max(2, Math.min(100, (med.remainingPills / med.totalPills) * 100))}%` }}
                            />
                          </div>
                          <span className={`text-2xs font-extrabold font-mono ${isLow ? "text-rose-600 dark:text-rose-400" : "text-slate-550 dark:text-slate-400"}`}>
                            {med.remainingPills} / {med.totalPills} remaining
                          </span>
                        </div>
                      </div>

                      {/* Pill interaction buttons */}
                      <div className="flex items-center justify-between md:justify-end gap-2.5 border-t border-slate-100 dark:border-slate-800 md:border-t-0 pt-2 md:pt-0">
                        {isLow && (
                          <span className="flex items-center gap-1 text-[10px] bg-rose-100 dark:bg-rose-955 text-rose-800 dark:text-rose-300 px-2 py-0.5 rounded font-extrabold tracking-wide uppercase border border-rose-205/60 dark:border-rose-900/60 leading-none">
                            <AlertCircle className="w-3 h-3" />
                            Refill Low
                          </span>
                        )}

                        <div className="flex items-center gap-2 ml-auto">
                          <button
                            title="Log Intake (Deduct 1 Pill)"
                            onClick={() => handleInterceptTakeMedication(med)}
                            disabled={med.remainingPills <= 0}
                            className="flex items-center gap-1 hover:scale-102 hover:shadow-xs text-xs font-semibold px-3 py-1.5 rounded-lg text-rose-700 dark:text-rose-300 bg-white dark:bg-slate-900 border border-rose-250 dark:border-rose-900 h-8 cursor-pointer disabled:opacity-40 disabled:pointer-events-none transition-all"
                          >
                            <CheckCircle className="w-3.5 h-3.5 text-rose-500" />
                            <span>Log Intake</span>
                          </button>

                          <button
                            title="Refill back to maximum count"
                            onClick={() => onRefillMedication(med.id)}
                            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-205 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs px-2.5 py-1.5 rounded-lg h-8 cursor-pointer font-bold transition-all"
                          >
                            Refill
                          </button>

                          <button
                            title="Delete medication log"
                            onClick={() => onDeleteMedication(med.id)}
                            className="text-slate-350 hover:text-rose-600 dark:text-slate-650 dark:hover:text-rose-405 p-1 rounded-lg cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SYMPTOMS & VITALS ENTRY */}
        {activeTab === "vitals" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">Biometric Logs & Diagnostic Tracking</span>
              <button
                id="show-add-symptom-btn"
                onClick={() => setShowAddSymptom(!showAddSymptom)}
                className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-455 hover:text-rose-750 bg-rose-50 dark:bg-rose-950/10 hover:bg-rose-100 dark:hover:bg-rose-905/20 px-3 py-1.5 rounded-lg font-semibold cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Vitals</span>
              </button>
            </div>

            {/* Vitals Input Panel */}
            {showAddSymptom && (
              <form onSubmit={handleSymptomSubmit} className="mb-5 p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-2xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Blood Pressure</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        required
                        value={systolic}
                        onChange={(e) => setSystolic(e.target.value)}
                        className="w-16 text-center text-sm bg-white dark:bg-slate-900 border border-slate-202 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-lg p-2 focus:outline-hidden"
                        placeholder="Sys"
                        title="Systolic Pressure"
                      />
                      <span className="text-slate-400">/</span>
                      <input
                        type="text"
                        required
                        value={diastolic}
                        onChange={(e) => setDiastolic(e.target.value)}
                        className="w-16 text-center text-sm bg-white dark:bg-slate-900 border border-slate-202 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-lg p-2 focus:outline-hidden"
                        placeholder="Dia"
                        title="Diastolic Pressure"
                      />
                      <span className="text-3xs font-mono text-slate-400 dark:text-slate-500">mmHg</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-2xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Heart Rate</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="30"
                        required
                        value={heartRate}
                        onChange={(e) => setHeartRate(Number(e.target.value))}
                        className="w-20 text-center text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-lg p-2 focus:outline-hidden"
                      />
                      <span className="text-3xs font-mono text-slate-400 dark:text-slate-505">bpm</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-2xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Body Temp</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={temp}
                        onChange={(e) => setTemp(Number(e.target.value))}
                        className="w-20 text-center text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 text-slate-800 dark:text-slate-100 rounded-lg p-2 focus:outline-hidden"
                      />
                      <span className="text-3xs font-mono text-slate-400 dark:text-slate-505">°F</span>
                    </div>
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-2xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Symptom Notes / Descriptions</label>
                    <textarea
                      placeholder="List any symptoms, headaches, pain indexes, or medication triggers..."
                      value={symptomDesc}
                      onChange={(e) => setSymptomDesc(e.target.value)}
                      className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-lg p-2.5 text-slate-800 dark:text-slate-100 h-16 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddSymptom(false)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 cursor-pointer"
                  >
                    Commit Log Entry
                  </button>
                </div>
              </form>
            )}

            {/* List of Symptoms */}
            {symptomLogs.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 dark:bg-slate-955/25 rounded-xl border border-dashed border-slate-101 dark:border-slate-805">
                <p className="text-xs text-slate-405 dark:text-slate-500">No symptoms logged yet. Clocking your vitals constructs historical graphs.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {symptomLogs.slice().reverse().map((log) => (
                  <div key={log.id} className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-950/20">
                    <div className="flex items-center justify-between border-b border-dashed border-slate-200/50 dark:border-slate-800 pb-2 mb-2">
                      <span className="text-[10px] text-slate-400 dark:text-slate-505 font-mono font-bold uppercase">
                        Vitals Entry Log | {new Date(log.timestamp).toLocaleDateString()} @ {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <button
                        onClick={() => onDeleteSymptomLog(log.id)}
                        className="text-slate-300 hover:text-rose-600 dark:text-slate-600 dark:hover:text-rose-400 p-1 rounded transition-colors cursor-pointer"
                        title="Delete log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-white dark:bg-slate-900 border border-slate-105 dark:border-slate-800 p-1.5 rounded-lg text-center shadow-3xs">
                        <span className="block text-[8px] text-slate-400 uppercase tracking-widest font-bold">BP INDEX</span>
                        <strong className="text-xs font-mono font-black text-rose-600 dark:text-rose-400">{log.bloodPressure}</strong>
                        <span className="text-[8px] text-slate-400 font-mono block">mmHg</span>
                      </div>
                      <div className="bg-white dark:bg-slate-900 border border-slate-105 dark:border-slate-800 p-1.5 rounded-lg text-center shadow-3xs">
                        <span className="block text-[8px] text-slate-400 uppercase tracking-widest font-bold">PULSE RATE</span>
                        <strong className="text-xs font-mono font-black text-slate-700 dark:text-slate-300">{log.heartRate}</strong>
                        <span className="text-[8px] text-slate-400 font-mono block">bpm</span>
                      </div>
                      <div className="bg-white dark:bg-slate-900 border border-slate-105 dark:border-slate-850 p-1.5 rounded-lg text-center shadow-3xs">
                        <span className="block text-[8px] text-slate-400 uppercase tracking-widest font-bold">TEMPERATURE</span>
                        <strong className="text-xs font-mono font-black text-slate-700 dark:text-slate-300">{log.temperature}</strong>
                        <span className="text-[8px] text-slate-400 font-mono block">°F</span>
                      </div>
                    </div>

                    {log.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-350 mt-2 italic bg-white dark:bg-slate-900/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                        "{log.description}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: APPOINTMENTS SCHEDULE */}
        {activeTab === "appointments" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">Physicians & Appointments Calendar</span>
              <button
                id="show-add-appt-btn"
                onClick={() => setShowAddAppt(!showAddAppt)}
                className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-455 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/15 hover:bg-rose-100 dark:hover:bg-rose-900/20 px-3 py-1.5 rounded-lg font-semibold cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Schedule Visit</span>
              </button>
            </div>

            {/* Appointment Form */}
            {showAddAppt && (
              <form onSubmit={handleApptSubmit} className="mb-5 p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="space-y-3">
                  <div>
                    <label className="block text-2xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Appointment Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Dentist Checkup, Cardiologist Consultation"
                      value={apptTitle}
                      onChange={(e) => setApptTitle(e.target.value)}
                      className="w-full text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-lg p-2 focus:outline-hidden"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-2xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Date</label>
                      <input
                        type="date"
                        required
                        value={apptDate}
                        onChange={(e) => setApptDate(e.target.value)}
                        className="w-full text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-lg p-2 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-2xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Time</label>
                      <input
                        type="time"
                        value={apptTime}
                        onChange={(e) => setApptTime(e.target.value)}
                        className="w-full text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-lg p-2 focus:outline-hidden"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-2xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Notes / Physicians Suite</label>
                    <input
                      type="text"
                      placeholder="e.g., Bring current blood test reports, Suite 305"
                      value={apptNotes}
                      onChange={(e) => setApptNotes(e.target.value)}
                      className="w-full text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-lg p-2 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddAppt(false)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 cursor-pointer"
                  >
                    Schedule Appointment
                  </button>
                </div>
              </form>
            )}

            {/* List of Appointments */}
            {appointments.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 dark:bg-slate-950/20 rounded-xl border border-dashed border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-404 dark:text-slate-500 font-medium font-sans">No scheduled physician visits. Add checks for alignment calculations.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {[...appointments].sort((a,b) => a.dateTime.localeCompare(b.dateTime)).map((appt) => {
                  const dateObj = new Date(appt.dateTime);
                  return (
                    <div key={appt.id} className="p-3 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800 rounded-xl flex items-start gap-3 justify-between">
                      <div className="flex gap-2.5">
                        <div className="p-2 bg-rose-50 dark:bg-rose-950/40 rounded-lg text-rose-600 dark:text-rose-400 flex-shrink-0">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-200">{appt.title}</h4>
                          <span className="text-3xs text-rose-700 dark:text-rose-400 font-bold font-mono tracking-wide uppercase mt-0.5 block">
                            {dateObj.toLocaleDateString()} @ {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {appt.notes && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-1 border-l-2 border-slate-200 dark:border-slate-800">
                              {appt.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => onDeleteAppointment(appt.id)}
                        className="text-slate-300 hover:text-slate-500 dark:text-slate-550 dark:hover:text-slate-350 p-1 transition-colors flex-shrink-0 cursor-pointer animate-none"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ADVANCED HISTORY DATABASE (NEW PAST DETAILS PANEL) */}
        {activeTab === "history" && (
          <div className="space-y-5 animate-fade-in">
            {/* KPI statistics cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50/75 dark:bg-slate-950/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2.5 p-2 bg-white dark:bg-slate-900 border border-slate-100/80 dark:border-slate-850 rounded-lg">
                <div className="p-1.5 bg-rose-50 dark:bg-rose-950/40 rounded text-rose-550 dark:text-rose-400">
                  <Pill className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-[8px] text-slate-400 uppercase tracking-widest font-bold">Total Oral Intakes</span>
                  <strong className="text-sm font-black font-mono text-slate-800 dark:text-slate-200">{intakeLogs.length} Sessions</strong>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2 bg-white dark:bg-slate-900 border border-slate-100/80 dark:border-slate-850 rounded-lg">
                <div className="p-1.5 bg-rose-50 dark:bg-rose-950/40 rounded text-rose-555 dark:text-rose-400">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-[8px] text-slate-400 uppercase tracking-widest font-bold font-sans">Vitals Checklist count</span>
                  <strong className="text-sm font-black font-mono text-rose-600 dark:text-rose-400">{symptomLogs.length} Checked</strong>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2 bg-white dark:bg-slate-900 border border-slate-100/80 dark:border-slate-850 rounded-lg">
                <div className="p-1.5 bg-rose-50 dark:bg-rose-955/20 rounded text-indigo-500">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-[8px] text-slate-400 uppercase tracking-widest font-bold font-sans">Clinics scheduled</span>
                  <strong className="text-sm font-black font-mono text-slate-705 dark:text-slate-200">{appointments.length} Visits</strong>
                </div>
              </div>
            </div>

            {/* Filter buttons & Search */}
            <div className="flex flex-col sm:flex-row gap-2 pb-2 border-b border-slate-150/50 dark:border-slate-800">
              <div className="flex bg-slate-100 dark:bg-slate-850 p-0.5 rounded-lg border border-slate-200/50 dark:border-slate-800">
                <button
                  onClick={() => setSelectedSubHistory("all")}
                  className={`text-[10px] font-bold px-3 py-1 rounded transition-all cursor-pointer ${selectedSubHistory === "all" ? "bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-3xs" : "text-slate-500 hover:text-slate-850 dark:text-slate-400"}`}
                >
                  All Logs
                </button>
                <button
                  onClick={() => setSelectedSubHistory("intakes")}
                  className={`text-[10px] font-bold px-3 py-1 rounded transition-all cursor-pointer ${selectedSubHistory === "intakes" ? "bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-3xs" : "text-slate-500 hover:text-slate-850 dark:text-slate-400"}`}
                >
                  Pills Intakes
                </button>
                <button
                  onClick={() => setSelectedSubHistory("symptoms")}
                  className={`text-[10px] font-bold px-3 py-1 rounded transition-all cursor-pointer ${selectedSubHistory === "symptoms" ? "bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-3xs" : "text-slate-500 hover:text-slate-850 dark:text-slate-400"}`}
                >
                  Symptoms & Biometrics
                </button>
              </div>

              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-405 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter medical history records..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="w-full bg-slate-50/20 dark:bg-slate-950/25 text-xs border border-slate-205 dark:border-slate-805 rounded-lg pl-8 p-1.5 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                />
              </div>
            </div>

            {/* List of records */}
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1 animate-fade-in-down">
              {/* Combine logs chronologically dynamically */}
              {(() => {
                const results: any[] = [];
                
                if (selectedSubHistory === "all" || selectedSubHistory === "intakes") {
                  intakeLogs.forEach((log) => {
                    if (log.medicationName.toLowerCase().includes(historySearch.toLowerCase())) {
                      results.push({
                        type: "intake",
                        id: log.id,
                        title: `Pill Ingested: ${log.medicationName}`,
                        subtitle: `Dosage limit parsed: ${log.dosage}`,
                        timestamp: log.timestamp,
                        color: "rose"
                      });
                    }
                  });
                }

                if (selectedSubHistory === "all" || selectedSubHistory === "symptoms") {
                  symptomLogs.forEach((log) => {
                    if (log.description.toLowerCase().includes(historySearch.toLowerCase()) || log.bloodPressure.includes(historySearch)) {
                      results.push({
                        type: "symptom",
                        id: log.id,
                        title: `Registered Biometrics: BP ${log.bloodPressure} | HR ${log.heartRate} bpm`,
                        subtitle: log.description ? `"${log.description}"` : "Regular health snapshot logged successfully.",
                        timestamp: log.timestamp,
                        color: "teal"
                      });
                    }
                  });
                }

                // Sort newest desc
                results.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

                if (results.length === 0) {
                  return (
                    <div className="text-center py-10 bg-slate-50 dark:bg-slate-955/20 border border-dashed border-slate-205 dark:border-slate-800 rounded-xl">
                      <p className="text-xs text-slate-450 dark:text-slate-500">No records found matching tracking constraints.</p>
                    </div>
                  );
                }

                return results.map((record) => {
                  const rDate = new Date(record.timestamp);
                  return (
                    <div
                      key={`${record.type}-${record.id}`}
                      className="p-3 rounded-xl border border-slate-100/90 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-3xs flex items-center justify-between gap-4 hover:border-slate-201 dark:hover:border-slate-700 hover:shadow-xs transition-all"
                    >
                      <div className="min-w-0 flex items-start gap-3">
                        <div className={`p-2 rounded-lg flex-shrink-0 ${record.color === "rose" ? "bg-rose-50 dark:bg-rose-950 text-rose-550" : "bg-teal-50 dark:bg-teal-950 text-teal-600"}`}>
                          {record.type === "intake" ? <Pill className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <h5 className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate">{record.title}</h5>
                          <p className="text-2xs text-slate-450 dark:text-slate-400 font-medium italic mt-0.5 truncate">{record.subtitle}</p>
                          <span className="text-[10px] text-slate-400 dark:text-slate-505 font-mono font-bold block mt-1">
                            {rDate.toLocaleDateString()} @ {rDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      {record.type === "intake" && (
                        <button
                          onClick={() => handleDeleteIntakeLog(record.id)}
                          className="text-slate-350 hover:text-rose-600 dark:text-slate-650 p-1 flex-shrink-0 cursor-pointer"
                          title="Purge log item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
