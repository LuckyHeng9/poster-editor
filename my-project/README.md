# LTNG Exchange Poster Editor & Telegram Bot

This project is a complete solution for the LTNG Exchange company to generate and broadcast daily exchange rate posters automatically to Telegram groups and channels.

It consists of two main parts:
1. **React Frontend (Vite)**: A dynamic visual editor to adjust daily rates, preview the poster, and manually post to Telegram.
2. **Node.js Backend (Express & Telegram Bot)**: Handles remote poster generation (via `sharp`), saves connected Telegram groups, and handles Telegram `/admin` commands.

## Features
- **Dynamic Poster Generation**: Automatically formats current time, Khmer date strings, and embeds custom fonts.
- **Remote Admin Bot Control**: You can update and post the daily rates directly from Telegram without opening the web interface!
- **Auto-Sorting**: Send two numbers (e.g. `4025 4032`) to the bot, and it automatically assigns the lower value to the Buy Rate and the higher value to the Sell Rate.
- **Custom Broadcast Layout**: Posts are sent with your specific company caption layout and include customized inline link buttons for user engagement.

---

## 🚀 Setup & Installation

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### 2. Environment Variables
In the `my-project` folder, create or edit the `.env` file with the following variables:
```env
telegram_bot_token=YOUR_TELEGRAM_BOT_TOKEN
ltng_exchange_admin=YOUR_ADMIN_PASSWORD
```

### 3. Install Dependencies
Run the following inside the `my-project` folder:
```bash
npm install
```

---

## 🖥️ Running the Application

To use all features, you must run both the Frontend UI and the Backend Server.

1. **Run the React Frontend:**
   ```bash
   npm run dev
   ```
   *Your web app will be available at `http://localhost:5173`.*

2. **Run the Telegram Backend Server:**
   Open a *second terminal* in `my-project` and run:
   ```bash
   npm run server
   ```
   *The backend will run on port `3001` and your bot will start listening for messages.*

---

## 📱 How to Use the Telegram Admin Bot

Instead of using the website, you can post the daily updates directly from your phone!

1. **Link Groups/Channels**: Add your Telegram bot to any groups or channels you wish to broadcast to. The bot will automatically save them to its internal config (`chatIds.json`).
2. **Login as Admin**: Open a private chat with your bot and send your password:
   ```text
   /admin YOUR_ADMIN_PASSWORD
   ```
   *(The bot will confirm that Admin Mode is activated).*
3. **Generate a Poster**: Send the bot your two rates separated by a space (e.g. `4025 4032`).
4. **Confirm & Broadcast**: The bot will reply with a preview image of your poster and the formatted caption. Click the **[ ✅ Confirm & Post ]** inline button to broadcast it to all your saved groups!

---

## 🎨 Modifying Templates & Fonts
- **Template Image**: Ensure your base poster design is located at `public/x3.png`.
- **Fonts**: The project requires Kantumruy Pro fonts located at `public/fonts/kantumruy-pro-600.woff2` and `700.woff2` for correct SVG rendering.
