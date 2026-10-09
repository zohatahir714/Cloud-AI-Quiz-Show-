interface HeaderProps {
  onGoHome: () => void;
}

export default function Header({ onGoHome }: HeaderProps) {
  return (
    <header className="flex items-center justify-between py-4 border-b border-navy-700/50 mb-4">
      <button onClick={onGoHome} className="text-left group">
        <span className="text-xl font-extrabold tracking-tight">
          Cloud <span className="text-lav">&amp;</span> AI <span className="text-cy">Hub</span>
        </span>
      </button>

      <div className="flex items-center gap-3">
        <button
          onClick={() => alert("Sign In modal / auth integration goes here.")}
          className="px-4 py-2 text-xs font-semibold text-ink/80 hover:text-ink transition"
        >
          Sign In
        </button>
        <button
          onClick={() => alert("Login modal / auth integration goes here.")}
          className="px-4 py-2 text-xs font-bold rounded-xl border border-cy bg-cy/10 text-cy hover:bg-cy hover:text-navy-950 transition"
        >
          Log In
        </button>
      </div>
    </header>
  );
}