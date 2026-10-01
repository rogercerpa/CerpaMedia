"use client";

import { useEffect, useState } from "react";

interface AvailabilityRule {
  id: string;
  weekday: number;
  startTime: string;
  endTime: string;
  timezone: string;
}

interface BlockedDate {
  id: string;
  date: string;
  reason?: string | null;
}

interface BookingSettings {
  id: string;
  slotLengthMin: number;
  bufferMin: number;
  minLeadTimeHrs: number;
}

const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AvailabilityManager() {
  const [rules, setRules] = useState<AvailabilityRule[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [settings, setSettings] = useState<BookingSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"schedule" | "blocked" | "settings">("schedule");

  // New rule form state
  const [newRule, setNewRule] = useState({
    weekday: 1,
    startTime: "10:00",
    endTime: "16:00",
  });

  // New blocked date form state
  const [newBlocked, setNewBlocked] = useState({
    date: "",
    reason: "",
  });

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    slotLengthMin: 60,
    bufferMin: 15,
    minLeadTimeHrs: 24,
  });

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rulesRes, blockedRes, settingsRes] = await Promise.all([
        fetch("/api/admin/availability/rules"),
        fetch("/api/admin/availability/blocked"),
        fetch("/api/admin/availability/settings"),
      ]);

      if (rulesRes.ok) {
        const rulesData = await rulesRes.json();
        setRules(rulesData);
      }

      if (blockedRes.ok) {
        const blockedData = await blockedRes.json();
        setBlockedDates(blockedData);
      }

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings(settingsData);
        setSettingsForm({
          slotLengthMin: settingsData.slotLengthMin,
          bufferMin: settingsData.bufferMin,
          minLeadTimeHrs: settingsData.minLeadTimeHrs,
        });
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const addRule = async () => {
    try {
      const res = await fetch("/api/admin/availability/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRule),
      });

      if (res.ok) {
        await loadData();
        setNewRule({
          weekday: 1,
          startTime: "10:00",
          endTime: "16:00",
        });
      } else {
        const error = await res.json();
        alert(error.error || "Failed to add rule");
      }
    } catch (error) {
      console.error("Error adding rule:", error);
      alert("Failed to add rule");
    }
  };

  const deleteRule = async (id: string) => {
    if (!confirm("Delete this availability window?")) return;

    try {
      const res = await fetch(`/api/admin/availability/rules/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await loadData();
      } else {
        alert("Failed to delete rule");
      }
    } catch (error) {
      console.error("Error deleting rule:", error);
      alert("Failed to delete rule");
    }
  };

  const addBlockedDate = async () => {
    if (!newBlocked.date) {
      alert("Please select a date");
      return;
    }

    try {
      const res = await fetch("/api/admin/availability/blocked", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBlocked),
      });

      if (res.ok) {
        await loadData();
        setNewBlocked({ date: "", reason: "" });
      } else {
        const error = await res.json();
        alert(error.error || "Failed to add blocked date");
      }
    } catch (error) {
      console.error("Error adding blocked date:", error);
      alert("Failed to add blocked date");
    }
  };

  const deleteBlockedDate = async (id: string) => {
    if (!confirm("Remove this blocked date?")) return;

    try {
      const res = await fetch(`/api/admin/availability/blocked/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await loadData();
      } else {
        alert("Failed to delete blocked date");
      }
    } catch (error) {
      console.error("Error deleting blocked date:", error);
      alert("Failed to delete blocked date");
    }
  };

  const saveSettings = async () => {
    try {
      const res = await fetch("/api/admin/availability/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsForm),
      });

      if (res.ok) {
        await loadData();
        alert("Settings saved successfully");
      } else {
        const error = await res.json();
        alert(error.error || "Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("schedule")}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm
              ${
                activeTab === "schedule"
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }
            `}
          >
            Weekly Schedule
          </button>
          <button
            onClick={() => setActiveTab("blocked")}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm
              ${
                activeTab === "blocked"
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }
            `}
          >
            Blocked Dates
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm
              ${
                activeTab === "settings"
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }
            `}
          >
            Booking Settings
          </button>
        </nav>
      </div>

      {/* Weekly Schedule Tab */}
      {activeTab === "schedule" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add Rule Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Add Availability Window
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Day of Week
                </label>
                <select
                  value={newRule.weekday}
                  onChange={(e) =>
                    setNewRule({ ...newRule, weekday: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  {WEEKDAY_NAMES.map((name, idx) => (
                    <option key={idx} value={idx}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={newRule.startTime}
                    onChange={(e) =>
                      setNewRule({ ...newRule, startTime: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={newRule.endTime}
                    onChange={(e) =>
                      setNewRule({ ...newRule, endTime: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
              </div>
              <button
                onClick={addRule}
                className="w-full bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors"
              >
                Add Window
              </button>
            </div>
          </div>

          {/* Rules List */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Current Schedule
            </h3>
            {rules.length === 0 ? (
              <p className="text-gray-500 text-sm">No availability windows set</p>
            ) : (
              <div className="space-y-2">
                {rules.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-md"
                  >
                    <div>
                      <span className="font-medium text-gray-900">
                        {WEEKDAY_NAMES[rule.weekday]}
                      </span>
                      <span className="text-gray-600 text-sm ml-3">
                        {rule.startTime} – {rule.endTime}
                      </span>
                      <span className="text-gray-400 text-xs ml-2">
                        {rule.timezone}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteRule(rule.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Blocked Dates Tab */}
      {activeTab === "blocked" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add Blocked Date Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Block a Date
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={newBlocked.date}
                  onChange={(e) =>
                    setNewBlocked({ ...newBlocked, date: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason (optional)
                </label>
                <input
                  type="text"
                  value={newBlocked.reason}
                  onChange={(e) =>
                    setNewBlocked({ ...newBlocked, reason: e.target.value })
                  }
                  placeholder="e.g., Holiday, Vacation"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <button
                onClick={addBlockedDate}
                className="w-full bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors"
              >
                Block Date
              </button>
            </div>
          </div>

          {/* Blocked Dates List */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Blocked Dates
            </h3>
            {blockedDates.length === 0 ? (
              <p className="text-gray-500 text-sm">No dates blocked</p>
            ) : (
              <div className="space-y-2">
                {blockedDates.map((blocked) => (
                  <div
                    key={blocked.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-md"
                  >
                    <div>
                      <span className="font-medium text-gray-900">
                        {new Date(blocked.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      {blocked.reason && (
                        <span className="text-gray-600 text-sm ml-3">
                          {blocked.reason}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => deleteBlockedDate(blocked.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Booking Settings Tab */}
      {activeTab === "settings" && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Booking Configuration
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slot Length (minutes)
                </label>
                <input
                  type="number"
                  value={settingsForm.slotLengthMin}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      slotLengthMin: parseInt(e.target.value),
                    })
                  }
                  min="15"
                  max="480"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Duration of each booking slot (15-480 minutes)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buffer Between Slots (minutes)
                </label>
                <input
                  type="number"
                  value={settingsForm.bufferMin}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      bufferMin: parseInt(e.target.value),
                    })
                  }
                  min="0"
                  max="120"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Time between consecutive bookings (0-120 minutes)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Lead Time (hours)
                </label>
                <input
                  type="number"
                  value={settingsForm.minLeadTimeHrs}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      minLeadTimeHrs: parseInt(e.target.value),
                    })
                  }
                  min="0"
                  max="168"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum advance notice required for bookings (0-168 hours)
                </p>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={saveSettings}
                  className="w-full bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>

          {/* Current Settings Summary */}
          {settings && (
            <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Current Configuration
              </h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {settings.slotLengthMin}
                  </div>
                  <div className="text-xs text-gray-600">min per slot</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {settings.bufferMin}
                  </div>
                  <div className="text-xs text-gray-600">min buffer</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {settings.minLeadTimeHrs}
                  </div>
                  <div className="text-xs text-gray-600">hrs lead time</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
