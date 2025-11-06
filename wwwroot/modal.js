const lockedAreas = new Set();

export function showTemSddModal(info) {
  const modal = document.getElementById('temSddModal');
  // update modal fields (use empty string when value missing)
  modal.querySelector('.name').textContent = info.name ?? '';
  modal.querySelector('.area').textContent = `${info.area}m²` ?? '';
  modal.querySelector('.mdxd').textContent = info.mdxd ?? '';
  modal.querySelector('.minmax').textContent = info.minMax ?? '';
  modal.querySelector('.hs').textContent = info.hs ?? '';

  const label = modal.querySelector('.label');
  const toggle = document.createElement('input');
  toggle.className = 'toggle toggle-success';
  toggle.setAttribute('type', 'checkbox');
  toggle.checked = lockedAreas.has(info.externalId);
  toggle.addEventListener('change', (e) => {
    const { checked } = e.target;
    if (checked) {
      if (!lockedAreas.has(info.externalId)) {
        lockedAreas.add(info.externalId);
      }
    } else {
      if (lockedAreas.has(info.externalId)) {
        lockedAreas.delete(info.externalId);
      }
    }
  });

  label.append(toggle, 'Sold');
  modal.addEventListener('close', () => {
    label.innerHTML = '';
  });
  modal.showModal();
}

export function showSdd2Modal(info) {
  const modal = document.getElementById('sdd2Modal');
  modal.querySelector('.name').textContent = info.name ?? '';
  modal.querySelector('.area').textContent = `${info.area}m²` ?? '';

  const label = modal.querySelector('.label');
  const toggle = document.createElement('input');
  toggle.className = 'toggle toggle-success';
  toggle.setAttribute('type', 'checkbox');
  toggle.checked = lockedAreas.has(info.externalId);
  toggle.addEventListener('change', (e) => {
    const { checked } = e.target;
    if (checked) {
      if (!lockedAreas.has(info.externalId)) {
        lockedAreas.add(info.externalId);
      }
    } else {
      if (lockedAreas.has(info.externalId)) {
        lockedAreas.delete(info.externalId);
      }
    }
  });

  label.append(toggle, 'Sold');
  modal.addEventListener('close', () => {
    label.innerHTML = '';
  });
  modal.showModal();
}
