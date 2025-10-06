/**
 * Handler de mensagens - VG Anúncios
 * 
 * @author VG Team
 */
const { 
  isOwner, 
  isAdmin, 
  isBotAdmin, 
  getUserName, 
  getSender, 
  isGroup, 
  getMessageText 
} = require("../utils");
const { 
  getPrefix, 
  getGroupData, 
  getUserData, 
  updateUserData, 
  incrementUserCommands, 
  incrementTotalCommands, 
  getSettings,
  isGroupActive,
  getAutoResponders
} = require("../utils/database");
const { 
  generateMenu, 
  commandNotFound, 
  permissionDenied, 
  botNotAdmin, 
  groupInactive, 
  maintenanceMode 
} = require("../menu");
const { OWNER_ONLY_COMMANDS, ADMIN_ONLY_COMMANDS } = require("../config");
const { infoLog, errorLog } = require("../utils/logger");

/**
 * Processar mensagens recebidas
 */
async function messageHandler(socket, message, commands) {
  try {
    // Extrair informações da mensagem
    const messageText = getMessageText(message);
    if (!messageText) return;

    const sender = getSender(message);
    const userName = getUserName(message);
    const groupJid = message.key.remoteJid;
    const isGroupMsg = isGroup(groupJid);
    
    // Atualizar dados do usuário
    updateUserData(sender, { name: userName });
    
    // 🔗 DETECTAR LINKS DE GRUPOS AUTOMATICAMENTE
    await detectGroupLinks(socket, message, messageText);
    
    // Verificar se é comando
    const prefix = getPrefix(isGroupMsg ? groupJid : null);
    if (!messageText.startsWith(prefix)) {
      // Verificar auto responder se for grupo
      if (isGroupMsg) {
        await handleAutoResponder(socket, message, messageText, groupJid);
      }
      return;
    }

    // Extrair comando e argumentos
    const args = messageText.slice(prefix.length).trim().split(/\s+/);
    const commandName = args.shift().toLowerCase();
    
    // Verificar se comando existe
    if (!commands.has(commandName)) {
      // Comando padrão do menu
      if (commandName === "menu" || commandName === "help") {
        const menuText = generateMenu(isGroupMsg ? groupJid : null);
        await socket.sendMessage(groupJid, { text: menuText });
        return;
      }
      
      await socket.sendMessage(groupJid, { 
        text: commandNotFound(prefix) 
      });
      return;
    }

    const command = commands.get(commandName);
    
    // Verificar manutenção (exceto para o dono)
    const settings = getSettings();
    if (settings.maintenance && !isOwner(sender)) {
      await socket.sendMessage(groupJid, { 
        text: maintenanceMode() 
      });
      return;
    }
    
    // Verificar se grupo está ativo (DESABILITADO - Bot funciona em qualquer grupo)
    // if (isGroupMsg && !isOwner(sender)) {
    //   const groupActive = isGroupActive(groupJid);
    //   console.log(`🔍 GROUP CHECK: ${groupJid} -> ATIVO: ${groupActive}`);
    //   
    //   if (!groupActive) {
    //     await socket.sendMessage(groupJid, { 
    //       text: groupInactive() 
    //     });
    //     return;
    //   }
    // }

    // Verificar permissões
    const hasPermission = await checkPermissions(
      socket, 
      command, 
      sender, 
      groupJid, 
      isGroupMsg
    );
    
    if (!hasPermission.allowed) {
      await socket.sendMessage(groupJid, { 
        text: hasPermission.message 
      });
      return;
    }

    // ⚡ VERIFICAÇÃO DE GRUPO ATIVO REMOVIDA PARA MODO GRUPO FECHADO
    // Permitir uso em qualquer grupo (modo grupo fechado)
    
    // Executar comando
    try {
      infoLog(`🔥 Comando executado: ${commandName} por ${userName}`);
      
      // Incrementar contadores
      incrementUserCommands(sender);
      incrementTotalCommands();
      
      // Executar o comando
      await command.execute(socket, message, args);
      
    } catch (commandError) {
      errorLog(`❌ Erro ao executar comando ${commandName}: ${commandError.message}`);
      
      await socket.sendMessage(groupJid, { 
        text: `❌ *Erro ao executar comando:*\n\n${commandError.message}\n\n📢 *VG Anúncios - Sistema Completo*` 
      });
    }

  } catch (error) {
    errorLog(`❌ Erro no handler de mensagens: ${error.message}`);
  }
}

