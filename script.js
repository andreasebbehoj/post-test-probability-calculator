(() => {
  'use strict';

  const elements = {
    priorNumber: document.querySelector('#prior-number'),
    priorSlider: document.querySelector('#prior-range'),
    priorMin: document.querySelector('#prior-min'),
    priorMax: document.querySelector('#prior-max'),
    rangeToggle: document.querySelector('#range-toggle'),
    rangeFields: document.querySelector('#prior-range-fields'),
    sensitivity: document.querySelector('#sensitivity'),
    specificity: document.querySelector('#specificity'),
    resultValue: document.querySelector('#result-value'),
    resultContext: document.querySelector('#result-context'),
    resultError: document.querySelector('#result-error'),
    priorMarker: document.querySelector('#prior-marker'),
    posteriorMarker: document.querySelector('#posterior-marker'),
    priorMarkerLabel: document.querySelector('#prior-marker-label'),
    posteriorMarkerLabel: document.querySelector('#posterior-marker-label'),
    curveDetails: document.querySelector('#curve-details'),
    frequencyContent: document.querySelector('#frequency-content'),
    formulaContent: document.querySelector('#formula-content'),
    chart: document.querySelector('#probability-chart'),
    priorError: document.querySelector('#prior-error'),
    rangeError: document.querySelector('#range-error'),
    sensitivityError: document.querySelector('#sensitivity-error'),
    specificityError: document.querySelector('#specificity-error')
  };

  const state = { result: 'positive' };
  const percent = (value, digits = 1) => `${(value * 100).toFixed(digits)}%`;
  const displayNumber = (value) => Number.isInteger(value) ? String(value) : value.toFixed(1);
  const clamp = (value) => Math.min(100, Math.max(0, value));

  function readPercentage(input, errorElement, label) {
    const raw = input.value.trim();
    if (raw === '') {
      errorElement.textContent = `${label} is required.`;
      return null;
    }
    const value = Number(raw);
    if (!Number.isFinite(value) || value < 0 || value > 100) {
      errorElement.textContent = `${label} must be between 0% and 100%.`;
      return null;
    }
    errorElement.textContent = '';
    return value / 100;
  }

  function posterior(prior, sensitivity, specificity, result) {
    const numerator = result === 'positive' ? sensitivity * prior : (1 - sensitivity) * prior;
    const comparator = result === 'positive' ? (1 - specificity) : specificity;
    const denominator = numerator + comparator * (1 - prior);
    return denominator === 0 ? null : numerator / denominator;
  }

  function readState() {
    const sensitivity = readPercentage(elements.sensitivity, elements.sensitivityError, 'Sensitivity');
    const specificity = readPercentage(elements.specificity, elements.specificityError, 'Specificity');
    let prior;
    let priorMin;
    let priorMax;

    if (elements.rangeToggle.checked) {
      priorMin = readPercentage(elements.priorMin, elements.rangeError, 'Minimum probability');
      priorMax = readPercentage(elements.priorMax, elements.rangeError, 'Maximum probability');
      if (priorMin !== null && priorMax !== null && priorMin > priorMax) {
        elements.rangeError.textContent = 'Minimum probability cannot exceed maximum probability.';
      }
      prior = priorMin;
    } else {
      prior = readPercentage(elements.priorNumber, elements.priorError, 'Pre-test probability');
      priorMin = prior;
      priorMax = prior;
    }

    return { prior, priorMin, priorMax, sensitivity, specificity, valid: [prior, priorMin, priorMax, sensitivity, specificity].every((value) => value !== null) && priorMin <= priorMax };
  }

  function setMarker(marker, value) {
    marker.style.left = `${clamp(value * 100)}%`;
  }

  function formulaMarkup(sensitivity, specificity, prior) {
    const priorText = percent(prior, 1);
    const sensitivityText = percent(sensitivity, 1);
    const specificityText = percent(specificity, 1);
    const falseRate = percent(1 - specificity, 1);
    const missRate = percent(1 - sensitivity, 1);
    const positive = state.result === 'positive';
    const numerator = positive ? sensitivity * prior : (1 - sensitivity) * prior;
    const denominator = positive ? numerator + (1 - specificity) * (1 - prior) : numerator + specificity * (1 - prior);
    const title = positive ? 'P(Disease | Positive)' : 'P(Disease | Negative)';
    const symbolic = positive
      ? '<span class="fraction"><span class="top">Sensitivity &times; Prior</span><span class="bottom">Sensitivity &times; Prior + (1 &minus; Specificity) &times; (1 &minus; Prior)</span></span>'
      : '<span class="fraction"><span class="top">(1 &minus; Sensitivity) &times; Prior</span><span class="bottom">(1 &minus; Sensitivity) &times; Prior + Specificity &times; (1 &minus; Prior)</span></span>';
    const substituted = positive
      ? `<span class="fraction"><span class="top">${sensitivityText} &times; ${priorText}</span><span class="bottom">${sensitivityText} &times; ${priorText} + ${falseRate} &times; ${percent(1 - prior, 1)}</span></span>`
      : `<span class="fraction"><span class="top">${missRate} &times; ${priorText}</span><span class="bottom">${missRate} &times; ${priorText} + ${specificityText} &times; ${percent(1 - prior, 1)}</span></span>`;
    return `<p>For this ${positive ? 'positive' : 'negative'} test:</p><div class="formula"><div class="formula-line"><strong>${title}</strong> = ${symbolic}</div><div class="formula-line">= ${substituted}</div><div class="formula-line formula-result">= ${percent(posterior(prior, sensitivity, specificity, state.result), 1)}</div></div>`;
  }

  function frequencyMarkup(prior, sensitivity, specificity) {
    const disease = prior * 1000;
    const noDisease = (1 - prior) * 1000;
    const truePositive = disease * sensitivity;
    const falseNegative = disease * (1 - sensitivity);
    const trueNegative = noDisease * specificity;
    const falsePositive = noDisease * (1 - specificity);
    const positiveCount = truePositive + falsePositive;
    const negativeCount = falseNegative + trueNegative;
    const diseaseAfter = state.result === 'positive' ? truePositive : falseNegative;
    const totalAfter = state.result === 'positive' ? positiveCount : negativeCount;
    const result = posterior(prior, sensitivity, specificity, state.result);
    const relevant = state.result === 'positive' ? 'positive test' : 'negative test';
    const cell = (label, value) => `<span class="frequency-cell-label">${label}</span><span class="frequency-cell-value">${displayNumber(value)}</span>`;
    return `<p class="frequency-lead">Imagine 1,000 patients similar to this patient. These are expected numbers, not observed counts.</p><table class="frequency-table"><thead><tr><th></th><th>Test positive</th><th>Test negative</th></tr></thead><tbody><tr><th scope="row">Disease</th><td>${cell('True positive', truePositive)}</td><td>${cell('False negative', falseNegative)}</td></tr><tr><th scope="row">No disease</th><td>${cell('False positive', falsePositive)}</td><td>${cell('True negative', trueNegative)}</td></tr></tbody></table><p class="frequency-conclusion">Among all patients with a ${relevant}, <strong>${displayNumber(diseaseAfter)} out of ${displayNumber(totalAfter)}</strong> would be expected to have the disease. This corresponds to a post-test probability of <strong>${percent(result, 1)}</strong>.</p>`;
  }

  function drawChart(data) {
    const svg = elements.chart;
    const plot = { left: 62, top: 22, width: 620, height: 290 };
    const x = (value) => plot.left + value * plot.width;
    const y = (value) => plot.top + (1 - value) * plot.height;
    const path = data.points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${x(point.prior).toFixed(2)} ${y(point.post).toFixed(2)}`).join(' ');
    const grid = [0, .25, .5, .75, 1].map((tick) => `<line class="chart-grid" x1="${plot.left}" y1="${y(tick)}" x2="${plot.left + plot.width}" y2="${y(tick)}"/><line class="chart-grid" x1="${x(tick)}" y1="${plot.top}" x2="${x(tick)}" y2="${plot.top + plot.height}"/>`).join('');
    const labels = [0, 25, 50, 75, 100].map((tick) => `<text class="chart-label" x="${x(tick / 100)}" y="${plot.top + plot.height + 25}" text-anchor="middle">${tick}%</text><text class="chart-label" x="${plot.left - 12}" y="${y(tick / 100) + 4}" text-anchor="end">${tick}%</text>`).join('');
    const range = data.range ? `<rect class="chart-range" x="${x(data.range[0])}" y="${plot.top}" width="${Math.max(1, x(data.range[1]) - x(data.range[0]))}" height="${plot.height}"/>` : '';
    const marker = `<circle class="chart-marker" cx="${x(data.selectedPrior)}" cy="${y(data.selectedPost)}" r="6"><title>Selected: ${percent(data.selectedPrior, 1)} pre-test, ${percent(data.selectedPost, 1)} post-test</title></circle>`;
    svg.innerHTML = `<title id="chart-title">Post-test probability curve</title><desc id="chart-desc">The curve maps pre-test probability to post-test probability for the selected test result.</desc>${grid}${range}<line class="chart-axis" x1="${plot.left}" y1="${plot.top + plot.height}" x2="${plot.left + plot.width}" y2="${plot.top + plot.height}"/><line class="chart-axis" x1="${plot.left}" y1="${plot.top}" x2="${plot.left}" y2="${plot.top + plot.height}"/><path class="chart-curve" d="${path}"/>${marker}${labels}<text class="chart-axis-label" x="${plot.left + plot.width / 2}" y="${plot.top + plot.height + 51}" text-anchor="middle">Pre-test probability</text><text class="chart-axis-label" x="16" y="${plot.top + plot.height / 2}" transform="rotate(-90 16 ${plot.top + plot.height / 2})" text-anchor="middle">Post-test probability</text>`;
  }

  function updateChart(sensitivity, specificity, priorMin, priorMax) {
    const points = Array.from({ length: 101 }, (_, index) => {
      const prior = index / 100;
      return { prior, post: posterior(prior, sensitivity, specificity, state.result) };
    }).filter((point) => point.post !== null);
    const selectedPrior = (priorMin + priorMax) / 2;
    const selectedPost = posterior(selectedPrior, sensitivity, specificity, state.result);
    drawChart({ points, selectedPrior, selectedPost, range: elements.rangeToggle.checked ? [priorMin, priorMax] : null });
  }

  function update() {
    elements.rangeFields.hidden = !elements.rangeToggle.checked;
    elements.curveDetails.hidden = !elements.rangeToggle.checked;
    const data = readState();
    elements.priorSlider.value = String((data.priorMin ?? Number(elements.priorNumber.value) / 100) * 100);
    elements.priorSlider.disabled = elements.rangeToggle.checked;
    elements.priorNumber.disabled = elements.rangeToggle.checked;
    if (!data.valid) {
      elements.resultValue.textContent = '—';
      elements.resultContext.textContent = 'Enter valid values to calculate a result.';
      elements.resultError.textContent = 'The result cannot be calculated until the inputs are valid.';
      elements.frequencyContent.innerHTML = '';
      elements.formulaContent.innerHTML = '';
      return;
    }
    elements.resultError.textContent = '';
    const low = posterior(data.priorMin, data.sensitivity, data.specificity, state.result);
    const high = posterior(data.priorMax, data.sensitivity, data.specificity, state.result);
    const selected = posterior((data.priorMin + data.priorMax) / 2, data.sensitivity, data.specificity, state.result);
    if (low === null || high === null || selected === null) {
      elements.resultValue.textContent = '—';
      elements.resultContext.textContent = 'These inputs produce a mathematically undefined result.';
      elements.resultError.textContent = 'The calculation is undefined for this combination of inputs.';
      return;
    }
    const isRange = elements.rangeToggle.checked && data.priorMin !== data.priorMax;
    elements.resultValue.textContent = isRange ? `${percent(low, 1)}–${percent(high, 1)}` : percent(selected, 1);
    elements.resultContext.textContent = isRange ? `With this ${state.result} test, the post-test probability spans ${percent(low, 1)} to ${percent(high, 1)} across the selected prior range.` : `After a ${state.result} test, the probability of disease is ${percent(selected, 1)}.`;
    setMarker(elements.priorMarker, (data.priorMin + data.priorMax) / 2);
    setMarker(elements.posteriorMarker, selected);
    elements.priorMarkerLabel.textContent = isRange ? `${percent(data.priorMin, 1)}–${percent(data.priorMax, 1)}` : percent(data.priorMin, 1);
    elements.posteriorMarkerLabel.textContent = isRange ? `${percent(low, 1)}–${percent(high, 1)}` : percent(selected, 1);
    elements.frequencyContent.innerHTML = frequencyMarkup((data.priorMin + data.priorMax) / 2, data.sensitivity, data.specificity);
    elements.formulaContent.innerHTML = formulaMarkup(data.sensitivity, data.specificity, (data.priorMin + data.priorMax) / 2);
    updateChart(data.sensitivity, data.specificity, data.priorMin, data.priorMax);
  }

  elements.priorSlider.addEventListener('input', () => { elements.priorNumber.value = elements.priorSlider.value; update(); });
  elements.priorNumber.addEventListener('input', () => { if (Number.isFinite(Number(elements.priorNumber.value))) elements.priorSlider.value = String(clamp(Number(elements.priorNumber.value))); update(); });
  [elements.priorMin, elements.priorMax, elements.sensitivity, elements.specificity].forEach((input) => input.addEventListener('input', update));
  elements.rangeToggle.addEventListener('change', update);
  document.querySelectorAll('[data-result]').forEach((button) => button.addEventListener('click', () => {
    state.result = button.dataset.result;
    document.querySelectorAll('[data-result]').forEach((candidate) => { const selected = candidate === button; candidate.classList.toggle('is-selected', selected); candidate.setAttribute('aria-pressed', String(selected)); });
    update();
  }));
  update();
})();
