module.exports = {
    name: 'add',
    description: 'Adicionar membro ao grupo',
    usage: '/add 5511999999999',
    category: 'admin',
    
    async execute(sock, message, args) {
        const { safeSendMessage, isGroup } = require('../../utils');
        
        // Verificar se é um grupo
        if (!isGroup(message.key.remoteJid)) {
            return await safeSendMessage(sock, message.key.remoteJid, '❌ Este comando só funciona em grupos.');
        }
        
        if (args.length < 1) {
            return await safeSendMessage(sock, message.key.remoteJid, '❌ Forneça um número. Exemplo: /add 5511999999999');
        }
        
        const number = args[0].replace(/\D/g, '');
        
        if (number.length < 10) {
            return await safeSendMessage(sock, message.key.remoteJid, '❌ Número inválido.');
        }
        
        try {
            const groupJid = message.key.remoteJid;
            const userJid = number + '@s.whatsapp.net';
            const { isOwner } = require('../../utils');
            const sender = message.key.participant || message.key.remoteJid;
            
            console.log(`🔍 ADD DEBUG: Sender=${sender}, isOwner=${isOwner(sender)}`);
            
            // Se for owner, bypass verificação de admin
            if (!isOwner(sender)) {
                // Verificar se bot é admin
                const groupMetadata = await sock.groupMetadata(groupJid);
                const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
                const isAdmin = groupMetadata.participants.find(p => p.id === botNumber)?.admin;
                
                if (!isAdmin) {
                    return await safeSendMessage(sock, groupJid, '❌ Bot precisa ser admin para adicionar membros.');
                }
            }
            
            // Tentar adicionar
            const result = await sock.groupParticipantsUpdate(groupJid, [userJid], 'add');
            
            console.log('Resultado ADD:', result);
            
            if (result && result.length > 0) {
                const status = result[0].status;
                
                if (status === 200) {
                    await safeSendMessage(sock, groupJid, `✅ Usuário +${number} adicionado com sucesso!`);
                } else if (status === 403) {
                    await safeSendMessage(sock, groupJid, `❌ Não foi possível adicionar +${number}. Usuário pode ter privacy ou já estar no grupo.`);
                } else if (status === 409) {
                    await safeSendMessage(sock, groupJid, `⚠️ Usuário +${number} já está no grupo.`);
                } else {
                    await safeSendMessage(sock, groupJid, `❌ Erro ao adicionar +${number}. Status: ${status}`);
                }
            } else {
                await safeSendMessage(sock, groupJid, `❌ Falha ao processar adição de +${number}.`);
            }
            
        } catch (error) {
            console.error('Erro ADD:', error);
            
            if (error.message && error.message.includes('forbidden')) {
                await safeSendMessage(sock, groupJid, '❌ Bot não tem permissão para adicionar membros.');
            } else if (error.message && error.message.includes('privacy')) {
                await safeSendMessage(sock, groupJid, `❌ Usuário +${number} bloqueou adições por desconhecidos.`);
            } else {
                await safeSendMessage(sock, groupJid, `❌ Erro ao adicionar usuário: ${error.message || 'Erro desconhecido'}`);
            }
        }
    }
};