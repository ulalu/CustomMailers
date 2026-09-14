import { el } from '../util/dom.js';
import { renderQr } from './qr.js';
import { textOrPlaceholder, photoOrPlaceholder, colorwayStyle } from './render-helpers.js';
import { candidatePrintSrc, hasCandidatePhoto } from '../data/photo-source.js';
import { wideLogoSrc, resolveLogoId } from './logos.js';
import { getIssue, selectedPoints } from '../data/position-source.js';

const PLACEHOLDER_POINT = 'Choose a supporting point';

function renderLogo(logoId) {
  if (logoId === null) {
    return el('div', { class: 'banner__logo' });
  }
  return el('img', {
    class: 'banner__logo',
    src: wideLogoSrc(logoId),
    alt: 'Abdul for US Senate',
  });
}

function renderCandidatePortrait(photoId) {
  if (photoId === null || !hasCandidatePhoto(photoId)) {
    return el('figure', { class: 'banner__portrait banner__portrait--empty' }, [
      el('span', { class: 'banner__portrait-placeholder', text: 'Choose a photo' }),
    ]);
  }
  return el('figure', { class: 'banner__portrait' }, [
    el('img', { class: 'banner__portrait-image', src: candidatePrintSrc(photoId), alt: '' }),
  ]);
}

function renderHeader(content, colorway) {
  return el('header', { class: 'banner__header' }, [
    renderCandidatePortrait(content.candidate.photoId),
    renderLogo(resolveLogoId(colorway, content.logoId)),
  ]);
}

function renderPoint(point) {
  const isEmpty = point.trim() === '';
  return el('li', { class: ['banner__point', isEmpty && 'mailer__placeholder'] }, [
    el('span', { class: 'banner__point-check' }),
    el('span', { class: 'banner__point-text', text: isEmpty ? PLACEHOLDER_POINT : point }),
  ]);
}

function renderPosition(position) {
  const issue = getIssue(position.issueId);
  const points = selectedPoints(position);
  const visiblePoints = points.length === 0 ? [''] : points;

  if (issue === null) {
    return el('li', { class: 'banner__position' }, [
      el('div', { class: 'banner__position-heading' }, [
        el('h3', { class: 'banner__position-title mailer__placeholder', text: 'Choose a position' }),
      ]),
    ]);
  }

  return el('li', { class: 'banner__position' }, [
    el('div', { class: 'banner__position-heading' }, [
      el('h3', { class: 'banner__position-title', text: issue.title }),
      el('p', { class: 'banner__position-eyebrow', text: issue.eyebrow }),
    ]),
    el('p', { class: 'banner__position-summary', text: issue.summary }),
    el('ul', { class: 'banner__points' }, visiblePoints.map(renderPoint)),
  ]);
}

function renderPositions(content, slots) {
  return el('section', { class: 'banner__positions' }, [
    el(
      'ol',
      { class: 'banner__position-list', 'data-overflow-guard': true },
      content.positions.slice(0, slots.positions.max).map(renderPosition)
    ),
  ]);
}

function renderFooter(content, slots) {
  const children = [renderQr(slots.qr, 'banner__qr')];

  if (content.supporter.enabled) {
    children.push(
      el('blockquote', { class: 'banner__blurb' }, [
        textOrPlaceholder('p', 'banner__blurb-text', content.supporter.blurb, slots.supporter.blurb.placeholder),
        textOrPlaceholder('cite', 'banner__supporter-name', content.supporter.name, 'Your name'),
      ]),
      photoOrPlaceholder(content.supporter.photo, 'banner__supporter-portrait', 'Your photo')
    );
  }

  return el('footer', { class: 'banner__footer' }, children);
}

