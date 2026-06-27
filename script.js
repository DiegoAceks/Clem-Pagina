const cursorGlow = document.getElementById("cursorGlow");
const exploreBtn = document.getElementById("exploreBtn");
const sparkBtn = document.getElementById("sparkBtn");
const focusBtn = document.getElementById("focusBtn");
const toast = document.getElementById("toast");
const audio = document.getElementById("audio");
const playBtn = document.getElementById("playBtn");
const progressBar = document.getElementById("progressBar");

let demoProgress = 0;
let demoTimer = null;
let isDemoPlaying = false;

window.addEventListener("mousemove", (event) => {
  cursorGlow.style.left = `${event.clientX}px`;
  cursorGlow.style.top = `${event.clientY}px`;
});

exploreBtn.addEventListener("click", () => {
  document.getElementById("fragments").scrollIntoView({ behavior: "smooth", block: "start" });
  createSparkles(14);
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.18 });

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

document.querySelectorAll(".tilt-card").forEach((card) => {
  card.addEventListener("mousemove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateX = ((y / rect.height) - 0.5) * -7;
    const rotateY = ((x / rect.width) - 0.5) * 7;

    card.style.setProperty("--mx", `${(x / rect.width) * 100}%`);
    card.style.setProperty("--my", `${(y / rect.height) * 100}%`);
    card.style.transform = `translateY(-10px) scale(1.035) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "";
  });
});

sparkBtn.addEventListener("click", () => {
  createSparkles(28);
  showToast("Destellos activados");
});

focusBtn.addEventListener("click", () => {
  document.body.classList.toggle("soft-focus");
  createSparkles(12);
  showToast("Modo demo listo");
});

playBtn.addEventListener("click", async () => {
  try {
    if (audio.currentSrc) {
      if (audio.paused) {
        await audio.play();
        playBtn.textContent = "❚❚";
      } else {
        audio.pause();
        playBtn.textContent = "▶";
      }
      return;
    }
  } catch (error) {
    startDemoPlayer();
    return;
  }

  startDemoPlayer();
});

audio.addEventListener("timeupdate", () => {
  if (!audio.duration) return;
  const percent = (audio.currentTime / audio.duration) * 100;
  progressBar.style.width = `${percent}%`;
});

audio.addEventListener("ended", () => {
  playBtn.textContent = "▶";
  progressBar.style.width = "0%";
});

function startDemoPlayer() {
  isDemoPlaying = !isDemoPlaying;
  playBtn.textContent = isDemoPlaying ? "❚❚" : "▶";

  if (!isDemoPlaying) {
    clearInterval(demoTimer);
    return;
  }

  demoTimer = setInterval(() => {
    demoProgress = (demoProgress + 1.2) % 100;
    progressBar.style.width = `${demoProgress}%`;
  }, 180);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => toast.classList.remove("show"), 1800);
}

function createSparkles(amount = 16) {
  for (let i = 0; i < amount; i++) {
    const spark = document.createElement("span");
    spark.className = "spark";
    spark.style.left = `${Math.random() * window.innerWidth}px`;
    spark.style.top = `${Math.random() * window.innerHeight}px`;
    spark.style.animationDelay = `${Math.random() * 0.3}s`;
    document.body.appendChild(spark);

    setTimeout(() => spark.remove(), 1800);
  }
}

setTimeout(() => createSparkles(10), 700);
