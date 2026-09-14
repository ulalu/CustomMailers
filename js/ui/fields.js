import { el } from '../util/dom.js';

const WARNING_RATIO = 0.85;

function counterModifier(length, maxChars) {
  if (length > maxChars) {
    return 'field__counter--over';
  }
  if (length >= Math.floor(maxChars * WARNING_RATIO)) {
    return 'field__counter--warning';
  }
  return null;
}

export function createTextField({ id, label, value, maxChars, hint, multiline = false, placeholder = '', onInput }) {
  const counter = el('span', { class: 'field__counter' });
  const error = el('p', { class: 'field__error' });

  const control = el(multiline ? 'textarea' : 'input', {
    class: multiline ? 'field__textarea' : 'field__input',
    id,
    placeholder,
    type: multiline ? null : 'text',
    rows: multiline ? '4' : null,
    on: {
      input: (event) => {
        applyState(event.target.value);
        onInput(event.target.value);
      },
    },
  });
  control.value = value;

  const field = el('div', { class: 'field' }, [
    el('label', { class: 'field__label', for: id, text: label }),
    control,
    el('div', { class: 'field__footer' }, [
      hint === undefined ? el('span', { class: 'field__hint' }) : el('span', { class: 'field__hint', text: hint }),
      counter,
    ]),
    error,
  ]);

  function applyState(nextValue) {
    const length = nextValue.length;
    const isOver = length > maxChars;
    counter.textContent = `${length}/${maxChars}`;
    counter.className = ['field__counter', counterModifier(length, maxChars)].filter(Boolean).join(' ');
    field.classList.toggle('field--invalid', isOver);
    error.textContent = isOver ? `${length - maxChars} character${length - maxChars === 1 ? '' : 's'} over — this will be clipped when printed.` : '';
  }

  applyState(value);
  return field;
}

export function createCheckboxField({ id, label, checked, onChange }) {
  const control = el('input', {
    class: 'field__checkbox',
    type: 'checkbox',
    id,
    checked,
    on: { change: (event) => onChange(event.target.checked) },
  });

  return el('div', { class: 'field field--checkbox' }, [
    control,
    el('label', { class: 'field__label', for: id, text: label }),
  ]);
}

export function createFieldset(legend, children) {
  return el('fieldset', { class: 'fieldset' }, [
    el('legend', { class: 'fieldset__legend', text: legend }),
    el('div', { class: 'fieldset__body' }, children),
  ]);
}
