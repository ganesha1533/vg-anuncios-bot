/**
 * Sistema de conexão com WhatsApp - VG Anúncios
 * 
 * @author VG Team
 */
const path = require("node:path");
const fs = require("node:fs");
const qrcode = require('qrcode-terminal');
const {
  default: makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  isJidBroadcast,
  makeCacheableSignalKeyStore,
  isJidStatusBroadcast,
  isJidNewsletter,
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const NodeCache = require("node-cache");
const { AUTH_DIR, TEMP_DIR } = require("./config");
const { load } = require("./loader");
const { setOwner } = require("./utils");
const {
  warningLog,
  infoLog,
  errorLog,
  successLog,
} = require("./utils/logger");

// Criar diretórios se não existirem
[AUTH_DIR, TEMP_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const logger = pino(
  { timestamp: () => `,"time":"${new Date().toJSON()}"`},
  pino.destination(path.join(TEMP_DIR, "wa-logs.txt"))
);
logger.level = "error";

const msgRetryCounterCache = new NodeCache();

let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 999;
const RECONNECT_DELAY = 5000;

async function connect() {
  const baileysFolder = path.resolve(AUTH_DIR, "baileys");

  if (!fs.existsSync(baileysFolder)) {
    fs.mkdirSync(baileysFolder, { recursive: true });
  }

  const { state, saveCreds } = await useMultiFileAuthState(baileysFolder);
  const { version } = await fetchLatestBaileysVersion();

  infoLog(`🚀 Iniciando VG Anúncios...`);

  const socket = makeWASocket({
    version,
    logger,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    printQRInTerminal: false,
    browser: ["Ubuntu", "Chrome", "20.0.04"],
    defaultQueryTimeoutMs: 120000,
    retryRequestDelayMs: 5000,
    maxMsgRetryCount: 3,
    keepAliveIntervalMs: 30000,
    markOnlineOnConnect: true,
    syncFullHistory: false,
    downloadHistory: false,
    qrTimeout: 60000,
    connectTimeoutMs: 60000,
    msgRetryCounterCache,
    shouldIgnoreJid: (jid) => {
      return isJidBroadcast(jid) || 
             isJidStatusBroadcast(jid) || 
             isJidNewsletter(jid) ||
             jid.includes("@broadcast") ||
             jid.includes("status@broadcast");
    },
    shouldSyncHistoryMessage: () => false,
    generateHighQualityLinkPreview: false,
    linkPreviewImageThumbnailWidth: 0,
    emitOwnEvents: false,
    fireInitQueries: true,
    reportTimings: false,
  });

  socket.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('\n🔥 QR CODE PARA CONEXÃO:\n');
      qrcode.generate(qr, { small: true });
      console.log('\n📱 Escaneie com WhatsApp > Dispositivos conectados');
      console.log('⏰ QR Code expira em 60 segundos - seja rápido!');
      console.log('\n🏴‍☠️ VG Anúncios\n');
    }

    if (connection === "close") {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      const statusCode = lastDisconnect?.error?.output?.statusCode;

      switch (statusCode) {
        case DisconnectReason.badSession:
          warningLog("❌ Sessão inválida detectada!");
          break;
        case DisconnectReason.connectionClosed:
          warningLog("🔄 Conexão fechada, reconectando...");
          break;
        case DisconnectReason.connectionLost:
          warningLog("📡 Conexão perdida, reconectando...");
          break;
        case DisconnectReason.loggedOut:
          errorLog("❌ Sessão expirou! Gerando novo QR Code...");
          const authPath = path.resolve(AUTH_DIR, "baileys");
          if (fs.existsSync(authPath)) {
            fs.rmSync(authPath, { recursive: true, force: true });
            successLog("🧹 Dados de autenticação limpos!");
          }
          break;
        default:
          warningLog(`❓ Desconexão inesperada: ${statusCode}`);
      }

      if (shouldReconnect || statusCode === DisconnectReason.loggedOut) {
        reconnectAttempts++;
        const delay = Math.min(RECONNECT_DELAY + (reconnectAttempts * 1000), 15000);
        
        setTimeout(() => {
          connect();
        }, delay);
      }
    } else if (connection === "open") {
      successLog("✅ Bot conectado ao WhatsApp!");
      reconnectAttempts = 0;
      setOwner(socket);
    }
  });

  socket.ev.on("creds.update", saveCreds);

  const groupHandler = require("./handlers/groupHandler");
  socket.ev.on('group-participants.update', (event) => {
    groupHandler(socket, event);
  });

  await load(socket);
  return socket;
}

module.exports = { connect };