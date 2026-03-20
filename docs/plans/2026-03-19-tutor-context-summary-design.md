# Tutor Context Summary Design

## Goal

Reduce Torch panel clutter across mobile, tablet, and desktop so the chat stays readable and gets more vertical space.

## Root Cause

The current tutor panel always renders three stacked context cards for the problem, the student's answer, and the correct answer. Those cards consume a large part of the panel height before the chat list can grow, which is most visible on mobile but also makes the panel feel dense on larger screens.

## Chosen Approach

Replace the three cards with one compact summary line directly under the panel title. The summary should keep the same information available at a glance without requiring an extra toggle or interaction.

## UX Details

- Keep the `Math help` eyebrow, `Torch the Tutor` title, and `Close` action.
- Add a single muted summary block under the header with the problem, student answer, and correct answer.
- Preserve the existing message list, composer, and reset action.
- Keep the summary compact enough that the message list clearly becomes the visual focus.

## Testing

- Add a component test that verifies the compact summary renders when the tutor opens.
- Assert the old `Problem`, `Your answer`, and `Correct answer` cards are no longer rendered as separate headings.
- Run targeted tutor tests and a production build after the UI change.
