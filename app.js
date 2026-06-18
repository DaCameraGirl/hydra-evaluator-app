const slots = {
  input: {
    url: document.querySelector("#urlInput"),
    img: document.querySelector("#imgInput"),
  },
  a: {
    url: document.querySelector("#urlA"),
    img: document.querySelector("#imgA"),
  },
  b: {
    url: document.querySelector("#urlB"),
    img: document.querySelector("#imgB"),
  },
};

const ratings = [
  "Overall Preference",
  "Instruction Following",
  "Correctness",
  "Visual Quality",
  "AI-Generated Appearance / Naturalness",
];

const options = [
  "Response A is much better",
  "Response A is slightly better",
  "Tie / About the same",
  "Response B is slightly better",
  "Response B is much better",
];

const state = {
  ratings: Object.fromEntries(ratings.map((rating) => [rating, ""])),
  activeNoteTarget: "loser",
};

const taskText = document.querySelector("#taskText");
const promptText = document.querySelector("#promptText");
const checklist = document.querySelector("#checklist");
const ratingRows = document.querySelector("#ratingRows");
const winnerNotes = document.querySelector("#winnerNotes");
const loserNotes = document.querySelector("#loserNotes");
const tradeoffNotes = document.querySelector("#tradeoffNotes");
const justification = document.querySelector("#justification");
const statusLine = document.querySelector("#status");
const previewDialog = document.querySelector("#previewDialog");
const previewImage = document.querySelector("#previewImage");

function setStatus(message) {
  statusLine.textContent = message;
  if (message) {
    window.setTimeout(() => {
      if (statusLine.textContent === message) statusLine.textContent = "";
    }, 2600);
  }
}

function cleanText(value) {
  return value
    .replace(/[\u2013\u2014]/g, ",")
    .replace(/\s+/g, " ")
    .trim();
}

function sentence(value) {
  const cleaned = cleanText(value);
  if (!cleaned) return "";
  return /[.!?]$/.test(cleaned) ? cleaned : `${cleaned}.`;
}

function setImage(slotName, src) {
  const slot = slots[slotName];
  if (!slot || !src) return;
  slot.url.value = src;
  slot.img.src = src;
  slot.img.closest(".dropzone").classList.add("loaded");
}

function clearImage(slotName) {
  const slot = slots[slotName];
  slot.url.value = "";
  slot.img.removeAttribute("src");
  slot.img.closest(".dropzone").classList.remove("loaded");
}

function parseTask() {
  const text = taskText.value.trim();
  if (!text) {
    setStatus("Paste a task first.");
    return;
  }

  const promptMatch = text.match(/Prompt\s*([\s\S]*?)(?:Input Image|Input\s|response a|reesponse a|respomse a|Response A|$)/i);
  if (promptMatch?.[1]) {
    promptText.value = promptMatch[1].trim().replace(/^[:\s]+/, "");
  } else {
    promptText.value = text;
  }

  const urls = [...text.matchAll(/https:\/\/storage\.googleapis\.com\/[^\s,]+/g)].map((match) => match[0]);
  if (urls[0]) setImage("input", urls[0]);
  if (urls[1]) setImage("a", urls[1]);
  if (urls[2]) setImage("b", urls[2]);
  extractChecklist();
  setStatus("Pulled what I could from the task.");
}

function extractChecklist() {
  const prompt = promptText.value.trim();
  checklist.innerHTML = "";
  if (!prompt) {
    setStatus("Add the prompt first.");
    return;
  }

  const normalized = prompt
    .replace(/\b(?:Then|Finally|Also|And)\b/gi, ".")
    .replace(/\d+\.\s*/g, ". ")
    .split(/[.;]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 12)
    .slice(0, 8);

  normalized.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    checklist.appendChild(li);
  });

  setStatus("Checklist made.");
}

function buildRatings() {
  ratingRows.innerHTML = "";
  ratings.forEach((rating) => {
    const row = document.createElement("div");
    row.className = "rating-row";

    const name = document.createElement("div");
    name.className = "rating-name";
    name.textContent = rating;
    row.appendChild(name);

    const optionWrap = document.createElement("div");
    optionWrap.className = "rating-options";

    options.forEach((option) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "rating-option";
      button.textContent = option;
      button.addEventListener("click", () => {
        state.ratings[rating] = option;
        optionWrap.querySelectorAll(".rating-option").forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        if (rating === "Overall Preference") {
          autoFocusNotes(option);
        }
      });
      optionWrap.appendChild(button);
    });

    row.appendChild(optionWrap);
    ratingRows.appendChild(row);
  });
}

function autoFocusNotes(option) {
  if (option.includes("Response A") && !option.includes("Tie")) {
    winnerNotes.placeholder = "Example: Response A keeps the original subject and makes the requested edits";
    loserNotes.placeholder = "Example: Response B changes the identity, pose, or background too much";
  } else if (option.includes("Response B") && !option.includes("Tie")) {
    winnerNotes.placeholder = "Example: Response B keeps the original subject and makes the requested edits";
    loserNotes.placeholder = "Example: Response A misses the requested changes or changes too much";
  }
}

