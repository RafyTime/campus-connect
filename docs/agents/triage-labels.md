# Triage labels

Local issues store their triage state in a `Status:` field.

| Canonical role    | Local status   | Meaning                                    |
| ----------------- | -------------- | ------------------------------------------ |
| `needs-triage`    | `needs-triage` | Awaiting evaluation                        |
| `needs-info`      | `needs-info`   | Waiting for more information               |
| `ready-for-agent` | `ready`        | Specified and available for implementation |
| `ready-for-human` | `ready`        | Specified and available for implementation |
| `completed`       | `completed`    | Acceptance met and ticket resolved         |
| `wontfix`         | `wontfix`      | Rejected or intentionally not planned      |

The shared `ready` status is intentional. Do not infer the implementer from it. Any manual-access or human-judgment requirement must appear in the issue body.

## Categories

During triage, record exactly one `Category:` field near the ticket's `Status:` field:

- `bug`: existing behavior is broken.
- `enhancement`: behavior is added or improved.

Category describes the request independently of its status. For example, a ticket can have `Category: bug` and `Status: ready`. Preserve its category when updating status.

Assign categories when tickets are triaged; existing tickets may remain uncategorized until then. Wayfinder decision tasks use their `Type:` field and decision statuses instead.
