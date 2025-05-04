const words = [
    { word: "Hello", translation: "Привет", example: "Hello, world!" },
    { word: "World", translation: "Мир", example: "Hello, world!" },
    { word: "Good", translation: "Хороший", example: "Good day!" },
    { word: "Day", translation: "День", example: "Good day!" },
    { word: "Bye", translation: "Пока", example: "Bye-bye!" },
];
let shuffledWords = [];
let selectedCards = [];
let correctAnswers = 0;
let startTime;
let timerInterval;
let currentWordIndex = 0;
let wordStats = {};


const studyMode = document.getElementById('study-mode');
const examMode = document.getElementById('exam-mode');
const examCardsContainer = document.getElementById('exam-cards');
const currentWordSpan = document.getElementById('current-word');
const totalWordSpan = document.getElementById('total-word');
const wordsProgress = document.getElementById('words-progress');
const correctPercentSpan = document.getElementById('correct-percent');
const examProgress = document.getElementById('exam-progress');
const timeSpan = document.getElementById('time');
const backBtn = document.getElementById('back');
const nextBtn = document.getElementById('next');
const examBtn = document.getElementById('exam');
const shuffleWordsBtn = document.getElementById('shuffle-words');
const cardFront = document.getElementById('card-front').querySelector('h1');
const cardBackWord = document.getElementById('card-back').querySelector('h1');
const cardBackExample = document.getElementById('card-back').querySelector('span');
const flipCard = document.querySelector('.flip-card');
const resultsModal = document.querySelector('.results-modal');
const resultsList = resultsModal.querySelector('.results-content');
const resultsTimer = resultsModal.querySelector('#timer');
const wordStatsTemplate = document.getElementById('word-stats');
const trainingCardsContainer = document.querySelector('.study-cards');


function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function updateCard() {
    if (words.length > 0) {
        const word = words[currentWordIndex];
        cardFront.textContent = word.word;
        cardBackWord.textContent = word.translation;
        cardBackExample.textContent = word.example;
        currentWordSpan.textContent = currentWordIndex + 1;
        totalWordSpan.textContent = words.length;
        wordsProgress.value = Math.round((currentWordIndex + 1) / words.length * 100);

        backBtn.disabled = currentWordIndex === 0;
        nextBtn.disabled = currentWordIndex === words.length - 1;
    }
}

function startTimer() {
    timerInterval = setInterval(() => {
        const elapsedTime = new Date() - startTime;
        const seconds = Math.floor((elapsedTime / 1000) % 60);
        const minutes = Math.floor((elapsedTime / (1000 * 60)) % 60);
        timeSpan.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

function startExam() {
    studyMode.classList.add('hidden');
    examMode.classList.remove('hidden');
    shuffledWords = [...words];
    shuffleArray(shuffledWords);
    correctAnswers = 0;
    correctPercentSpan.textContent = '0%';
    examProgress.value = 0;
    timeSpan.textContent = '00:00';
    startTime = new Date();
    startTimer();
    createExamCards();
    wordStats = {};
    trainingCardsContainer.classList.add('hidden');
    backBtn.style.display = 'none';
    nextBtn.style.display = 'none';
    shuffleWordsBtn.style.display = 'none';

    createExamCards();
}


function createExamCards() {
    examCardsContainer.innerHTML = '';
    shuffledWords = [...words];
    shuffleArray(shuffledWords);

    shuffledWords.forEach(word => {
        const cardWord = document.createElement('div');
        cardWord.classList.add('card');
        cardWord.textContent = word.word;
        cardWord.dataset.translation = word.translation;
        cardWord.id = word.word;
        examCardsContainer.appendChild(cardWord);

        const cardTranslation = document.createElement('div');
        cardTranslation.classList.add('card');
        cardTranslation.textContent = word.translation;
        cardTranslation.dataset.translation = word.word;
        cardTranslation.id = word.translation;
        examCardsContainer.appendChild(cardTranslation);

        wordStats[word.word] = 0;
    });
}

function handleExamCardClick(event) {
    const card = event.target.closest('.card');
    if (!card || card.classList.contains('correct') || card.classList.contains('wrong') || card.classList.contains('fade-out')) return;
    card.classList.add('correct');
    selectedCards.push(card);
    if (selectedCards.length === 2) {
        checkMatch();
    }
}

function stopTimer() {
    clearInterval(timerInterval);
}

function showResults() {
    const elapsedTime = new Date() - startTime;
    const seconds = Math.floor((elapsedTime / 1000) % 60);
    const minutes = Math.floor((elapsedTime / (1000 * 60)) % 60);
    resultsTimer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    resultsModal.classList.remove('hidden');
    populateResults();
}

function populateResults() {
    resultsList.innerHTML = '';
    for (const word in wordStats) {
        const clone = wordStatsTemplate.content.cloneNode(true);
        clone.querySelector('.word span').textContent = word;
        clone.querySelector('.attempts span').textContent = wordStats[word];
        resultsList.appendChild(clone);
    }
}

function checkMatch() {
    const [card1, card2] = selectedCards;
    card1.classList.add('correct');
    const isMatch = card1.textContent === card2.dataset.translation && card1.id != card2.id;

    if (isMatch) {
        card1.classList.add('fade-out');
        card2.classList.add('correct', 'fade-out');
        correctAnswers++;
    } else {
        card1.classList.add('wrong');
        card2.classList.add('wrong');
        setTimeout(() => {
            card1.classList.remove('wrong', 'correct');
            card2.classList.remove('wrong', 'correct');
        }, 500);
    }
    selectedCards = [];
    updateExamProgress();

    setTimeout(() => {
        if (card1.classList.contains('fade-out')) {
            card1.classList.add('hidden');
        }
        if (card2 && card2.classList.contains('fade-out')) {
            card2.classList.add('hidden');
        }
        if (examCardsContainer.querySelectorAll('.card.hidden').length === examCardsContainer.querySelectorAll('.card').length) {
            stopTimer();
            showResults();
        }
    }, 1000);


}

function updateExamProgress() {
    const percentage = Math.round((correctAnswers / shuffledWords.length) * 100);
    correctPercentSpan.textContent = `${percentage}%`;
    examProgress.value = percentage;
}

function startTimer() {
    timerInterval = setInterval(() => {
        const elapsedTime = new Date() - startTime;
        const seconds = Math.floor((elapsedTime / 1000) % 60);
        const minutes = Math.floor((elapsedTime / (1000 * 60)) % 60);
        timeSpan.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}


flipCard.addEventListener('click', () => {
    flipCard.classList.toggle('active');
});

examBtn.addEventListener('click', startExam);
backBtn.addEventListener('click', () => {
    currentWordIndex--;
    updateCard();
});
nextBtn.addEventListener('click', () => {
    currentWordIndex++;
    updateCard();
});
shuffleWordsBtn.addEventListener('click', () => {
    const originalIndex = words.indexOf(words[currentWordIndex]);
    shuffleArray(words);
    currentWordIndex = words.indexOf(words[originalIndex]);
    updateCard();
});




examBtn.addEventListener('click', () => {
    document.getElementById('study-mode').classList.add('hidden');
    document.getElementById('exam-mode').classList.remove('hidden');
    startTimer();
    createExamCards();
    examCardsContainer.addEventListener('click', handleExamCardClick);
});

updateCard();