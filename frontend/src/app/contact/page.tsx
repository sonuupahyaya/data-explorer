'use client';

import { useState } from 'react';
import { Mail, MapPin, Phone, Clock } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    console.log('Form submitted:', formData);
    setSubmitted(true);
    setIsLoading(false);

    setTimeout(() => {
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="w-full overflow-hidden">
      {/* HERO SECTION */}
      <section className="bg-gradient-hero relative min-h-[50vh] overflow-hidden py-20 md:py-28">
        {/* Subtle background shapes */}
        <div className="absolute inset-0 opacity-25">
          <div className="absolute top-16 right-20 h-80 w-80 rounded-full bg-gradient-to-br from-blue-300 to-transparent blur-3xl"></div>
          <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-gradient-to-tr from-emerald-300 to-transparent blur-3xl"></div>
          <div className="absolute top-1/2 left-1/3 h-64 w-64 rounded-full bg-gradient-to-b from-violet-200 to-transparent blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="container-narrow relative z-10 flex flex-col items-center justify-center text-center py-8">
          <div className="space-y-6 max-w-2xl">
            <h1 className="text-hero">
              Get in <span className="text-gradient">Touch</span>
            </h1>
            <p className="text-lg text-muted">
              Have questions or feedback? We'd love to hear from you. Our team is here to help.
            </p>
          </div>
        </div>
      </section>

      {/* MAIN CONTACT SECTION */}
      <section className="py-20 md:py-32">
        <div className="container-narrow">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* LEFT COLUMN: CONTACT INFO */}
            <div className="space-y-12">
              <div className="space-y-4">
                <h2 className="text-section-title">Let's Connect</h2>
                <p className="text-muted">
                  Whether you have a question about our collection, need support, or want to share feedback, our team is
                  ready to assist. We typically respond within 24 hours.
                </p>
              </div>

              {/* CONTACT INFO CARDS */}
              <div className="space-y-6">
                {/* Email Card */}
                <div className="card-premium p-6 space-y-3 hover-lift">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <Mail className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-card-title">Email</h3>
                      <p className="text-accent font-semibold text-sm mt-1">info@worldofbooks.com</p>
                      <p className="text-subtle text-xs mt-1">Typically responds within 24 hours</p>
                    </div>
                  </div>
                </div>

                {/* Phone Card */}
                <div className="card-premium p-6 space-y-3 hover-lift">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <Phone className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-card-title">Phone</h3>
                      <p className="text-accent font-semibold text-sm mt-1">+44 (0) 20 XXXX XXXX</p>
                      <p className="text-subtle text-xs mt-1">Monday - Friday, 9am - 5pm GMT</p>
                    </div>
                  </div>
                </div>

                {/* Location Card */}
                <div className="card-premium p-6 space-y-3 hover-lift">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <MapPin className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-card-title">Locations</h3>
                      <p className="text-accent font-semibold text-sm mt-1">Worldwide Network</p>
                      <p className="text-subtle text-xs mt-1">
                        Visit <span className="font-semibold">worldofbooks.com</span> to find a location near you
                      </p>
                    </div>
                  </div>
                </div>

                {/* Hours Card */}
                <div className="card-premium p-6 space-y-3 hover-lift">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <Clock className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-card-title">Business Hours</h3>
                      <p className="text-accent font-semibold text-sm mt-1">Mon - Fri: 9am - 5pm GMT</p>
                      <p className="text-subtle text-xs mt-1">Closed weekends & holidays</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="card-gradient p-6">
                <p className="text-subtle text-sm">
                  Your message helps us improve our service and build a better community for readers worldwide. We value
                  every inquiry and suggestion.
                </p>
              </div>
            </div>

            {/* RIGHT COLUMN: CONTACT FORM */}
            <div className="relative">
              <div className="sticky top-8">
                <div className="card-glass p-8 md:p-10 space-y-8">
                  {/* Form Header */}
                  <div className="space-y-3">
                    <h2 className="text-2xl font-bold">Send us a Message</h2>
                    <div className="h-1 w-16 bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500"></div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name Input */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="John Doe"
                        className="input-premium"
                      />
                    </div>

                    {/* Email Input */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="your@email.com"
                        className="input-premium"
                      />
                    </div>

                    {/* Subject Input */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold">Subject</label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        placeholder="How can we help?"
                        className="input-premium"
                      />
                    </div>

                    {/* Message Input */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold">Message</label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        placeholder="Tell us more about your inquiry..."
                        className="textarea-premium"
                      />
                    </div>

                    {/* Success Message */}
                    {submitted && (
                      <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 p-4 text-emerald-700 dark:text-emerald-300 text-center font-medium text-sm">
                        ✓ Message sent successfully! We'll get back to you soon.
                      </div>
                    )}

                    {/* Submit Button */}
                    <button type="submit" disabled={isLoading} className="btn-primary w-full">
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                          Sending...
                        </span>
                      ) : (
                        'Send Message'
                      )}
                    </button>

                    {/* Privacy Notice */}
                    <p className="text-subtle text-xs text-center">
                      We respect your privacy. Your information is secure and will never be shared.
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-20 md:py-32 bg-gradient-section">
        <div className="container-narrow space-y-12">
          <div className="space-y-4 text-center max-w-2xl mx-auto">
            <h2 className="text-section-title">Frequently Asked Questions</h2>
            <p className="text-muted">Quick answers to common questions</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                q: 'What is the best way to reach you?',
                a: 'Email info@worldofbooks.com for the quickest response. We typically reply within 24 hours. For urgent matters, call during business hours.',
              },
              {
                q: 'Do you have physical bookshops?',
                a: 'Yes! World of Books operates bookshops globally. Visit worldofbooks.com to find a location near you.',
              },
              {
                q: 'Can I return or exchange books?',
                a: "Contact our support team with your specific situation. We work to ensure you're satisfied with every purchase.",
              },
              {
                q: 'How can I support your mission?',
                a: 'Purchase from our collection, donate books, volunteer at a location, or contact us about partnerships and sponsorships.',
              },
            ].map((item, idx) => (
              <div key={idx} className="card-premium p-8 space-y-4 hover-lift">
                <h3 className="font-bold text-base">{item.q}</h3>
                <p className="text-muted text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
