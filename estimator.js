(function () {
  'use strict';

  // ── Material data ─────────────────────────────────────────────────────────
  var MATERIALS = {
    ABS:   { density: 1.04, price: 1500, nozzle: '240–280 °C', bed: '90–110 °C', mask: true,  props: 'Tough, impact-resistant, heat-resistant, post-processable', apps: 'Automotive parts, enclosures, functional mechanical prototypes' },
    PLA:   { density: 1.24, price: 1200, nozzle: '180–220 °C', bed: '20–60 °C',  mask: false, props: 'Easy to print, biodegradable, low warping, brittle', apps: 'Concept models, visual prototypes, educational models' },
    TPU:   { density: 1.21, price: 2000, nozzle: '260–310 °C', bed: '90–110 °C', mask: true,  props: 'Extremely strong, heat-resistant, transparent, tough to print', apps: 'Load-bearing parts, electrical housings, high-strength prototypes' },
    ASA:   { density: 1.07, price: 2000, nozzle: '240–260 °C', bed: '70–90 °C',  mask: true,  props: 'Flexible, abrasion-resistant, moisture-sensitive', apps: 'Gears, hinges, wear-resistant mechanical parts' },
    PETG:  { density: 1.27, price: 1400, nozzle: '220–250 °C', bed: '70–90 °C',  mask: true,  props: 'Strong, flexible, chemical-resistant, water-resistant', apps: 'Food containers, mechanical parts, transparent components' },
    PC:    { density: 1.20, price: 3500, nozzle: '260–310 °C', bed: '90–110 °C', mask: true,  props: 'Extremely strong, heat-resistant, transparent', apps: 'Load-bearing, electrical housings, high-strength' },
    Nylon: { density: 1.15, price: 3500, nozzle: '240–280 °C', bed: '70–110 °C', mask: true,  props: 'Extremely stiff, lightweight, high strength-to-weight', apps: 'Structural components, drone frames, automotive brackets' }
  };

  var MATERIAL_ORDER = ['ABS', 'PLA', 'TPU', 'ASA', 'PETG', 'PC', 'Nylon'];

  // ── DOM refs ──────────────────────────────────────────────────────────────
  var pillsContainer  = document.getElementById('est-pills');
  var inputL          = document.getElementById('est-l');
  var inputW          = document.getElementById('est-w');
  var inputH          = document.getElementById('est-h');
  var inputInfill     = document.getElementById('est-infill');
  var infillVal       = document.getElementById('est-infill-val');
  var inputQty        = document.getElementById('est-qty');
  var outWeight       = document.getElementById('est-out-weight');
  var outMat          = document.getElementById('est-out-mat');
  var outPower        = document.getElementById('est-out-power');
  var outTotal        = document.getElementById('est-out-total');
  var infoPanel       = document.getElementById('est-info-panel');
  var infoName        = document.getElementById('est-info-name');
  var infoMask        = document.getElementById('est-info-mask');
  var infoNozzle      = document.getElementById('est-info-nozzle');
  var infoBed         = document.getElementById('est-info-bed');
  var infoProps       = document.getElementById('est-info-props');
  var infoApps        = document.getElementById('est-info-apps');

  if (!pillsContainer) return; // Not on estimator page

  // ── State ─────────────────────────────────────────────────────────────────
  var selectedMaterial = 'PLA';

  // ── Build material pills ──────────────────────────────────────────────────
  MATERIAL_ORDER.forEach(function (name) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'material-pill' + (name === selectedMaterial ? ' selected' : '');
    btn.textContent = name;
    btn.setAttribute('aria-pressed', name === selectedMaterial ? 'true' : 'false');
    btn.addEventListener('click', function () {
      selectedMaterial = name;
      document.querySelectorAll('.material-pill').forEach(function (p) {
        p.classList.remove('selected');
        p.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('selected');
      btn.setAttribute('aria-pressed', 'true');
      updateInfoPanel();
      calculate();
    });
    pillsContainer.appendChild(btn);
  });

  // ── Infill slider live gradient ───────────────────────────────────────────
  function updateSliderGradient() {
    var pct = ((+inputInfill.value - +inputInfill.min) / (+inputInfill.max - +inputInfill.min) * 100).toFixed(1);
    inputInfill.style.setProperty('--pct', pct + '%');
    infillVal.textContent = inputInfill.value + '%';
  }
  inputInfill.addEventListener('input', function () { updateSliderGradient(); calculate(); });
  updateSliderGradient();

  // ── Inputs → recalculate ──────────────────────────────────────────────────
  [inputL, inputW, inputH, inputQty].forEach(function (el) {
    el.addEventListener('input', calculate);
  });

  // ── Cost formula ──────────────────────────────────────────────────────────
  function calculate() {
    var L       = Math.max(0, +inputL.value || 0);
    var W       = Math.max(0, +inputW.value || 0);
    var H       = Math.max(0, +inputH.value || 0);
    var infill  = Math.min(100, Math.max(10, +inputInfill.value || 20)) / 100;
    var qty     = Math.max(1, Math.round(+inputQty.value || 1));
    var mat     = MATERIALS[selectedMaterial];

    if (!mat || L === 0 || W === 0 || H === 0) {
      outWeight.textContent = '—';
      outMat.textContent    = '—';
      outPower.textContent  = '—';
      outTotal.textContent  = 'Enter dimensions';
      return;
    }

    // Volume in cm³ with shell + infill factor
    var volumeCm3   = (L * W * H / 1000) * (infill * 0.8 + 0.2);
    // Weight in grams
    var weightG     = volumeCm3 * mat.density;
    // Material cost (₹)
    var matCost     = (weightG / 1000) * mat.price * qty;
    // Power cost (₹) — rough kWh estimate × ₹8/kWh
    var powerCost   = (volumeCm3 * 0.015) * qty;
    // Base total
    var base        = matCost + powerCost + 150;
    var low         = Math.round(base * 0.8);
    var high        = Math.round(base * 1.2);

    outWeight.textContent = weightG.toFixed(1) + ' g  (×' + qty + ' = ' + (weightG * qty).toFixed(1) + ' g)';
    outMat.textContent    = '₹' + matCost.toFixed(0);
    outPower.textContent  = '₹' + powerCost.toFixed(0);
    outTotal.textContent  = '₹' + low.toLocaleString('en-IN') + ' – ₹' + high.toLocaleString('en-IN');
  }

  // ── Info panel ────────────────────────────────────────────────────────────
  function updateInfoPanel() {
    var mat = MATERIALS[selectedMaterial];
    if (!mat) { infoPanel.hidden = true; return; }

    infoPanel.hidden = false;
    infoName.childNodes[0].nodeValue = selectedMaterial + ' ';
    infoMask.textContent   = mat.mask ? 'Mask required' : 'No mask needed';
    infoMask.className     = 'mask-badge ' + (mat.mask ? 'yes' : 'no');
    infoNozzle.textContent = mat.nozzle;
    infoBed.textContent    = mat.bed;
    infoProps.textContent  = mat.props;
    infoApps.textContent   = mat.apps;
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  updateInfoPanel();
  calculate();
})();
