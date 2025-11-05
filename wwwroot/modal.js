export default function showInfoModal(info) {
  // update modal fields (use empty string when value missing)
  document.getElementById('info-name').textContent = info.name ?? '';
  document.getElementById('info-area').textContent = info.area ?? '';
  document.getElementById('info-mdxd').textContent = info.mdxd ?? '';
  document.getElementById('info-minmax').textContent = info.minMax ?? '';
  document.getElementById('info-hs').textContent = info.hs ?? '';

  const dlg = document.getElementById('infoModal');
  if (dlg) dlg.showModal();
}
