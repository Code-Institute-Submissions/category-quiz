//  Global variables
// HTML Objects to be manipulated and used to manage click events
const applicationContainer = document.getElementById('application-container');
const menuContainerElement = document.getElementById('menu-container');
const btnPlayQuiz = document.getElementById('btn-play');
const btnOpenInstructions = document.getElementById('btn-instructions');
const instructionsContainer = document.getElementById('instructions-container');
const btnCloseInstructions = document.getElementById('btn-instructions-close');
const categorySelectContainer = document.getElementById('category-select-container');
const categoriesContainer = document.getElementById('categories-container');
const btnCategoryOptions = document.querySelectorAll('.btn-category-option');

/**
 * Attach event listener to the 'application-container' element
 */
function applicationInitialization() {
  applicationContainer.addEventListener('click', manageClickEvent);
}

/**
 * Handles click events - Adapted from https://github.com/lukebinmore/2048
 * https://github.com/lukebinmore/2048/blob/ab3fb81ca162d5bd8e282daeeb44439508e5e2b8/assets/js/index.js#L55
 * @param {*} event - Event to be handled
 */
function manageClickEvent(event) {
  switch (event.target) {
    case btnPlayQuiz:
      loadCategorySelect();
      break;
    case btnOpenInstructions:
      showElement(instructionsContainer);
      break;
    case btnCloseInstructions:
    case instructionsContainer:
      hideElement(instructionsContainer);
      break;
    case btnCategoryOptions:
      // Handle category selection
      break;
  }
}

/**
 * Fetch data from a URL and return promise
 * @param {String} endpoint - URL of the resource to fetch
 * @returns {Promise} - Promise for the body of the response
 */
async function getData(endpoint) {
  const response = await fetch(endpoint);
  const data = await response.json();
  return data;
}

/**
 * Removes the 'hidden' CSS class to an element
 * @param {Object} element - HTML element to be shown
 */
function showElement(element) {
  element.classList.remove('hidden');
}

/**
 * Adds the 'hidden' CSS class to an element
 * @param {Object} element - HTML element to be hidden
 */
function hideElement(element) {
  element.classList.add('hidden');
}

/**
 * Call getData function with the Open Trivia Database Categories URL and
 * returns its promise
 * @returns {Promise} - Promise for the body of the response
 */
function retrieveCategories() {
  const categoriesUrl = "https://opentdb.com/api_category.php";
  let categories = getData(categoriesUrl);
  return categories;
}

/**
 * Filter categories to select only those desired for the quiz
 * @param {Object} data - JSON object containing Array of categories
 * @returns {Array} - Array of Objects
 */
function filterCategories(data) {
  const categoriesArray = data.trivia_categories;
  let filteredCategories = categoriesArray.filter(category => (
    category.name === "General Knowledge" ||
    category.name === "Science & Nature" ||
    category.name === "Mythology" ||
    category.name === "Sports" ||
    category.name === "Geography" ||
    category.name === "History" ||
    category.name === "Celebrities" ||
    category.name === "Animals"
  ));
  return filteredCategories;
}

/**
 * Adds each category name and id to one of the category options buttons
 * @param {Array} data - filteredCategories Array
 */
function displayCategories(data) {
  for (let i = 0; i < btnCategoryOptions.length; i++) {
    btnCategoryOptions[i].innerHTML = data[i].name;
    btnCategoryOptions[i].setAttribute('data-id', data[i].id);
  }
}

/**
 * Requests the categories and displays them once the promise has been fulfilled
 */
async function loadCategorySelect() {
  hideElement(menuContainerElement);
  try {
    // Waits for the promise to resolve
    const categories = await retrieveCategories();
    const filteredCategories = filterCategories(categories);
    displayCategories(filteredCategories);
    showElement(categorySelectContainer);
  } catch (e) {
    console.log(e);
  }
}

// Add event listeners for buttons
document.addEventListener('DOMContentLoaded', function () {
  applicationInitialization();
});