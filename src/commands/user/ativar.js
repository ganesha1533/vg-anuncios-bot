module.exports = {
  name: 'ativar',
  description: 'Ativar bot com código de licença',
  usage: '/ativar [código]',
  category: 'user',
  async execute(sock, message, args) {
    const { validateCode, useCode } = require('../../utils/database');
    const groupJid = message.key.remoteJid;
    
    if (!groupJid.endsWith('@g.us')) {
      return sock.sendMessage(groupJid, { text: '❌ Este comando só funciona em grupos.' });
    }
    
    if (!args || args.length === 0) {
      return sock.sendMessage(groupJid, { text: '❌ Forneça o código. Exemplo: /ativar VG-12345678' });
    }
    
    const codigo = args[0].toUpperCase();
    
    try {
      // Obter informações do grupo
      const groupMetadata = await sock.groupMetadata(groupJid);
      const groupName = groupMetadata.subject || 'Grupo sem nome';
      
      // Validar código
      const validation = validateCode(codigo);
      if (!validation.valid) {
        return sock.sendMessage(groupJid, { text: `❌ ${validation.reason}` });
      }
      
      const codeData = validation.data;
      
      // Usar código com nome do grupo
      const success = useCode(codigo, groupJid, groupName);
      if (!success) {
        return sock.sendMessage(groupJid, { text: '❌ Erro ao ativar código.' });
      }
      
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + codeData.validDays);
      
      const planType = codeData.validDays <= 7 ? 'Teste' : 
                     codeData.validDays <= 30 ? 'Mensal' :
                     codeData.validDays <= 60 ? 'Bimestral' :
                     codeData.validDays <= 90 ? 'Trimestral' : 'Anual';
      
      await sock.sendMessage(groupJid, { 
        text: `✅ *BOT ATIVADO COM SUCESSO!*\n\n🔑 Código: ${codigo}\n📅 Ativado: ${new Date().toLocaleDateString('pt-BR')}\n⏰ Válido até: ${expiresAt.toLocaleDateString('pt-BR')}\n🎯 Plano: ${planType} (${codeData.validDays} dias)\n\n🎯 O bot está pronto para uso!\n📋 Digite /menu para ver os comandos\n\n🎯 *VG Anúncios - Bot Profissional*` 
      });
      
      console.log(`[ATIVAÇÃO] Grupo ${groupJid} ativado com código ${codigo} por ${codeData.validDays} dias`);
      
    } catch (error) {
      console.error('Erro ativar:', error);
      await sock.sendMessage(groupJid, { text: `❌ Erro ao ativar bot: ${error.message}` });
    }
  }
};