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
const btnCategoryClose = document.getElementById('btn-category-close');
const quizContainer = document.getElementById('quiz-container');
const questionsRemainingElement = document.getElementById('questions-remaining');
const questionTextArea = document.getElementById('question-text');
const btnAnswers = document.querySelectorAll('.btn-answer');
const btnQuizBack = document.getElementById('btn-quiz-close');
const currentDifficulty = document.getElementById('current-difficulty');
const livesRemainingContainer = document.getElementById('lives-remaining-container');
const livesRemainingElement = document.getElementById('lives-remaining');
const quizEndContainer = document.getElementById('quiz-end-container');
const quizEndStats = document.getElementById('quiz-end-stats');
const loadingContainer = document.getElementById('loading-container');
const btnPlayAgain = document.getElementById('btn-play-again');
const btnReturnToMenu = document.getElementById('btn-main-menu');

// Define a class to contain quiz information
class Quiz {
  constructor() {
    // Initialize default quiz variables
    this.numOfRounds = 2;
    this.questionsPerRound = 2;
    this.currentRoundNum = 0;
    this.currentQuestionNum = 0;
    this.numOfLivesRemaining = 3;
    this.customDifficultyLevel = "";
    this.customDifficultySelected = false;
    this.quizActive = true;
    // Variable to track the number of questions answered correctly
    this.totalNumCorrectAnswers = 0;
  }

  incrementRound() {
    this.currentRoundNum++;
  }

  incrementQuestion() {
    this.currentQuestionNum++;
  }

  incrementTotalNumCorrectAnswers() {
    this.totalNumCorrectAnswers++;
  }

  decrementLives() {
    this.numOfLivesRemaining--;
    if (this.numOfLivesRemaining === 0) {
      this.quizActive = false;
    }
  }

  resetQuizVariables() {
    this.numOfLivesRemaining = 3;
    this.currentQuestionNum = 0;
    this.currentRoundNum = 0;
    this.totalNumCorrectAnswers = 0;
    this.quizActive = true;
  }

  resetQuestionNum() {
    this.currentQuestionNum = 0;
  }
}

// --- Event listeners and handlers ---

/**
 * Show Main Menu and add event listeners for buttons and the end of the animation used when a life
 * is lost
 */
function applicationInitialization() {
  showElement(menuContainer);
  applicationContainer.addEventListener('click', handleUserAction);
  livesRemainingContainer.addEventListener('animationend', removeAnimationClass);
}

/**
 * Handles click events
 * CREDIT: Adapted from https://github.com/lukebinmore/2048
 * URL: https://github.com/lukebinmore/2048/blob/ab3fb81ca162d5bd8e282daeeb44439508e5e2b8/assets/js/index.js#L55-L88
 * @param {*} event - Event to be handled
 */
function handleUserAction(event) {
  // Handle click events for reusable buttons with no id retrieved with
  // querySelectorAll

  // Category buttons
  if (event.target.matches('.btn-category')) {
    populateAndDisplayQuiz(event.target.getAttribute('data-id'));
  }

  // Quiz answer buttons
  if (event.target.matches('.btn-answer')) {
    if (event.target.matches('.btn-answer')) {
      checkSelectedAnswer(event.target);
    }
  }

  // Handle click events for single use buttons with id retrieved with
  // getElementById
  switch (event.target) {
    case btnPlayQuiz:
      populateAndDisplayCategorySelection();
      break;
    case btnOpenSettings:
      showElement(settingsContainer);
      break;
    case btnCloseSettings:
      hideElement(settingsContainer);
      break;
    case btnSaveSettings:
      setCustomQuizVariables(event);
      break;
    case btnResetSettings:
      resetQuizSettings(event);
      break;
    case btnOpenInstructions:
      showElement(instructionsContainer);
      break;
    case btnCloseInstructions:
    case instructionsContainer:
      hideElement(instructionsContainer);
      break;
    case btnCategoryClose:
      hideElement(categorySelectContainer);
      showElement(menuContainer);
      break;
    case btnQuizBack:
    case btnReturnToMenu:
      // Exit quiz, reset progress and return to main menu
      hideElement(quizContainer);
      hideElement(quizEndContainer);
      currentQuiz.resetQuizVariables();
      showElement(menuContainer);
      break;
    case btnPlayAgain:
      // Restart quiz
      hideElement(quizContainer);
      hideElement(quizEndContainer);
      currentQuiz.resetQuizVariables();
      populateAndDisplayCategorySelection();
      break;
  }
}

