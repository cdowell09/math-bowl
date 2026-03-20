# Tutor Chat Auto-Follow Design

## Goal

Keep Torch focused on the latest chat turn by default while still allowing the user to scroll upward to read older messages without being forced back down.

## Problem

The tutor message list scrolls independently, but it does not automatically follow new content. As the conversation grows, the newest assistant reply can render below the visible viewport, leaving the user looking at older turns while the latest response is partially hidden.

## Chosen Approach

Add local scroll-follow behavior to the tutor message list in `TutorPanel`. The panel should scroll to the bottom when the tutor opens and whenever a new turn or loading state is appended, but only if the user is already at or near the bottom.

## UX Rules

- When Torch opens, position the chat at the latest turn.
- When a new user or assistant message is appended, keep the list tailed to the bottom if the user has not intentionally scrolled away.
- If the user scrolls upward, stop auto-following until they return near the bottom.
- Keep the behavior silent and automatic; no new controls are needed.

## Testing

- Add a focused `TutorPanel` test that verifies the list scrolls to the bottom when new messages arrive while the user is near the bottom.
- Add a companion assertion that no auto-scroll happens after the user has scrolled upward.
- Run the tutor-related test suite and a production build after the behavior change.
