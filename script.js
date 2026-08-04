const missionCards = [...document.querySelectorAll('.mission-card[data-card="m1"], .mission-card[data-card="m2"], .mission-card[data-card="m3"]')];
const allToggleCards = [...document.querySelectorAll('.mission-card')];
const progressText = document.getElementById('progressText');
const progressFill = document.getElementById('progressFill');
const finalMission = document.getElementById('finalMission');
const successScreen = document.getElementById('successScreen');
const escapeKeyword = document.getElementById('escapeKeyword');
const escapeButton = document.getElementById('escapeButton');
const escapeError = document.getElementById('escapeError');

function storageKey(card) {
  return `kakoku_done_${card.dataset.card}`;
}

function b64ToUtf8(base64) {
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
  return new TextDecoder('utf-8').decode(bytes);
}

function completedCount() {
  return missionCards.filter(card => localStorage.getItem(storageKey(card)) === '1').length;
}

function updateFinalVisibility() {
  const unlocked = completedCount() === missionCards.length;
  finalMission.hidden = !unlocked;
  if (!unlocked) {
    finalMission.classList.remove('open');
    const toggle = finalMission.querySelector('.card-toggle');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  }
}

function updateProgress() {
  const done = completedCount();
  progressText.textContent = `${done} / ${missionCards.length} 完了`;
  progressFill.style.width = `${(done / missionCards.length) * 100}%`;
  updateFinalVisibility();
}

allToggleCards.forEach(card => {
  const toggle = card.querySelector('.card-toggle');
  const check = card.querySelector('.done-check');

  if (card.dataset.card && localStorage.getItem(storageKey(card)) === '1') {
    card.classList.add('completed');
    if (check) check.checked = true;
  }

  if (toggle && !toggle.disabled) {
    toggle.addEventListener('click', () => {
      const open = card.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  if (check) {
    check.addEventListener('change', () => {
      if (check.checked) {
        localStorage.setItem(storageKey(card), '1');
        card.classList.add('completed');
      } else {
        localStorage.removeItem(storageKey(card));
        card.classList.remove('completed');
      }
      updateProgress();
    });
  }
});

document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const code = btn.parentElement.querySelector('code');
    const text = code ? code.innerText.trim() : '';
    try {
      await navigator.clipboard.writeText(text);
      btn.textContent = 'コピー済';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = 'コピー';
        btn.classList.remove('copied');
      }, 1600);
    } catch (e) {
      btn.textContent = '失敗';
      setTimeout(() => btn.textContent = 'コピー', 1600);
    }
  });
});

function normalizeKeyword(value) {
  return value.trim().replace(/\s+/g, '');
}

function tryEscape() {
  const correctKeyword = b64ToUtf8(window.KAKOKU_KEYWORD_B64 || '');
  const input = normalizeKeyword(escapeKeyword.value);
  const correct = normalizeKeyword(correctKeyword);

  if (input === correct) {
    escapeError.hidden = true;
    localStorage.setItem('kakoku_escaped', '1');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      successScreen.hidden = false;
      successScreen.classList.add('show');
      document.body.classList.add('escape-complete');
    }, 260);
  } else {
    escapeError.hidden = false;
    escapeKeyword.focus();
  }
}

if (escapeButton) {
  escapeButton.addEventListener('click', tryEscape);
}
if (escapeKeyword) {
  escapeKeyword.addEventListener('keydown', event => {
    if (event.key === 'Enter') tryEscape();
  });
}

document.getElementById('resetProgress').addEventListener('click', () => {
  missionCards.forEach(card => {
    localStorage.removeItem(storageKey(card));
    card.classList.remove('completed');
    const check = card.querySelector('.done-check');
    if (check) check.checked = false;
  });
  localStorage.removeItem('kakoku_escaped');
  successScreen.hidden = true;
  successScreen.classList.remove('show');
  document.body.classList.remove('escape-complete');
  if (escapeKeyword) escapeKeyword.value = '';
  if (escapeError) escapeError.hidden = true;
  updateProgress();
});

if (localStorage.getItem('kakoku_escaped') === '1') {
  successScreen.hidden = false;
  successScreen.classList.add('show');
  document.body.classList.add('escape-complete');
}

updateProgress();