/**
 * Single event handler for the end of an animation. Removes the class so it
 * can be reapplied later.
 * @param {*} event Event to be handled
 */
function removeAnimationClass(event) {
  event.target.classList.remove('highlight-life-loss');
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
  // Response code 1 represents that the API doesn't have enough questions to
  // fulfill the request.
  if (data.response_code == 1) {
    throw new TypeError("NotEnoughQuestions");
  } else {
    return data;
  }
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
function setCustomQuizVariables(event) {
  event.preventDefault();
  const customDifficulty = document.getElementById('custom-difficulty');
  const customNumOfQuestions = document.getElementById('custom-number-of-questions');
  currentQuiz.customDifficultySelected = true;
  currentQuiz.numOfRounds = 0;
  currentQuiz.customDifficultyLevel = customDifficulty.value;
  currentQuiz.questionsPerRound = parseInt(customNumOfQuestions.value) - 1;
  btnSaveSettings.innerHTML = "Saved!";
  setTimeout(() => {
    btnSaveSettings.innerHTML = "Save";
    hideElement(settingsContainer);
  }, 1000);
}

/**
 * Sets the quiz settings back to default allowing a quiz with tiered difficulty
 * @param {*} event Form submit event to be handled
 */
function resetQuizSettings(event) {
  event.preventDefault();
  window.currentQuiz = new Quiz();
  btnResetSettings.innerHTML = "Reset!";
  setTimeout(() => {
    btnResetSettings.innerHTML = "Reset";
    hideElement(settingsContainer);
  }, 1000);
}

// --- Get Categories, and Create and Append Category Buttons to the DOM ---

/**
 * Call getData function with the Open Trivia Database Categories URL and
 * returns its promise
 * @returns Promise for the body of the response
 */
function getCategories() {
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
  const validCategories = [
    "General Knowledge",
    "Science & Nature",
    "Sports",
    "Geography",
    "History",
    "Entertainment: Books",
    "Entertainment: Film",
    "Entertainment: Music",
    "Entertainment: Video Games",
    "Science: Computers"
  ];
  let filteredCategories = categoriesArray.filter(category => validCategories.includes(category.name));
  return filteredCategories;
}

/**
 * Create a button element for each array element (filteredCategoriesArray), add
 * the name and id to a property of the button and append to the categories
 * container
 * @param {Array} filteredCategoriesArray Array of categories
 */
function createAndAppendCategoryButtons(filteredCategoriesArray) {
  categoriesContainer.innerHTML = "";
  let newCategoryButton = "";
  for (let i = 0; i < filteredCategoriesArray.length; i++) {
    newCategoryButton = document.createElement('button');
    let buttonText = "";
    if (filteredCategoriesArray[i].name.includes(':')) {
      buttonText = (filteredCategoriesArray[i].name).split(':')[1].trim();
    } else {
      buttonText = filteredCategoriesArray[i].name;
    }
    newCategoryButton.innerHTML = buttonText;
    newCategoryButton.setAttribute('data-id', filteredCategoriesArray[i].id);
    newCategoryButton.classList.add('btn-category', 'btn-menu');
    categoriesContainer.appendChild(newCategoryButton);
  }
}

// --- Get Questions and Answers, and Populate the Quiz Container Elements ---

/**
 * Retrieve and format quiz questions
 * @param {Int} categoryId number used to identify the category selected.
 * @returns 2D array of questions, each representing a round of the quiz
 */
async function getQuestions(categoryId) {
  const defaultDifficultyLevels = ['easy', 'medium', 'hard'];
  const customDifficulty = currentQuiz.customDifficultyLevel;
  const numOfRounds = currentQuiz.numOfRounds;
  const customDifficultySelected = currentQuiz.customDifficultySelected;
  const questionsPerRound = currentQuiz.questionsPerRound;
  let questionsUrl = "";
  allQuizQuestions = [];
  for (let i = 0; i <= numOfRounds; i++) {
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
   * Convert character entity references to symbols
   * CREDIT: Adapted from stack overflow answer
   * URL: https://stackoverflow.com/a/784698
   * @param {String} String containing character entity references
   * @returns Converted string e.g. "&amp;" -> converts to -> "&"
   */
  function convertHtml(unformattedString) {
    const tempElement = document.createElement('div');
    tempElement.innerHTML = unformattedString;
    return tempElement.innerText;
  }

  /**
   * Shuffle array using Durstenfeld shuffle (an optimized version of
   * Fisher-Yates)
   * CREDIT: From stack overflow answer
   * URL: https://stackoverflow.com/a/12646864
   * @param {*} array 
   */
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
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
      const correctAnswer = convertHtml(element.correct_answer);
      let question = {};
      let answerArray = [];
      question.question = element.question;
      // Create array of answer choices
      answerArray = element.incorrect_answers;
      answerArray.push(correctAnswer);
      shuffleArray(answerArray);
      // Assign answers to question object
      question.answers = answerArray;
      question.correctAnswer = correctAnswer;
      question.difficulty = element.difficulty;
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
function populateQuizContainerElements() {
  const questions = currentQuiz.questions;
  const roundNum = currentQuiz.currentRoundNum;
  const questionNum = currentQuiz.currentQuestionNum;
  questionTextArea.innerHTML = questions[roundNum][questionNum].question;
  for (let i = 0; i < btnAnswers.length; i++) {
    btnAnswers[i].innerHTML = questions[roundNum][questionNum].answers[i];
    btnAnswers[i].classList.remove('correct-answer', 'incorrect-answer');
  }
  // New question ready so ensure the answer buttons are enabled
  enableAnswerButtons();
  //Update the displayed statistics (updated question progress will be
  //displayed)
  populateAndDisplayQuizProgressInfo();
}

// --- Check Selected Answer ---

/**
 *  Checks the selected answer against the correct answer
 * @param {Object} element HTML element containing selected answer
 */
function checkSelectedAnswer(element) {
  const questions = currentQuiz.questions;
  const roundNum = currentQuiz.currentRoundNum;
  const questionNum = currentQuiz.currentQuestionNum;
  const selectedAnswer = element.innerText;
  const correctAnswer = questions[roundNum][questionNum].correctAnswer;

  setTimeout(element.classList.add('tentative-answer'));

  // Disable buttons while answer is checked
  disableAnswerButtons();
  if (selectedAnswer == correctAnswer) {
    setTimeout(() => {
      element.classList.replace('tentative-answer', 'correct-answer');
      currentQuiz.incrementTotalNumCorrectAnswers();
      nextQuestion();
    }, 1000);
  } else {
    setTimeout(() => {
      setTimeout(element.classList.replace('tentative-answer', 'incorrect-answer'), 1000);
      livesRemainingContainer.classList.add('highlight-life-loss');
      currentQuiz.decrementLives();
      //Update the displayed statistics (updated lives remaining will be
      //displayed)
      populateAndDisplayQuizProgressInfo();
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
        handleQuizEnd(0); // No Lives Remaining
      }
    }, 1000);
  }
}

// --- Advance Quiz and Update Quiz Progress Information ---

/**
 * Advances quiz, increments question number, round number and calling for the
 * next question. If there anr no more questions function ends the quiz.
 */
function nextQuestion() {
  const numOfRounds = currentQuiz.numOfRounds;
  const questionsPerRound = currentQuiz.questionsPerRound;
  const roundNum = currentQuiz.currentRoundNum;
  const questionNum = currentQuiz.currentQuestionNum;

  if (questionNum < (questionsPerRound)) {
    // Not last question in round so increment the currentQuestionNum
    currentQuiz.incrementQuestion();
    setTimeout(populateQuizContainerElements, 1000);
  } else {
    // Last question in round
    if (roundNum != (numOfRounds)) {
      // Not last question in the quiz so increment currentRoundNum
      currentQuiz.incrementRound();
      currentQuiz.resetQuestionNum();
      setTimeout(populateQuizContainerElements, 1000);
    } else {
      // This is the last question of the last round so the quiz is over
      handleQuizEnd(1); // Win
    }
  }
}

/**
 * Update number of lives and questions remaining
 */
function populateAndDisplayQuizProgressInfo() {
  const numOfLivesRemaining = currentQuiz.numOfLivesRemaining;
  const numOfRounds = currentQuiz.numOfRounds + 1;
  const totalNumCorrectAnswers = currentQuiz.totalNumCorrectAnswers + 1;
  const totalQuestions = (currentQuiz.numOfRounds + 1) * (currentQuiz.questionsPerRound + 1);
  const currentQuestionNumForDisplay = numOfRounds - (numOfRounds - totalNumCorrectAnswers);
  const questions = currentQuiz.questions;
  const roundNum = currentQuiz.currentRoundNum;
  const questionNum = currentQuiz.currentQuestionNum;
  const currentDifficultyForDisplay = questions[roundNum][questionNum].difficulty;

  currentDifficulty.innerHTML = currentDifficultyForDisplay;
  livesRemainingElement.innerHTML = numOfLivesRemaining;
  questionsRemainingElement.innerHTML = `Question ${currentQuestionNumForDisplay} of ${totalQuestions}`;
}

// --- Handle Quiz Completion/End ---

/**
 * Handle the end of the quiz and display stats and options to proceed
 * @param {Int} winCondition number representing win condition (0 = No lives
 * remaining, 1 = Quiz Complete)
 */
function handleQuizEnd(winCondition) {
  const totalNumCorrectAnswers = currentQuiz.totalNumCorrectAnswers;
  let htmlContent = "";

  // hideElement(quizContainer);
  if (winCondition === 0) {
    htmlContent = `
    No more lives!\nYou answered ${totalNumCorrectAnswers} questions correctly.
    `;
  } else {
    htmlContent = `
    You Win!\nYou answered ${totalNumCorrectAnswers} questions correctly.
    `;
  }
  quizEndStats.innerHTML = htmlContent;
  setTimeout(() => {
    showElement(quizEndContainer);
  }, 1500);
}

// --- Show/Hide Elements of the Quiz Container ---

/**
 * Request categories and displays them once the promise has been fulfilled
 */
async function populateAndDisplayCategorySelection() {
  hideElement(menuContainer);
  showElement(loadingContainer);
  try {
    // Waits for the promise to resolve
    const categories = await getCategories();
    const filteredCategories = filterCategories(categories);
    createAndAppendCategoryButtons(filteredCategories);
    hideElement(loadingContainer);
    showElement(categorySelectContainer);
  } catch (e) {
    handleError(e);
  }
}

/**
 * Requests the quiz questions and answers and displays them once the promise
 * has been fulfilled
 * @param {Int} categoryId number used to identify the category selected.
 */
async function populateAndDisplayQuiz(categoryId) {
  hideElement(categorySelectContainer);
  showElement(loadingContainer);

  try {
    const questions = await getQuestions(categoryId);
    // Add the question to the currentQuiz Object
    currentQuiz.questions = questions;
    populateQuizContainerElements();
    hideElement(loadingContainer);
    showElement(quizContainer);
  } catch (e) {
    handleError(e);
  }
}

// --- Error Handler ---

/**
 * Error handler - Display's the error to the user and returns to the main menu
 * @param {Object} e Error 
 */
function handleError(e) {
  if (e instanceof TypeError) {
    if (e.message.includes("Network")) {
      console.log("Alerted user to error:\n", e, "\nReturning to main menu");
      alert("Please check network connection.");
    } else if (e.message.includes("NotEnoughQuestions")) {
      console.log("Alerted user to error:\n", e, "\nReturning to main menu");
      alert("Not enough questions in selected difficulty");
    }
    hideElement(loadingContainer);
    showElement(menuContainer);
  }
}

/**
 * Attach event listener to the 'application-container' element and create a new
 * currentQuiz class in the global scope
 */
document.addEventListener('DOMContentLoaded', function () {
  applicationInitialization();
  window.currentQuiz = new Quiz();
});