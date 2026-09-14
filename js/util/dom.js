const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
const SVG_TAGS = new Set(['svg', 'g', 'path', 'rect', 'circle', 'line', 'polyline', 'polygon', 'text', 'use', 'defs']);

function appendChild(parent, child) {
  if (child === null || child === undefined || child === false) {
    return;
  }
  if (Array.isArray(child)) {
    child.forEach((nested) => appendChild(parent, nested));
    return;
  }
  parent.append(child instanceof Node ? child : String(child));
}

export function el(tag, props = {}, children = []) {
  const node = SVG_TAGS.has(tag)
    ? document.createElementNS(SVG_NAMESPACE, tag)
    : document.createElement(tag);

  Object.entries(props).forEach(([key, value]) => {
    if (value === null || value === undefined || value === false) {
      return;
    }
    if (key === 'class') {
      node.setAttribute('class', Array.isArray(value) ? value.filter(Boolean).join(' ') : value);
    } else if (key === 'dataset') {
      Object.entries(value).forEach(([dataKey, dataValue]) => {
        node.dataset[dataKey] = dataValue;
      });
    } else if (key === 'style') {
      Object.entries(value).forEach(([property, propertyValue]) => {
        node.style.setProperty(property, propertyValue);
      });
    } else if (key === 'on') {
      Object.entries(value).forEach(([eventName, handler]) => {
        node.addEventListener(eventName, handler);
      });
    } else if (key === 'text') {
      node.textContent = value;
    } else if (value === true) {
      node.setAttribute(key, '');
    } else {
      node.setAttribute(key, value);
    }
  });

  appendChild(node, children);
  return node;
}

export function clear(node) {
  node.replaceChildren();
  return node;
}

export function replace(node, children) {
  clear(node);
  appendChild(node, children);
  return node;
}

export function region(name, root = document) {
  const node = root.querySelector(`[data-region="${name}"]`);
  if (node === null) {
    throw new Error(`Missing region "${name}"`);
  }
  return node;
}
