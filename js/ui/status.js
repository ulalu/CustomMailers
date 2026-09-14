const VISIBLE_CLASS = 'app__status--visible';
const DISPLAY_MS = 2600;

export function createStatus(node) {
  let hideTimeoutId = null;

  return function showStatus(message) {
    node.textContent = message;
    node.classList.add(VISIBLE_CLASS);
    if (hideTimeoutId !== null) {
      clearTimeout(hideTimeoutId);
    }
    hideTimeoutId = setTimeout(() => {
      node.classList.remove(VISIBLE_CLASS);
      hideTimeoutId = null;
    }, DISPLAY_MS);
  };
}
