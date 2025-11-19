document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const registrationForm = document.getElementById('registrationForm');
    const registrationPage = document.getElementById('registrationPage');
    const quizPage = document.getElementById('quizPage');
    const questionContainer = document.getElementById('questionContainer');
    const resultContainer = document.getElementById('resultContainer');
    const perfectScoreContainer = document.getElementById('perfectScoreContainer');
    const regularScoreContainer = document.getElementById('regularScoreContainer');
    const userNameDisplay = document.getElementById('userNameDisplay');
    const perfectUserNameDisplay = document.getElementById('perfectUserNameDisplay');
    const scoreDisplay = document.getElementById('scoreDisplay');
    const restartBtn = document.getElementById('restartBtn');
    
    // Quiz State
    let currentQuestion = 0;
    let score = 0;
    let userAnswers = [];
    let questions = [];
    let userData = {
        id: null,
        name: '',
        nic: '',
        phone: ''
    };

    // Initialize the application
    function init() {
        // Event Listeners
        if (registrationForm) {
            registrationForm.addEventListener('submit', function(e) {
                e.preventDefault();
                handleRegistration();
            });
        }

        if (restartBtn) {
            restartBtn.addEventListener('click', restartQuiz);
        }
    }

    // Main registration handler
    async function handleRegistration() {
        if (!validateForm()) return;

        try {
            toggleLoadingState(true);
            
            userData = {
                name: document.getElementById('name').value.trim(),
                nic: document.getElementById('nic').value.trim(),
                phone: document.getElementById('phone').value.trim()
            };

            const response = await registerUser(userData);
            if (!response.success) throw new Error(response.message);
            
            // Store the user ID from registration response
            userData.id = response.userId;
            
            await startQuiz();
            
        } catch (error) {
            console.error('Registration error:', error);
            alert('Error during registration: ' + error.message);
        } finally {
            toggleLoadingState(false);
        }
    }

    // Register user function
    async function registerUser(userData) {
        try {
            const response = await fetch('register.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }
            
            return data;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    // Save quiz results function
    async function saveQuizResults(userId, score, answers) {
        try {
            const response = await fetch('save_results.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userId,
                    score: score,
                    answers: answers
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to save results');
            }
            
            return data;
        } catch (error) {
            console.error('Results save error:', error);
            throw error;
        }
    }

    // Form validation
    function validateForm() {
        const name = document.getElementById('name').value.trim();
        const nic = document.getElementById('nic').value.trim();
        const phone = document.getElementById('phone').value.trim();

        if (!name || !nic || !phone) {
            alert('Please fill in all fields');
            return false;
        }
        
        // Corrected phone validation (JavaScript version)
        if (!/^[0-9]{10}$/.test(phone)) {
            alert('Please enter a valid 10-digit phone number (e.g., 1234567890)');
            return false;
        }
        
        return true;
    }

    // Loading state toggle
    function toggleLoadingState(isLoading) {
        const submitBtn = registrationForm?.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = isLoading;
            submitBtn.textContent = isLoading ? 'Loading...' : 'Start Quiz';
        }
    }

    // Start quiz process
    async function startQuiz() {
        if (!registrationPage || !quizPage) {
            console.error('Missing page elements');
            return;
        }

        registrationPage.classList.add('hidden');
        quizPage.classList.remove('hidden');
        
        try {
            await loadQuestions();
            showQuestion();
        } catch (error) {
            console.error('Quiz start error:', error);
            alert('Failed to start quiz: ' + error.message);
            restartQuiz();
        }
    }

    // Restart quiz
    function restartQuiz() {
        resultContainer?.classList.add('hidden');
        perfectScoreContainer?.classList.add('hidden');
        regularScoreContainer?.classList.add('hidden');
        registrationPage?.classList.remove('hidden');
        
        registrationForm?.reset();
        
        currentQuestion = 0;
        score = 0;
        userAnswers = [];
    }

    // Load questions
    async function loadQuestions() {
        try {
            // In production, you would fetch from get_questions.php
            questions = 
                {
                    question: "Which Bra is specially designed to wear with Sarees, Shalvas or Kurthis?",
    options: [
      "Uni-flex t Shirt Bra",
      "Saree Shaper Bra",
      "Energize Aerochic Sports Bra",
      "Contoured Comfort Support Minimizer Bra"
    ],
    correctAnswer: 1, // index of correct option (0-based)
    images: [
      "uniflex_bra.jpg",
      "saree_shaper.jpg",
      "aerochic_sports.jpg",
      "count_bra.jpg"
    ]
  },
  {
    question: "Which bra is soft, seamless, and feels like a second skin?",
    options: [
      "Energize Aerochic Sports Bra",
      "SKINS Bra",
      "Saree Shaper Bra",
      "Uni-flex t Shirt Bra"
    ],
    correctAnswer: 1,
    images: [
      "aerochic_sports.jpg",
      "skins_bra.jpg",
      "saree_shaper.jpg",
      "uniflex_bra.jpg"
    ]
  },
  
  {
    question: "Which bra can be styled in six different ways to match different outfits?",
    options: [
      "Uni-flex t Shirt Bra",
      "SKINS Bra",
      "Multiway Bra",
      "Saree Shaper Bra"
    ],
    correctAnswer: 2,
    images: [
      "uniflex_bra.jpg",
      "skins_bra.jpg",
      "MultiwayBra.jpg",
      "saree_shaper.jpg"
    ]
  },
  
            
            userAnswers = new Array(questions.length).fill(null);
        } catch (error) {
            console.error('Question loading error:', error);
            throw new Error('Failed to load questions');
        }
    }

    // Display current question
    function showQuestion() {
        if (currentQuestion >= questions.length) {
            showResults();
            return;
        }

        const question = questions[currentQuestion];
        questionContainer.innerHTML = buildQuestionHTML(question);
        setupQuestionInteractions();
    }

    // Build question HTML
    function buildQuestionHTML(question) {
        return `
            <div class="question">
                <h3>Question ${currentQuestion + 1} of ${questions.length}</h3>
                <p>${question.question}</p>
                <div class="options">
                    ${[1, 2, 3, 4].map(i => `
                        <div class="option" data-index="${i}">
                            ${question[`image${i}`] ? 
                                `<img src="images/${question[`image${i}`]}" class="option-image" alt="Option ${i}">` : ''}
                            <div class="option-text">${question[`option${i}`]}</div>
                        </div>
                    `).join('')}
                </div>
                <button class="btn next-btn">
                    ${currentQuestion === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                </button>
            </div>
        `;
    }

    // Setup question interactions
function setupQuestionInteractions() {
    const options = questionContainer.querySelectorAll('.option');
    options.forEach(option => {
        option.addEventListener('click', function() {
            options.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            userAnswers[currentQuestion] = parseInt(this.getAttribute('data-index'));
        });
        
        if (userAnswers[currentQuestion] === parseInt(option.getAttribute('data-index'))) {
            option.classList.add('selected');
        }
    });

    const nextBtn = questionContainer.querySelector('.next-btn');
    nextBtn.addEventListener('click', () => {
        if (userAnswers[currentQuestion] === undefined) {
            alert('Please select an answer before continuing');
            return;
        }
        currentQuestion++;
        if (currentQuestion < questions.length) {
            showQuestion();
        } else {
            showResults();
        }
    });
}

async function showResults() {
    // Calculate score
    score = questions.reduce((total, q, i) => {
        return total + (userAnswers[i] === q.correct_answer ? 1 : 0);
    }, 0);

    try {
        if (!userData || !userData.id) {
            throw new Error('User data not available');
        }

        // Clear previous animations
        clearAnimations();
        
        // Determine reward based on score
        let reward;
        if (score === questions.length) { // Perfect score
            reward = '20%_off';
        } else if (score >= Math.ceil(questions.length * 0.66)) { // Good score (~2/3)
            reward = '15%_off';
        } else if (score >= Math.ceil(questions.length * 0.33)) { // Basic score (~1/3)
            reward = '10%_off';
        } else {
            reward = 'none';
        }

        // Save results to server with determined reward
        const response = await saveQuizResults(userData.id, score, userAnswers, reward);
        
        // Display appropriate result page
        if (reward === '20%_off') {
            // Perfect score
            perfectScoreContainer.classList.remove('hidden');
            regularScoreContainer.classList.add('hidden');
            perfectUserNameDisplay.textContent = userData.name;
            document.querySelector('.discount-text').innerHTML = 
                "YOU'VE WON <span class='blink-percent'>20%</span> DISCOUNT VOUCHER";
            celebrationVideo.play();
            createFloatingStars();
        } else if (reward === '15%_off') {
            // Good score (2/3)
            regularScoreContainer.classList.remove('hidden');
            perfectScoreContainer.classList.add('hidden');
            userNameDisplay.textContent = userData.name;
            scoreDisplay.textContent = `YOUR SCORE IS ${score} OUT OF ${questions.length}`;
            document.querySelector('.discount-text').innerHTML = 
                "YOU GET A <span class='blink-percent'>15%</span> DISCOUNT VOUCHER";
            createSparkles();
        } else if (reward === '10%_off') {
            // Basic score (1/3)
            regularScoreContainer.classList.remove('hidden');
            perfectScoreContainer.classList.add('hidden');
            userNameDisplay.textContent = userData.name;
            scoreDisplay.textContent = `YOUR SCORE IS ${score} OUT OF ${questions.length}`;
            document.querySelector('.discount-text').innerHTML = 
                "YOU GET A <span class='blink-percent'>10%</span> DISCOUNT VOUCHER";
            createSparkles();
        } else {
            // No reward
            regularScoreContainer.classList.remove('hidden');
            perfectScoreContainer.classList.add('hidden');
            userNameDisplay.textContent = userData.name;
            scoreDisplay.textContent = `YOUR SCORE IS ${score} OUT OF ${questions.length}`;
            document.querySelector('.discount-text').textContent = 
                "THANKS FOR PARTICIPATING!";
        }

        // Show results container
        questionContainer.classList.add('hidden');
        resultContainer.classList.remove('hidden');

        // Auto-redirect after 7 seconds
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500);
        
    } catch (error) {
        console.error('Error saving results:', error);
        // Fallback display
        clearAnimations();
        regularScoreContainer.classList.remove('hidden');
        perfectScoreContainer.classList.add('hidden');
        userNameDisplay.textContent = userData?.name || 'Participant';
        scoreDisplay.textContent = `Your score is ${score} out of ${questions.length}`;
        document.querySelector('.discount-text').textContent = 
            "THANKS FOR PARTICIPATING!";
    }
}

function clearAnimations() {
    // Remove all animation elements
    document.querySelectorAll('.floating-star, .sparkle').forEach(el => el.remove());
}

// Helper: Create floating stars (Perfect Score)
function createFloatingStars() {
    const container = document.querySelector('.perfect-score-content');
    
    for (let i = 0; i < 5; i++) {
        const star = document.createElement('div');
        star.className = 'floating-star';
        star.innerHTML = '★';
        star.style.position = 'absolute';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.fontSize = `${Math.random() * 20 + 10}px`;
        star.style.animation = `floatStar ${Math.random() * 2 + 2}s infinite`;
        star.style.opacity = '0';
        container.appendChild(star);
    }
}

// Helper: Create sparkles (Regular Score)
function createSparkles() {
    const container = document.querySelector('.regular-score-page');
    
    for (let i = 0; i < 3; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.innerHTML = '✧';
        sparkle.style.position = 'absolute';
        sparkle.style.left = `${Math.random() * 100}%`;
        sparkle.style.top = `${Math.random() * 100}%`;
        sparkle.style.fontSize = '16px';
        sparkle.style.animation = `sparkle ${Math.random() * 1 + 1}s infinite`;
        container.appendChild(sparkle);
    }
}

// Initialize the application
init();
});                                         