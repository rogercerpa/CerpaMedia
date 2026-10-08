"use client";

import { useEffect, useState } from "react";

interface TimeSlot {
  start: string;
  end: string;
}

export function AvailabilityPreview() {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPreview = async () => {
    setLoading(true);
    setError(null);
    try {
      const start = new Date();
      const end = new Date();
      end.setDate(end.getDate() + 60);

      const response = await fetch(
        `/api/booking/slots?start=${start.toISOString()}&end=${end.toISOString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to load preview");
      }

      const data = await response.json();
      setSlots(data.slots.slice(0, 10)); // Show first 10 slots
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load preview");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPreview();
  }, []);

  const formatSlot = (slot: TimeSlot) => {
    const start = new Date(slot.start);
    return start.toLocaleString("en-US", {
      timeZone: "America/New_York",
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    });
  };

  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-blue-900 mb-3 uppercase tracking-wider">
          What Customers See
        </h3>
        <p className="text-blue-700 text-sm">Loading preview...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-red-900 mb-3 uppercase tracking-wider">
          What Customers See
        </h3>
        <p className="text-red-700 text-sm">{error}</p>
        <button
          onClick={loadPreview}
          className="mt-3 text-sm text-red-800 hover:text-red-900 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-blue-900 uppercase tracking-wider">
          What Customers See
        </h3>
        <button
          onClick={loadPreview}
          className="text-xs text-blue-700 hover:text-blue-900 underline"
        >
          Refresh
        </button>
      </div>

      {slots.length === 0 ? (
        <div className="space-y-2">
          <p className="text-blue-900 font-medium">No available slots</p>
          <p className="text-blue-700 text-sm">
            Customers see "No available time slots" when they try to book. Add
            dates above to make slots available.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-blue-900 font-medium">
            Next {slots.length} bookable slots:
          </p>
          <ul className="space-y-1 text-sm text-blue-800">
            {slots.map((slot, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                <span>{formatSlot(slot)}</span>
              </li>
            ))}
          </ul>
          {slots.length === 10 && (
            <p className="text-xs text-blue-600 italic mt-3">
              (Showing first 10 slots only)
            </p>
          )}
        </div>
      )}
    </div>
  );
}
