module.exports = {
    name: 'listagp',
    description: 'Lista de grupos completa',
    usage: '/listagp',
    category: 'owner',
    cooldown: 5,
    
    async execute(sock, message, args) {
        try {
            const groups = await sock.groupFetchAllParticipating();
            const groupList = Object.values(groups);
            
            let result = `📋 LISTA COMPLETA DE GRUPOS\n`;
            result += `━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            result += `📊 Total: ${groupList.length} grupos\n\n`;
            
            groupList.forEach((group, index) => {
                const participants = group.participants ? group.participants.length : 0;
                const admins = group.participants ? group.participants.filter(p => p.admin).length : 0;
                
                result += `🔹 ${index + 1}. ${group.subject || 'Sem nome'}\n`;
                result += `   👥 Membros: ${participants}\n`;
                result += `   👑 Admins: ${admins}\n`;
                result += `   🆔 ID: ${group.id.split('@')[0]}\n`;
                result += `   📅 Criado: ${group.creation ? new Date(group.creation * 1000).toLocaleDateString() : 'N/A'}\n\n`;
            });
            
            if (result.length > 4000) {
                result = result.substring(0, 3900) + '\n\n... (lista truncada)\n\n🏴‍☠️ VG Anúncios';
            } else {
                result += `🏴‍☠️ VG Anúncios`;
            }
            
            await sock.sendMessage(message.key.remoteJid, { text: result });
        } catch (error) {
            console.error('Erro listagp:', error);
            await sock.sendMessage(message.key.remoteJid, { 
                text: '❌ Erro ao listar grupos.' 
            });
        }
    }
};