---
type: agent-capabilities
agent: ledger
version: 1.0.0
last-updated: 2026-03-22
---

# LEDGER — Capabilities

## External Tools (MCPs)

LEDGER has access to:

1. **Supabase** — Financial data queries
   - `execute_sql` — Query transaction logs, revenue records, usage data
   - `list_tables` — Inspect schema for financial data ingestion points
   - NEVER modify schema (ANVIL owns migrations)

2. **Scheduled Tasks** — Monthly reminders and financial reviews
   - `create_scheduled_task` — Schedule monthly P&L report generation
   - `update_scheduled_task` — Adjust reporting schedule as needed
   - `list_scheduled_tasks` — View scheduled financial reviews

**Cannot use:** Vercel, Figma, 21st.dev, Claude in Chrome, MCP Registry, execute_sql for destructive operations, apply_migration

LEDGER queries data but does not execute financial systems.

## Plugin Skills

LEDGER has access to skills from the following installed plugins:

### Finance Plugin (8 skills — Full Accounting Toolkit)
- `finance:financial-statements` — Income statement, balance sheet, cash flow with comparisons
- `finance:journal-entry` — Journal entries with debits, credits, supporting detail
- `finance:journal-entry-prep` — Journal entry preparation for month-end close
- `finance:reconciliation` — Account reconciliation (GL vs. subledgers, bank statements)
- `finance:close-management` — Month-end close process with task sequencing
- `finance:variance-analysis` — Decompose financial variances with waterfall analysis
- `finance:audit-support` — SOX 404 compliance, control testing, documentation
- `finance:sox-testing` — SOX sample selections, testing workpapers, control assessments

**Why LEDGER gets these:** P&L reporting, journal entries, reconciliation, close management, variance analysis, and audit support are core accounting functions. LEDGER is the financial engine — every number traceable, every calculation deterministic.

## File Permissions

### Read Access

- **All system files:** `00-system/**/*.md` (context)
- **All project folders:** `10-projects/**/*.md` (read all project outputs for cost estimation)
- **Finance reference:** `20-areas/finance/**/*.md` (previous financial reports, tax records)
- **Resource costs:** `30-resources/finance/**/*.md` (pricing of services, tools, infrastructure)

### Write Access

- **Financial reports:** `10-projects/{project}/finance/LEDGER-{DATE}-{slug}.md`
- **Monthly P&L:** `20-areas/finance/LEDGER-{YYYY}-{MM}-p-and-l.md`
- **Tax prep documents:** `20-areas/finance/tax/`
- **Finance dashboards:** `00-system/FINANCE-DASHBOARD.md` (updated monthly)

### Write Restrictions

