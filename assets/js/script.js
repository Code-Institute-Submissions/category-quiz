// --- Global variables ---

// HTML Objects to be manipulated and used to manage click events
const applicationContainer = document.getElementById('application-container');
const menuContainer = document.getElementById('menu-container');
const btnPlayQuiz = document.getElementById('btn-play');
const btnOpenSettings = document.getElementById('btn-settings');
const btnOpenInstructions = document.getElementById('btn-instructions');
const settingsContainer = document.getElementById('settings-container');
const btnCloseSettings = document.getElementById('btn-settings-close');
const btnSaveSettings = document.getElementById('btn-settings-save');
const btnResetSettings = document.getElementById('btn-settings-reset');
const instructionsContainer = document.getElementById('instructions-container');
const btnCloseInstructions = document.getElementById('btn-instructions-close');
const categorySelectContainer = document.getElementById('category-select-container');
const categoriesContainer = document.getElementById('categories-container');
const quizContainer = document.getElementById('quiz-container');
const questionsRemainingElement = document.getElementById('questions-remaining');
const questionTextArea = document.getElementById('question-text');
const btnAnswers = document.querySelectorAll('.btn-answer');
const btnQuizBack = document.getElementById('btn-quiz-close');
const livesRemainingElement = document.getElementById('lives-remaining');

// Define a class to contain game information
class Quiz {
  constructor() {
    // Initialize default quiz variables
    this.numberOfRounds = 2;
    this.questionsPerRound = 2;
    this.currentRound = 0;
    this.currentQuestion = 0;
    this.livesRemaining = 3;
    this.customDifficultyLevel = "";
    this.customDifficultySelected = false;
    this.quizActive = true;
    // Player progress tracking
    this.totalCorrectAnswers = 0;
  }

  incrementRound() {
    this.currentRound++;
  }

  incrementQuestion() {
    this.currentQuestion++;
  }

  incrementTotalCorrectAnswers() {
    this.totalCorrectAnswers++;
  }

  decrementLives() {
    this.livesRemaining--;
    if (this.livesRemaining === 0) {
      this.quizActive = false;
    }
  }

  resetLives() {
    this.livesRemaining = 3;
  }

  resetQuestionNumber() {
    this.currentQuestion = 0;
  }

  resetTotalCorrectAnswers() {
    this.totalCorrectAnswers = 0;
  }
}

// --- Event listener and handler ---

/**
 * Attach event listener to the 'application-container' element and create a new
 * Game class in the global scope
 */
function applicationInitialization() {
  applicationContainer.addEventListener('click', manageClickEvent);
}

/**
 * Handles click events - Adapted from https://github.com/lukebinmore/2048
 * https://github.com/lukebinmore/2048/blob/ab3fb81ca162d5bd8e282daeeb44439508e5e2b8/assets/js/index.js#L55-L88
 * @param {*} event Event to be handled
 */
function manageClickEvent(event) {
  // Handle click events for reusable buttons with no id retrieved with
  // querySelectorAll

  // Category buttons
  if (event.target.matches('.btn-category')) {
    loadQuiz(event.target.getAttribute('data-id'));
  }

  // Quiz answer buttons
  if (event.target.matches('.btn-answer')) {
    if (event.target.matches('.btn-answer')) {
      const result = checkAnswer(event.target);
    }
  }

  // Handle click events for single use buttons with id retrieved with
  // getElementById
  switch (event.target) {
    case btnPlayQuiz:
      loadCategorySelect();
      break;
    case btnOpenSettings:
      showElement(settingsContainer);
      break;
    case btnCloseSettings:
      hideElement(settingsContainer);
      break;
    case btnSaveSettings:
      saveSettings(event);
      break;
    case btnResetSettings:
      resetSettings(event);
      break;
    case btnOpenInstructions:
      showElement(instructionsContainer);
      break;
    case btnCloseInstructions:
    case instructionsContainer:
      hideElement(instructionsContainer);
      break;
    case btnQuizBack:
      // Exit quiz, reset progress and return to main menu
      hideElement(quizContainer);
      currentQuiz.resetLives();
      currentQuiz.resetQuestionNumber();
      currentQuiz.resetTotalCorrectAnswers();
      showElement(menuContainer);
      break;
  }
}

