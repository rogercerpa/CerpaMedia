"use client";

import { useEffect, useState } from "react";
import { addWeeks, eachDayOfInterval, parseISO, format, isWeekend, startOfWeek, endOfWeek } from "date-fns";
import { AvailabilityPreview } from "./AvailabilityPreview";

interface DateAvailability {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  timezone: string;
}

interface Holiday {
  date: string;
  name: string;
  federal: boolean;
}

interface BookingSettings {
  id: string;
  slotLengthMin: number;
  bufferMin: number;
  minLeadTimeHrs: number;
}

type TabType = "single" | "multi" | "range" | "pattern" | "holidays" | "manage" | "settings";

export default function DateAvailabilityManager() {
  const [dateAvails, setDateAvails] = useState<DateAvailability[]>([]);
  const [settings, setSettings] = useState<BookingSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("single");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [singleDate, setSingleDate] = useState({
    date: "",
    startTime: "10:00",
    endTime: "16:00",
  });

  const [multiDates, setMultiDates] = useState<string[]>([]);
  const [multiDateInput, setMultiDateInput] = useState("");
  const [multiHours, setMultiHours] = useState({
    startTime: "10:00",
    endTime: "16:00",
  });

  const [rangeForm, setRangeForm] = useState({
    startDate: "",
    endDate: "",
    startTime: "10:00",
    endTime: "16:00",
    weekdaysOnly: true,
  });

  const [patternForm, setPatternForm] = useState({
    weekdays: [1, 2, 3, 4, 5],
    startTime: "10:00",
    endTime: "16:00",
    numberOfWeeks: 4,
    startDate: "",
  });

  const [holidayForm, setHolidayForm] = useState({
    year: new Date().getFullYear(),
    federalOnly: true,
  });
  const [holidayPreview, setHolidayPreview] = useState<Holiday[]>([]);
  const [selectedHolidays, setSelectedHolidays] = useState<string[]>([]);

  const [selectedAvails, setSelectedAvails] = useState<string[]>([]);

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
    setError(null);
    try {
      const [datesRes, settingsRes] = await Promise.all([
        fetch("/api/admin/availability/dates"),
        fetch("/api/admin/availability/settings"),
      ]);

      if (datesRes.status === 503) {
        const errorData = await datesRes.json();
        if (errorData.code === "TABLE_MISSING") {
          setError(
            "⚠️ DateAvailability table is missing. Please run: npx prisma db push on your production database."
          );
        } else {
          setError("Service temporarily unavailable");
        }
        setLoading(false);
        return;
      }

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
      setError("Failed to load data. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const addSingleDate = async () => {
    if (!singleDate.date) {
      alert("Please select a date");
      return;
    }

    setError(null);
    try {
      const res = await fetch("/api/admin/availability/dates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(singleDate),
      });

      if (res.status === 503) {
        const errorData = await res.json();
        if (errorData.code === "TABLE_MISSING") {
          setError(
            "⚠️ DateAvailability table is missing. Please run: npx prisma db push on your production database."
          );
          return;
        }
      }

      if (res.ok) {
        await loadData();
        setSingleDate({
          date: "",
          startTime: "10:00",
          endTime: "16:00",
        });
        showSuccess("Date added successfully!");
      } else {
        const error = await res.json();
        alert(error.error || "Failed to add date availability");
      }
    } catch (error) {
      console.error("Error adding date availability:", error);
      alert("Failed to add date availability");
    }
  };

  const addMultiDates = async () => {
    if (multiDates.length === 0) {
      alert("Please select at least one date");
      return;
    }

    setError(null);
    try {
      const res = await fetch("/api/admin/availability/dates/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "multi_date",
          dates: multiDates,
          startTime: multiHours.startTime,
          endTime: multiHours.endTime,
        }),
      });

      if (res.status === 503) {
        const errorData = await res.json();
        if (errorData.code === "TABLE_MISSING") {
          setError(
            "⚠️ DateAvailability table is missing. Please run: npx prisma db push on your production database."
          );
          return;
        }
      }

      if (res.ok) {
        const result = await res.json();
        await loadData();
        setMultiDates([]);
        setMultiDateInput("");
        showSuccess(result.message);
      } else {
        const error = await res.json();
        alert(error.error || "Failed to add dates");
      }
    } catch (error) {
      console.error("Error adding dates:", error);
      alert("Failed to add dates");
    }
  };

  const addDateRange = async () => {
    if (!rangeForm.startDate || !rangeForm.endDate) {
      alert("Please select start and end dates");
      return;
    }

    setError(null);
    try {
      const res = await fetch("/api/admin/availability/dates/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "date_range",
          startDate: rangeForm.startDate,
          endDate: rangeForm.endDate,
          startTime: rangeForm.startTime,
          endTime: rangeForm.endTime,
          weekdaysOnly: rangeForm.weekdaysOnly,
        }),
      });

      if (res.status === 503) {
        const errorData = await res.json();
        if (errorData.code === "TABLE_MISSING") {
          setError(
            "⚠️ DateAvailability table is missing. Please run: npx prisma db push on your production database."
          );
          return;
        }
      }

      if (res.ok) {
        const result = await res.json();
        await loadData();
        setRangeForm({
          startDate: "",
          endDate: "",
          startTime: "10:00",
          endTime: "16:00",
          weekdaysOnly: true,
        });
        showSuccess(result.message);
      } else {
        const error = await res.json();
        alert(error.error || "Failed to add date range");
      }
    } catch (error) {
      console.error("Error adding date range:", error);
      alert("Failed to add date range");
    }
  };

  const addWeekdayPattern = async () => {
    if (!patternForm.startDate || patternForm.weekdays.length === 0) {
      alert("Please select start date and at least one weekday");
      return;
    }

    setError(null);

    try {
      const startDate = parseISO(patternForm.startDate);
      const endDate = addWeeks(startDate, patternForm.numberOfWeeks);
      
      const allDays = eachDayOfInterval({ start: startDate, end: endDate });
      const selectedDays = allDays.filter(day => patternForm.weekdays.includes(day.getDay()));

      const res = await fetch("/api/admin/availability/dates/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "multi_date",
          dates: selectedDays.map(d => format(d, "yyyy-MM-dd")),
          startTime: patternForm.startTime,
          endTime: patternForm.endTime,
        }),
      });

      if (res.status === 503) {
        const errorData = await res.json();
        if (errorData.code === "TABLE_MISSING") {
          setError(
            "⚠️ DateAvailability table is missing. Please run: npx prisma db push on your production database."
          );
          return;
        }
      }

      if (res.ok) {
        const result = await res.json();
        await loadData();
        showSuccess(result.message);
      } else {
        const error = await res.json();
        alert(error.error || "Failed to add pattern");
      }
    } catch (error) {
      console.error("Error adding pattern:", error);
      alert("Failed to add pattern");
    }
  };

  const loadHolidayPreview = async () => {
    try {
      const res = await fetch(
        `/api/admin/availability/blocked/bulk?year=${holidayForm.year}&federalOnly=${holidayForm.federalOnly}`
      );

      if (res.ok) {
        const data = await res.json();
        setHolidayPreview(data.holidays);
        setSelectedHolidays(data.holidays.map((h: Holiday) => h.date));
      } else {
        alert("Failed to load holiday preview");
      }
    } catch (error) {
      console.error("Error loading holidays:", error);
      alert("Failed to load holiday preview");
    }
  };

  const blockSelectedHolidays = async () => {
    if (selectedHolidays.length === 0) {
      alert("Please select at least one holiday to block");
      return;
    }

    setError(null);

    try {
      const selectedHolidayData = holidayPreview
        .filter(h => selectedHolidays.includes(h.date))
        .map(h => ({ date: h.date, reason: h.name }));

      const res = await fetch("/api/admin/availability/blocked/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customDates: selectedHolidayData,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        showSuccess(result.message);
        setHolidayPreview([]);
        setSelectedHolidays([]);
      } else {
        const error = await res.json();
        alert(error.error || "Failed to block holidays");
      }
    } catch (error) {
      console.error("Error blocking holidays:", error);
      alert("Failed to block holidays");
    }
  };

  const deleteSingleAvail = async (id: string) => {
    if (!confirm("Delete this date availability?")) return;

    try {
      const res = await fetch(`/api/admin/availability/dates/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await loadData();
        showSuccess("Date deleted successfully!");
      } else {
        alert("Failed to delete date availability");
      }
    } catch (error) {
      console.error("Error deleting date availability:", error);
      alert("Failed to delete date availability");
    }
  };

  const deleteSelectedAvails = async () => {
    if (selectedAvails.length === 0) {
      alert("Please select dates to delete");
      return;
    }

    if (!confirm(`Delete ${selectedAvails.length} selected date(s)?`)) return;

    try {
      const res = await fetch("/api/admin/availability/dates/bulk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedAvails }),
      });

      if (res.ok) {
        const result = await res.json();
        await loadData();
        setSelectedAvails([]);
        showSuccess(result.message);
      } else {
        const error = await res.json();
        alert(error.error || "Failed to delete dates");
      }
    } catch (error) {
      console.error("Error deleting dates:", error);
      alert("Failed to delete dates");
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
        showSuccess("Settings saved successfully!");
      } else {
        const error = await res.json();
        alert(error.error || "Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings");
    }
  };

  const addMultiDateInput = () => {
    if (!multiDateInput) return;
    if (!multiDates.includes(multiDateInput)) {
      setMultiDates([...multiDates, multiDateInput].sort());
    }
    setMultiDateInput("");
  };

  const removeMultiDate = (date: string) => {
    setMultiDates(multiDates.filter((d) => d !== date));
  };

  const toggleWeekday = (day: number) => {
    if (patternForm.weekdays.includes(day)) {
      setPatternForm({
        ...patternForm,
        weekdays: patternForm.weekdays.filter((d) => d !== day),
      });
    } else {
      setPatternForm({
        ...patternForm,
        weekdays: [...patternForm.weekdays, day].sort(),
      });
    }
  };

  const toggleHoliday = (date: string) => {
    if (selectedHolidays.includes(date)) {
      setSelectedHolidays(selectedHolidays.filter((d) => d !== date));
    } else {
      setSelectedHolidays([...selectedHolidays, date]);
    }
  };

  const toggleAvailSelection = (id: string) => {
    if (selectedAvails.includes(id)) {
      setSelectedAvails(selectedAvails.filter((aid) => aid !== id));
    } else {
      setSelectedAvails([...selectedAvails, id]);
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

  if (error && error.includes("TABLE_MISSING")) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <div className="text-yellow-600 text-2xl">⚠️</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                Database Schema Update Required
              </h3>
              <p className="text-yellow-800 mb-4">
                The DateAvailability table does not exist in your production database yet.
                This table was added in PR #14 but needs to be created on your Neon database.
              </p>
              <div className="bg-white border border-yellow-300 rounded p-4 mb-4">
                <p className="text-sm font-mono text-gray-900 mb-2">
                  npx prisma db push
                </p>
                <p className="text-xs text-gray-600">
                  Run this command to create the DateAvailability table (and any other missing tables like Booking and BookingSettings).
                </p>
              </div>
              <p className="text-sm text-yellow-800">
                <strong>Database:</strong> ep-muddy-forest-b57tyb64.c-7.us-east-2.aws.neon.tech
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-6">
      {/* Preview: What Customers See */}
      <AvailabilityPreview />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">{successMessage}</p>
        </div>
      )}

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-4 overflow-x-auto">
          {[
            { key: "single" as TabType, label: "Single Date" },
            { key: "multi" as TabType, label: "Multi-Select" },
            { key: "range" as TabType, label: "Date Range" },
            { key: "pattern" as TabType, label: "Weekly Pattern" },
            { key: "holidays" as TabType, label: "Block Holidays" },
            { key: "manage" as TabType, label: "Manage Dates" },
            { key: "settings" as TabType, label: "Settings" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap
                ${
                  activeTab === tab.key
                    ? "border-gray-900 text-gray-900"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === "single" && (
        <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Add Single Date
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Add one specific date with working hours.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={singleDate.date}
                onChange={(e) =>
                  setSingleDate({ ...singleDate, date: e.target.value })
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
                  value={singleDate.startTime}
                  onChange={(e) =>
                    setSingleDate({ ...singleDate, startTime: e.target.value })
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
                  value={singleDate.endTime}
                  onChange={(e) =>
                    setSingleDate({ ...singleDate, endTime: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            </div>
            <button
              onClick={addSingleDate}
              className="w-full bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors"
            >
              Add Date
            </button>
          </div>
        </div>
      )}

      {activeTab === "multi" && (
        <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Multi-Date Selection
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Select multiple dates and apply the same hours to all of them at once.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Add Dates
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={multiDateInput}
                  onChange={(e) => setMultiDateInput(e.target.value)}
                  min={getTodayDate()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <button
                  onClick={addMultiDateInput}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Add
                </button>
              </div>
            </div>

            {multiDates.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selected Dates ({multiDates.length})
                </label>
                <div className="space-y-1 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-2">
                  {multiDates.map((date) => (
                    <div
                      key={date}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <span className="text-sm text-gray-700">
                        {new Date(date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <button
                        onClick={() => removeMultiDate(date)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time (ET)
                </label>
                <input
                  type="time"
                  value={multiHours.startTime}
                  onChange={(e) =>
                    setMultiHours({ ...multiHours, startTime: e.target.value })
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
                  value={multiHours.endTime}
                  onChange={(e) =>
                    setMultiHours({ ...multiHours, endTime: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            </div>

            <button
              onClick={addMultiDates}
              disabled={multiDates.length === 0}
              className="w-full bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Add {multiDates.length} Date{multiDates.length !== 1 ? "s" : ""}
            </button>
          </div>
        </div>
      )}

      {activeTab === "range" && (
        <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Date Range Fill
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Fill a range of dates with the same availability hours.
          </p>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={rangeForm.startDate}
                  onChange={(e) =>
                    setRangeForm({ ...rangeForm, startDate: e.target.value })
                  }
                  min={getTodayDate()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={rangeForm.endDate}
                  onChange={(e) =>
                    setRangeForm({ ...rangeForm, endDate: e.target.value })
                  }
                  min={rangeForm.startDate || getTodayDate()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={rangeForm.weekdaysOnly}
                  onChange={(e) =>
                    setRangeForm({ ...rangeForm, weekdaysOnly: e.target.checked })
                  }
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Weekdays only (skip weekends)</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time (ET)
                </label>
                <input
                  type="time"
                  value={rangeForm.startTime}
                  onChange={(e) =>
                    setRangeForm({ ...rangeForm, startTime: e.target.value })
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
                  value={rangeForm.endTime}
                  onChange={(e) =>
                    setRangeForm({ ...rangeForm, endTime: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            </div>

            <button
              onClick={addDateRange}
              className="w-full bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors"
            >
              Fill Date Range
            </button>
          </div>
        </div>
      )}

      {activeTab === "pattern" && (
        <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Weekly Pattern
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Apply availability to specific weekdays across multiple weeks (e.g., every Monday–Friday for the next 4 weeks).
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Weekdays
              </label>
              <div className="flex flex-wrap gap-2">
                {WEEKDAY_NAMES.map((name, idx) => (
                  <button
                    key={idx}
                    onClick={() => toggleWeekday(idx)}
                    className={`px-4 py-2 rounded-md border transition-colors ${
                      patternForm.weekdays.includes(idx)
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={patternForm.startDate}
                  onChange={(e) =>
                    setPatternForm({ ...patternForm, startDate: e.target.value })
                  }
                  min={getTodayDate()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Weeks
                </label>
                <input
                  type="number"
                  value={patternForm.numberOfWeeks}
                  onChange={(e) =>
                    setPatternForm({
                      ...patternForm,
                      numberOfWeeks: parseInt(e.target.value) || 1,
                    })
                  }
                  min="1"
                  max="52"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time (ET)
                </label>
                <input
                  type="time"
                  value={patternForm.startTime}
                  onChange={(e) =>
                    setPatternForm({ ...patternForm, startTime: e.target.value })
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
                  value={patternForm.endTime}
                  onChange={(e) =>
                    setPatternForm({ ...patternForm, endTime: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            </div>

            <button
              onClick={addWeekdayPattern}
              disabled={patternForm.weekdays.length === 0 || !patternForm.startDate}
              className="w-full bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Apply Pattern
            </button>
          </div>
        </div>
      )}

      {activeTab === "holidays" && (
        <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Block US Holidays
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Automatically block US federal or common holidays from your availability calendar.
          </p>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year
                </label>
                <input
                  type="number"
                  value={holidayForm.year}
                  onChange={(e) =>
                    setHolidayForm({
                      ...holidayForm,
                      year: parseInt(e.target.value) || new Date().getFullYear(),
                    })
                  }
                  min={new Date().getFullYear() - 1}
                  max={new Date().getFullYear() + 10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 mt-7">
                  <input
                    type="checkbox"
                    checked={holidayForm.federalOnly}
                    onChange={(e) =>
                      setHolidayForm({ ...holidayForm, federalOnly: e.target.checked })
                    }
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Federal holidays only</span>
                </label>
              </div>
            </div>

            <button
              onClick={loadHolidayPreview}
              className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
            >
              Preview Holidays
            </button>

            {holidayPreview.length > 0 && (
              <>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Select Holidays to Block ({selectedHolidays.length} of {holidayPreview.length})
                    </label>
                    <button
                      onClick={() => {
                        if (selectedHolidays.length === holidayPreview.length) {
                          setSelectedHolidays([]);
                        } else {
                          setSelectedHolidays(holidayPreview.map((h) => h.date));
                        }
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {selectedHolidays.length === holidayPreview.length ? "Deselect All" : "Select All"}
                    </button>
                  </div>
                  <div className="space-y-1 max-h-64 overflow-y-auto border border-gray-200 rounded-md p-2">
                    {holidayPreview.map((holiday) => (
                      <label
                        key={holiday.date}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedHolidays.includes(holiday.date)}
                          onChange={() => toggleHoliday(holiday.date)}
                          className="rounded border-gray-300"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-900">
                            {holiday.name}
                          </span>
                          <span className="text-xs text-gray-500 ml-2">
                            {new Date(holiday.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          {holiday.federal && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                              Federal
                            </span>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={blockSelectedHolidays}
                  disabled={selectedHolidays.length === 0}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Block {selectedHolidays.length} Holiday{selectedHolidays.length !== 1 ? "s" : ""}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === "manage" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Scheduled Dates ({dateAvails.length})
              </h3>
              {selectedAvails.length > 0 && (
                <button
                  onClick={deleteSelectedAvails}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete {selectedAvails.length} Selected
                </button>
              )}
            </div>
            {dateAvails.length === 0 ? (
              <p className="text-gray-500 text-sm">No dates scheduled yet</p>
            ) : (
              <div className="space-y-1">
                {dateAvails
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((avail) => (
                    <div
                      key={avail.id}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-md hover:border-gray-300"
                    >
                      <input
                        type="checkbox"
                        checked={selectedAvails.includes(avail.id)}
                        onChange={() => toggleAvailSelection(avail.id)}
                        className="rounded border-gray-300"
                      />
                      <div className="flex-1">
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
                        onClick={() => deleteSingleAvail(avail.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
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