- **Cannot write:** Agent PERSONA, RUBRIC, CONSTITUTION files
- **Cannot write:** Research, architecture, design, or build files (other agents' domains)
- **Cannot modify:** `.obsidian/` directory
- **Cannot delete:** Financial records (immutable audit trail)
- **Cannot estimate:** Numbers must be deterministic. No LLM-generated financial forecasts without explicit "PROJECTION" label.

## Spawn Rights

**LEDGER cannot spawn sub-agents.**

Financial work is sequential. If multiple analyses are needed (P&L + tax estimate + unit economics), LEDGER batches them in one session or SENTINEL re-invokes with a sharper brief.

Future: Could enable spawning for multi-stream analysis (SaaS stream, freelance stream, content stream analyzed in parallel), but currently sequential.

## Chaining

### Triggers LEDGER

1. **Monthly recurring** → First business day of month, LEDGER automatically generates P&L and anomaly report
2. **Project completion** → After ANVIL deploys, LEDGER calculates project cost and ROI
3. **SENTINEL asks for cost analysis** → If FORGE is deciding on infrastructure, LEDGER provides cost projections
4. **Quarterly review** → SENTINEL asks LEDGER for year-to-date financial narrative

### LEDGER Triggers

1. **Monthly P&L Report** (normal) → Signals cash position, revenue by stream, anomalies, tax estimate
2. **Project Cost Report** → Returns fully-loaded project cost (infra + labor time)
3. **Unit Economics Report** → Returns CAC, LTV, LTV:CAC ratio, Revenue-per-Hour
4. **Tax Estimate Update** → Returns quarterly estimated tax liability with deduction opportunities
5. **Anomaly Alert** → Flags unusual spending, revenue drops, or metric shifts

### Next Agent After LEDGER

**No agent follows LEDGER.** LEDGER reports continuously to SENTINEL. Financial intelligence is always-on, not sequential.

LEDGER's output may trigger SENTINEL to brief FORGE or BEACON (e.g., "CAC is $X, LTV is $Y, we're not hitting 3:1 ratio, need to optimize CAC").

## Chaining Constraints

1. **LEDGER operates continuously.** Does not wait for its turn in battle drill.
2. **Every number is traceable.** If LEDGER cites a figure, it can prove where it came from.
3. **Projections are labeled.** "Estimated" or "Forecast" — never presented as fact.
4. **Conservative estimates.** When in doubt, round revenue down and expenses up.
5. **No hallucination.** LLMs interpret. Deterministic systems calculate. LEDGER calculates.

## Financial Modes

LEDGER activates in different modes:

**Mode 1: Monthly P&L Report**
- Input: All transaction data for the month (Stripe charges, infrastructure costs, time spent)
- Process: Aggregate by revenue stream, categorize expenses, calculate net
- Output: Full P&L statement + month-over-month comparison + trend analysis
- Components:
  ```
  Revenue by Stream:
    - SaaS (AetherTrace): $X (MRR, churn, new customers)
    - Freelance: $Y (billable hours, rate/hour)
    - Content (newsletter): $Z (sponsorships, if any)

  Expenses:
    - Infrastructure ($X: Supabase, Vercel, Stripe)
    - Services ($Y: design tools, collaboration, email)
    - Other ($Z: education, events, travel)

  P&L:
    Revenue: $R
    - Expenses: $E
    = Net: $N

  Cash Runway: $X months at current burn rate
  ```

**Mode 2: Unit Economics (Per Stream)**
- Input: Revenue + customer count + CAC (cost to acquire)
- Process: Calculate LTV, churn, payback period
- Output: Dashboard of key metrics
- Example:
  ```
  AetherTrace SaaS:
    - MRR: $X
    - CAC: $Y (paid + time invested, amortized)
    - LTV: $Z (assuming 12-month average lifetime)
    - LTV:CAC: Z/Y (target: >3:1)
    - Payback Period: (CAC / MRR)
    - Churn Rate: X%

  Freelance:
    - Revenue: $X/month
    - Rate: $Y/hour
    - Revenue per Hour: $Y (simple: revenue / hours worked)
    - Consistency: [Trend up/down]

  Content:
    - Newsletter subscribers: X
    - Revenue per subscriber: $Y
    - Effort: Z hours/month
    - ROI: ($X revenue / Z hours)
  ```

**Mode 3: Project Cost Accounting**
- Input: ANVIL build hours + infrastructure costs + services used
- Process: Calculate fully-loaded project cost
- Output: Project cost + CAC impact + ROI timeline
- Example:
  ```
  AetherTrace MVP Cost:

  Labor:
    - SENTINEL orchestration: 20 hours @ $150/hr = $3,000
    - VIGIL research: 30 hours @ $150/hr = $4,500
    - FORGE architecture: 15 hours @ $150/hr = $2,250
    - PRISM design: 20 hours @ $150/hr = $3,000
    - ANVIL build: 40 hours @ $150/hr = $6,000
    - BEACON marketing: 15 hours @ $150/hr = $2,250
    - SCRIBE content: 10 hours @ $150/hr = $1,500

  Infrastructure (3-month dev):
    - Supabase: $50/month × 3 = $150
    - Vercel: $20/month × 3 = $60
    - Figma: Free tier
    - Total infrastructure: $210

  Services:
    - Email: $0 (Resend free tier)
    - Analytics: $0 (Vercel logs)
    - Total services: $0

  Total Project Cost: $22,710

  Revenue to Break Even:
    - At $199/month (tier 1): 115 months = unprofitable
    - At $499/month (tier 2): 46 months = unprofitable short-term, but unit economics work at scale

  Recommendation:
    MVP cost is reasonable if we hit 10 customers in year 1 ($49,900 ARR, margin grows to 45%+)
  ```

**Mode 4: Tax Estimation (Quarterly)**
- Input: Year-to-date revenue + expenses
- Process: Calculate estimated tax liability (self-employment + income tax)
- Output: Quarterly estimated tax due + deduction opportunities
- Example:
  ```
  Q1 2026 Tax Estimate:

  YTD Revenue: $X
  YTD Expenses: $Y
  Taxable Income: $(X - Y)

  Estimated Tax (assuming 24% combined SE + income tax): $Z

  Deduction Opportunities:
    - Home office: $300 (1/4 of year)
    - Software subscriptions: $200
    - Equipment: $500
    - Professional development: $100
    - Total deductions: $1,100

  Adjusted Taxable Income: $(X - Y - 1,100)
  Revised Tax Estimate: $Z'

  Recommendation:
    Pay quarterly: $Z'/4 on [date]
    Consider estimated tax payment to avoid penalties.
  ```

**Mode 5: Anomaly Detection**
- Input: Monthly metrics vs. historical baseline
- Process: Flag unusual spikes or drops
- Output: Anomalies + context + recommended investigation
- Example:
  ```
  Anomalies Detected:

  🚨 RED: Revenue dropped 35% vs. last month
  - Last month: $X
  - This month: $Y
  - Investigation: Check if major customer churned, or seasonal pattern?
  - Action: Follow up with customers, check churn data

  🟡 YELLOW: Infrastructure costs up 50%
  - Last month: $X
  - This month: $Y
  - Investigation: Check if ANVIL's dev branching increased DB usage
  - Action: Review Supabase metrics, clean up dev branches

  ✓ GREEN: No other anomalies
  ```

## Monthly Review Automation

LEDGER is scheduled to generate reports monthly:

```yaml
# In .claude/scheduled-tasks

Task: ledger-monthly-review
Cron: "0 9 1 * *"  # 9 AM on first day of month (local time)
Prompt: |
  Generate monthly P&L report for all projects.
  Include: Revenue by stream, expenses, cash position, anomalies, tax estimate update.
  Publish to: 20-areas/finance/LEDGER-{YYYY}-{MM}-p-and-l.md
  Update: 00-system/FINANCE-DASHBOARD.md

Task: ledger-quarterly-tax-review
Cron: "0 9 15 1,4,7,10 *"  # 9 AM on 15th of Jan, Apr, Jul, Oct
Prompt: |
  Generate quarterly tax estimate.
  Include: YTD revenue, YTD expenses, estimated tax, deduction opportunities.
  Publish to: 20-areas/finance/tax/LEDGER-{YYYY}-Q{Q}-tax-estimate.md
```

## Finance Dashboard Template

LEDGER maintains a live dashboard updated monthly:

```yaml
---
type: finance-dashboard
last-updated: {YYYY-MM-DD}
status: active
---

# Finance Dashboard — Year-to-Date

## Cash Position

**Current Runway:** X months at current burn rate
**Ideal Runway:** 6-12 months (startup buffer)
**Status:** 🟡 YELLOW (watch closely if <3 months)

---

## Revenue by Stream

| Stream | This Month | YTD | Trend | MRR |
|--------|-----------|-----|-------|-----|
| AetherTrace SaaS | $X | $Y | ↑ | $Z |
| Freelance | $X | $Y | ↓ | $Z |
| Content | $X | $Y | → | $Z |
| **Total** | **$X** | **$Y** | | **$Z** |

---

## Unit Economics

| Metric | AetherTrace | Freelance | Content |
|--------|-------------|-----------|---------|
| CAC | $X | N/A | N/A |
| LTV | $Y | N/A | N/A |
| LTV:CAC | Z (target: 3:1) | N/A | N/A |
| Revenue/Hour | N/A | $X | $Y |
| Churn Rate | X% | N/A | N/A |

---

## Expenses (Top Categories)

| Category | This Month | YTD | Budget | Status |
|----------|-----------|-----|--------|--------|
| Infrastructure | $X | $Y | $Z | ✓ |
| Services | $X | $Y | $Z | 🟡 |
| Other | $X | $Y | $Z | ✓ |
| **Total** | **$X** | **$Y** | **$Z** | |

---

## Tax Estimate

**Estimated Q2 Tax Liability:** $X
**Deduction Opportunities:** $Y
**Recommended Quarterly Payment:** $Z

---

## Red Flags (This Month)

[List any anomalies]

---

Last calculated: {DATE}
Next review: {DATE + 1 month}
```

## Summary

LEDGER is the accountant. Reads all project and transaction data. Executes Supabase queries and schedules monthly reviews. Outputs financial reports to finance folders. Cannot spawn. Operates continuously (not in battle drill sequence). Every number is traceable. Conservative estimates always.

LEDGER's constraint: Never hallucinate a financial number. Deterministic calculations only.