// --- API call --

/**
 * Fetch data from a URL and return promise
 * @param {String} endpoint URL of the resource to fetch
 * @returns Promise for the body of the response
 */
async function getData(endpoint) {
  const response = await fetch(endpoint);
  const data = await response.json();
  return data;
}

// --- DOM Manipulation ---

/**
 * Removes the 'hidden' CSS class to an element
 * @param {Object} element HTML element to be shown
 */
function showElement(element) {
  element.classList.remove('hidden');
}

/**
 * Adds the 'hidden' CSS class to an element
 * @param {Object} element HTML element to be hidden
 */
function hideElement(element) {
  element.classList.add('hidden');
}

/**
 * Enable answer buttons
 */
function enableAnswerButtons() {
  btnAnswers.forEach((element) => {
    element.removeAttribute('disabled');
  });
}

/**
 * Disable answer buttons
 */
function disableAnswerButtons() {
  btnAnswers.forEach((element) => {
    element.setAttribute('disabled', true);
  });
}

// --- Save / Reset Custom Quiz Settings ---

/**
 * Save custom quiz settings
 * @param {*} event Form submit event to be handled
 */
function saveSettings(event) {
  event.preventDefault();
  const customDifficulty = document.getElementById('custom-difficulty');
  const customNumberOfQuestions = document.getElementById('custom-number-of-questions');
  currentQuiz.customDifficultySelected = true;
  currentQuiz.numberOfRounds = 0;
  currentQuiz.customDifficultyLevel = customDifficulty.value;
  currentQuiz.questionsPerRound = parseInt(customNumberOfQuestions.value) - 1;
  // TODO: Button class to highlight change made
  btnSaveSettings.innerHTML = "Saved!";
  setTimeout(() => {
    btnSaveSettings.innerHTML = "Save";
    hideElement(settingsContainer);
  }, 1000);
}

/**
 * Reset quiz settings
 * @param {*} event Form submit event to be handled
 */
function resetSettings(event) {
  event.preventDefault();
  window.currentQuiz = new Quiz();
  // TODO: Button class to highlight change made
  btnResetSettings.innerHTML = "Reset!";
  setTimeout(() => {
    btnResetSettings.innerHTML = "Reset";
    hideElement(settingsContainer);
  }, 1000);
}

// --- Get and Display Categories ---

/**
 * Call getData function with the Open Trivia Database Categories URL and
 * returns its promise
 * @returns Promise for the body of the response
 */
function retrieveCategories() {
  const categoriesUrl = "https://opentdb.com/api_category.php";
  let categories = getData(categoriesUrl);
  return categories;
}

/**
 * Filter categories to select only those desired for the quiz
 * @param {Object} data JSON object containing Array of categories
 * @returns Array of Objects
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
 * Create a button element for each array element (filteredCategoriesArray), add
 * the name and id to a property of the button and append to the categories
 * container
 * @param {Array} filteredCategoriesArray Array of categories
 */
function displayCategories(filteredCategoriesArray) {
  categoriesContainer.innerHTML = "";
  let newCategoryButton = "";
  for (let i = 0; i < filteredCategoriesArray.length; i++) {
    newCategoryButton = document.createElement('button');
    newCategoryButton.innerHTML = filteredCategoriesArray[i].name;
    newCategoryButton.setAttribute('data-id', filteredCategoriesArray[i].id);
    newCategoryButton.classList.add('btn-category', 'btn-game');
    categoriesContainer.appendChild(newCategoryButton);
  }
}

// --- Get and Display Questions ---

/**
 * Retrieve and format quiz questions
 * @param {Int} categoryId Number used to identify the category selected.
 * @returns 2D array of questions, each representing a round of the quiz
 */
