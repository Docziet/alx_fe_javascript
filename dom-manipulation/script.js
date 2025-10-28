// === GLOBAL QUOTES ARRAY ===
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
  { text: "Success is not final; failure is not fatal: It is the courage to continue that counts.", category: "Motivation" },
  { text: "The best way to predict your future is to create it.", category: "Inspiration" },
  { text: "Code is like humor. When you have to explain it, it’s bad.", category: "Programming" },
  { text: "Stay hungry, stay foolish.", category: "Wisdom" }
];

let currentCategory = localStorage.getItem('lastCategory') || "all";

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', () => {
  populateCategories();
  filterQuotes();
  document.getElementById('categoryFilter').value = currentCategory;
  document.getElementById('newQuote').addEventListener('click', showRandomQuote);
  syncQuotes(); // initial sync
  setInterval(syncQuotes, 15000); // simulate sync every 15s
});

// === TASK 1: BASIC DYNAMIC QUOTES ===
function showRandomQuote() {
  const filtered = currentCategory === "all" ? quotes : quotes.filter(q => q.category === currentCategory);
  if (filtered.length === 0) {
    document.getElementById('quoteDisplay').innerText = "No quotes available for this category.";
    return;
  }
  const random = filtered[Math.floor(Math.random() * filtered.length)];
  document.getElementById('quoteDisplay').innerText = `"${random.text}" - (${random.category})`;
  sessionStorage.setItem('lastViewedQuote', JSON.stringify(random));
}

function addQuote() {
  const text = document.getElementById('newQuoteText').value.trim();
  const category = document.getElementById('newQuoteCategory').value.trim();
  if (!text || !category) {
    alert("Please enter both quote text and category!");
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  document.getElementById('newQuoteText').value = '';
  document.getElementById('newQuoteCategory').value = '';
  alert("Quote added successfully!");
}

// === TASK 2: WEB STORAGE + JSON HANDLING ===
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        alert('Quotes imported successfully!');
      } else {
        alert('Invalid file format!');
      }
    } catch (error) {
      alert('Error reading file!');
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// === TASK 3: FILTERING BY CATEGORY ===
function populateCategories() {
  const categoryFilter = document.getElementById('categoryFilter');
  const uniqueCategories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  uniqueCategories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
}

function filterQuotes() {
  currentCategory = document.getElementById('categoryFilter').value;
  localStorage.setItem('lastCategory', currentCategory);
  showRandomQuote();
}

// === TASK 4: SERVER SYNC + CONFLICT HANDLING ===
async function fetchQuotesFromServer() {
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=3");
    const serverQuotes = await res.json();
    // Convert mock data into quote format
    return serverQuotes.map(item => ({
      text: item.title,
      category: "Server"
    }));
  } catch (error) {
    console.error("Error fetching server data:", error);
    return [];
  }
}

async function syncQuotes() {
  document.getElementById('syncStatus').textContent = "Syncing with server...";
  const serverQuotes = await fetchQuotesFromServer();
  let conflicts = 0;

  // Conflict resolution: Server takes precedence
  serverQuotes.forEach(serverQuote => {
    const exists = quotes.some(q => q.text === serverQuote.text);
    if (!exists) {
      quotes.push(serverQuote);
    } else {
      conflicts++;
    }
  });

  saveQuotes();
  populateCategories();
  document.getElementById('syncStatus').textContent =
    `✅ Sync complete. Conflicts resolved: ${conflicts}`;
}
