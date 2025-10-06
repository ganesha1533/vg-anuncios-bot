module.exports = {
    name: 'removercod',
    description: 'Remover código de ativação',
    usage: '/removercod [código]',
    category: 'owner',
    
    async execute(sock, message, args) {
        // Usar sistema de validação padrão
        const { isOwner, getSender, safeSendMessage } = require('../../utils');
        const senderJid = getSender(message);
        
        if (!isOwner(senderJid)) {
            return safeSendMessage(sock, message, '❌ Apenas donos podem usar este comando.');
        }
        
        if (args.length < 1) {
            return safeSendMessage(sock, message, '❌ Forneça o código. Exemplo: /removercod VG-12345678');
        }
        
        const codigo = args[0].toUpperCase();
        
        try {
            const fs = require('fs');
            const path = require('path');
            
            // Carregar códigos
            const codesPath = path.join(__dirname, '../../../database/activation-codes.json');
            let codes = {};
            
            try {
                const codesData = fs.readFileSync(codesPath, 'utf8');
                codes = JSON.parse(codesData);
            } catch (error) {
                return safeSendMessage(sock, message, '❌ Sistema de códigos não encontrado.');
            }
            
            if (!codes[codigo]) {
                return safeSendMessage(sock, message, '❌ Código não encontrado.');
            }
            
            // Verificar se há grupos usando este código
            const activeGroupsPath = path.join(__dirname, '../../../database/active-groups.json');
            let activeGroups = {};
            let gruposAfetados = [];
            
            try {
                const activeData = fs.readFileSync(activeGroupsPath, 'utf8');
                activeGroups = JSON.parse(activeData);
                
                // Encontrar grupos usando este código
                for (const groupId in activeGroups) {
                    if (activeGroups[groupId].codigo === codigo) {
                        gruposAfetados.push(groupId);
                    }
                }
            } catch (error) {
                activeGroups = {};
            }
            
            // Remover código
            const codeData = codes[codigo];
            delete codes[codigo];
            
            // Desativar grupos que usavam este código
            if (gruposAfetados.length > 0) {
                for (const groupId of gruposAfetados) {
                    delete activeGroups[groupId];
                }
                fs.writeFileSync(activeGroupsPath, JSON.stringify(activeGroups, null, 2));
            }
            
            // Salvar códigos atualizados
            fs.writeFileSync(codesPath, JSON.stringify(codes, null, 2));
            
            let mensagem = `✅ CÓDIGO REMOVIDO\n━━━━━━━━━━━━━━━━━━━━━━━━━\n\n🔑 Código: \`${codigo}\`\n📅 Criado: ${new Date(codeData.criado).toLocaleDateString('pt-BR')}\n👥 Capacidade: ${codeData.grupos} grupos`;
            
            if (gruposAfetados.length > 0) {
                mensagem += `\n\n⚠️ GRUPOS DESATIVADOS:\n`;
                mensagem += `📊 ${gruposAfetados.length} grupos foram desativados`;
            }
            
            mensagem += `\n\n🏴‍☠️ VG Anúncios - Bot Profissional`;
            
            await safeSendMessage(sock, message, mensagem);
            
            // Notificar grupos afetados (opcional)
            if (gruposAfetados.length > 0) {
                for (const groupId of gruposAfetados) {
                    try {
                        await sock.sendMessage(groupId, { 
                            text: `⚠️ BOT DESATIVADO\n━━━━━━━━━━━━━━━━━━━━━━━━━\n\nO código de ativação deste grupo foi removido pelo administrador.\n\nPara reativar, solicite um novo código ao suporte.\n\n🏴‍☠️ VG Anúncios - Bot Profissional` 
                        });
                    } catch (error) {
                        console.error(`Erro ao notificar grupo ${groupId}:`, error);
                    }
                }
            }
            
        } catch (error) {
            console.error('Erro remover código:', error);
            await safeSendMessage(sock, message, '❌ Erro ao remover código.');
        }
    }
};