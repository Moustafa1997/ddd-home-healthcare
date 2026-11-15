# Billing — Ubiquitous Language

| Term | Meaning in this context |
|---|---|
| **Visit** | A billable line: duration, rate, and payer. Billing does not care about tasks or addresses. |
| **Invoice** | A document sent to a payer for one or more billable visits. |
| **Payer** | Who pays: the client, a family member, or the local authority. |
| **Rate** | Price per hour for a given visit type. |

> Billing learns that a visit happened from the Scheduling context (via an event). It never reads Scheduling's tables.
