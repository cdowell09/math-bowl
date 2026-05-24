# Math Bowl Practice

A kid-friendly web app for practicing mental math problems based on the Mental Math Bowl competition (Grades 1-5). Features a responsive design that works on desktop, tablet, and mobile devices.

**Live Site:** https://math-bowl.vercel.app

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Features

- **10 randomized problems** per quiz
- **"Surprise Me" mode** - random problem type selection
- **Instant feedback** with score and corrections
- **Celebration animation** for perfect scores
- **Responsive design** for all screen sizes
- **Deep links** like `/grade1` open a grade directly
- **Printable worksheets** from practice selection or results
- **Optional tutor panel** on the results screen for missed problems

### Grade 1
- **Patterns** - Find the next number in the pattern
- **Add & Subtract** - Add and subtract four numbers
- **Addition** - Add two 2-digit numbers
- **Subtraction** - Subtract two 2-digit numbers

### Grade 2
- **Addition (Regrouping)** - Add two 2-digit numbers with regrouping
- **Subtraction (Regrouping)** - Subtract two 2-digit numbers with regrouping
- **Adding Money** - Count coins (Q=25¢, D=10¢, N=5¢, P=1¢)
- **Equations** - Solve for N without regrouping

### Grade 3
- **Short Division** - Division with no remainders
- **Metric Conversions** - Convert between metric units
- **Equations (Regrouping)** - Solve for N with regrouping
- **Mixed Operations** - Multiplication and addition combined

### Grade 4
- **Equations (Negative)** - Solve for N with negative numbers
- **Multiplication** - Multiply two-digit by one-digit numbers
- **Decimals** - Add and subtract decimal numbers
- **Elapsed Time** - Calculate time between two times

### Grade 5
- **Order of Operations** - Expressions with exponents and mixed operations
- **Equations (Decimals)** - Solve for N with positive/negative decimals
- **Finding the Mean** - Calculate the average of a set of numbers
- **Solving for x** - Solve linear equations for x

## Project Structure

```
src/
├── components/     # React components (Quiz, Results, Celebration, etc.)
├── data/grades/    # Grade configurations
├── generators/     # Problem generators by grade
├── types/          # TypeScript types
└── index.css       # Global styles with responsive breakpoints
```

## Adding New Problem Types

1. Create a generator in `src/generators/grade{N}/`:
```typescript
import { Problem } from '../../types';

export function generateMyProblem(): Problem {
  return {
    id: crypto.randomUUID(),
    display: "2 + 2 =",
    answer: 4,
    type: 'myProblem'
  };
}
```

2. Add to grade config in `src/data/grades/grade{N}.ts`
3. The new problem type will automatically appear in the UI

## Results Tutor

The results tutor is gated by an environment flag so rollout can stay controlled.

1. Add these values to your local `.env` file:

```bash
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.1-flash-lite-preview
GEMINI_TIMEOUT_MS=12000
VITE_ENABLE_RESULTS_TUTOR=true
VITE_ENABLE_TUTOR_TTS=true
```

2. For the full tutor flow, start the app with `npx vercel dev` so the `/api/tutor` route is available locally.
3. If you only run `npm run dev`, you will still see the frontend, but the tutor panel cannot fetch responses because Vite does not serve the API route.
4. Finish a quiz and open a missed problem from the `Results` screen to launch the tutor panel.
5. Use `Read aloud` in Torch to lazy-load Kokoro in the browser and hear the latest tutor reply. If Kokoro fails to load, Torch falls back to the device voice for that attempt.

The tutor backend uses `gemini-3.1-flash-lite-preview` with Gemini thinking set to `low` for faster explanations.

If Gemini times out or returns an invalid response, the backend falls back to a short safe explanation that still includes the correct answer.

For validation, run:

```bash
npm test
npm run build
```
