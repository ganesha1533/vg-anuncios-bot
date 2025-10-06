/**
 * Configurações do VG Anúncios
 * 
 * @author VG Team
 */
const path = require("path");

module.exports = {
  // Configurações básicas do bot
  BOT_NAME: "VG Anúncios",
  BOT_VERSION: "6.4.0",
  BOT_DESCRIPTION: "Bot Profissional de Anúncios",
  
  // Configurações de pastas
  TEMP_DIR: path.resolve(__dirname, "..", "assets", "temp"),
  AUTH_DIR: path.resolve(__dirname, "..", "assets", "auth"),
  DATABASE_DIR: path.resolve(__dirname, "..", "database"),
  ASSETS_DIR: path.resolve(__dirname, "..", "assets"),
  
    // Configurações do proprietário
  OWNER_NUMBER: "5516981758604", // SERÁ CONFIGURADO PELO SETUP
  
  // Configurações de prefixo
  DEFAULT_PREFIX: "/",
  
  // Configurações de limites
  MAX_DOWNLOAD_SIZE: 100, // MB
  
  // URLs e APIs
  GITHUB_REPO: "https://github.com/ganesha1533/vg-anuncios-bot",
  
  // Configurações de logs
  LOG_LEVEL: "info",
  
  // Configurações de permissões
  ADMIN_ONLY_COMMANDS: [
    "abrir", "fechar", "add", "ban", "promover", "rebaixar",
    "anti-link", "anti-audio", "anti-document", "anti-event",
    "anti-image", "anti-product", "anti-sticker", "anti-video",
    "auto-responder", "only-admin", "exit"
  ],
  
  OWNER_ONLY_COMMANDS: [
    "painel", "totalcmd", "nomebot", "cache", "reiniciar",
    "restart", "gpativos", "listagp", "entrar", "gerarcodigogrupo",
    "sairgp", "seradm", "grupos", "vencimento",
    "enviapv", "enviagp", "bc", "exec", "get-id", "info",
    "off", "on", "set-menu-image", "set-prefix", "bem-vindo"
  ],
  
  // Configurações de grupos
  GROUP_SETTINGS: {
    ANTI_LINK_DEFAULT: false,
    WELCOME_DEFAULT: false,
    AUTO_RESPONDER_DEFAULT: false,
    ONLY_ADMIN_DEFAULT: false
  }
};