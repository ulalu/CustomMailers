import { el, replace } from '../util/dom.js';
import { createTextField, createCheckboxField, createFieldset } from './fields.js';
import { createPhotoInput } from './photo-input.js';
import { createPhotoGallery } from './photo-gallery.js';
import { createPositionsEditor } from './positions-editor.js';
import { setCandidatePhotoId, setSupporterField } from '../state/updates.js';

function candidateFieldset(store, slot) {
  return createFieldset('Abdul El-Sayed', [
    createPhotoGallery({
      label: slot.label,
      hint: slot.hint,
      selectedId: store.getState().candidate.photoId,
      onSelect: (photoId) => store.setState((current) => setCandidatePhotoId(current, photoId)),
    }),
  ]);
}

function supporterFieldset(store, slot) {
  const content = store.getState();

  const photoInput = createPhotoInput({
    id: 'supporter-photo',
    label: slot.photo.label,
    slot: slot.photo,
    photo: content.supporter.photo,
    onChange: (photo) => {
      store.setState((current) => setSupporterField(current, 'photo', photo));
      photoInput.update(photo);
    },
  });

  const body = el('div', { class: 'fieldset__body' }, [
    photoInput.element,
    createTextField({
      id: 'supporter-name',
      label: slot.name.label,
      value: content.supporter.name,
      maxChars: slot.name.maxChars,
      onInput: (value) => store.setState((current) => setSupporterField(current, 'name', value)),
    }),
    createTextField({
      id: 'supporter-blurb',
      label: slot.blurb.label,
      value: content.supporter.blurb,
      maxChars: slot.blurb.maxChars,
      placeholder: slot.blurb.placeholder,
      multiline: true,
      onInput: (value) => store.setState((current) => setSupporterField(current, 'blurb', value)),
    }),
  ]);

  body.hidden = !content.supporter.enabled;

  const toggle = createCheckboxField({
    id: 'supporter-enabled',
    label: 'Include my endorsement',
    checked: content.supporter.enabled,
    onChange: (enabled) => {
      store.setState((current) => setSupporterField(current, 'enabled', enabled));
      body.hidden = !enabled;
    },
  });

  return el('fieldset', { class: 'fieldset' }, [
    el('legend', { class: 'fieldset__legend', text: slot.label }),
    toggle,
    body,
  ]);
}

export function renderContentForm(node, template, store) {
  if (template === null) {
    replace(node, el('p', { class: 'control-panel__empty', text: 'Choose a layout first.' }));
    return;
  }

  const { slots } = template;
  const sections = [];

  if (slots.candidatePhoto !== undefined) {
    sections.push(candidateFieldset(store, slots.candidatePhoto));
  }

  if (slots.positions !== undefined) {
    sections.push(createFieldset(slots.positions.label, [createPositionsEditor(store, slots.positions)]));
  }

  if (slots.supporter !== undefined) {
    sections.push(supporterFieldset(store, slots.supporter));
  }

  replace(node, sections);
}
