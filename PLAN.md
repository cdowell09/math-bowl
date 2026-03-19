# Math Tutor Chat Panel — Implementation Plan

## Goal
Add a collapsible chat panel to the Results screen that helps students walk through problems they got wrong. The tutor understands each problem, the correct answer, and the student's answer, and guides them step-by-step to understand their mistake.

## Key Decisions

### Model: Claude Haiku 4.5 (`claude-haiku-4-5-20251001`)
- **Cheapest** Anthropic model (~$0.80/M input, $4/M output tokens)
- Safe by default — no jailbreak risk, built-in content filtering
- More than capable for grades 1–5 arithmetic
- Supports tool use for self-checking math

### Code Execution: Server-side `calculate` tool via `mathjs`
- Claude Haiku calls a `calculate` tool when it wants to verify its arithmetic
- The Vercel serverless function evaluates the expression using `mathjs` (safe, no arbitrary code execution)
- Result is fed back to Claude, which then responds to the student
- This keeps kids safe — no shell access, no arbitrary code, just math expressions

### Backend: Single Vercel serverless function
- Already deployed on Vercel, so this is free infrastructure
- `/api/chat` — accepts messages + problem context, returns tutor response
- Handles the tool-use loop server-side (student never sees it)
- API key stored as Vercel environment variable (`ANTHROPIC_API_KEY`)

### Frontend: Collapsible chat panel on Results screen
- "Help me understand" button on each incorrect problem
- Opens a slide-in chat panel on the right side
- Pre-seeded with the specific problem context
- Simple message list + text input, no markdown rendering needed (plain text is fine for elementary math)

---

## Files to Create/Modify

### New Files (4 files)

1. **`api/chat.ts`** — Vercel serverless function
   - Accepts: `{ messages, problemContext: { display, correctAnswer, userAnswer, grade } }`
   - Calls Claude Haiku with a system prompt + `calculate` tool
   - Handles tool-use loop (max 3 iterations)
   - Returns: `{ reply: string }`
   - ~80 lines

2. **`src/components/ChatPanel.tsx`** — Chat UI component
   - Props: `{ problem, correctAnswer, userAnswer, grade, onClose }`
   - State: messages array, input text, loading
   - Auto-sends an opening message on mount ("I got [problem] wrong, I put [X] but the answer is [Y]. Can you help me understand?")
   - Sends messages to `/api/chat`
   - Simple scrollable message list + input field
   - ~100 lines

3. **`src/components/ChatPanel.css`** — Chat panel styles
   - Fixed right-side panel (slides in)
   - Responsive: full-screen overlay on mobile
   - ~80 lines

4. **`src/hooks/useChat.ts`** — Chat state management hook
   - Manages message history, loading state, error handling
   - Calls `/api/chat` endpoint
   - ~40 lines

### Modified Files (2 files)

5. **`src/components/Results.tsx`** — Add "Help me understand" buttons
   - Import ChatPanel
   - Add state for which problem is being discussed
   - Show "Help me" button on each incorrect result row
   - Render ChatPanel when a problem is selected
   - ~15 lines changed

6. **`package.json`** — Add dependencies
   - `@anthropic-ai/sdk` — Anthropic client for the serverless function
   - `mathjs` — Safe math expression evaluator

---

## System Prompt (for Claude Haiku)

```
You are a friendly, patient math tutor helping a grade {N} student understand a problem they got wrong.

The problem was: {display}
The correct answer is: {correctAnswer}
The student answered: {userAnswer}

Your job:
- Walk them through the problem step by step
- Ask them where they think they went wrong
- Use simple language appropriate for grade {N}
- Be encouraging and positive
- Use the calculate tool to verify any arithmetic before telling the student

Keep responses short (2-3 sentences). Let the student do the thinking — ask guiding questions rather than just giving the answer.
```

---

## Data Flow

```
Results screen
  └─ Student clicks "Help me" on incorrect problem #3
      └─ ChatPanel opens with problem context
          └─ Auto-sends opening message to /api/chat
              └─ Vercel function calls Claude Haiku
                  └─ Haiku may use calculate tool → mathjs evaluates → result fed back
                  └─ Haiku responds with tutoring message
              └─ Response displayed in chat
          └─ Student types follow-up → same loop
```

---

## Implementation Order

1. Install dependencies (`@anthropic-ai/sdk`, `mathjs`)
2. Create `api/chat.ts` serverless function
3. Create `src/hooks/useChat.ts`
4. Create `src/components/ChatPanel.tsx` + CSS
5. Modify `Results.tsx` to integrate ChatPanel
6. Test locally with `vercel dev`
7. Deploy with `npx vercel --prod` and set `ANTHROPIC_API_KEY` env var

---

## Cost Estimate

For a typical tutoring session (5 back-and-forth messages on one problem):
- ~2K input tokens × $0.80/M = $0.0016
- ~500 output tokens × $4/M = $0.002
- **~$0.004 per tutoring session** (~0.4 cents)
- 100 students doing 10 sessions each = ~$4 total
