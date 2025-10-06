module.exports = {
  name: 'novocodigo',
  description: 'Gerar códigos de ativação para grupos',
  usage: '/novocodigo [dias] [quantidade]',
  category: 'owner',
  async execute(sock, message, args) {
    const { isOwner, getSender, safeSendMessage } = require('../../utils');
    const { generateGroupCode } = require('../../utils/database');
    const sender = getSender(message);
    
    if (!isOwner(sender)) {
      return safeSendMessage(sock, message.key.remoteJid, { text: '🚫 Apenas o dono do bot pode usar este comando!' });
    }
    
    if (args.length === 0) {
      return safeSendMessage(sock, message.key.remoteJid, { 
        text: `🎫 *GERADOR DE CÓDIGOS*\n\n*Uso:* /novocodigo [dias] [quantidade?]\n\n*Exemplos:*\n• /novocodigo 30 - Gera 1 código para 30 dias\n• /novocodigo 60 5 - Gera 5 códigos para 60 dias\n\n*Planos disponíveis:*\n• 7 dias - Teste\n• 30 dias - Mensal\n• 60 dias - Bimestral\n• 90 dias - Trimestral\n• 365 dias - Anual` 
      });
    }
    
    const days = parseInt(args[0]);
    const quantity = parseInt(args[1]) || 1;
    
    if (isNaN(days) || days <= 0) {
      return safeSendMessage(sock, message.key.remoteJid, { text: '⚠️ Digite um número válido de dias!' });
    }
    if (quantity > 10) {
      return safeSendMessage(sock, message.key.remoteJid, { text: '⚠️ Máximo 10 códigos por vez!' });
    }
    
    try {
      let codes = [];
      
      // Determinar o tipo de plano baseado nos dias
      const planType = days <= 7 ? 'teste' : 
                     days <= 30 ? 'mensal' :
                     days <= 60 ? 'bimestral' :
                     days <= 90 ? 'trimestral' : 
                     days === 365 ? 'anual' : 'personalizado';
      
      for (let i = 0; i < quantity; i++) {
        const code = generateGroupCode(planType, days, 1);
        if (code) {
          codes.push(code);
        } else {
          throw new Error('Erro na geração do código');
        }
      }
      
      const planDisplayName = days <= 7 ? 'Teste' : 
                            days <= 30 ? 'Mensal' :
                            days <= 60 ? 'Bimestral' :
                            days <= 90 ? 'Trimestral' : 
                            days === 365 ? 'Anual' : 'Personalizado';
      
      let response = `🎫 *CÓDIGOS GERADOS COM SUCESSO*\n\n📊 *Detalhes:*\n• Quantidade: ${quantity}\n• Validade: ${days} dias\n• Tipo: ${planDisplayName}\n• Data: ${new Date().toLocaleDateString('pt-BR')}\n\n🔐 *Códigos:*`;
      
      codes.forEach((code, index) => {
        response += `\n${index + 1}. \`${code}\``;
      });
      
      response += `\n\n💡 *Para ativar:* /ativar [código]`;
      
      await safeSendMessage(sock, message.key.remoteJid, { text: response });
      
      console.log(`[CÓDIGOS] ${quantity} códigos de ${days} dias gerados`);
      
    } catch (error) {
      console.error('Erro novocodigo:', error);
      await safeSendMessage(sock, message.key.remoteJid, { text: `❌ Erro ao gerar códigos: ${error.message}` });
    }
  }
};