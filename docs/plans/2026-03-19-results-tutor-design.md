# Results Tutor Design

## Goal

Add an optional, one-problem-at-a-time tutoring panel to the `Results` screen so students in Grades 1-5 can get guided help on missed problems without changing the existing quiz flow.

## Product Decisions

- Tutor appears only on the `Results` screen.
- Tutor is optional and launches from incorrect answers only.
- Tutor focuses on one missed problem at a time.
- Tutor is text-only in v1.
- A small Vercel backend owns all provider calls and safety checks.
- The initial model provider is OpenRouter using `stepfun/step-3.5-flash:free`.
- The provider integration should be easy to swap later if reliability needs change.

## User Experience

Each incorrect result row gets a `Help me with this one` action. On desktop, selecting that action opens a right-side tutor panel next to the results content. On mobile, the same experience becomes a slide-up drawer so the current layout remains usable on smaller screens.

The tutor shows:

- the original problem
- the student's answer
- the correct answer
- a short friendly introduction
- a chat-style walkthrough for that one problem

The first tutor response should be brief and guided. It should favor a hint or a single follow-up question over dumping the full solution immediately. The panel should always offer a clear `Close` action and a `Start over` action for the current problem conversation.

## Architecture

The frontend sends a structured request to a Vercel function when a student opens tutoring for a missed problem or sends a follow-up message. The request includes:

- `grade`
- `problemType`
- `problemDisplay`
- `correctAnswer`
- `studentAnswer`
- short conversation history for the active problem

The Vercel function is responsible for:

1. validating and normalizing the request
2. building the tutoring prompt
3. calling the model provider
4. parsing the provider response into a strict UI-friendly shape
5. returning a fallback explanation when the provider fails

The provider layer should live behind a small adapter so the app can move from OpenRouter to Gemini later without changing the frontend contract.

## Model And Safety Strategy

The app remains the source of truth for grading. The model is only responsible for explanation. The correct answer is already known from the generated problem, so the tutor must treat that value as ground truth.

The tutoring prompt should enforce these rules:

- explain only the selected problem
- use the provided correct answer as truth
- compare the student's answer with the correct answer
- use grade-appropriate language
- ask at most one follow-up question at a time
- avoid unrelated concepts
- admit uncertainty instead of guessing

There should also be a lightweight server-owned verification layer. V1 does not need raw shell or Python access. Instead, the backend should:

- validate numeric fields
- reject malformed tutoring requests
- optionally verify arithmetic for supported problem families
- separate provider failures from user errors

## API Shape

### Request

```json
{
  "grade": 3,
  "problemType": "Short Division",
  "problemDisplay": "24 ÷ 6 =",
  "correctAnswer": 4,
  "studentAnswer": 6,
  "messages": [
    {
      "role": "user",
      "content": "I don't get it"
    }
  ]
}
```

### Response

```json
{
  "summary": "Let's look at how many groups of 6 fit into 24.",
  "hint": "Try skip-counting by 6.",
  "nextQuestion": "What do you get when you count 6, 12, 18, 24?",
  "workedExample": null,
  "messages": [
    {
      "role": "assistant",
      "content": "Let's look at how many groups of 6 fit into 24. Try skip-counting by 6. What do you get when you count 6, 12, 18, 24?"
    }
  ]
}
```

The UI should tolerate partial responses. If only `messages` or only `summary` is present, the panel should still render gracefully.

## Components

- `Results` gains per-problem tutor launch actions and active-tutor state.
- `ProblemTutorButton` renders only for incorrect answers.
- `TutorPanel` renders the conversation shell on desktop.
- `TutorDrawer` or a responsive variation of the same component handles mobile.
- `TutorMessageList` renders the guided conversation.
- `TutorComposer` submits short follow-up questions.
- `useProblemTutor` manages loading, retries, message history, and reset behavior.

## Error Handling

If the provider times out, returns invalid output, or the request cannot be validated, the backend should return a safe fallback response. The fallback should be calm, short, and grounded in the known correct answer.

Example fallback:

> I'm having trouble explaining this one right now. The correct answer is `12`. Try looking at the ones place first.

Fallback copy can become more problem-type-specific later, but v1 only needs a generic safe response.

## Testing Strategy

Cover three layers:

- frontend interaction tests for opening, closing, and switching tutor sessions
- backend tests for request validation, prompt construction, and fallback behavior
- safety regression fixtures across representative Grade 1-5 problems

## Rollout

Release the tutor behind an environment flag first. This allows deployment without forcing the feature on for all students immediately. Once the flow is stable, the flag can default to enabled.

## Deferred Work

- text-to-speech or read-aloud controls
- richer arithmetic verification by problem family
- analytics for high-friction problem types
- provider fallback or automatic provider switching
- saved tutor conversations across page reloads
