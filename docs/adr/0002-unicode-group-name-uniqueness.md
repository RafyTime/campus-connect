# ADR 0002: Enforce Unicode Group name uniqueness

## Status

Accepted — October 2026.

## Context

Group names must be unique regardless of capitalization while retaining the User's chosen spelling for public display. SQLite's built-in `lower(name)` index handles ASCII case conversion only, so it accepts both `München Club` and `MÜNCHEN Club`. Canonically equivalent Unicode spellings also need to share a name. An application lookup before insertion cannot enforce uniqueness under concurrent requests.

Full Unicode case folding and compatibility normalization would merge additional names, such as `Straße Club` and `STRASSE Club` or compatibility characters and their ordinary equivalents. Those broader equivalences are outside the chosen capitalization and canonical-equivalence policy.

## Decision

Store a private normalized `name_key` alongside the public display name and enforce its uniqueness with SQLite's `group_name_key_unique` index. Use the shared `groupNameKey()` function in `src/lib/server/group-name.ts` for creation, editing, migration backfill, fixtures, and seed helpers. Compute the key in this order:

1. Trim leading and trailing whitespace with JavaScript `String.trim()`.
2. Normalize to Unicode NFC.
3. Apply JavaScript `String.toLowerCase()`, the locale-independent Unicode lowercase conversion.
4. Normalize to NFC again after case conversion.

Preserve the display name's spelling and capitalization after trimming. Keep internal whitespace unchanged. Use lowercase conversion and canonical normalization without full case folding or compatibility normalization.

## Consequences

`München Club`, `MÜNCHEN Club`, and `MU\u0308NCHEN Club` share the key `münchen club`. ASCII case differences also collide. `Straße Club` and `STRASSE Club` remain distinct. All Group inserts and name updates must supply the computed key. The unique index handles simultaneous requests; conflicting creation and editing return the existing inline `name-taken` result. Unchanged-name and capitalization-only edits retain the Group's own key and succeed.

SQLite cannot compute this Unicode policy itself, so the application migration runner handles the backfill marker in the committed migration. It checks existing names for collisions before altering the Group table and holds a write transaction through backfill, index creation, and journal recording. Collision reports identify the conflicting keys, Group IDs, and display names; a rejected migration commits no changes. Collision-free backfill changes only the key column, preserving display names, timestamps, ownership, memberships, and Events.

Adding the non-null column to a populated SQLite table requires an empty SQL default as a backfill placeholder. Writers must supply the computed key rather than rely on that default. The runner preserves Drizzle's migration hashes and timestamps, and recorded migrations remain safe to rerun. Future changes to the normalization policy require checking existing names for new collisions and recomputing their keys.
