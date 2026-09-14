import { el, replace } from '../util/dom.js';
import { listTemplates } from '../templates/registry.js';

function renderOption(template, selectedTemplateId, onSelect) {
  const inputId = `template-option-${template.id}`;

  return el('div', { class: 'option' }, [
    el('input', {
      class: 'option__input',
      type: 'radio',
      name: 'template',
      id: inputId,
      value: template.id,
      checked: template.id === selectedTemplateId,
      on: { change: () => onSelect(template.id) },
    }),
    el('label', { class: 'option__label', for: inputId }, [
      el('span', {
        class: 'option__thumb',
        style: template.thumbnail === undefined ? {} : { 'background-image': `url("${template.thumbnail}")` },
      }),
      el('span', { class: 'option__name', text: template.name }),
    ]),
  ]);
}

export function renderTemplatePicker(node, selectedTemplateId, onSelect) {
  const templates = listTemplates();

  if (templates.length === 0) {
    replace(node, el('p', { class: 'control-panel__empty', text: 'No layouts are registered yet.' }));
    return;
  }

  replace(
    node,
    el(
      'div',
      { class: 'option-grid' },
      templates.map((template) => renderOption(template, selectedTemplateId, onSelect))
    )
  );
}
