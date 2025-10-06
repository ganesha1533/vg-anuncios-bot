module.exports = {
    name: 'painel',
    description: 'Painel de controle do bot',
    usage: '/painel',
    category: 'owner',
    
    async execute(sock, message, args) {
        const { safeSendMessage, getSystemInfo, readJSON } = require('../../utils');
        const path = require('path');
        
        try {
            // Obter informações do sistema
            const systemInfo = getSystemInfo();
            
            // Obter dados do owner
            const ownerData = readJSON(path.join(__dirname, '../../../database/owner.json')) || {};
            
            // Contar comandos por categoria
            const fs = require('fs');
            const commandsPath = path.join(__dirname, '..');
            
            function countCommands(cat) {
                const dir = path.join(commandsPath, cat);
                if (!fs.existsSync(dir)) return 0;
                return fs.readdirSync(dir).filter(f => f.endsWith('.js')).length;
            }
            
            const ownerCmds = countCommands('owner');
            const adminCmds = countCommands('admin');
            const userCmds = countCommands('user');
            const totalCmds = ownerCmds + adminCmds + userCmds;
            
            // Obter uptime do processo
            const uptimeSeconds = process.uptime();
            const uptimeFormatted = systemInfo.uptime;
            
            const painelText = `╭──────────────────────────╮\n│   🏴‍☠️ *PAINEL VG ANÚNCIOS* 🏴‍☠️   │\n╰──────────────────────────╯\n\n📊 *STATUS DO SISTEMA*\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n✅ *Status:* Online e Operacional\n⚡ *Uptime:* ${uptimeFormatted}\n🖥️ *Sistema:* ${systemInfo.platform}\n💾 *RAM Livre:* ${systemInfo.memory.free}\n🔧 *Node.js:* ${systemInfo.nodeVersion}\n\n👑 *DADOS DO DONO*\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n📱 *Número:* +${ownerData.ownerNumber || 'Não definido'}\n🏴‍☠️ *Desde:* ${ownerData.setAt ? new Date(ownerData.setAt).toLocaleDateString('pt-BR') : 'N/A'}\n👤 *Nome:* ${ownerData.deviceInfo?.pushName || 'VG Owner'}\n\n📈 *ESTATÍSTICAS DE COMANDOS*\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n👑 *Owner:* ${ownerCmds} comandos\n🛡️ *Admin:* ${adminCmds} comandos  \n👥 *User:* ${userCmds} comandos\n📊 *Total:* ${totalCmds} comandos\n\n🎯 *COMANDOS PRINCIPAIS*\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n💎 \`/novocodigo [dias] [qtd]\` - Gerar códigos\n📋 \`/listarcod\` - Ver códigos ativos\n📡 \`/transmitir [msg]\` - Transmissão\n🏰 \`/gpativos\` - Grupos ativos\n🧪 \`/testall\` - Testar comandos\n🏴‍☠️ \`/mudardono [número]\` - Alterar dono\n⏰ \`/vencimento\` - Ver vencimentos\n\n🏴‍☠️ *VG Anúncios - Bot Profissional*`;

            await safeSendMessage(sock, message, painelText);
            
        } catch (error) {
            console.error('Erro no painel:', error);
            await safeSendMessage(sock, message, '❌ Erro ao carregar painel de controle.');
        }
    }
};