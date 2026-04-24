import { describe, expect, it } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { ScrollDateIndicator } from "../react";

describe("<ScrollDateIndicator />", () => {
  it("renders a status node with a non-empty label", async () => {
    const ref = createRef<HTMLDivElement>();
    const today = Date.now();

    function Demo() {
      return (
        <div style={{ position: "relative" }}>
          <div ref={ref} style={{ height: 100, overflowY: "auto" }}>
            <div data-timestamp={today} style={{ height: 50 }}>
              item
            </div>
          </div>
          <ScrollDateIndicator containerRef={ref} format={() => "Today"} />
        </div>
      );
    }

    act(() => {
      render(<Demo />);
    });

    await waitFor(() => {
      const node = screen.getByRole("status");
      expect(node.textContent).toBe("Today");
    });
  });
});
