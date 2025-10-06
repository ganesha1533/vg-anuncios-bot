/**
 * Carregador de comandos e handlers - VG Anúncios
 * 
 * @author VG Team
 */
const fs = require("fs");
const path = require("path");
const { messageHandler } = require("./handlers/messageHandler");
const { infoLog, successLog, errorLog } = require("./utils/logger");

/**
 * Adaptar comando legacy (usa "exec") para nova assinatura (usa "execute")
 * Mantém compatibilidade sem reescrever todos os arquivos antigos.
 */
function adaptLegacyCommand(command) {
  try {
    if (command && typeof command.execute !== 'function' && typeof command.exec === 'function') {
      const legacyExec = command.exec;
      delete command.exec; // evitar confusão futura
      command.execute = async (socket, message, args) => {
        const { getSender, isGroup, isOwner, isAdmin, isBotAdmin } = require('./utils');
        const groupJid = message.key.remoteJid;
        const sender = getSender(message);
        const group = isGroup(groupJid);

        // Determinar privilégios dinamicamente
        let userIsAdmin = false;
        if (group) {
          try { userIsAdmin = await isAdmin(socket, groupJid, sender); } catch { userIsAdmin = false; }
        }
        let botIsAdmin = false;
        if (group) {
          try { botIsAdmin = await isBotAdmin(socket, groupJid); } catch { botIsAdmin = false; }
        }

        // Objeto m (compatibilidade com comandos antigos)
        const m = {
          chat: groupJid,
          sender,
          isGroup: group,
          message,
          args,
          reply: async (text, options = {}) => {
            try {
              await socket.sendMessage(groupJid, { text, ...options }, { quoted: message });
            } catch (e) {
              errorLog(`❌ Falha ao enviar reply em ${command.name}: ${e.message}`);
            }
          }
        };

        const ctx = {
          args,
          isAdmin: userIsAdmin,
            isOwner: isOwner(sender),
          isBotAdm: botIsAdmin,
          socket
        };

        return legacyExec(socket, m, ctx);
      };
      infoLog(`🛠️ Adaptador legacy aplicado: ${command.name}`);
    }
  } catch (e) {
    errorLog(`❌ Erro ao adaptar comando legacy ${command?.name || 'desconhecido'}: ${e.message}`);
  }
  return command;
}

/**
 * Carregar todos os comandos
 */
function loadCommands() {
  const commands = new Map();
  const commandsPath = path.join(__dirname, "commands");
  
  try {
    // Carregar comandos do owner
    const ownerPath = path.join(commandsPath, "owner");
    if (fs.existsSync(ownerPath)) {
      const ownerFiles = fs.readdirSync(ownerPath).filter(file => file.endsWith('.js'));
      
      for (const file of ownerFiles) {
        try {
          const commandPath = path.join(ownerPath, file);
          delete require.cache[require.resolve(commandPath)];
          const command = require(commandPath);
          
          if (command.name) {
            const adapted = adaptLegacyCommand(command);
            commands.set(adapted.name, { ...adapted, category: 'owner' });
            infoLog(`📁 Comando owner carregado: ${adapted.name}`);
          }
        } catch (error) {
          errorLog(`❌ Erro ao carregar comando owner ${file}: ${error.message}`);
        }
      }
    }
    
    // Carregar comandos do admin
    const adminPath = path.join(commandsPath, "admin");
    if (fs.existsSync(adminPath)) {
      const adminFiles = fs.readdirSync(adminPath).filter(file => file.endsWith('.js'));
      
      for (const file of adminFiles) {
        try {
          const commandPath = path.join(adminPath, file);
          delete require.cache[require.resolve(commandPath)];
          const command = require(commandPath);
          
          if (command.name) {
            const adapted = adaptLegacyCommand(command);
            commands.set(adapted.name, { ...adapted, category: 'admin' });
            infoLog(`👑 Comando admin carregado: ${adapted.name}`);
          }
        } catch (error) {
          errorLog(`❌ Erro ao carregar comando admin ${file}: ${error.message}`);
        }
      }
    }
    
    // Carregar comandos do user
    const userPath = path.join(commandsPath, "user");
    if (fs.existsSync(userPath)) {
      const userFiles = fs.readdirSync(userPath).filter(file => file.endsWith('.js'));
      
      for (const file of userFiles) {
        try {
          const commandPath = path.join(userPath, file);
          delete require.cache[require.resolve(commandPath)];
          const command = require(commandPath);
          
          if (command.name) {
            const adapted = adaptLegacyCommand(command);
            commands.set(adapted.name, { ...adapted, category: 'user' });
            infoLog(`👤 Comando user carregado: ${adapted.name}`);
          }
        } catch (error) {
          errorLog(`❌ Erro ao carregar comando user ${file}: ${error.message}`);
        }
      }
    }
    
    successLog(`✅ Total de ${commands.size} comandos carregados!`);
    return commands;
    
  } catch (error) {
    errorLog(`❌ Erro ao carregar comandos: ${error.message}`);
    return new Map();
  }
}

/**
 * Função principal de carregamento
 */
function load(socket) {
  try {
    infoLog("🔄 Carregando comandos...");
    
    // Carregar comandos
    const commands = loadCommands();
    
    // Configurar handler de mensagens
    socket.ev.on("messages.upsert", async ({ messages, type }) => {
      if (type === "notify") {
        const message = messages[0];
        if (!message.message) return;
        
        await messageHandler(socket, message, commands);
      }
    });
    
    // Handler para atualizações de grupo
    socket.ev.on("groups.update", async (updates) => {
      // Implementar lógica de atualização de grupos se necessário
    });
    
    // Handler para participantes de grupo
    socket.ev.on("group-participants.update", async (update) => {
      try {
        const { id: groupJid, participants, action } = update;
        
        // Só processar quando alguém entra no grupo
        if (action === "add") {
          const { isWelcomeEnabled, getWelcomeMessage } = require("./utils/database");
          const { welcomeMessage } = require("./menu");
          
          // Verificar se boas-vindas estão ativas
          if (isWelcomeEnabled(groupJid)) {
            const groupInfo = await socket.groupMetadata(groupJid);
            const customMessage = getWelcomeMessage(groupJid);
            
            for (const participant of participants) {
              // Não dar boas-vindas para o próprio bot
              if (participant === socket.user.id) continue;
              
              const userName = participant.split("@")[0];
              const welcomeText = welcomeMessage(userName, groupInfo.subject, customMessage);
              
              await socket.sendMessage(groupJid, { 
                text: welcomeText,
                mentions: [participant]
              });
            }
          }
        }
      } catch (error) {
        const { errorLog } = require("./utils/logger");
        errorLog(`❌ Erro no handler de participantes: ${error.message}`);
      }
    });
    
    successLog("✅ Handlers configurados com sucesso!");
    
  } catch (error) {
    errorLog(`❌ Erro ao carregar handlers: ${error.message}`);
  }
}

module.exports = { load, loadCommands };