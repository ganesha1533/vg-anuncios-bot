const { getGroupData, isGroupActive } = require('../../utils/database');

module.exports = {
    name: 'gpativos',
    description: 'Listar grupos com código ativo',
    usage: '/gpativos',
    category: 'owner',
    cooldown: 5,
    
    async execute(sock, message, args) {
        try {
            const groups = await sock.groupFetchAllParticipating();
            const allGroups = Object.values(groups);
            
            // Filtrar apenas grupos com código ativo
            const activeGroups = [];
            
            for (const group of allGroups) {
                if (isGroupActive(group.id)) {
                    const groupData = getGroupData(group.id);
                    activeGroups.push({
                        ...group,
                        activationData: groupData
                    });
                }
            }
            
            let result = `🏴‍☠️ GRUPOS COM CÓDIGO ATIVO\n`;
            result += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            result += `📊 Total: ${activeGroups.length} grupos ativos\n`;
            result += `🔓 Sem código: ${allGroups.length - activeGroups.length} grupos\n\n`;
            
            if (activeGroups.length === 0) {
                result += `⚠️ Nenhum grupo com código ativo encontrado.\n\n`;
                result += `💡 Use /novocodigo para gerar códigos\n`;
                result += `💡 Use /validargrupo [código] para ativar grupos\n\n`;
            } else {
                activeGroups.forEach((group, index) => {
                    const participants = group.participants ? group.participants.length : 0;
                    const data = group.activationData;
                    
                    result += `${index + 1}. 📱 ${group.subject || 'Sem nome'}\n`;
                    result += `   👥 ${participants} membros\n`;
                    
                    if (data && data.status === 'active') {
                        result += `   ✅ Status: Ativo\n`;
                        if (data.expiresAt) {
                            const expires = new Date(data.expiresAt);
                            result += `   ⏰ Vence: ${expires.toLocaleDateString('pt-BR')}\n`;
                        } else {
                            result += `   ♾️ Vitalício\n`;
                        }
                        if (data.activatedAt) {
                            const activated = new Date(data.activatedAt);
                            result += `   📅 Ativado: ${activated.toLocaleDateString('pt-BR')}\n`;
                        }
                    }
                    
                    result += `   🆔 ${group.id.split('@')[0]}\n\n`;
                });
            }
            
            result += `📋 Total de grupos no bot: ${allGroups.length}\n`;
            result += `🏴‍☠️ VG Anúncios - Bot Profissional`;
            
            await sock.sendMessage(message.key.remoteJid, { text: result });
        } catch (error) {
            console.error('Erro gpativos:', error);
            await sock.sendMessage(message.key.remoteJid, { 
                text: '❌ Erro ao listar grupos ativos.' 
            });
        }
    }
};