/**
 * Utilitários gerais - VG Anúncios
 * 
 * @author VG Team
 */
const { jidDecode, areJidsSameUser, jidNormalizedUser } = require("@whiskeysockets/baileys");
const { OWNER_NUMBER } = require("../config");
const { readJSON, writeJSON } = require("./database");
const path = require("path");

/**
 * Verificar se usuário é o dono do bot - VERSÃO MELHORADA
 */
function onlyDigits(n){ return String(n||"").replace(/\D/g,""); }
function brStrip(n){ n=onlyDigits(n); return n.startsWith("55")? n.slice(2): n; }
function isOwner(userJid){
  if(!userJid) return false;
  
  // Extrair número limpo do usuário
  const userNumber = brStrip(userJid.split("@")[0].split(":")[0]);
  
  // HARDCODED: Seu número sempre será dono
  const hardcodedOwner = "16981758604";
  
  // Outras fontes de owner
  const ownerCfg = brStrip(process.env.OWNER_NUMBER||"");
  const ownerJson = readJSON(path.join(__dirname,"../../database/owner.json"));
  const ownerJsonNumber = brStrip(ownerJson?.ownerNumber||"");
  
  // Lista de possíveis owners (prioridade para hardcoded)
  const ownerList = [
    hardcodedOwner,           // Seu número sempre primeiro
    ownerJsonNumber,          // Do arquivo JSON
    ownerCfg,                 // Da variável de ambiente
    "16981758604"             // Backup seu número
  ].filter(Boolean);
  
  const isOwnerResult = ownerList.includes(userNumber);
  
  console.log(`👑 OWNER CHECK MELHORADO: ${userNumber}`);
  console.log(`📋 Lista de owners: ${ownerList.join(', ')}`);
  console.log(`✅ Resultado: ${isOwnerResult ? 'É OWNER' : 'NÃO É OWNER'}`);
  
  return isOwnerResult;
}

/**
 * Verificar se usuário é admin do grupo - VERSÃO ROBUSTA SEM jidDecode
 */
async function isAdmin(socket, groupJid, userJid) {
  try {
    const groupMetadata = await socket.groupMetadata(groupJid);
    
    // Extrair número limpo do usuário
    const userNumber = userJid.split('@')[0].split(':')[0].replace(/\D/g, '');
    
    // Verificar cada participante
    for (const participant of groupMetadata.participants) {
      // Extrair número limpo do participante
      const participantNumber = participant.id.split('@')[0].split(':')[0].replace(/\D/g, '');
      
      // Comparar números limpos (mais confiável)
      if (participantNumber === userNumber) {
        // Verificar se é admin ou superadmin
        const isAdminRole = participant.admin === "admin" || participant.admin === "superadmin";
        
        console.log(`🔍 ADMIN CHECK: ${userNumber} -> ${isAdminRole ? 'É ADMIN' : 'NÃO É ADMIN'} (${participant.admin || 'member'})`);
        
        return isAdminRole;
      }
    }
    
    console.log(`🔍 ADMIN CHECK: ${userNumber} -> NÃO ENCONTRADO NO GRUPO`);
    return false;
    
  } catch (error) {
    console.error(`❌ Erro isAdmin: ${error.message}`);
    return false;
  }
}

/**
 * Verificar se o bot é admin do grupo - MELHORADO PARA DETECÇÃO ROBUSTA
 */
async function isBotAdmin(sock, groupJid) {
  try {
    const meta = await sock.groupMetadata(groupJid);
    if (!sock.user?.id) return false;
    
    // Obter número do bot (vários formatos possíveis)
    const botNumber = sock.user.id.split('@')[0].split(':')[0];
    
    // Procurar bot entre participantes com vários formatos
    for (const participant of meta.participants) {
      const pNumber = participant.id.split('@')[0].split(':')[0];
      
      // Verificar se é o bot (múltiplas checagens)
      const isBot = (
        participant.id === sock.user.id ||                    // JID exato
        pNumber === botNumber ||                              // Número exato
        participant.id.includes(botNumber) ||                 // Contém número
        participant.id === `${botNumber}@s.whatsapp.net` ||   // Formato padrão
        participant.id === `${botNumber}@lid` ||              // Formato lid
        areJidsSameUser(jidNormalizedUser(participant.id), jidNormalizedUser(sock.user.id))
      );
      
      if (isBot) {
        return participant.admin === "admin" || participant.admin === "superadmin";
      }
    }
    
    return false; // Bot não encontrado no grupo
  } catch (error) {
    console.error('Erro isBotAdmin:', error);
    return false;
  }
}