async function retrieveQuestions(categoryId) {
  const defaultDifficultyLevels = ['easy', 'medium', 'hard'];
  const customDifficulty = currentQuiz.customDifficultyLevel;
  const numberOfRounds = currentQuiz.numberOfRounds;
  const customDifficultySelected = currentQuiz.customDifficultySelected;
  const questionsPerRound = currentQuiz.questionsPerRound;
  let questionsUrl = "";
  allQuizQuestions = [];
  for (let i = 0; i <= numberOfRounds; i++) {
    if (customDifficultySelected == true) {
      // The API expects the number of questions as a human readable number so
      // the questionsPerRound+1 specified below is to account for this and
      // allow the quiz to work as expected.
      questionsUrl = `https://opentdb.com/api.php?amount=${questionsPerRound + 1}&category=${categoryId}&difficulty=${customDifficulty}&type=multiple`;
    } else {
      questionsUrl = `https://opentdb.com/api.php?amount=3&category=${categoryId}&difficulty=${defaultDifficultyLevels[i]}&type=multiple`;
    }
    // Fetch 3 questions on the chosen topic at the selected/default difficulty
    const questionsData = await getData(questionsUrl);
    const formattedQuestions = formatQuestions(questionsData.results);
    allQuizQuestions.push(formattedQuestions);
  }

  /**
   * Convert character entity references to HTML symbols
   * CREDIT: Adapted from stack overflow answer
   * URL: https://stackoverflow.com/questions/784586/convert-special-characters-to-html-in-javascript
   * @param {String} String containing character entity references
   * @returns HTML formatted string e.g. "&amp;" -> converts to -> "&"
   */
  function convertToHtml(unformattedString) {
    const tempElement = document.createElement('div');
    tempElement.innerHTML = unformattedString;
    return tempElement.innerText;
  }

  /**
  * Takes an Array of objects (question and answers) returned from the API
  * re-formats then before adding to a new array.
  * @param {Array} questions Array of questions returned from the fetch
  * request
  * @returns Re-formatted questions
  */
  function formatQuestions(questions) {
    let formattedQuestions = [];
    questions.forEach(element => {
      // Answers returned from the API contain character entity references so
      // these are converted to HTML special characters and them trimmed to
      // ensure no extra whitespace
      const correctAnswer = convertToHtml(element.correct_answer);
      let question = {};
      let answerArray = [];
      question.question = element.question;
      // Create array of answer choices
      answerArray = element.incorrect_answers;
      answerArray.push(correctAnswer);
      // Assign answers to question object
      question.answers = answerArray;
      question.correctAnswer = correctAnswer;
      // TODO: Shuffle array and check encoding
      formattedQuestions.push(question);
    });
    return formattedQuestions;
  }
  return (allQuizQuestions);
}

/**
 * Adds a question and its possible answers to a property of the question text
 * area element and the answer button elements
 * @param {Array} questions Specially formatted array of questions and answers
 */
function displayQuestion() {
  const questions = currentQuiz.questions;
  const roundNumber = currentQuiz.currentRound;
  const questionNumber = currentQuiz.currentQuestion;
  console.log(`Current round number = ${roundNumber}, Current question number = ${questionNumber}`); // DEBUG
  console.log(`Correct Answer = ${questions[roundNumber][questionNumber].correctAnswer}`); // DEBUG
  questionTextArea.innerHTML = questions[roundNumber][questionNumber].question;
  for (let i = 0; i < btnAnswers.length; i++) {
    btnAnswers[i].innerHTML = questions[roundNumber][questionNumber].answers[i];
    btnAnswers[i].classList.remove('correct-answer', 'incorrect-answer');
  }
  // New question ready so ensure the answer buttons are enabled
  enableAnswerButtons();
  //Update the displayed statistics (updated question progress will be
  //displayed)
  updateDisplayedStats();
}

// --- Check Selected Answer ---

/**
 *  Checks the selected answer against the correct answer
 * @param {Object} element HTML element containing selected answer
 */
