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
const btnCategories = document.querySelectorAll('.btn-category');
const quizContainer = document.getElementById('quiz-container');
const questionTextArea = document.getElementById('question-text');
const btnAnswers = document.querySelectorAll('.btn-answer');

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

  resetQuestionNumber() {
    this.currentQuestion = 0;
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
 * https://github.com/lukebinmore/2048/blob/ab3fb81ca162d5bd8e282daeeb44439508e5e2b8/assets/js/index.js#L55-L88
 * @param {*} event - Event to be handled
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
 * Adds each category name and id to a property of the category button elements
 * @param {Array} filteredCategoriesArray - Array of categories
 */
function displayCategories(filteredCategoriesArray) {
  for (let i = 0; i < btnCategories.length; i++) {
    btnCategories[i].innerHTML = filteredCategoriesArray[i].name;
    btnCategories[i].setAttribute('data-id', filteredCategoriesArray[i].id);
  }
}

/**
 * Retrieve and format quiz questions
 * @param {Int} categoryId - Number used to identify the category selected. Used
 * in subsequent fetch request.
 * @returns - Array containing multiple Arrays of questions, each representing a
 * round of the quiz
 */
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

  /**
  * Takes an Array of objects (question and answers) returned from the API
  * re-formats then before adding to a new array.
  * @param {Array} questions - Array of questions returned from the fetch
  * request
  * @returns - Re-formatted questions
  */
  function formatQuestions(questions) {
    let formattedQuestions = [];
    questions.forEach(element => {
      let question = {};
      let answerArray = [];
      question.question = element.question;
      // Create array of answer choices
      answerArray = element.incorrect_answers;
      answerArray.push(element.correct_answer);
      // Assign answers to question object
      question.answers = answerArray;
      question.correctAnswer = element.correct_answer;
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
 * @param {Array} questions - Specially formatted array of questions and answers
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
}

/**
 *  Checks the selected answer against the correct answer
 * @param {Object} element - HTML element containing selected answer
 */
function checkAnswer(element) {
  const questions = currentQuiz.questions;
  const roundNumber = currentQuiz.currentRound;
  const questionNumber = currentQuiz.currentQuestion;
  const selectedAnswer = element.innerHTML;
  const question = currentQuiz.currentQuestion;
  if (selectedAnswer == questions[roundNumber][questionNumber].correctAnswer) {
    console.log(`CORRECT - ${selectedAnswer}!`); // DEBUG
    element.classList.add('correct-answer');
    // TODO: Next question, increment question and round
    advanceQuiz();
  } else {
    console.log("WRONG - TRY AGAIN!"); // DEBUG
    element.classList.add('incorrect-answer');
    // TODO: Decrement lives
  }
}

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
  } else {
    // Last question in round
    if (roundNumber === (numberOfRounds)) {
      // This is round 3 so the game is over
      // TODO: Display Game Over
      console.log(`Winner of game!`); // DEBUG
    } else {
      // Not last question in the game so increment currentRound
      currentQuiz.incrementRound();
      currentQuiz.resetQuestionNumber();
    }
  }
  // Display next question
  // TODO: Disable buttons, Enable for next question
  setTimeout(displayQuestion, 1000);
}

/**
 * Request categories and displays them once the promise has been fulfilled
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

/**
 * Requests the quiz questions and answers and displays them once the promise
 * has been fulfilled
 * @param {*} categoryId 
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