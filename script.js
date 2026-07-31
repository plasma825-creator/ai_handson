const STORAGE_KEY = 'kakoku-asahidai-mission-progress-v1';
const cards = [...document.querySelectorAll('.mission-card[data-mission]')];
const progressCount = document.getElementById('progressCount');
const progressBar = document.getElementById('progressBar');
const resetButton = document.getElementById('resetProgress');

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {};
  } catch {
    return {};
  }
}

function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function updateView() {
  const progress = loadProgress();
  let doneCount = 0;

  cards.forEach((card) => {
    const key = card.dataset.mission;
    const done = Boolean(progress[key]);
    card.classList.toggle('is-done', done);
    card.setAttribute('aria-pressed', String(done));
    if (done) doneCount += 1;
  });

  progressCount.textContent = doneCount;
  progressBar.style.width = `${(doneCount / cards.length) * 100}%`;
}

function toggleCard(card) {
  const key = card.dataset.mission;
  const progress = loadProgress();
  progress[key] = !progress[key];
  saveProgress(progress);
  updateView();
}

cards.forEach((card) => {
  card.addEventListener('click', (event) => {
    if (event.target.closest('details') || event.target.closest('summary') || event.target.closest('pre')) return;
    toggleCard(card);
  });

  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleCard(card);
    }
  });
});

resetButton?.addEventListener('click', () => {
  localStorage.removeItem(STORAGE_KEY);
  updateView();
});

updateView();
