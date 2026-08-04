const startPanel = document.getElementById('startPanel');
const stage = document.getElementById('stage');
const startButton = document.getElementById('startButton');
const audio = document.getElementById('endingAudio');
const titleScene = document.getElementById('titleScene');
const slideScene = document.getElementById('slideScene');
const finScene = document.getElementById('finScene');
const imageGrid = document.getElementById('imageGrid');
const slideCounter = document.getElementById('slideCounter');
const slideHeader = document.querySelector('.slide-header');

const IMAGE_COUNT = 21;
const GROUP_SIZE = 3;
const TITLE_MS = 3000;
const SLIDE_MS = 6000;
const FIN_MS = 5000;
const FADE_MS = 850;

const imagePaths = Array.from({ length: IMAGE_COUNT }, (_, index) => {
  const num = String(index + 1).padStart(2, '0');
  return `ending/images/${num}.png`;
});

const slides = [];
for (let i = 0; i < imagePaths.length; i += GROUP_SIZE) {
  slides.push(imagePaths.slice(i, i + GROUP_SIZE));
}

function showScene(scene) {
  [titleScene, slideScene, finScene].forEach(item => {
    item.classList.remove('active');
    if (item !== scene) item.hidden = true;
  });
  scene.hidden = false;
  requestAnimationFrame(() => scene.classList.add('active'));
}

function renderSlide(index) {
  const paths = slides[index] || [];
  imageGrid.innerHTML = '';
  slideCounter.textContent = `${index + 1} / ${slides.length}`;

  paths.forEach((path, slotIndex) => {
    const slot = document.createElement('div');
    slot.className = 'image-slot';
    slot.style.setProperty('--delay', `${slotIndex * 0.12}s`);

    const img = document.createElement('img');
    img.src = path;
    img.alt = `MISSION 2 提出画像 ${index * GROUP_SIZE + slotIndex + 1}`;
    img.onerror = () => {
      slot.classList.add('missing');
      slot.textContent = `${path}
画像を配置してください`;
      img.remove();
    };

    slot.appendChild(img);
    imageGrid.appendChild(slot);
  });
}

function transitionToSlide(index) {
  if (!imageGrid.children.length) {
    renderSlide(index);
    return;
  }

  imageGrid.classList.add('is-fading');
  slideHeader.classList.add('is-fading');

  setTimeout(() => {
    renderSlide(index);
    requestAnimationFrame(() => {
      imageGrid.classList.remove('is-fading');
      slideHeader.classList.remove('is-fading');
    });
  }, FADE_MS);
}

function scheduleEnding() {
  showScene(titleScene);

  setTimeout(() => {
    showScene(slideScene);
    renderSlide(0);
  }, TITLE_MS);

  slides.forEach((_, index) => {
    if (index === 0) return;
    setTimeout(() => {
      showScene(slideScene);
      transitionToSlide(index);
    }, TITLE_MS + SLIDE_MS * index);
  });

  setTimeout(() => {
    showScene(finScene);
  }, TITLE_MS + SLIDE_MS * slides.length);

  setTimeout(() => {
    if (!audio.paused) audio.pause();
  }, TITLE_MS + SLIDE_MS * slides.length + FIN_MS + 800);
}

startButton.addEventListener('click', async () => {
  startPanel.hidden = true;
  stage.hidden = false;
  try {
    audio.currentTime = 0;
    await audio.play();
  } catch (error) {
    // 音声再生に失敗してもスライドショーは開始する。
    console.warn('Audio playback failed:', error);
  }
  scheduleEnding();
});
