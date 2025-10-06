/**
 * Sistema de Menu Completo - VG Anúncios
 * Com TODOS os comandos implementados
 */
const { BOT_NAME, BOT_VERSION } = require("./config");
const { getPrefix, getSettings } = require("./utils/database");

/**
 * Menu principal completo com todos os comandos IMPLEMENTADOS
 */
function generateMenu(groupJid) {
  const date = new Date();
  const prefix = getPrefix(groupJid);
  const settings = getSettings();
  
  return `╭──⪩ 🏴‍☠️ VG ANÚNcios ⪨──
│
│ 🏴‍☠️ ${settings.botName || BOT_NAME}
│ 📅 Data: ${date.toLocaleDateString("pt-br")}
│ ⏰ Hora: ${date.toLocaleTimeString("pt-br")}
│ 🔧 Prefixo: ${prefix}
│ 📱 Versão: ${BOT_VERSION}
│
╰───「⚡」───

╭──⪩ 👑 COMANDOS DO DONO ⪨──
│
│ ┏──── PAINEL ────┓
│ • ${prefix}painel
│ • ${prefix}totalcmd
│ • ${prefix}info
│ • ${prefix}get-id
│ ┗────────────────┛
│
│ ┏─── CONTROLE ───┓
│ • ${prefix}nomebot
│ • ${prefix}cache
│ • ${prefix}reiniciar
│ • ${prefix}restart
│ • ${prefix}on
│ • ${prefix}off
│ ┗────────────────┛
│
│ ┏─── GRUPOS ────┓
│ • ${prefix}gpativos
│ • ${prefix}listagp
│ • ${prefix}grupos
│ • ${prefix}entrar
│ • ${prefix}sairgp
│ • ${prefix}seradm
│ • ${prefix}gerarcodigogrupo
│ ┗────────────────┛
│
│ ┏── TRANSMISSÃO ──┓
│ • ${prefix}transmitir
│ • ${prefix}enviapv
│ • ${prefix}enviagp
│ • ${prefix}bc
│ ┗─────────────────┛
│
│ ┏── CONFIGURAÇÃO ──┓
│ • ${prefix}set-prefix
│ • ${prefix}set-menu-image
│ • ${prefix}bem-vindo
│ ┗─────────────────┛
│
│ ┏── VENCIMENTO ──┓
│ • ${prefix}vencimento
│ ┗────────────────┛
│
│ ┏── SISTEMA ──┓
│ • ${prefix}exec
│ ┗────────────────┛
│
╰───「👑」───

╭──⪩ ⚔️ COMANDOS DE ADMIN ⪨──
│
│ ┏─── MODERAÇÃO ───┓
│ • ${prefix}abrir
│ • ${prefix}fechar
│ • ${prefix}add
│ • ${prefix}ban
│ • ${prefix}banir
│ • ${prefix}promover
│ • ${prefix}rebaixar
│ ┗─────────────────┛
│
│ ┏── ANTI-SISTEMAS ──┓
│ • ${prefix}anti-link
│ • ${prefix}antilink
│ • ${prefix}antifake
│ • ${prefix}antiflood
│ ┗─────────────────┛
│
│ ┏─── SILENCIAR ───┓
│ • ${prefix}mutar
│ • ${prefix}desmutar
│ • ${prefix}warn
│ • ${prefix}unwarn
│ ┗─────────────────┛
│
│ ┏─── MARCAÇÃO ───┓
│ • ${prefix}marcar
│ • ${prefix}hidetag
│ • ${prefix}aviso
│ ┗─────────────────┛
│
│ ┏─── GRUPOS ────┓
│ • ${prefix}link
│ • ${prefix}resetlink
│ • ${prefix}definirregras
│ ┗─────────────────┛
│
│ ┏── AUTO-RESPOSTA ──┓
│ • ${prefix}add-auto-responder
│ • ${prefix}list-auto-responder
│ • ${prefix}auto-resposta
│ ┗──────────────────┛
│
╰───「⚔️」───

╭──⪩ 👥 COMANDOS GERAIS ⪨──
│
│ ┏─── BÁSICOS ────┓
│ • ${prefix}menu
│ • ${prefix}infogrupo
│ • ${prefix}admins
│ • ${prefix}regras
│ • ${prefix}perfil
│ • ${prefix}status
│ ┗─────────────────┛
│
│ ┏─── MÍDIA ────┓
│ • ${prefix}sticker
│ • ${prefix}toimg
│ • ${prefix}gtts
│ • ${prefix}play
│ ┗────────────────┛
│
╰───「👥」───

🏴‍☠️ *VG Anúncios*
⚡ *Sistema Profissional 100% Funcional*
👑 *Dono: 5516981758604*`;
}

/**
 * Mensagem de comando não encontrado
 */
function commandNotFound(prefix) {
  return `❌ *Comando não encontrado!*

Digite *${prefix}menu* para ver todos os comandos disponíveis.

*VG Anúncios*`;
}

/**
 * Mensagem de permissão negada
 */
function permissionDenied(type = "admin") {
  const message = type === "owner" 
    ? "🚫 *Apenas o dono do bot pode usar este comando!*"
    : "🛡️ *Apenas admins podem usar este comando!*";
  
  return `${message}

*VG Anúncios*`;
}

/**
 * Mensagem de grupo inativo
 */
function groupInactive() {
  return `🔒 *GRUPO NÃO AUTORIZADO!*

❌ *Este grupo não possui código de ativação válido.*

🔑 *Para usar o bot:*
• Contate o administrador para gerar um código
• Use /validargrupo [codigo] para ativar

📞 *Suporte:* Entre em contato com o dono

🏴‍☠️ *VG Anúncios*`;
}

/**
 * Mensagem de manutenção
 */
function maintenanceMode() {
  return `🔧 *Bot em manutenção!*

Tente novamente em alguns minutos.

*VG Anúncios*`;
}

/**
 * Mensagem de boas-vindas
 */
function welcomeMessage(username, groupName, customMessage = null) {
  const userMention = `@${username}`;
  
  if (customMessage) {
    return customMessage
      .replace(/{usuario}/g, userMention)
      .replace(/{grupo}/g, groupName);
  }
  
  return `🎉 *Seja bem-vindo(a) ${userMention}*

📱 *Grupo:* ${groupName}

📋 *Leia as regras e seja respeitoso(a).*
🟠 *Use /menu para ver comandos disponíveis*

🏴‍☠️ *VG Anúncios*`;
}

/**
 * Mensagem quando bot não é admin
 */
function botNotAdmin() {
  return `❌ *Bot não é admin!*

O bot precisa ser administrador do grupo para executar este comando.

💡 *Para tornar o bot admin:*
• Configurações do grupo → Administradores
• Adicionar bot como administrador

🏴‍☠️ *VG Anúncios - Bot Profissional*`;
}

module.exports = {
  generateMenu,
  commandNotFound,
  permissionDenied,
  botNotAdmin,
  groupInactive,
  maintenanceMode,
  welcomeMessage
};