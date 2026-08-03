const cards = [...document.querySelectorAll('.mission-card')];
const progressText = document.getElementById('progressText');
const progressFill = document.getElementById('progressFill');

function key(card) {
  return `kakoku_done_${card.dataset.card}`;
}

function updateProgress() {
  const done = cards.filter(card => localStorage.getItem(key(card)) === '1').length;
  progressText.textContent = `${done} / ${cards.length} 完了`;
  progressFill.style.width = `${(done / cards.length) * 100}%`;
}

cards.forEach(card => {
  const toggle = card.querySelector('.card-toggle');
  const check = card.querySelector('.done-check');
  const stored = localStorage.getItem(key(card)) === '1';

  if (stored) {
    card.classList.add('completed');
    if (check) check.checked = true;
  }

  toggle.addEventListener('click', () => {
    const open = card.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  if (check) {
    check.addEventListener('change', () => {
      if (check.checked) {
        localStorage.setItem(key(card), '1');
        card.classList.add('completed');
      } else {
        localStorage.removeItem(key(card));
        card.classList.remove('completed');
      }
      updateProgress();
    });
  }
});

document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const text = btn.parentElement.querySelector('code').innerText;
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

document.getElementById('resetProgress').addEventListener('click', () => {
  cards.forEach(card => {
    localStorage.removeItem(key(card));
    card.classList.remove('completed');
    const check = card.querySelector('.done-check');
    if (check) check.checked = false;
  });
  updateProgress();
});

updateProgress();
