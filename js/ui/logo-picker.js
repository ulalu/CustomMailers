import { el, replace } from '../util/dom.js';
import { wideLogoSrc, wideLogoName, resolveLogoId } from '../templates/logos.js';

function renderOption(logoId, headerBackground, selectedLogoId, onSelect) {
  const inputId = `logo-option-${logoId}`;

  return el('div', { class: 'option' }, [
    el('input', {
      class: 'option__input',
      type: 'radio',
      name: 'logo',
      id: inputId,
      value: logoId,
      checked: logoId === selectedLogoId,
      on: { change: () => onSelect(logoId) },
    }),
    el('label', { class: 'option__label', for: inputId }, [
      el('span', { class: 'logo-picker__preview', style: { 'background-color': headerBackground } }, [
        el('img', { class: 'logo-picker__image', src: wideLogoSrc(logoId), alt: '' }),
      ]),
      el('span', { class: 'option__name', text: wideLogoName(logoId) }),
    ]),
  ]);
}

export function renderLogoPicker(node, colorway, logoId, onSelect) {
  if (colorway === null) {
    replace(node, el('p', { class: 'control-panel__empty', text: 'Choose a colour scheme first.' }));
    return;
  }

  const selectedLogoId = resolveLogoId(colorway, logoId);
  const headerBackground = colorway.tokens['--mailer-header-bg'];

  replace(node, [
    el('span', { class: 'field__label', text: 'Logo' }),
    el(
      'div',
      { class: 'option-grid option-grid--logos' },
      colorway.logoOptions.map((option) => renderOption(option, headerBackground, selectedLogoId, onSelect))
    ),
    el('p', {
      class: 'field__hint',
      text: 'Only the logo colourways that meet contrast on this header are offered.',
    }),
  ]);
}
