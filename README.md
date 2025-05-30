# WhatsApp AI Bot

A powerful WhatsApp bot powered by Google Generative AI that can respond to messages intelligently and execute various commands.

## Features

- 🤖 **AI-Powered Responses**: Uses Google's gemini-2.0-flash model for intelligent conversations
- 📱 **WhatsApp Integration**: Built with whatsapp-web.js for seamless WhatsApp Web integration
- 🔧 **Command System**: Extensible command system with built-in commands
- 🔐 **Access Control**: Optional user whitelist and admin functionality
- 📊 **Logging**: Comprehensive logging for monitoring and debugging
- ⚡ **Real-time**: Instant responses with typing indicators

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Google AI API key
- WhatsApp account

## Installation

1. **Clone or download this project**
   ```bash
   cd whatsapp-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit the `.env` file and add your configuration:
   ```env
   GOOGLE_API_KEY=your_google_api_key_here
   BOT_NAME=WhatsApp AI Bot
   BOT_PREFIX=!
   ALLOWED_NUMBERS=
   ADMIN_NUMBERS=
   ```

## Getting Google AI API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key
5. Add it to your `.env` file

## Usage

### Starting the Bot

```bash
npm start
```

Or for development with auto-restart:
```bash
npm run dev
```

### First Time Setup

1. Run the bot with `npm start`
2. A QR code will appear in your terminal
3. Open WhatsApp on your phone
4. Go to **Settings** > **Linked Devices** > **Link a Device**
5. Scan the QR code displayed in your terminal
6. The bot will authenticate and start listening for messages

### Available Commands

- `!help` - Show available commands
- `!ping` - Check if bot is responsive
- `!info` - Get bot information

### Conversa Livre com IA

🎯 **Funcionalidade Principal**: Envie qualquer mensagem para o bot e ele responderá usando Inteligência Artificial do Google!

- ✅ **Sem prefixos necessários** - Converse naturalmente
- 🇧🇷 **Respostas em português brasileiro**
- 😊 **Conversas amigáveis e naturais**
- ⚡ **Respostas instantâneas**

**Exemplo:**
- Você: "Oi, como você está?"
- Bot: "Olá! Estou muito bem, obrigado por perguntar! 😊 Como posso te ajudar hoje?"

## Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `GOOGLE_API_KEY` | Your Google AI API key | - | ✅ |
| `BOT_NAME` | Display name for the bot | WhatsApp AI Bot | ❌ |
| `BOT_PREFIX` | Command prefix | ! | ❌ |
| `ALLOWED_NUMBERS` | Comma-separated list of allowed phone numbers | (all allowed) | ❌ |
| `ADMIN_NUMBERS` | Comma-separated list of admin phone numbers | (none) | ❌ |

### Access Control

- **ALLOWED_NUMBERS**: If specified, only these phone numbers can interact with the bot
- **ADMIN_NUMBERS**: Phone numbers with admin privileges (for future admin commands)

Example:
```env
ALLOWED_NUMBERS=5511999999999,5511888888888
ADMIN_NUMBERS=5511999999999
```

## Project Structure

```
whatsapp-bot/
├── index.js           # Main bot implementation
├── package.json       # Project dependencies and scripts
├── .env.example       # Environment variables template
├── .env              # Your environment variables (create this)
├── README.md         # This file
└── .wwebjs_auth/     # WhatsApp authentication data (auto-generated)
```

## Adding Custom Commands

To add a new command, edit the `commands` object in [`index.js`](index.js:37):

```javascript
const commands = {
    // Existing commands...

    mycommand: {
        description: 'Description of your command',
        usage: `${BOT_PREFIX}mycommand`,
        execute: async (message, args) => {
            // Your command logic here
            await message.reply('Command executed!');
        }
    }
};
```

## Troubleshooting

### Common Issues

1. **QR Code not appearing**
   - Make sure your terminal supports QR code display
   - Try running in a different terminal

2. **Authentication failed**
   - Delete the `.wwebjs_auth` folder and try again
   - Make sure WhatsApp Web is not open in your browser

3. **Bot not responding**
   - Check if your Google API key is valid
   - Verify the bot is connected (check console logs)
   - Make sure you're not in the ALLOWED_NUMBERS restriction

4. **Dependencies issues**
   - Try deleting `node_modules` and running `npm install` again
   - Make sure you have Node.js v16 or higher

### Logs

The bot provides detailed console logs:
- 🚀 Startup messages
- 📨 Incoming messages
- 🧠 AI processing
- ✅ Successful responses
- ❌ Errors and failures

## Security Considerations

- Keep your `.env` file secure and never commit it to version control
- Use the `ALLOWED_NUMBERS` feature to restrict access
- Monitor the console logs for unauthorized access attempts
- Keep your dependencies updated

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is licensed under the MIT License.

## Disclaimer

This bot is for educational and personal use. Make sure to comply with WhatsApp's Terms of Service and your local regulations when using automated messaging.

# WhatsApp Bot - Vercel Deployment

This is a WhatsApp bot built to integrate with external WhatsApp API services and deployed on Vercel.

## Important Note

This project has been modified to work as a webhook-based API on Vercel. The original WhatsApp-web.js implementation won't work on Vercel because:

1. Vercel uses serverless functions which don't support long-running processes
2. Puppeteer (used by whatsapp-web.js) requires a browser environment
3. The QR code authentication flow is difficult to manage in serverless environments

## How to Deploy to Vercel

### 1. Prepare your project

Make sure you have the following files:
- `api/webhook.js` (the main API endpoint)
- `vercel.json` (configuration for Vercel)
- `.env` (environment variables)

### 2. Install the Vercel CLI

```bash
npm install -g vercel
```

### 3. Set up environment variables

You need to add your environment variables to Vercel:

```bash
vercel env add GOOGLE_API_KEY
```

Enter your Google API key when prompted.

### 4. Deploy to Vercel

```bash
vercel
```

Follow the prompts to link your project to a Vercel account.

### 5. Connect to a WhatsApp API service

Since this is now a webhook-based API, you'll need to connect it to an external WhatsApp API service that can:

1. Receive messages from WhatsApp
2. Forward them to your Vercel webhook
3. Send responses back to WhatsApp

Some options include:
- [Twilio API for WhatsApp](https://www.twilio.com/whatsapp)
- [360dialog](https://www.360dialog.com/)
- [MessageBird](https://messagebird.com/en/whatsapp)

## API Usage

Your Vercel webhook expects POST requests with this format:

```json
{
  "message": "Hello, I need help with my order",
  "sender": {
    "phone": "1234567890",
    "name": "John Doe"
  }
}
```

And will respond with:

```json
{
  "response": "Um atendente irá responder o mais breve possível.",
  "recipient": "1234567890"
}
```

## Limitations

- The `messagesSent` Set will reset whenever the serverless function restarts
- For persistent storage of users who already received messages, use a database like MongoDB Atlas or Vercel KV