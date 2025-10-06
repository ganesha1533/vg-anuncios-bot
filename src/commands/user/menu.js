/**
 * Comando Menu - VG Anúncios
 * Exibe o menu principal do bot
 */
const { generateMenu } = require('../../menu');
const { isGroup } = require('../../utils');

module.exports = {
  name: 'menu',
  aliases: ['help', 'ajuda', 'comandos'],
  category: 'user',
  description: 'Exibe o menu principal do bot',
  usage: '/menu',
  
  async execute(socket, message, args) {
    try {
      const groupJid = message.key.remoteJid;
      const isGroupMsg = isGroup(groupJid);
      
      const menuText = generateMenu(isGroupMsg ? groupJid : null);
      
      await socket.sendMessage(groupJid, {
        text: menuText
      });
      
    } catch (error) {
      console.error('Erro comando menu:', error);
      await socket.sendMessage(message.key.remoteJid, {
        text: '❌ *Erro ao exibir menu.*\n\n🏴‍☠️ *VG Anúncios*'
      });
    }
  }
};