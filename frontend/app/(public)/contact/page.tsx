"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { submitContact } from "@/lib/api";
import BreadcrumbBanner from "@/components/shared/BreadcrumbBanner";
import { CONTACT } from "@amaken/shared";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: submitContact,
    onSuccess: () => {
      setSuccess(true);
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    },
  });

  return (
    <>
      <BreadcrumbBanner
        title="Contact Us"
        subtitle="We'd love to hear from you"
        crumbs={[{ label: "Contact" }]}
      />

      <section className="py-12">
        <div className="container-custom">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Contact Info */}
            <div className="space-y-6">
              <div className="card p-6">
                <h3 className="mb-4 text-lg font-bold text-navy">Get in Touch</h3>
                <div className="space-y-4">
                  <a href="https://maps.google.com/?q=Al+Reem+Tower+Dubai" target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 text-sm text-amaken-gray hover:text-primary">
                    <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Al Reem Tower, Dubai, UAE</span>
                  </a>
                  <a href={`tel:${CONTACT.PHONE}`} className="flex items-center gap-3 text-sm text-amaken-gray hover:text-primary">
                    <svg className="h-5 w-5 flex-shrink-0 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{CONTACT.PHONE}</span>
                  </a>
                  <a href={`mailto:${CONTACT.EMAIL}`} className="flex items-center gap-3 text-sm text-amaken-gray hover:text-primary">
                    <svg className="h-5 w-5 flex-shrink-0 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>{CONTACT.EMAIL}</span>
                  </a>
                </div>
              </div>

              {/* Map */}
              <div className="overflow-hidden rounded-lg">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3611.0!2d55.27!3d25.2!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zQWwgUmVlbSBUb3dlciwgRHViaQ!5e0!3m2!1sen!2sae!4v1"
                  className="h-64 w-full border-0"
                  allowFullScreen
                  loading="lazy"
                  title="Office location"
                />
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="card p-8">
                <h3 className="mb-6 text-xl font-bold text-navy">Send us a Message</h3>

                {success ? (
                  <div className="py-12 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                      <svg className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-navy">Thank You!</h3>
                    <p className="mt-1 text-amaken-gray">Your message has been sent. We&apos;ll get back to you soon.</p>
                    <button onClick={() => setSuccess(false)} className="btn-primary mt-4">Send Another Message</button>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      mutation.mutate(form);
                    }}
                    className="space-y-4"
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-navy">Name *</label>
                        <input
                          type="text"
                          required
                          value={form.name}
                          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                          className="input-field"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-navy">Email *</label>
                        <input
                          type="email"
                          required
                          value={form.email}
                          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                          className="input-field"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-navy">Phone</label>
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                          className="input-field"
                          placeholder="+971 XX XXX XXXX"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-navy">Subject *</label>
                        <input
                          type="text"
                          required
                          value={form.subject}
                          onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                          className="input-field"
                          placeholder="How can we help?"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-navy">Message *</label>
                      <textarea
                        required
                        rows={5}
                        value={form.message}
                        onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                        className="input-field resize-none"
                        placeholder="Tell us more about your inquiry..."
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={mutation.isPending}
                      className="btn-primary disabled:opacity-60"
                    >
                      {mutation.isPending ? "Sending..." : "Send Message"}
                    </button>
                    {mutation.isError && (
                      <p className="text-sm text-red-500">Failed to send message. Please try again.</p>
                    )}
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
