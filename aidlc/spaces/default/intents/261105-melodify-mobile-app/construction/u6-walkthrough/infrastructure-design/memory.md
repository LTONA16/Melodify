<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->
- 2026-11-20T19:46:17Z — treated U6 as an artifact-only infrastructure pass: the environment is the phone plus Metro, and the design question is how to make the four walkthroughs repeatable and reviewable.
- 2026-11-20T19:46:17Z — read the existing CI, PR template and two secure-store keys as the whole deployment surface; no new resource, dependency, step or secret was needed.

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->
- 2026-11-20T19:46:17Z — did not open the stage's optional questions file: no platform decision was pending and U4 followed the same artifact-only route.
- 2026-11-20T19:46:17Z — did not describe absent scalability, reliability and observability design artifacts as gaps; U6's NFR Design produced only performance, security and logical-component artifacts, and those are the sources used.

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->
- 2026-11-20T19:46:17Z — chose manual records and PR attachments over a capture script: the evidence has to show what a person saw, not what an automaton replayed.
- 2026-11-20T19:46:17Z — kept the seven CI steps unchanged even though the walkthrough has stricter evidence rules; a new check would add instrumentation and a second source of truth for the same verdict.
- 2026-11-20T19:46:17Z — marked inherited performance, portability and functional NFRs as N/A with a reason instead of silently dropping them, so traceability shows why U6 does not reopen them.

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
- 2026-11-20T19:46:17Z — if R2 is conditioned, the redirect and date must match in the walkthrough record and the external dependency map; the CI cannot verify that equality.
- 2026-11-20T19:46:17Z — the final verdict still depends on the physical-device walkthrough, which is outside CI and remains the MVP's definition of done.
