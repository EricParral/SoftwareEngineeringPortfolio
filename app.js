// app.js
import './fetchPolyfill.js';
import * as api from './utils/api.js';
import renderHomeScreen from './screens/homeScreen.js';
import renderGameBoard from './screens/gameBoard.js';
import renderQuestionScreen from './screens/questionScreen.js';

const app = document.getElementById('app');
let categoryQuestions = [];
let score = 0;

// Helpers to safely obtain HTML from screen modules (handles named/default exports)
function getHomeHTML() {
    try {
        if (home && typeof home.renderHomeScreen === 'function') return home.renderHomeScreen();
        if (home && home.default && typeof home.default === 'function') return home.default();
        if (typeof home === 'function') return home();
        if (home && home.default && typeof home.default.renderHomeScreen === 'function') return home.default.renderHomeScreen();
    } catch (err) {
        console.error('getHomeHTML error', err);
    }
    return '<div class="home-screen"><h1>Welcome</h1></div>';
}

// Direct default imports for screens

// Create a small status area so errors and logs are visible in the page
const statusEl = document.createElement('div');
statusEl.id = 'status';
statusEl.style.cssText = 'position:fixed;right:8px;bottom:8px;padding:8px;background:rgba(0,0,0,0.7);color:#fff;border-radius:6px;max-width:320px;font-size:12px;z-index:9999;';
document.body.appendChild(statusEl);

function showStatus(msg, level = 'info') {
    const p = document.createElement('div');
    p.textContent = `[${level}] ${msg}`;
    statusEl.appendChild(p);
    // keep last 6 messages
    while (statusEl.childNodes.length > 6) statusEl.removeChild(statusEl.firstChild);
}

window.addEventListener('error', (e) => {
    showStatus(`Error: ${e.message} (${e.filename}:${e.lineno})`, 'error');
});

window.addEventListener('unhandledrejection', (e) => {
    showStatus(`UnhandledRejection: ${e.reason && e.reason.message ? e.reason.message : e.reason}`, 'error');
});

async function startGame() {
    try {
    app.innerHTML = '<h2>Loading questions... Please wait.</h2>';
    // clear status
    statusEl.innerHTML = '';
    showStatus('Starting to load categories...');

        categoryQuestions = [];
        // Resolve categories safely (module may export differently in some environments)
        let categoriesToUse = [];
        if (Array.isArray(api.categories)) {
            categoriesToUse = api.categories;
        } else if (api.default && Array.isArray(api.default.categories)) {
            categoriesToUse = api.default.categories;
            showStatus('Using categories from api.default.categories', 'info');
        } else {
            // Fallback hard-coded categories (same as original intended list)
            categoriesToUse = [
                { id: 9, name: 'General Knowledge' },
                { id: 17, name: 'Science & Nature' },
                { id: 21, name: 'Sports' },
                { id: 23, name: 'History' },
                { id: 27, name: 'Animals' },
                { id: 22, name: 'Geography' }
            ];
            showStatus('api.categories was not iterable; using fallback categories', 'warn');
        }

        for (let cat of categoriesToUse) {
            try {
                const qs = (typeof api.getQuestions === 'function') ? await api.getQuestions(cat.id, 5) : [];
                categoryQuestions.push(qs);
                showStatus(`Loaded ${categoryQuestions.length}/${categoriesToUse.length} categories`);
            } catch (err) {
                console.error('Failed to fetch category', cat, err);
                // Fallback: add placeholder empty questions so the UI still renders
                const fallback = Array.from({ length: 5 }).map((_, i) => ({
                    question: `Placeholder question for ${cat.name} #${i+1}`,
                    correct_answer: 'Correct Answer',
                    incorrect_answers: ['A', 'B', 'C']
                }));
                categoryQuestions.push(fallback);
            }
            // API rate limit: wait 5 seconds between category calls
            showStatus(`Waiting 5s to respect API rate limit...`);
            await new Promise(r => setTimeout(r, 5000));
        }

        score = 0;
        renderBoard();
    } catch (err) {
        console.error('startGame error', err);
        app.innerHTML = `<div class="error">Error starting game: ${err.message}</div>`;
    }
}

function renderBoard() {
    try {
    app.innerHTML = renderGameBoard(api.categories, categoryQuestions, score);

        // Attach listeners to question buttons using delegation where possible
        document.querySelectorAll('.question').forEach(btn => {
            btn.addEventListener('click', e => {
                const cat = e.target.dataset.cat;
                const idx = e.target.dataset.idx;
                showQuestion(Number(cat), Number(idx));
            });
        });
    } catch (err) {
        console.error('renderBoard error', err);
        app.innerHTML = `<div class="error">Error rendering board: ${err.message}</div>`;
    }
}

function showQuestion(cat, idx) {
    try {
        const q = categoryQuestions[cat][idx];
    app.innerHTML = renderQuestionScreen(q);

        document.querySelectorAll('.answer').forEach(btn => {
            btn.addEventListener('click', e => {
                const decode = (str) => {
                    const txt = document.createElement('textarea');
                    txt.innerHTML = str || '';
                    return txt.value;
                };

                if (decode(e.target.innerText) === decode(q.correct_answer)) {
                    alert('Correct!');
                    score += (idx + 1) * 100;
                } else {
                    alert(`Wrong! Correct: ${q.correct_answer}`);
                }
                renderBoard();
            });
        });
    } catch (err) {
        console.error('showQuestion error', err);
        app.innerHTML = `<div class="error">Error showing question: ${err.message}</div>`;
    }
}

// Render the home screen and use event delegation for the Start button so
// the UI appears even if the direct element lookup fails for timing reasons.
function init() {
    try {
    app.innerHTML = renderHomeScreen();

        app.addEventListener('click', (e) => {
            const target = e.target;
            if (target && target.id === 'start-game') {
                startGame();
            }
        });

        // Helpful debug hint if UI isn't visible
        if (!app.querySelector('#start-game')) {
            console.warn('Start button not found in home screen markup.');
        }
    } catch (err) {
        console.error('init error', err);
        app.innerHTML = `<div class="error">Initialization error: ${err.message}</div>`;
    }
}

init();
