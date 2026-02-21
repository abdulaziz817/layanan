export function isPWA() {
  if (typeof window === "undefined") return false;

  const isStandalone =
    window.matchMedia &&
    window.matchMedia("(display-mode: standalone)").matches;

  const isIOSStandalone = window.navigator?.standalone === true;

  return isStandalone || isIOSStandalone;
}