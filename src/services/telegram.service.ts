import TelegramBot from "node-telegram-bot-api";

let bot: TelegramBot | null = null;

function getBot(): TelegramBot {
  if (!bot) {
    const token = process.env.TELEGRAM_TOKEN;
    if (!token) {
      throw new Error("TELEGRAM_TOKEN não definido");
    }
    bot = new TelegramBot(token, {
      polling: false,
    });
  }
  return bot;
}

export async function sendMessage(message: string): Promise<void> {
  const token = process.env.TELEGRAM_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  console.log("🔧 Telegram config - Token:", token ? `${token.substring(0, 10)}...` : "❌ Não definido");
  console.log("🔧 Telegram config - Chat ID:", chatId || "❌ Não definido");

  if (!token) {
    throw new Error("TELEGRAM_TOKEN não definido");
  }

  if (!chatId) {
    throw new Error("TELEGRAM_CHAT_ID não definido");
  }

  try {
    const botInstance = getBot();
    console.log("📤 Enviando mensagem para chat:", chatId);
    await botInstance.sendMessage(chatId, message);
    console.log("✅ Mensagem enviada com sucesso para o Telegram");
  } catch (error: any) {
    console.error("❌ Erro ao enviar mensagem para o Telegram:", error.message);
    console.error("Detalhes do erro:", error.response?.data || error);
    throw error; // Re-throw para que o chamador possa lidar
  }
}
