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
