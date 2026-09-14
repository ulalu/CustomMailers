import { el, replace } from '../util/dom.js';
import { getTemplate, getColorway } from '../templates/registry.js';

const PAGE_WIDTH_PX = 816;
const MIN_SCALE = 0.2;

function renderEmptyState(message) {
  return el('div', { class: 'mailer__empty' }, [
    el('p', { class: 'mailer__empty-title', text: 'Nothing to preview yet' }),
    el('p', { class: 'mailer__empty-body', text: message }),
  ]);
}

export function renderMailer(mailerNode, content) {
  const template = getTemplate(content.templateId);

  if (template === null) {
    replace(mailerNode, renderEmptyState('Choose a layout to start building your mailer.'));
    mailerNode.className = 'mailer';
    return;
  }

  const colorway = getColorway(template, content.colorwayId);
  mailerNode.className = `mailer mailer--${template.id}`;
  mailerNode.dataset.colorway = colorway === null ? '' : colorway.id;
  replace(mailerNode, template.render(content, colorway));
}

export function findOverflow(mailerNode) {
  return [...mailerNode.querySelectorAll('[data-overflow-guard]')].some(
    (guard) => guard.scrollHeight - guard.clientHeight > 1
  );
}

export function createPreviewFitter(previewNode, stageNode) {
  function fit() {
    const styles = window.getComputedStyle(previewNode);
    const horizontalPadding = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
    const available = previewNode.clientWidth - horizontalPadding;
    const scale = Math.max(MIN_SCALE, Math.min(1, available / PAGE_WIDTH_PX));
    stageNode.style.setProperty('--preview-scale', String(scale));
  }

  const observer = new ResizeObserver(fit);
  observer.observe(previewNode);
  fit();

  return fit;
}
