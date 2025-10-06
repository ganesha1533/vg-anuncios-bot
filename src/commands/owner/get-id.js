module.exports = {
    name: 'get-id',
    description: 'Obter ID do grupo ou usuário',
    usage: '/get-id',
    category: 'owner',
    
    async execute(sock, message, args) {
        try {
            const chatJid = message.key.remoteJid;
            const { getSender } = require('../../utils');
            const senderJid = getSender(message);
            
            let resultado = `🆔 *IDENTIFICADORES*\n\n`;
            
            if (chatJid.includes('@g.us')) {
                // É um grupo
                const groupMetadata = await sock.groupMetadata(chatJid);
                resultado += `📱 *GRUPO:*\n`;
                resultado += `🏷️ Nome: ${groupMetadata.subject}\n`;
                resultado += `🆔 ID: ${chatJid}\n`;
                resultado += `👥 Membros: ${groupMetadata.participants.length}\n\n`;
            } else {
                // É chat privado
                resultado += `💬 *CHAT PRIVADO:*\n`;
                resultado += `🆔 ID: ${chatJid}\n\n`;
            }
            
            resultado += `👤 *REMETENTE:*\n`;
            resultado += `🆔 ID: ${senderJid}\n`;
            resultado += `📱 Número: ${senderJid.split('@')[0]}\n\n`;
            
            resultado += `🤖 *BOT:*\n`;
            resultado += `🆔 ID: ${sock.user.id}\n`;
            resultado += `📱 Número: ${sock.user.id.split(':')[0]}\n\n`;
            
            resultado += `🏴‍☠️ *VG Anúncios - Bot Profissional*`;
            
            await sock.sendMessage(message.key.remoteJid, { text: resultado });
            
        } catch (error) {
            console.error('Erro GET-ID:', error);
            await sock.sendMessage(message.key.remoteJid, { 
                text: '❌ Erro ao obter IDs.' 
            });
        }
    }
};