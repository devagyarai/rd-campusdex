# INCIDENT MANAGEMENT & RESPONSE MATRIX

## Severity Levels

| Level | Impact | Description | Target Response |
|-------|--------|-------------|-----------------|
| **SEV-1** | Critical | Complete platform outage or severe data breach. | 15 Minutes |
| **SEV-2** | High | Core feature broken (e.g., File Uploads down, DB replication lag). | 1 Hour |
| **SEV-3** | Medium | Non-critical degradation (e.g., Analytics lagging, visual bugs). | 24 Hours |
| **SEV-4** | Low | Minor cosmetic issues or localized user errors. | Next Sprint |

## Escalation Path
1. **Automated Alerting:** Triggered via Vercel / Datadog thresholds (e.g., 5xx rate > 1%).
2. **L1 On-Call:** Receives PagerDuty notification, evaluates SEV level, and initiates the Runbook.
3. **L2 Engineering:** Escalated if resolution requires code hotfixes or DB restoration.
4. **CTO / Lead Architect:** Escalated for SEV-1 data breaches or multi-hour cascading outages.

## Feature Flags & Kill-Switches
The platform utilizes kill-switches mapped to environment variables. In the event of an active zero-day attack or runaway resource consumption (e.g., Cloudinary DDoS), the specific microservice can be severed:
- `NEXT_PUBLIC_DISABLE_UPLOADS=true`
- `DISABLE_PASSWORD_RESETS=true`

## Postmortem Protocol
All SEV-1 and SEV-2 incidents require a blameless postmortem written within 48 hours.
**Template Requirements:**
1. **Timeline:** Chronological event sequence.
2. **Root Cause Analysis (RCA):** The explicit technical failure identified.
3. **Action Items:** Engineering tasks to prevent future occurrences, scheduled into the next immediate sprint.

## Specific Runbooks
- **Database Outage:** Vercel automatically routes `/api/health/ready` to return 503. The frontend enters Degraded Mode. L2 Engineer spins up the latest Railway snapshot via the dashboard GUI and reroutes the `DATABASE_URL` string in Vercel to instantly restore connectivity.
- **Cloudinary Outage:** Trigger kill-switch `NEXT_PUBLIC_DISABLE_UPLOADS=true`. Core site navigation remains functional; upload buttons are hidden gracefully until the vendor reports resolution.
