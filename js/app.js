/* ==========================================================================
   OP Learning Lead — programme customisation tool — app logic
   Forked from the main Learning Lead Reference tool, OP-only. No landing
   fork (this tool is single-purpose), no CP code, no yes/no verdict — the
   Learning Lead is already in place for this tool's audience. Step 01
   selects which needs apply; Step 03's hours are driven directly by that
   selection instead of a Full/Refresh/Light-Touch scenario percentage.
   ========================================================================== */

(function () {
  'use strict';

  function fmt(n) {
    return (Math.round(n * 10) / 10).toString();
  }

  /* ---------------------------------------------------------------------
     Tab navigation
     --------------------------------------------------------------------- */
  const tabBtns = document.querySelectorAll('.tab-btn');
  const panels = {
    decide: document.getElementById('panel-decide'),
    match: document.getElementById('panel-match'),
    cost: document.getElementById('panel-cost'),
  };

  function activateTab(name) {
    tabBtns.forEach(btn => {
      const active = btn.dataset.tab === name;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    Object.keys(panels).forEach(key => {
      const active = key === name;
      panels[key].classList.toggle('is-active', active);
      panels[key].hidden = !active;
    });
    if (name === 'match' && !leadsLoaded) loadLeads();
    if (name === 'cost') renderCostOP();
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => activateTab(btn.dataset.tab));
  });

  /* ---------------------------------------------------------------------
     PANEL 1 — What does this programme need
     --------------------------------------------------------------------- */

  const opCriteriaSelected = new Set();
  const opCriteriaListEl = document.getElementById('op-criteria-list');
  const opCriteriaCountLabel = document.getElementById('op-criteria-count-label');
  const verdictReasons = document.getElementById('verdict-reasons');
  const reasonEmpty = document.getElementById('reason-empty');
  const flagshipHint = document.getElementById('flagship-hint');

  OP_CRITERIA.forEach(crit => {
    const row = document.createElement('div');
    row.className = 'criterion';
    row.setAttribute('role', 'checkbox');
    row.setAttribute('aria-checked', 'false');
    row.tabIndex = 0;
    row.innerHTML = `
      <div class="criterion-box"></div>
      <div class="criterion-text"><strong>${crit.title}</strong><span>${crit.desc}</span></div>
    `;
    function toggle() {
      const checked = opCriteriaSelected.has(crit.id);
      if (checked) { opCriteriaSelected.delete(crit.id); } else { opCriteriaSelected.add(crit.id); }
      row.classList.toggle('is-checked', !checked);
      row.setAttribute('aria-checked', String(!checked));
      renderNeeds();
      renderCostOP();
    }
    row.addEventListener('click', toggle);
    row.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
    opCriteriaListEl.appendChild(row);
  });

  function renderNeeds() {
    const n = opCriteriaSelected.size;
    opCriteriaCountLabel.textContent = `${n} selected`;

    verdictReasons.innerHTML = '';
    if (n === 0) {
      verdictReasons.appendChild(reasonEmpty);
    } else {
      opCriteriaSelected.forEach(id => {
        const crit = OP_CRITERIA.find(c => c.id === id);
        const li = document.createElement('li');
        li.textContent = crit.title;
        verdictReasons.appendChild(li);
      });
    }

    flagshipHint.hidden = !opCriteriaSelected.has('flagship');
  }

  renderNeeds();

  /* ---------------------------------------------------------------------
     PANEL 2 — Which Learning Lead (unchanged from the main tool)
     --------------------------------------------------------------------- */

  let leadsLoaded = false;
  let allLeads = [];
  let allSectorRows = [];
  let activeSector = null;

  function loadLeads() {
    fetch('assets/leads-data.json')
      .then(r => r.json())
      .then(data => {
        allLeads = data.leads;
        allSectorRows = data.sectorRows;
        leadsLoaded = true;
        renderSectorChips();
        renderLeads();
        renderSectorTable();
      })
      .catch(err => {
        document.getElementById('leads-grid').innerHTML =
          '<p class="no-results">Could not load the Learning Lead profiles. Check that assets/leads-data.json is present.</p>';
        console.error(err);
      });
  }

  function renderSectorChips() {
    const container = document.getElementById('sector-chips');
    container.innerHTML = '';
    allSectorRows.forEach(row => {
      const chip = document.createElement('button');
      chip.className = 'sector-chip';
      chip.type = 'button';
      chip.textContent = row.sector;
      chip.addEventListener('click', () => {
        activeSector = activeSector === row.sector ? null : row.sector;
        container.querySelectorAll('.sector-chip').forEach(c => c.classList.remove('is-active'));
        if (activeSector) chip.classList.add('is-active');
        renderLeads();
      });
      container.appendChild(chip);
    });
  }

  function renderSectorTable() {
    const el = document.getElementById('sector-table');
    el.innerHTML = allSectorRows.map(row => `
      <div class="sector-row">
        <div class="sector-row-name">${row.sector}</div>
        <div class="sector-row-people">${row.names}</div>
      </div>
    `).join('');
  }

  function nameVariants(fullName) {
    const variants = [fullName];
    const m = fullName.match(/^(\S+)\s*\(([^)]+)\)\s*(.+)$/);
    if (m) {
      const [, first, nick, rest] = m;
      variants.push(`${first} ${rest}`.trim());
      variants.push(`${nick} ${rest}`.trim());
    }
    return variants;
  }

  function leadMatchesSector(lead, sectorName) {
    const row = allSectorRows.find(r => r.sector === sectorName);
    if (!row) return true;
    return nameVariants(lead.name).some(v => row.names.includes(v));
  }

  function renderLeads() {
    const grid = document.getElementById('leads-grid');
    const query = document.getElementById('lead-search').value.trim().toLowerCase();

    const haystack = (lead) => [
      lead.name, lead.tagline,
      ...lead.sections.flatMap(s => s.bullets),
      ...lead.tags
    ].join(' ').toLowerCase();

    grid.innerHTML = '';
    let shown = 0;
    allLeads.forEach(lead => {
      const matchesQuery = !query || haystack(lead).includes(query);
      const matchesSector = !activeSector || leadMatchesSector(lead, activeSector);
      if (!matchesQuery || !matchesSector) return;
      shown++;
      const card = document.createElement('div');
      card.className = 'lead-card';
      card.innerHTML = `
        <div class="lead-head">
          <img class="lead-photo" src="${lead.photo}" alt="" loading="lazy">
          <div>
            <div class="lead-name">${lead.name}</div>
            <div class="lead-tagline">${lead.tagline}</div>
          </div>
        </div>
        ${lead.sections.map(s => `
          <div class="lead-section">
            <div class="lead-section-label">${s.label}</div>
            <ul class="lead-bullets">${s.bullets.map(b => `<li>${b}</li>`).join('')}</ul>
          </div>
        `).join('')}
        <div class="lead-tags">${lead.tags.map(t => `<span class="lead-tag">${t}</span>`).join('')}</div>
      `;
      grid.appendChild(card);
    });
    if (shown === 0) {
      grid.innerHTML = '<p class="no-results">No Learning Leads match that search. Try a different term or clear the sector filter.</p>';
    }
  }

  document.getElementById('lead-search').addEventListener('input', () => { if (leadsLoaded) renderLeads(); });

  /* ---------------------------------------------------------------------
     PANEL 3 — Hours & cost, driven by Step 01's selected needs
     Total = sum of Full Engagement hours for every task whose criterion is
     ticked. No Refresh/Light-Touch percentage is applied on top — Ali
     confirmed the needs selection replaces the percentage tier entirely,
     it shouldn't discount twice for the same thing.
     --------------------------------------------------------------------- */

  const opRateInput = document.getElementById('op-rate-input');
  opRateInput.addEventListener('input', () => renderCostOP());

  let lastOPCostSnapshot = null;

  function renderCostOP() {
    const selected = opCriteriaSelected;

    // Selected-needs summary chips (top of the tab, mirrors Step 01)
    const summaryEl = document.getElementById('op-selected-summary');
    if (selected.size === 0) {
      summaryEl.innerHTML = '<p class="control-hint">No needs selected yet — go to Step 01.</p>';
    } else {
      summaryEl.innerHTML = [...selected].map(id => {
        const c = OP_CRITERIA.find(x => x.id === id);
        return `<div class="op-scenario-card is-active" style="cursor:default;"><div class="op-scenario-head"><span class="op-scenario-title">${c.title}</span></div></div>`;
      }).join('');
    }

    const relevantTasks = OP_TASKS.filter(t => selected.has(t.criterion));
    const total = relevantTasks.reduce((a, t) => a + t.full, 0);
    const rnd = Math.round(total * 10) / 10;
    const pct = OP_FULL_BASELINE > 0 ? Math.round((rnd / OP_FULL_BASELINE) * 100) : 0;

    document.getElementById('op-hours-total').textContent = fmt(rnd);
    document.getElementById('op-hours-tag').textContent = `${selected.size} of 6 needs selected`;
    document.getElementById('op-hours-diff').textContent = `${fmt(rnd)} hrs`;
    document.getElementById('op-hours-pct').textContent = `${fmt(rnd)} hrs of ${OP_FULL_BASELINE} hrs if every need applied (${pct}%)`;

    const rate = Number(opRateInput.value) || 0;
    const rateValueEl = document.getElementById('op-rate-fee-value');
    if (rate > 0) {
      const rand = Math.round(rnd * rate);
      rateValueEl.innerHTML = `R${rand.toLocaleString('en-ZA')} <span>at R${rate.toLocaleString('en-ZA')}/hr \u00d7 ${fmt(rnd)} hrs</span>`;
    } else {
      rateValueEl.innerHTML = 'Enter a rate to calculate <span>&nbsp;</span>';
    }

    // Effort distribution + category chips, grouped by need (criterion),
    // not by responsibility category — the point of this tab is to show
    // the link back to what was ticked in Step 01.
    const critTot = {};
    relevantTasks.forEach(t => { critTot[t.criterion] = (critTot[t.criterion] || 0) + t.full; });
    const barsCard = document.getElementById('op-bars-card');
    barsCard.innerHTML = '<div class="metric-label" style="margin-bottom:10px;">Effort by need</div>' +
      OP_CRITERIA.filter(c => critTot[c.id]).map(c => {
        const v = critTot[c.id];
        const p = rnd > 0 ? Math.round((v / rnd) * 100) : 0;
        const col = OP_CRIT_COLORS[c.id];
        return `<div class="bar-row"><div class="bar-meta"><span>${c.title}</span><span>${fmt(Math.round(v * 10) / 10)} hrs &nbsp;${p}%</span></div><div class="bar-track"><div class="bar-fill" style="width:${p}%;background:${col.bar};"></div></div></div>`;
      }).join('') || '<p class="control-hint">No needs selected yet — hours will appear here once you tick some in Step 01.</p>';

    document.getElementById('op-cat-chips').innerHTML = OP_CRITERIA.filter(c => critTot[c.id]).map(c => {
      const v = critTot[c.id];
      const col = OP_CRIT_COLORS[c.id];
      return `<div class="chip" style="background:${col.bg};"><div class="chip-name" style="color:${col.color};">${c.title}</div><div class="chip-hrs" style="color:${col.color};">${fmt(Math.round(v * 10) / 10)}</div></div>`;
    }).join('');

    document.getElementById('op-portfolio-note-text').textContent = OP_PORTFOLIO_NOTE;

    // Table — every task, grouped by need, in OP_CRITERIA order. Tasks
    // under a need that isn't ticked stay visible but greyed out, so the
    // full 41-hour picture is never hidden, only what's counted changes.
    const tbody = document.getElementById('op-tbody');
    let rows = '';
    OP_CRITERIA.forEach(c => {
      const tasksForCrit = OP_TASKS.filter(t => t.criterion === c.id);
      if (tasksForCrit.length === 0) return; // flagship: no tasks
      const isOn = selected.has(c.id);
      rows += `<tr class="phase-row"><td colspan="4">${c.title}${isOn ? '' : ' — not selected'}</td></tr>`;
      tasksForCrit.forEach(t => {
        rows += `<tr class="${isOn ? '' : 'is-excluded'}">
          <td>${t.task}</td>
          <td class="muted-cell">${t.note}</td>
          <td class="r">${isOn ? fmt(t.full) : '\u2014'}</td>
          <td class="muted-cell">${t.cpTask ? t.cpTask : '\u2014'}</td>
        </tr>`;
      });
    });
    tbody.innerHTML = rows;

    lastOPCostSnapshot = { selected: new Set(selected), total: rnd, rate };
  }

  document.getElementById('print-op-cost-btn').addEventListener('click', () => {
    if (!lastOPCostSnapshot) return;
    const printArea = document.getElementById('print-area');
    const s = lastOPCostSnapshot;
    const rateHtml = s.rate > 0
      ? `<p><strong>Estimated cost:</strong> R${Math.round(s.total * s.rate).toLocaleString('en-ZA')} (R${s.rate.toLocaleString('en-ZA')}/hr \u00d7 ${fmt(s.total)} hrs \u2014 rate as entered in the tool)</p>`
      : '<p><strong>Estimated cost:</strong> not calculated \u2014 no rate was entered.</p>';
    const needsHtml = s.selected.size
      ? '<ul>' + [...s.selected].map(id => `<li>${OP_CRITERIA.find(c => c.id === id).title}</li>`).join('') + '</ul>'
      : '<p>None selected.</p>';
    const relevantTasks = OP_TASKS.filter(t => s.selected.has(t.criterion));
    const rowsHtml = relevantTasks.map(t => `<tr><td>${OP_CRITERIA.find(c => c.id === t.criterion).title}</td><td>${t.task}</td><td>${fmt(t.full)}</td></tr>`).join('');

    printArea.innerHTML = `
      <h1>OP Learning Lead \u2014 needs &amp; hours summary</h1>
      <div class="print-meta">Generated ${new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })} \u00b7 GIBS internal reference tool</div>

      <h2>Needs that apply (${s.selected.size} of 6)</h2>
      ${needsHtml}

      <h2>Result</h2>
      <p><strong>Total hours:</strong> ${fmt(s.total)} of ${OP_FULL_BASELINE} hrs if every need applied</p>
      ${rateHtml}

      <h2>Task-by-task breakdown</h2>
      <table><thead><tr><th>Need</th><th>Task</th><th>Hours</th></tr></thead><tbody>${rowsHtml}</tbody></table>

      <p class="print-caveat">Hours are from the OP Learning Lead Calculator (.xlsx, 06/11/2025). The needs-to-task mapping is a working agreement between PAL and the OP SPM, not yet a published document \u2014 confirm the actual fee and scope with PAL before using this in a client-facing document.</p>
    `;
    window.print();
  });

  /* ---------------------------------------------------------------------
     Initial render
     --------------------------------------------------------------------- */
  renderCostOP();

})();
