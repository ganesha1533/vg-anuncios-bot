/**
 * VG Anúncios Bot - Entry Point
 * 
 * Bot WhatsApp Profissional para transmissão e gerenciamento de grupos
 * 
 * @version 6.4.0
 * @author VG Anúncios Team
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { connect } = require("./src/connection");
const { setupOwner, isFirstRun } = require("./src/setup");
const { 
  successLog,
  errorLog,
  infoLog,
} = require("./src/utils/logger");

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

    infoLog("🚀 Iniciando VG Anúncios Bot...");

    // Configuração inicial do bot
    await require('./src/setup')();

    // Conectar ao WhatsApp
    await connect();

  } catch (error) {
    errorLog(`❌ Erro: ${error.message}`);
    setTimeout(() => startBot(), 5000);
  }
}

startBot();