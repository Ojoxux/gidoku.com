import { describe, it, expect } from "vitest";
import { getScrollChromeState } from "./scroll-chrome";

describe("getScrollChromeState", () => {
  it("shows chrome near the top even when scrolling down", () => {
    expect(getScrollChromeState({ scrollTop: 8, lastScrollTop: 0, currentlyShown: true })).toEqual({
      show: true,
      scrolledDataset: "",
    });
  });

  it("hides chrome after scrolling down past the hide delta", () => {
    expect(
      getScrollChromeState({ scrollTop: 40, lastScrollTop: 20, currentlyShown: true }),
    ).toEqual({
      show: false,
      scrolledDataset: "down",
    });
  });

  it("shows chrome after scrolling up past the show delta", () => {
    expect(
      getScrollChromeState({ scrollTop: 30, lastScrollTop: 50, currentlyShown: false }),
    ).toEqual({
      show: true,
      scrolledDataset: "",
    });
  });

  it("keeps the current state for small jitter so layout does not thrash", () => {
    expect(
      getScrollChromeState({ scrollTop: 42, lastScrollTop: 40, currentlyShown: false }),
    ).toEqual({
      show: false,
      scrolledDataset: "down",
    });

    expect(
      getScrollChromeState({ scrollTop: 38, lastScrollTop: 40, currentlyShown: true }),
    ).toEqual({
      show: true,
      scrolledDataset: "",
    });
  });
});
