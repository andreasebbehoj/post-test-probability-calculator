# Post-test Probability Calculator

This calculator is an appendix to the paper "Interpreting diagnostic test results - Why prior probabilities matter" (2026) by Dekkers O, Ebbehoj A and Groenwold R.

Working calculator: https://andreasebbehoj.github.io/post-test-probability-calculator/

It is an educational calculator accompanying the paper and does not provide medical advice. It demonstrates how pre-test probability, sensitivity, specificity, and test result combine to determine post-test probability.

## Features

- Positive and negative test calculations
- Editable pre-test probability, sensitivity, and specificity
- Optional pre-test probability range
- Natural-frequency explanation for 1,000 hypothetical similar patients
- Expandable formula substitution
- Responsive, dependency-free SVG probability curve
- All calculations run locally in the browser; no data are transmitted or stored

## Formulas

For a positive test:

`P(Disease | Positive) = (Sensitivity * Prior) / ((Sensitivity * Prior) + ((1 - Specificity) * (1 - Prior)))`

For a negative test:

`P(Disease | Negative) = ((1 - Sensitivity) * Prior) / (((1 - Sensitivity) * Prior) + (Specificity * (1 - Prior)))`

The implementation uses probabilities from 0 to 1 internally and presents percentages in the interface. Undefined zero-denominator cases are reported rather than displaying invalid numbers.

## Run locally

Open `index.html` directly in a browser. No build step, package manager, or server is required.

## Publishing the repository yourself

To create a working copy, copy the repository to your computer and open `index.html` in a browser. The project is intentionally self-contained: no package manager, build step, backend, or external dependency is required.

```powershell
git clone https://github.com/andreasebbehoj/post-test-probability-calculator.git
cd post-test-probability-calculator
start index.html
```

The calculator runs entirely in the browser. It does not transmit or store user-entered data.
