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

export function BookingFlow() {
  const [step, setStep] = useState<"slots" | "intake" | "loading">("slots");
  const [slots, setSlots] = useState<SlotsByDay>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerCompany: "",
    platformPref: "Zoom",
    notes: "",
  });

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const start = new Date();
      const end = new Date();
      end.setDate(end.getDate() + 21);

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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
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

  if (step === "slots") {
    const dates = Object.keys(slots).sort();
    
    if (dates.length === 0) {
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
            Select Your Time
          </h2>
        </Reveal>
        
        <div className="space-y-8">
          {dates.map((date, idx) => (
            <Reveal key={date} delay={idx * 50}>
              <div className="border border-border p-6">
                <h3 className="text-lg font-medium text-text mb-4">
                  {formatDate(date)}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {slots[date].map((slot, slotIdx) => (
                    <button
                      key={slotIdx}
                      onClick={() => handleSlotSelect(slot)}
                      className="border border-border px-4 py-3 text-[15px] font-medium text-text hover:bg-bg-subtle hover:border-text-muted transition-all duration-200"
                    >
                      {formatSlotTime(slot)}
                    </button>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
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
                setStep("slots");
                setSelectedSlot(null);
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
                Phone Number (optional)
              </label>
              <input
                type="tel"
                id="customerPhone"
                value={formData.customerPhone}
                onChange={(e) =>
                  setFormData({ ...formData, customerPhone: e.target.value })
                }
                className="w-full border border-border px-4 py-3 text-text focus:outline-none focus:border-text-muted bg-transparent"
              />
            </div>

            <div>
              <label htmlFor="customerCompany" className="block text-text font-medium mb-2">
                Company (optional)
              </label>
              <input
                type="text"
                id="customerCompany"
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
                What's the challenge? (optional)
              </label>
              <textarea
                id="notes"
                rows={4}
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Brief description of what you'd like to discuss..."
                className="w-full border border-border px-4 py-3 text-text focus:outline-none focus:border-text-muted bg-transparent resize-none"
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
