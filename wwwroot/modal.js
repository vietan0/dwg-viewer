export function showTemSddModal(info) {
  // update modal fields (use empty string when value missing)
  document.querySelector('#temSddModal .name').textContent = info.name ?? '';
  document.querySelector('#temSddModal .area').textContent = `${info.area}m²` ?? '';
  document.querySelector('#temSddModal .mdxd').textContent = info.mdxd ?? '';
  document.querySelector('#temSddModal .minmax').textContent = info.minMax ?? '';
  document.querySelector('#temSddModal .hs').textContent = info.hs ?? '';

  const dlg = document.getElementById('temSddModal').showModal();
  if (dlg) dlg.showModal();
}

export function showSdd2Modal(info) {
  document.querySelector('#sdd2Modal .name').textContent = info.name ?? '';
  document.querySelector('#sdd2Modal .area').textContent = `${info.area}m²` ?? '';

  const dlg = document.getElementById('sdd2Modal');
  if (dlg) dlg.showModal();
}
