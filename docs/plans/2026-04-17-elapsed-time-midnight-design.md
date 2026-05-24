# Elapsed Time Midnight Crossing Design

## Goal

Fix 4th grade elapsed-time problems so prompts and answers stay correct when a problem crosses from `p.m.` into `a.m.` after midnight.

## Approach Options

1. Normalize each displayed time into an absolute minute offset and compare those offsets.
   Recommended because it keeps the arithmetic explicit and makes midnight crossings easy to reason about.
2. Keep the current random generation and patch the displayed period after the fact.
   Rejected because it fixes labeling without making the underlying model clearer.

## Chosen Design

Represent each endpoint as a clock time with its own hour, minute, and period. Convert those endpoints to comparable minute offsets, treating an end time that is earlier on the clock as happening on the next day when needed. Use that shared logic for both prompt text and the numeric answer.

## Testing

Add a regression test for `8:45 p.m. to 1:00 a.m.` and keep the existing smoke test for general prompt shape.
