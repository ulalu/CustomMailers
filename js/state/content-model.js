export function createId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createPosition() {
  return {
    id: createId('position'),
    issueId: null,
    pointIndexes: [],
  };
}

export function createEmptyContent() {
  return {
    templateId: null,
    colorwayId: null,
    logoId: null,
    candidate: {
      photoId: null,
    },
    positions: [createPosition()],
    supporter: {
      enabled: false,
      name: '',
      photo: null,
      blurb: '',
    },
  };
}

function asString(value) {
  return typeof value === 'string' ? value : '';
}

function asPhoto(value) {
  if (value === null || typeof value !== 'object' || typeof value.dataUrl !== 'string') {
    return null;
  }
  return {
    dataUrl: value.dataUrl,
    width: Number(value.width) || 0,
    height: Number(value.height) || 0,
    bytes: Number(value.bytes) || 0,
  };
}

function asPosition(value) {
  if (value === null || typeof value !== 'object') {
    return createPosition();
  }
  const pointIndexes = Array.isArray(value.pointIndexes)
    ? [...new Set(value.pointIndexes.filter((index) => Number.isInteger(index) && index >= 0))].sort(
        (a, b) => a - b
      )
    : [];
  return {
    id: typeof value.id === 'string' ? value.id : createId('position'),
    issueId: typeof value.issueId === 'string' ? value.issueId : null,
    pointIndexes,
  };
}

export function normalizeContent(raw) {
  const defaults = createEmptyContent();
  if (raw === null || typeof raw !== 'object') {
    return defaults;
  }

  const candidate = raw.candidate ?? {};
  const supporter = raw.supporter ?? {};
  const positions = Array.isArray(raw.positions) ? raw.positions.map(asPosition) : [];

  return {
    templateId: typeof raw.templateId === 'string' ? raw.templateId : null,
    colorwayId: typeof raw.colorwayId === 'string' ? raw.colorwayId : null,
    logoId: typeof raw.logoId === 'string' ? raw.logoId : null,
    candidate: {
      photoId: typeof candidate.photoId === 'string' ? candidate.photoId : null,
    },
    positions: positions.length === 0 ? defaults.positions : positions,
    supporter: {
      enabled: supporter.enabled === true,
      name: asString(supporter.name),
      photo: asPhoto(supporter.photo),
      blurb: asString(supporter.blurb),
    },
  };
}

export function isBlankContent(content) {
  const hasCandidate = content.candidate.photoId !== null;
  const hasPositions = content.positions.some((position) => position.issueId !== null);
  const hasSupporter =
    content.supporter.name.trim() !== '' ||
    content.supporter.blurb.trim() !== '' ||
    content.supporter.photo !== null;

  return !hasCandidate && !hasPositions && !hasSupporter;
}
