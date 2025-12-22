* Local and production must share identical runtime paths
* Environment-specific behavior is controlled only by `VITE_LOCAL_API_BASE` and `VITE_PUBLIC_TRACKING_BASE`
* No use of `import.meta.env.DEV` or `MODE` for runtime routing decisions
* `/api/campaigns/:id/click` must be public, write to local DB in local, write to prod DB in prod
* Invoice CTAs: `ctaTargetUrl` = raw external URL, `ctaLink` = tracked URL only
* Production verified with no VITE_* overrides (`VITE_LOCAL_API_BASE` unset, `VITE_PUBLIC_TRACKING_BASE` unset)
* No-drift rule: any change that affects routing, tracking, analytics, or CTA construction must be validated against docs/env-parity.md and docs/local-verification.md before acceptance
