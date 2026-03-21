# Mental Math Moves Design

## Goal

Add a kid-facing `Mental Math Moves` system that teaches grade- and topic-specific speed strategies across the existing Grades 1-5 practice flow, so students learn how to think faster instead of only answering more questions.

## Product Decisions

- The same strategy content is visible to kids, coaches, and parents.
- Strategy content is keyed to `grade + problemType`.
- The feature uses a hybrid model:
  - a dedicated strategy library for study
  - embedded strategy moments inside practice and review
- Each topic guide uses short kid-friendly language, not hidden teacher notes.
- The app remains honest about when a topic depends on fact fluency more than a shortcut.
- Every published strategy fact must receive a `gpt-5.4` high-reasoning review for mathematical accuracy and grade appropriateness before release.

## Content Model

Each `Mental Math Move` entry should be reusable across the app and include:

- `title`
- `kidFriendlyRule`
- `whenToUse`
- `steps`
- `workedExample`
- `speedTip`
- `mistakeToAvoid`
- `coachNote`
- `tags`

Each `grade/problemType` guide should include:

- `3-6` core moves
- `warmupChecklist`
- `commonTraps`
- `confidenceNote`
- `gamePlan`
  - `whatToLookFor`
  - `bestFirstMove`
  - `howToCheckFast`

## User Experience

The same guide content should appear in these places:

- `ProblemTypeSelector`
  - Offer a way to open the guide before starting practice.
- `Quiz`
  - Show a small optional `Today’s Tip` card for the selected topic.
- `Results`
  - Attach a relevant move to missed problems so the fix connects to the error.
- `Strategy library`
  - Add a dedicated browseable screen by grade and topic.
- `Worksheets`
  - Print a `Fast ways to think` section that matches the topic guide.
- `Tutor`
  - Ground tutoring responses in the same guide content so the explanations stay consistent with the rest of the site.

## Writing Rules

Every guide and move should follow these editorial rules:

- Talk to the student directly.
- Teach one move at a time.
- Prefer example-first explanations.
- Use memorable move names.
- Say when a move does not fit.
- Keep the tone confidence-building, not lecture-heavy.
- Reuse the same wording everywhere the move appears.

Each topic guide should also include a short `Game Plan` that tells the student:

- what to look for
- the best first move
- how to check fast

## Architecture

The frontend should own a typed strategy dataset under `src/data/mentalMathMoves/`, with lookup helpers that can resolve a guide by:

- selected `problemType`
- generated `problem.type`
- grade number

The UI should consume that shared data through a small set of presentational components instead of embedding text directly in screen components.

The tutor prompt builder should receive a compact summary of the current topic guide so model responses reinforce the same strategies already taught in the UI.

## Fact Review Workflow

Strategy content is educational content, so it needs an explicit quality gate before publication.

For every topic guide:

1. Draft the guide content in the structured data format.
2. Run a `gpt-5.4` high-reasoning review focused on:
   - arithmetic correctness
   - grade-level appropriateness
   - whether the move actually fits that problem family
   - whether the wording is kid-friendly and transparent
3. Apply fixes from the review before wiring the content into the UI.
4. Record the review outcome in the implementation notes for the feature.

## Testing Strategy

Cover these layers:

- content lookup tests for guide resolution by grade and topic
- component tests for library rendering and embedded strategy surfaces
- tutor prompt tests to confirm guide summaries are included
- smoke tests for the main grade -> topic -> quiz -> results path with the new strategy UI present

## Deferred Work

- per-problem move selection that adapts to exact number patterns instead of topic-level guidance
- read-aloud or audio strategy mode
- saved study progress through the strategy library
- analytics on which moves correlate with score improvement
