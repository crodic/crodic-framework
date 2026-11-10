/**
 * Utility for tracking events in Google Tag Manager / Google Analytics
 */
export const trackEvent = (
  eventName: string,
  params?: Record<string, unknown>
) => {
  if (typeof window !== "undefined") {
    // If gtag is available
    if (typeof (window as any).gtag === "function") {
      (window as any).gtag("event", eventName, params);
      return;
    }
    // Fallback to dataLayer push
    if (Array.isArray((window as any).dataLayer)) {
      (window as any).dataLayer.push({
        event: eventName,
        ...params,
      });
    }
  }
};
