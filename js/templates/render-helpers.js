import { el } from '../util/dom.js';

export function textOrPlaceholder(tag, className, value, placeholder) {
  const trimmed = value.trim();
  const isEmpty = trimmed === '';
  return el(tag, {
    class: [className, isEmpty && 'mailer__placeholder', isEmpty && `${className}--placeholder`],
    text: isEmpty ? placeholder : trimmed,
  });
}

export function photoOrPlaceholder(photo, className, placeholder) {
  if (photo === null) {
    return el('figure', { class: [className, `${className}--empty`] }, [
      el('span', { class: `${className}-placeholder`, text: placeholder }),
    ]);
  }
  return el('figure', { class: className }, [
    el('img', { class: `${className}-image`, src: photo.dataUrl, alt: '' }),
  ]);
}

export function colorwayStyle(colorway) {
  if (colorway === null) {
    return {};
  }
  return colorway.tokens;
}
