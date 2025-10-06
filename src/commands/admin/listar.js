module.exports = {
    name: 'listar',
    description: 'Listar todos os membros do grupo',
    usage: '/listar',
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
            
            let membersList = `👥 *LISTA DE MEMBROS*\n\n`;
            membersList += `🏰 *Grupo:* ${groupMetadata.subject}\n`;
            membersList += `📊 *Total:* ${groupMetadata.participants.length} membros\n\n`;
            
            // Separar por tipo
            const admins = [];
            const members = [];
            
            groupMetadata.participants.forEach((participant, index) => {
                const number = participant.id.split('@')[0].split(':')[0];
                const name = `+${number}`;
                
                if (participant.admin === 'admin' || participant.admin === 'superadmin') {
                    admins.push(`👑 ${name} (${participant.admin})`);
                } else {
                    members.push(`👤 ${name}`);
                }
            });
            
            // Mostrar admins primeiro
            if (admins.length > 0) {
                membersList += `🛡️ *ADMINISTRADORES (${admins.length}):*\n`;
                membersList += admins.join('\n') + '\n\n';
            }
            
            // Mostrar membros
            if (members.length > 0) {
                membersList += `👥 *MEMBROS (${members.length}):*\n`;
                
                // Limitar a 50 membros para não estourar o limite de caracteres
                const displayMembers = members.slice(0, 50);
                membersList += displayMembers.join('\n');
                
                if (members.length > 50) {
                    membersList += `\n\n... e mais ${members.length - 50} membros`;
                }
            }
            
            membersList += `\n\n🏴‍☠️ VG Anúncios`;
            
            await safeSendMessage(sock, message, membersList);
            
        } catch (error) {
            console.error('Erro LISTAR:', error);
            await safeSendMessage(sock, message, '❌ Erro ao listar membros.');
        }
    }
};