/**
 * Obter nome do usuário
 */
function getUserName(message) {
  return message.pushName || 
         message.verifiedBizName || 
         message.notify || 
         "Usuário";
}

/**
 * Obter JID do remetente - VERSÃO ROBUSTA
 */
function getSender(message) {
  if (message.key.fromMe) {
    return message.key.remoteJid;
  }
  
  // Priorizar participantPn (número real) sobre participant (LID)
  if (message.key.participantPn) {
    console.log(`📱 SENDER: Usando participantPn -> ${message.key.participantPn}`);
    return message.key.participantPn;
  }
  
  if (message.key.participant) {
    console.log(`📱 SENDER: Usando participant -> ${message.key.participant}`);
    return message.key.participant;
  }
  
  console.log(`📱 SENDER: Usando remoteJid -> ${message.key.remoteJid}`);
  return message.key.remoteJid;
}

/**
 * Verificar se é um grupo
 */
function isGroup(jid) {
  return jid && jid.endsWith("@g.us");
}

/**
 * Extrair texto da mensagem
 */
function getMessageText(message) {
  const messageTypes = [
    "conversation",
    "extendedTextMessage",
    "imageMessage",
    "videoMessage",
    "audioMessage",
    "documentMessage",
    "stickerMessage"
  ];

  for (const type of messageTypes) {
    if (message.message[type]) {
      if (type === "conversation") {
        return message.message[type];
      } else if (type === "extendedTextMessage") {
        return message.message[type].text;
      } else if (message.message[type].caption) {
        return message.message[type].caption;
      }
    }
  }

  return "";
}

/**
 * Delay/Sleep
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Formatar número de telefone
 */
function formatPhone(number) {
  // Remove todos os caracteres não numéricos
  let cleaned = number.replace(/\D/g, "");
  
  // Se começar com 0, remove
  if (cleaned.startsWith("0")) {
    cleaned = cleaned.substring(1);
  }
  
  // Se não começar com código do país, adiciona 55 (Brasil)
  if (!cleaned.startsWith("55")) {
    cleaned = "55" + cleaned;
  }
  
  return cleaned + "@s.whatsapp.net";
}

/**
 * Formatar bytes para formato legível
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Calcular tempo de execução
 */
function formatUptime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours % 24 > 0) parts.push(`${hours % 24}h`);
  if (minutes % 60 > 0) parts.push(`${minutes % 60}m`);
  if (seconds % 60 > 0) parts.push(`${seconds % 60}s`);

  return parts.join(" ") || "0s";
}

/**
 * Obter informações do sistema
 */
function getSystemInfo() {
  const os = require("os");
  const process = require("process");
  
  return {
    platform: os.platform(),
    arch: os.arch(),
    nodeVersion: process.version,
    memory: {
      total: formatBytes(os.totalmem()),
      free: formatBytes(os.freemem()),
      used: formatBytes(os.totalmem() - os.freemem())
    },
    uptime: formatUptime(process.uptime() * 1000),
    cpu: os.cpus()[0]?.model || "Unknown"
  };
}

/**
 * Escapar caracteres especiais para Markdown
 */
function escapeMarkdown(text) {
  return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, "\\$&");
}

/**
 * Gerar ID único
 */
function generateId() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Verificar se string é um número válido
 */
function isValidNumber(str) {
  return !isNaN(str) && !isNaN(parseFloat(str));
}

/**
 * Limitar texto a um número de caracteres
 */
function truncateText(text, maxLength = 100) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

