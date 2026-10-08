"use client";

import { useEffect, useState } from "react";
import { addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay, parseISO, addWeeks } from "date-fns";
import { AvailabilityPreview } from "./AvailabilityPreview";

interface DateAvailability {
  id: string;
  date: string;
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

interface DayState {
  date: Date;
  dateStr: string;
  availabilities: DateAvailability[];
  blocked: BlockedDate | null;
  isCurrentMonth: boolean;
}

export default function UnifiedAvailabilityManager() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dateAvails, setDateAvails] = useState<DateAvailability[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [settings, setSettings] = useState<BookingSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal states
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [modalMode, setModalMode] = useState<"open" | "block">("open");
  
  // Date modal form
  const [dateForm, setDateForm] = useState({
    startTime: "10:00",
    endTime: "16:00",
    reason: "",
  });

  // Weekly template state
  const [showWeeklyTemplate, setShowWeeklyTemplate] = useState(false);
  const [weeklyTemplate, setWeeklyTemplate] = useState({
    weekdays: [1, 2, 3, 4, 5], // Mon-Fri default
    startTime: "10:00",
    endTime: "16:00",
    startDate: "",
    endDate: "",
  });

  // Settings modal
  const [showSettings, setShowSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    slotLengthMin: 60,
    bufferMin: 15,
    minLeadTimeHrs: 24,
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (settings) {
      setSettingsForm({
        slotLengthMin: settings.slotLengthMin,
        bufferMin: settings.bufferMin,
        minLeadTimeHrs: settings.minLeadTimeHrs,
      });
    }
  }, [settings]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [datesRes, blockedRes, settingsRes] = await Promise.all([
        fetch("/api/admin/availability/dates"),
        fetch("/api/admin/availability/blocked"),
        fetch("/api/admin/availability/settings"),
      ]);

      if (datesRes.ok) {
        const datesData = await datesRes.json();
        setDateAvails(datesData);
      }

      if (blockedRes.ok) {
        const blockedData = await blockedRes.json();
        setBlockedDates(blockedData);
      }

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings(settingsData);
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

  const getCalendarDays = (): DayState[] => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    
    const startDate = new Date(start);
    startDate.setDate(startDate.getDate() - start.getDay());
    
    const days: DayState[] = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      const dateStr = format(current, "yyyy-MM-dd");
      
      days.push({
        date: new Date(current),
        dateStr,
        availabilities: dateAvails.filter(a => a.date === dateStr),
        blocked: blockedDates.find(b => b.date === dateStr) || null,
        isCurrentMonth: current.getMonth() === currentMonth.getMonth(),
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const handleDayClick = (day: DayState) => {
    if (!day.isCurrentMonth) return;
    
    setSelectedDate(day.date);
    setDateForm({
      startTime: day.availabilities[0]?.startTime || "10:00",
      endTime: day.availabilities[0]?.endTime || "16:00",
      reason: day.blocked?.reason || "",
    });
    setModalMode(day.blocked ? "block" : "open");
    setShowDateModal(true);
  };

  const handleSaveDate = async () => {
    if (!selectedDate) return;
    
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    
    try {
      if (modalMode === "open") {
        // Create or update DateAvailability
        const res = await fetch("/api/admin/availability/dates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: dateStr,
            startTime: dateForm.startTime,
            endTime: dateForm.endTime,
          }),
        });

        if (res.ok) {
          await loadData();
          setShowDateModal(false);
          showSuccess("Availability added!");
        } else {
          const error = await res.json();
          alert(error.error || "Failed to add availability");
        }
      } else {
        // Create or update BlockedDate
        const res = await fetch("/api/admin/availability/blocked", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: dateStr,
            reason: dateForm.reason || null,
          }),
        });

        if (res.ok) {
          await loadData();
          setShowDateModal(false);
          showSuccess("Date blocked!");
        } else {
          const error = await res.json();
          alert(error.error || "Failed to block date");
        }
      }
    } catch (error) {
      console.error("Error saving date:", error);
      alert("Failed to save date");
    }
  };

  const handleDeleteAvailability = async (id: string) => {
    if (!confirm("Delete this availability?")) return;
    
    try {
      const res = await fetch(`/api/admin/availability/dates/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await loadData();
        showSuccess("Availability deleted!");
      } else {
        alert("Failed to delete availability");
      }
    } catch (error) {
      console.error("Error deleting availability:", error);
      alert("Failed to delete availability");
    }
  };

  const handleDeleteBlock = async (id: string) => {
    if (!confirm("Remove this block?")) return;
    
    try {
      const res = await fetch(`/api/admin/availability/blocked/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await loadData();
        showSuccess("Block removed!");
      } else {
        alert("Failed to remove block");
      }
    } catch (error) {
      console.error("Error removing block:", error);
      alert("Failed to remove block");
    }
  };

  const handleApplyWeeklyTemplate = async () => {
    if (!weeklyTemplate.startDate || !weeklyTemplate.endDate) {
      alert("Please select start and end dates");
      return;
    }

    if (weeklyTemplate.weekdays.length === 0) {
      alert("Please select at least one weekday");
      return;
    }

    try {
      const start = parseISO(weeklyTemplate.startDate);
      const end = parseISO(weeklyTemplate.endDate);
      
      const allDays = eachDayOfInterval({ start, end });
      const selectedDays = allDays.filter(day => 
        weeklyTemplate.weekdays.includes(day.getDay())
      );

      const res = await fetch("/api/admin/availability/dates/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "multi_date",
          dates: selectedDays.map(d => format(d, "yyyy-MM-dd")),
          startTime: weeklyTemplate.startTime,
          endTime: weeklyTemplate.endTime,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        await loadData();
        setShowWeeklyTemplate(false);
        showSuccess(result.message);
      } else {
        const error = await res.json();
        alert(error.error || "Failed to apply template");
      }
    } catch (error) {
      console.error("Error applying template:", error);
      alert("Failed to apply template");
    }
  };

  const handleSaveSettings = async () => {
    try {
      const res = await fetch("/api/admin/availability/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsForm),
      });

      if (res.ok) {
        await loadData();
        setShowSettings(false);
        showSuccess("Settings saved!");
      } else {
        const error = await res.json();
        alert(error.error || "Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings");
    }
  };

  const toggleWeekday = (day: number) => {
    if (weeklyTemplate.weekdays.includes(day)) {
      setWeeklyTemplate({
        ...weeklyTemplate,
        weekdays: weeklyTemplate.weekdays.filter(d => d !== day),
      });
    } else {
      setWeeklyTemplate({
        ...weeklyTemplate,
        weekdays: [...weeklyTemplate.weekdays, day].sort(),
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  const calendarDays = getCalendarDays();
  const monthName = format(currentMonth, "MMMM yyyy");
  
  const allExceptions = [
    ...dateAvails.map(a => ({ ...a, type: "available" as const })),
    ...blockedDates.map(b => ({ ...b, type: "blocked" as const })),
  ].sort((a, b) => a.date.localeCompare(b.date));

  const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-6">
      {/* Preview */}
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

      {/* Month Calendar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Calendar</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setShowWeeklyTemplate(true)}
                className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                Weekly Template
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                Settings
              </button>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50"
                aria-label="Previous month"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <h4 className="text-lg font-medium text-gray-900 whitespace-nowrap">{monthName}</h4>
              
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50"
                aria-label="Next month"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {WEEKDAY_NAMES.map((day) => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, idx) => {
                const hasAvailability = day.availabilities.length > 0;
                const isBlocked = day.blocked !== null;
                
                return (
                  <button
                    key={idx}
                    onClick={() => handleDayClick(day)}
                    disabled={!day.isCurrentMonth}
                    className={`
                      aspect-square min-h-[44px] flex items-center justify-center text-sm rounded
                      transition-colors
                      ${!day.isCurrentMonth ? "text-gray-300 cursor-not-allowed" : ""}
                      ${day.isCurrentMonth && !hasAvailability && !isBlocked ? "text-gray-700 hover:bg-gray-100 border border-gray-200" : ""}
                      ${hasAvailability ? "bg-green-50 border border-green-300 text-green-900 font-medium hover:bg-green-100" : ""}
                      ${isBlocked ? "bg-red-50 border border-red-300 text-red-900 font-medium hover:bg-red-100" : ""}
                    `}
                  >
                    {format(day.date, "d")}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-50 border border-green-300 rounded"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-50 border border-red-300 rounded"></div>
                  <span>Blocked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border border-gray-200 rounded"></div>
                  <span>No availability</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Exceptions List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Exceptions & Blocks ({allExceptions.length})
        </h3>
        
        {allExceptions.length === 0 ? (
          <p className="text-gray-500 text-sm">No dates scheduled yet. Click a date on the calendar to add availability or block a date.</p>
        ) : (
          <div className="space-y-2">
            {allExceptions.map((item) => {
              const isAvailable = item.type === "available";
              const avail = isAvailable ? (item as DateAvailability) : null;
              const blocked = !isAvailable ? (item as BlockedDate) : null;
              
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded hover:border-gray-300"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                        isAvailable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        {isAvailable ? "OPEN" : "BLOCKED"}
                      </span>
                      <span className="font-medium text-gray-900">
                        {format(parseISO(item.date), "EEE, MMM d, yyyy")}
                      </span>
                    </div>
                    {avail && (
                      <p className="text-sm text-gray-600 mt-1 ml-14">
                        {avail.startTime} – {avail.endTime} {avail.timezone}
                      </p>
                    )}
                    {blocked && blocked.reason && (
                      <p className="text-sm text-gray-600 mt-1 ml-14">
                        {blocked.reason}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => 
                      isAvailable 
                        ? handleDeleteAvailability(item.id) 
                        : handleDeleteBlock(item.id)
                    }
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Date Modal */}
      {showDateModal && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {format(selectedDate, "EEEE, MMMM d, yyyy")}
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Action
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setModalMode("open")}
                  className={`flex-1 px-4 py-2 rounded ${
                    modalMode === "open"
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Open for Booking
                </button>
                <button
                  onClick={() => setModalMode("block")}
                  className={`flex-1 px-4 py-2 rounded ${
                    modalMode === "block"
                      ? "bg-red-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Block Date
                </button>
              </div>
            </div>

            {modalMode === "open" ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time (ET)
                    </label>
                    <input
                      type="time"
                      value={dateForm.startTime}
                      onChange={(e) => setDateForm({ ...dateForm, startTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time (ET)
                    </label>
                    <input
                      type="time"
                      value={dateForm.endTime}
                      onChange={(e) => setDateForm({ ...dateForm, endTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason (optional)
                </label>
                <input
                  type="text"
                  value={dateForm.reason}
                  onChange={(e) => setDateForm({ ...dateForm, reason: e.target.value })}
                  placeholder="e.g., Holiday, Out of office"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDate}
                className="flex-1 px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Template Modal */}
      {showWeeklyTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Weekly Template
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Bulk-create availability for selected weekdays across a date range.
              This will create individual DateAvailability records (not a fallback rule).
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
                      className={`px-4 py-2 rounded border ${
                        weeklyTemplate.weekdays.includes(idx)
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
                    value={weeklyTemplate.startDate}
                    onChange={(e) => setWeeklyTemplate({ ...weeklyTemplate, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={weeklyTemplate.endDate}
                    onChange={(e) => setWeeklyTemplate({ ...weeklyTemplate, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
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
                    value={weeklyTemplate.startTime}
                    onChange={(e) => setWeeklyTemplate({ ...weeklyTemplate, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time (ET)
                  </label>
                  <input
                    type="time"
                    value={weeklyTemplate.endTime}
                    onChange={(e) => setWeeklyTemplate({ ...weeklyTemplate, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowWeeklyTemplate(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyWeeklyTemplate}
                className="flex-1 px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
              >
                Apply Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Booking Settings
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slot Length (minutes)
                </label>
                <input
                  type="number"
                  value={settingsForm.slotLengthMin}
                  onChange={(e) => setSettingsForm({ ...settingsForm, slotLengthMin: parseInt(e.target.value) })}
                  min="15"
                  max="480"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">Duration of each booking slot</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buffer Between Slots (minutes)
                </label>
                <input
                  type="number"
                  value={settingsForm.bufferMin}
                  onChange={(e) => setSettingsForm({ ...settingsForm, bufferMin: parseInt(e.target.value) })}
                  min="0"
                  max="120"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">Time between consecutive bookings</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Lead Time (hours)
                </label>
                <input
                  type="number"
                  value={settingsForm.minLeadTimeHrs}
                  onChange={(e) => setSettingsForm({ ...settingsForm, minLeadTimeHrs: parseInt(e.target.value) })}
                  min="0"
                  max="168"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum advance notice required</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSettings}
                className="flex-1 px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