export const bannerTemplate = {
  id: 'banner',
  name: 'Banner',
  description: 'Wide logo header with candidate portrait, four stacked positions, QR and endorsement footer.',

  slots: {
    candidatePhoto: {
      source: 'gallery',
      label: 'Candidate photo',
      hint: 'Every photo is cropped to a centred circle.',
    },
    positions: {
      min: 1,
      max: 4,
      label: 'Positions',
      points: { max: 3 },
    },
    supporter: {
      optional: true,
      label: 'Your endorsement',
      photo: { aspectRatio: 1, exportWidth: 420, label: 'Your photo' },
      name: { maxChars: 30, label: 'Your name' },
      blurb: {
        maxChars: 210,
        label: 'Why you support Abdul',
        placeholder: 'Share why you are backing Abdul in a sentence or two.',
      },
    },
    qr: {
      scale: 1.05,
      caption: 'Scan to find your polling place',
    },
  },

  colorways: [
    {
      id: 'deep',
      name: 'Deep Blue · Urgent',
      swatch: ['var(--brand-deep-blue)', 'var(--brand-coral)', 'var(--brand-light-cream)'],
      headerTone: 'dark',
      logoOptions: ['light', 'gold'],
      tokens: {
        '--mailer-header-bg': 'var(--brand-deep-blue)',
        '--mailer-header-accent': 'var(--brand-coral)',
        '--mailer-footer-bg': 'var(--brand-deep-blue)',
        '--mailer-footer-ink': 'var(--brand-white)',
        '--mailer-footer-accent': 'var(--brand-coral)',
        '--mailer-heading': 'var(--brand-deep-blue)',
        '--mailer-surface': 'var(--brand-white)',
        '--mailer-ink': 'var(--brand-charcoal)',
        '--mailer-rule': 'var(--brand-medium-beige)',
        '--mailer-accent': 'var(--brand-red)',
      },
    },
    {
      id: 'cream',
      name: 'Cream · Neutral',
      swatch: ['var(--brand-cream)', 'var(--brand-medium-blue)', 'var(--brand-medium-beige)'],
      headerTone: 'light',
      logoOptions: ['duo', 'navy', 'dark', 'red'],
      tokens: {
        '--mailer-header-bg': 'var(--brand-cream)',
        '--mailer-header-accent': 'var(--brand-medium-blue)',
        '--mailer-footer-bg': 'var(--brand-medium-blue)',
        '--mailer-footer-ink': 'var(--brand-white)',
        '--mailer-footer-accent': 'var(--brand-medium-beige)',
        '--mailer-heading': 'var(--brand-deep-blue)',
        '--mailer-surface': 'var(--brand-white)',
        '--mailer-ink': 'var(--brand-charcoal)',
        '--mailer-rule': 'var(--brand-dark-beige)',
        '--mailer-accent': 'var(--brand-red)',
      },
    },
    {
      id: 'beige',
      name: 'Beige · Positive',
      swatch: ['var(--brand-light-beige)', 'var(--brand-light-blue)', 'var(--brand-light-cream)'],
      headerTone: 'light',
      logoOptions: ['duo', 'navy', 'dark', 'red'],
      tokens: {
        '--mailer-header-bg': 'var(--brand-light-beige)',
        '--mailer-header-accent': 'var(--brand-light-blue)',
        '--mailer-footer-bg': 'var(--brand-light-blue)',
        '--mailer-footer-ink': 'var(--brand-white)',
        '--mailer-footer-accent': 'var(--brand-light-cream)',
        '--mailer-heading': 'var(--brand-deep-blue)',
        '--mailer-surface': 'var(--brand-white)',
        '--mailer-ink': 'var(--brand-charcoal)',
        '--mailer-rule': 'var(--brand-dark-beige)',
        '--mailer-accent': 'var(--brand-light-blue)',
      },
    },
  ],

  render(content, colorway) {
    const { slots } = bannerTemplate;
    return el('div', { class: 'banner', style: colorwayStyle(colorway) }, [
      renderHeader(content, colorway),
      renderPositions(content, slots),
      renderFooter(content, slots),
    ]);
  },
};
