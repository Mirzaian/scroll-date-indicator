import { StrictMode, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { useRef } from "react";
import { ScrollDateIndicator } from "scroll-date-indicator/react";

interface Item {
  ts: number;
  text: string;
  sender: string;
}

function generateItems(count: number, daysSpan: number): Item[] {
  const now = Date.now();
  const dayMs = 86_400_000;
  const items: Item[] = [];
  for (let i = 0; i < count; i += 1) {
    const ts = now - Math.floor((i / count) * daysSpan * dayMs);
    items.push({
      ts,
      text: `Message #${count - i}`,
      sender: i % 2 === 0 ? "Alice" : "Bob",
    });
  }
  return items.reverse();
}

function App(): JSX.Element {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const items = useMemo(() => generateItems(400, 90), []);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: 24 }}>
      <h1>scroll-date-indicator playground</h1>
      <p style={{ color: "#475569" }}>
        Scroll the timeline below. The floating date pill follows the visible day
        and fades out after a short idle period.
      </p>

      <div
        style={{
          position: "relative",
          height: 480,
          border: "1px solid #cbd5e1",
          borderRadius: 12,
          overflow: "hidden",
          background: "#f8fafc",
        }}
      >
        <div
          ref={scrollRef}
          style={{
            height: "100%",
            overflowY: "auto",
            padding: 12,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {items.map((it) => (
            <div
              key={it.ts}
              data-timestamp={it.ts}
              style={{
                background: "white",
                border: "1px solid #e2e8f0",
                borderRadius: 10,
                padding: "8px 12px",
                fontSize: 14,
              }}
            >
              <strong>{it.sender}: </strong>
              {it.text}
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                {new Date(it.ts).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        <ScrollDateIndicator
          containerRef={scrollRef}
          locale="en-US"
          position="top-center"
        />
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
