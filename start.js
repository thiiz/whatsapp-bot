const { spawn } = require('child_process');
const path = require('path');

// Keep track of restart attempts
let restartCount = 0;
const MAX_RESTARTS = 5;
let cooldownActive = false;

// Start the bot process
function startBot() {
  console.log(`🚀 Starting WhatsApp bot (attempt ${restartCount + 1})...`);

  // Start the bot as a child process
  const botProcess = spawn('node', [path.join(__dirname, 'index.js')], {
    stdio: 'inherit'
  });

  // Handle process events
  botProcess.on('error', (error) => {
    console.error(`❌ Failed to start bot process: ${error.message}`);
    handleRestart();
  });

  botProcess.on('exit', (code, signal) => {
    if (code !== 0) {
      console.log(`⚠️ Bot process exited with code ${code}, signal: ${signal}`);
      handleRestart();
    }
  });

  // Return the process for cleanup
  return botProcess;
}

// Handle restart logic with exponential backoff
function handleRestart() {
  if (cooldownActive) return;

  restartCount++;

  if (restartCount <= MAX_RESTARTS) {
    // Calculate delay with exponential backoff
    const delay = Math.min(1000 * Math.pow(2, restartCount - 1), 60000);
    console.log(`⏱️ Restarting in ${delay / 1000} seconds...`);

    setTimeout(() => {
      startBot();
    }, delay);
  } else {
    cooldownActive = true;
    console.log('⚠️ Maximum restart attempts reached. Cooling down for 5 minutes...');

    // Reset after cooldown period
    setTimeout(() => {
      restartCount = 0;
      cooldownActive = false;
      startBot();
    }, 5 * 60 * 1000);
  }
}

// Start bot for the first time
let botProcess = startBot();

// Handle termination signals
process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down...');
  if (botProcess) botProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down...');
  if (botProcess) botProcess.kill('SIGTERM');
  process.exit(0);
});

// Keep process alive
require('./keep_alive');