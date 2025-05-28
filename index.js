const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const qrcode = require('qrcode-terminal');
require('dotenv').config();

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Bot configuration
const BOT_NAME = process.env.BOT_NAME || 'WhatsApp AI Bot';
const BOT_PREFIX = process.env.BOT_PREFIX || '!';
const ALLOWED_NUMBERS = process.env.ALLOWED_NUMBERS ? process.env.ALLOWED_NUMBERS.split(',') : [];
const ADMIN_NUMBERS = process.env.ADMIN_NUMBERS ? process.env.ADMIN_NUMBERS.split(',') : [];

// Initialize WhatsApp client
const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "whatsapp-ai-bot"
    }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    }
});

// Bot commands
const commands = {
    help: {
        description: 'Show available commands',
        usage: `${BOT_PREFIX}help`,
        execute: async (message) => {
            const helpText = `🤖 *${BOT_NAME}*\n\n` +
                `💬 *Conversa Livre com IA*\n` +
                `Você pode enviar qualquer mensagem e eu responderei usando Inteligência Artificial!\n\n` +
                `🔧 *Comandos Opcionais:*\n` +
                Object.entries(commands).map(([cmd, info]) =>
                    `*${info.usage}* - ${info.description}`
                ).join('\n') +
                `\n\n✨ *Dica:* Não precisa usar comandos! Apenas converse comigo naturalmente.`;

            await message.reply(helpText);
        }
    },

    ping: {
        description: 'Check if bot is responsive',
        usage: `${BOT_PREFIX}ping`,
        execute: async (message) => {
            await message.reply('🏓 Pong! Bot is working correctly.');
        }
    },

    info: {
        description: 'Get bot information',
        usage: `${BOT_PREFIX}info`,
        execute: async (message) => {
            const info = `🤖 *${BOT_NAME}*\n\n` +
                `📱 WhatsApp Web Integration\n` +
                `🧠 Powered by Google Generative AI\n` +
                `⚡ Node.js Runtime\n\n` +
                `Type any message to chat with AI or use ${BOT_PREFIX}help for commands.`;

            await message.reply(info);
        }
    }
};

// Utility functions
function isAllowedUser(phoneNumber) {
    if (ALLOWED_NUMBERS.length === 0) return true;
    return ALLOWED_NUMBERS.includes(phoneNumber);
}

function isAdmin(phoneNumber) {
    return ADMIN_NUMBERS.includes(phoneNumber);
}

function extractCommand(messageBody) {
    if (!messageBody.startsWith(BOT_PREFIX)) return null;

    const parts = messageBody.slice(BOT_PREFIX.length).trim().split(' ');
    return {
        command: parts[0].toLowerCase(),
        args: parts.slice(1)
    };
}

async function generateAIResponse(prompt, userInfo) {
    try {
        const enhancedPrompt = `Você é um assistente de WhatsApp amigável e inteligente. O nome do usuário é ${userInfo.name}.
        Responda de forma natural, amigável e conversacional em português brasileiro.
        Mantenha as respostas concisas mas informativas. Use emojis quando apropriado para tornar a conversa mais divertida.

        Mensagem do usuário: ${prompt}`;

        const result = await model.generateContent(enhancedPrompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Error generating AI response:', error);
        return '❌ Sorry, I encountered an error while processing your message. Please try again later.';
    }
}

// Event handlers
client.on('qr', (qr) => {
    console.log('🔗 Scan the QR code below to connect your WhatsApp:');
    qrcode.generate(qr, { small: true });
    console.log('\n📱 Open WhatsApp on your phone > Linked Devices > Link a Device > Scan the QR code above');
});

client.on('ready', () => {
    console.log('✅ WhatsApp bot is ready and connected!');
    console.log(`🤖 Bot Name: ${BOT_NAME}`);
    console.log(`⚡ Command Prefix: ${BOT_PREFIX}`);
    console.log('📱 Waiting for messages...\n');
});

client.on('authenticated', () => {
    console.log('🔐 WhatsApp authentication successful!');
});

client.on('auth_failure', (msg) => {
    console.error('❌ WhatsApp authentication failed:', msg);
});

client.on('disconnected', (reason) => {
    console.log('📱 WhatsApp client disconnected:', reason);
});

client.on('message_create', async (message) => {
    // Skip if message is from status broadcast
    if (message.from === 'status@broadcast') return;

    // Skip if message is from the bot itself
    if (message.fromMe) return;

    try {
        const contact = await message.getContact();
        const chat = await message.getChat();
        const phoneNumber = contact.number;
        const userName = contact.pushname || contact.name || phoneNumber;

        // Check if user is allowed to use the bot
        if (!isAllowedUser(phoneNumber)) {
            console.log(`🚫 Unauthorized access attempt from: ${phoneNumber}`);
            return;
        }

        console.log(`📨 Message from ${userName} (${phoneNumber}): ${message.body}`);

        // Check if message is a command first
        const commandData = extractCommand(message.body);
        if (commandData && commands[commandData.command]) {
            console.log(`🔧 Executing command: ${commandData.command}`);
            await commands[commandData.command].execute(message, commandData.args);
            return;
        }

        // Handle ALL messages with AI (no prefix needed)
        if (message.body.trim()) {
            console.log('🧠 Generating AI response...');

            // Show typing indicator
            chat.sendStateTyping();

            const aiResponse = await generateAIResponse(message.body, {
                name: userName,
                phone: phoneNumber
            });

            await message.reply(aiResponse);
            console.log('✅ AI response sent successfully');
        }

    } catch (error) {
        console.error('❌ Error handling message:', error);
        try {
            await message.reply('❌ Sorry, I encountered an error while processing your message. Please try again.');
        } catch (replyError) {
            console.error('❌ Error sending error message:', replyError);
        }
    }
});

// Error handling
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down bot...');
    await client.destroy();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down bot...');
    await client.destroy();
    process.exit(0);
});

// Start the bot
console.log('🚀 Starting WhatsApp AI Bot...');
console.log('📋 Initializing WhatsApp client...');

if (!process.env.GOOGLE_API_KEY) {
    console.error('❌ Error: GOOGLE_API_KEY is not set in environment variables');
    console.log('💡 Please create a .env file and add your Google API key');
    process.exit(1);
}

client.initialize();