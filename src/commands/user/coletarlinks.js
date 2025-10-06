/**
 * Comando Coletar Links - VG Anúncios
 * Coleta links de grupos do WhatsApp automaticamente
 * 
 * @author VG Team
 */
const fs = require('fs');
const path = require('path');
const { getSender, isOwner } = require('../../utils');

// Base de dados de links coletados
const linksPath = path.join(__dirname, '../../../database/links-coletados.json');

/**
 * Salvar link coletado
 */
function salvarLink(link, messageInfo) {
  try {
    let linksData = { links: [], stats: { total: 0, hoje: 0, lastUpdate: null } };
    
    // Carregar dados existentes
    if (fs.existsSync(linksPath)) {
      const data = fs.readFileSync(linksPath, 'utf8');
      linksData = JSON.parse(data);
    }
    
    // Verificar se link já existe
    const linkExists = linksData.links.find(l => l.link === link);
    if (linkExists) {
      console.log(`[COLETOR] Link já existe: ${link}`);
      return false;
    }
    
    // Adicionar novo link
    const linkData = {
      id: Date.now().toString(36),
      link: link,
      coletadoEm: new Date().toLocaleString('pt-BR'),
      coletadoPor: messageInfo.sender || 'Sistema',
      grupo: messageInfo.groupName || 'Desconhecido',
      grupoJid: messageInfo.groupJid || null,
      status: 'ativo'
    };
    
    linksData.links.push(linkData);
    linksData.stats.total++;
    linksData.stats.lastUpdate = new Date().toLocaleString('pt-BR');
    
    // Salvar arquivo
    fs.writeFileSync(linksPath, JSON.stringify(linksData, null, 2));
    
    console.log(`[COLETOR] ✅ Novo link salvo: ${link}`);
    return true;
    
  } catch (error) {
    console.error('[COLETOR] Erro ao salvar link:', error);
    return false;
  }
}

/**
 * Coleção automática de links (chamada pelo handler)
 */
function coletarAutomatico(socket, message, link) {
  try {
    const sender = getSender(message);
    const groupJid = message.key.remoteJid;
    
    // Obter informações do grupo (se possível)
    socket.groupMetadata(groupJid).then(groupInfo => {
      const messageInfo = {
        sender: sender,
        groupName: groupInfo.subject,
        groupJid: groupJid
      };
      
      const saved = salvarLink(link, messageInfo);
      if (saved) {
        console.log(`[COLETOR] 🔗 Link coletado automaticamente: ${link}`);
      }
    }).catch(error => {
      // Se não conseguir obter info do grupo, salvar assim mesmo
      const messageInfo = {
        sender: sender,
        groupName: 'Desconhecido',
        groupJid: groupJid
      };
      
      salvarLink(link, messageInfo);
    });
    
  } catch (error) {
    console.error('[COLETOR] Erro na coleção automática:', error);
  }
}

/**
 * Comando manual de coleção
 */
