/**
 * Handler de eventos de grupos - VG Anúncios
 * Gerencia entrada/saída de membros
 */

const { readJSON } = require("../utils");
const path = require("path");

/**
 * Processar eventos de atualização de participantes
 */
async function handleGroupParticipantsUpdate(socket, update) {
  try {
    const { id: groupJid, participants, action } = update;
    
    // Processar apenas adições de membros
    if (action === 'add') {
      await handleNewMembers(socket, groupJid, participants);
    }
    
  } catch (error) {
    console.error('Erro no handler de participantes:', error);
  }
}

/**
 * Enviar boas-vindas para novos membros
 */
async function handleNewMembers(socket, groupJid, newMembers) {
  try {
    // Carregar configurações de boas-vindas
    const welcomePath = path.join(__dirname, "../../database/welcome.json");
    let welcomeData = {};
    
    try {
      welcomeData = readJSON(welcomePath) || {};
    } catch (error) {
      return; // Se não há configuração, não fazer nada
    }
    
    // Verificar se grupo tem boas-vindas ativadas
    if (!welcomeData[groupJid] || !welcomeData[groupJid].enabled) {
      return;
    }
    
    // Obter metadados do grupo
    const groupMetadata = await socket.groupMetadata(groupJid);
    const groupName = groupMetadata.subject;
    
    // Processar cada novo membro
    for (const memberJid of newMembers) {
      // Pular se for o próprio bot
      if (memberJid === socket.user.id) continue;
      
      // Preparar mensagem de boas-vindas
      let welcomeMessage = welcomeData[groupJid].message;
      
      // Substituir variáveis corretamente
      const memberNumber = memberJid.split('@')[0];
      const currentDate = new Date().toLocaleString('pt-BR');
      
      // ✅ VARIÁVEIS PADRÃO FUNCIONAIS
      welcomeMessage = welcomeMessage
        .replace(/@user/gi, `@${memberNumber}`)        // @USER ou @user
        .replace(/@group/gi, groupName)                // @GROUP ou @group  
        .replace(/@date/gi, currentDate);              // @DATE ou @date
      
      // Enviar mensagem de boas-vindas
      await socket.sendMessage(groupJid, {
        text: welcomeMessage,
        mentions: [memberJid]
      });
      
      console.log(`[WELCOME] Boas-vindas enviadas para +${memberNumber} no grupo ${groupName}`);
      
      // Aguardar um pouco entre mensagens se houver múltiplos membros
      if (newMembers.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
  } catch (error) {
    console.error('Erro ao enviar boas-vindas:', error);
  }
}

module.exports = handleGroupParticipantsUpdate;