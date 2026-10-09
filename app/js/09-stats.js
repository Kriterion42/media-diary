// Модуль 09-stats. Статистика по прогрессии: проценты, несколько прохождений.
"use strict";
function openStats() {
  const rows = STATE_ORDER.map(st => {
    const n = itemsOf(st).length;
    return {st, n};
  });
  const total = allOfType().length || 1;
  const doneN = itemsOf("done").length;
  const playsSum = itemsOf("done").reduce((s, g) => s + Math.max(1, playCount(g.id)), 0);
  const hoursSum = itemsOf("done").reduce((s, g) => s + sumHours(g.id), 0);
  const donePct = Math.round(doneN / total * 100);
  const activePct = Math.round(itemsOf("active").length / total * 100);
  const bar = (label, n, pct, cls) => `<div class="statrow"><span class="statlb">${esc(label)}</span>
    <div class="bar"><div class="fill ${cls || ""}" style="width:${pct}%"></div></div>
    <span class="statn">${n} · ${pct}%</span></div>`;
  $("#sheet").innerHTML = `<div class="grabber"></div><h2 class="dtitle">Статистика — ${esc(curType().name)}</h2>
    <div class="intro">Всего в типе «${esc(curType().name)}»: <b>${allOfType().length}</b>.
    Завершено <b>${doneN}</b> (${donePct}%) с учётом повторных прохождений — <b>${playsSum}</b> · <b>${hoursSum} ч</b>.</div>
    ${bar("В планах", rows[0].n, Math.round(rows[0].n / total * 100))}
    ${bar("В процессе", rows[1].n, activePct)}
    ${bar("Завершено", doneN, donePct, "ok")}
    ${bar("Брошено", rows[3].n, Math.round(rows[3].n / total * 100), "hot")}
    <div class="setrow"><div class="sl"><b>Прохождения/просмотры</b><span>у завершённых: кнопка «Ещё проход» добавляет повтор; часы — в шторке</span></div>
      <span class="tag acc">${playsSum} · ${hoursSum} ч</span></div>
    <div class="menurows">${S.types.map(t => {
      const arr = Object.values(S.items[t.name] || {});
      const dn = arr.filter(x => (x.state || "backlog") === "done").length;
      const pc = arr.length ? Math.round(dn / arr.length * 100) : 0;
      return `<div class="statrow"><span class="statlb">${esc(t.name)}</span>
        <div class="bar"><div class="fill" style="width:${pc}%"></div></div><span class="statn">${dn}/${arr.length} · ${pc}%</span></div>`;
    }).join("")}</div>`;
  $("#scim").classList.add("on"); $("#sheet").classList.add("on");
  document.body.style.overflow = "hidden";
}
