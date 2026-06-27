# RD CAMPUSDEX — Operational & DevOps Runbook

## 1. Migration Workflow
RD CampusDex enforces a strict separation between Development and Production schema modifications.
- **Local Development:** Developers use `npx prisma migrate dev --name <description>` to generate atomic, version-controlled SQL files in `prisma/migrations/`.
- **CI/CD Validation:** The CI pipeline validates these scripts via `npx prisma validate`.
- **Production Deployment:** Only `npx prisma migrate deploy` is permitted against the Production database. This guarantees safe, strictly-forward database evolution without accidental drops.

## 2. Disaster Recovery & Backups
- **Recovery Point Objective (RPO):** 1 Hour
- **Recovery Time Objective (RTO):** 4 Hours
- **Strategy:** Our Railway MySQL instance performs automated hourly logical snapshots. In a catastrophic event, point-in-time recovery (PITR) is utilized via the Railway interface.
- **Physical Verification:** A staging environment script runs bi-weekly to physically restore the latest snapshot and verify checksums against the live database, ensuring backups are never corrupted.

## 3. Secret Rotation Protocol
- **JWT Secret:** Generates a new 64-byte hex string. The backend is configured to support a rolling array of valid signing keys. The old key remains in the verification array for 24 hours to prevent session drops during rotation, while all new tokens are minted with the new key.
- **Cloudinary/Resend:** Create a secondary active API key on the platform, deploy the new `CLOUDINARY_API_KEY` to Vercel production environments, verify `/api/health/ready`, and revoke the legacy key after 2 hours.

## 4. Release Strategy
- **Staging Pipeline:** Merging to `main` triggers auto-deployment to the Vercel Staging URL.
- **Production Canary:** After staging sign-off, Vercel initiates a Canary deployment routing 5% of traffic to the new build. If the 5xx error rate remains below 1% over 15 minutes, traffic is promoted to 100%.
- **Instant Rollback:** If Cloudinary limits, DB faults, or critical exceptions spike during Canary, Vercel instantly reverts traffic to the previous known-good deployment slot.

## 5. Log Retention & Observability
- **Hot Storage:** Correlated execution logs (containing `x-request-id`) and performance traces are retained in hot Datadog/Vercel storage for 30 days.
- **Cold Storage:** Compliance and security audit trails are archived to AWS S3 / Cloudflare R2 for 365 days.
- **Dashboards:** Monitoring matrices track Active Connections, 95th Percentile Latency, Upload Success Rates, and Database Query Load.

## 6. Service Level Objectives (SLOs)
- **API Availability:** 99.9% uptime over a 30-day window.
- **p95 Latency:** < 300ms for standard requests, < 2000ms for File Upload processing.
- **Upload Success:** > 99.5% success rate for non-malicious payloads.
- **Email Delivery (Resend):** < 5s delivery latency for Password Resets.
