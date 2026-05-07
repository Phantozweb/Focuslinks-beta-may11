// Stub analytics utility - placeholder for future analytics integration
// Tracks user interactions for product analytics

export function trackEvent(event: { action: string; category?: string; label?: string; value?: string }) {
  // In production, this would send events to an analytics service
  // (e.g., Mixpanel, Amplitude, PostHog, Google Analytics)
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', event.action, event);
  }
}
