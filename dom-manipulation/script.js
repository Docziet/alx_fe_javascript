// Initial sample quotes
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", author: "Franklin D. Roosevelt", category: "Motivation" },
  { text: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein", category: "Inspiration" },
  { text: "Life is what happens when you're busy making other plans.", author: "John Lennon", category: "Life" }
];

// Load last selected category from localStorage
let lastCategory = localStorage.getItem('lastCategory') || 'all';

// Populate categories and display quotes
window.onload = () => {
  populateCategories();
  document.getElementById('categoryFilter').value = lastCategory;
  filterQuotes();
};

// Populate the category dropdown dynamically
function populateCategories() {
  const categoryFilter = document.getElementById('categoryFilter');
  const categories = [...new Set(quotes.map(q => q.category))];

  // Clear previous options except "All"
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';

  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
}

// Display quotes based on selected category
function filterQuotes() {
  const selectedCategory = document.getElementById('categoryFilter').value;
  const quoteContainer = document.getElementById('quoteContainer');
  quoteContainer.innerHTML = '';

  localStorage.setItem('lastCategory', selectedCategory);

  const filteredQuotes =
    selectedCategory === 'all'
      ? quotes
      : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteContainer.innerHTML = '<p>No quotes found for this category.</p>';
    return;
  }

  filteredQuotes.forEach(q => {
    const quoteDiv = document.createElement('div');
    quoteDiv.classList.add('quote');
    quoteDiv.innerHTML = `<p>"${q.text}"</p><p><strong>– ${q.author}</strong></p><p><em>${q.category}</em></p>`;
    quoteContainer.appendChild(quoteDiv);
  });
}

// Add new quote and update categories dynamically
function addQuote() {
  const text = document.getElementById('quoteText').value.trim();
  const author = document.getElementById('quoteAuthor').value.trim();
  const category = document.getElementById('quoteCategory').value.trim();

  if (!text || !author || !category) {
    alert('Please fill in all fields.');
    return;
  }

  const newQuote = { text, author, category };
  quotes.push(newQuote);
  localStorage.setItem('quotes', JSON.stringify(quotes));

  populateCategories();
  filterQuotes();

  document.getElementById('quoteText').value = '';
  document.getElementById('quoteAuthor').value = '';
  document.getElementById('quoteCategory').value = '';
}
