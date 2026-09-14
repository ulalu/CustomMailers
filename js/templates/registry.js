const templates = new Map();

export function registerTemplate(template) {
  if (templates.has(template.id)) {
    throw new Error(`Template "${template.id}" is already registered`);
  }
  templates.set(template.id, template);
  return template;
}

export function getTemplate(templateId) {
  return templates.get(templateId) ?? null;
}

export function listTemplates() {
  return [...templates.values()];
}

export function getDefaultTemplate() {
  return listTemplates()[0] ?? null;
}

export function getColorway(template, colorwayId) {
  if (template === null) {
    return null;
  }
  return template.colorways.find((colorway) => colorway.id === colorwayId) ?? template.colorways[0] ?? null;
}
