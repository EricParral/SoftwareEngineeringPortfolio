
---

### 📄 **README.md**

```markdown
# Project 5 Discord Bot

This was a simple and fun Discord bot built with **discord.js** that demonstrates command creation, environment variables, and an interactive Tic-Tac-Toe game with a GUI.

---

## 🚀 Features

- `/help` — Displays the list of available commands  
- `/lorem` — Shows random Lorem Ipsum text (hardcoded)  
- `/die` — Shuts down the bot  
- `/roll` — Rolls a die (choose from d4, d6, d10, or d20)  
- `/game` — Starts an interactive Tic Tac Toe game against the bot using buttons

---

## 🧰 Technologies Used

- [Node.js](https://nodejs.org/)
- [discord.js v14](https://discord.js.org/#/)
- [dotenv](https://www.npmjs.com/package/dotenv)

---

## 🗂️ Folder Structure

```

Project5-bot/
│
├── commands/
│   ├── die.js
│   ├── game.js
│   ├── help.js
│   ├── lorem.js
│   └── roll.js
│
├── index.js
├── .env              # Stores your Discord token (NOT submitted)
├── deploy-commands.js
└── README.md

````

---

## ⚙️ Setup Instructions

1. **Clone or create the folder**
   ```bash
   mkdir Project5-bot
   cd Project5-bot
````

2. **Install dependencies**

   ```bash
   npm install discord.js dotenv
   ```

3. **Create a `.env` file**

   ```bash
   notepad .env
   ```

   Add your Discord bot token:

   ```
   DISCORD_TOKEN=your_discord_bot_token_here
   CLIENT_ID=your_bot_client_id_here
   ```

4. **Register slash commands**

   ```bash
   node deploy-commands.js
   ```

5. **Start your bot**

   ```bash
   node index.js
   ```

---

## 🎲 How to Use

Once your bot is online in your server:

1. Type `/help` to view all available commands.
2. Try `/roll` to roll a die.
3. Play Tic Tac Toe using `/game`.

---

## 💡 Notes

* The `.env` file is **not** committed to GitHub for security reasons.
* Make sure to **enable the Message Content Intent** in the Discord Developer Portal if required.
* For `/game`, the bot uses Discord buttons (`ActionRowBuilder`, `ButtonBuilder`) to create an interactive Tic Tac Toe grid.

---

## 🧑‍💻 Author

**Eric Miguel Parral**
Project 5 — JavaScript Discord Bot Exploration
Built to demonstrate shell-style command handling and Discord.js interactivity.

