import { useState } from "react";

// Child with its own local state (a click counter).
function Counter() {
  const [count, setCount] = useState(0);
  console.log(`[render] Counter (count = ${count})`);
  return (
    <button type="button" className="btn" onClick={() => setCount((c) => c + 1)}>
      Clicks: {count}
    </button>
  );
}

export default function ResetDemo() {
  const [resetVersion, setResetVersion] = useState(0);
  console.log("[render] ResetDemo");

  return (
    <section className="panel">
      <h2>Intentional reset</h2>
      <p className="hint">Click the counter, then reset it. Reset version: {resetVersion}</p>
      {/*
        WHY CHANGING THE KEY RESETS STATE:
        React identifies a component by its position AND its key. When resetVersion
        changes, the key changes, so React sees a DIFFERENT component: it unmounts the
        old Counter (its state is thrown away) and mounts a new one, whose useState(0)
        starts from the initial value again.
      */}
      <Counter key={resetVersion} />
      <button type="button" className="btn primary" onClick={() => setResetVersion((v) => v + 1)}>
        Reset counter with new key
      </button>
    </section>
  );
}
