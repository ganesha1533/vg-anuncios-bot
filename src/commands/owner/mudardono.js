module.exports = {
    name: 'mudardono',
    description: 'Alterar o dono do bot',
    usage: '/mudardono 5516981758604',
    category: 'owner',
    
    async execute(sock, message, args) {
        const { safeSendMessage, isOwner, getSender, writeJSON, readJSON } = require('../../utils');
        const path = require('path');
        
        // Verificar se é owner
        const sender = getSender(message);
        if (!isOwner(sender)) {
            return safeSendMessage(sock, message, '❌ Apenas o dono atual pode usar este comando.');
        }
        
        if (args.length < 1) {
            return safeSendMessage(sock, message, '❌ Forneça o número do novo dono. Exemplo: /mudardono 5516981758604');
        }
        
        try {
            const newOwnerNumber = args[0].replace(/\D/g, '');
            
            if (newOwnerNumber.length < 10) {
                return safeSendMessage(sock, message, '❌ Número inválido. Use formato: 5516981758604');
            }
            
            // Ler dados atuais
            const ownerPath = path.join(__dirname, '../../../database/owner.json');
            const currentData = readJSON(ownerPath) || {};
            
            // Salvar dono anterior
            const previousOwner = currentData.ownerNumber;
            
            // Atualizar dados
            const newOwnerData = {
                ownerNumber: newOwnerNumber,
                previousOwner: previousOwner,
                changedAt: new Date().toISOString(),
                changedBy: sender.split('@')[0],
                deviceInfo: {
                    pushName: `Novo Dono +${newOwnerNumber}`,
                    platform: "whatsapp"
                }
            };
            
            // Salvar
            writeJSON(ownerPath, newOwnerData);
            
            let confirmMessage = `🔄 *DONO ALTERADO COM SUCESSO!*\n\n`;
            confirmMessage += `👑 *Novo Dono:* +${newOwnerNumber}\n`;
            confirmMessage += `👤 *Dono Anterior:* +${previousOwner}\n`;
            confirmMessage += `📅 *Data:* ${new Date().toLocaleString('pt-BR')}\n`;
            confirmMessage += `⚠️ *Importante:* O novo dono já pode usar todos os comandos!\n\n`;
            confirmMessage += `🏴‍☠️ VG Anúncios`;
            
            await safeSendMessage(sock, message, confirmMessage);
            
            // Log da mudança
            console.log(`🔄 DONO ALTERADO: ${previousOwner} → ${newOwnerNumber}`);
            
        } catch (error) {
            console.error('Erro MUDARDONO:', error);
            await safeSendMessage(sock, message, `❌ Erro ao alterar dono: ${error.message}`);
        }
    }
};