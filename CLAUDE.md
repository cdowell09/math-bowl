# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Git

Use conventional commit format: `type(scope): description`

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## Commands

```bash
npm run dev      # Start dev server at http://localhost:5173
npm run build    # Type-check and build for production
npm run preview  # Preview production build
```

## Architecture

This is a React + TypeScript + Vite app for practicing Mental Math Bowl competition problems (Grades 1-5).

### Core Types (`src/types/index.ts`)

- **Problem**: Individual math problem with `display` (question string), `answer` (number), and `type`
- **ProblemType**: Category of problems with a `generate()` function that creates Problems
- **GradeConfig**: Grade-level configuration containing an array of ProblemTypes

### Components (`src/components/`)

- **GradeSelector**: Grid of grade buttons (1-5)
- **ProblemTypeSelector**: "Surprise Me" button + grid of problem type cards
- **Quiz**: Displays 10 problems with answer inputs
- **Results**: Score display with correct/incorrect breakdown
- **Celebration**: Flying animal animation for perfect scores

### Data Flow

1. `App.tsx` holds the `grades` array - add new GradeConfigs here
2. User selects Grade → ProblemType → takes Quiz (10 problems)
3. Each ProblemType has a `generate()` function that returns a randomized Problem

### Styling (`src/index.css`)

Plain CSS with responsive breakpoints:
- **1024px+**: Large desktop (3-column grade grid)
- **769px+**: Desktop/large tablet (2-column grids)
- **481-768px**: Tablet portrait
- **480px and below**: Mobile (stacked layout)
- **360px and below**: Very small mobile

### Adding New Grades

1. Create generators in `src/generators/grade{N}/` - each exports a `generate*(): Problem` function
2. Create grade config in `src/data/grades/grade{N}.ts` that imports generators and defines ProblemTypes
3. Import and add to `grades` array in `src/App.tsx`

### Generator Pattern

Generators must return a `Problem` with a unique `id` (use `crypto.randomUUID()`), a `display` string showing the question, and the numeric `answer`.
