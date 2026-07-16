export type ScrollChromeState = {
  show: boolean;
  scrolledDataset: "" | "down";
};

type GetScrollChromeStateInput = {
  scrollTop: number;
  lastScrollTop: number;
  currentlyShown: boolean;
  topThreshold?: number;
  hideDelta?: number;
  showDelta?: number;
};

/**
 * Decide whether mobile chrome (header / menu button) should stay visible.
 * Uses deltas so tiny scroll jitter does not thrash show/hide.
 */
export function getScrollChromeState({
  scrollTop,
  lastScrollTop,
  currentlyShown,
  topThreshold = 10,
  hideDelta = 8,
  showDelta = 8,
}: GetScrollChromeStateInput): ScrollChromeState {
  if (scrollTop <= topThreshold) {
    return { show: true, scrolledDataset: "" };
  }

  const delta = scrollTop - lastScrollTop;
  if (delta > hideDelta) {
    return { show: false, scrolledDataset: "down" };
  }
  if (delta < -showDelta) {
    return { show: true, scrolledDataset: "" };
  }

  return {
    show: currentlyShown,
    scrolledDataset: currentlyShown ? "" : "down",
  };
}
