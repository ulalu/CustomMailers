import { createPosition } from './content-model.js';

function mapPosition(content, positionId, transform) {
  return {
    ...content,
    positions: content.positions.map((position) => (position.id === positionId ? transform(position) : position)),
  };
}

export function setLogoId(content, logoId) {
  return { ...content, logoId };
}

export function setCandidatePhotoId(content, photoId) {
  return { ...content, candidate: { ...content.candidate, photoId } };
}

export function setSupporterField(content, field, value) {
  return { ...content, supporter: { ...content.supporter, [field]: value } };
}

export function selectIssue(content, positionId, issueId) {
  return mapPosition(content, positionId, (position) =>
    position.issueId === issueId ? position : { ...position, issueId, pointIndexes: [] }
  );
}

export function togglePoint(content, positionId, pointIndex, maxPoints) {
  return mapPosition(content, positionId, (position) => {
    if (position.pointIndexes.includes(pointIndex)) {
      return { ...position, pointIndexes: position.pointIndexes.filter((index) => index !== pointIndex) };
    }
    if (position.pointIndexes.length >= maxPoints) {
      return position;
    }
    return { ...position, pointIndexes: [...position.pointIndexes, pointIndex].sort((a, b) => a - b) };
  });
}

export function addPosition(content) {
  return { ...content, positions: [...content.positions, createPosition()] };
}

export function removePosition(content, positionId) {
  return { ...content, positions: content.positions.filter((position) => position.id !== positionId) };
}

export function movePosition(content, positionId, delta) {
  const index = content.positions.findIndex((position) => position.id === positionId);
  const nextIndex = index + delta;
  if (index === -1 || nextIndex < 0 || nextIndex >= content.positions.length) {
    return content;
  }
  const positions = [...content.positions];
  [positions[index], positions[nextIndex]] = [positions[nextIndex], positions[index]];
  return { ...content, positions };
}
