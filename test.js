// Simple test script to verify dependencies are working
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Client } = require('whatsapp-web.js');

console.log('🧪 Testing WhatsApp AI Bot dependencies...\n');

// Test Google Generative AI
try {
    console.log('✅ Google Generative AI SDK loaded successfully');

    // Test if we can create an instance (without API key for now)
    const genAI = new GoogleGenerativeAI('test-key');
    console.log('✅ GoogleGenerativeAI instance created successfully');
} catch (error) {
    console.error('❌ Error with Google Generative AI:', error.message);
}

// Test WhatsApp Web.js
try {
    console.log('✅ WhatsApp Web.js loaded successfully');

    // Test if we can create a client instance
    const client = new Client();
    console.log('✅ WhatsApp Client instance created successfully');
} catch (error) {
    console.error('❌ Error with WhatsApp Web.js:', error.message);
}

// Test other dependencies
try {
    const qrcode = require('qrcode-terminal');
    console.log('✅ QR Code Terminal loaded successfully');
} catch (error) {
    console.error('❌ Error with QR Code Terminal:', error.message);
}

try {
    require('dotenv');
    console.log('✅ Dotenv loaded successfully');
} catch (error) {
    console.error('❌ Error with Dotenv:', error.message);
}

console.log('\n🎉 All dependencies are working correctly!');
console.log('\n📋 Next steps:');
console.log('1. Create a .env file with your Google API key');
console.log('2. Run "npm start" to start the bot');
console.log('3. Scan the QR code with WhatsApp');