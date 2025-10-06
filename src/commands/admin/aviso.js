module.exports = {
    name: 'aviso',
    description: 'Enviar aviso marcando todos os membros',
    usage: '/aviso [mensagem]',
    category: 'admin',
    
    async execute(sock, message, args) {
        const { safeSendMessage, isGroup } = require('../../utils');
        
        // Verificar se é um grupo
        if (!isGroup(message.key.remoteJid)) {
            return safeSendMessage(sock, message, '❌ Este comando só funciona em grupos.');
        }
        
        // 🔓 MODO GRUPO FECHADO: Removida verificação de admin
        
        if (args.length < 1) {
            return safeSendMessage(sock, message, '❌ Forneça uma mensagem. Exemplo: /aviso Reunião hoje às 20h');
        }
        
        try {
            const groupJid = message.key.remoteJid;
            const groupMetadata = await sock.groupMetadata(groupJid);
            
            // Montar lista de participantes
            const participants = groupMetadata.participants.map(participant => participant.id);
            
            // Mensagem do aviso
            const avisoText = args.join(' ');
            
            const fullMessage = `🚨 *AVISO IMPORTANTE* 🚨\n\n${avisoText}\n\n📢 Todos foram notificados\n🏴‍☠️ VG Anúncios`;
            
            // Enviar com marcação
            await sock.sendMessage(groupJid, {
                text: fullMessage,
                mentions: participants
            });
            
        } catch (error) {
            console.error('Erro AVISO:', error);
            await safeSendMessage(sock, message, '❌ Erro ao enviar aviso.');
        }
    }
};