/**
 * Criar "read more" para mensagens longas
 */
function readMore() {
  return "⠀".repeat(4001);
}

/**
 * Validar URL
 */
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Extrair mentions de uma mensagem
 */
function getMentions(message) {
  const mentions = [];
  
  if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
    // Extrair JIDs das menções e normalizar
    const rawMentions = message.message.extendedTextMessage.contextInfo.mentionedJid;
    
    for (const mention of rawMentions) {
      // Limpar e normalizar o JID
      let cleanJid = mention;
      
      // Se não tem @, adicionar
      if (!cleanJid.includes("@")) {
        cleanJid = cleanJid + "@s.whatsapp.net";
      }
      
      // Verificar se é um JID válido do WhatsApp
      if (cleanJid.includes("@s.whatsapp.net") || cleanJid.includes("@g.us")) {
        mentions.push(cleanJid);
      }
    }
  }
  
  return mentions;
}

/**
 * Verificar se mensagem é uma resposta
 */
function isQuoted(message) {
  return message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
}

/**
 * Definir o dono do bot (primeira conexão)
 */
function setOwner(socket) {
  try {
    const ownerData = readJSON(path.join(__dirname, "../../database/owner.json"));
    
    if (!ownerData.ownerNumber && socket.user) {
      const ownerNumber = socket.user.id.split("@")[0];
      
      const newOwnerData = {
        ownerNumber: ownerNumber,
        setAt: new Date().toISOString(),
        deviceInfo: {
          pushName: socket.user.name || "VG Anúncios Owner",
          platform: "whatsapp"
        }
      };
      
      writeJSON(path.join(__dirname, "../../database/owner.json"), newOwnerData);
      
      console.log(`🏴‍☠️ DONO DEFINIDO: ${ownerNumber}`);
      console.log(`📱 Nome: ${socket.user.name || "VG Anúncios Owner"}`);
      console.log(`⏰ Data: ${newOwnerData.setAt}`);
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Erro ao definir dono:", error);
    return false;
  }
}

/**
 * Obter mensagem citada
 */
function getQuoted(message) {
  if (isQuoted(message)) {
    return message.message.extendedTextMessage.contextInfo.quotedMessage;
  }
  return null;
}

/**
 * Envio seguro de mensagens - CORREÇÃO JIDDECODE
 */
async function safeSendMessage(sock, targetJid, content) {
  try {
    // Se targetJid for um objeto message, extrair o JID
    if (typeof targetJid === 'object' && targetJid.key && targetJid.key.remoteJid) {
      targetJid = targetJid.key.remoteJid;
    }
    
    // Verificar se JID é válido
    if (!targetJid || typeof targetJid !== 'string') {
      console.error('JID inválido:', targetJid);
      return false;
    }
    
    // Normalizar JID se necessário
    if (!targetJid.includes('@')) {
      if (targetJid.includes('-')) {
        targetJid += '@g.us'; // Grupo
      } else {
        targetJid += '@s.whatsapp.net'; // PV
      }
    }
    
    // Enviar mensagem com tratamento de erro
    const messageOptions = typeof content === 'string' ? { text: content } : content;
    
    await sock.sendMessage(targetJid, messageOptions);
    return true;
    
  } catch (error) {
    console.error('Erro safeSendMessage:', error);
    
    // Fallback: tentar enviar mensagem de erro simples
    try {
      await sock.sendMessage(targetJid, { text: '❌ Erro interno do bot.' });
    } catch (fallbackError) {
      console.error('Erro no fallback:', fallbackError);
    }
    
    return false;
  }
}

module.exports = {
  isOwner,
  isAdmin,
  isBotAdmin,
  getUserName,
  getSender,
  isGroup,
  getMessageText,
  sleep,
  formatPhone,
  formatBytes,
  formatUptime,
  getSystemInfo,
  escapeMarkdown,
  generateId,
  isValidNumber,
  truncateText,
  readMore,
  isValidUrl,
  getMentions,
  isQuoted,
  getQuoted,
  setOwner,
  safeSendMessage,
  readJSON,
  writeJSON
};