import "@testing-library/jest-dom/vitest";

class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = "0px";
  readonly thresholds: ReadonlyArray<number> = [0];
  private callback: IntersectionObserverCallback;
  private elements = new Set<Element>();

  constructor(cb: IntersectionObserverCallback) {
    this.callback = cb;
  }

  observe(target: Element): void {
    this.elements.add(target);
    this.fire(target, true);
  }
  unobserve(target: Element): void {
    this.elements.delete(target);
  }
  disconnect(): void {
    this.elements.clear();
  }
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  private fire(target: Element, isIntersecting: boolean): void {
    const entry = {
      target,
      isIntersecting,
      intersectionRatio: isIntersecting ? 1 : 0,
      boundingClientRect: target.getBoundingClientRect(),
      intersectionRect: target.getBoundingClientRect(),
      rootBounds: null,
      time: performance.now(),
    } as IntersectionObserverEntry;
    this.callback([entry], this);
  }
}

(globalThis as unknown as { IntersectionObserver: typeof IntersectionObserver })
  .IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
