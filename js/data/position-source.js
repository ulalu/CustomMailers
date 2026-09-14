import { positions } from './positions.js';

export { positions };

export function getIssue(issueId) {
  return positions.find((issue) => issue.id === issueId) ?? null;
}

export function issueOptionLabel(issue) {
  return `${issue.title} — ${issue.eyebrow}`;
}

export function issuesByCategory() {
  const groups = new Map();
  positions.forEach((issue) => {
    const existing = groups.get(issue.category);
    if (existing === undefined) {
      groups.set(issue.category, [issue]);
      return;
    }
    existing.push(issue);
  });
  return [...groups.entries()].map(([category, issues]) => ({ category, issues }));
}

export function selectedPoints(position) {
  const issue = getIssue(position.issueId);
  if (issue === null) {
    return [];
  }
  return position.pointIndexes
    .map((pointIndex) => issue.points[pointIndex])
    .filter((point) => point !== undefined);
}
