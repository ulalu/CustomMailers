import { el, replace } from '../util/dom.js';

function renderSwatch(colorway) {
  return el(
    'span',
    { class: 'option__swatch' },
    colorway.swatch.map((color) => el('span', { class: 'option__swatch-band', style: { 'background-color': color } }))
  );
}

function renderOption(colorway, selectedColorwayId, onSelect) {
  const inputId = `colorway-option-${colorway.id}`;

  return el('div', { class: 'option' }, [
    el('input', {
      class: 'option__input',
      type: 'radio',
      name: 'colorway',
      id: inputId,
      value: colorway.id,
      checked: colorway.id === selectedColorwayId,
      on: { change: () => onSelect(colorway.id) },
    }),
    el('label', { class: 'option__label', for: inputId }, [
      renderSwatch(colorway),
      el('span', { class: 'option__name', text: colorway.name }),
    ]),
  ]);
}

export function renderColorwayPicker(node, template, selectedColorwayId, onSelect) {
  if (template === null) {
    replace(node, el('p', { class: 'control-panel__empty', text: 'Choose a layout first.' }));
    return;
  }

  replace(
    node,
    el(
      'div',
      { class: 'option-grid option-grid--swatches' },
      template.colorways.map((colorway) => renderOption(colorway, selectedColorwayId, onSelect))
    )
  );
}
