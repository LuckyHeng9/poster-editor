import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import TelegramBot from 'node-telegram-bot-api';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import puppeteer from 'puppeteer';

// Load .env from the current directory
dotenv.config();

const app = express();
const port = 3001;

// Serve the built React frontend in production
app.use(express.static(path.join(process.cwd(), 'dist')));

const upload = multer({ storage: multer.memoryStorage() });
app.use(cors());
app.use(express.json());

const token = process.env.telegram_bot_token;
if (!token) {
  console.error("Error: telegram_bot_token is missing in .env");
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });
const CHAT_IDS_FILE = path.join(process.cwd(), 'chatIds.json');

// --- Helper Functions for Chat Management ---
const getChatIds = () => {
  if (!fs.existsSync(CHAT_IDS_FILE)) return [];
  try {
    const data = fs.readFileSync(CHAT_IDS_FILE, 'utf8');
    const parsed = JSON.parse(data);
    if (parsed.length > 0 && typeof parsed[0] === 'number') {
      return parsed.map(id => ({ id, title: 'Unknown (Old format)', type: 'unknown' }));
    }
    return parsed;
  } catch (err) {
    return [];
  }
};

const saveChatId = (chat) => {
  const chats = getChatIds();
  const existing = chats.find(c => c.id === chat.id);
  
  if (!existing) {
    chats.push({
      id: chat.id,
      title: chat.title || chat.first_name || 'Unknown',
      type: chat.type
    });
    fs.writeFileSync(CHAT_IDS_FILE, JSON.stringify(chats, null, 2));
    console.log(`Saved new Chat: ${chat.title || chat.id}`);
  } else if (chat.title && existing.title !== chat.title) {
    existing.title = chat.title;
    fs.writeFileSync(CHAT_IDS_FILE, JSON.stringify(chats, null, 2));
  }
};

// --- Backend Poster Generation (sharp) ---
const toKh = (num) => String(num).split('').map(d => (/\d/.test(d) ? ['០','១','២','៣','៤','៥','៦','៧','៨','៩'][+d] : d)).join('');
const khPeriod = (h) => h >= 5 && h < 12 ? 'ព្រឹក' : h >= 12 && h < 17 ? 'រសៀល' : h >= 17 && h < 21 ? 'ល្ងាច' : 'យប់';
const KH_MONTHS = ['មករា','កុម្ភៈ','មីនា','មេសា','ឧសភា','មិថុនា','កក្កដា','សីហា','កញ្ញា','តុលា','វិច្ឆិកា','ធ្នូ'];
const EN_MONTHS = ['Jan','Feb','Mar','Aprl','May','June','July','Aug','Sep','Oct','Nov','Dec'];

const getSnapshot = () => {
  const d = new Date();
  const h24 = d.getHours(), h12 = h24 % 12 || 12;
  const min  = String(d.getMinutes()).padStart(2,'0');
  const day  = String(d.getDate()).padStart(2,'0');
  return {
    khDay:    toKh(day),
    khMonth:  KH_MONTHS[d.getMonth()],
    khYear:   toKh(d.getFullYear()),
    enDate:   `${EN_MONTHS[d.getMonth()]} ${day} ${d.getFullYear()}`,
    khTime:   `${toKh(String(h12).padStart(2,'0'))}:${toKh(min)}`,
    enTime:   `${String(h12).padStart(2,'0')}:${min} ${h24 >= 12 ? 'PM' : 'AM'}`,
    khPeriod: khPeriod(h24),
  };
};

const escXml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const FIELDS = [
  { key:'khDay',    x:25.78, y:33.03, color:'#ffffff', fs:2.9,  fw:'600', maxW:11, label:'ថ្ងៃ'         },
  { key:'khMonth',  x:36.00, y:33.03, color:'#ffffff', fs:2.9,  fw:'600', maxW:14, label:'ខែ'           },
  { key:'khYear',   x:47.89, y:32.89, color:'#ffffff', fs:2.9,  fw:'600', maxW:14, label:'ឆ្នាំ'         },
  { key:'enDate',   x:29.92, y:37.09, color:'#E6D600', fs:2.7,  fw:'500', maxW:26, label:'English Date' },
  { key:'khTime',   x:75.50, y:32.91, color:'#ffffff', fs:2.9,  fw:'600', maxW:14, label:'ម៉ោង'         },
  { key:'khPeriod', x:90.50, y:32.95, color:'#ffffff', fs:2.9,  fw:'600', maxW:9,  label:'នាទី'         },
  { key:'enTime',   x:79.19, y:36.98, color:'#E6D600', fs:2.7,  fw:'500', maxW:18, label:'English Time' },
  { key:'buying',   x:47.27, y:60.37, color:'#ffffff', fs:7.5,  fw:'800', maxW:28, label:'Buying'       },
  { key:'selling',  x:79.49, y:60.22, color:'#ffffff', fs:7.5,  fw:'800', maxW:28, label:'Selling'      },
];

