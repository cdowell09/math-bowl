# Math Bowl Practice

A kid-friendly web app for practicing mental math problems based on the Mental Math Bowl competition (Grades 1-5).

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Current Features

**Grade 1:**
- Patterns (find next number in sequence)
- Add & Subtract (four single-digit operations)
- Addition (two-digit, no regrouping)
- Subtraction (two-digit, no regrouping)

## Adding New Grades

1. Create generators in `src/generators/grade{N}/`
2. Create grade config in `src/data/grades/grade{N}.ts`
3. Import and add to `grades` array in `src/App.tsx`

Example generator:
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

## Project Structure

```
src/
├── components/     # React components
├── data/grades/    # Grade configurations
├── generators/     # Problem generators by grade
└── types/          # TypeScript types
```
