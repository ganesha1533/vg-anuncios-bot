/**
 * Sistema de banco de dados JSON - VG Anúncios
 * 
 * @author VG Team
 */
const fs = require("fs-extra");
const path = require("path");
const { DATABASE_DIR, DEFAULT_PREFIX, GROUP_SETTINGS } = require("../config");

/**
 * Garantir que o arquivo existe com conteúdo padrão
 */
function ensureFile(filePath, defaultContent = {}) {
  if (!fs.existsSync(filePath)) {
    fs.writeJsonSync(filePath, defaultContent, { spaces: 2 });
  }
  return fs.readJsonSync(filePath);
}

/**
 * Salvar dados no arquivo JSON
 */
function saveData(filePath, data) {
  fs.writeJsonSync(filePath, data, { spaces: 2 });
}

// Caminhos dos arquivos de dados
const paths = {
  groups: path.join(DATABASE_DIR, "groups.json"),
  users: path.join(DATABASE_DIR, "users.json"),
  autoResponder: path.join(DATABASE_DIR, "autoResponder.json"),
  settings: path.join(DATABASE_DIR, "settings.json"),
  activeGroups: path.join(DATABASE_DIR, "activeGroups.json"),
  premiumUsers: path.join(DATABASE_DIR, "premiumUsers.json"),
  warns: path.join(DATABASE_DIR, "warns.json"),
  adminCache: path.join(DATABASE_DIR, "adminCache.json")
};

// ==================== GRUPOS ====================

/**
 * Obter configurações de um grupo
 */
function getGroupData(groupJid) {
  const groups = ensureFile(paths.groups, {});
  
  if (!groups[groupJid]) {
    groups[groupJid] = {
      jid: groupJid,
      prefix: DEFAULT_PREFIX,
      antiLink: GROUP_SETTINGS.ANTI_LINK_DEFAULT,
      antiAudio: false,
      antiDocument: false,
      antiEvent: false,
      antiImage: false,
      antiProduct: false,
      antiSticker: false,
      antiVideo: false,
      welcome: GROUP_SETTINGS.WELCOME_DEFAULT,
      autoResponder: GROUP_SETTINGS.AUTO_RESPONDER_DEFAULT,
      onlyAdmin: GROUP_SETTINGS.ONLY_ADMIN_DEFAULT,
      exit: false,
      active: true,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    };
    saveData(paths.groups, groups);
  }
  
  return groups[groupJid];
}

/**
 * Atualizar configurações de um grupo
 */
function updateGroupData(groupJid, updates) {
  const groups = ensureFile(paths.groups, {});
  
  if (!groups[groupJid]) {
    groups[groupJid] = getGroupData(groupJid);
  }
  
  groups[groupJid] = { ...groups[groupJid], ...updates };
  groups[groupJid].lastActivity = new Date().toISOString();
  
  saveData(paths.groups, groups);
  return groups[groupJid];
}

/**
 * Obter prefixo de um grupo
 */
function getPrefix(groupJid) {
  if (!groupJid) return DEFAULT_PREFIX;
  const groupData = getGroupData(groupJid);
  return groupData.prefix || DEFAULT_PREFIX;
}

/**
 * Definir prefixo de um grupo
 */
function setPrefix(groupJid, prefix) {
  return updateGroupData(groupJid, { prefix });
}

/**
 * Listar todos os grupos ativos
 */
function getActiveGroups() {
  const groups = ensureFile(paths.groups, {});
  return Object.values(groups).filter(group => group.active);
}

// ==================== USUÁRIOS ====================

/**
 * Obter dados de um usuário
 */
function getUserData(userJid) {
  const users = ensureFile(paths.users, {});
  
  if (!users[userJid]) {
    users[userJid] = {
      jid: userJid,
      name: "",
      isOwner: false,
      isPremium: false,
      commandCount: 0,
      createdAt: new Date().toISOString(),
      lastSeen: new Date().toISOString()
    };
    saveData(paths.users, users);
  }
  
  return users[userJid];
}

/**
 * Atualizar dados de um usuário
 */
function updateUserData(userJid, updates) {
  const users = ensureFile(paths.users, {});
  
  if (!users[userJid]) {
    users[userJid] = getUserData(userJid);
  }
  
  users[userJid] = { ...users[userJid], ...updates };
  users[userJid].lastSeen = new Date().toISOString();
  
  saveData(paths.users, users);
  return users[userJid];
}

/**
 * Incrementar contador de comandos do usuário
 */
