"use client";

import { useState } from "react";
import { submitContactForm } from "@/app/actions/contact";
import { Reveal } from "@/components/Reveal";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    service: "",
    message: "",
    website: "",
  });
  const [status, setStatus] = useState<{
    type: "idle" | "loading" | "success" | "error";
    message: string;
  }>({ type: "idle", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: "loading", message: "Sending..." });

    const result = await submitContactForm(formData);

    if (result.success) {
      setStatus({ type: "success", message: result.message || "" });
      setFormData({
        name: "",
        email: "",
        company: "",
        service: "",
        message: "",
        website: "",
      });
    } else {
      setStatus({ type: "error", message: result.error || "" });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div>
      <section className="bg-bg py-24 md:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-semibold mb-6 text-text tracking-tight leading-[1.1]">
                Get In Touch
              </h1>
              <p className="text-xl text-text-muted max-w-3xl mx-auto leading-relaxed">
                Let's discuss how we can help your business operate more efficiently
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-16 md:py-20 border-t border-border">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal delay={100}>
            <div className="border border-border p-8 md:p-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-text mb-2">
                    Name <span className="text-text-muted">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-border focus:outline-none focus:border-text transition-colors text-text"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-text mb-2">
                    Email <span className="text-text-muted">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-border focus:outline-none focus:border-text transition-colors text-text"
                  />
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-text mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-border focus:outline-none focus:border-text transition-colors text-text"
                  />
                </div>

                <div>
                  <label htmlFor="service" className="block text-sm font-medium text-text mb-2">
                    Service Interest
                  </label>
                  <select
                    id="service"
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-border focus:outline-none focus:border-text transition-colors text-text bg-white"
                  >
                    <option value="">Select a service...</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Web Applications">Web Applications</option>
                    <option value="Mobile Apps">Mobile Apps</option>
                    <option value="AI System Integration">AI System Integration</option>
                    <option value="AI Consulting">AI Consulting</option>
                    <option value="Automation Consulting">Automation Consulting</option>
                    <option value="Business Process Improvement & Automation">
                      Business Process Improvement & Automation
                    </option>
                    <option value="Other / Not Sure">Other / Not Sure</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-text mb-2">
                    Message <span className="text-text-muted">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-border focus:outline-none focus:border-text transition-colors text-text resize-none"
                  />
                </div>

                <div className="hidden" aria-hidden="true">
                  <label htmlFor="website">Website (leave blank)</label>
                  <input
                    type="text"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                {status.message && (
                  <div
                    className={`p-4 border ${
                      status.type === "success"
                        ? "bg-bg-subtle border-text text-text"
                        : status.type === "error"
                        ? "bg-bg-subtle border-text text-text"
                        : "bg-bg-subtle border-border text-text-muted"
                    }`}
                  >
                    {status.message}
                  </div>
                )}

                <div className="p-4 bg-bg-subtle border border-border text-sm text-text-muted leading-relaxed">
                  <p>
                    By submitting this form, you agree that we may use your information to respond to your inquiry, as described in our{" "}
                    <a href="/privacy" className="text-text hover:underline font-medium">
                      Privacy Policy
                    </a>
                    . We don't sell your data or add you to a mailing list.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={status.type === "loading"}
                  className="w-full bg-cta text-cta-text px-8 py-3.5 text-[15px] font-medium hover:bg-cta-hover transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {status.type === "loading" ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div className="mt-10 text-center">
              <p className="text-[15px] text-text-muted mb-4">
                Or reach us directly
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a
                  href="mailto:cerpamedia@gmail.com"
                  className="text-text hover:underline font-medium text-[15px]"
                >
                  cerpamedia@gmail.com
                </a>
                <span className="text-border hidden sm:inline">•</span>
                <a
                  href="tel:+19432487410"
                  className="text-text hover:underline font-medium text-[15px]"
                >
                  (943) 248-7410
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
