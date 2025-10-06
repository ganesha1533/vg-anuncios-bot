module.exports = {
    name: 'marcar',
    description: 'Marcar todos os membros do grupo',
    usage: '/marcar [mensagem]',
    category: 'admin',
    
    async execute(sock, message, args) {
        const { safeSendMessage, isGroup } = require('../../utils');
        
        // Verificar se é um grupo
        if (!isGroup(message.key.remoteJid)) {
            return safeSendMessage(sock, message, '❌ Este comando só funciona em grupos.');
        }
        
        // 🔓 MODO GRUPO FECHADO: Removida verificação de admin
        
        try {
            const groupJid = message.key.remoteJid;
            const groupMetadata = await sock.groupMetadata(groupJid);
            
            // Mensagem personalizada ou padrão
            const customMessage = args.length > 0 ? args.join(' ') : 'Atenção pessoal! 📢';
            
            let marcacaoText = `🏷️ *MARCAÇÃO GERAL*\n\n${customMessage}\n\n👥 *MEMBROS MARCADOS:*\n`;
            
            // Listar todos os membros com @ para mostrar nomes/contatos
            const participants = [];
            groupMetadata.participants.forEach((participant, index) => {
                const number = participant.id.split('@')[0];
                marcacaoText += `${index + 1}. @${number}\n`;
                participants.push(participant.id);
            });
            
            marcacaoText += `\n📊 Total: ${participants.length} membros\n🏴‍☠️ VG Anúncios`;
            
            // Enviar com marcação para mostrar nomes/contatos
            await sock.sendMessage(groupJid, {
                text: marcacaoText,
                mentions: participants
            });
            
        } catch (error) {
            console.error('Erro MARCAR:', error);
            await safeSendMessage(sock, message, '❌ Erro ao marcar membros.');
        }
    }
};