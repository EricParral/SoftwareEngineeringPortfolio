# Jeopardy Game (scaffold)

This is a small Jeopardy-style game scaffold built for a quick browser-based assignment.
The project fetches questions from the Open Trivia Database (https://opentdb.com/) and renders screens using template literals. A minimal fetch polyfill and simple screen modules are provided so the app runs in environments without a native `fetch` implementation.

## Features

- Fetches questions from the Open Trivia Database API.
- Uses a fetch polyfill (XMLHttpRequest) to support older browsers.
- Screens are implemented as separate modules (home, game board, question screen) and return HTML strings using template literals.
- A lightweight dev server (lite-server) is configured for live reload.
- Handles the API rate limit by waiting 5 seconds between category calls (per assignment requirement).
- Provides fallbacks and visible status messages in-page so the app doesn't fail to a white screen when a request or module loading issue occurs.

## Quick start (Windows PowerShell)

1. Open PowerShell in the project folder:

```powershell
cd "c:\Users\parra\OneDrive\Desktop\Jeopardy_Emp\jeopardy-game"
```

2. Install dependencies (if you haven't already):

```powershell
npm install
```

3. Start the dev server (live reload):

```powershell
npm start
```

lite-server will open a browser window (usually at http://localhost:3005/) and reload on file changes.

## Files and structure

- `index.html` — main HTML page and entry point.
- `style.css` — basic styles for the game UI.
- `app.js` — application entry; wires screens and handles game logic and fetching.
- `fetchPolyfill.js` — small fetch polyfill implemented with XMLHttpRequest (requirement: no external fetch polyfill packages).
- `utils/api.js` — API helpers and category list; provides `getQuestions()`.
- `screens/` — screen modules that return HTML via template literals:
  - `homeScreen.js` — home screen markup + start button
  - `gameBoard.js` — renders the Jeopardy board
  - `questionScreen.js` — renders the question and answer buttons
- `package.json` — project metadata and start script (`lite-server`).

## Notes, constraints, and behavior

- Open Trivia DB rate limit: the app intentionally waits 5 seconds between category calls. Expect the "Loading questions..." phase to take time depending on the number of categories.
- If a category fetch fails the app uses placeholder/fallback questions so the board still renders.
- The app decodes HTML entities returned by the API so questions/answers display correctly.
- A small status panel (bottom-right) is shown in the page to surface runtime errors and loading progress — check that if the UI appears blank.

## Troubleshooting

- Blank screen / white page: open the page DevTools Console and look for errors. Also check the small status panel in the page (bottom-right) for messages. Common causes:
  - Module import shape mismatches (ES modules in the browser). The scaffold uses default exports for screens and also exposes a default export from `utils/api.js` to be resilient.
  - Network errors when calling the Open Trivia DB API (CORS or offline). In those cases fallbacks will be used.

- If you change module exports, do a hard reload in the browser (Ctrl+Shift+R) to clear cached ES modules served by lite-server.

## Next steps / suggestions

- Style the board to more closely match the Jeopardy TV show (grid layout, colors, fonts).
- Add a progress indicator (progress bar) during the slow category-loading phase.
- Persist scores or add player names and rounds.
- Add tests for the utility functions.

## License

MIT
