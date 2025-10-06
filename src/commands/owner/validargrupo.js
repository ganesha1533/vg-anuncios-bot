// Comando: validargrupo (owner)
module.exports = {
  name: 'validargrupo',
  description: 'Validar se grupo está ativo no sistema',
  usage: '/validargrupo [grupoid]',
  category: 'owner',
  async execute(sock, message, args) {
    try {
      const { isOwner, getSender, safeSendMessage, isGroup } = require('../../utils');
      const { getActiveGroups } = require('../../utils/database');
      
      const sender = getSender(message);
      const currentJid = message.key.remoteJid;
      
      if (!isOwner(sender)) {
        return safeSendMessage(sock, currentJid, { text: '🚫 Apenas o dono pode usar este comando!' });
      }
      
      // Determinar grupo alvo
      let targetJid = args[0] || currentJid;
      
      if (!isGroup(targetJid)) {
        return safeSendMessage(sock, currentJid, { text: '❌ Este comando só funciona em grupos ou com ID de grupo válido.' });
      }
      
      const activeGroups = getActiveGroups();
      const groupData = activeGroups[targetJid];
      
      if (groupData && groupData.active) {
        const expiryDate = new Date(groupData.expiresAt);
        const now = new Date();
        const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
        
        let statusIcon = '';
        let statusText = '';
        
        if (daysLeft > 7) {
          statusIcon = '🟢';
          statusText = 'ATIVO';
        } else if (daysLeft > 0) {
          statusIcon = '🟡';
          statusText = 'EXPIRANDO EM BREVE';
        } else {
          statusIcon = '🔴';
          statusText = 'EXPIRADO';
        }
        
        const reply = `${statusIcon} *VALIDAÇÃO DE GRUPO*\n\n🏴‍☠️ *Status:* ${statusText}\n🆔 *Grupo:* ${targetJid}\n📅 *Ativado em:* ${new Date(groupData.activatedAt).toLocaleDateString('pt-BR')}\n⏰ *Expira em:* ${expiryDate.toLocaleDateString('pt-BR')}\n🎫 *Código usado:* ${groupData.activationCode || 'N/A'}\n📱 *Ativado por:* ${groupData.activatedBy || 'Sistema'}\n📊 *Dias restantes:* ${daysLeft} dias\n\n${daysLeft <= 0 ? '⚠️ *GRUPO PRECISA SER RENOVADO!*' : '✅ *Grupo funcionando normalmente*'}\n\n🏴‍☠️ *VG Anúncios - Sistema de Validação*`;
        
        return safeSendMessage(sock, currentJid, { text: reply });
      }
      
      return safeSendMessage(sock, currentJid, { 
        text: `🔴 *GRUPO INATIVO*\n\n🆔 *Grupo:* ${targetJid}\n⚠️ Este grupo não possui código de ativação válido.\n\n💡 *Para ativar:*\n• Use /novocodigo para gerar um código\n• Use /ativar [código] no grupo\n\n🏴‍☠️ *VG Anúncios - Sistema de Validação*` 
      });
      
    } catch (error) {
      console.error('Erro no comando validargrupo:', error);
      await safeSendMessage(sock, message.key.remoteJid, { text: '❌ Erro ao executar validargrupo.' });
    }
  }
};