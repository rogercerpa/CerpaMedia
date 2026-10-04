"use client";

import { useState, useEffect } from "react";
import { Reveal } from "./Reveal";

interface TimeSlot {
  start: string;
  end: string;
}

interface SlotsByDay {
  [date: string]: TimeSlot[];
}

interface DayInfo {
  date: Date;
  dateStr: string;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  hasSlots: boolean;
}

export function CalendarBookingFlow() {
  const [step, setStep] = useState<"calendar" | "slots" | "intake" | "loading">("calendar");
  const [slots, setSlots] = useState<SlotsByDay>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerCompany: "",
    platformPref: "Zoom",
    notes: "",
    website: "",
  });

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const start = new Date();
      const end = new Date();
      end.setDate(end.getDate() + 60);

      const response = await fetch(
        `/api/booking/slots?start=${start.toISOString()}&end=${end.toISOString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to load available slots");
      }

      const data = await response.json();
      
      const grouped: SlotsByDay = {};
      data.slots.forEach((slot: TimeSlot) => {
        const date = new Date(slot.start).toLocaleDateString("en-US", {
          timeZone: "America/New_York",
        });
        if (!grouped[date]) {
          grouped[date] = [];
        }
        grouped[date].push(slot);
      });

      setSlots(grouped);
      setLoading(false);
    } catch (err) {
      setError("Failed to load available time slots. Please try again.");
      setLoading(false);
    }
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setStep("intake");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSlot) return;

    setStep("loading");
    setError(null);

    try {
      const response = await fetch("/api/booking/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startTime: selectedSlot.start,
          endTime: selectedSlot.end,
          ...formData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create booking");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setStep("intake");
    }
  };

  const formatSlotTime = (slot: TimeSlot) => {
    const start = new Date(slot.start);
    return start.toLocaleTimeString("en-US", {
      timeZone: "America/New_York",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getCalendarDays = (): DayInfo[] => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: DayInfo[] = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      const dateStr = current.toLocaleDateString("en-US", {
        timeZone: "America/New_York",
      });
      
      days.push({
        date: new Date(current),
        dateStr,
        dayOfMonth: current.getDate(),
        isCurrentMonth: current.getMonth() === month,
        hasSlots: !!slots[dateStr] && slots[dateStr].length > 0,
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    const now = new Date();
    const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    if (prev >= new Date(now.getFullYear(), now.getMonth(), 1)) {
      setCurrentMonth(prev);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-text-muted">Loading available times...</p>
      </div>
    );
  }

  if (step === "loading") {
    return (
      <div className="text-center py-12">
        <p className="text-text-muted">Creating your booking session...</p>
      </div>
    );
  }

  if (step === "calendar") {
    const calendarDays = getCalendarDays();
    const monthName = currentMonth.toLocaleDateString("en-US", { 
      month: "long", 
      year: "numeric" 
    });
    const hasAnySlots = Object.keys(slots).length > 0;

    if (!hasAnySlots) {
      return (
        <div className="text-center py-12 border border-border p-8">
          <h3 className="text-xl font-medium mb-4 text-text">No Available Slots</h3>
          <p className="text-text-muted mb-6">
            There are currently no available time slots. Please check back later or contact us directly.
          </p>
          <a
            href="mailto:cerpamedia@gmail.com"
            className="text-text hover:underline font-medium"
          >
            cerpamedia@gmail.com
          </a>
        </div>
      );
    }

    return (
      <div>
        <Reveal>
          <h2 className="text-3xl md:text-4xl font-semibold text-text mb-8 text-center">
            Select a Date
          </h2>
        </Reveal>
        
        <Reveal delay={100}>
          <div className="max-w-3xl mx-auto border border-border bg-white p-6">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={prevMonth}
                className="px-4 py-2 border border-border text-text hover:bg-bg-subtle transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                disabled={currentMonth.getMonth() === new Date().getMonth() && 
                         currentMonth.getFullYear() === new Date().getFullYear()}
              >
                ← Previous
              </button>
              <h3 className="text-xl font-medium text-text">{monthName}</h3>
              <button
                onClick={nextMonth}
                className="px-4 py-2 border border-border text-text hover:bg-bg-subtle transition-colors"
              >
                Next →
              </button>
            </div>
            
            <div className="grid grid-cols-7 gap-2 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-text-muted py-2">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (day.hasSlots && day.isCurrentMonth) {
                      setSelectedDate(day.dateStr);
                      setStep("slots");
                    }
                  }}
                  disabled={!day.hasSlots || !day.isCurrentMonth}
                  className={`
                    aspect-square flex items-center justify-center text-sm border transition-all
                    ${!day.isCurrentMonth ? "text-gray-300 cursor-not-allowed border-transparent" : ""}
                    ${day.isCurrentMonth && !day.hasSlots ? "text-gray-400 cursor-not-allowed border-gray-200" : ""}
                    ${day.hasSlots && day.isCurrentMonth ? "text-text border-border hover:border-text-muted hover:bg-bg-subtle cursor-pointer font-medium" : ""}
                  `}
                >
                  {day.dayOfMonth}
                </button>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center gap-4 text-sm text-text-muted">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border border-border bg-white"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border border-gray-200 text-gray-400"></div>
                  <span>No availability</span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    );
  }

  if (step === "slots" && selectedDate) {
    const daySlots = slots[selectedDate] || [];
    const formattedDate = new Date(daySlots[0]?.start || selectedDate).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "America/New_York",
    });

    return (
      <div>
        <Reveal>
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-semibold text-text mb-4">
              Select Your Time
            </h2>
            <p className="text-lg text-text-muted mb-4">{formattedDate}</p>
            <button
              onClick={() => {
                setStep("calendar");
                setSelectedDate(null);
              }}
              className="text-text-muted hover:text-text text-sm underline"
            >
              ← Choose different date
            </button>
          </div>
        </Reveal>
        
        <Reveal delay={100}>
          <div className="max-w-2xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {daySlots.map((slot, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSlotSelect(slot)}
                  className="border border-border px-4 py-3 text-[15px] font-medium text-text hover:bg-bg-subtle hover:border-text-muted transition-all duration-200"
                >
                  {formatSlotTime(slot)}
                </button>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    );
  }

  if (step === "intake") {
    const selectedSlotFormatted = selectedSlot
      ? new Date(selectedSlot.start).toLocaleString("en-US", {
          timeZone: "America/New_York",
          weekday: "long",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          timeZoneName: "short",
        })
      : "";

    return (
      <div>
        <Reveal>
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-semibold text-text mb-4">
              Almost There
            </h2>
            <div className="border border-border inline-block px-6 py-3 mb-6">
              <p className="text-text font-medium">Selected Time:</p>
              <p className="text-text-muted text-[15px]">{selectedSlotFormatted}</p>
            </div>
            <button
              onClick={() => {
                setStep("calendar");
                setSelectedSlot(null);
                setSelectedDate(null);
              }}
              className="text-text-muted hover:text-text text-sm underline"
            >
              Change time
            </button>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
            {error && (
              <div className="border border-red-500 bg-red-50 p-4 text-red-900 text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="customerName" className="block text-text font-medium mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="customerName"
                required
                value={formData.customerName}
                onChange={(e) =>
                  setFormData({ ...formData, customerName: e.target.value })
                }
                className="w-full border border-border px-4 py-3 text-text focus:outline-none focus:border-text-muted bg-transparent"
              />
            </div>

            <div>
              <label htmlFor="customerEmail" className="block text-text font-medium mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="customerEmail"
                required
                value={formData.customerEmail}
                onChange={(e) =>
                  setFormData({ ...formData, customerEmail: e.target.value })
                }
                className="w-full border border-border px-4 py-3 text-text focus:outline-none focus:border-text-muted bg-transparent"
              />
            </div>

            <div>
              <label htmlFor="customerPhone" className="block text-text font-medium mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                id="customerPhone"
                required
                value={formData.customerPhone}
                onChange={(e) =>
                  setFormData({ ...formData, customerPhone: e.target.value })
                }
                className="w-full border border-border px-4 py-3 text-text focus:outline-none focus:border-text-muted bg-transparent"
              />
            </div>

            <div>
              <label htmlFor="customerCompany" className="block text-text font-medium mb-2">
                Company *
              </label>
              <input
                type="text"
                id="customerCompany"
                required
                value={formData.customerCompany}
                onChange={(e) =>
                  setFormData({ ...formData, customerCompany: e.target.value })
                }
                className="w-full border border-border px-4 py-3 text-text focus:outline-none focus:border-text-muted bg-transparent"
              />
            </div>

            <div>
              <label htmlFor="platformPref" className="block text-text font-medium mb-2">
                Video Platform Preference *
              </label>
              <select
                id="platformPref"
                required
                value={formData.platformPref}
                onChange={(e) =>
                  setFormData({ ...formData, platformPref: e.target.value })
                }
                className="w-full border border-border px-4 py-3 text-text focus:outline-none focus:border-text-muted bg-transparent"
              >
                <option value="Zoom">Zoom</option>
                <option value="Microsoft Teams">Microsoft Teams</option>
              </select>
            </div>

            <div>
              <label htmlFor="notes" className="block text-text font-medium mb-2">
                What's the main challenge you'd like to discuss? *
              </label>
              <textarea
                id="notes"
                rows={4}
                required
                minLength={40}
                maxLength={500}
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Brief description of what you'd like to discuss (40-500 characters)..."
                className="w-full border border-border px-4 py-3 text-text focus:outline-none focus:border-text-muted bg-transparent resize-none"
              />
              <p className="text-sm text-text-muted mt-1">
                {formData.notes.length}/500 characters (minimum 40)
              </p>
            </div>

            <div className="hidden" aria-hidden="true">
              <label htmlFor="website">Website (leave blank)</label>
              <input
                type="text"
                id="website"
                name="website"
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-cta text-cta-text px-8 py-4 text-[15px] font-medium hover:bg-cta-hover transition-all duration-200 hover:-translate-y-0.5"
              >
                Continue to Payment ($99)
              </button>
              <p className="text-sm text-text-muted text-center mt-4">
                You'll be redirected to Stripe to complete your payment securely
              </p>
            </div>
          </form>
        </Reveal>
      </div>
    );
  }

  return null;
}
