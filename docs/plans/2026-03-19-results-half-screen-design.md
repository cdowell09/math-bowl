# Results Half-Screen Responsive Design

**Problem**

The results screen looks cramped at mid-width sizes when the tutor panel is open. The page stays in a two-column layout too long, while each incorrect-result row still tries to keep the problem text, answer summary, and tutor CTA on the same horizontal line. That combination causes overlap, clipping, and awkward wrapping.

**Recommended Approach**

Use a hybrid responsive adjustment:

1. Switch the results-and-tutor shell to a stacked layout earlier, at medium desktop widths instead of only at small mobile widths.
2. Let incorrect-result rows wrap more gracefully before mobile, so the answer and tutor button can move onto their own line when space is tight.

**Why This Approach**

This keeps the wide-screen experience intact, avoids a brittle compressed two-column layout at half-screen widths, and requires only CSS changes. It is the smallest fix that directly addresses the root cause rather than tweaking isolated symptoms.

**Implementation Notes**

- Update `src/index.css` responsive rules for `.results-shell`, `.results-shell--with-tutor`, and `.tutor-panel`.
- Adjust `.result-row`, `.result-answer`, and `.problem-tutor-button` so rows can wrap cleanly at intermediate widths.
- Preserve the existing mobile fixed-bottom tutor behavior.

**Testing**

- Run component tests related to results/tutor rendering.
- Run the production build to catch CSS or TypeScript regressions.
