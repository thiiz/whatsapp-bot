const wppconnect = require('@wppconnect-team/wppconnect');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const qrcode = require('qrcode-terminal');
require('dotenv').config();
require('./keep_alive'); // Import keep-alive server

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Bot configuration
const BOT_NAME = process.env.BOT_NAME || 'WhatsApp AI Bot';
const ALLOWED_NUMBERS = process.env.ALLOWED_NUMBERS ? process.env.ALLOWED_NUMBERS.split(',') : [];
const ADMIN_NUMBERS = process.env.ADMIN_NUMBERS ? process.env.ADMIN_NUMBERS.split(',') : [];

// Set to track users who have already received a message
const messagesSent = new Set();

// Utility functions
function isAllowedUser(phoneNumber) {
    if (ALLOWED_NUMBERS.length === 0) return true;
    return ALLOWED_NUMBERS.includes(phoneNumber);
}

function isAdmin(phoneNumber) {
    return ADMIN_NUMBERS.includes(phoneNumber);
}

async function generateAIResponse(prompt, userInfo) {
    try {
        const enhancedPrompt = `Você é um assistente de uma loja de produtos dropshipping.
        quando um cliente mandar uma mensagem, você deve responder que um atendente irá responder o mais breve possível.
        o cliente não pode fazer pedidos, apenas perguntas.
        não responda nenhuma pergunta do cliente, apenas responda que um atendente irá responder o mais breve possível.
        não use emojis, apenas use texto.

        Mensagem do usuário: ${prompt}`;

        const result = await model.generateContent(enhancedPrompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Error generating AI response:', error);
        return 'Sorry, I encountered an error while processing your message. Please try again later.';
    }
}

// Initialize WPPConnect
wppconnect
    .create({
        session: 'whatsapp-bot',
        autoClose: false,
        puppeteerOptions: {
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process',
                '--disable-gpu',
                '--ignore-certificate-errors',
                '--ignore-certificate-errors-spki-list',
                '--disable-extensions'
            ]
        },
        catchQR: (base64Qr, asciiQR, attempt) => {
            console.log('🔗 Scan the QR code below to connect your WhatsApp:');
            qrcode.generate(asciiQR, { small: true });
            console.log('\n📱 Open WhatsApp on your phone > Linked Devices > Link a Device > Scan the QR code above');
        }
    })
    .then((client) => start(client))
    .catch((error) => {
        console.error('Error creating session:', error);
    });

// Start bot function
function start(client) {
    console.log('✅ WhatsApp bot is ready and connected!');
    console.log(`🤖 Bot Name: ${BOT_NAME}`);
    console.log('📱 Waiting for messages...\n');

    // Handle incoming messages
    client.onMessage(async (message) => {
        // Skip if message is from status broadcast
        if (message.isGroupMsg) return;

        try {
            // Extract user info
            const phoneNumber = message.from.replace('@c.us', '');
            const userName = message.sender.pushname || phoneNumber;

            // Check if user is allowed to use the bot
            if (!isAllowedUser(phoneNumber)) {
                console.log(`🚫 Unauthorized access attempt from: ${phoneNumber}`);
                return;
            }

            console.log(`📨 Message from ${userName} (${phoneNumber}): ${message.body}`);

            // Check if user has already received a message
            if (messagesSent.has(phoneNumber)) {
                console.log(`🔄 User ${userName} (${phoneNumber}) already received a message, skipping.`);
                return;
            }

            // Handle message with AI
            if (message.body.trim()) {
                console.log('🧠 Generating AI response...');

                // Generate AI response
                const aiResponse = await generateAIResponse(message.body, {
                    name: userName,
                    phone: phoneNumber
                });

                // Send response
                await client.sendText(message.from, aiResponse);
                console.log('✅ AI response sent successfully');

                // Add user to the set of users who received a message
                messagesSent.add(phoneNumber);
            }
        } catch (error) {
            console.error('❌ Error handling message:', error);
            try {
                await client.sendText(message.from, 'Sorry, I encountered an error while processing your message. Please try again.');
            } catch (replyError) {
                console.error('❌ Error sending error message:', replyError);
            }
        }
    });
}

// Error handling
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
});

// Start message
console.log('🚀 Starting WhatsApp AI Bot...');
console.log('📋 Initializing WhatsApp client...');

if (!process.env.GOOGLE_API_KEY) {
    console.error('❌ Error: GOOGLE_API_KEY is not set in environment variables');
    console.log('💡 Please create a .env file and add your Google API key');
    process.exit(1);
}