function incrementUserCommands(userJid) {
  const userData = getUserData(userJid);
  return updateUserData(userJid, { commandCount: userData.commandCount + 1 });
}

// ==================== AUTO RESPONDER ====================

/**
 * Obter auto respostas de um grupo
 */
function getAutoResponders(groupJid) {
  const autoResponders = ensureFile(paths.autoResponder, {});
  return autoResponders[groupJid] || [];
}

/**
 * Adicionar auto resposta
 */
function addAutoResponder(groupJid, trigger, response) {
  const autoResponders = ensureFile(paths.autoResponder, {});
  
  if (!autoResponders[groupJid]) {
    autoResponders[groupJid] = [];
  }
  
  autoResponders[groupJid].push({
    trigger: trigger.toLowerCase(),
    response,
    createdAt: new Date().toISOString()
  });
  
  saveData(paths.autoResponder, autoResponders);
  return true;
}

/**
 * Remover auto resposta
 */
function removeAutoResponder(groupJid, trigger) {
  const autoResponders = ensureFile(paths.autoResponder, {});
  
  if (!autoResponders[groupJid]) {
    return false;
  }
  
  const index = autoResponders[groupJid].findIndex(
    item => item.trigger.toLowerCase() === trigger.toLowerCase()
  );
  
  if (index !== -1) {
    autoResponders[groupJid].splice(index, 1);
    saveData(paths.autoResponder, autoResponders);
    return true;
  }
  
  return false;
}

// ==================== CONFIGURAÇÕES GLOBAIS ====================

/**
 * Obter configurações globais
 */
function getSettings() {
  return ensureFile(paths.settings, {
    botName: "VG Anúncios",
    maintenance: false,
    totalCommands: 0,
    startTime: new Date().toISOString()
  });
}

/**
 * Atualizar configurações globais
 */
function updateSettings(updates) {
  const settings = getSettings();
  const newSettings = { ...settings, ...updates };
  saveData(paths.settings, newSettings);
  return newSettings;
}

/**
 * Incrementar contador total de comandos
 */
function incrementTotalCommands() {
  const settings = getSettings();
  return updateSettings({ totalCommands: settings.totalCommands + 1 });
}

// ==================== WARNS / MODERAÇÃO ====================

function getWarnData() {
  return ensureFile(paths.warns, { groups: {} });
}

function getWarnHistory(groupJid) {
  const data = getWarnData();
  if (!data.groups[groupJid]) return [];
  return data.groups[groupJid].history || [];
}

function addWarn(groupJid, userJid, reason = "") {
  const data = getWarnData();
  if (!data.groups[groupJid]) {
    data.groups[groupJid] = { history: [] };
  }
  const entry = {
    id: Date.now().toString(36)+Math.random().toString(36).slice(2,8),
    user: userJid,
    reason: reason || 'Sem motivo',
    timestamp: Date.now()
  };
  data.groups[groupJid].history.push(entry);
  saveData(paths.warns, data);
  return entry;
}

function removeWarn(groupJid, warnId) {
  const data = getWarnData();
  if (!data.groups[groupJid]) return false;
  const list = data.groups[groupJid].history || [];
  const idx = list.findIndex(w => w.id === warnId);
  if (idx === -1) return false;
  list.splice(idx,1);
  saveData(paths.warns, data);
  return true;
}

function clearWarns(groupJid, userJid = null) {
  const data = getWarnData();
  if (!data.groups[groupJid]) return 0;
  if (!userJid) {
    const count = (data.groups[groupJid].history||[]).length;
    data.groups[groupJid].history = [];
    saveData(paths.warns, data);
    return count;
  }
  const list = data.groups[groupJid].history||[];
  const remaining = list.filter(w => w.user !== userJid);
  const removed = list.length - remaining.length;
  data.groups[groupJid].history = remaining;
  saveData(paths.warns, data);
  return removed;
}

// ==================== ADMIN LIST CACHE ====================

function getAdminCache() {
  return ensureFile(paths.adminCache, { groups: {} });
}

function getAdminList(groupJid) {
  const cache = getAdminCache();
  return cache.groups[groupJid]?.admins || [];
}

function setAdminList(groupJid, adminArray = []) {
  const cache = getAdminCache();
  if (!cache.groups[groupJid]) cache.groups[groupJid] = {};
  cache.groups[groupJid].admins = adminArray;
  saveData(paths.adminCache, cache);
  return true;
}

// ==================== GRUPOS ATIVOS (PREMIUM) ====================

/**
 * Verificar se grupo está ativo/premium
 */
