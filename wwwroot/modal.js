export default function openModal(info) {
  const modalContainer = document.createElement('div');
  modalContainer.id = 'modal-container';

  const backdrop = document.createElement('div');
  backdrop.id = 'backdrop';
  const contentContainer = document.createElement('div');
  contentContainer.id = 'content-container';
  const modal = document.createElement('div');
  modal.id = 'modal';
  modal.append(closeBtn());
  contentContainer.append(modal);
  modalContainer.append(backdrop, contentContainer);
  document.body.append(modalContainer);

  const pre = document.createElement('pre');
  pre.textContent = JSON.stringify(info, null, 2);
  modal.append(pre);
}

function closeModal() {
  const modalContainer = document.getElementById('modal-container');
  modalContainer.remove();
}

function closeBtn() {
  const closeBtn = document.createElement('button');
  closeBtn.className = 'close';
  closeBtn.innerHTML = '<iconify-icon icon="mdi:close" noobserver></iconify-icon>';
  closeBtn.onclick = closeModal;

  return closeBtn;
}
