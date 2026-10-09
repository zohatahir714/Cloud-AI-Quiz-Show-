interface LandingProps {
  onSelectQuiz: () => void;
  onSelectPractice: () => void;
}

export default function Landing({ onSelectQuiz, onSelectPractice }: LandingProps) {
  return (
    <div className="animate-fadeUp space-y-10 py-6 sm:py-12 text-center">
      {/* Hero Section */}
      <div className="space-y-4 max-w-2xl mx-auto">
        <p className="label">Master Cloud &amp; AI Engineering</p>
        <h1 className="text-4xl font-extrabold leading-none tracking-tight sm:text-6xl">
          Elevate Your <span className="text-cy">System Architecture</span> Skills
        </h1>
        <p className="text-sm text-ink/70 sm:text-base leading-relaxed">
          Interactive scenario-based learning tailored to real-world cloud architectures, LLM design patterns, and engineering trade-offs.
        </p>
      </div>

      {/* Mode Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto pt-4">
        {/* Quiz Show Card */}
        <div
          onClick={onSelectQuiz}
          className="panel p-6 cursor-pointer group hover:border-cy transition-all duration-200 flex flex-col justify-between text-left space-y-4"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs tracking-wider text-cy font-bold">COMPETITIVE MODE</span>
              <span className="text-xl">🏆</span>
            </div>
            <h2 className="text-2xl font-bold text-ink group-hover:text-cy transition">
              Quiz Show
            </h2>
            <p className="text-xs text-ink/70 mt-2 leading-relaxed">
              10 timed scenario questions scaling from Practitioner to Expert. Use lifelines, track your score, and challenge your technical limits.
            </p>
          </div>
          <button className="btn btn-primary w-full text-xs py-3 mt-4">
            Launch Quiz Show →
          </button>
        </div>

        {/* Practice Garden Card */}
        <div
          onClick={onSelectPractice}
          className="panel p-6 cursor-pointer group hover:border-lav transition-all duration-200 flex flex-col justify-between text-left space-y-4"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs tracking-wider text-lav font-bold">SELF-PACED LEARNING</span>
              <span className="text-xl">🌱</span>
            </div>
            <h2 className="text-2xl font-bold text-ink group-hover:text-lav transition">
              Practice Garden
            </h2>
            <p className="text-xs text-ink/70 mt-2 leading-relaxed">
              Untimed exploration environment. Deep-dive into specific cloud domains, review architectural patterns, and experiment at your own pace.
            </p>
          </div>
          <button className="btn border border-lav/40 bg-lav/10 text-lav hover:bg-lav hover:text-navy-950 w-full text-xs py-3 mt-4 transition">
            Enter Practice Garden →
          </button>
        </div>
      </div>
    </div>
  );
}