module.exports = {
  name: 'coletarlinks',
  aliases: ['coletar', 'links', 'coletaLink'],
  category: 'user',
  description: 'Sistema de coleção de links de grupos',
  usage: '/coletarlinks [listar|stats|limpar]',
  
  async execute(socket, message, args) {
    try {
      const sender = getSender(message);
      const groupJid = message.key.remoteJid;
      const action = args[0]?.toLowerCase();
      
      // Carregar dados dos links
      let linksData = { links: [], stats: { total: 0, hoje: 0, lastUpdate: null } };
      if (fs.existsSync(linksPath)) {
        const data = fs.readFileSync(linksPath, 'utf8');
        linksData = JSON.parse(data);
      }
      
      switch (action) {
        case 'listar':
        case 'lista':
          if (linksData.links.length === 0) {
            await socket.sendMessage(groupJid, {
              text: '📁 *COLEÇÃO DE LINKS VG*\n\n❌ Nenhum link coletado ainda.\n\n💡 *O sistema coleta automaticamente* quando alguém envia links de grupos!\n\n🏴‍☠️ *VG Anúncios*'
            });
            return;
          }
          
          // Listar últimos 10 links
          const recentLinks = linksData.links.slice(-10).reverse();
          let linksList = '🔗 *LINKS COLETADOS (Recentes)*\n\n';
          
          recentLinks.forEach((linkData, index) => {
            linksList += `*${index + 1}.* ${linkData.link}\n`;
            linksList += `📅 ${linkData.coletadoEm}\n`;
            linksList += `👥 Por: ${linkData.coletadoPor.split('@')[0]}\n`;
            linksList += `📍 Grupo: ${linkData.grupo}\n\n`;
          });
          
          linksList += `📊 *Total: ${linksData.stats.total} links*\n`;
          linksList += `⏰ *Última atualização: ${linksData.stats.lastUpdate || 'Nunca'}*\n\n`;
          linksList += '🏴‍☠️ *VG Anúncios - Coletor Automático*';
          
          await socket.sendMessage(groupJid, { text: linksList });
          break;
          
        case 'stats':
        case 'estatisticas':
          const hoje = new Date().toLocaleDateString('pt-BR');
          const linksHoje = linksData.links.filter(l => 
            l.coletadoEm.includes(hoje)
          ).length;
          
          const statsText = `📊 *ESTATÍSTICAS - COLETOR VG*\n\n` +
            `🔗 *Total de links:* ${linksData.stats.total}\n` +
            `📅 *Hoje (${hoje}):* ${linksHoje}\n` +
            `⏰ *Última coleta:* ${linksData.stats.lastUpdate || 'Nunca'}\n\n` +
            `🤖 *Sistema:* Coleção automática ativa\n` +
            `⚙️ *Status:* Funcionando 100%\n\n` +
            '🏴‍☠️ *VG Anúncios - Coletor Profissional*';
          
          await socket.sendMessage(groupJid, { text: statsText });
          break;
          
        case 'limpar':
          // Apenas owner pode limpar
          if (!isOwner(sender)) {
            await socket.sendMessage(groupJid, {
              text: '🚫 *Apenas o dono pode limpar os links coletados!*\n\n🏴‍☠️ *VG Anúncios*'
            });
            return;
          }
          
          // Limpar todos os links
          linksData = { links: [], stats: { total: 0, hoje: 0, lastUpdate: new Date().toLocaleString('pt-BR') } };
          fs.writeFileSync(linksPath, JSON.stringify(linksData, null, 2));
          
          await socket.sendMessage(groupJid, {
            text: '🧹 *LINKS LIMPOS COM SUCESSO!*\n\n✅ Todos os links coletados foram removidos.\n\n🏴‍☠️ *VG Anúncios*'
          });
          break;
          
        default:
          const helpText = `🔗 *COLETOR DE LINKS VG*\n\n` +
            `🤖 *Sistema automático:* Coleta links automaticamente quando enviados\n\n` +
            `📝 *Comandos disponíveis:*\n` +
            `• \`/coletarlinks listar\` - Ver links coletados\n` +
            `• \`/coletarlinks stats\` - Ver estatísticas\n` +
            `• \`/coletarlinks limpar\` - Limpar links (owner)\n\n` +
            `📊 *Status atual:* ${linksData.stats.total} links coletados\n\n` +
            '🏴‍☠️ *VG Anúncios - Coleção Inteligente*';
          
          await socket.sendMessage(groupJid, { text: helpText });
      }
      
    } catch (error) {
      console.error('Erro comando coletarlinks:', error);
      await socket.sendMessage(message.key.remoteJid, {
        text: '❌ *Erro ao executar comando de coleção de links.*\n\n🏴‍☠️ *VG Anúncios*'
      });
    }
  },
  
  // Função para coleção automática (exportada)
  coletarAutomatico
};