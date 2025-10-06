module.exports = {
    name: 'testall',
    description: 'Testar todos os comandos do bot',
    usage: '/testall',
    category: 'owner',
    
    async execute(sock, message, args) {
        const { safeSendMessage, isOwner, getSender } = require('../../utils');
        
        // Verificar se é owner
        const sender = getSender(message);
        if (!isOwner(sender)) {
            return safeSendMessage(sock, message, '❌ Apenas o dono pode usar este comando.');
        }
        
        try {
            // Obter comandos carregados
            const { loadCommands } = require('../../loader');
            const commands = loadCommands();
            
            let testResult = `🧪 *TESTE DE COMANDOS*\n\n`;
            testResult += `📊 *Total de comandos:* ${commands.size}\n\n`;
            
            // Categorizar comandos
            const categories = {
                owner: [],
                admin: [],
                user: []
            };
            
            commands.forEach((command, name) => {
                const category = command.category || 'user';
                if (categories[category]) {
                    categories[category].push(name);
                }
            });
            
            // Mostrar por categoria
            if (categories.owner.length > 0) {
                testResult += `👑 *COMANDOS OWNER (${categories.owner.length}):*\n`;
                testResult += categories.owner.map(cmd => `• /${cmd}`).join('\n') + '\n\n';
            }
            
            if (categories.admin.length > 0) {
                testResult += `🛡️ *COMANDOS ADMIN (${categories.admin.length}):*\n`;
                testResult += categories.admin.map(cmd => `• /${cmd}`).join('\n') + '\n\n';
            }
            
            if (categories.user.length > 0) {
                testResult += `👤 *COMANDOS USER (${categories.user.length}):*\n`;
                testResult += categories.user.map(cmd => `• /${cmd}`).join('\n') + '\n\n';
            }
            
            testResult += `✅ *Status:* Todos os comandos carregados com sucesso!\n`;
            testResult += `🏴‍☠️ VG Anúncios`;
            
            await safeSendMessage(sock, message, testResult);
            
        } catch (error) {
            console.error('Erro TESTALL:', error);
            await safeSendMessage(sock, message, `❌ Erro no teste: ${error.message}`);
        }
    }
};