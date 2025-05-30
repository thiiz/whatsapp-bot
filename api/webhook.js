const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Set to track users who have already received a message
const messagesSent = new Set();

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

// Webhook handler
module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, sender } = req.body;

    // Validate required fields
    if (!message || !sender || !sender.phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const phoneNumber = sender.phone;
    const userName = sender.name || phoneNumber;

    // Check if user has already received a message
    if (messagesSent.has(phoneNumber)) {
      console.log(`User ${userName} (${phoneNumber}) already received a message, skipping.`);
      return res.status(200).json({ status: 'skipped', reason: 'Message already sent to this user' });
    }

    // Generate AI response
    const aiResponse = await generateAIResponse(message, {
      name: userName,
      phone: phoneNumber
    });

    // Add user to the set of users who received a message
    messagesSent.add(phoneNumber);

    // Return the response
    return res.status(200).json({
      response: aiResponse,
      recipient: phoneNumber
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};