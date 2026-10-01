"use client";

import { useEffect, useState } from "react";

interface DateAvailability {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  timezone: string;
}

interface BookingSettings {
  id: string;
  slotLengthMin: number;
  bufferMin: number;
  minLeadTimeHrs: number;
}

export default function DateAvailabilityManager() {
  const [dateAvails, setDateAvails] = useState<DateAvailability[]>([]);
  const [settings, setSettings] = useState<BookingSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const [newDateAvail, setNewDateAvail] = useState({
    date: "",
    startTime: "10:00",
    endTime: "16:00",
  });

  const [settingsForm, setSettingsForm] = useState({
    slotLengthMin: 60,
    bufferMin: 15,
    minLeadTimeHrs: 24,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [datesRes, settingsRes] = await Promise.all([
        fetch("/api/admin/availability/dates"),
        fetch("/api/admin/availability/settings"),
      ]);

      if (datesRes.ok) {
        const datesData = await datesRes.json();
        setDateAvails(datesData);
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

  const addDateAvail = async () => {
    if (!newDateAvail.date) {
      alert("Please select a date");
      return;
    }

    try {
      const res = await fetch("/api/admin/availability/dates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDateAvail),
      });

      if (res.ok) {
        await loadData();
        setNewDateAvail({
          date: "",
          startTime: "10:00",
          endTime: "16:00",
        });
      } else {
        const error = await res.json();
        alert(error.error || "Failed to add date availability");
      }
    } catch (error) {
      console.error("Error adding date availability:", error);
      alert("Failed to add date availability");
    }
  };

  const deleteDateAvail = async (id: string) => {
    if (!confirm("Delete this date availability?")) return;

    try {
      const res = await fetch(`/api/admin/availability/dates/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await loadData();
      } else {
        alert("Failed to delete date availability");
      }
    } catch (error) {
      console.error("Error deleting date availability:", error);
      alert("Failed to delete date availability");
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

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Add Date Availability
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Set specific dates when you're available for consultations. Choose the date and your working hours for that day.
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={newDateAvail.date}
              onChange={(e) =>
                setNewDateAvail({ ...newDateAvail, date: e.target.value })
              }
              min={getTodayDate()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time (ET)
              </label>
              <input
                type="time"
                value={newDateAvail.startTime}
                onChange={(e) =>
                  setNewDateAvail({ ...newDateAvail, startTime: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time (ET)
              </label>
              <input
                type="time"
                value={newDateAvail.endTime}
                onChange={(e) =>
                  setNewDateAvail({ ...newDateAvail, endTime: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
          </div>
          <button
            onClick={addDateAvail}
            className="w-full bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors"
          >
            Add Date
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Scheduled Dates
        </h3>
        {dateAvails.length === 0 ? (
          <p className="text-gray-500 text-sm">No dates scheduled yet</p>
        ) : (
          <div className="space-y-2">
            {dateAvails
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((avail) => (
                <div
                  key={avail.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-md hover:border-gray-300"
                >
                  <div>
                    <span className="font-medium text-gray-900">
                      {new Date(avail.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    <span className="text-gray-600 text-sm ml-4">
                      {avail.startTime} – {avail.endTime} {avail.timezone}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteDateAvail(avail.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Booking Settings
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

      {settings && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
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
  );
}
