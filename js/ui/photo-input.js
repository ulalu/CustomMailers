import { el, replace } from '../util/dom.js';
import { cropImageToSlot, isImageError, ACCEPT_ATTRIBUTE } from '../util/image.js';

function formatBytes(bytes) {
  const kilobytes = bytes / 1024;
  if (kilobytes < 1024) {
    return `${Math.round(kilobytes)} KB`;
  }
  return `${(kilobytes / 1024).toFixed(1)} MB`;
}

export function createPhotoInput({ id, label, slot, photo, onChange }) {
  const frame = el('div', { class: 'photo-input__frame', style: { 'aspect-ratio': String(slot.aspectRatio) } });
  const meta = el('p', { class: 'photo-input__meta' });
  const error = el('p', { class: 'photo-input__error' });

  const removeButton = el('button', {
    type: 'button',
    class: 'button button--subtle button--danger',
    text: 'Remove',
    on: { click: () => onChange(null) },
  });

  const fileInput = el('input', {
    class: 'photo-input__file',
    type: 'file',
    id,
    accept: ACCEPT_ATTRIBUTE,
    on: {
      change: async (event) => {
        const file = event.target.files[0];
        event.target.value = '';
        if (file === undefined) {
          return;
        }
        error.textContent = '';
        meta.textContent = 'Processing…';
        try {
          onChange(await cropImageToSlot(file, slot));
        } catch (caught) {
          meta.textContent = '';
          error.textContent = isImageError(caught) ? caught.message : 'That image could not be processed.';
        }
      },
    },
  });

  const trigger = el('label', { class: 'photo-input__trigger', for: id });

  function paint() {
    const hasPhoto = photo !== null;
    frame.classList.toggle('photo-input__frame--filled', hasPhoto);
    trigger.textContent = hasPhoto ? 'Replace' : 'Choose photo';
    replace(
      frame,
      hasPhoto
        ? el('img', { class: 'photo-input__preview', src: photo.dataUrl, alt: '' })
        : el('p', { class: 'photo-input__placeholder', text: 'No photo yet' })
    );
    meta.textContent = hasPhoto ? `${photo.width}×${photo.height} · ${formatBytes(photo.bytes)}` : '';
    removeButton.hidden = !hasPhoto;
  }

  paint();

  return {
    element: el('div', { class: 'photo-input' }, [
      el('span', { class: 'field__label', text: label }),
      frame,
      el('div', { class: 'photo-input__actions' }, [
        fileInput,
        trigger,
        removeButton,
      ]),
      meta,
      error,
    ]),
    update(nextPhoto) {
      photo = nextPhoto;
      paint();
    },
  };
}
