interface Props { message: string; onRetry: () => void; onQuit: () => void }

export default function ErrorScreen({ message, onRetry, onQuit }: Props) {
  return (
    <section className="panel animate-fadeUp space-y-5 border-hot/60 p-6 text-center sm:p-10" role="alert">
      <p className="font-mono text-sm uppercase tracking-[0.25em] text-hot">Generation failed</p>
      <p className="mx-auto max-w-md text-sm text-ink/80 sm:text-base">{message}</p>
      <p className="font-mono text-xs text-lav/80">Your score, lifelines and progress are saved.</p>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button className="btn btn-primary" onClick={onRetry} autoFocus>Retry question</button>
        <button className="btn btn-ghost" onClick={onQuit}>End game</button>
      </div>
    </section>
  );
}