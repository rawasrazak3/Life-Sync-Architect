import React, { useState, useEffect } from "react";
import { Sparkles, Calendar, HeartPulse, ShieldAlert, BadgeInfo, CheckSquare, Sun, Moon, DollarSign, ShoppingCart, AlertCircle, Heart, BellRing, ArrowRight, History, Dumbbell, User } from "lucide-react";
import { Task, Medication, SymptomLog, Appointment, GroceryItem, Expense, DailySnapshot, UserProfile, GymSession } from "./types";
import AIBriefer from "./components/AI_Briefer";
import MedicalTracker from "./components/Medical_Tracker";
import TaskIntelligence from "./components/Task_Intelligence";
import GroceryLogistics from "./components/Grocery_Logistics";
import BudgetTracker from "./components/Budget_Tracker";
import UserProfileTracker from "./components/UserProfile_Tracker";
import GymTracker from "./components/Gym_Tracker";

// Generate unique string IDs
const uuid = () => Math.random().toString(36).substring(2, 9);

// Initial mock datasets to avoid blank, unhelpful startup views
const INITIAL_MEDICATIONS: Medication[] = [
  {
    id: "med-1",
    name: "Lisinopril (Blood Pressure)",
    dosage: "10mg",
    frequency: "Once daily - Morning",
    remainingPills: 4, // Trigger Refill Alert!
    totalPills: 30,
    refillThreshold: 5,
    lastIntake: "2026-05-21T08:00:00Z",
  },
  {
    id: "med-2",
    name: "Vitamin D3 (Immunity Support)",
    dosage: "2000 IU",
    frequency: "Every other day",
    remainingPills: 28,
    totalPills: 90,
    refillThreshold: 10,
    lastIntake: "2026-05-20T08:00:00Z",
  }
];

const INITIAL_SYMPTOMS: SymptomLog[] = [
  {
    id: "sym-1",
    timestamp: "2026-05-21T18:30:00Z",
    bloodPressure: "122/81",
    heartRate: 68,
    temperature: 98.4,
    description: "Mild evening fatigue, but blood pressure completely within target constraints.",
  }
];

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: "app-1",
    title: "Cardiology Annual Checkup",
    dateTime: "2026-05-26T14:30", // Tuesday, May 26
    notes: "St. Luke Clinic, Main Pavilion Dr. Alan Vance. Refill prescriptions.",
  }
];

const INITIAL_TASKS: Task[] = [
  {
    id: "task-1",
    name: "Draft Quarter Review Brief",
    priority: "P1",
    category: "Work",
    deadline: "2026-05-26", // Overlaps with cardiology appointment conflict!
    completed: false,
    dateAdded: "2026-05-21",
  },
  {
    id: "task-2",
    name: "Replenish medical prescription formulas",
    priority: "P2",
    category: "Urgent",
    deadline: "2026-05-23",
    completed: false,
    dateAdded: "2026-05-21",
  },
  {
    id: "task-3",
    name: "Weekly balance review with budget breakdown",
    priority: "P3",
    category: "Personal",
    deadline: null,
    completed: true,
    dateAdded: "2026-05-21",
  }
];

const INITIAL_GROCERIES: GroceryItem[] = [
  {
    id: "groc-1",
    name: "Organic Baby Spinach",
    aisle: "Produce",
    isRecurringEssential: true,
    purchased: false,
  },
  {
    id: "groc-2",
    name: "Lactose Free Greek Yogurt",
    aisle: "Dairy",
    isRecurringEssential: true,
    purchased: false,
  },
  {
    id: "groc-3",
    name: "Heavy Duty Kitchen Trash Bags",
    aisle: "Household",
    isRecurringEssential: false,
    purchased: true,
  }
];

const INITIAL_EXPENSES: Expense[] = [
  {
    id: "exp-1",
    description: "Steward Pharmacies Co-pay",
    amount: 15.00,
    category: "Medical",
    date: "2026-05-21",
  },
  {
    id: "exp-2",
    description: "Roasted Hazelnut Brew Coffee",
    amount: 4.85,
    category: "Coffee",
    date: "2026-05-22",
  }
];

