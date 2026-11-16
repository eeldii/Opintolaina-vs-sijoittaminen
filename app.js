// Included after the unchanged engine in the generated standalone page.
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const form = $('calculator');
  const euro = new Intl.NumberFormat('fi-FI', { style: 'currency', currency: 'EUR' });
  const date = iso => new Intl.DateTimeFormat('fi-FI', { timeZone: 'UTC' }).format(new Date(`${iso}T00:00:00Z`));
  const rates = new Set(['annualLoanRate', 'annualInvestmentReturn', 'purchaseFeeRate', 'saleFeeRate']);
  const labels = Object.fromEntries([...form.querySelectorAll('input[name]')].map(input =>
    [input.name, form.querySelector(`label[for="${input.id}"]`).textContent.replace(/(?:€\/kk|€|%|kk)\s*$/, '').trim()]));
  let current = null;
  let timer;
  let chartGeometry = { left: 70, right: 850 };
  let tableDirty = true;
  let zeroTest = false;
  const monthLabel = month => new Intl.DateTimeFormat('fi-FI', {month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(`${month}-01T00:00:00Z`));
  for (const id of ['startMonth','endMonth']) {
    $(id).replaceChildren(...Array.from({length:12},(_,i) => {
      const month=String(i+1).padStart(2,'0');
      const option = document.createElement('option'); option.value = month;
      option.textContent = new Intl.DateTimeFormat('fi-FI',{month:'long',timeZone:'UTC'}).format(new Date(`2000-${month}-01T00:00:00Z`)); return option;
    }));
  }
  const firstYear=EARLIEST_START_YEAR;
  const lastYear=Number(SP500_DATA.rows.at(-1)[0].slice(0,4));
  for (const id of ['startYear','endYear']) $(id).replaceChildren(...Array.from({length:lastYear-firstYear+1},(_,i)=>{
    const option=document.createElement('option');option.value=String(firstYear+i);option.textContent=option.value;return option;
  }));
  function setPeriod(start,end) {
    const [sy,sm]=start.split('-'),[ey,em]=end.split('-');
    $('startYear').value=sy;$('startMonth').value=sm;$('endYear').value=ey;$('endMonth').value=em;
  }
  setPeriod(`${firstYear}-01`,SP500_DATA.rows.at(-1)[0]);
  $('market-info').textContent = `Vertailtavissa ${monthLabel(`${firstYear}-01`)} – ${monthLabel(SP500_DATA.rows.at(-1)[0])}. Aloitusvuosi on vähintään ${firstYear}. Aineisto ladattu 15.11.2026; toimii ilman verkkoyhteyttä.`;
  const example = Object.fromEntries([...form.querySelectorAll('input[name]')].map(input => [input.name, input.value]));
  for(const id of ['startMonth','startYear','endMonth','endYear','scenario','returnMode']) example[id]=$(id).value;

  function syncControls() {
    const custom=$('returnMode').value==='custom';
    $('annualInvestmentReturn').disabled=!custom;
    $('custom-return-field').hidden=!custom;
    $('market-info').hidden=custom;
    $('historical-return-note').hidden=custom;
    $('full-history').hidden=custom;
    for(const prefix of ['start','end']) {
      const years=$(prefix+'Year'),months=$(prefix+'Month');
      for(const option of years.options) option.disabled=!custom && Number(option.value)>lastYear;
      if(years.selectedOptions[0]?.disabled) years.value=String(lastYear);
      const value=Number(years.value);
      const minMonth= !custom && value===firstYear ? Number(SP500_DATA.rows[0][0].slice(5)) : 1;
      const maxMonth= !custom && value===lastYear ? Number(SP500_DATA.rows.at(-1)[0].slice(5)) : 12;
      for(const option of months.options) option.disabled=Number(option.value)<minMonth || Number(option.value)>maxMonth;
      months.value=String(Math.min(maxMonth,Math.max(minMonth,Number(months.value)))).padStart(2,'0');
    }
    $('scenario-hint').textContent=$('scenario').value==='invest-loan'
      ? 'Nostettu laina lisätään molempien käytettävissä olevaan rahaan kerran. Heti maksava kuittaa velan tästä rahasta; sijoittava sijoittaa lainan ja säästöt ja maksaa velan erissä.'
      : 'Laina on jo käytetty. Vain erilliset alkusäästöt ovat käytettävissä tai sijoitettavissa.';
  }

  function readInputs() {
    const result = {};
    for (const input of form.querySelectorAll('input[name]')) {
      input.removeAttribute('aria-invalid');
      if(input.disabled) continue;
      const text = input.value.trim().replace(/[\s\u00a0\u202f]/g, '').replace(/−/g, '-').replace(',', '.');
      const value = text==='' ? 0 : /^-?(?:\d+(?:\.\d*)?|\.\d+)$/.test(text) ? Number(text) : NaN;
      let valid = Number.isFinite(value);
      let instruction = 'Anna nolla tai positiivinen luku.';
      valid &&= input.name==='annualInvestmentReturn' ? value>-100 : value>=0;
      if(input.name==='annualInvestmentReturn') instruction='Anna vuosituotto, joka on suurempi kuin −100 %. Myös negatiivinen arvo sallitaan.';
      if (['purchaseFeeRate', 'saleFeeRate'].includes(input.name)) {
        valid &&= value < 100;
        instruction = 'Anna arvo väliltä 0–alle 100 %.';
      }
      if (!valid) {
        input.setAttribute('aria-invalid', 'true');
        throw new Error(`${labels[input.name]}: ${instruction}`);
      }
      result[input.name] = rates.has(input.name) ? value / 100 : value;
    }
    result.taxMode = $('estimateTax').checked ? 'finnish-estimate' : 'none';
    const inputs = calculatorInputs({...result,
      startMonth:`${$('startYear').value}-${$('startMonth').value}`,endMonth:`${$('endYear').value}-${$('endMonth').value}`,
      returnMode:$('returnMode').value,scenario:$('scenario').value});
    if (zeroTest) inputs.monthlyReturns = Array(inputs.months).fill(0);
    return inputs;
  }

  function fail(title, paragraphs) {
    current = null;
    $('results').hidden = true;
    $('monthly-body').replaceChildren();
    $('chart').replaceChildren();
    const heading = document.createElement('h2');
    heading.textContent = title;
    const children = [heading, ...paragraphs.map(text => {
      const p = document.createElement('p');
      p.textContent = text;
      return p;
    })];
    $('error').replaceChildren(...children);
    $('error').hidden = false;
  }

  function render() {
    clearTimeout(timer);
    syncControls();
    let inputs;
    try { inputs = readInputs(); } catch (error) {
      fail('Tarkista lähtötiedot', [error.message]);
      return;
    }
    let result;
    try { result = simulateComparison(inputs); } catch {
      fail('Näillä arvoilla laskentaa ei voida tehdä', ['Tarkista lähtötiedot. Kokeile pienempää korkoa, tuottoa, rahamäärää tai lyhyempää vertailuaikaa.']);
      return;
    }
    $('period-hint').textContent = `${inputs.months} kuukautta. Alkukuukausi on päivä 0; ensimmäinen tuotto kertyy seuraavalta kuukaudelta.`;
    const custom=$('returnMode').value==='custom';
    $('chart-title').textContent = zeroTest ? 'Nettovarallisuus · nollatuottoinen testi' : custom ? 'Nettovarallisuus · oma vuosituotto' : 'Nettovarallisuus · S&P 500:n kuukausituotot';
    if (result.status !== 'complete') {
      const paragraphs = result.failure.problems.map(problem => {
        const strategy = STRATEGIES[problem.strategy];
        if (problem.code === 'INSUFFICIENT_BUDGET') {
          return `${strategy}, ${date(result.failure.date)} (kk ${result.failure.month}): tarvitset vähintään ${euro.format(problem.minimumBudget)}, eli ${euro.format(problem.shortfall)} lisää. ${problem.message}`;
        }
        return `${strategy}, ${date(result.failure.date)} (kk ${result.failure.month}): ${problem.message}`;
      });
      fail('Vertailua ei voida laskea loppuun', [...paragraphs, 'Tulosta tai voittajaa ei näytetä. Sijoituksia ei myydä eikä uutta velkaa oteta budjetin vajeen kattamiseksi.']);
      return;
    }
    current = result;
    $('error').hidden = true;
    $('results').hidden = false;
    const end = result.strategies.repayNow.final.date;
    $('end-date').textContent = `Yhteinen vertailupäivä ${date(end)}`;
    const difference = Math.abs(result.endingNetWorthDifference);
    $('difference').textContent = euro.format(difference);
    const condition=custom ? 'Omalla tuotto-oletuksella ja näillä laina- ja vero-oletuksilla' : 'Valitulla historialla ja näillä laina- ja vero-oletuksilla';
    const caveat=custom ? 'Oma tuotto on laskentaoletus, ei lupaus tulevasta.' : 'Historia ei ennusta tulevaa.';
    $('verdict-text').textContent = difference < 0.005
      ? `${condition} nettovarallisuus on sama ${date(end)}. ${caveat}`
      : `${condition} ”${STRATEGIES[result.endingNetWorthDifference > 0 ? 'repayNow' : 'investFirst']}” tuottaa ${euro.format(difference)} suuremman arvioidun nettovarallisuuden ${date(end)}. ${caveat}`;
    $('tax-mode').hidden = inputs.taxMode !== 'none';
    for (const [id, strategy] of Object.entries(result.strategies)) {
      const r = strategy.final;
      $(`${id}-net`).textContent = euro.format(r.netWorthAfterSale);
      const metrics = [
        ['Lainaa jäljellä', euro.format(r.remainingDebt)],
        ['Salkun arvo', euro.format(r.portfolioMarketValue)],
        ['Arvioitu myyntivero', euro.format(r.estimatedTaxOnSale)],
        ['Lunastuskulu myytäessä', euro.format(r.hypotheticalSaleFee)],
        ['Lainan korot yhteensä', euro.format(r.totalInterestCharged)],
        ['Toteutuneet kulut yht.', euro.format(r.totalFeesPaid)],
        ['Laina maksettu', strategy.payoffDate ? date(strategy.payoffDate) : 'Ei vertailuaikana'],
      ];
      if (r.estimatedLossWithoutTaxCredit > 0.005) metrics.push(['Tappio ilman verohyötyä', euro.format(r.estimatedLossWithoutTaxCredit)]);
      $(`${id}-metrics`).replaceChildren(...metrics.map(([label, value]) => {
        const row = document.createElement('div');
        const dt = document.createElement('dt');
        const dd = document.createElement('dd');
        dt.textContent = label; dd.textContent = value;
        row.append(dt, dd);
        return row;
      }));
    }
    $('chart-month').max = inputs.months;
    $('chart-month').value = inputs.months;
    drawChart();
    inspectMonth();
    tableDirty = true;
    if ($('monthly-details').open) renderTable();
  }

  const svgNode = (tag, attributes = {}, text = '') => {
    const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
    node.textContent = text;
    return node;
  };

  function drawChart() {
    const svg = $('chart');
    const records = Object.values(current.strategies).map(strategy => strategy.records);
    const values = records.flatMap(rows => rows.map(r => r.netWorthAfterSale));
    let min = Math.min(0, ...values), max = Math.max(0, ...values);
    if (max === min) { min -= 100; max += 100; }
    const pad = (max - min) * 0.08;
    min -= pad; max += pad;
    const width = Math.max(280, svg.clientWidth);
    const mobile = width < 500;
    const height = mobile ? 340 : 440;
    const left = mobile ? 57 : 78, right = width - (mobile ? 74 : 102), top = 26, bottom = height - 45;
    chartGeometry = { left, right };
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    const x = month => left + (right - left) * month / Math.max(1, current.inputs.months);
    const y = value => bottom - (bottom - top) * (value - min) / (max - min);
    const desc = svgNode('desc', { id: 'chart-desc' }, `Molemmat polut samalla euroasteikolla. ${current.inputs.months} kuukautta. A:n loppuarvo ${euro.format(records[0].at(-1).netWorthAfterSale)}, B:n loppuarvo ${euro.format(records[1].at(-1).netWorthAfterSale)}. Tarkat luvut kuukausivalitsimessa ja taulukossa.`);
    svg.replaceChildren(desc);
    const compact = new Intl.NumberFormat('fi-FI', { notation: 'compact', maximumFractionDigits: 0 });
    const rawStep = (max - min) / 4;
    const magnitude = 10 ** Math.floor(Math.log10(rawStep));
    const step = [1, 2, 5, 10].find(value => value * magnitude >= rawStep) * magnitude;
    for (let value = Math.ceil(min / step) * step; value <= max; value += step) {
      svg.append(svgNode('line', { x1: left, y1: y(value), x2: right, y2: y(value), stroke: '#e3e5e7' }));
      svg.append(svgNode('text', { x: left - 12, y: y(value) + 4, 'text-anchor': 'end', fill: '#555b61', 'font-size': mobile ? 10 : 12 }, `${compact.format(Math.abs(value) < step * 1e-9 ? 0 : value)} €`));
    }
    svg.append(svgNode('path', {d:`M${left},${top}V${bottom}H${right}`,fill:'none',stroke:'#353a40','stroke-width':1}));
    if (min < 0 && max > 0) svg.append(svgNode('line', { x1: left, y1: y(0), x2: right, y2: y(0), stroke: '#9aad9e', 'stroke-dasharray': '3 4' }));
    const ticks = [...new Set([0, Math.round(current.inputs.months / 2), current.inputs.months])];
    ticks.forEach(month => svg.append(svgNode('text', { x: x(month), y: height - 15, 'text-anchor': month === 0 ? 'start' : month === current.inputs.months ? 'end' : 'middle', fill: '#555b61', 'font-size': mobile ? 10 : 12 }, mobile ? records[0][month].date.slice(0,4) : date(records[0][month].date))));
    const endpointY = records.map(rows => y(rows.at(-1).netWorthAfterSale));
    if (Math.abs(endpointY[0] - endpointY[1]) < 24) {
      const middle=(endpointY[0]+endpointY[1])/2;
      const aAbove=endpointY[0]<=endpointY[1];
      endpointY[0]=middle+(aAbove?-13:13); endpointY[1]=middle+(aAbove?13:-13);
    }
    records.forEach((rows, index) => {
      const color = index === 0 ? '#dc465c' : '#169d60';
      const points = rows.map(r => `${x(r.month)},${y(r.netWorthAfterSale)}`).join(' ');
      svg.append(svgNode('polyline', { points, fill: 'none', stroke: color, 'stroke-width': 3, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
      const final = rows.at(-1);
      svg.append(svgNode('circle', { cx: x(final.month), cy: y(final.netWorthAfterSale), r: index === 0 ? 4 : 2.5, fill: color }));
      svg.append(svgNode('text', {x:right+10,y:endpointY[index]+4,fill:color,'font-size':mobile?11:14,'font-weight':600}, `${compact.format(final.netWorthAfterSale)} €`));
    });
    svg.append(svgNode('line', { id: 'chart-cursor', x1: left, x2: left, y1: top, y2: bottom, stroke: '#768d7c', 'stroke-dasharray': '2 5' }));
  }

  function inspectMonth() {
    if (!current) return;
    const month = Number($('chart-month').value);
    const a = current.strategies.repayNow.records[month];
    const b = current.strategies.investFirst.records[month];
    $('chart-month-label').textContent = `${month === 0 ? 'Päivä 0' : `Kk ${month}`} · ${date(a.date)}`;
    $('chart-a').textContent = `A · ${euro.format(a.netWorthAfterSale)}`;
    $('chart-b').textContent = `B · ${euro.format(b.netWorthAfterSale)}`;
    const x = chartGeometry.left + (chartGeometry.right - chartGeometry.left) * month / Math.max(1, current.inputs.months);
    $('chart-cursor').setAttribute('x1', x);
    $('chart-cursor').setAttribute('x2', x);
    $('chart-cursor').setAttribute('visibility', document.querySelector('.chart-inspect').open ? 'visible' : 'hidden');
  }

  function renderTable() {
    if (!current || !tableDirty) return;
    const body = document.createDocumentFragment();
    for (let month = 0; month <= current.inputs.months; month++) {
      for (const [id, label] of [['repayNow', 'A'], ['investFirst', 'B']]) {
        const r = current.strategies[id].records[month];
        const row = document.createElement('tr');
        const heading = document.createElement('th');
        heading.scope = 'row';
        heading.textContent = `${month === 0 ? 'Päivä 0' : `Kk ${month}`} · ${date(r.date)}`;
        row.append(heading);
        const cells = [label, r.month === 0 ? '—' : new Intl.NumberFormat('fi-FI',{style:'percent',maximumFractionDigits:3}).format(r.investmentReturn), ...[r.openingDebt, r.interestCharged, r.fees.loan, r.fees.initialRepayment, r.fees.purchase,
          r.loanPayment, r.remainingDebt, r.investmentContribution, r.totalInvestedCapital, r.portfolioMarketValue,
          r.hypotheticalSaleFee, r.estimatedTaxOnSale, r.netWorthAfterSale].map(value => euro.format(value))];
        for (const text of cells) {
          const cell = document.createElement('td');
          cell.textContent = text;
          row.append(cell);
        }
        body.append(row);
      }
    }
    $('monthly-body').replaceChildren(body);
    tableDirty = false;
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    for(const input of form.querySelectorAll('input[name]')) if(!input.value.trim()) input.value='0';
    render();
  });
  form.addEventListener('input', event => {
    const input=event.target;
    if(input.name && input.type==='text' && !event.isComposing) {
      const edit=formatNumberEdit(input.value,input.selectionStart ?? input.value.length,input.selectionEnd ?? input.value.length);
      input.value=edit.text;
      input.setSelectionRange(edit.start,edit.end);
    }
    clearTimeout(timer); timer = setTimeout(render, 180);
  });
  form.addEventListener('change', render);
  form.addEventListener('focusout', event => {
    const input = event.target;
    if (!input.name || input.type!=='text') return;
    input.value=formatNumberText(input.value,true);
    render();
  });
  $('chart-month').addEventListener('input', inspectMonth);
  document.querySelector('.chart-inspect').addEventListener('toggle', inspectMonth);
  window.addEventListener('resize', () => { if (current) { drawChart(); inspectMonth(); } });
  $('monthly-details').addEventListener('toggle', () => { if ($('monthly-details').open) renderTable(); });
  const setExample = values => {
    Object.entries(values).forEach(([key, value]) => { $(key).value = value; });
    $('estimateTax').checked = false;
    zeroTest = values !== example;
    render();
  };
  $('zero-example').addEventListener('click', () => setExample({ ...example,
    debt: '1 000', cash: '600', monthlyPayment: '100', startMonth:'01',startYear:String(firstYear), endMonth:'11',endYear:String(firstYear),
    annualLoanRate: '0', monthlyLoanFee: '0', initialRepaymentFee: '0',
    purchaseFeeRate: '0', saleFeeRate: '0', otherCapitalIncome: '0' }));
  $('reset-example').addEventListener('click', () => setExample(example));
  $('full-history').addEventListener('click', () => {
    setPeriod(`${firstYear}-01`,SP500_DATA.rows.at(-1)[0]); zeroTest=false; render();
  });
  $('tax-label').textContent = TAX_ASSUMPTIONS.label;
  $('tax-assumptions').replaceChildren(...TAX_ASSUMPTIONS.limits.map(text => {
    const li = document.createElement('li'); li.textContent = text; return li;
  }));
  $('toggle-explanations').addEventListener('click', () => {
    const button=$('toggle-explanations');
    const show=button.getAttribute('aria-pressed')!=='true';
    button.setAttribute('aria-pressed',String(show));
    document.querySelector('.input-panel').classList.toggle('explanations-hidden',!show);
  });
  render();
})();
