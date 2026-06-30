import { useState } from "react";
import Landing from "./components/Landing.tsx";
import Studio from "./components/Studio.tsx";

export default function App() {
  const [view, setView] = useState<"home" | "studio">("home");

  return (
    <div className="min-h-full flex flex-col">
      <header className="sticky top-0 z-20 backdrop-blur bg-cloud/80 border-b border-black/5">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <button
            onClick={() => setView("home")}
            className="flex items-center gap-2 font-display text-xl font-700"
          >
            <span className="inline-block w-7 h-7 rounded-lg bg-ink" />
            Retake<span className="text-accent">Studio</span>
          </button>
          <nav className="flex items-center gap-2">
            <button
              onClick={() => setView("home")}
              className={`px-3 py-1.5 rounded-full text-sm ${
                view === "home" ? "bg-ink text-white" : "hover:bg-black/5"
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setView("studio")}
              className={`px-4 py-1.5 rounded-full text-sm font-600 ${
                view === "studio"
                  ? "bg-accent text-white"
                  : "bg-ink text-white hover:bg-ink/90"
              }`}
            >
              Open Studio
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {view === "home" ? (
          <Landing onStart={() => setView("studio")} />
        ) : (
          <Studio />
        )}
      </main>

      <footer className="border-t border-black/5 py-8 text-center text-sm text-ink/50">
        <p>
          RetakeStudio — AI photos of you, from your own selfies. Built with
          consent guardrails.
        </p>
        <p className="mt-1">
          Generated images are labelled AI-generated. Your photos, your
          likeness, your consent.
        </p>
      </footer>
    </div>
  );
}
