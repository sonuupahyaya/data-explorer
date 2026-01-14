'use client';

export default function AboutPage() {
  return (
    <div className="w-full overflow-hidden">
      {/* HERO SECTION */}
      <section className="bg-gradient-hero relative min-h-[60vh] overflow-hidden py-20 md:py-32">
        {/* Subtle animated background */}
        <div className="absolute inset-0 opacity-25">
          <div className="absolute top-20 right-10 h-96 w-96 rounded-full bg-gradient-to-br from-blue-300 to-transparent blur-3xl"></div>
          <div className="absolute bottom-10 left-10 h-80 w-80 rounded-full bg-gradient-to-tr from-emerald-300 to-transparent blur-3xl"></div>
          <div className="absolute top-40 left-1/2 h-72 w-72 rounded-full bg-gradient-to-b from-indigo-200 to-transparent blur-3xl"></div>
        </div>

        {/* Dark mode background shapes */}
        <style jsx>{`
          @media (prefers-color-scheme: dark) {
            .bg-gradient-hero {
              background: linear-gradient(135deg, #0b0d10 0%, #1a1f2e 50%, #0f1115 100%);
            }
          }
        `}</style>

        {/* Content */}
        <div className="container-narrow relative z-10 flex flex-col items-center justify-center text-center">
          <div className="space-y-6 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium badge-primary">
              ✓ Our Story
            </div>

            <h1 className="text-hero">
              Making Books <span className="text-gradient">Accessible</span> to Everyone
            </h1>

            <p className="text-lg text-muted">
              For decades, we've been on a mission to preserve knowledge, celebrate literacy, and ensure that
              everyone—regardless of circumstance—has access to the books they love.
            </p>
          </div>
        </div>
      </section>

      {/* CONTENT SECTION */}
      <section className="py-20 md:py-32">
        <div className="container-narrow space-y-24">
          {/* OUR STORY */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-section-title">Our Story</h2>
              <div className="space-y-4">
                <p>
                  World of Books began with a simple yet powerful belief: books are more than objects—they're doors to
                  knowledge, imagination, and possibility.
                </p>
                <p>
                  What started as a small initiative to collect and redistribute books has grown into a global network
                  of charity bookshops, serving readers across continents. Today, we continue our mission with renewed
                  purpose, committed to preserving literary heritage while making reading economically accessible.
                </p>
              </div>
            </div>

            <div className="card-glass p-8 md:p-12 min-h-64 flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="text-5xl">📚</div>
                <p className="text-sm font-medium text-accent">Global Community of Readers</p>
              </div>
            </div>
          </div>

          {/* WHAT WE DO */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="card-glass p-8 md:p-12 min-h-64 flex items-center justify-center order-last md:order-first">
              <div className="text-center space-y-3">
                <div className="text-5xl">🌍</div>
                <p className="text-sm font-medium text-accent">Serving Readers Worldwide</p>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-section-title">What We Do</h2>
              <div className="space-y-4">
                <p>
                  We collect, carefully curate, and redistribute books through our charity bookshops worldwide. Every
                  volume is given a second life, preventing waste and extending literacy opportunities.
                </p>
                <p>
                  This digital platform extends our mission, showcasing thousands of titles across genres—fiction,
                  non-fiction, history, science, and beyond. Every purchase supports charitable work and literacy
                  initiatives globally.
                </p>
              </div>
            </div>
          </div>

          {/* WHY TRUST US */}
          <div className="space-y-12">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <h2 className="text-section-title">Why People Trust Us</h2>
              <p className="text-muted">Decades of consistent action, transparent operations, and real impact</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: 'Decades of Experience',
                  description:
                    'Years of dedicated service and proven commitment build trust through consistent, transparent operations.',
                  icon: '⏳',
                },
                {
                  title: 'Quality & Curation',
                  description:
                    'Every book is carefully selected and preserved to ensure it reaches you in excellent condition.',
                  icon: '✓',
                },
                {
                  title: 'Measurable Impact',
                  description:
                    'Your purchases directly fund literacy programs, support bookshops globally, and change lives.',
                  icon: '♥',
                },
              ].map((item, idx) => (
                <div key={idx} className="card-premium p-8 space-y-4 hover-lift">
                  <div className="text-4xl">{item.icon}</div>
                  <h3 className="text-card-title">{item.title}</h3>
                  <p className="text-muted text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* OUR MISSION */}
          <div className="card-gradient p-10 md:p-16 space-y-6">
            <h2 className="text-section-title">Our Mission</h2>
            <div className="space-y-4">
              <p>
                We envision a world where every person—regardless of economic status—has access to knowledge,
                imagination, and opportunity through reading. Books are universal bridges to understanding.
              </p>
              <p>
                By preserving books, promoting sustainable practices, and building communities around reading, we
                contribute to both cultural preservation and environmental responsibility. Every book saved is a step
                toward a more literate, compassionate world.
              </p>
            </div>
          </div>

          {/* SUSTAINABILITY */}
          <div className="space-y-12">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <h2 className="text-section-title">Commitment to Sustainability</h2>
              <p className="text-muted">Environmental responsibility is built into everything we do</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="card-premium p-8 md:p-12 space-y-6">
                <div className="text-4xl">🌱</div>
                <div className="space-y-3">
                  <h3 className="text-card-title">Circular Economy</h3>
                  <p className="text-muted text-sm">
                    By giving books a second, third, and fourth life, we reduce waste and promote circular consumption.
                    This lessens environmental impact while preserving cultural artifacts for future generations.
                  </p>
                </div>
              </div>

              <div className="card-premium p-8 md:p-12 space-y-6">
                <div className="text-4xl">♻️</div>
                <div className="space-y-3">
                  <h3 className="text-card-title">Community Impact</h3>
                  <p className="text-muted text-sm">
                    Every book purchased supports local communities, funds literacy programs, and creates employment in
                    bookshops worldwide. Sustainable reading practices build stronger communities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-500 to-teal-600 dark:from-blue-900 dark:via-indigo-900 dark:to-teal-900"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 h-80 w-80 rounded-full bg-gradient-to-bl from-white to-transparent blur-3xl dark:from-cyan-400"></div>
          <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-gradient-to-tr from-white to-transparent blur-3xl dark:from-gold-300"></div>
        </div>

        <div className="container-narrow relative z-10 text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white">Ready to Discover Your Next Read?</h2>
          <p className="text-lg text-blue-50 max-w-2xl mx-auto">
            Explore thousands of carefully curated books from our collection and join a global community of passionate
            readers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 font-semibold px-8 py-3 rounded-lg transition-all duration-250 bg-white text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl"
            >
              Browse Our Collection
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
