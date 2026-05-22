import React, { useState } from "react";
import { User, Scale, Ruler, HeartPulse, Activity, Save, Sparkles, Check } from "lucide-react";
import { UserProfile } from "../types";

interface UserProfileTrackerProps {
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
}

export default function UserProfileTracker({ profile, onUpdateProfile }: UserProfileTrackerProps) {
  const [formData, setFormData] = useState<UserProfile>({ ...profile });
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  // Perform client-side health calculations
  const weight = Number(formData.weight) || 0;
  const height = Number(formData.height) || 0;
  
  const heightInM = height / 100;
  const bmi = heightInM > 0 ? (weight / (heightInM * heightInM)) : 0;
  
  let bmiCategory = "Unknown";
  let bmiColor = "text-slate-400 bg-slate-100 dark:bg-slate-800";
  let bmiDescription = "Please enter height and weight to calculate.";

  if (bmi > 0) {
    if (bmi < 18.5) {
      bmiCategory = "Underweight";
      bmiColor = "text-amber-550 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/30";
      bmiDescription = "Your BMI indicates an underweight status. Ensure regular caloric intake and muscle training.";
    } else if (bmi < 25) {
      bmiCategory = "Normal Weight";
      bmiColor = "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/30";
      bmiDescription = "Superb! Your BMI resides within the healthy baseline targets.";
    } else if (bmi < 30) {
      bmiCategory = "Overweight";
      bmiColor = "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 border border-orange-200/50 dark:border-orange-800/30";
      bmiDescription = "Slightly elevated BMI levels. Focus on active calorie expenditures and hydration.";
    } else {
      bmiCategory = "Obese";
      bmiColor = "text-rose-600 dark:text-rose-450 bg-rose-50 dark:bg-rose-950/30 border border-rose-200/50 dark:border-rose-800/30";
      bmiDescription = "Elevated cardiovascular and metabolic coefficients. We advise structured nutrition plans.";
    }
  }

  // Recommended fluid intake (35 ml per kg of weight)
  const recommendedWaterLiters = bmi > 0 ? ((weight * 35) / 1000).toFixed(1) : "2.5";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" id="user-profile-setup-container">
      
      {/* Configuration Form Card (Left Column) */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-805 dark:text-slate-100 font-display">User Demographics & Physiological Configuration</h2>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono tracking-wider uppercase">Configure demographics for optimized advisor alerts</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* full name */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 font-mono">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full text-sm bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-505 transition-all font-medium text-slate-800 dark:text-slate-100"
                placeholder="Enter profile moniker"
              />
            </div>

            {/* Gender Switcher */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 font-mono">Gender Biomarker</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as any }))}
                className="w-full text-sm bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-505 transition-all font-medium text-slate-800 dark:text-slate-100"
              >
                <option value="" className="bg-white dark:bg-slate-905 text-slate-800 dark:text-slate-100">Choose biomarkers</option>
                <option value="Male" className="bg-white dark:bg-slate-905 text-slate-800 dark:text-slate-100">Male</option>
                <option value="Female" className="bg-white dark:bg-slate-905 text-slate-800 dark:text-slate-100">Female</option>
                <option value="Non-binary" className="bg-white dark:bg-slate-905 text-slate-800 dark:text-slate-100">Non-binary</option>
                <option value="Prefer not to say" className="bg-white dark:bg-slate-905 text-slate-800 dark:text-slate-100">Prefer not to say</option>
              </select>
            </div>

            {/* Weight Section */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 font-mono">Body Mass Index (Weight in kg)</label>
              <div className="relative">
                <input
                  type="number"
                  min="30"
                  max="250"
                  required
                  value={formData.weight || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight: Number(e.target.value) }))}
                  className="w-full text-sm bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-505 transition-all font-mono font-medium text-slate-800 dark:text-slate-100"
                  placeholder="e.g. 74"
                />
                <div className="absolute left-3.5 top-3 text-slate-400">
                  <Scale className="w-4 h-4" />
                </div>
                <div className="absolute right-3.5 top-2.5 select-none text-2xs font-extrabold text-slate-400 uppercase font-mono bg-white dark:bg-slate-950 px-1 py-0.5 rounded">kg</div>
              </div>
            </div>

            {/* Height Section */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 font-mono">Stature Index (Height in cm)</label>
              <div className="relative">
                <input
                  type="number"
                  min="100"
                  max="250"
                  required
                  value={formData.height || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, height: Number(e.target.value) }))}
                  className="w-full text-sm bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-550 transition-all font-mono font-medium text-slate-800 dark:text-slate-100"
                  placeholder="e.g. 178"
                />
                <div className="absolute left-3.5 top-3 text-slate-400">
                  <Ruler className="w-4 h-4" />
                </div>
                <div className="absolute right-3.5 top-2.5 select-none text-2xs font-extrabold text-slate-400 uppercase font-mono bg-white dark:bg-slate-950 px-1 py-0.5 rounded">cm</div>
              </div>
            </div>

            {/* Fitness/Gym goal options */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 font-mono">Structured Fitness Blueprint Range</label>
              <select
                value={formData.fitnessGoal}
                onChange={(e) => setFormData(prev => ({ ...prev, fitnessGoal: e.target.value }))}
                className="w-full text-sm bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-505 transition-all font-medium text-slate-800 dark:text-slate-100"
              >
                <option value="Cardio Fitness" className="bg-white dark:bg-slate-905 text-slate-800 dark:text-slate-100">Cardio Fitness (Stamina Focus)</option>
                <option value="Muscle Hypertrophy" className="bg-white dark:bg-slate-905 text-slate-800 dark:text-slate-100">Muscle Hypertrophy (Strength & Mass)</option>
                <option value="Leanness Alignment" className="bg-white dark:bg-slate-905 text-slate-800 dark:text-slate-100">Body Recomposition & Leanness</option>
                <option value="Atherosclerosis Safeguard" className="bg-white dark:bg-slate-905 text-slate-800 dark:text-slate-100">Blood Circulation (Hypertension Guard)</option>
                <option value="General Active Lifespan" className="bg-white dark:bg-slate-905 text-slate-800 dark:text-slate-100">General Active Lifespan maintenance</option>
              </select>
            </div>

            {/* Medical conditions/Allergies */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 font-mono">Co-existing Diagnoses & Clinical Concerns</label>
              <input
                type="text"
                value={formData.conditions}
                onChange={(e) => setFormData(prev => ({ ...prev, conditions: e.target.value }))}
                className="w-full text-sm bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-550 transition-all font-medium text-slate-800 dark:text-slate-100"
                placeholder="e.g. High blood pressure, Vitamin D deficit, None"
              />
            </div>

          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 gap-4">
            <div className="text-2xs text-slate-400 dark:text-slate-500 font-mono italic max-w-md">
              Demographic statistics are retained locally. They automatically configure medical recommendations, hydration goals and target wellness prompts.
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all shadow-xs shrink-0 cursor-pointer active:scale-97"
            >
              <Save className="w-4 h-4" />
              <span>Commit Profile Parameters</span>
            </button>
          </div>
        </form>
      </div>

      {/* Health Metrics & Computation Side Panel (Right Column) */}
      <div className="space-y-6">
        
        {/* BMI Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
            <HeartPulse className="w-4.5 h-4.5 text-indigo-500" />
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 font-display">Client-Side Diagnostic Gauges</h3>
          </div>

          <div className="space-y-4">
            {/* BMI gauge value */}
            <div className="text-center py-2">
              <span className="text-4xs uppercase tracking-widest font-black text-slate-400 block font-mono">Calculated BMI Value</span>
              <strong className="text-4xl font-extrabold text-slate-900 dark:text-white font-mono mt-0.5 block">
                {bmi > 0 ? bmi.toFixed(1) : "—"}
              </strong>
              <div className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${bmiColor}`}>
                {bmiCategory}
              </div>
            </div>

            {/* Metric progress visualization */}
            {bmi > 0 && (
              <div className="space-y-1.5">
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden flex">
                  <div className="h-full bg-amber-400" style={{ width: "25%" }} title="Underweight (< 18.5)" />
                  <div className="h-full bg-emerald-500" style={{ width: "35%" }} title="Normal (18.5 - 24.9)" />
                  <div className="h-full bg-orange-400" style={{ width: "20%" }} title="Overweight (25 - 29.9)" />
                  <div className="h-full bg-rose-500" style={{ width: "20%" }} title="Obese (>= 30)" />
                </div>
                {/* Pointer indicator */}
                <div className="relative h-4 text-xs font-mono font-bold text-slate-400 flex justify-center">
                  <div 
                    className="absolute -mt-1 transition-all duration-300"
                    style={{ left: `${Math.min(95, Math.max(5, ((bmi - 12) / 28) * 100))}%`, transform: 'translateX(-50%)' }}
                  >
                    ▲
                  </div>
                </div>
              </div>
            )}

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal text-center bg-slate-55 dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60">
              {bmiDescription}
            </p>
          </div>
        </div>

        {/* Dynamic Water & Metabolic Advice */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
            <Activity className="w-4.5 h-4.5 text-indigo-500" />
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 font-display">Target Hydration & Advisors</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-indigo-50/40 dark:bg-indigo-950/15 border border-indigo-100/40 dark:border-indigo-900/35 rounded-xl">
              <div>
                <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-extrabold uppercase tracking-wide font-mono block">Recommended Hydration</span>
                <p className="text-xs text-slate-550 dark:text-slate-400 mt-0.5">Calculated water targets daily</p>
              </div>
              <div className="text-right">
                <span className="text-lg font-mono font-extrabold text-indigo-700 dark:text-indigo-400">{recommendedWaterLiters} L</span>
                <span className="text-[10px] text-slate-400 block font-mono">per 24 hours</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50/30 dark:bg-emerald-950/10 border border-emerald-100/35 dark:border-emerald-900/20 rounded-xl">
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold uppercase tracking-wide font-mono block">Active Physical Safeguard</span>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium leading-relaxed font-sans">
                Gym checks should align with your configuration <strong>"{formData.fitnessGoal || profile.fitnessGoal || "General Active maintenance"}"</strong>. Maintain balanced nutrition matching protein allocations to repair muscle matrices after strain.
              </p>
            </div>
          </div>
        </div>

        {/* State Validation saved notice popups */}
        {isSaved && (
          <div className="bg-emerald-50 dark:bg-emerald-955 border border-emerald-500/50 rounded-xl p-3 flex items-center gap-3 shadow-md">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-2xs font-extrabold text-emerald-800 dark:text-emerald-250 font-sans leading-normal">Physiology metrics updated successfully. Press Snapshot Synchronization above to review tailored advisor highlights.</span>
          </div>
        )}

      </div>

    </div>
  );
}
