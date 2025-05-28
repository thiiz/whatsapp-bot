// Example configuration file for WhatsApp AI Bot
// Copy this file to config.js and customize as needed

module.exports = {
    // Bot settings
    bot: {
        name: 'WhatsApp AI Bot',
        prefix: '!',

        // AI model settings
        ai: {
            model: 'gemini-pro',
            maxTokens: 1000,
            temperature: 0.7,

            // System prompt for the AI
            systemPrompt: `You are a helpful WhatsApp bot assistant.
            Please respond in a friendly and conversational way.
            Keep responses concise but informative.`
        },

        // Response settings
        responses: {
            showTyping: true,
            maxResponseLength: 2000,
            errorMessage: '❌ Sorry, I encountered an error while processing your message. Please try again later.',
            unauthorizedMessage: '🚫 You are not authorized to use this bot.',

            // Welcome message for new users
            welcomeMessage: `👋 Hello! I'm an AI-powered WhatsApp bot.
            Send me any message and I'll respond intelligently, or use !help to see available commands.`
        }
    },

    // Security settings
    security: {
        // Leave empty to allow all users
        allowedNumbers: [
            // '5511999999999',
            // '5511888888888'
        ],

        // Admin numbers (for future admin commands)
        adminNumbers: [
            // '5511999999999'
        ],

        // Rate limiting (messages per minute per user)
        rateLimit: {
            enabled: true,
            maxMessages: 10,
            windowMs: 60000 // 1 minute
        }
    },

    // Logging settings
    logging: {
        level: 'info', // 'debug', 'info', 'warn', 'error'
        logToFile: false,
        logFile: 'bot.log'
    },

    // WhatsApp client settings
    whatsapp: {
        clientId: 'whatsapp-ai-bot',

        // Puppeteer settings for WhatsApp Web
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
    }
};