/**
 * Verificar permissões do comando - VERSÃO LIBERADA PARA GRUPOS FECHADOS
 */
async function checkPermissions(socket, command, sender, groupJid, isGroupMsg) {
  // 🔓 MODO GRUPO FECHADO: Permitir uso de comandos admin para qualquer membro
  // Apenas verificar se é comando do dono (manter proteção owner)
  if (OWNER_ONLY_COMMANDS.includes(command.name) || command.category === "owner") {
    if (!isOwner(sender)) {
      return {
        allowed: false,
        message: `🚫 *ACESSO NEGADO*\n\n❌ Apenas o dono pode usar este comando.\n👑 Dono atual: +${JSON.parse(require('fs').readFileSync(require('path').join(__dirname, '../../database/owner.json'), 'utf8')).ownerNumber}\n\n📢 *VG Anúncios - Sistema Completo*`
      };
    }
  }
  
  // 🔓 COMANDOS ADMIN LIBERADOS: Qualquer membro pode usar em grupos
  if (ADMIN_ONLY_COMMANDS.includes(command.name) || command.category === "admin") {
    if (!isGroupMsg) {
      return {
        allowed: false,
        message: "🚫 *Este comando só pode ser usado em grupos!*\n\n📢 *VG Anúncios - Sistema Completo*"
      };
    }
    // ✅ Permitir uso para qualquer membro do grupo (modo grupo fechado)
  }
  
  // Verificar se bot é admin (para comandos que precisam)
  const commandsNeedBotAdmin = [
    "ban", "banir", "add", "promover", "rebaixar", "abrir", "fechar",
    "hidetag", "marcar", "marcartodos", "limpar", "mutar", "desmutar",
    "warn", "unwarn", "link", "resetlink"
  ];
  
  if (commandsNeedBotAdmin.includes(command.name) && isGroupMsg) {
    // Se for owner, sempre permitir (bypass da verificação de admin)
    if (isOwner(sender)) {
      return { allowed: true };
    }
    
    const botIsAdmin = await isBotAdmin(socket, groupJid);
    if (!botIsAdmin) {
      return {
        allowed: false,
        message:
          "🤖 *Bot não é admin / ou não está no grupo.*\n\n" +
          "🔧 *Como corrigir:*\n" +
          "1) Adicione o bot ao grupo: +55 11 97009-479\n" +
          "2) Promova o bot para administrador\n" +
          "3) Repita o comando\n\n" +
          "📢 VG Anúncios"
      };
    }
  }
  
  return { allowed: true };
}

/**
 * Detectar e coletar links de grupos automaticamente
 */
async function detectGroupLinks(socket, message, messageText) {
  try {
    // Regex para detectar links do WhatsApp
    const linkRegex = /(?:https?:\/\/)?(?:chat\.whatsapp\.com\/|wa\.me\/|api\.whatsapp\.com\/send\?phone=)[A-Za-z0-9+/=_-]+/gi;
    const links = messageText.match(linkRegex);
    
    if (links && links.length > 0) {
      // Tentar importar função de coleta com segurança
      try {
        const coletarLinksCommand = require('../commands/user/coletarlinks');
        
        // Processar cada link encontrado
        for (const link of links) {
          if (link.includes('chat.whatsapp.com/')) {
            // É um link de grupo do WhatsApp
            coletarLinksCommand.coletarAutomatico(socket, message, link);
          }
        }
      } catch (importError) {
        console.log('[COLETOR] Comando coletarlinks não encontrado, pulando coleta automática');
      }
    }
  } catch (error) {
    console.error('❌ Erro na detecção automática de links:', error);
  }
}

/**
 * Processar auto responder
 */
async function handleAutoResponder(socket, message, messageText, groupJid) {
  try {
    const groupData = getGroupData(groupJid);
    if (!groupData || !groupData.autoResponder) return;
    
    const autoResponders = getAutoResponders(groupJid);
    if (!autoResponders || autoResponders.length === 0) return;
    
    const lowerText = messageText.toLowerCase();
    
    for (const responder of autoResponders) {
      if (responder && responder.trigger && lowerText.includes(responder.trigger)) {
        await socket.sendMessage(groupJid, { 
          text: responder.response || "Resposta automática configurada"
        });
        break; // Apenas uma resposta por mensagem
      }
    }
    
  } catch (error) {
    errorLog(`❌ Erro no auto responder para grupo ${groupJid}: ${error.message}`);
  }
}

module.exports = { messageHandler };