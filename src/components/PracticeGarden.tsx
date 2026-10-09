interface PracticeGardenProps {
  onBack: () => void;
}

export default function PracticeGarden({ onBack }: PracticeGardenProps) {
  return (
    <div className="panel p-8 text-center space-y-6 max-w-xl mx-auto my-12 animate-fadeUp">
      <div className="text-4xl">🌱</div>
      <h2 className="text-3xl font-extrabold text-lav">Practice Garden</h2>
      <p className="text-sm text-ink/70 leading-relaxed">
        Your self-paced sandbox is under construction. Soon you will be able to practice specific domain modules, review detailed architectural diagrams, and run hands-on scenarios.
      </p>
      <button onClick={onBack} className="btn border border-navy-700 bg-navy-800 text-ink hover:border-lav px-6 py-2 text-xs">
        ← Back to Home
      </button>
    </div>
  );
}