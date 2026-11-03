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
  const LANG_KEY = 'till-minne-language';
  const THEME_KEY = 'till-minne-theme';

  const translations = {
    sv: {
      title: 'Till minne av',
      metaDescription: 'En stilla plats för små tankar om dem vi saknar.',
      skipToMemories: 'Hoppa till minnen',
      searchLabel: 'Sök på namnet på den du minns',
      searchPlaceholder: 'Sök på namn',
      clearSearch: 'Rensa sökning',
      searchResults: 'Sökresultat',
      driftingMemories: 'Minnen i rörelse',
      hintIdle: 'Håll muspekaren för att pausa · klicka för att läsa',
      hintSearch: 'Klicka för att läsa · rensa sökningen för att återgå',
      leaveMemory: 'Lämna ett minne',
      inMemoryOf: 'Till minne av',
      closeMemory: 'Stäng minnet',
      closeForm: 'Stäng formuläret',
      formTitle: 'Lämna ett minne',
      formSub: 'Ett ögonblick, en vana, ett skratt, något du aldrig fick säga.',
      yourMemory: 'Ditt minne',
      memoryPlaceholder: 'Hon nynnade alltid medan hon lagade mat…',
      keepShort: 'Håll det kort och sant.',
      whoRemembering: 'Vem minns du?',
      theirName: 'Deras namn',
      yourName: 'Ditt namn',
      optional: 'valfritt',
      yourNamePlaceholder: 'Ditt namn',
      keepPrivate: 'Håll deras namn privat',
      shownAs: 'visas som ”någon kärt saknad”',
      sendAnon: 'Skicka anonymt',
      hideMyName: 'dölj mitt namn',
      whereGo: 'Var ska det hamna?',
      keepHere: 'Spara här',
      keepHereDesc: 'Sparas i minnesplatsen. Det driver med de andra och går att hitta via sökning.',
      intoVoid: 'Ut i tomheten',
      intoVoidDesc: 'Driver förbi en gång och är sedan borta. Inget sparas.',
      releaseIt: 'Släpp det',
      releasing: 'Släpper…',
      formNote: 'Privata namn lämnar aldrig din webbläsare. Allt annat delas offentligt.',
      noscript: 'Till minne av behöver JavaScript för att låta minnena driva. Aktivera det för att läsa eller lämna ett minne.',
      loading: 'Samlar minnen…',
      noMemories: 'Inga minnen ännu.',
      beFirst: 'Bli den första att lämna ett.',
      loadError: 'Det gick inte att nå minnesplatsen.',
      loadErrorDetail: 'Kontrollera att servern körs och försök igen.',
      tryAgain: 'Försök igen',
      couldNotLoad: 'Kunde inte ladda minnen',
      noResults: (term) => `Inga minnen hittades för ”${term}”.`,
      resultsFound: (count, term, scroll) => `${count} ${count === 1 ? 'minne' : 'minnen'} hittades för ”${term}”${scroll ? ' · rulla för att läsa alla' : ''}`,
      memoriesKept: (count) => `${count} ${count === 1 ? 'minne' : 'minnen'} bevarade`,
      forName: (name) => `Till minne av ${name}`,
      memoryAria: (name, text) => `Minne för ${name}: ${text}`,
      someoneDearlyMissed: 'någon kärt saknad',
      someoneWhoLoved: 'någon som älskade dem',
      leftBy: (name) => `Lämnat av ${name}`,
      leftJustNow: 'Lämnat precis nu',
      leftPrefix: 'Lämnat ',
      seeAll: (name) => `Se alla minnen av ${name}`,
      leaveFirstMemory: 'Lämna det första minnet',
      voidToast: 'Släppt ut i tomheten. Det sparas inte.',
      savedToast: 'Ditt minne är nu en del av molnet.',
      saveError: 'Ditt minne kunde inte sparas. Försök igen.',
      saveErrorToast: 'Ditt minne kunde inte sparas',
      validationText: 'Skriv ett minne först.',
      validationLength: `Ett minne kan vara högst ${MAX_TEXT} tecken.`,
      validationFor: 'Berätta vem minnet är till, eller håll namnet privat.',
      validationNames: `Namn kan vara högst ${MAX_NAME} tecken.`,
      serverError: 'Något gick fel.',
      tooMany: 'För många minnen på en gång. Vänta en liten stund.',
      requestTooLarge: 'Förfrågan är för stor.',
      invalidMemory: 'Minnet kunde inte sparas. Kontrollera uppgifterna.',
      unexpectedResponse: 'Servern svarade oväntat.',
      language: 'Språk',
      swedish: 'Svenska',
      english: 'English',
      switchToLight: 'Byt till ljust tema',
      switchToDark: 'Byt till mörkt tema',
    },
    en: {
      title: 'In memory of',
      metaDescription: 'A quiet place for small thoughts about the ones we miss.',
      skipToMemories: 'Skip to memories',
      searchLabel: 'Search by the name of who is remembered',
      searchPlaceholder: 'Search by name',
      clearSearch: 'Clear search',
      searchResults: 'Search results',
      driftingMemories: 'Drifting memories',
      hintIdle: 'Hover to pause · click to read',
      hintSearch: 'Click to read · clear search to return',
      leaveMemory: 'Leave a memory',
      inMemoryOf: 'In memory of',
      closeMemory: 'Close memory',
      closeForm: 'Close form',
      formTitle: 'Leave a memory',
      formSub: 'A moment, a habit, a laugh, something you never got to say.',
      yourMemory: 'Your memory',
      memoryPlaceholder: 'She always hummed while she cooked…',
      keepShort: 'Keep it short and true.',
      whoRemembering: 'Who are you remembering?',
      theirName: 'Their name',
      yourName: 'Your name',
      optional: 'optional',
      yourNamePlaceholder: 'Your name',
      keepPrivate: 'Keep their name private',
      shownAs: 'shown as “someone dearly missed”',
      sendAnon: 'Send anonymously',
      hideMyName: 'hide my name',
      whereGo: 'Where should it go?',
      keepHere: 'Keep it here',
      keepHereDesc: 'Stored in the memorial. It drifts with the others and can be found through search.',
      intoVoid: 'Into the void',
      intoVoidDesc: 'Drifts past once, then it is gone. Nothing is kept.',
      releaseIt: 'Release it',
      releasing: 'Releasing…',
      formNote: 'Private names never leave your browser. Everything else is shared publicly.',
      noscript: 'This memorial needs JavaScript to let the memories drift. Enable it to read or leave a memory.',
      loading: 'Gathering memories…',
      noMemories: 'No memories yet.',
      beFirst: 'Be the first to leave one.',
      loadError: 'The memorial could not be reached.',
      loadErrorDetail: 'Make sure the Sinatra server is running, then try again.',
      tryAgain: 'Try again',
      couldNotLoad: 'Could not load memories',
      noResults: (term) => `No memories found for “${term}”.`,
      resultsFound: (count, term, scroll) => `${count} ${count === 1 ? 'memory' : 'memories'} found for “${term}”${scroll ? ' · scroll to read them all' : ''}`,
      memoriesKept: (count) => `${count} ${count === 1 ? 'memory' : 'memories'} kept`,
      forName: (name) => `In memory of ${name}`,
      memoryAria: (name, text) => `Memory for ${name}: ${text}`,
      someoneDearlyMissed: 'someone dearly missed',
      someoneWhoLoved: 'someone who loved them',
      leftBy: (name) => `Left by ${name}`,
      leftJustNow: 'Left just now',
      leftPrefix: 'Left ',
      seeAll: (name) => `See all memories of ${name}`,
      leaveFirstMemory: 'Leave the first memory',
      voidToast: 'Released into the void. It will not be kept.',
      savedToast: 'Your memory is now part of the cloud.',
      saveError: 'Your memory could not be saved. Please try again.',
      saveErrorToast: 'Your memory could not be saved',
      validationText: 'Please write a memory first.',
      validationLength: `A memory can be at most ${MAX_TEXT} characters.`,
      validationFor: 'Tell us who this memory is for, or keep their name private.',
      validationNames: `Names can be at most ${MAX_NAME} characters.`,
      serverError: 'Something went wrong.',
      tooMany: 'Too many memories at once. Please wait a little while.',
      requestTooLarge: 'Request body is too large.',
      invalidMemory: 'The memory could not be saved. Please check the details.',
      unexpectedResponse: 'The server returned an unexpected response.',
      language: 'Language',
      swedish: 'Svenska',
      english: 'English',
      switchToLight: 'Switch to light theme',
      switchToDark: 'Switch to dark theme',
    },
  };

  let lang = 'sv';
  const t = (key, ...args) => {
    const value = translations[lang]?.[key] ?? translations.sv[key];
    return typeof value === 'function' ? value(...args) : value;
  };

  const els = {
    field: document.getElementById('field'),
    fieldState: document.getElementById('fieldState'),
    q: document.getElementById('q'),
    clr: document.getElementById('clr'),
    names: document.getElementById('names'),
    status: document.getElementById('status'),
    searchLeave: document.getElementById('searchLeave'),
    results: document.getElementById('results'),
    resultsInner: document.getElementById('resultsInner'),
    count: document.getElementById('count'),
    hint: document.querySelector('.hint'),
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
    langBtn: document.getElementById('langBtn'),
    langMenu: document.getElementById('langMenu'),
    langCode: document.getElementById('langCode'),
    themeBtn: document.getElementById('themeBtn'),
  };

  const state = {
    memories: [],
    names: [],
    total: 0,
    copies: new Map(),
    search: '',
    scrollBeforeSearch: 0,
    loaded: false,
    submitting: false,
    resultsOpen: false,
    activeModal: null,
    lastFocus: null,
    fieldState: null,
  };

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const systemTheme = window.matchMedia('(prefers-color-scheme: light)');
  let theme = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
  const relativeTimeFormats = {
    sv: new Intl.RelativeTimeFormat('sv', { numeric: 'auto' }),
    en: new Intl.RelativeTimeFormat('en', { numeric: 'auto' }),
  };
  const rnd = (min, max) => min + Math.random() * (max - min);
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const fold = (value) => String(value ?? '')
    .toLocaleLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '');
  const labelFor = (memory) => memory.for_name || t('someoneDearlyMissed');
  const byline = (memory) => memory.by_name || t('someoneWhoLoved');

  let toastTimer = null;
  let searchTimer = null;
  let resultsTimer = null;
  let resultsResetOnClose = false;
  let voidCounter = 0;

  const usesListLayout = () => reduceMotion.matches;
  let lastListLayout = usesListLayout();

  /* -------------------------------------------------------------
     Field state (loading / empty / error)
     ------------------------------------------------------------- */

  function paintFieldState() {
    const config = state.fieldState;
    if (!config) return;

    els.fieldState.replaceChildren();
    els.fieldState.dataset.kind = config.kind || '';
    els.fieldState.hidden = false;

    if (config.kind === 'loading') {
      const spinner = document.createElement('span');
      spinner.className = 'spinner';
      spinner.setAttribute('aria-hidden', 'true');
      els.fieldState.append(spinner);
    }

    const heading = document.createElement('p');
    heading.textContent = t(config.messageKey);
    els.fieldState.append(heading);

    if (config.detailKey) {
      const copy = document.createElement('p');
      copy.className = 'state-detail';
      copy.textContent = t(config.detailKey);
      els.fieldState.append(copy);
    }

    if (config.actionKey && config.onAction) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'state-btn';
      button.textContent = t(config.actionKey);
      button.addEventListener('click', config.onAction);
      els.fieldState.append(button);
    }
  }

  function setFieldState(config) {
    state.fieldState = config;
    paintFieldState();
  }

  function clearFieldState() {
    state.fieldState = null;
    els.fieldState.hidden = true;
    els.fieldState.replaceChildren();
    delete els.fieldState.dataset.kind;
  }

  /* -------------------------------------------------------------
     Language
     ------------------------------------------------------------- */

  function applyStaticTranslations() {
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = t(el.dataset.i18n);
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      el.placeholder = t(el.dataset.i18nPlaceholder);
    });

    document.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
      el.setAttribute('aria-label', t(el.dataset.i18nAriaLabel));
    });
  }

  function refreshMemoryLabels() {
    const byId = new Map(state.memories.map((memory) => [String(memory.id), memory]));

    state.memories.forEach((memory) => {
      const copies = state.copies.get(memory.id) || [];
      copies.forEach((el) => {
        const forLine = el.querySelector('.for');
        if (forLine) forLine.textContent = t('forName', labelFor(memory));
        el.setAttribute('aria-label', t('memoryAria', labelFor(memory), memory.text));
      });
    });

    els.resultsInner.querySelectorAll('.result').forEach((card) => {
      const memory = byId.get(card.dataset.id);
      if (!memory) return;

      const forLine = card.querySelector('.for');
      if (forLine) forLine.textContent = t('forName', labelFor(memory));
      card.setAttribute('aria-label', t('memoryAria', labelFor(memory), memory.text));
    });
  }

  function updateHint() {
    els.hint.textContent = state.search ? t('hintSearch') : t('hintIdle');
  }

  function readStoredLanguage() {
    try {
      return localStorage.getItem(LANG_KEY) === 'en' ? 'en' : 'sv';
    } catch {
      return 'sv';
    }
  }

  function persistLanguage() {
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch {
      // Storage may be unavailable; the page still switches for this visit.
    }
  }

  function storedTheme() {
    try {
      const value = localStorage.getItem(THEME_KEY);
      return value === 'light' || value === 'dark' ? value : null;
    } catch {
      return null;
    }
  }

  function updateThemeButton() {
    const label = theme === 'light' ? t('switchToDark') : t('switchToLight');
    els.themeBtn.setAttribute('aria-label', label);
    els.themeBtn.title = label;
  }

  function applyTheme(next, { persist = true } = {}) {
    theme = next === 'light' ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;

    if (persist) {
      try {
        localStorage.setItem(THEME_KEY, theme);
      } catch {
        // Storage may be unavailable; the theme still switches for this visit.
      }
    }

    const themeColor = theme === 'light' ? '#f6f0e4' : '#080b14';
    document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
      meta.content = themeColor;
    });

    updateThemeButton();
  }

  function setLanguageMenu(open) {
    els.langMenu.hidden = !open;
    els.langBtn.setAttribute('aria-expanded', String(open));

    if (!open) return;

    const selected = els.langMenu.querySelector('[aria-checked="true"]') || els.langMenu.querySelector('[data-lang]');
    selected?.focus();
  }

  function applyLanguage(nextLang, { persist = true } = {}) {
    lang = nextLang === 'en' ? 'en' : 'sv';
    if (persist) persistLanguage();

    document.documentElement.lang = lang;
    document.title = t('title');

    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = t('metaDescription');

    applyStaticTranslations();

    els.langCode.textContent = lang === 'sv' ? 'SV' : 'EN';
    els.langBtn.setAttribute('aria-label', `${t('language')}: ${lang === 'sv' ? t('swedish') : t('english')}`);
    els.langBtn.title = t('language');
    updateThemeButton();
    els.langMenu.querySelectorAll('[data-lang]').forEach((option) => {
      option.setAttribute('aria-checked', String(option.dataset.lang === lang));
    });

    refreshMemoryLabels();
    if (state.loaded) refreshNames();
    if (els.count.textContent) updateCount();
    if (state.fieldState) paintFieldState();

    if (state.search) applySearch(els.q.value);
    else updateHint();

    els.send.textContent = state.submitting ? t('releasing') : t('releaseIt');
    updateValid();
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
    forLine.textContent = t('forName', labelFor(memory));

    inner.append(text, forLine);
    el.append(inner);

    el.setAttribute('aria-label', t('memoryAria', labelFor(memory), memory.text));

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

    const listLayout = usesListLayout();

    if (fresh && listLayout) {
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
    if (once && listLayout) {
      window.setTimeout(() => {
        el.classList.add('leaving');
        window.setTimeout(() => el.remove(), 600);
      }, 9000);
    }

    return el;
  }

  function driftLayout() {
    const viewportHeight = window.innerHeight;
    const compact = window.innerWidth <= 680;
    const headerBottom = document.querySelector('.site-header')?.getBoundingClientRect().bottom || 0;
    const bottomReserve = compact ? 152 : 130;
    const available = Math.max(240, viewportHeight - headerBottom - bottomReserve);
    const lanes = clamp(
      Math.floor(available / (compact ? 106 : 112)),
      2,
      compact ? 4 : 9,
    );
    const topMin = clamp(((headerBottom + 28) / viewportHeight) * 100, 18, 42);
    const topMax = clamp(((viewportHeight - bottomReserve) / viewportHeight) * 100, 68, 88);
    const limit = compact ? Math.min(8, lanes * 2) : Math.min(18, lanes * 3);

    return { lanes, limit, topMin, topMax };
  }

  function sampleMemories(limit) {
    if (state.memories.length <= limit) return state.memories;

    const step = state.memories.length / limit;
    return Array.from({ length: limit }, (_, index) => state.memories[Math.floor(index * step)]);
  }

  function removeFieldMessage(el) {
    const id = el.dataset.id;
    const copies = state.copies.get(id);

    if (copies) {
      const remaining = copies.filter((copy) => copy !== el);
      if (remaining.length > 0) state.copies.set(id, remaining);
      else state.copies.delete(id);
    }

    el.remove();
  }

  function pruneField() {
    if (usesListLayout()) return;

    const { limit } = driftLayout();
    const messages = [...els.field.querySelectorAll('.msg:not(.dupe):not(.once):not(.leaving)')];
    const excess = messages.length - limit;
    if (excess <= 0) return;

    messages
      .filter((el) => !el.classList.contains('fresh'))
      .slice(0, excess)
      .forEach((el) => {
        el.classList.add('leaving');
        window.setTimeout(() => removeFieldMessage(el), 600);
      });
  }

  function renderField() {
    els.field.querySelectorAll('.msg').forEach((el) => el.remove());
    state.copies.clear();

    if (usesListLayout()) {
      state.memories.forEach((memory) => spawn(memory));
      return;
    }

    if (state.memories.length === 0) return;

    const { lanes, limit, topMin, topMax } = driftLayout();
    const memories = sampleMemories(limit);
    const laneDurations = new Map();
    const laneCounts = new Map();

    memories.forEach((memory, index) => {
      const lane = index % lanes;
      laneCounts.set(lane, (laneCounts.get(lane) || 0) + 1);
    });

    memories.forEach((memory, index) => {
      const lane = index % lanes;
      const pass = Math.floor(index / lanes);
      const laneCount = laneCounts.get(lane);
      const top = clamp(
        topMin + ((lane + 0.5) / lanes) * (topMax - topMin) + rnd(-0.3, 0.3),
        topMin,
        topMax,
      );
      const el = spawn(memory, { top });
      let duration = parseFloat(el.style.getPropertyValue('--dur')) || 100;

      // Messages in a lane share a speed and are spaced evenly around the
      // drift path, so they never cross over each other.
      if (pass === 0) laneDurations.set(lane, duration);
      else duration = laneDurations.get(lane) || duration;

      const fraction = (0.08 + lane * 0.13 + pass / laneCount) % 1;
      el.style.setProperty('--dur', `${duration}s`);
      el.style.setProperty('--delay', `${-duration * fraction}s`);
    });
  }

  function updateCount() {
    els.count.textContent = t('memoriesKept', state.total);
  }

  function refreshNames() {
    const set = new Set(state.names.filter(Boolean));
    state.memories.forEach((memory) => {
      if (memory.for_name) set.add(memory.for_name);
    });

    const names = [...set].sort((a, b) => (
      a.localeCompare(b, lang === 'sv' ? 'sv' : 'en', { sensitivity: 'base' })
    ));
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
    closeResults({ immediate: true });
    setFieldState({ kind: 'loading', messageKey: 'loading' });

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
          messageKey: 'noMemories',
          detailKey: 'beFirst',
          actionKey: 'leaveMemory',
          onAction: () => openForm(),
        });
      }

      if (state.search) applySearch(els.q.value);
      return true;
    } catch (error) {
      console.error(error);
      setFieldState({
        kind: 'error',
        messageKey: 'loadError',
        detailKey: 'loadErrorDetail',
        actionKey: 'tryAgain',
        onAction: loadMemories,
      });
      toast(t('couldNotLoad'));
      return false;
    } finally {
      els.field.removeAttribute('aria-busy');
    }
  }

  /* -------------------------------------------------------------
     Search
     ------------------------------------------------------------- */

  function updateResultsOffset() {
    const header = document.querySelector('.site-header');
    const headerBottom = header?.getBoundingClientRect().bottom || 0;
    els.results.style.setProperty('--results-top', `${Math.round(Math.max(150, headerBottom + 18))}px`);
  }

  function createResultCard(memory, index) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'result enter';
    card.dataset.id = String(memory.id);
    card.style.setProperty('--enter-delay', `${Math.min(index * 18, 480)}ms`);
    card.setAttribute('aria-label', t('memoryAria', labelFor(memory), memory.text));

    const inner = document.createElement('span');
    inner.className = 'in';

    const text = document.createElement('span');
    text.className = 'text';
    text.textContent = memory.text;

    const forLine = document.createElement('span');
    forLine.className = 'for';
    forLine.textContent = t('forName', labelFor(memory));

    inner.append(text, forLine);
    card.append(inner);
    card.addEventListener('click', () => showMemory(memory));
    card.addEventListener('animationend', (event) => {
      if (event.animationName === 'result-in') card.classList.remove('enter');
    }, { once: true });

    return card;
  }

  function renderResults(matches) {
    els.resultsInner.classList.toggle('sparse', matches.length <= 6);

    const existing = new Map(
      [...els.resultsInner.querySelectorAll('.result')].map((card) => [card.dataset.id, card]),
    );
    const fragment = document.createDocumentFragment();

    matches.forEach((memory, index) => {
      const key = String(memory.id);
      let card = existing.get(key);

      if (card) {
        card.classList.remove('enter');
        existing.delete(key);
      } else {
        card = createResultCard(memory, index);
      }

      fragment.append(card);
    });

    existing.forEach((card) => card.remove());
    els.resultsInner.append(fragment);
  }

  function openResults(matches, { resetScroll = false } = {}) {
    window.clearTimeout(resultsTimer);
    resultsTimer = null;
    resultsResetOnClose = false;
    els.results.classList.remove('closing');

    if (!state.resultsOpen) {
      updateResultsOffset();
      els.results.hidden = false;
      state.resultsOpen = true;
      document.body.classList.add('results-open');
    }

    renderResults(matches);
    if (resetScroll) els.results.scrollTop = 0;
  }

  function resetSearchPresentation() {
    state.memories.forEach((memory) => {
      const el = state.copies.get(memory.id)?.[0];
      if (!el) return;

      el.classList.remove('match');
      el.removeAttribute('aria-hidden');
      el.tabIndex = 0;
    });
  }

  function closeResults({ immediate = false, resetSources = false } = {}) {
    window.clearTimeout(resultsTimer);
    resultsTimer = null;
    resultsResetOnClose = resetSources;

    const finish = () => {
      resultsTimer = null;
      els.results.hidden = true;
      els.results.classList.remove('closing');
      els.resultsInner.replaceChildren();
      document.body.classList.remove('results-open');
      els.results.scrollTop = 0;
      state.resultsOpen = false;

      if (resultsResetOnClose) {
        resultsResetOnClose = false;
        resetSearchPresentation();
      }
    };

    if (!state.resultsOpen) {
      finish();
      return;
    }

    if (immediate || reduceMotion.matches) {
      finish();
      return;
    }

    els.results.classList.add('closing');
    resultsTimer = window.setTimeout(finish, 300);
  }

  function updateSearchPresentation(matchIds, overlay) {
    state.memories.forEach((memory) => {
      const el = state.copies.get(memory.id)?.[0];
      if (!el) return;

      const match = matchIds.has(memory.id);
      el.classList.toggle('match', match);

      if (overlay) {
        el.setAttribute('aria-hidden', 'true');
        el.tabIndex = -1;
      } else if (match) {
        el.removeAttribute('aria-hidden');
        el.tabIndex = 0;
      } else {
        el.setAttribute('aria-hidden', 'true');
        el.tabIndex = -1;
      }
    });
  }

  function applySearch(rawValue) {
    const term = rawValue.trim();
    const normalized = fold(term);
    const searching = normalized.length > 0;
    const wasSearching = state.search.length > 0;
    const changed = normalized !== state.search;

    if (searching && !wasSearching) state.scrollBeforeSearch = els.field.scrollTop;

    state.search = normalized;
    els.clr.hidden = rawValue.length === 0;
    updateHint();
    document.body.classList.toggle('searching', searching);

    if (!searching) {
      els.field.scrollTop = state.scrollBeforeSearch;
      els.status.textContent = '';
      els.searchLeave.hidden = true;
      closeResults({ resetSources: true });
      return;
    }

    const matches = state.memories.filter((memory) => (
      memory.for_name && fold(memory.for_name).includes(normalized)
    ));
    const matchIds = new Set(matches.map((memory) => memory.id));
    const overlay = !usesListLayout();

    updateSearchPresentation(matchIds, overlay);

    if (matches.length === 0) {
      els.status.textContent = t('noResults', term);
      els.searchLeave.hidden = false;
    } else {
      els.status.textContent = t('resultsFound', matches.length, term, matches.length > 6);
      els.searchLeave.hidden = true;
    }

    if (overlay) {
      if (matches.length > 0) {
        updateResultsOffset();
        openResults(matches, { resetScroll: changed });
      } else {
        closeResults();
      }
    } else {
      closeResults({ immediate: true });
      if (changed) els.field.scrollTop = 0;
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
    if (Math.abs(diff) < 60000) return t('leftJustNow');

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
        return `${t('leftPrefix')}${relativeTimeFormats[lang].format(Math.round(diff / ms), unit)}`;
      }
    }

    return t('leftJustNow');
  }

  function showMemory(memory) {
    els.vFor.textContent = labelFor(memory);
    els.vText.textContent = `\u201C${memory.text}\u201D`;
    els.vBy.textContent = t('leftBy', byline(memory));

    const when = formatWhen(memory.created_at);
    els.vWhen.textContent = when;
    els.vWhen.hidden = !when;

    const date = memory.created_at ? new Date(memory.created_at) : null;
    els.vWhen.title = date && !Number.isNaN(date.getTime())
      ? date.toLocaleString(lang === 'sv' ? 'sv-SE' : 'en-US')
      : '';

    const known = Boolean(memory.for_name && memory.for_name.trim());
    els.vMore.hidden = !known;

    if (known) {
      els.vMore.textContent = t('seeAll', memory.for_name);
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
    if (event.key === 'Escape' && !els.langMenu.hidden) {
      event.preventDefault();
      setLanguageMenu(false);
      els.langBtn.focus();
      return;
    }

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
    els.send.textContent = t('releaseIt');
    hideFormError();
    updateValid();
  }

  function serverErrorMessage(response, data) {
    if (lang === 'sv') {
      if (response.status === 413) return t('requestTooLarge');
      if (response.status === 429) return t('tooMany');
      if (response.status === 422) return t('invalidMemory');
      if (response.status >= 500) return t('serverError');
      return t('saveError');
    }

    return data?.error || t('serverError');
  }

  function localizedError(message) {
    const error = new Error(message);
    error.localized = true;
    return error;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (state.submitting) return;

    const text = els.fText.value.trim();
    const forName = els.anonFor.checked ? null : (els.fFor.value.trim() || null);
    const byName = els.anonBy.checked ? null : (els.fBy.value.trim() || null);
    const destination = els.formEl.querySelector('input[name="dest"]:checked')?.value || 'server';

    if (!text) {
      showFormError(t('validationText'));
      els.fText.focus();
      return;
    }
    if (text.length > MAX_TEXT) {
      showFormError(t('validationLength'));
      els.fText.focus();
      return;
    }
    if (!forName && !els.anonFor.checked) {
      showFormError(t('validationFor'));
      els.fFor.focus();
      return;
    }
    if ((forName && forName.length > MAX_NAME) || (byName && byName.length > MAX_NAME)) {
      showFormError(t('validationNames'));
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
      toast(t('voidToast'));
      return;
    }

    state.submitting = true;
    els.send.textContent = t('releasing');
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

      if (!response.ok) throw localizedError(serverErrorMessage(response, data));
      if (!data || data.id === undefined) throw localizedError(t('unexpectedResponse'));

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
        pruneField();
        els.field.scrollTop = 0;
      }

      updateCount();
      refreshNames();
      toast(t('savedToast'));
    } catch (error) {
      console.error(error);
      showFormError(error.localized ? error.message : t('saveError'));
      toast(t('saveErrorToast'));
    } finally {
      state.submitting = false;
      els.send.textContent = t('releaseIt');
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

  function handleLayoutChange() {
    const nextListLayout = usesListLayout();

    if (nextListLayout !== lastListLayout) {
      lastListLayout = nextListLayout;
      renderField();
    }

    if (state.search) applySearch(els.q.value);
  }

  function bindEvents() {
    let touchResumeTimer = null;

    const pauseFieldForTouch = (event) => {
      if (event.pointerType === 'mouse') return;
      window.clearTimeout(touchResumeTimer);
      document.body.classList.add('field-paused');
    };

    const resumeFieldAfterTouch = () => {
      window.clearTimeout(touchResumeTimer);
      touchResumeTimer = window.setTimeout(() => {
        document.body.classList.remove('field-paused');
      }, 140);
    };

    els.field.addEventListener('pointerdown', pauseFieldForTouch);
    window.addEventListener('pointerup', resumeFieldAfterTouch);
    window.addEventListener('pointercancel', resumeFieldAfterTouch);
    window.addEventListener('blur', () => {
      window.clearTimeout(touchResumeTimer);
      document.body.classList.remove('field-paused');
    });

    els.themeBtn.addEventListener('click', () => {
      applyTheme(theme === 'light' ? 'dark' : 'light');
    });

    systemTheme.addEventListener('change', (event) => {
      if (storedTheme()) return;
      applyTheme(event.matches ? 'light' : 'dark', { persist: false });
    });

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

    els.langBtn.addEventListener('click', () => {
      setLanguageMenu(els.langMenu.hidden);
    });

    els.langBtn.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
      event.preventDefault();
      setLanguageMenu(true);

      const options = [...els.langMenu.querySelectorAll('[data-lang]')];
      const target = event.key === 'ArrowDown' ? options[0] : options[options.length - 1];
      target?.focus();
    });

    els.langMenu.addEventListener('click', (event) => {
      const option = event.target.closest('[data-lang]');
      if (!option) return;

      applyLanguage(option.dataset.lang);
      setLanguageMenu(false);
      els.langBtn.focus();
    });

    els.langMenu.addEventListener('keydown', (event) => {
      const options = [...els.langMenu.querySelectorAll('[data-lang]')];
      const index = options.indexOf(document.activeElement);

      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const step = event.key === 'ArrowDown' ? 1 : -1;
        const next = index < 0 ? 0 : (index + step + options.length) % options.length;
        options[next]?.focus();
        return;
      }

      if (event.key === 'Tab') setLanguageMenu(false);
    });

    document.addEventListener('click', (event) => {
      if (els.langMenu.hidden) return;
      if (event.target.closest('.lang-switch')) return;
      setLanguageMenu(false);
    });

    document.addEventListener('keydown', onKeydown);

    window.addEventListener('resize', handleLayoutChange);
    reduceMotion.addEventListener('change', handleLayoutChange);
  }

  function init() {
    applyTheme(storedTheme() || (systemTheme.matches ? 'light' : 'dark'), { persist: false });
    applyLanguage(readStoredLanguage(), { persist: false });
    bindEvents();
    loadMemories();
  }

  init();
})();
