let allData = {};
let flippedCards = [];
let lockBoard = false;
let matchedCount = 0;
let currentCategory = "";
let currentCards = [];

// Load JSON
async function loadFlashcards() {
  try {
    const response = await fetch("Flashcards.json");
    allData = await response.json();
    initCategories(allData);
  } catch (err) {
    console.error("Failed to load JSON:", err);
  }
}

// Create category buttons
function initCategories(data) {
  const container = document.getElementById("category-container");
  container.innerHTML = "";
  document.getElementById("replay-btn").classList.add("hidden");

  Object.keys(data).forEach(cat => {
    const btn = document.createElement("button");
    btn.className = "category-btn";
    btn.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    btn.onclick = () => startGame(cat, data[cat]);
    container.appendChild(btn);
  });
}

// Start the game
function startGame(category, cards) {
  const gameContainer = document.getElementById("game-container");
  gameContainer.innerHTML = "";
  document.getElementById("replay-btn").classList.add("hidden");

  currentCategory = category;
  currentCards = cards;
  matchedCount = 0;
  flippedCards = [];
  lockBoard = true;

  // Pick 4 random cards, create 2 copies each
  const selected = shuffle(cards).slice(0, 4);
  const pairSet = shuffle([...selected, ...selected]);

  pairSet.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.word = item.text;   // use correct key
    card.dataset.sound = item.audio; // use correct key

    card.innerHTML = `
      <div class="card-inner">
        <div class="card-front">
          <img src="${item.image}" alt="${item.text}">
        </div>
        <div class="card-back">
          <img src="darijatoons-logo.jpg" alt="DarijaToons logo">
        </div>
      </div>
    `;

    card.addEventListener("click", () => handleCardClick(card));
    gameContainer.appendChild(card);
  });

  // Show all cards face up for 1s
  const allCards = document.querySelectorAll(".card");
  allCards.forEach(c => c.classList.add("flipped"));
  setTimeout(() => {
    allCards.forEach(c => c.classList.remove("flipped"));
    lockBoard = false;
  }, 1000);
}

// Handle card click
function handleCardClick(card) {
  if (lockBoard) return;
  if (card.classList.contains("flipped") || card.classList.contains("matched")) return;

  card.classList.add("flipped");
  flippedCards.push(card);

  if (flippedCards.length === 2) {
    lockBoard = true;
    setTimeout(checkMatch, 500); // slight delay to show second card
  }
}

// Check match
function checkMatch() {
  const [first, second] = flippedCards;

  if (first.dataset.word === second.dataset.word) {
    // Match found
    if (first.dataset.sound) new Audio(first.dataset.sound).play();
    first.classList.add("matched");
    second.classList.add("matched");
    flippedCards = [];
    lockBoard = false;
    matchedCount += 1;

    if (matchedCount === 4) {
      setTimeout(() => document.getElementById("replay-btn").classList.remove("hidden"), 500);
    }
  } else {
    // Not a match
    new Audio("audio/noBravo.m4a").play();
    setTimeout(() => {
      flippedCards.forEach(card => card.classList.remove("flipped"));
      flippedCards = [];
      lockBoard = false;
    }, 1000);
  }
}

// Shuffle utility
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

// Replay
document.getElementById("replay-btn").addEventListener("click", () => {
  startGame(currentCategory, currentCards);
});

loadFlashcards();
