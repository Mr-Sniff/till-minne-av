/* ---------------------------------------------------------------
   Remembered — frontend
   The field talks to the Sinatra API at /api/memories.
   --------------------------------------------------------------- */

(() => {
  'use strict';

  const API_URL = '/api/memories';
  const MAX_TEXT = 400;
  const MAX_NAME = 80;
  const LOAD_LIMIT = 500;

  const els = {
    field: document.getElementById('field'),
    fieldState: document.getElementById('fieldState'),
    q: document.getElementById('q'),
    clr: document.getElementById('clr'),
    names: document.getElementById('names'),
    status: document.getElementById('status'),
    searchLeave: document.getElementById('searchLeave'),
    count: document.getElementById('count'),
    open: document.getElementById('open'),
    view: document.getElementById('view'),
    form: document.getElementById('form'),
    vFor: document.getElementById('vFor'),
    vText: document.getElementById('vText'),
    vBy: document.getElementById('vBy'),
    vWhen: document.getElementById('vWhen'),
    vMore: document.getElementById('vMore'),
    formEl: document.getElementById('memory-form'),
    fText: document.getElementById('fText'),
    fFor: document.getElementById('fFor'),
    fBy: document.getElementById('fBy'),
    anonFor: document.getElementById('anonFor'),
    anonBy: document.getElementById('anonBy'),
    charCount: document.getElementById('charCount'),
    send: document.getElementById('send'),
    formError: document.getElementById('formError'),
    toast: document.getElementById('toast'),
  };

  const state = {
    memories: [],
    names: [],
    total: 0,
    copies: new Map(),
    search: '',
    loaded: false,
    submitting: false,
    activeModal: null,
    lastFocus: null,
  };

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const relativeTime = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
  const rnd = (min, max) => min + Math.random() * (max - min);
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const fold = (value) => String(value ?? '')
    .toLocaleLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '');
  const labelFor = (memory) => memory.for_name || 'someone dearly missed';
  const byline = (memory) => memory.by_name || 'someone who loved them';
  const plural = (count, one, many) => `${count} ${count === 1 ? one : many}`;

  let toastTimer = null;
  let searchTimer = null;
  let voidCounter = 0;

  /* -------------------------------------------------------------
     Field state (loading / empty / error)
     ------------------------------------------------------------- */

  function setFieldState({ kind, message, detail, actionLabel, onAction }) {
    els.fieldState.replaceChildren();
    els.fieldState.dataset.kind = kind || '';
    els.fieldState.hidden = false;

    if (kind === 'loading') {
      const spinner = document.createElement('span');
      spinner.className = 'spinner';
      spinner.setAttribute('aria-hidden', 'true');
      els.fieldState.append(spinner);
    }

    const heading = document.createElement('p');
    heading.textContent = message;
    els.fieldState.append(heading);

    if (detail) {
      const copy = document.createElement('p');
      copy.className = 'state-detail';
      copy.textContent = detail;
      els.fieldState.append(copy);
    }

    if (actionLabel && onAction) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'state-btn';
      button.textContent = actionLabel;
      button.addEventListener('click', onAction);
      els.fieldState.append(button);
    }
  }

  function clearFieldState() {
    els.fieldState.hidden = true;
    els.fieldState.replaceChildren();
    delete els.fieldState.dataset.kind;
  }

  /* -------------------------------------------------------------
     Drifting messages
     ------------------------------------------------------------- */

  function spawn(memory, options = {}) {
    const {
      dupe = false,
      fresh = false,
      once = false,
      top = rnd(24, 82),
    } = options;

    const depthRoll = Math.random();
    const depth = depthRoll < 0.3 ? 0 : depthRoll < 0.72 ? 1 : 2;
    const duration = [150, 105, 78][depth] * rnd(0.85, 1.2);

    const el = document.createElement('button');
    el.type = 'button';
    el.className = `msg d${depth}${dupe ? ' dupe' : ''}${fresh ? ' fresh' : ''}${once ? ' once void' : ''}`;
    el.dataset.id = String(memory.id);
    el.style.top = `${top}%`;
    el.style.setProperty('--dur', `${duration}s`);
    el.style.setProperty('--bob', `${rnd(5, 9)}s`);
    el.style.setProperty('--by', `${rnd(-14, 14)}px`);
    el.style.setProperty('--delay', once ? '0s' : `${-rnd(0, duration)}s`);

    const inner = document.createElement('span');
    inner.className = 'in';

    const text = document.createElement('span');
    text.className = 'text';
    text.textContent = memory.text;

    const forLine = document.createElement('span');
    forLine.className = 'for';
    forLine.textContent = `for ${labelFor(memory)}`;

    inner.append(text, forLine);
    el.append(inner);

    el.setAttribute('aria-label', `Memory for ${labelFor(memory)}: ${memory.text}`);

    if (dupe) {
      el.tabIndex = -1;
      el.setAttribute('aria-hidden', 'true');
    }

    el.addEventListener('click', () => showMemory(memory));

    if (once) {
      el.addEventListener('animationend', (event) => {
        if (event.animationName === 'drift') el.remove();
      });
    }

    const listMode = reduceMotion.matches || window.innerWidth <= 680;

    if (fresh && listMode) {
      els.field.prepend(el);
    } else {
      els.field.append(el);
    }

    if (!once) {
      const copies = state.copies.get(memory.id) || [];
      copies.push(el);
      state.copies.set(memory.id, copies);
    }

    if (fresh) {
      const width = el.offsetWidth || Math.min(560, window.innerWidth * 0.78);
      const viewportWidth = window.innerWidth;
      const left = Math.max(14, viewportWidth - width - 40);
      const fraction = (viewportWidth - left) / (viewportWidth + width * 1.1);

      el.style.setProperty('--delay', `${-duration * fraction}s`);
      window.setTimeout(() => el.classList.remove('fresh'), 9000);
    }

    // List mode has no drift animation to fire animationend.
    if (once && listMode) {
      window.setTimeout(() => {
        el.classList.add('leaving');
        window.setTimeout(() => el.remove(), 600);
      }, 9000);
    }

    return el;
  }

  function renderField() {
    els.field.querySelectorAll('.msg').forEach((el) => el.remove());
    state.copies.clear();

    state.memories.forEach((memory, index) => {
      const spread = (index * 0.61803398875) % 1;
      spawn(memory, { top: clamp(22 + spread * 60 + rnd(-2, 2), 20, 84) });
    });

    if (!reduceMotion.matches && window.innerWidth > 680 && state.memories.length > 0) {
      const target = Math.min(18, Math.max(6, Math.ceil(state.memories.length * 1.3)));
      let guard = 0;

      while (els.field.querySelectorAll('.msg').length < target && guard < target * 3) {
        const memory = state.memories[guard % state.memories.length];
        spawn(memory, { dupe: true, top: rnd(22, 82) });
        guard += 1;
      }
    }
  }

  function updateCount() {
    els.count.textContent = `${plural(state.total, 'memory', 'memories')} kept`;
  }

  function refreshNames() {
    const set = new Set(state.names.filter(Boolean));
    state.memories.forEach((memory) => {
      if (memory.for_name) set.add(memory.for_name);
    });

    const names = [...set].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    els.names.replaceChildren(...names.map((name) => {
      const option = document.createElement('option');
      option.value = name;
      return option;
    }));
  }

  async function loadMemories() {
    state.loaded = false;
    els.field.setAttribute('aria-busy', 'true');
    els.field.querySelectorAll('.msg').forEach((el) => el.remove());
    state.copies.clear();
    setFieldState({ kind: 'loading', message: 'Gathering memories\u2026' });

    try {
      const response = await fetch(`${API_URL}?limit=${LOAD_LIMIT}`, {
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) throw new Error(`Server responded ${response.status}`);
      const data = await response.json();

      state.memories = Array.isArray(data.memories) ? data.memories : [];
      state.names = Array.isArray(data.names) ? data.names : [];
      state.total = Number.isFinite(data.total) ? data.total : state.memories.length;
      state.loaded = true;

      clearFieldState();
      renderField();
      els.field.scrollTop = 0;
      refreshNames();
      updateCount();

      if (state.memories.length === 0) {
        setFieldState({
          kind: 'empty',
          message: 'No memories yet.',
          detail: 'Be the first to leave one.',
          actionLabel: 'Leave a memory',
          onAction: () => openForm(),
        });
      }

      if (state.search) applySearch(els.q.value);
      return true;
    } catch (error) {
      console.error(error);
      setFieldState({
        kind: 'error',
        message: 'The memorial could not be reached.',
        detail: 'Make sure the Sinatra server is running, then try again.',
        actionLabel: 'Try again',
        onAction: loadMemories,
      });
      toast('Could not load memories');
      return false;
    } finally {
      els.field.removeAttribute('aria-busy');
    }
  }

  /* -------------------------------------------------------------
     Search
     ------------------------------------------------------------- */

  function applySearch(rawValue) {
    const term = rawValue.trim();
    const normalized = fold(term);
    const searching = normalized.length > 0;

    state.search = normalized;
    els.clr.hidden = rawValue.length === 0;
    document.body.classList.toggle('searching', searching);
    els.field.scrollTop = 0;

    // Put every primary message back where it started before applying a new search.
    state.memories.forEach((memory) => {
      const el = state.copies.get(memory.id)?.[0];
      if (!el) return;

      el.classList.remove('match');
      el.removeAttribute('aria-hidden');
      el.tabIndex = 0;

      if (el.dataset.baseTop !== undefined) {
        el.style.top = el.dataset.baseTop;
        delete el.dataset.baseTop;
      }
      if (el.dataset.baseDelay !== undefined) {
        el.style.setProperty('--delay', el.dataset.baseDelay);
        delete el.dataset.baseDelay;
      }
    });

    if (!searching) {
      els.status.textContent = '';
      els.searchLeave.hidden = true;
      return;
    }

    const matches = state.memories.filter((memory) => (
      memory.for_name && fold(memory.for_name).includes(normalized)
    ));
    const matchIds = new Set(matches.map((memory) => memory.id));

    // Dim and remove non-matches from the accessibility tree.
    state.memories.forEach((memory) => {
      if (matchIds.has(memory.id)) return;
      const el = state.copies.get(memory.id)?.[0];
      if (!el) return;
      el.setAttribute('aria-hidden', 'true');
      el.tabIndex = -1;
    });

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const narrow = viewportWidth < 700;
    const count = matches.length;
    const columns = narrow || count <= 1 ? 1 : Math.min(2, count);
    const rows = Math.max(1, Math.ceil(count / columns));
    const headerBottom = document.querySelector('.site-header')?.getBoundingClientRect().bottom || 0;
    const topMin = clamp(((headerBottom + 14) / viewportHeight) * 100, 20, 54);
    const topMax = 80;
    const cellWidth = viewportWidth / columns;

    matches.forEach((memory, index) => {
      const el = state.copies.get(memory.id)?.[0];
      if (!el) return;

      el.classList.add('match');
      el.removeAttribute('aria-hidden');
      el.tabIndex = 0;

      if (el.dataset.baseTop === undefined) el.dataset.baseTop = el.style.top;
      if (el.dataset.baseDelay === undefined) el.dataset.baseDelay = el.style.getPropertyValue('--delay');

      const row = index % rows;
      const column = Math.floor(index / rows);
      const width = el.offsetWidth || Math.min(560, viewportWidth * 0.78);
      const targetCenter = (column + 0.5) * cellWidth;
      const left = clamp(targetCenter - width / 2, 14, viewportWidth - width - 14);
      const fraction = (viewportWidth - left) / (viewportWidth + width * 1.1);
      const top = topMin + ((row + 0.5) / rows) * (topMax - topMin);
      const duration = parseFloat(el.style.getPropertyValue('--dur')) || 100;

      el.style.top = `${top}%`;
      el.style.setProperty('--delay', `${-duration * fraction}s`);
    });

    if (matches.length === 0) {
      els.status.textContent = `No memories found for \u201C${term}\u201D.`;
      els.searchLeave.hidden = false;
    } else {
      els.status.textContent = `${plural(matches.length, 'memory', 'memories')} found for \u201C${term}\u201D`;
      els.searchLeave.hidden = true;
    }
  }

  /* -------------------------------------------------------------
     Memory dialog
     ------------------------------------------------------------- */

  function formatWhen(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    const diff = date.getTime() - Date.now();
    if (Math.abs(diff) < 60000) return 'Left just now';

    const units = [
      ['year', 31536000000],
      ['month', 2592000000],
      ['week', 604800000],
      ['day', 86400000],
      ['hour', 3600000],
      ['minute', 60000],
    ];

    for (const [unit, ms] of units) {
      if (Math.abs(diff) >= ms) {
        return `Left ${relativeTime.format(Math.round(diff / ms), unit)}`;
      }
    }

    return 'Left just now';
  }

  function showMemory(memory) {
    els.vFor.textContent = labelFor(memory);
    els.vText.textContent = `\u201C${memory.text}\u201D`;
    els.vBy.textContent = `Left by ${byline(memory)}`;

    const when = formatWhen(memory.created_at);
    els.vWhen.textContent = when;
    els.vWhen.hidden = !when;

    const date = memory.created_at ? new Date(memory.created_at) : null;
    els.vWhen.title = date && !Number.isNaN(date.getTime()) ? date.toLocaleString() : '';

    const known = Boolean(memory.for_name && memory.for_name.trim());
    els.vMore.hidden = !known;

    if (known) {
      els.vMore.textContent = `See all memories of ${memory.for_name}`;
      els.vMore.onclick = () => {
        closeModal();
        els.q.value = memory.for_name;
        applySearch(memory.for_name);
        els.q.focus();
      };
    } else {
      els.vMore.onclick = null;
    }

    openModal(els.view, els.view.querySelector('.x'));
  }

  /* -------------------------------------------------------------
     Modals & focus
     ------------------------------------------------------------- */

  function openModal(modal, focusTarget) {
    if (state.activeModal && state.activeModal !== modal) {
      state.activeModal.classList.remove('open');
      state.activeModal.hidden = true;
    }

    if (!state.activeModal) state.lastFocus = document.activeElement;

    state.activeModal = modal;
    modal.hidden = false;
    modal.classList.add('open');
    document.body.classList.add('paused');

    window.requestAnimationFrame(() => {
      const target = focusTarget || modal.querySelector('button:not([hidden]), input, textarea');
      if (target && typeof target.focus === 'function') target.focus();
    });
  }

  function closeModal() {
    if (!state.activeModal) return;

    const modal = state.activeModal;
    modal.classList.remove('open');
    modal.hidden = true;
    state.activeModal = null;
    document.body.classList.remove('paused');

    const target = state.lastFocus;
    state.lastFocus = null;

    if (target && target !== document.body && document.contains(target)) {
      target.focus();
    } else {
      els.open.focus();
    }
  }

  function onKeydown(event) {
    if (event.key === 'Escape') {
      if (state.activeModal) {
        event.preventDefault();
        closeModal();
        return;
      }
      if (state.search) {
        els.q.value = '';
        applySearch('');
        els.q.blur();
      }
      return;
    }

    if (event.key !== 'Tab' || !state.activeModal) return;

    const focusables = [...state.activeModal.querySelectorAll(
      'button:not([disabled]):not([hidden]), input:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
    )].filter((el) => el.offsetParent !== null && !el.hidden);

    if (focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  /* -------------------------------------------------------------
     Form
     ------------------------------------------------------------- */

  function hideFormError() {
    els.formError.hidden = true;
    els.formError.textContent = '';
  }

  function showFormError(message) {
    els.formError.textContent = message;
    els.formError.hidden = false;
  }

  function updateValid() {
    const text = els.fText.value;
    const textOk = text.trim().length > 0 && text.length <= MAX_TEXT;
    const forOk = els.anonFor.checked || els.fFor.value.trim().length > 0;

    els.send.disabled = state.submitting || !textOk || !forOk;
    els.charCount.textContent = `${text.length} / ${MAX_TEXT}`;
    els.charCount.classList.toggle('over', text.length > MAX_TEXT);
  }

  function openForm(prefillFor = '') {
    hideFormError();

    if (prefillFor) {
      els.anonFor.checked = false;
      els.fFor.disabled = false;
      els.fFor.value = prefillFor;
    }

    updateValid();
    openModal(els.form, els.fText);
  }

  function resetForm() {
    els.formEl.reset();
    els.fFor.disabled = false;
    els.fBy.disabled = false;
    els.send.textContent = 'Release it';
    hideFormError();
    updateValid();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (state.submitting) return;

    const text = els.fText.value.trim();
    const forName = els.anonFor.checked ? null : (els.fFor.value.trim() || null);
    const byName = els.anonBy.checked ? null : (els.fBy.value.trim() || null);
    const destination = els.formEl.querySelector('input[name="dest"]:checked')?.value || 'server';

    if (!text) {
      showFormError('Please write a memory first.');
      els.fText.focus();
      return;
    }
    if (text.length > MAX_TEXT) {
      showFormError(`A memory can be at most ${MAX_TEXT} characters.`);
      els.fText.focus();
      return;
    }
    if (!forName && !els.anonFor.checked) {
      showFormError('Tell us who this memory is for, or keep their name private.');
      els.fFor.focus();
      return;
    }
    if ((forName && forName.length > MAX_NAME) || (byName && byName.length > MAX_NAME)) {
      showFormError(`Names can be at most ${MAX_NAME} characters.`);
      return;
    }

    hideFormError();

    if (destination === 'void') {
      const memory = {
        id: `void-${Date.now()}-${voidCounter += 1}`,
        text,
        for_name: forName,
        by_name: byName,
        created_at: new Date().toISOString(),
      };

      closeModal();
      resetForm();
      if (state.search) {
        els.q.value = '';
        applySearch('');
      }
      spawn(memory, { once: true, fresh: true, top: rnd(28, 72) });
      els.field.scrollTop = 0;
      toast('Released into the void. It will not be kept.');
      return;
    }

    state.submitting = true;
    els.send.textContent = 'Releasing\u2026';
    updateValid();

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ text, for_name: forName, by_name: byName }),
      });

      let data = null;
      try {
        data = await response.json();
      } catch {
        // The status code below produces the useful error.
      }

      if (!response.ok) throw new Error(data?.error || `The server responded ${response.status}.`);
      if (!data || data.id === undefined) throw new Error('The server returned an unexpected response.');

      const wasLoaded = state.loaded;

      if (!wasLoaded) {
        const refreshed = await loadMemories();

        if (!refreshed) {
          clearFieldState();
          state.memories = [data];
          state.total = 1;
          state.loaded = true;
          if (data.for_name) state.names = [data.for_name];
          renderField();
        }
      } else {
        state.memories.push(data);
        state.total += 1;
        if (data.for_name) state.names = [...new Set([...state.names, data.for_name])];
      }

      closeModal();
      resetForm();
      clearFieldState();

      if (state.search) {
        els.q.value = '';
        applySearch('');
      }

      if (wasLoaded) {
        spawn(data, { fresh: true, top: rnd(26, 74) });
        els.field.scrollTop = 0;
      }

      updateCount();
      refreshNames();
      toast('Your memory is now part of the cloud.');
    } catch (error) {
      console.error(error);
      showFormError(error.message || 'Your memory could not be saved. Please try again.');
      toast('Your memory could not be saved');
    } finally {
      state.submitting = false;
      els.send.textContent = 'Release it';
      updateValid();
    }
  }

  /* -------------------------------------------------------------
     Toast & events
     ------------------------------------------------------------- */

  function toast(message) {
    els.toast.textContent = message;
    els.toast.classList.add('show');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => els.toast.classList.remove('show'), 4200);
  }

  function bindEvents() {
    els.q.addEventListener('input', () => {
      window.clearTimeout(searchTimer);
      searchTimer = window.setTimeout(() => applySearch(els.q.value), 110);
    });

    els.q.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      window.clearTimeout(searchTimer);
      applySearch(els.q.value);
    });

    els.clr.addEventListener('click', () => {
      els.q.value = '';
      applySearch('');
      els.q.focus();
    });

    els.searchLeave.addEventListener('click', () => openForm(els.q.value.trim()));
    els.open.addEventListener('click', () => openForm());

    document.querySelectorAll('[data-close]').forEach((button) => {
      button.addEventListener('click', closeModal);
    });

    document.querySelectorAll('.overlay').forEach((overlay) => {
      overlay.addEventListener('click', (event) => {
        if (event.target === overlay) closeModal();
      });
    });

    els.formEl.addEventListener('submit', handleSubmit);

    els.fText.addEventListener('input', () => {
      hideFormError();
      updateValid();
    });

    els.fFor.addEventListener('input', () => {
      hideFormError();
      updateValid();
    });

    els.fBy.addEventListener('input', hideFormError);

    els.anonFor.addEventListener('change', () => {
      els.fFor.disabled = els.anonFor.checked;
      hideFormError();
      updateValid();
    });

    els.anonBy.addEventListener('change', () => {
      els.fBy.disabled = els.anonBy.checked;
      hideFormError();
    });

    document.addEventListener('keydown', onKeydown);

    window.addEventListener('resize', () => {
      if (state.search) applySearch(els.q.value);
    });
  }

  function init() {
    bindEvents();
    updateValid();
    loadMemories();
  }

  init();
})();