function winnerFromOverall() {
  const overall = state.ratings["Overall Preference"];
  if (overall.includes("Response A")) return "A";
  if (overall.includes("Response B")) return "B";
  return "";
}

function strengthFromOverall() {
  const overall = state.ratings["Overall Preference"];
  if (overall.includes("much")) return "much better";
  if (overall.includes("slightly")) return "better";
  return "about the same as";
}

function makeJustification() {
  const winner = winnerFromOverall();
  const prompt = promptText.value.trim();
  if (!winner) {
    justification.value = "Pick an overall preference first.";
    return;
  }

  const loser = winner === "A" ? "B" : "A";
  const strength = strengthFromOverall();
  const lines = [];

  lines.push(`Response ${winner} is ${strength} than Response ${loser}.`);

  if (winnerNotes.value.trim()) {
    lines.push(`Response ${winner} ${sentence(winnerNotes.value).replace(/^Response [AB]\s+/i, "")}`);
  } else if (prompt) {
    lines.push(`Response ${winner} follows the main prompt changes more clearly while keeping the edit closer to the original image.`);
  }

  if (loserNotes.value.trim()) {
    lines.push(`Response ${loser} ${sentence(loserNotes.value).replace(/^Response [AB]\s+/i, "")}`);
  }

  if (tradeoffNotes.value.trim()) {
    lines.push(sentence(tradeoffNotes.value));
  }

  justification.value = lines
    .join(" ")
    .replace(/[\u2013\u2014]/g, ",")
    .replace(/\s+/g, " ")
    .trim();

  setStatus("Drafted without em dashes.");
}

async function copyText(value, label) {
  if (!value.trim()) {
    setStatus(`Nothing to copy from ${label}.`);
    return;
  }
  await navigator.clipboard.writeText(value);
  setStatus(`Copied ${label}.`);
}

function copyRatings() {
  const value = ratings
    .map((rating) => `${rating}: ${state.ratings[rating] || "Not selected"}`)
    .join("\n");
  copyText(value, "ratings");
}

function useCurrentImages() {
  const known = [
    ["input", "../woman_input.png"],
    ["a", "../woman_response_a.png"],
    ["b", "../woman_response_b.png"],
  ];
  known.forEach(([slot, src]) => setImage(slot, src));
  promptText.value = "Make exactly these three changes: replace her outfit with a tailored navy blazer over a plain white blouse, change her hairstyle to a neat low bun with a few natural loose strands, and add thin round gold-framed eyeglasses to her face. Don't change the background, laptop, table, or coffee cup.";
  extractChecklist();
}

function wireImages() {
  Object.entries(slots).forEach(([slotName, slot]) => {
    slot.url.addEventListener("change", () => setImage(slotName, slot.url.value.trim()));

    const dropzone = slot.img.closest(".dropzone");
    dropzone.addEventListener("dragover", (event) => {
      event.preventDefault();
      dropzone.classList.add("dragging");
    });
    dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragging"));
    dropzone.addEventListener("drop", (event) => {
      event.preventDefault();
      dropzone.classList.remove("dragging");
      const file = event.dataTransfer.files?.[0];
      const url = event.dataTransfer.getData("text/uri-list") || event.dataTransfer.getData("text/plain");
      if (file) {
        setImage(slotName, URL.createObjectURL(file));
      } else if (url) {
        setImage(slotName, url.trim());
      }
    });
    dropzone.addEventListener("click", () => {
      if (!slot.img.src) return;
      previewImage.src = slot.img.src;
      previewDialog.showModal();
    });
  });

  document.querySelectorAll(".clear-slot").forEach((button) => {
    button.addEventListener("click", () => clearImage(button.closest(".image-card").dataset.slot));
  });
}

function wireChips() {
  document.querySelectorAll(".chips button").forEach((button) => {
    button.addEventListener("click", () => {
      const target = document.activeElement === winnerNotes ? winnerNotes : loserNotes;
      const current = target.value.trim();
      target.value = current ? `${current}, ${button.dataset.note}` : button.dataset.note;
      target.focus();
    });
  });
}

function clearAll() {
  taskText.value = "";
  promptText.value = "";
  checklist.innerHTML = "";
  winnerNotes.value = "";
  loserNotes.value = "";
  tradeoffNotes.value = "";
  justification.value = "";
  Object.keys(slots).forEach(clearImage);
  state.ratings = Object.fromEntries(ratings.map((rating) => [rating, ""]));
  buildRatings();
}

document.querySelector("#parseTask").addEventListener("click", parseTask);
document.querySelector("#extractChecklist").addEventListener("click", extractChecklist);
document.querySelector("#makeJustification").addEventListener("click", makeJustification);
document.querySelector("#copyJustification").addEventListener("click", () => copyText(justification.value, "justification"));
document.querySelector("#copyPrompt").addEventListener("click", () => copyText(promptText.value, "prompt"));
document.querySelector("#copyRatings").addEventListener("click", copyRatings);
document.querySelector("#clearAll").addEventListener("click", clearAll);
document.querySelector("#loadSample").addEventListener("click", useCurrentImages);
document.querySelector("#closePreview").addEventListener("click", () => previewDialog.close());

buildRatings();
wireImages();
wireChips();
