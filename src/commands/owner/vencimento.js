module.exports = {
    name: 'vencimento',
    description: 'Verificar vencimento do bot',
    usage: '/vencimento [grupoid]',
    category: 'owner',
    
    async execute(sock, message, args) {
        const { safeSendMessage, isGroup, isOwner, getSender } = require('../../utils');
        const { getActiveGroups } = require('../../utils/database');
        
        try {
            const sender = getSender(message);
            const currentJid = message.key.remoteJid;
            
            if (!isOwner(sender)) {
                await safeSendMessage(sock, currentJid, { text: '🚫 Apenas o dono pode usar este comando!' });
                return;
            }
            
            let targetJid = args[0] || currentJid;
            
            if (isGroup(targetJid)) {
                const activeGroups = getActiveGroups();
                const groupData = activeGroups[targetJid];
                
                if (!groupData) {
                    await safeSendMessage(sock, currentJid, { text: '❌ Grupo não está ativo no sistema.' });
                    return;
                }
                
                const expiryDate = new Date(groupData.expiresAt);
                const now = new Date();
                const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
                
                let status = '';
                if (daysLeft > 7) {
                    status = '✅ Ativo';
                } else if (daysLeft > 0) {
                    status = '⚠️ Expirando em breve';
                } else {
                    status = '❌ Expirado';
                }
                
                const result = `⏰ *VENCIMENTO DO GRUPO*\n\n📊 *STATUS:* ${status}\n🗺️ *Expira em:* ${expiryDate.toLocaleDateString('pt-BR')}\n📅 *Dias restantes:* ${daysLeft} dias\n🎫 *Código usado:* ${groupData.activationCode || 'N/A'}\n📱 *Ativado por:* ${groupData.activatedBy || 'N/A'}\n⏰ *Data de ativação:* ${new Date(groupData.activatedAt).toLocaleDateString('pt-BR')}\n\n🏴‍☠️ *VG Anúncios - Bot Profissional*`;

                await safeSendMessage(sock, currentJid, { text: result });
            } else {
                const result = `⏰ *SISTEMA DE VENCIMENTO*\n\n*Este comando mostra informações sobre vencimento de grupos.*\n\n*Uso:*\n• /vencimento - No grupo (mostra vencimento do grupo atual)\n• /vencimento [id] - Verificar vencimento de grupo específico\n\n*Status possíveis:*\n✅ Ativo - Mais de 7 dias restantes\n⚠️ Expirando em breve - Entre 1-7 dias\n❌ Expirado - Vencido\n\n🏴‍☠️ *VG Anúncios - Bot Profissional*`;

                await safeSendMessage(sock, currentJid, { text: result });
            }
        } catch (error) {
            console.error('Erro VENCIMENTO:', error);
            await safeSendMessage(sock, message.key.remoteJid, { text: '❌ Erro ao verificar vencimento.' });
        }
    }
};