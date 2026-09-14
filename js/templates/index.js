import { registerTemplate } from './registry.js';
import { bannerTemplate } from './banner.js';

export function registerTemplates() {
  registerTemplate(bannerTemplate);
}
