import { el, replace } from '../util/dom.js';
import { getIssue, issueOptionLabel, issuesByCategory } from '../data/position-source.js';
import { selectIssue, togglePoint, addPosition, removePosition, movePosition } from '../state/updates.js';

const CATEGORIES = issuesByCategory();

export function createPositionsEditor(store, slot) {
  const list = el('ol', { class: 'positions-editor__list' });
  const count = el('p', { class: 'positions-editor__count' });

  const addButton = el('button', {
    type: 'button',
    class: 'button button--ghost',
    text: 'Add position',
    on: { click: () => structuralChange(addPosition) },
  });

  let rows = [];

  function structuralChange(updater) {
    store.setState(updater);
    paint();
  }

  function refreshAllOptions() {
    rows.forEach((row) => row.refreshOptions());
  }

  function createRow(positionId, index, total) {
    const detail = el('div', { class: 'position__detail' });

    function current() {
      return store.getState().positions.find((position) => position.id === positionId) ?? null;
    }

    const select = el('select', {
      class: 'field__select',
      id: `${positionId}-issue`,
      on: {
        change: (event) => {
          const issueId = event.target.value === '' ? null : event.target.value;
          store.setState((content) => selectIssue(content, positionId, issueId));
          paintDetail();
          refreshAllOptions();
        },
      },
    });

    function refreshOptions() {
      const position = current();
      if (position === null) {
        return;
      }
      const taken = new Set(
        store
          .getState()
          .positions.filter((other) => other.id !== positionId && other.issueId !== null)
          .map((other) => other.issueId)
      );

      replace(select, [
        el('option', { value: '', text: 'Choose a position…' }),
        ...CATEGORIES.map(({ category, issues }) =>
          el(
            'optgroup',
            { label: category },
            issues.map((issue) =>
              el('option', {
                value: issue.id,
                text: issueOptionLabel(issue),
                disabled: taken.has(issue.id),
              })
            )
          )
        ),
      ]);
      select.value = position.issueId ?? '';
    }

    function paintDetail() {
      const position = current();
      const issue = position === null ? null : getIssue(position.issueId);

      if (issue === null) {
        replace(
          detail,
          el('p', {
            class: 'position__hint',
            text: 'Pick a position to see its summary and supporting points.',
          })
        );
        return;
      }

      const pointsCount = el('p', { class: 'position__points-count' });
      const inputs = [];

      const items = issue.points.map((point, pointIndex) => {
        const inputId = `${positionId}-point-${pointIndex}`;
        const input = el('input', {
          class: 'position__point-input',
          type: 'checkbox',
          id: inputId,
          on: {
            change: () => {
              store.setState((content) => togglePoint(content, positionId, pointIndex, slot.points.max));
              syncPoints();
            },
          },
        });
        inputs.push(input);
        return el('li', { class: 'position__point' }, [
          input,
          el('label', { class: 'position__point-label', for: inputId, text: point }),
        ]);
      });

      function syncPoints() {
        const chosen = current()?.pointIndexes ?? [];
        inputs.forEach((input, pointIndex) => {
          const isChosen = chosen.includes(pointIndex);
          input.checked = isChosen;
          input.disabled = !isChosen && chosen.length >= slot.points.max;
        });
        pointsCount.textContent = `${chosen.length} of ${slot.points.max} selected`;
        pointsCount.classList.toggle('position__points-count--at-limit', chosen.length >= slot.points.max);
      }

      replace(detail, [
        el('p', { class: 'position__summary', text: issue.summary }),
        el('p', { class: 'position__points-legend', text: `Supporting points — choose up to ${slot.points.max}` }),
        el('ul', { class: 'position__points' }, items),
        pointsCount,
      ]);

      syncPoints();
    }

    const element = el('li', { class: 'position' }, [
      el('div', { class: 'position__header' }, [
        el('span', { class: 'position__index', text: `Position ${index + 1}` }),
        el('div', { class: 'position__controls' }, [
          el('button', {
            type: 'button',
            class: 'button button--subtle',
            text: '↑',
            disabled: index === 0,
            title: 'Move up',
            on: { click: () => structuralChange((content) => movePosition(content, positionId, -1)) },
          }),
          el('button', {
            type: 'button',
            class: 'button button--subtle',
            text: '↓',
            disabled: index === total - 1,
            title: 'Move down',
            on: { click: () => structuralChange((content) => movePosition(content, positionId, 1)) },
          }),
          el('button', {
            type: 'button',
            class: 'button button--subtle button--danger',
            text: 'Delete',
            disabled: total <= slot.min,
            title: 'Delete this position',
            on: { click: () => structuralChange((content) => removePosition(content, positionId)) },
          }),
        ]),
      ]),
      select,
      detail,
    ]);

    refreshOptions();
    paintDetail();

    return { element, refreshOptions };
  }

  function paint() {
    const { positions } = store.getState();
    rows = positions.map((position, index) => createRow(position.id, index, positions.length));
    replace(list, rows.map((row) => row.element));
    count.textContent = `${positions.length} of ${slot.max} positions`;
    count.classList.toggle('positions-editor__count--at-limit', positions.length >= slot.max);
    addButton.disabled = positions.length >= slot.max;
  }

  paint();

  return el('div', { class: 'positions-editor' }, [
    list,
    el('div', { class: 'positions-editor__footer' }, [count, addButton]),
  ]);
}