function isGroupActive(groupJid) {
  const activeGroups = ensureFile(paths.activeGroups, { groups: {} });
  const groupData = activeGroups.groups ? activeGroups.groups[groupJid] : activeGroups[groupJid];
  
  if (!groupData) return false;
  
  if (groupData.expiresAt && new Date() > new Date(groupData.expiresAt)) {
    return false;
  }
  
  return groupData.status === "active" || groupData.active === true;
}

/**
 * Ativar grupo
 */
function activateGroup(groupJid, expiresAt = null, codigo = null, groupName = 'Grupo sem nome') {
  const activeGroups = ensureFile(paths.activeGroups, { groups: {} });
  
  if (!activeGroups.groups) {
    activeGroups.groups = {};
  }
  
  activeGroups.groups[groupJid] = {
    jid: groupJid,
    name: groupName, // ✅ Nome do grupo
    codigo: codigo, // ✅ Código usado
    status: "active",
    activatedAt: new Date().toLocaleString('pt-BR'), // ✅ Data brasileira
    expiresAt,
    autoActivated: true
  };
  
  saveData(paths.activeGroups, activeGroups);
  return true;
}

/**
 * Desativar grupo
 */
function deactivateGroup(groupJid) {
  const activeGroups = ensureFile(paths.activeGroups, {});
  
  if (activeGroups[groupJid]) {
    activeGroups[groupJid].active = false;
    activeGroups[groupJid].deactivatedAt = new Date().toISOString();
    saveData(paths.activeGroups, activeGroups);
  }
  
  return true;
}

