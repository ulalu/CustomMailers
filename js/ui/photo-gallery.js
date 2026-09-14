import { el } from '../util/dom.js';
import { candidatePhotos, candidateThumbSrc } from '../data/photo-source.js';

function renderOption(photo, selectedId, onSelect) {
  const inputId = `candidate-photo-${photo.id}`;

  return el('li', { class: 'photo-gallery__item' }, [
    el('input', {
      class: 'photo-gallery__input',
      type: 'radio',
      name: 'candidate-photo',
      id: inputId,
      value: photo.id,
      checked: photo.id === selectedId,
      on: { change: () => onSelect(photo.id) },
    }),
    el('label', { class: 'photo-gallery__label', for: inputId, title: photo.label }, [
      el('img', {
        class: 'photo-gallery__thumb',
        src: candidateThumbSrc(photo.id),
        alt: photo.label,
        loading: 'lazy',
        decoding: 'async',
      }),
    ]),
  ]);
}

export function createPhotoGallery({ label, hint, selectedId, onSelect }) {
  if (candidatePhotos.length === 0) {
    return el('p', { class: 'control-panel__empty', text: 'No candidate photos have been prepared yet.' });
  }

  return el('div', { class: 'photo-gallery' }, [
    el('span', { class: 'field__label', text: label }),
    el(
      'ul',
      { class: 'photo-gallery__list' },
      candidatePhotos.map((photo) => renderOption(photo, selectedId, onSelect))
    ),
    hint === undefined ? null : el('p', { class: 'field__hint', text: hint }),
  ]);
}