let fontCache = null;
const getFontBase64 = () => {
  if (fontCache) return fontCache;
  const f600Path = path.join(process.cwd(), 'public/fonts/kantumruy-pro-600.woff2');
  const f700Path = path.join(process.cwd(), 'public/fonts/kantumruy-pro-700.woff2');
  if (fs.existsSync(f600Path)) {
    const f600 = fs.readFileSync(f600Path).toString('base64');
    const f700 = fs.readFileSync(f700Path).toString('base64');
    fontCache = { f600, f700 };
  } else {
    fontCache = { f600: '', f700: '' };
  }
  return fontCache;
};

const generatePosterBuffer = async (buying, selling) => {
  const tmplPath = path.join(process.cwd(), 'public/x3.png');
  const metadata = await sharp(tmplPath).metadata();
  const w = metadata.width;
  const h = metadata.height;
  
  const snap = getSnapshot();
  const vals = { ...snap, buying, selling };
  
  const { f600, f700 } = getFontBase64();
  const fontCSS = `
    @font-face { font-family:'KantumruyProEmbed'; font-weight:500; font-style:normal; src:url(data:font/woff2;base64,${f600}) format('woff2'); }
    @font-face { font-family:'KantumruyProEmbed'; font-weight:600; font-style:normal; src:url(data:font/woff2;base64,${f600}) format('woff2'); }
    @font-face { font-family:'KantumruyProEmbed'; font-weight:700; font-style:normal; src:url(data:font/woff2;base64,${f700}) format('woff2'); }
    @font-face { font-family:'KantumruyProEmbed'; font-weight:800; font-style:normal; src:url(data:font/woff2;base64,${f700}) format('woff2'); }
  `;

  const textEls = FIELDS.map(({ key, x, y, color, fs, fw }) => {
    const fontSize = (fs / 100) * w;
    const px = (x / 100) * w;
    const py = (y / 100) * h;
    const text = escXml(vals[key] ?? '');
    return `<text x="${px}" y="${py}" fill="${color}" font-size="${fontSize}" font-weight="${fw}" font-family="'KantumruyProEmbed', sans-serif" text-anchor="middle" dominant-baseline="central">${text}</text>`;
  }).join('\n');

  const imgBase64 = fs.readFileSync(tmplPath).toString('base64');
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        ${fontCSS}
        body { margin: 0; padding: 0; overflow: hidden; background: transparent; }
        .container { position: relative; width: ${w}px; height: ${h}px; }
        .bg { width: 100%; height: 100%; position: absolute; top: 0; left: 0; }
        svg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
      </style>
    </head>
    <body>
      <div class="container">
        <img class="bg" src="data:image/png;base64,${imgBase64}" />
        <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
          ${textEls}
        </svg>
      </div>
    </body>
    </html>
  `;

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'networkidle0' });
  
  // Wait for fonts to be ready
  await page.evaluateHandle('document.fonts.ready');
  
  const element = await page.$('.container');
  // Return Uint8Array as Buffer
  const buffer = Buffer.from(await element.screenshot({ type: 'png' }));
  await browser.close();
  
  return buffer;
};

const generateCaption = (buying, selling) => {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const h24 = d.getHours();
  const h12 = h24 % 12 || 12;
  const min = String(d.getMinutes()).padStart(2, '0');
  const ampm = h24 >= 12 ? 'PM' : 'AM';
  
  return `📊 អត្រាប្តូរប្រាក់ប្រចាំថ្ងៃ – LTNG Exchange\n💵 USD ⇄ KHR\nទិញ: ${buying}៛\nលក់: ${selling}៛\n📅 ${day}/${month}/${year} | ⏰${String(h12).padStart(2, '0')}:${min} ${ampm}\n✅ អត្រាល្អ | ⚡️ សេវារហ័ស | 🔐 សុវត្ថិភាព\n📲 ទាក់ទង Telegram ឬលេខខាងក្រោម`;
};

// --- Telegram Bot Admin Flow ---
const adminSessions = new Set();
const pendingPosts = new Map();

bot.on('message', async (msg) => {
  if (!msg.text) return;
  const text = msg.text.trim();
  
  // 1. Admin login
  if (text.startsWith('/admin ')) {
    const password = text.split(' ')[1];
    if (password === process.env.password) {
      adminSessions.add(msg.from.id);
      bot.sendMessage(msg.chat.id, "✅ Admin mode activated.\nSend me two numbers separated by space (e.g. '4025 4032') to generate a poster.");
    } else {
      bot.sendMessage(msg.chat.id, "❌ Incorrect password.");
    }
    return;
  }

  // 2. Admin sending numbers
  if (adminSessions.has(msg.from.id)) {
    const match = text.match(/^(\d{4})\s+(\d{4})$/);
    if (match) {
      const n1 = parseInt(match[1], 10);
      const n2 = parseInt(match[2], 10);
      const buyingNum = Math.min(n1, n2);
      const sellingNum = Math.max(n1, n2);
      
      const buying = buyingNum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      const selling = sellingNum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      
      const statusMsg = await bot.sendMessage(msg.chat.id, "⏳ Generating poster...");
      
      try {
        const imageBuffer = await generatePosterBuffer(buying, selling);
        const messageId = Date.now().toString();
        
        const caption = generateCaption(buying, selling);

        pendingPosts.set(messageId, { imageBuffer, caption });
        
        await bot.sendPhoto(msg.chat.id, imageBuffer, {
          caption: caption + "\n\n⚠️ Preview only. Click Confirm to post.",
          reply_markup: {
            inline_keyboard: [
              [{ text: "✅ Confirm & Post", callback_data: `post_${messageId}` }],
              [{ text: "❌ Cancel", callback_data: `cancel_${messageId}` }]
            ]
          }
        });
        bot.deleteMessage(msg.chat.id, statusMsg.message_id);
      } catch (err) {
        console.error(err);
        bot.editMessageText("❌ Error generating poster. (Make sure public/x3.png exists)", {
          chat_id: msg.chat.id,
          message_id: statusMsg.message_id
        });
      }
      return;
    }
  }

  // 3. Fallback tracking: Only save groups/channels, never private chats
  if (msg.chat.type !== 'private') {
     saveChatId(msg.chat);
  }
});

bot.on('my_chat_member', (msg) => {
  saveChatId(msg.chat);
});

bot.on('callback_query', async (query) => {
  if (query.data.startsWith('cancel_')) {
    const messageId = query.data.split('_')[1];
    pendingPosts.delete(messageId);
    bot.answerCallbackQuery(query.id, { text: "Cancelled." });
    bot.editMessageReplyMarkup({ inline_keyboard: [] }, { chat_id: query.message.chat.id, message_id: query.message.message_id });
    return;
  }

  if (query.data.startsWith('post_')) {
    const messageId = query.data.split('_')[1];
    const postData = pendingPosts.get(messageId);
    
    if (!postData) {
      bot.answerCallbackQuery(query.id, { text: "❌ Session expired or image not found.", show_alert: true });
      return;
    }
    
    const { imageBuffer, caption } = postData;

    bot.answerCallbackQuery(query.id, { text: "Posting to all groups..." });
    const statusMsg = await bot.sendMessage(query.message.chat.id, "⏳ Broadcasting...");
    
    const broadcastKeyboard = {
      inline_keyboard: [
        [{ text: "💱ភ្នាក់ងារប្តូរប្រាក់ LTNG Exchange", url: "http://t.me/LTNGEXCHANGE" }],
        [{ text: "📢តាមដានអត្រាប្តូរប្រាក់ប្រចាំថ្ងៃ", url: "http://t.me/LTNGExchangeMoney" }],
        [{ text: "📊ព័ត៌មានការប្តូរប្រាក់ប្រចាំថ្ងៃ", url: "http://t.me/ltngexchange157" }]
      ]
    };

    // Only broadcast to groups and channels (filter out any accidentally saved private chats)
    const chats = getChatIds().filter(chat => chat.type !== 'private');
    const results = await Promise.allSettled(
      chats.map(chat => bot.sendPhoto(chat.id, imageBuffer, {
        caption: caption,
        reply_markup: broadcastKeyboard
      }))
    );
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    bot.editMessageText(`✅ Posted to ${successful} chats. Failed: ${failed}.`, {
      chat_id: query.message.chat.id,
      message_id: statusMsg.message_id
    });
    pendingPosts.delete(messageId);
  }
});

console.log('Telegram bot is listening for events...');

// --- Express API Routes ---
app.get('/api/chats', (req, res) => {
  res.json({ success: true, chats: getChatIds() });
});

app.post('/api/post-telegram', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }

    // Only broadcast to groups and channels
    const chats = getChatIds().filter(chat => chat.type !== 'private');
    if (chats.length === 0) {
      return res.status(400).json({ success: false, message: 'No Telegram chats saved. Please add the bot to a group or send it a message first.' });
    }

    const imageBuffer = req.file.buffer;
    const buying = req.body.buying || 'N/A';
    const selling = req.body.selling || 'N/A';
    
    const caption = generateCaption(buying, selling);
    const broadcastKeyboard = {
      inline_keyboard: [
        [{ text: "💱ភ្នាក់ងារប្តូរប្រាក់ LTNG Exchange", url: "http://t.me/LTNGEXCHANGE" }],
        [{ text: "📢តាមដានអត្រាប្តូរប្រាក់ប្រចាំថ្ងៃ", url: "http://t.me/LTNGExchangeMoney" }],
        [{ text: "📊ព័ត៌មានការប្តូរប្រាក់ប្រចាំថ្ងៃ", url: "http://t.me/ltngexchange157" }]
      ]
    };
    
    const results = await Promise.allSettled(
      chats.map(chat => bot.sendPhoto(chat.id, imageBuffer, {
        caption: caption,
        reply_markup: broadcastKeyboard
      }))
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    res.json({
      success: true,
      message: `Posted to ${successful} chats. Failed: ${failed}.`
    });
  } catch (err) {
    console.error('Error posting to telegram:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
