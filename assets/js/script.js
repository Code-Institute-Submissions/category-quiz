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

// Define a class to contain game information
class Quiz {
  constructor() {
    this.numberOfRounds = 2;
    this.questionsPerRound = 2;
    this.currentRound = 0;
    this.currentQuestion = 0;
    this.livesRemaining = 3;

    this.customDifficultyLevel = "";
    this.customDifficultySelected = false;
  }

  displayCurrentRound() {
    return this.currentRound + 1;
  }

  displayCurrentQuestion() {
    return this.currentQuestion + 1;
  }

  incrementRound() {
    this.currentRound++;
  }

  incrementQuestion() {
    this.currentQuestion++;
  }
}

/**
 * Attach event listener to the 'application-container' element and create a new
 * Game class in the global scope
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

  // Handle click events for reusable buttons with no id retrieved with
  // querySelectorAll
  if (event.target.matches('.btn-category-option')) {
    loadQuiz(event.target.getAttribute('data-id'));
  }

  // Handle click events for single use buttons with id retrieved with
  // getElementById
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
  }
}

/**
 * Fetch data from a URL and return promise
 * @param {String} endpoint - URL of the resource to fetch
 * @returns - Promise for the body of the response
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
 * @returns - Promise for the body of the response
 */
function retrieveCategories() {
  const categoriesUrl = "https://opentdb.com/api_category.php";
  let categories = getData(categoriesUrl);
  return categories;
}

/**
 * Filter categories to select only those desired for the quiz
 * @param {Object} data - JSON object containing Array of categories
 * @returns - Array of Objects
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
 * @param {Array} filteredCategoriesArray - filteredCategories Array
 */
function displayCategories(filteredCategoriesArray) {
  for (let i = 0; i < btnCategoryOptions.length; i++) {
    btnCategoryOptions[i].innerHTML = filteredCategoriesArray[i].name;
    btnCategoryOptions[i].setAttribute('data-id', filteredCategoriesArray[i].id);
  }
}

async function retrieveQuestions(categoryId) {
  const defaultDifficultyLevels = ['easy', 'medium', 'hard'];
  const customDifficulty = currentQuiz.customDifficultyLevel;
  const numberOfRounds = currentQuiz.numberOfRounds;
  let questionsUrl = "";

  allQuizQuestions = [];

  for (let i = 0; i <= numberOfRounds; i++) {
    if (currentQuiz.customDifficultySelected === true) {
      questionsUrl = `https://opentdb.com/api.php?amount=3&category=${categoryId}&difficulty=${customDifficulty}&type=multiple`;
    } else {
      questionsUrl = `https://opentdb.com/api.php?amount=3&category=${categoryId}&difficulty=${defaultDifficultyLevels[i]}&type=multiple`;
    }
    // Fetch 3 questions on the chosen topic at the selected/default difficulty
    let threeQuestions = await getData(questionsUrl);
    let formattedQuestions = formatQuestions(threeQuestions.results);
    allQuizQuestions.push(formattedQuestions);
  }
  return (allQuizQuestions);
}

/**
 * 
 * @param {Array} questions - Array of questions returned from the fetch request
 * @returns - Re-formatted questions
 */
function formatQuestions(questions) {
  let formattedQuestions = [];
  questions.forEach(element => {
    let question = {};
    let answerArray = [];
    question.question = element.question;
    // Create array of answer choices
    answerArray.push(element.incorrect_answers);
    answerArray.push(element.correct_answer);
    // Assign answers to question object
    question.answers = answerArray;
    question.correctAnswer = element.correct_answer;
    // TODO: Shuffle array and check encoding
    formattedQuestions.push(question);
  });
  return formattedQuestions;
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

async function loadQuiz(categoryId) {
  const questions = await retrieveQuestions(categoryId);
  console.log(questions);
}

// Add event listeners for buttons
document.addEventListener('DOMContentLoaded', function () {
  applicationInitialization();
  window.currentQuiz = new Quiz();
});