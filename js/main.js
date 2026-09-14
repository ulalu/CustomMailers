import { region } from './util/dom.js';
import { debounce } from './util/debounce.js';
import { createStore } from './state/store.js';
import { createEmptyContent, isBlankContent, normalizeContent } from './state/content-model.js';
import { loadSession, saveSession, clearSession, isStorageAvailable } from './state/storage.js';
import { registerTemplates } from './templates/index.js';
import { getTemplate, getColorway, getDefaultTemplate } from './templates/registry.js';
import { renderTemplatePicker } from './ui/template-picker.js';
import { renderColorwayPicker } from './ui/colorway-picker.js';
import { renderLogoPicker } from './ui/logo-picker.js';
import { renderContentForm } from './ui/content-form.js';
import { setLogoId } from './state/updates.js';
import { renderMailer, createPreviewFitter, findOverflow } from './ui/preview.js';
import { createStatus } from './ui/status.js';

const AUTOSAVE_DELAY_MS = 500;

function trimToTemplate(content, template) {
  const max = template?.slots.positions?.max;
  if (max === undefined || content.positions.length <= max) {
    return content;
  }
  return { ...content, positions: content.positions.slice(0, max) };
}

function withDefaultSelection(content) {
  const existing = getTemplate(content.templateId);
  if (existing !== null) {
    return trimToTemplate(content, existing);
  }
  const template = getDefaultTemplate();
  if (template === null) {
    return content;
  }
  return trimToTemplate(
    { ...content, templateId: template.id, colorwayId: template.colorways[0]?.id ?? null },
    template
  );
}

function boot() {
  registerTemplates();

  const restored = loadSession();
  const store = createStore(withDefaultSelection(normalizeContent(restored)));

  const showStatus = createStatus(region('status'));
  const templatePickerNode = region('template-picker');
  const colorwayPickerNode = region('colorway-picker');
  const logoPickerNode = region('logo-picker');
  const contentFormNode = region('content-form');
  const mailerNode = region('mailer');
  const overflowNode = region('overflow-warning');
  const previewNode = document.querySelector('.preview');
  const stageNode = region('preview-stage');

  createPreviewFitter(previewNode, stageNode);

  const autosave = debounce((content) => {
    const result = saveSession(content);
    if (!result.ok && result.reason === 'quota') {
      showStatus('Could not autosave: browser storage is full. Try a smaller photo.');
    }
  }, AUTOSAVE_DELAY_MS);

  function selectTemplate(templateId) {
    store.setState((content) => {
      const template = getTemplate(templateId);
      return trimToTemplate(
        { ...content, templateId, colorwayId: template?.colorways[0]?.id ?? null },
        template
      );
    });
  }

  function selectColorway(colorwayId) {
    store.setState((content) => ({ ...content, colorwayId }));
  }

  function selectLogo(logoId) {
    store.setState((content) => setLogoId(content, logoId));
  }

  let renderedControlsKey = null;
  let renderedLogoKey = null;
  let contentRevision = 0;

  function render(content) {
    const template = getTemplate(content.templateId);
    const colorway = getColorway(template, content.colorwayId);

    const controlsKey = `${content.templateId}:${contentRevision}`;
    if (controlsKey !== renderedControlsKey) {
      renderedControlsKey = controlsKey;
      renderTemplatePicker(templatePickerNode, content.templateId, selectTemplate);
      renderColorwayPicker(colorwayPickerNode, template, colorway?.id ?? null, selectColorway);
      renderContentForm(contentFormNode, template, store);
    }

    const logoKey = `${colorway?.id ?? ''}:${content.logoId}:${contentRevision}`;
    if (logoKey !== renderedLogoKey) {
      renderedLogoKey = logoKey;
      renderLogoPicker(logoPickerNode, colorway, content.logoId, selectLogo);
    }

    renderMailer(mailerNode, content);

    const isOverflowing = findOverflow(mailerNode);
    mailerNode.classList.toggle('mailer--overflowing', isOverflowing);
    overflowNode.hidden = !isOverflowing;
    overflowNode.textContent = isOverflowing
      ? 'This content is taller than the page and will be cut off when printed. Remove a position, or deselect a supporting point.'
      : '';
  }

  store.subscribe((content) => {
    render(content);
    autosave(content);
  });

  render(store.getState());

  document.querySelector('[data-action="print"]').addEventListener('click', () => {
    autosave.flush();
    window.print();
  });

  document.querySelector('[data-action="start-over"]').addEventListener('click', () => {
    if (!isBlankContent(store.getState()) && !window.confirm('Clear all content and start over?')) {
      return;
    }
    autosave.cancel();
    clearSession();
    contentRevision += 1;
    store.setState(withDefaultSelection(createEmptyContent()));
    showStatus('Cleared. Starting over.');
  });

  if (!isStorageAvailable) {
    showStatus('Autosave is unavailable in this browser session.');
  } else if (restored !== null) {
    showStatus('Restored your last session.');
  }
}

boot();