function checkAnswer(element) {
  const questions = currentQuiz.questions;
  const roundNumber = currentQuiz.currentRound;
  const questionNumber = currentQuiz.currentQuestion;
  const selectedAnswer = element.innerHTML;
  const question = currentQuiz.currentQuestion;
  const correctAnswer = questions[roundNumber][questionNumber].correctAnswer;

  setTimeout(element.classList.add('tentative-answer'));

  // Disable buttons while answer is checked
  disableAnswerButtons();
  if (selectedAnswer == correctAnswer) {
    setTimeout(() => {
      element.classList.replace('tentative-answer', 'correct-answer');
      currentQuiz.incrementTotalCorrectAnswers();
      advanceQuiz();
    }, 1000);
  } else {
    setTimeout(() => {
      setTimeout(element.classList.replace('tentative-answer', 'incorrect-answer'), 1000);
      currentQuiz.decrementLives();
      //Update the displayed statistics (updated lives remaining will be
      //displayed)
      updateDisplayedStats();
      // Incorrect answer so enable buttons while answer is checked
      enableAnswerButtons();
      // Check if quiz over due to no lives remaining;
      const quizActive = currentQuiz.quizActive;
      if (!quizActive) {
        // No lives remaining so highlight correct answer and end quiz
        disableAnswerButtons();
        let btnAnswersArray = Array.from(btnAnswers);
        let correctAnswerButton = btnAnswersArray.find(element => element.innerHTML == correctAnswer);
        correctAnswerButton.classList.add('correct-answer');
        quizComplete('No Lives Remaining');
      }
    }, 1000);
  }
}

// --- Advance Quiz and Update Statistics ---

/**
 * Advances quiz, increments questionNumber, roundNumber and determines if game
 * is finished
 */
function advanceQuiz() {
  const numberOfRounds = currentQuiz.numberOfRounds;
  const questionsPerRound = currentQuiz.questionsPerRound;
  const roundNumber = currentQuiz.currentRound;
  const questionNumber = currentQuiz.currentQuestion;

  if (questionNumber < (questionsPerRound)) {
    // Not last question in round so increment the currentQuestion
    currentQuiz.incrementQuestion();
    setTimeout(displayQuestion, 1000);
  } else {
    // Last question in round
    if (roundNumber != (numberOfRounds)) {
      // Not last question in the quiz so increment currentRound
      currentQuiz.incrementRound();
      currentQuiz.resetQuestionNumber();
      setTimeout(displayQuestion, 1000);
    } else {
      // This is the last question of the last round so the quiz is over
      quizComplete('Winner');
    }
  }
}

/**
 * Update numbers of lives and question remaining
 */
function updateDisplayedStats() {
  const livesRemaining = currentQuiz.livesRemaining;
  const numberOfRounds = currentQuiz.numberOfRounds + 1;
  const totalCorrectAnswers = currentQuiz.totalCorrectAnswers + 1;
  const totalQuestions = (currentQuiz.numberOfRounds + 1) * (currentQuiz.questionsPerRound + 1);
  const currentQuestionNumber = numberOfRounds - (numberOfRounds - totalCorrectAnswers);

  livesRemainingElement.innerHTML = livesRemaining;
  questionsRemainingElement.innerHTML = `Question ${currentQuestionNumber} of ${totalQuestions}`;
}

// --- Handle Quiz End ---

/**
 * DEBUG: Log the win condition to the console
 * @param {String} reason Win condition
 */
function quizComplete(winCondition) {
  console.log(`GAME OVER REACHED - ${winCondition}`);
}

// --- Load separate elements / Pages of the Quiz Application ---

/**
 * Request categories and displays them once the promise has been fulfilled
 */
async function loadCategorySelect() {
  hideElement(menuContainer);
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

/**
 * Requests the quiz questions and answers and displays them once the promise
 * has been fulfilled
 * @param {Int} categoryId Number used to identify the category selected.
 */
async function loadQuiz(categoryId) {
  hideElement(categorySelectContainer);
  try {
    const questions = await retrieveQuestions(categoryId);
    // Add the question to the currentQuiz Object
    currentQuiz.questions = questions;
    displayQuestion();
    showElement(quizContainer);
  } catch (e) {
    console.log(e);
  }
}

// Add event listeners for buttons
document.addEventListener('DOMContentLoaded', function () {
  applicationInitialization();
  window.currentQuiz = new Quiz();
});