import React, { useState } from "react";
import { ShoppingCart, LayoutGrid, CheckCircle2, Circle, Plus, Heart, Trash2, Search, BarChart3, ListCollapse, Sparkles } from "lucide-react";
import { GroceryItem } from "../types";

interface GroceryLogisticsProps {
  groceries: GroceryItem[];
  onAddGrocery: (item: Omit<GroceryItem, "id">) => void;
  onToggleGrocery: (id: string) => void;
  onDeleteGrocery: (id: string) => void;
  onToggleEssential: (id: string) => void;
}

export default function GroceryLogistics({
  groceries,
  onAddGrocery,
  onToggleGrocery,
  onDeleteGrocery,
  onToggleEssential,
}: GroceryLogisticsProps) {
  const [itemName, setItemName] = useState("");
  const [itemAisle, setItemAisle] = useState<GroceryItem["aisle"]>("Produce");
  const [isEssential, setIsEssential] = useState(false);
  const [priorityReplenish, setPriorityReplenish] = useState(false);

  // Sub-tabs for the grocery section
  const [grocerySubTab, setGrocerySubTab] = useState<"shopping" | "history">("shopping");
  const [historySearch, setHistorySearch] = useState("");

  const commonEssentials = [
    { name: "Fresh Milk", aisle: "Dairy" },
    { name: "Organic Eggs", aisle: "Dairy" },
    { name: "Whole Grain Bread", aisle: "Pantry" },
    { name: "Coffee Beans", aisle: "Pantry" },
    { name: "Sourdough Toast", aisle: "Pantry" },
    { name: "Spinach & Greens", aisle: "Produce" },
    { name: "Paper Towels", aisle: "Household" },
    { name: "AA Batteries", aisle: "Hardware" },
  ] as const;

  const handleAddGrocery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) return;
    onAddGrocery({
      name: itemName,
      aisle: itemAisle,
      isRecurringEssential: isEssential,
      purchased: false,
      priorityReplenish: priorityReplenish,
    });
    setItemName("");
    setIsEssential(false);
    setPriorityReplenish(false);
  };

  const handleQuickAdd = (name: string, aisle: GroceryItem["aisle"]) => {
    const duplicate = groceries.find(g => g.name.toLowerCase() === name.toLowerCase() && !g.purchased);
    if (duplicate) return;

    onAddGrocery({
      name,
      aisle,
      isRecurringEssential: true,
      purchased: false,
      priorityReplenish: false,
    });
  };

  // Group items by aisle
  const aisles: GroceryItem["aisle"][] = ["Produce", "Dairy", "Meat / Deli", "Pantry", "Hardware", "Household", "Other"];
  
  // Splits
  const activeShoppingItems = groceries.filter(g => !g.purchased);
  const historicalPurchasedItems = groceries.filter(g => g.purchased);

  const activeItemsByAisle = aisles.reduce((acc, aisle) => {
    acc[aisle] = activeShoppingItems.filter((item) => item.aisle === aisle);
    return acc;
  }, {} as Record<GroceryItem["aisle"], GroceryItem[]>);

  // Search filter for historical items
  const filteredHistory = historicalPurchasedItems.filter(item => 
    item.name.toLowerCase().includes(historySearch.toLowerCase())
  );

  return (
    <div id="grocery-logistics-panel" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* Header bar and sub-tabs */}
      <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-5 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold font-display text-slate-800 dark:text-slate-150">Grocery Inventory & Logistics</h2>
          </div>

          <div className="flex bg-slate-100/80 dark:bg-slate-800/85 p-1 rounded-xl border border-slate-205/45 dark:border-slate-750/50 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setGrocerySubTab("shopping")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-3xs font-bold rounded-lg transition-all cursor-pointer ${
                grocerySubTab === "shopping"
                  ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-3xs"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <ListCollapse className="w-3 h-3" />
              <span>Shopping List ({activeShoppingItems.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setGrocerySubTab("history")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-3xs font-bold rounded-lg transition-all cursor-pointer ${
                grocerySubTab === "history"
                  ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-3xs"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <BarChart3 className="w-3 h-3" />
              <span>Purchased Logs ({historicalPurchasedItems.length})</span>
            </button>
          </div>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Smart shopping list categorized by retail aisle layouts with historical logistics tracking.</p>
      </div>

      <div className="p-5">
        
        {/* 1. SHOPPING LIST SUB-TAB */}
        {grocerySubTab === "shopping" && (
          <div className="space-y-6">
            {/* Recommended Recurring Essentials */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Recurring Essentials Hub</h3>
                <span className="text-3xs text-emerald-650 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded font-semibold font-mono">Quick Restock</span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {commonEssentials.map((item, idx) => {
                  const activeInCart = groceries.some(g => g.name.toLowerCase() === item.name.toLowerCase() && !g.purchased);
                  return (
                    <button
                      key={idx}
                      onClick={() => handleQuickAdd(item.name, item.aisle)}
                      disabled={activeInCart}
                      className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
                        activeInCart
                          ? "bg-emerald-50 dark:bg-emerald-955/20 text-emerald-700 dark:text-emerald-450 border-emerald-100 dark:border-emerald-900/40 cursor-not-allowed opacity-50"
                          : "bg-slate-50 dark:bg-slate-950/40 hover:bg-slate-105 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-300 border-slate-200/60 dark:border-slate-800 active:scale-97"
                      }`}
                    >
                      <span>{item.name}</span>
                      {!activeInCart ? <Plus className="w-3 h-3 text-slate-400" /> : <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleAddGrocery} className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-50/70 dark:bg-slate-955/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="md:col-span-2">
                <label className="block text-3xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Item Label / Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Bananas, Greek Greek Yogurt, Batteries..."
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-3xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Aisle Location</label>
                <select
                  value={itemAisle}
                  onChange={(e) => setItemAisle(e.target.value as any)}
                  className="w-full text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 rounded-lg p-2 text-slate-850 dark:text-slate-105 focus:outline-hidden"
                >
                  {aisles.map((a) => (
                    <option key={a} value={a} className="bg-white dark:bg-slate-900">{a}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end justify-between gap-3">
                <label className="mb-2.5 flex items-center gap-1.5 cursor-pointer text-2xs font-bold text-slate-600 dark:text-slate-400 select-none">
                  <input
                    type="checkbox"
                    checked={isEssential}
                    onChange={(e) => setIsEssential(e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-emerald-500/20"
                  />
                  <span>Essential Hub Log</span>
                </label>

                <button
                  type="submit"
                  disabled={!itemName.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-4 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Item</span>
                </button>
              </div>
            </form>

            {/* List categorized by aisle */}
            {activeShoppingItems.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 dark:bg-slate-950/20 rounded-xl border border-dashed border-slate-100 dark:border-slate-800 animate-pulse">
                <ShoppingCart className="w-8 h-8 text-slate-300 dark:text-slate-650 mx-auto mb-2" />
                <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold font-display">Active Shopping List Clear!</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-505 mt-1">Add items above or look at the logs history.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {aisles.map((aisle) => {
                  const items = activeItemsByAisle[aisle];
                  if (!items || items.length === 0) return null;

                  return (
                    <div key={aisle} className="bg-slate-50/30 dark:bg-slate-955/15 border border-slate-100 dark:border-slate-800/85 rounded-xl p-4">
                      {/* Category Header */}
                      <div className="flex items-center justify-between border-b border-slate-205/60 dark:border-slate-800 pb-2 mb-2.5">
                        <span className="text-2xs font-extrabold text-slate-800 dark:text-slate-200 tracking-wider uppercase font-display">{aisle}</span>
                        <span className="text-3xs text-slate-400 dark:text-slate-505 font-mono italic">{items.length} active restocks</span>
                      </div>

                      {/* Items row */}
                      <div className="space-y-1.5 animate-fade-in-down">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-100/90 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
                          >
                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                              <button
                                onClick={() => onToggleGrocery(item.id)}
                                className="text-slate-350 hover:text-emerald-600 dark:text-slate-650 transition-colors cursor-pointer"
                                title="Check off"
                              >
                                <Circle className="w-4 h-4" />
                              </button>

                              <span className="text-xs font-semibold text-slate-750 dark:text-slate-250 truncate">
                                {item.name}
                              </span>

                              {item.isRecurringEssential && (
                                <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 px-1.5 py-0.2 rounded-full">
                                  <Heart className="w-1.5 h-1.5 fill-current" />
                                  <span>Essential</span>
                                </span>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => onToggleEssential(item.id)}
                                className={`p-1 rounded hover:bg-slate-105 dark:hover:bg-slate-805 transition-colors cursor-pointer ${
                                  item.isRecurringEssential ? "text-emerald-600" : "text-slate-300 dark:text-slate-650 hover:text-slate-400"
                                }`}
                                title="Toggle essential log status"
                              >
                                <Heart className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => onDeleteGrocery(item.id)}
                                className="text-slate-300 hover:text-rose-650 dark:text-slate-600 dark:hover:text-rose-405 p-1 rounded transition-colors cursor-pointer"
                                title="Delete Log"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 2. INVENTORY HISTORY SUB-TAB */}
        {grocerySubTab === "history" && (
          <div className="space-y-4">
            {/* KPI statistics cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-slate-50/50 dark:bg-slate-950/20 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="flex flex-col items-center justify-center p-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-lg">
                <span className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold">Total Stock Items</span>
                <span className="text-base font-black text-indigo-700 dark:text-indigo-400 font-mono">{groceries.length}</span>
              </div>
              <div className="flex flex-col items-center justify-center p-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-lg">
                <span className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold">Checked off</span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-450 font-mono">{historicalPurchasedItems.length}</span>
              </div>
              <div className="col-span-2 md:col-span-1 flex flex-col items-center justify-center p-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-lg">
                <span className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold text-center">Essential Core Checked</span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-350">
                  {groceries.filter(g => g.isRecurringEssential && g.purchased).length}/
                  {groceries.filter(g => g.isRecurringEssential).length}
                </span>
              </div>
            </div>

            {/* Inventory historical search console */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search previously purchased invoice history..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="w-full bg-slate-50/20 dark:bg-slate-950/20 text-xs border border-slate-205 dark:border-slate-805 rounded-lg pl-8 p-1.5 text-slate-801 dark:text-slate-101 focus:outline-hidden"
              />
            </div>

            {/* Historical Checked-off items */}
            <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
              {filteredHistory.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 dark:bg-slate-955/20 border border-dashed border-slate-101 dark:border-slate-800 rounded-xl">
                  <p className="text-xs text-slate-450 dark:text-slate-500">No checked-off past items found matching search description.</p>
                </div>
              ) : (
                filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-55/30 dark:bg-slate-950/15 border border-slate-100 dark:border-slate-805 hover:bg-slate-50 dark:hover:bg-slate-850"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <button
                        onClick={() => onToggleGrocery(item.id)}
                        className="text-emerald-605 dark:text-emerald-400 flex-shrink-0 cursor-pointer"
                        title="Re-add to active shop list"
                      >
                        <CheckCircle2 className="w-4.5 h-4.5" />
                      </button>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-500 line-through dark:text-slate-450 truncate">
                          {item.name}
                        </p>
                        <span className="text-[10px] text-slate-400 dark:text-slate-505 font-mono">
                          Aisle Location: {item.aisle} {item.isRecurringEssential ? "| Core Recurring Essential" : ""}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[9px] bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono p-1 rounded tracking-tight">
                        ARCHIVE STOCK
                      </span>
                      <button
                        onClick={() => onDeleteGrocery(item.id)}
                        className="text-slate-350 hover:text-rose-600 dark:text-slate-655 p-1 transition-colors cursor-pointer"
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