module.exports = {
  // Grupos
  getGroupData,
  updateGroupData,
  getPrefix,
  setPrefix,
  getActiveGroups,
  
  // Usuários
  getUserData,
  updateUserData,
  incrementUserCommands,
  
  // Auto Responder
  getAutoResponders,
  addAutoResponder,
  removeAutoResponder,
  
  // Configurações
  getSettings,
  updateSettings,
  incrementTotalCommands,
  
  // Grupos Ativos
  isGroupActive,
  activateGroup,
  deactivateGroup,
  
  // Utilitários
  ensureFile,
  saveData,
  
  // Funções de leitura e escrita JSON compatíveis
  readJSON: function(filePath) {
    return ensureFile(filePath, {});
  },
  
  writeJSON: function(filePath, data) {
    saveData(filePath, data);
  },
  
  // Welcome System
  getGroupSettings: function(groupJid) {
    const groupData = getGroupData(groupJid);
    return {
      welcomeEnabled: groupData.welcomeEnabled || false,
      welcomeMessage: groupData.welcomeMessage || null,
      ...groupData
    };
  },
  
  updateGroupSettings: function(groupJid, settings) {
    return updateGroupData(groupJid, settings);
  },
  
  isWelcomeEnabled: function(groupJid) {
    const groupData = getGroupData(groupJid);
    return groupData.welcomeEnabled === true;
  },
  
  getWelcomeMessage: function(groupJid) {
    const groupData = getGroupData(groupJid);
    return groupData.welcomeMessage || null;
  },

  // Warn / Moderação
  getWarnHistory,
  addWarn,
  removeWarn,
  clearWarns,
  getAdminList,
  setAdminList,

  // Sistema de Códigos de Licença
  generateGroupCode: function(plan = 'teste', validDays = 30, maxGroups = 1) {
    const crypto = require('crypto');
    try {
      const randomStr = crypto.randomBytes(3).toString('hex').toUpperCase();
      const timestamp = Date.now();
      const codeId = `VG-${plan.toUpperCase()}-${timestamp}-${randomStr}`;
      
      const codeData = {
        id: codeId,
        type: plan.toLowerCase(),
        days: plan.toLowerCase() === 'vitalicio' ? null : parseInt(validDays),
        createdAt: new Date().toLocaleString('pt-BR'), // ✅ Data em formato brasileiro
        createdBy: 'system',
        status: 'active',
        used: false,
        usedBy: null,
        usedAt: null,
        maxGroups: parseInt(maxGroups)
      };
      
      // Carregar códigos existentes
      const codesPath = path.join(DATABASE_DIR, "activation-codes.json");
      let codesData = { codes: [], stats: { generated: 0, used: 0 } };
      
      try {
        const existingData = require('fs').readFileSync(codesPath, 'utf8');
        codesData = JSON.parse(existingData);
        if (!codesData.codes) codesData.codes = [];
        if (!codesData.stats) codesData.stats = { generated: 0, used: 0 };
      } catch (error) {
        console.log('[LICENSE] Criando novo arquivo de códigos');
      }
      
      // Adicionar novo código
      codesData.codes.push(codeData);
      codesData.stats.generated++;
      
      // Salvar
      require('fs').writeFileSync(codesPath, JSON.stringify(codesData, null, 2));
      
      console.log(`[LICENSE] Código gerado: ${codeId} (${plan}, ${validDays} dias, ${maxGroups} grupos)`);
      return codeId;
      
    } catch (error) {
      console.error('Erro generateGroupCode:', error);
      return null;
    }
  },

  validateCode: function(code) {
    const codesPath = path.join(DATABASE_DIR, "activation-codes.json");
    const codes = ensureFile(codesPath, { codes: [], stats: { generated: 0, used: 0 } });
    
    // Procurar código no array de códigos
    const codeData = codes.codes.find(c => c.id === code);
    
    if (!codeData) return { valid: false, reason: 'Código não encontrado' };
    if (codeData.used) return { valid: false, reason: 'Código já utilizado' };
    if (codeData.status !== 'active') return { valid: false, reason: 'Código inativo' };
    
    // Para códigos vitalícios não há expiração
    if (codeData.type !== 'vitalicio' && codeData.days) {
      // Converter string de data brasileira para Date
      let createdAt;
      if (typeof codeData.createdAt === 'string' && codeData.createdAt.includes('/')) {
        // Formato brasileiro: "05/10/2025, 17:47:49"
        const [datePart, timePart] = codeData.createdAt.split(', ');
        const [day, month, year] = datePart.split('/');
        createdAt = new Date(`${year}-${month}-${day}T${timePart || '00:00:00'}`);
      } else {
        createdAt = new Date(codeData.createdAt);
      }
      
      const expiresAt = new Date(createdAt.getTime() + (codeData.days * 24 * 60 * 60 * 1000));
      if (new Date() > expiresAt) {
        return { valid: false, reason: 'Código expirado' };
      }
    }
    
    return { valid: true, data: { ...codeData, validDays: codeData.days || 9999 } };
  },

  useCode: function(code, groupJid, groupName = 'Grupo sem nome') {
    const codesPath = path.join(DATABASE_DIR, "activation-codes.json");
    const codes = ensureFile(codesPath, { codes: [], stats: { generated: 0, used: 0 } });
    
    // Procurar código no array
    const codeIndex = codes.codes.findIndex(c => c.id === code);
    if (codeIndex === -1) return false;
    
    const codeData = codes.codes[codeIndex];
    
    // Marcar como usado
    codes.codes[codeIndex].used = true;
    codes.codes[codeIndex].usedAt = new Date().toLocaleString('pt-BR'); // ✅ Data brasileira
    codes.codes[codeIndex].usedBy = groupJid;
    codes.stats.used++;
    
    saveData(codesPath, codes);
    
    // Ativar grupo com base no tipo de código
    let expiresAt;
    if (codeData.type === 'vitalicio') {
      expiresAt = new Date('2030-12-31').toISOString(); // Vitalício
    } else {
      const activationDate = new Date();
      activationDate.setDate(activationDate.getDate() + codeData.days);
      expiresAt = activationDate.toISOString();
    }
    
    activateGroup(groupJid, expiresAt, code, groupName);
    
    console.log(`[LICENSE] Código ${code} usado para ativar grupo ${groupName} (${groupJid}) até ${expiresAt}`);
    return true;
  },

  getActiveCodes: function() {
    const codesPath = path.join(DATABASE_DIR, "activation-codes.json");
    const codes = ensureFile(codesPath, { codes: [], stats: { generated: 0, used: 0 } });
    
    return codes.codes.filter(c => {
      if (c.used) return false;
      if (c.status !== 'active') return false;
      
      // Códigos vitalícios nunca expiram
      if (c.type === 'vitalicio') return true;
      
      // Verificar expiração para outros tipos
      if (c.days) {
        const createdAt = new Date(c.createdAt);
        const expiresAt = new Date(createdAt.getTime() + (c.days * 24 * 60 * 60 * 1000));
        return new Date() < expiresAt;
      }
      
      return true;
    });
  },

  getGroupCodes: function(groupJid) {
    const codesPath = path.join(DATABASE_DIR, "activation-codes.json");
    const codes = ensureFile(codesPath, { codes: [], stats: { generated: 0, used: 0 } });
    
    return codes.codes.filter(c => c.usedBy === groupJid);
  }
};