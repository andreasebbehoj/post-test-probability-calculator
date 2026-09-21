# Post-test Probability Calculator

A self-contained educational calculator accompanying a scientific manuscript about diagnostic test interpretation. It demonstrates how pre-test probability, sensitivity, specificity, and test result combine to determine post-test probability.

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

## GitHub Pages

The intended repository is `https://github.com/andreasebbehoj/post-test-probability-calculator`. GitHub Pages can deploy the root of the `main` branch because the project is static HTML, CSS, and JavaScript.

Expected public URL:

`https://andreasebbehoj.github.io/post-test-probability-calculator/`

### Manual publication

If the repository does not yet exist, create an empty public repository named `post-test-probability-calculator` under the `andreasebbehoj` GitHub account. Then run these commands from this project directory:

```powershell
git init -b main
git add index.html styles.css script.js README.md LICENSE
git commit -m "Create post-test probability calculator"
git remote add origin https://github.com/andreasebbehoj/post-test-probability-calculator.git
git push -u origin main
```

In GitHub, open **Settings > Pages**, choose **Deploy from a branch**, select `main` and `/ (root)`, and press **Save**. The site will then be available at the expected URL above after GitHub finishes the workflow.

## Project status

Educational calculator accompanying a scientific manuscript. It is supplementary material and does not provide medical advice.
