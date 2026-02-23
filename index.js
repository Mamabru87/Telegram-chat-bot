import TelegramBot from "node-telegram-bot-api";
import OpenAI from "openai";

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MY_USER_ID = process.env.MY_USER_ID;

function die(msg) {
  console.error("FATAL:", msg);
  process.exit(1);
}

if (!TELEGRAM_TOKEN) die("Missing TELEGRAM_TOKEN");
if (!OPENAI_API_KEY) die("Missing OPENAI_API_KEY");
if (!MY_USER_ID) die("Missing MY_USER_ID");

console.log("ENV OK ✅ Starting bot...");

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from?.id;
  const text = msg.text ?? "";

  // risponde solo a te
  if (String(userId) !== String(MY_USER_ID)) return;
  if (!text.trim()) return;

  bot.sendChatAction(chatId, "typing");

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Sei un assistente tecnico che aiuta Marco a creare app e scrivere codice." },
        { role: "user", content: text }
      ]
    });

    const reply = completion.choices?.[0]?.message?.content ?? "Nessuna risposta.";
    await bot.sendMessage(chatId, reply);
  } catch (err) {
    console.error(err);
    await bot.sendMessage(chatId, "Errore nel collegamento a OpenAI.");
  }
});

console.log("Bot attivo 🚀");
