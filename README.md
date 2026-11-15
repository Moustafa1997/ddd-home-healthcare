# DDD Home Healthcare

A home healthcare scheduling system built step by step to practise **Domain-Driven Design** with NestJS, TypeScript and PostgreSQL.

This repository accompanies the Arabic video course *Domain-Driven Design بالمصري*. Each branch is one lesson; `main` is the final result.

## The domain

A home care company sends **caregivers** to **clients'** homes for scheduled **visits**. Each visit has **tasks** (medication, meal support, care notes). After the visit the company **bills** a payer, **pays** the caregiver, and **notifies** the client's family.

## Bounded Contexts

| Module | Subdomain type | Why |
|---|---|---|
| `scheduling` | **Core** | Matching the right caregiver to the right visit is what the company competes on. |
| `billing` | Supporting | Needed, but mostly rules + records. |
| `payroll` | Generic | Every company needs it; could be a third-party. |
| `notifications` | Supporting | Listens for events and sends messages. |

Each module has a `GLOSSARY.md` — its **Ubiquitous Language**. The same word can mean different things in different modules, and that is intentional.

## Branches (one per lesson)

| Branch | Lesson |
|---|---|
| `01-bounded-contexts` | Project skeleton: contexts as modules, glossaries |
| `02-transaction-script` | Check-out as a single procedure in one DB transaction |
| `03-active-record` | Visit as an Active Record entity |
| `04-value-objects` | `VisitTime`, `PhoneNumber`, `Address` |
| `05-entity-aggregate` | `Visit` aggregate root protecting its rules |
| `06-domain-events` | `VisitCompleted` published after save |
| `07-domain-service` | `CaregiverMatchingService` |
| `08-ports-adapters` | Repository ports, Postgres + in-memory adapters |
| `09-cqrs` | Dashboard read model + projection |
| `10-outbox` | Outbox table + relay |
| `11-saga` | Cancel-visit saga with compensation |
| `12-anticorruption-layer` | Payroll provider behind an ACL |
| `13-event-sourcing` | Visit history as an event stream |

## Run

```bash
cp .env.example .env
docker compose up -d        # PostgreSQL
npm install
npm run start:dev
npm test
```

## Try it

```bash
# complete a visit → VisitCompleted goes through the Outbox → Billing invoices, Notifications notifies, dashboard projection updates
curl -X POST localhost:3000/visits/<id>/check-out
# cancel a visit → CancelVisitSaga releases the caregiver, refunds the invoice, reassigns
curl -X POST localhost:3000/visits/<id>/cancel
# read side (CQRS)
curl localhost:3000/dashboard/visits
```

## Reading order

Each branch builds on the previous one. Check out a branch, read its `GLOSSARY.md` and the spec files first — the tests are the story of each lesson.
