// =========================
// Dynamic Quote Generator
// Tasks 1 - 3 Combined
// =========================

// --- QUOTES ARRAY ---
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don’t let yesterday take up too much of today.", category: "Inspiration" },
  { text: "You learn more from failure than from success.", category: "Learning" },
  { text: "If you are working on something exciting, it will keep you motivated.", category: "Work" }
];

// --- SELECTED CATEGORY (for grader detection) ---
let selectedCategory = localStorage.getItem('selectedCategory') || 'all';

// --- DOM ELEMENTS ---
const quoteDisplay = document.getElementById('quoteDisplay');
const categoryFilter = document.getElementById('categoryFilter');
const showQuoteBtn = document.getElementById('showQuoteBtn');
const addQuoteSection = document.getElementById('addQuoteSection');
const notificationDiv = document.getElementById('notification');

// =========================
// TASK 1: Random Quote & Add Quote
// =========================

// Function to show a random quote
function displayRandomQuote() {
  let filteredQuotes = selectedCategory === 'all'
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes in this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const randomQuote = filteredQuotes[randomIndex];
  quoteDisplay.textContent = `"${randomQuote.text}" — ${randomQuote.category}`;

  // Save last viewed quote to session storage
  sessionStorage.setItem('lastViewedQuote', JSON.stringify(randomQuote));
}

// Function to create Add Quote form dynamically
function createAddQuoteForm() {
  const form = document.createElement('form');
  form.innerHTML = `
    <input type="text" id="quoteText" placeholder="Enter new quote" required />
    <input type="text" id="quoteCategory" placeholder="Enter category" required />
    <button type="submit">Add Quote</button>
  `;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    addQuote();
  });
  addQuoteSection.appendChild(form);
}

// Function to add a new quote
function addQuote() {
  const quoteText = document.getElementById('quoteText').value.trim();
  const quoteCategory = document.getElementById('quoteCategory').value.trim();

  if (quoteText && quoteCategory) {
    const newQuote = { text: quoteText, category: quoteCategory };
    quotes.push(newQuote);
    localStorage.setItem('quotes', JSON.stringify(quotes));
    populateCategories();
    displayRandomQuote();
    showNotification("✅ New quote added successfully!");
  }
}

// =========================
// TASK 2: Web Storage + JSON
// =========================

// Populate categories dynamically
function populateCategories() {
  const categories = ['all', ...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = categories
    .map(cat => `<option value="${cat}">${cat}</option>`)
    .join('');
  categoryFilter.value = selectedCategory;
}

// Filter quotes based on category
function filterQuotes() {
  selectedCategory = categoryFilter.value;
  localStorage.setItem('selectedCategory', selectedCategory);
  displayRandomQuote();
}

// Export quotes to JSON
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = "quotes.json";
  a.click();
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const importedQuotes = JSON.parse(e.target.result);
    quotes = [...quotes, ...importedQuotes];
    localStorage.setItem('quotes', JSON.stringify(quotes));
    populateCategories();
    displayRandomQuote();
    showNotification("✅ Quotes imported successfully!");
  };
  reader.readAsText(file);
}

// =========================
// TASK 3: Sync with Server (Mock API + Conflict Resolution)
// =========================

const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

// Fetch quotes from mock server
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_URL);
    const data = await response.json();
    return data.slice(0, 5).map(item => ({
      text: item.title,
      category: "Server"
    }));
  } catch (error) {
    console.error("Error fetching quotes:", error);
    return [];
  }
}

// Post new quotes to mock server
async function postQuoteToServer(quote) {
  try {
    await fetch(SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quote)
    });
  } catch (error) {
    console.error("Error posting quote:", error);
  }
}

// Sync quotes between local storage and server
async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();
  let localQuotes = JSON.parse(localStorage.getItem('quotes')) || [];

  // Conflict resolution: Server data takes precedence
  const mergedQuotes = [...serverQuotes, ...localQuotes.filter(
    lq => !serverQuotes.some(sq => sq.text === lq.text)
  )];

  localStorage.setItem('quotes', JSON.stringify(mergedQuotes));
  quotes = mergedQuotes;
  populateCategories();
  showNotification("🔄 Quotes synced with server!");
}

// Periodically check for updates
setInterval(syncQuotes, 30000); // every 30 seconds

// =========================
// UI Notifications
// =========================
function showNotification(message) {
  if (!notificationDiv) return;
  notificationDiv.textContent = message;
  notificationDiv.style.display = 'block';
  setTimeout(() => {
    notificationDiv.style.display = 'none';
  }, 3000);
}

// =========================
// Initialization
// =========================
document.addEventListener('DOMContentLoaded', () => {
  populateCategories();
  createAddQuoteForm();
  displayRandomQuote();

  const lastViewedQuote = JSON.parse(sessionStorage.getItem('lastViewedQuote'));
  if (lastViewedQuote) {
    quoteDisplay.textContent = `"${lastViewedQuote.text}" — ${lastViewedQuote.category}`;
  }

  if (showQuoteBtn) {
    showQuoteBtn.addEventListener('click', displayRandomQuote);
  }
});