export default function App() {
  // Sync state loaded elegantly from LocalStorage
  const [tasks, setTasks] = useState<Task[]>(() => {
    const val = localStorage.getItem("lifesync_tasks");
    return val ? JSON.parse(val) : INITIAL_TASKS;
  });

  const [medications, setMedications] = useState<Medication[]>(() => {
    const val = localStorage.getItem("lifesync_medications");
    return val ? JSON.parse(val) : INITIAL_MEDICATIONS;
  });

  const [symptomLogs, setSymptomLogs] = useState<SymptomLog[]>(() => {
    const val = localStorage.getItem("lifesync_symptomlogs");
    return val ? JSON.parse(val) : INITIAL_SYMPTOMS;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const val = localStorage.getItem("lifesync_appointments");
    return val ? JSON.parse(val) : INITIAL_APPOINTMENTS;
  });

  const [groceries, setGroceries] = useState<GroceryItem[]>(() => {
    const val = localStorage.getItem("lifesync_groceries");
    return val ? JSON.parse(val) : INITIAL_GROCERIES;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const val = localStorage.getItem("lifesync_expenses");
    return val ? JSON.parse(val) : INITIAL_EXPENSES;
  });

  const [briefing, setBriefing] = useState<DailySnapshot | null>(() => {
    const val = localStorage.getItem("lifesync_briefing");
    return val ? JSON.parse(val) : null;
  });

  // Track dismissed conflict IDs to allow users to easily dismiss recognized overlaps
  const [dismissedConflicts, setDismissedConflicts] = useState<string[]>(() => {
    const val = localStorage.getItem("lifesync_dismissed_conflicts");
    return val ? JSON.parse(val) : [];
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const val = localStorage.getItem("lifesync_user_profile");
    return val ? JSON.parse(val) : {
      name: "Soren Carter",
      gender: "Male",
      weight: 78,
      height: 180,
      conditions: "High blood pressure",
      fitnessGoal: "Leanness Alignment"
    };
  });

  const [gymSessions, setGymSessions] = useState<GymSession[]>(() => {
    const val = localStorage.getItem("lifesync_gym_sessions");
    return val ? JSON.parse(val) : [
      {
        id: "gym-1",
        timestamp: "2026-05-20T17:30",
        workouts: [
          { id: "e1", name: "Squats", sets: 3, reps: 5, weight: 120 },
          { id: "e2", name: "Lat Pulldowns", sets: 4, reps: 10, weight: 65 }
        ],
        notes: "Consistent energy curve throughout the pulls.",
        durationMinutes: 50
      },
      {
        id: "gym-2",
        timestamp: "2026-05-18T18:00",
        workouts: [
          { id: "e3", name: "Bench Press", sets: 4, reps: 8, weight: 80 },
          { id: "e4", name: "Bicep Curls", sets: 3, reps: 12, weight: 14 }
        ],
        notes: "Felt great. Chest pump was solid.",
        durationMinutes: 40
      }
    ];
  });

  // Theme configuration state
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return (localStorage.getItem("lifesync_theme") as "light" | "dark") || "light";
  });

  // Dynamic Workspace Tab Switcher
  const [activeTab, setActiveTab] = useState<"home" | "tasks" | "health" | "gym" | "groceries" | "budget" | "profile">("home");

  // React theme switcher protocol injection
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("lifesync_theme", theme);
  }, [theme]);

  // Persist states safely to local storage on changes
  useEffect(() => {
    localStorage.setItem("lifesync_user_profile", JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem("lifesync_gym_sessions", JSON.stringify(gymSessions));
  }, [gymSessions]);

  const handleAddGymSession = (newSession: GymSession) => {
    setGymSessions((prev) => [newSession, ...prev]);
  };

  const handleDeleteGymSession = (id: string) => {
    setGymSessions((prev) => prev.filter((s) => s.id !== id));
  };

  useEffect(() => {
    localStorage.setItem("lifesync_tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("lifesync_medications", JSON.stringify(medications));
  }, [medications]);

  useEffect(() => {
    localStorage.setItem("lifesync_symptomlogs", JSON.stringify(symptomLogs));
  }, [symptomLogs]);

  useEffect(() => {
    localStorage.setItem("lifesync_appointments", JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem("lifesync_groceries", JSON.stringify(groceries));
  }, [groceries]);

  useEffect(() => {
    localStorage.setItem("lifesync_expenses", JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    if (briefing) {
      localStorage.setItem("lifesync_briefing", JSON.stringify(briefing));
    }
  }, [briefing]);

  // Tasks addition/actions
  const handleAddTask = (newTask: Omit<Task, "id" | "dateAdded">) => {
    setTasks((prev) => [
      ...prev,
      {
        ...newTask,
        id: `task-${uuid()}`,
        dateAdded: new Date().toISOString().split("T")[0],
      },
    ]);
  };

  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // Medicine trackers
  const handleAddMedication = (newMed: Omit<Medication, "id">) => {
    setMedications((prev) => [
      ...prev,
      {
        ...newMed,
        id: `med-${uuid()}`,
      },
    ]);
  };

  const handleTakeMedication = (id: string) => {
    setMedications((prev) =>
      prev.map((med) => {
        if (med.id === id) {
          return {
            ...med,
            remainingPills: Math.max(0, med.remainingPills - 1),
            lastIntake: new Date().toISOString(),
          };
        }
        return med;
      })
    );
  };

  const handleRefillMedication = (id: string, amount: number = 30) => {
    setMedications((prev) =>
      prev.map((med) => {
        if (med.id === id) {
          return {
            ...med,
            remainingPills: med.totalPills,
          };
        }
        return med;
      })
    );
  };

  const handleDeleteMedication = (id: string) => {
    setMedications((prev) => prev.filter((m) => m.id !== id));
  };

  // Symptom/Vitals loggers
  const handleAddSymptomLog = (newLog: Omit<SymptomLog, "id" | "timestamp">) => {
    setSymptomLogs((prev) => [
      ...prev,
      {
        ...newLog,
        id: `sym-${uuid()}`,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const handleDeleteSymptomLog = (id: string) => {
    setSymptomLogs((prev) => prev.filter((s) => s.id !== id));
  };

  // Appointments
  const handleAddAppointment = (newAppt: Omit<Appointment, "id">) => {
    setAppointments((prev) => [
      ...prev,
      {
        ...newAppt,
        id: `app-${uuid()}`,
      },
    ]);
  };

  const handleDeleteAppointment = (id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
  };

  // Grocery
  const handleAddGrocery = (item: Omit<GroceryItem, "id">) => {
    setGroceries((prev) => [
      ...prev,
      {
        ...item,
        id: `groc-${uuid()}`,
      },
    ]);
  };

  const handleToggleGrocery = (id: string) => {
    setGroceries((prev) =>
      prev.map((g) => (g.id === id ? { ...g, purchased: !g.purchased } : g))
    );
  };

  const handleDeleteGrocery = (id: string) => {
    setGroceries((prev) => prev.filter((g) => g.id !== id));
  };

  const handleToggleEssential = (id: string) => {
    setGroceries((prev) =>
      prev.map((g) => (g.id === id ? { ...g, isRecurringEssential: !g.isRecurringEssential } : g))
    );
  };

  // Expenses
  const handleAddExpense = (expense: Omit<Expense, "id">) => {
    setExpenses((prev) => [
      ...prev,
      {
        ...expense,
        id: `exp-${uuid()}`,
      },
    ]);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // CONFLICT RESOLUTION CALCULATION
  const scheduleConflicts = tasks.filter(t => !t.completed && t.deadline && !dismissedConflicts.includes(t.id)).flatMap((task) => {
    const overlappingAppts = appointments.filter((appt) => {
      const apptDateStr = appt.dateTime.split("T")[0]; // extracts '2026-05-26'
      return apptDateStr === task.deadline;
    });

    return overlappingAppts.map((appt) => ({
      taskId: task.id,
      taskName: task.name,
      deadline: task.deadline,
      apptTitle: appt.title,
      apptTime: appt.dateTime.split("T")[1],
    }));
  });

  const handleDismissConflict = (taskId: string) => {
    const updated = [...dismissedConflicts, taskId];
    setDismissedConflicts(updated);
    localStorage.setItem("lifesync_dismissed_conflicts", JSON.stringify(updated));
  };

  // Filter highlights to render on the Main Dashboard
  const lowMedications = medications.filter(m => m.remainingPills <= m.refillThreshold);
  const coreGroceryShortfalls = groceries.filter(g => g.isRecurringEssential && !g.purchased);
  const urgentTasks = tasks.filter(t => !t.completed && (t.priority === "P1" || t.priority === "P2"));

  // Budget summaries
  const totalSpent = expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const budgetGoal = 600; // Monthly limit anchor

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200">
      
      {/* Top Header */}
      <header className="bg-slate-900 dark:bg-slate-950 border-b border-slate-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-5 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600 shadow-md text-white">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight">Life-Sync Architect</h1>
              <p className="text-xs text-indigo-300 font-mono">Structured Unified Wellness & Executive Logistics Ecosystem</p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-stretch md:self-auto justify-between md:justify-start">
            <div className="flex items-center gap-2 bg-slate-800 dark:bg-slate-900 px-4 py-1.5 rounded-xl border border-slate-700/50">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <div className="text-left">
                <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold leading-none">System Time Frame</p>
                <p className="text-xs font-mono font-bold text-slate-100 mt-0.5 whitespace-nowrap">
                  Friday, May 22, 2026
                </p>
              </div>
            </div>

            {/* Dark Mode Theme Switcher */}
            <button
              onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}
              className="p-2.5 bg-slate-800 dark:bg-slate-900 hover:bg-slate-700 rounded-xl border border-slate-700/55 cursor-pointer text-slate-200 transition-all active:scale-95"
              aria-label="Toggle theme"
              title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            >
              {theme === "light" ? <Moon className="w-4.5 h-4.5 text-indigo-300" /> : <Sun className="w-4.5 h-4.5 text-amber-400" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6">

        {/* Schedule Collision Sync Guard Warning Banner */}
        {scheduleConflicts.length > 0 && (
          <div className="bg-amber-50/70 dark:bg-amber-955/20 border-l-4 border-amber-500 rounded-xl p-4 shadow-3xs flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 mt-0.5 text-amber-500 dark:text-amber-400 flex-shrink-0 animate-pulse" />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider font-display">📅 Sync Collision Overlap Detected</h4>
              <p className="text-xs text-slate-650 dark:text-slate-400 mt-0.5 leading-normal">
                An executive synchronization collision exists. Healthcare procedures, appointments and medication refills prioritizations override administrative workloads.
              </p>
              
              <div className="mt-3 divide-y divide-amber-200/50 dark:divide-amber-900/30 space-y-2">
                {scheduleConflicts.map((conflict, idx) => (
                  <div key={idx} className="pt-2 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 first:pt-0">
                    <div className="text-amber-900 dark:text-amber-350 leading-relaxed">
                      <span className="font-extrabold text-amber-705">Collision overlap:</span> Administrative draft <strong className="text-amber-950 dark:text-amber-200">"{conflict.taskName}"</strong> overlaps with clinical vistation <strong className="text-amber-950 dark:text-amber-100">"{conflict.apptTitle}"</strong> on <span className="font-mono font-semibold bg-amber-100 dark:bg-amber-900 px-1 py-0.2 rounded text-[11px]">{conflict.deadline}</span>.
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-[9px] bg-rose-600 text-white font-black tracking-wider uppercase px-2 py-0.5 rounded leading-none whitespace-nowrap">
                        Override Code Activates
                      </span>
                      <button
                        onClick={() => handleDismissConflict(conflict.taskId)}
                        className="text-xs text-amber-800 hover:text-amber-950 dark:text-amber-300 dark:hover:text-amber-100 font-bold underline transition-colors cursor-pointer"
                        title="Dismiss alert"
                      >
                        Dismiss Collision
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Global Tab Navigation workspace */}
        <div id="navigation-rail-workspace" className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-2 md:p-2.5 shadow-xs w-full">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-1.5 md:gap-2">
            
            <button
              onClick={() => setActiveTab("home")}
              className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === "home"
                  ? "bg-indigo-600 text-white shadow-md font-extrabold"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Dashboard Home</span>
            </button>

            <button
              onClick={() => setActiveTab("tasks")}
              className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === "tasks"
                  ? "bg-indigo-600 text-white shadow-md font-extrabold"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Tasks & Archive</span>
            </button>

            <button
              onClick={() => setActiveTab("health")}
              className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === "health"
                  ? "bg-indigo-600 text-white shadow-md font-extrabold"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <HeartPulse className="w-4 h-4" />
              <span>Health & Vitals</span>
            </button>

            <button
              onClick={() => setActiveTab("gym")}
              className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === "gym"
                  ? "bg-indigo-600 text-white shadow-md font-extrabold"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Dumbbell className="w-4 h-4" />
              <span>Gym & Workouts</span>
            </button>

            <button
              onClick={() => setActiveTab("groceries")}
              className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === "groceries"
                  ? "bg-indigo-600 text-white shadow-md font-extrabold"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Grocery Stock</span>
            </button>

            <button
              onClick={() => setActiveTab("budget")}
              className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === "budget"
                  ? "bg-indigo-600 text-white shadow-md font-extrabold"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Financial Ledger</span>
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === "profile"
                  ? "bg-indigo-600 text-white shadow-md font-extrabold"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <User className="w-4 h-4" />
              <span>User Profile</span>
            </button>

          </div>
        </div>

        {/* WORKSPACE DETAILED ROUTING PANELS */}
        <div id="workspace-dynamic-routing-area">
          
          {/* 1. DASHBOARD HOME VIEW (SNAPSHOT INDEX & DEADLINES) */}
          {activeTab === "home" && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Personalized Greeting & Medical Advisory Header Banner */}
              <div className="bg-linear-to-r from-indigo-900 to-slate-900 dark:from-slate-900 dark:to-slate-950 text-white rounded-3xl p-6 shadow-md border border-indigo-950/40 dark:border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6" id="personalized-greeting-card">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-xl sm:text-2xl font-extrabold tracking-tight font-display">
                      {(() => {
                        const hr = new Date().getHours();
                        let word = "Good morning";
                        if (hr >= 12 && hr < 17) word = "Good afternoon";
                        else if (hr >= 17) word = "Good evening";
                        return `${word}, ${userProfile.name || "Explorer"}`;
                      })()} ☀️
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-500/10">
                      Physiology Metric: Active
                    </span>
                  </div>
                  <p className="text-xs text-indigo-200/90 leading-relaxed max-w-xl">
                    Welcome back to Life-Sync Architect. Your stature ratio measures at <strong className="text-white">{userProfile.height} cm</strong> and body mass reports <strong className="text-white">{userProfile.weight} kg</strong> yielding a system-computed Body Mass Ratio of <strong className="text-white font-mono bg-indigo-950/80 px-2 py-0.5 rounded text-xs select-all">{(userProfile.weight / ((userProfile.height / 100) * (userProfile.height / 100))).toFixed(1)}</strong>.
                  </p>
                </div>

                <div className="w-full md:w-auto shrink-0 bg-slate-950/35 border border-indigo-500/15 p-4 rounded-2xl md:min-w-[280px]">
                  <div className="flex items-center gap-1.5 border-b border-indigo-500/20 pb-2 mb-2">
                    <HeartPulse className="w-4 h-4 text-rose-450 animate-pulse text-rose-400" />
                    <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-300 font-mono">Medical Safeguards Advisor</span>
                  </div>
                  <div className="text-xs text-slate-300">
                    {userProfile.conditions ? (
                      <div>
                        <span className="text-[9px] uppercase font-black text-rose-400 font-mono block">Advisory Flag:</span>
                        <p className="mt-0.5 leading-normal">
                          For <strong className="font-bold text-white">"{userProfile.conditions}"</strong>, sustain steady medical checkups, log blood pressures, and balance core physical strains.
                        </p>
                      </div>
                    ) : (
                      <div>
                        <span className="text-[9px] uppercase font-black text-emerald-400 font-mono block">Preventative Care:</span>
                        <p className="mt-0.5 leading-normal">
                          No active symptoms/conditions. Hydrate adequately during training. Goal range is: <strong>"{userProfile.fitnessGoal}"</strong>.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Top AI Snapshot widget */}
              <AIBriefer
                tasks={tasks}
                medications={medications}
                groceries={groceries}
                budgets={expenses}
                currentBriefing={briefing}
                onUpdateBriefing={setBriefing}
                userProfile={userProfile}
                gymSessions={gymSessions}
              />

              {/* Bento snapshot layouts for vital alerts and upcoming deadlines */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-wrap">
                
                {/* Left card: Urgent Alerts & Deadlines */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs rounded-2xl p-5">
                  <div className="flex items-center gap-2 border-b border-slate-105 dark:border-slate-800 pb-3 mb-4">
                    <BellRing className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 font-display">Urgent Alarms & Direct Deadlines</h3>
                  </div>

                  <div className="space-y-4">
                    {/* Clinical Appointments priority block */}
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold tracking-wider uppercase block mb-2 font-mono">Upcoming Appointments</span>
                      {appointments.length === 0 ? (
                        <p className="text-xs text-slate-400 p-2 bg-slate-50 dark:bg-slate-950/20 rounded">No upcoming clinical appointments scheduled.</p>
                      ) : (
                        appointments.map((appt) => {
                          const dateObj = new Date(appt.dateTime);
                          return (
                            <div key={appt.id} className="p-3 bg-rose-50/20 dark:bg-rose-955/10 border border-rose-100 dark:border-rose-900/35 rounded-xl flex items-center justify-between mb-2">
                              <div>
                                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-300">{appt.title}</h5>
                                <span className="text-3xs text-rose-600 dark:text-rose-400 font-mono font-bold block mt-0.5">
                                  {dateObj.toLocaleDateString()} @ {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <button
                                onClick={() => setActiveTab("health")}
                                className="text-rose-600 hover:text-rose-700 text-3xs font-extrabold flex items-center gap-0.5 cursor-pointer underline"
                              >
                                View Suite
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Pending tasks with deadline block */}
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold tracking-wider uppercase block mb-2 font-mono">Urgent Pending Tasks (P1 / P2)</span>
                      {urgentTasks.length === 0 ? (
                        <p className="text-xs text-slate-400 p-2 bg-slate-50 dark:bg-slate-950/20 rounded">No high priority incomplete tasks found!</p>
                      ) : (
                        urgentTasks.map((task) => (
                          <div key={task.id} className="p-2.5 bg-slate-50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-800 rounded-lg flex items-center justify-between mb-1.5">
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate leading-tight">{task.name}</p>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-[9px] bg-amber-50 dark:bg-amber-955 text-amber-700 dark:text-amber-400 font-bold px-1 py-0.2 rounded font-mono uppercase">{task.priority}</span>
                                {task.deadline && <span className="text-[9px] text-slate-400 font-mono">Due: {task.deadline}</span>}
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                handleToggleTask(task.id);
                              }}
                              className="text-emerald-600 hover:text-emerald-700 text-3xs font-bold cursor-pointer flex items-center gap-0.5"
                              title="Check off task"
                            >
                              Checkoff
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                  </div>
                </div>

                {/* Right card: Resource Refill highlights */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs rounded-2xl p-5">
                  <div className="flex items-center gap-2 border-b border-slate-105 dark:border-slate-800 pb-3 mb-4">
                    <History className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 font-display">System Resource & Shortages</h3>
                  </div>

                  <div className="space-y-4">
                    {/* Low Prescription Tracker */}
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold tracking-wider uppercase block mb-1.5 font-mono">Pills Requiring Inpatient Refill</span>
                      {lowMedications.length === 0 ? (
                        <p className="text-xs text-slate-400 p-2 bg-slate-50 dark:bg-slate-950/15 rounded">All medications adequately stocked.</p>
                      ) : (
                        lowMedications.map((med) => (
                          <div key={med.id} className="p-2.5 bg-rose-50/20 dark:bg-rose-955/10 border border-rose-100 dark:border-rose-900/30 rounded-lg flex items-center justify-between mb-1">
                            <div>
                              <p className="text-xs font-bold text-slate-800 dark:text-slate-300">{med.name}</p>
                              <span className="text-[9px] font-bold text-rose-650 dark:text-rose-400 block font-mono">{med.remainingPills} pills left</span>
                            </div>
                            <button
                              onClick={() => {
                                handleRefillMedication(med.id);
                              }}
                              className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] px-2.5 py-1 rounded"
                            >
                              Refill Stock
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Stock shortage */}
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold tracking-wider uppercase block mb-1.5 font-mono">Recurring Grocery Stock Shortages</span>
                      {coreGroceryShortfalls.length === 0 ? (
                        <p className="text-xs text-slate-455 p-2 bg-slate-50 dark:bg-slate-950/15 rounded">All essential household groceries fully loaded.</p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {coreGroceryShortfalls.map((item) => (
                            <span key={item.id} className="text-3xs font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 px-2 py-1 rounded flex items-center gap-1">
                              <Heart className="w-1.5 h-1.5 fill-current text-emerald-555" />
                              <span>{item.name}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Financial gauge summary */}
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold tracking-wider uppercase block mb-1.5 font-mono">Allowance Saturation (Goal: ${budgetGoal})</span>
                      <div className="p-3 bg-slate-50 dark:bg-slate-950/30 border border-slate-105 rounded-xl">
                        <div className="flex items-center justify-between text-xs mb-1 font-bold">
                          <span>Spent Ledger: ${totalSpent.toFixed(2)}</span>
                          <span className={`${totalSpent > budgetGoal ? "text-rose-600" : "text-slate-450"}`}>{((totalSpent / budgetGoal) * 100).toFixed(0)}% Utilized</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full ${totalSpent > budgetGoal ? "bg-rose-500" : "bg-emerald-600"}`}
                            style={{ width: `${Math.min(100, (totalSpent / budgetGoal) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

              </div>

              {/* System Credentials persistent notice */}
              <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-4 rounded-2xl flex items-start gap-3">
                <BadgeInfo className="w-5 h-5 text-slate-500 dark:text-slate-400 mt-0.5 flex-shrink-0" />
                <div className="text-slate-500 dark:text-slate-400">
                  <h4 className="text-xs font-bold font-display uppercase tracking-wider text-slate-700 dark:text-slate-300">Persistent Synchronizations Protocol</h4>
                  <p className="text-2xs mt-1 leading-relaxed">
                    The Life-Sync Architect registers state metrics securely within local browser caches. Tracked procedures, appointment schedules, essential groceries, and budget logs automatically compute alerts on boot.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 2. TASKS SECTION (WITH COMPLETED ARCHIVE LOGS DETAILED AT THE SUB-TAB VIEW) */}
          {activeTab === "tasks" && (
            <TaskIntelligence
              tasks={tasks}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
            />
          )}

          {/* 3. HEALTH SECTION (WITH APPOINTMENTS & COMPLETE TIMELINE ARCHIVE SUB-TAB DETAIL) */}
          {activeTab === "health" && (
            <MedicalTracker
              medications={medications}
              symptomLogs={symptomLogs}
              appointments={appointments}
              onAddMedication={handleAddMedication}
              onTakeMedication={handleTakeMedication}
              onRefillMedication={handleRefillMedication}
              onDeleteMedication={handleDeleteMedication}
              onAddSymptomLog={handleAddSymptomLog}
              onDeleteSymptomLog={handleDeleteSymptomLog}
              onAddAppointment={handleAddAppointment}
              onDeleteAppointment={handleDeleteAppointment}
            />
          )}

          {/* 4. GROCERIES SECTION (WITH PURCHASED LOG STATISTICS & ARCHIVE SUB-TAB DETAILS) */}
          {activeTab === "groceries" && (
            <GroceryLogistics
              groceries={groceries}
              onAddGrocery={handleAddGrocery}
              onToggleGrocery={handleToggleGrocery}
              onDeleteGrocery={handleDeleteGrocery}
              onToggleEssential={handleToggleEssential}
            />
          )}

          {/* Gym Workout Trackers & History */}
          {activeTab === "gym" && (
            <GymTracker
              gymSessions={gymSessions}
              onAddGymSession={handleAddGymSession}
              onDeleteGymSession={handleDeleteGymSession}
            />
          )}

          {/* 5. BUDGET SECTION (WITH DETAILED DATE-WISE & MONTHLY ALIGNMENT GRAPHS & LOGS) */}
          {activeTab === "budget" && (
            <BudgetTracker
              expenses={expenses}
              onAddExpense={handleAddExpense}
              onDeleteExpense={handleDeleteExpense}
            />
          )}

          {/* User Demographic Physiological Profile */}
          {activeTab === "profile" && (
            <UserProfileTracker
              profile={userProfile}
              onUpdateProfile={setUserProfile}
            />
          )}

        </div>

      </main>

      <footer className="bg-white dark:bg-slate-950 border-t border-slate-205 dark:border-slate-850 text-center py-6 mt-12 text-xs text-slate-400 dark:text-slate-505 font-mono">
        <p>© 2026 Life-Sync Architect. Preserving daily physical vitals, logistical plans, and budgetary allowances.</p>
      </footer>

    </div>
  );
}
