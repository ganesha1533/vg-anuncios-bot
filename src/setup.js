/**
 * Sistema de Configuração Inicial - VG Anúncios
 * Define o dono do bot na primeira inicialização
 */

const readline = require('readline');
const { writeJSON, readJSON } = require('./utils');
const path = require('path');

/**
 * Configurar dono na primeira inicialização
 */
async function setupOwner() {
  const ownerPath = path.join(__dirname, '../database/owner.json');
  
  try {
    // Verificar se já tem owner configurado
    const existingOwner = readJSON(ownerPath);
    if (existingOwner && existingOwner.ownerNumber) {
      console.log(`👑 DONO JÁ CONFIGURADO: +${existingOwner.ownerNumber}`);
      return existingOwner.ownerNumber;
    }
  } catch (error) {
    // Arquivo não existe, precisamos configurar
  }
  
  console.log('\n🏴‍☠️ VG ANÚNcios - CONFIGURAÇÃO INICIAL 🏴‍☠️');
  console.log('═══════════════════════════════════════');
  console.log('🎯 PRIMEIRA INICIALIZAÇÃO DETECTADA!');
  console.log('📱 Configure o número do DONO antes de conectar...\n');
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    function askForOwner() {
      rl.question('👑 Digite o número do DONO (formato: 5516999999999): ', (ownerNumber) => {
        // Limpar número (apenas dígitos)
        const cleanNumber = ownerNumber.replace(/\D/g, '');
        
        if (cleanNumber.length < 10) {
          console.log('❌ Número inválido! Use formato: 5516999999999');
          console.log('💡 Exemplo: 5516981758604\n');
          return askForOwner(); // Perguntar novamente
        }
        
        // Confirmar número
        rl.question(`\n📋 Confirma o número +${cleanNumber} como DONO? (s/n): `, (confirm) => {
          if (confirm.toLowerCase() !== 's' && confirm.toLowerCase() !== 'sim') {
            console.log('🔄 Vamos configurar novamente...\n');
            return askForOwner();
          }
          
          // Salvar configuração do owner
          const ownerData = {
            ownerNumber: cleanNumber,
            setAt: new Date().toLocaleString('pt-BR'),
            deviceInfo: {
              pushName: `Dono VG +${cleanNumber}`,
              platform: "whatsapp"
            },
            setupMethod: "initial_setup"
          };
          
          writeJSON(ownerPath, ownerData);
          
          console.log(`\n✅ DONO CONFIGURADO COM SUCESSO!`);
          console.log(`👑 Número: +${cleanNumber}`);
          console.log(`📅 Data: ${ownerData.setAt}`);
          console.log(`🚀 Agora conectando ao WhatsApp...\n`);
          
          rl.close();
          resolve(cleanNumber);
        });
      });
    }
    
    askForOwner();
  });
}

/**
 * Verificar se é primeira inicialização
 */
function isFirstRun() {
  const ownerPath = path.join(__dirname, '../database/owner.json');
  
  try {
    const ownerData = readJSON(ownerPath);
    return !ownerData || !ownerData.ownerNumber;
  } catch (error) {
    return true; // Arquivo não existe = primeira vez
  }
}

module.exports = setupOwner;