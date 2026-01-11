'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-5xl font-bold mb-4">Contact Us</h1>
      <p className="text-xl text-gray-600 mb-8">
        Have questions? We'd love to hear from you!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-semibold mb-2">Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">Subject</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select a subject</option>
              <option value="bug">Report a Bug</option>
              <option value="feature">Feature Request</option>
              <option value="feedback">General Feedback</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-2">Message</label>
            <textarea
              required
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Your message..."
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Send Message
          </button>
        </form>

        <div className="space-y-8">
          <div>
            <h3 className="text-2xl font-bold mb-2">📧 Email</h3>
            <p className="text-gray-600">
              For quick inquiries, reach out to us anytime.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-2">🐛 Found a Bug?</h3>
            <p className="text-gray-600 mb-2">
              Please report any issues you encounter.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-2">💡 Feature Request</h3>
            <p className="text-gray-600">
              Have an idea to improve the platform? We'd love to hear it!
            </p>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-lg font-bold mb-2">⚡ Response Time</h3>
            <p className="text-gray-700">
              We typically respond to messages within 24 hours.
            </p>
          </div>
        </div>
      </div>

      {submitted && (
        <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-lg text-center">
          ✅ Thank you! Your message has been sent.
        </div>
      )}
    </div>
  );
}
