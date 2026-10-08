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

type ServiceInterest =
  | "general"
  | "web_mobile"
  | "ai"
  | "automation"
  | "strategy"
  | "not_sure";

interface IntakeAnswers {
  [key: string]: string;
}

export function CalendarBookingFlow() {
  const [step, setStep] = useState<"calendar" | "slots" | "intake" | "loading">("calendar");
  const [slots, setSlots] = useState<SlotsByDay>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerCompany: "",
    serviceInterest: "" as ServiceInterest | "",
    notes: "",
    platformPref: "Zoom",
    website: "",
  });

  const [intakeAnswers, setIntakeAnswers] = useState<IntakeAnswers>({});
  const [optionalExtras, setOptionalExtras] = useState({
    roleTitle: "",
    companyWebsite: "",
    urgency: "",
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
        // Extract YYYY-MM-DD in ET timezone
        const date = new Date(slot.start).toLocaleDateString("en-CA", {
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

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.customerName.trim()) {
      errors.customerName = "Full name is required";
    }
    if (!formData.customerEmail.trim()) {
      errors.customerEmail = "Email is required";
    }
    if (!formData.customerCompany.trim()) {
      errors.customerCompany = "Company name is required";
    }
    if (!formData.serviceInterest) {
      errors.serviceInterest = "Please select a service interest";
    }
    if (!formData.notes.trim()) {
      errors.notes = "Please describe your challenge";
    } else if (formData.notes.trim().length < 40) {
      errors.notes = "Please provide at least 40 characters";
    } else if (formData.notes.trim().length > 500) {
      errors.notes = "Please keep your challenge under 500 characters";
    }
    if (!formData.platformPref) {
      errors.platformPref = "Please select a platform";
    }

    // Validate branch questions are filled for the selected service
    if (formData.serviceInterest) {
      const branchQuestions = getBranchQuestions();
      if (branchQuestions) {
        for (const question of branchQuestions) {
          if (!intakeAnswers[question.id] || !intakeAnswers[question.id].trim()) {
            errors[question.id] = "This field is required for your selected service";
          }
        }
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSlot) return;

    if (!validateForm()) {
      return;
    }

    setStep("loading");
    setError(null);

    try {
      const combinedIntakeAnswers = {
        ...intakeAnswers,
        ...Object.fromEntries(
          Object.entries(optionalExtras).filter(([_, value]) => value)
        ),
      };

      const response = await fetch("/api/booking/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startTime: selectedSlot.start,
          endTime: selectedSlot.end,
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          customerPhone: formData.customerPhone || "",
          customerCompany: formData.customerCompany,
          serviceInterest: formData.serviceInterest,
          notes: formData.notes,
          platformPref: formData.platformPref,
          intakeAnswers: combinedIntakeAnswers,
          website: formData.website,
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

  const getBranchQuestions = () => {
    if (!formData.serviceInterest) return null;

    const questions: { [key in ServiceInterest]?: Array<{ id: string; label: string; placeholder?: string }> } = {
      web_mobile: [
        { id: "web_mobile_type", label: "Are you building something new, rebuilding, or extending existing?" },
        { id: "web_mobile_goal", label: "Primary goal (leads / operations / e-commerce / other)" },
        { id: "web_mobile_deadline", label: "Do you have a hard deadline?" },
      ],
      ai: [
        { id: "ai_workflow", label: "What's the first workflow you'd like to improve?" },
        { id: "ai_tools", label: "What tools/systems do you use today?" },
        { id: "ai_privacy", label: "Data/privacy concerns? (Yes / No / Unsure)" },
      ],
      automation: [
        { id: "automation_process", label: "What's your most painful repetitive process?" },
        { id: "automation_frequency", label: "How often does it happen?" },
        { id: "automation_tools", label: "What tools do you currently use?" },
      ],
      strategy: [
        { id: "strategy_decision", label: "What's your biggest technology decision right now?" },
        { id: "strategy_timeline", label: "What's your decision timeline?" },
        { id: "strategy_attendees", label: "Who else will be on the call?" },
      ],
      general: [
        { id: "general_win", label: "What would make this call a win for you?" },
        { id: "general_timeline", label: "What's your timeline for next steps?" },
      ],
      not_sure: [
        { id: "not_sure_win", label: "What would make this call a win for you?" },
        { id: "not_sure_timeline", label: "What's your timeline for next steps?" },
      ],
    };

    return questions[formData.serviceInterest as ServiceInterest];
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
      // Use en-CA locale to get YYYY-MM-DD format, matching how we group slots
      const dateStr = current.toLocaleDateString("en-CA", {
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
          <div className="max-w-3xl mx-auto border border-border bg-white p-4 sm:p-6">
            {/* Mobile-optimized calendar header */}
            <div className="flex items-center justify-between gap-2 sm:gap-4 mb-6">
              <button
                onClick={prevMonth}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center border border-border text-text hover:bg-bg-subtle transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                disabled={currentMonth.getMonth() === new Date().getMonth() && 
                         currentMonth.getFullYear() === new Date().getFullYear()}
                aria-label="Previous month"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <h3 className="text-base sm:text-xl font-medium text-text whitespace-nowrap flex-1 text-center">{monthName}</h3>
              
              <button
                onClick={nextMonth}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center border border-border text-text hover:bg-bg-subtle transition-colors shrink-0"
                aria-label="Next month"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-7 gap-1 mb-1">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center text-xs sm:text-sm font-medium text-text-muted py-2">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
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
                    aspect-square min-h-[44px] flex items-center justify-center text-sm border transition-all
                    ${!day.isCurrentMonth ? "text-gray-300 cursor-not-allowed border-transparent" : ""}
                    ${day.isCurrentMonth && !day.hasSlots ? "text-gray-400 cursor-not-allowed border-gray-200" : ""}
                    ${day.hasSlots && day.isCurrentMonth ? "text-text border-border hover:border-text-muted hover:bg-bg-subtle cursor-pointer font-medium" : ""}
                  `}
                >
                  {day.dayOfMonth}
                </button>
              ))}
            </div>
            
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-text-muted">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border border-border bg-white shrink-0"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border border-gray-200 text-gray-400 shrink-0"></div>
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

    const serviceOptions = [
      { value: "general", label: "Technology Strategy Call (general)" },
      { value: "web_mobile", label: "Web & mobile applications" },
      { value: "ai", label: "AI integration / AI consulting" },
      { value: "automation", label: "Automation & process improvement" },
      { value: "strategy", label: "Strategy / architecture / roadmap" },
      { value: "not_sure", label: "Not sure yet" },
    ];

    const branchQuestions = getBranchQuestions();

    return (
      <div>
        <Reveal>
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-semibold text-text mb-4">
              Almost There
            </h2>
            <p className="text-text-muted text-sm mb-4">~2 minutes — helps Roger prep</p>
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
                onChange={(e) => {
                  setFormData({ ...formData, customerName: e.target.value });
                  setValidationErrors({ ...validationErrors, customerName: "" });
                }}
                className={`w-full border ${validationErrors.customerName ? "border-red-500" : "border-border"} px-4 py-3 text-text focus:outline-none focus:border-text-muted bg-transparent`}
              />
              {validationErrors.customerName && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.customerName}</p>
              )}
            </div>

            <div>
              <label htmlFor="customerEmail" className="block text-text font-medium mb-2">
                Work Email *
              </label>
              <input
                type="email"
                id="customerEmail"
                required
                value={formData.customerEmail}
                onChange={(e) => {
                  setFormData({ ...formData, customerEmail: e.target.value });
                  setValidationErrors({ ...validationErrors, customerEmail: "" });
                }}
                className={`w-full border ${validationErrors.customerEmail ? "border-red-500" : "border-border"} px-4 py-3 text-text focus:outline-none focus:border-text-muted bg-transparent`}
              />
              {validationErrors.customerEmail && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.customerEmail}</p>
              )}
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
                onChange={(e) => {
                  setFormData({ ...formData, customerCompany: e.target.value });
                  setValidationErrors({ ...validationErrors, customerCompany: "" });
                }}
                className={`w-full border ${validationErrors.customerCompany ? "border-red-500" : "border-border"} px-4 py-3 text-text focus:outline-none focus:border-text-muted bg-transparent`}
              />
              {validationErrors.customerCompany && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.customerCompany}</p>
              )}
            </div>

            <div>
              <label htmlFor="serviceInterest" className="block text-text font-medium mb-2">
                Service Interest *
              </label>
              <select
                id="serviceInterest"
                required
                value={formData.serviceInterest}
                onChange={(e) => {
                  setFormData({ ...formData, serviceInterest: e.target.value as ServiceInterest });
                  setValidationErrors({ ...validationErrors, serviceInterest: "" });
                  setIntakeAnswers({});
                }}
                className={`w-full border ${validationErrors.serviceInterest ? "border-red-500" : "border-border"} px-4 py-3 text-text focus:outline-none focus:border-text-muted bg-transparent`}
              >
                <option value="">Select a service...</option>
                {serviceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {validationErrors.serviceInterest && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.serviceInterest}</p>
              )}
            </div>

            {branchQuestions && (
              <div className="border border-border p-6 bg-bg-subtle">
                <h3 className="text-text font-medium mb-4 text-sm uppercase tracking-wider">
                  Service-Specific Questions (Required)
                </h3>
                <div className="space-y-4">
                  {branchQuestions.map((question) => (
                    <div key={question.id}>
                      <label htmlFor={question.id} className="block text-text text-sm mb-2">
                        {question.label} *
                      </label>
                      <input
                        type="text"
                        id={question.id}
                        required
                        value={intakeAnswers[question.id] || ""}
                        onChange={(e) => {
                          setIntakeAnswers({
                            ...intakeAnswers,
                            [question.id]: e.target.value,
                          });
                          setValidationErrors({ ...validationErrors, [question.id]: "" });
                        }}
                        placeholder={question.placeholder}
                        className={`w-full border ${validationErrors[question.id] ? "border-red-500" : "border-border"} px-3 py-2 text-text text-sm focus:outline-none focus:border-text-muted bg-transparent`}
                      />
                      {validationErrors[question.id] && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors[question.id]}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label htmlFor="notes" className="block text-text font-medium mb-2">
                What's the #1 problem or decision you want help with on this call? *
              </label>
              <p className="text-text-muted text-sm mb-2">
                (40-500 characters)
              </p>
              <textarea
                id="notes"
                rows={4}
                required
                value={formData.notes}
                onChange={(e) => {
                  setFormData({ ...formData, notes: e.target.value });
                  setValidationErrors({ ...validationErrors, notes: "" });
                }}
                placeholder="Example: We're growing fast and our current tools don't talk to each other. Need help deciding whether to integrate or rebuild..."
                className={`w-full border ${validationErrors.notes ? "border-red-500" : "border-border"} px-4 py-3 text-text focus:outline-none focus:border-text-muted bg-transparent resize-none`}
              />
              <div className="flex justify-between items-center mt-1">
                {validationErrors.notes ? (
                  <p className="text-red-500 text-sm">{validationErrors.notes}</p>
                ) : (
                  <p className="text-text-muted text-sm">
                    {formData.notes.length} characters
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="platformPref" className="block text-text font-medium mb-2">
                Video Platform Preference *
              </label>
              <select
                id="platformPref"
                required
                value={formData.platformPref}
                onChange={(e) => {
                  setFormData({ ...formData, platformPref: e.target.value });
                  setValidationErrors({ ...validationErrors, platformPref: "" });
                }}
                className={`w-full border ${validationErrors.platformPref ? "border-red-500" : "border-border"} px-4 py-3 text-text focus:outline-none focus:border-text-muted bg-transparent`}
              >
                <option value="Zoom">Zoom</option>
                <option value="Microsoft Teams">Microsoft Teams</option>
              </select>
              {validationErrors.platformPref && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.platformPref}</p>
              )}
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="text-text font-medium mb-4 text-sm uppercase tracking-wider">
                Optional Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="customerPhone" className="block text-text text-sm mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="customerPhone"
                    value={formData.customerPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, customerPhone: e.target.value })
                    }
                    placeholder="(555) 123-4567"
                    className="w-full border border-border px-3 py-2 text-text text-sm focus:outline-none focus:border-text-muted bg-transparent"
                  />
                  <p className="text-text-muted text-xs mt-1">Optional — for scheduling calls only. We email or call; we don't text.</p>
                </div>
                <div>
                  <label htmlFor="roleTitle" className="block text-text text-sm mb-2">
                    Your Role/Title
                  </label>
                  <input
                    type="text"
                    id="roleTitle"
                    value={optionalExtras.roleTitle}
                    onChange={(e) =>
                      setOptionalExtras({ ...optionalExtras, roleTitle: e.target.value })
                    }
                    placeholder="e.g. CEO, CTO, Operations Manager"
                    className="w-full border border-border px-3 py-2 text-text text-sm focus:outline-none focus:border-text-muted bg-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="companyWebsite" className="block text-text text-sm mb-2">
                    Company Website
                  </label>
                  <input
                    type="url"
                    id="companyWebsite"
                    value={optionalExtras.companyWebsite}
                    onChange={(e) =>
                      setOptionalExtras({ ...optionalExtras, companyWebsite: e.target.value })
                    }
                    placeholder="https://yourcompany.com"
                    className="w-full border border-border px-3 py-2 text-text text-sm focus:outline-none focus:border-text-muted bg-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="urgency" className="block text-text text-sm mb-2">
                    Urgency
                  </label>
                  <select
                    id="urgency"
                    value={optionalExtras.urgency}
                    onChange={(e) =>
                      setOptionalExtras({ ...optionalExtras, urgency: e.target.value })
                    }
                    className="w-full border border-border px-3 py-2 text-text text-sm focus:outline-none focus:border-text-muted bg-transparent"
                  >
                    <option value="">Select urgency...</option>
                    <option value="critical">Critical (immediate need)</option>
                    <option value="90days">Within 90 days</option>
                    <option value="planning">Planning phase</option>
                    <option value="exploring">Just exploring</option>
                  </select>
                </div>
              </div>
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
              <div className="mb-6 p-4 bg-bg-subtle border border-border text-sm text-text-muted leading-relaxed">
                <p>
                  By continuing, you agree to our{" "}
                  <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-text hover:underline font-medium">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="/strategy-call-policy" target="_blank" rel="noopener noreferrer" className="text-text hover:underline font-medium">
                    Strategy Call Policy
                  </a>
                  , and you acknowledge our{" "}
                  <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-text hover:underline font-medium">
                    Privacy Policy
                  </a>
                  . The $99 fee is prepaid and is not credited toward discovery or other project work, with one exception: if you purchase AI Teammate Launch within 30 days of your call, the $99 comes off. Cancel 24+ hours ahead for a full refund. Late cancellations and no-shows aren't refundable.
                </p>
              </div>
              <button
                type="submit"
                className="w-full bg-cta text-cta-text px-8 py-4 text-[15px] font-medium hover:bg-cta-hover transition-all duration-200 hover:-translate-y-0.5"
              >
                Continue to Payment ($99)
              </button>
              <p className="text-sm text-text-muted text-center mt-4">
                You'll be redirected to Stripe to complete your payment securely. CerpaMedia never sees your full card number.
              </p>
            </div>
          </form>
        </Reveal>
      </div>
    );
  }

  return null;
}
