module.exports = {
    name: 'ban',
    description: 'Banir usuário permanentemente',
    usage: '/ban @usuario ou /ban 5516999999999',
    category: 'admin',
    
    async execute(sock, message, args) {
        const { safeSendMessage, isGroup, getMentions } = require('../../utils');
        
        // Verificar se é um grupo
        if (!isGroup(message.key.remoteJid)) {
            return safeSendMessage(sock, message, '❌ Este comando só funciona em grupos.');
        }
        
        // 🔓 MODO GRUPO FECHADO: Removida verificação de admin
        
        try {
            const groupJid = message.key.remoteJid;
            let targetJid = null;
            
            // Verificar se há menções na mensagem
            const mentions = getMentions(message);
            
            if (mentions && mentions.length > 0) {
                // Usuário foi mencionado
                targetJid = mentions[0];
            } else if (args.length > 0) {
                // Número fornecido como argumento
                const number = args[0].replace(/\D/g, '');
                if (number.length >= 10) {
                    targetJid = number + '@s.whatsapp.net';
                }
            } else if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
                // Mensagem citada - pegar o autor da mensagem citada
                targetJid = message.message.extendedTextMessage.contextInfo.participant;
            }
            
            if (!targetJid) {
                return safeSendMessage(sock, message, '❌ Formas de usar:\n• /ban @usuario\n• /ban 5516999999999\n• Responda uma mensagem com /ban');
            }
            
            // Extrair número limpo
            const numero = targetJid.split('@')[0];
            
            // Banir usuário
            await sock.groupParticipantsUpdate(groupJid, [targetJid], 'remove');
            
            // Confirmação
            await sock.sendMessage(groupJid, { 
                text: `🔨 *USUÁRIO BANIDO*\n\n👤 Usuário: +${numero}\n⏰ Data: ${new Date().toLocaleString('pt-BR')}\n\n🚫 *Removido permanentemente do grupo*\n\n🏴‍☠️ VG Anúncios`,
                mentions: [targetJid]
            });
            
        } catch (error) {
            console.error('Erro BAN:', error);
            await safeSendMessage(sock, message, '❌ Erro ao banir usuário. Bot não é admin ou usuário não encontrado.');
        }
    }
};