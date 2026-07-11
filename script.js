const TOTAL_CHALLENGES = 8;
const screens = document.querySelectorAll("[data-screen]");
const challenges = document.querySelectorAll("[data-challenge]");
const progressBar = document.querySelector("#progress-bar");
const stepNumber = document.querySelector("#step-number");
const correctPacking = 4;

let currentChallenge = 1;
let advancing = false;

function normalize(value) {
  return value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function showScreen(name) {
  screens.forEach((screen) => screen.classList.toggle("active", screen.dataset.screen === name));
}

function currentArticle() {
  return document.querySelector(`[data-challenge="${currentChallenge}"]`);
}

function feedbackFor(element) {
  return element.closest(".challenge").querySelector(".feedback");
}

function showFeedback(element, message, isError = false) {
  const feedback = feedbackFor(element);
  feedback.textContent = message;
  feedback.classList.toggle("error", isError);
}

function updateChallenge() {
  challenges.forEach((challenge) => {
    challenge.classList.toggle("active", Number(challenge.dataset.challenge) === currentChallenge);
  });
  stepNumber.textContent = currentChallenge;
  progressBar.style.width = `${(currentChallenge / TOTAL_CHALLENGES) * 100}%`;
}

function unlockStamp(challengeNumber) {
  const words = ["MAR", "EUR", "ISLA", "OK", "GAST", "GEO", "CÚP", "VOL"];
  const stamp = document.querySelector(`[data-stamp="${challengeNumber}"]`);
  if (stamp && words[challengeNumber - 1]) {
    stamp.textContent = words[challengeNumber - 1];
    stamp.classList.add("unlocked");
  }
}

function advance(challenge) {
  if (advancing) return;
  advancing = true;
  unlockStamp(currentChallenge);
  const final = currentChallenge === TOTAL_CHALLENGES;
  showFeedback(challenge, final ? "El sobre se está abriendo, Boo…" : "¡Sello conseguido, Boo! La investigación continúa.");

  window.setTimeout(() => {
    currentChallenge += 1;
    advancing = false;
    if (currentChallenge > TOTAL_CHALLENGES) showScreen("reveal");
    else updateChallenge();
  }, 850);
}

function resetGame() {
  currentChallenge = 1;
  advancing = false;
  document.querySelectorAll("form").forEach((form) => form.reset());
  document.querySelectorAll(".feedback").forEach((feedback) => {
    feedback.textContent = "";
    feedback.classList.remove("error");
  });
  document.querySelectorAll(".stamp").forEach((stamp) => {
    stamp.textContent = "?";
    stamp.classList.remove("unlocked");
  });
  document.querySelectorAll(".stay-card").forEach((card) => card.classList.remove("selected"));
  document.querySelector(".stay-feedback").textContent = "";
  document.querySelectorAll(".packed, .wrong-pack, .selected, .active").forEach((element) => {
    if (element.matches(".packing-grid button, .evidence-grid button")) {
      element.classList.remove("packed", "wrong-pack", "selected", "active");
    }
  });
  showScreen("welcome");
  updateChallenge();
}

document.querySelectorAll("[data-action='start']").forEach((button) => {
  button.addEventListener("click", () => {
    showScreen("game");
    updateChallenge();
  });
});
document.querySelectorAll("[data-action='restart']").forEach((button) => button.addEventListener("click", resetGame));
document.querySelectorAll("[data-action='stays']").forEach((button) => {
  button.addEventListener("click", () => showScreen("stays"));
});
document.querySelectorAll("[data-action='reveal']").forEach((button) => {
  button.addEventListener("click", () => showScreen("reveal"));
});
document.querySelectorAll("[data-action='choose-stay']").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".stay-card").forEach((card) => card.classList.remove("selected"));
    button.closest(".stay-card").classList.add("selected");
    document.querySelector(".stay-feedback").textContent = "Elección guardada, Boo. Este será nuestro refugio en Santorini.";
  });
});

document.querySelectorAll(".hint-button").forEach((button) => {
  button.addEventListener("click", () => {
    const hints = {
      5: "Prueba a retroceder tres letras: F se convierte en C.",
      6: "Piensa en geología, no en medios de transporte o ciudades.",
      7: "La respuesta empieza por C y tiene siete letras.",
    };
    showFeedback(button, hints[currentChallenge]);
  });
});

document.querySelectorAll("[data-choice]").forEach((button) => {
  button.addEventListener("click", () => {
    if (advancing) return;
    const challenge = button.closest(".challenge");
    if (button.dataset.choice === "correct") {
      advance(challenge);
    } else {
      button.classList.add("is-wrong");
      showFeedback(challenge, "Todavía no, Boo. Mira las pistas una vez más.", true);
    }
  });
});

document.querySelectorAll(".word-form").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (advancing) return;
    const input = form.querySelector("input");
    const challenge = form.closest(".challenge");
    if (normalize(input.value) === form.dataset.answer) {
      input.setAttribute("aria-invalid", "false");
      advance(challenge);
    } else {
      input.setAttribute("aria-invalid", "true");
      showFeedback(challenge, "Esa respuesta no encaja todavía. Vuelve a investigar.", true);
      input.focus();
    }
  });
});

document.querySelectorAll(".packing-grid button").forEach((button) => {
  button.addEventListener("click", () => {
    if (advancing || currentChallenge !== 4) return;
    if (button.dataset.pack === "wrong") {
      button.classList.add("wrong-pack");
      showFeedback(button, "Ese objeto parece demasiado invernal para esta misión, Boo.", true);
      return;
    }
    button.classList.toggle("packed");
    const packed = document.querySelectorAll(".packing-grid .packed").length;
    showFeedback(button, `${packed} de ${correctPacking} objetos preparados.`);
  });
});

document.querySelector(".pack-submit").addEventListener("click", () => {
  if (advancing || currentChallenge !== 4) return;
  const challenge = currentArticle();
  const packed = document.querySelectorAll(".packing-grid .packed").length;
  if (packed === correctPacking) advance(challenge);
  else showFeedback(challenge, `La maleta necesita ${correctPacking - packed} objeto${correctPacking - packed === 1 ? "" : "s"} más.`, true);
});

document.querySelectorAll(".evidence-grid button").forEach((button) => {
  button.addEventListener("click", () => {
    if (advancing || currentChallenge !== 6) return;
    if (button.dataset.evidence === "wrong") {
      button.classList.add("wrong-pack");
      showFeedback(button, "Esa evidencia no encaja con el expediente volcánico.", true);
      return;
    }
    button.classList.toggle("packed");
    const selected = document.querySelectorAll(".evidence-grid .packed").length;
    showFeedback(button, `${selected} de 3 evidencias relevantes.`);
  });
});

document.querySelector(".evidence-submit").addEventListener("click", () => {
  if (advancing || currentChallenge !== 6) return;
  const challenge = currentArticle();
  const selected = document.querySelectorAll(".evidence-grid .packed").length;
  if (selected === 3) advance(challenge);
  else showFeedback(challenge, `Aún faltan ${3 - selected} evidencias por identificar.`, true);
});
