const quotes = {
  random: [
    { author: 'Fernando Pessoa', text: 'Todo vale la pena si el alma no es pequeña.' },
    { author: 'Antonio Machado', text: 'Se hace camino al andar.' },
    { author: 'Gustavo A. Bécquer', text: 'Podrá no haber poetas; pero siempre habrá poesía.' },
    { author: 'Sor Juana Inés de la Cruz', text: 'No estudio por saber más, sino por ignorar menos.' },
    { author: 'José Martí', text: 'Cultivo una rosa blanca.' }
  ],
  camino: { author: 'Antonio Machado', text: 'Se hace camino al andar.' },
  pessoa: { author: 'Fernando Pessoa', text: 'Todo vale la pena si el alma no es pequeña.' },
  suenos: { author: 'Fernando Pessoa', text: 'Tengo en mí todos los sueños del mundo.' },
  poesia: { author: 'Gustavo A. Bécquer', text: 'Podrá no haber poetas; pero siempre habrá poesía.' },
  rosa: { author: 'José Martí', text: 'Cultivo una rosa blanca.' },
  sorjuana: { author: 'Sor Juana Inés de la Cruz', text: 'No estudio por saber más, sino por ignorar menos.' },
  horizonte: { author: 'Antonio Machado', text: 'Caminante, no hay camino.' },
  musica: { author: 'Fernando Pessoa', text: 'La música es luna en la noche sombría de la vida.' },
  crear: { author: 'Idea de diseño', text: 'Lo simple también puede sentirse inolvidable.' },
  galeria: { author: 'Idea de diseño', text: 'Cada imagen guarda una forma distinta de mirar.' }
};

const toast = document.getElementById('toast');
const toastAuthor = document.getElementById('toastAuthor');
const toastText = document.getElementById('toastText');
const closeToast = document.getElementById('closeToast');
let toastTimer;

function pickQuote(key) {
  const item = quotes[key] || quotes.random;
  if (Array.isArray(item)) {
    return item[Math.floor(Math.random() * item.length)];
  }
  return item;
}

function showQuote(key = 'random') {
  const quote = pickQuote(key);
  toastAuthor.textContent = quote.author;
  toastText.textContent = quote.text;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 6200);
}

document.querySelectorAll('.quote-trigger').forEach((el) => {
  const handler = () => showQuote(el.dataset.quote || 'random');
  el.addEventListener('click', handler);
  el.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handler();
    }
  });
});

closeToast.addEventListener('click', () => toast.classList.remove('show'));

const scrollBtn = document.getElementById('scrollBtn');
scrollBtn.addEventListener('click', () => {
  document.getElementById('diseño').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.18 });

document.querySelectorAll('.section-reveal').forEach((section) => revealObserver.observe(section));

const cursorGlow = document.querySelector('.cursor-glow');
window.addEventListener('pointermove', (event) => {
  if (!cursorGlow) return;
  cursorGlow.style.left = `${event.clientX}px`;
  cursorGlow.style.top = `${event.clientY}px`;
});

const tiltCards = document.querySelectorAll('.tilt-card');
tiltCards.forEach((card) => {
  card.addEventListener('pointermove', (event) => {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const midX = rect.width / 2;
    const midY = rect.height / 2;
    const depth = Number(card.dataset.depth || 10);
    const rotateY = ((x - midX) / midX) * depth;
    const rotateX = ((midY - y) / midY) * depth;
    card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  card.addEventListener('pointerleave', () => {
    card.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg)';
  });
});

const themeBtn = document.getElementById('themeBtn');
themeBtn.addEventListener('click', () => {
  document.body.classList.toggle('light-mode');
});

// Música: primero intenta reproducir assets/music/clem.mp3.
// Si no existe, usa un sintetizador ambiental simple con Web Audio API.
const playBtn = document.getElementById('playBtn');
const musicCard = document.getElementById('musicCard');
const musicStatus = document.getElementById('musicStatus');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const loopBtn = document.getElementById('loopBtn');

let isPlaying = false;
let audio = null;
let usingAudioFile = false;
let audioReadyChecked = false;
let audioCtx = null;
let masterGain = null;
let oscillators = [];
let lfo = null;
let lfoGain = null;

async function checkAudioFile() {
  if (audioReadyChecked) return usingAudioFile;
  audioReadyChecked = true;
  try {
    const response = await fetch('assets/music/clem.mp3', { method: 'HEAD' });
    usingAudioFile = response.ok;
  } catch (_) {
    usingAudioFile = false;
  }
  return usingAudioFile;
}

function createSynth() {
  if (audioCtx) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  audioCtx = new AudioContext();
  masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.0001;
  masterGain.connect(audioCtx.destination);

  const notes = [146.83, 185.00, 220.00, 277.18]; // acorde suave
  oscillators = notes.map((frequency, index) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const pan = audioCtx.createStereoPanner ? audioCtx.createStereoPanner() : null;

    osc.type = index % 2 === 0 ? 'sine' : 'triangle';
    osc.frequency.value = frequency;
    gain.gain.value = 0.075;

    if (pan) {
      pan.pan.value = [-0.55, -0.15, 0.2, 0.55][index];
      osc.connect(gain);
      gain.connect(pan);
      pan.connect(masterGain);
    } else {
      osc.connect(gain);
      gain.connect(masterGain);
    }

    osc.start();
    return osc;
  });

  lfo = audioCtx.createOscillator();
  lfoGain = audioCtx.createGain();
  lfo.type = 'sine';
  lfo.frequency.value = 0.05;
  lfoGain.gain.value = 0.018;
  lfo.connect(lfoGain);
  lfoGain.connect(masterGain.gain);
  lfo.start();
}

async function playMusic() {
  const hasAudio = await checkAudioFile();

  if (hasAudio) {
    if (!audio) {
      audio = new Audio('assets/music/clem.mp3');
      audio.loop = true;
      audio.volume = 0.42;
    }
    await audio.play();
    musicStatus.textContent = 'Reproduciendo archivo · assets/music/clem.mp3';
  } else {
    createSynth();
    if (audioCtx.state === 'suspended') await audioCtx.resume();
    masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.26, audioCtx.currentTime + 0.7);
    musicStatus.textContent = 'Reproduciendo demo ambiental · sin archivo externo';
  }

  isPlaying = true;
  playBtn.textContent = 'Ⅱ';
  musicCard.classList.add('playing');
}

function pauseMusic() {
  if (usingAudioFile && audio) {
    audio.pause();
  }

  if (audioCtx && masterGain) {
    masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.45);
  }

  isPlaying = false;
  playBtn.textContent = '▶';
  musicCard.classList.remove('playing');
  musicStatus.textContent = usingAudioFile ? 'Música pausada' : 'Ambient demo · Calm · Focus';
}

playBtn.addEventListener('click', async () => {
  try {
    if (isPlaying) pauseMusic();
    else await playMusic();
  } catch (error) {
    console.error(error);
    musicStatus.textContent = 'Toca otra vez para activar el audio';
    showQuote('musica');
  }
});

[prevBtn, nextBtn, shuffleBtn, loopBtn].forEach((button) => {
  button.addEventListener('click', () => {
    button.animate([
      { transform: 'scale(1)' },
      { transform: 'scale(1.22)' },
      { transform: 'scale(1)' }
    ], { duration: 280, easing: 'cubic-bezier(.2,.85,.2,1)' });
    showQuote('musica');
  });
});

// Aparición inicial inmediata para la primera sección.
requestAnimationFrame(() => {
  document.querySelector('.hero')?.classList.add('visible');
});
