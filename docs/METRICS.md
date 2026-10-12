# Curb: Metrics

## Measured

| What | Value | Source |
|---|---|---|
| Items listed in the first move-out pilot at Berkeley | **127** | Pilot records |

That's the only usage number so far; everything below is either measured on the build or a target for the next move-out.

## Measured on the build

| What | Value |
|---|---|
| Unit tests | 11 passing (`npm test`) |
| Listing lifetime | Exactly 72 hours, tested |
| Photo size after compression | Longest side 1280px, tested |

## To measure in the next move-out (targets, not results)

| Metric | Definition | Target |
|---|---|---|
| Items listed | Listings created during the move-out window | More than 127 |
| Handoff rate | Listings marked handed off ÷ listings created | 50%+ |
| Time to first message | From posting to the first buyer message | Under 1 hour (median) |
| Relist rate | Expired listings that get relisted | Watch, to tune the 72-hour window |
| Repeat sellers | Sellers who post more than one item | Watch |

Every one of these can be computed from the `listings`, `threads` and `messages` tables, with no extra tracking.
