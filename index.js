/**
 * VG Anúncios Bot - Bot profissional para WhatsApp
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Remover warning inseguro do TLS
process.env.NODE_TLS_REJECT_UNAUTHORIZED = undefined;

// Função para perguntar no terminal
function question(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function startBot() {
  try {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    console.log(`
╔══════════════════════════════════════════════════════════╗
║                🤖 VG ANÚNCIOS BOT 🤖                    ║
║                                                          ║
║           Bot WhatsApp Profissional v6.4.0              ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
`);

    // Verificar se a configuração existe
    const configPath = path.join(__dirname, 'src', 'config.js');
    
    if (!fs.existsSync(configPath)) {
        console.log(`
❌ CONFIGURAÇÃO NÃO ENCONTRADA!

🔧 Execute primeiro a configuração inicial:
   node setup-inicial.js

📋 Depois inicie o bot novamente:
   npm start
        `);
        process.exit(1);
    }

    console.log("🔄 Iniciando conexão com WhatsApp...");
    
    // Carregar módulos principais
    const { connect } = require("./src/connection");
    const { setupOwner } = require("./src/setup");
    const { successLog, errorLog, infoLog } = require("./src/utils/logger");

    // Configuração inicial do bot
    await setupOwner();

    // Conectar ao WhatsApp
    await connect();

  } catch (error) {
    console.error(`❌ Erro: ${error.message}`);
    console.log("🔄 Tentando novamente em 5 segundos...");
    setTimeout(() => startBot(), 5000);
  }
}

startBot();