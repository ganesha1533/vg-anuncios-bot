module.exports = {
    name: 'ajuda',
    description: 'Tutorial completo do bot',
    usage: '/ajuda [topico]',
    category: 'user',
    
    async execute(sock, message, args) {
        const { safeSendMessage } = require('../../utils');
        
        const topico = args[0]?.toLowerCase();
        
        if (!topico) {
            // Menu principal de ajuda
            let helpMenu = `🆘 *CENTRAL DE AJUDA VG ANÚNCIOS*\n\n`;
            helpMenu += `📖 *Tópicos Disponíveis:*\n\n`;
            helpMenu += `1️⃣ \`/ajuda basico\` - Comandos básicos\n`;
            helpMenu += `2️⃣ \`/ajuda ativar\` - Como ativar grupos\n`;
            helpMenu += `3️⃣ \`/ajuda admin\` - Comandos de admin\n`;
            helpMenu += `4️⃣ \`/ajuda owner\` - Comandos do dono\n`;
            helpMenu += `5️⃣ \`/ajuda codigo\` - Sistema de códigos\n`;
            helpMenu += `6️⃣ \`/ajuda config\` - Configurações\n\n`;
            helpMenu += `💡 *Exemplo:* \`/ajuda ativar\`\n\n`;
            helpMenu += `🏴‍☠️ VG Anúncios`;
            
            return safeSendMessage(sock, message, helpMenu);
        }
        
        let helpText = '';
        
        switch (topico) {
            case 'basico':
                helpText = `📚 *COMANDOS BÁSICOS*\n\n`;
                helpText += `🏠 \`/menu\` - Ver menu principal\n`;
                helpText += `🏓 \`/ping\` - Testar bot\n`;
                helpText += `🔓 \`/ativar [código]\` - Ativar grupo\n`;
                helpText += `🆘 \`/ajuda\` - Esta central de ajuda\n\n`;
                helpText += `💡 *Dica:* Use /menu para ver todos os comandos disponíveis!`;
                break;
                
            case 'ativar':
                helpText = `🔓 *COMO ATIVAR GRUPOS*\n\n`;
                helpText += `📋 *Passo a passo:*\n`;
                helpText += `1️⃣ Obtenha um código de ativação\n`;
                helpText += `2️⃣ Digite: \`/ativar SEU_CODIGO\`\n`;
                helpText += `3️⃣ Aguarde confirmação\n`;
                helpText += `4️⃣ Grupo ativado! ✅\n\n`;
                helpText += `🎫 *Exemplo:*\n`;
                helpText += `\`/ativar VG-MENSAL-1234567890-ABC123\`\n\n`;
                helpText += `⚠️ *Importante:*\n`;
                helpText += `• Cada código ativa apenas 1 grupo\n`;
                helpText += `• Códigos têm prazo de validade\n`;
                helpText += `• Só admins podem ativar grupos`;
                break;
                
            case 'admin':
                helpText = `🛡️ *COMANDOS DE ADMIN*\n\n`;
                helpText += `👥 \`/add [número]\` - Adicionar membro\n`;
                helpText += `🚫 \`/ban [número]\` - Remover membro\n`;
                helpText += `🏷️ \`/hidetag [msg]\` - Marcar todos (oculto)\n`;
                helpText += `📢 \`/aviso [msg]\` - Enviar aviso\n`;
                helpText += `🏷️ \`/marcar [msg]\` - Marcar todos\n`;
                helpText += `📋 \`/listar\` - Listar membros\n\n`;
                helpText += `⚠️ *Requisitos:*\n`;
                helpText += `• Ser admin do grupo\n`;
                helpText += `• Bot deve ser admin\n`;
                helpText += `• Grupo deve estar ativado`;
                break;
                
            case 'owner':
                helpText = `👑 *COMANDOS DO DONO*\n\n`;
                helpText += `🎫 \`/novocodigo [dias] [qtd]\` - Gerar códigos\n`;
                helpText += `📋 \`/listarcod\` - Listar códigos\n`;
                helpText += `📊 \`/totalcmd\` - Total de comandos\n`;
                helpText += `📡 \`/transmitir [msg]\` - Transmitir para todos\n`;
                helpText += `✅ \`/validargrupo [id]\` - Validar grupo\n`;
                helpText += `⏰ \`/vencimento\` - Ver vencimentos\n`;
                helpText += `📱 \`/gpativos\` - Grupos ativos\n`;
                helpText += `🧪 \`/testall\` - Testar comandos\n`;
                helpText += `🔄 \`/mudardono [número]\` - Alterar dono\n`;
                helpText += `🎛️ \`/painel\` - Painel de controle`;
                break;
                
            case 'codigo':
                helpText = `🎫 *SISTEMA DE CÓDIGOS*\n\n`;
                helpText += `📊 *Tipos de Planos:*\n`;
                helpText += `• 7 dias - Teste\n`;
                helpText += `• 30 dias - Mensal\n`;
                helpText += `• 60 dias - Bimestral\n`;
                helpText += `• 90 dias - Trimestral\n`;
                helpText += `• 365 dias - Anual\n\n`;
                helpText += `🔑 *Formato do Código:*\n`;
                helpText += `\`VG-MENSAL-TIMESTAMP-HASH\`\n\n`;
                helpText += `💡 *Exemplos de Uso:*\n`;
                helpText += `\`/novocodigo 30\` - 1 código de 30 dias\n`;
                helpText += `\`/novocodigo 60 5\` - 5 códigos de 60 dias`;
                break;
                
            case 'config':
                helpText = `⚙️ *CONFIGURAÇÕES*\n\n`;
                helpText += `👑 *Para ser reconhecido como DONO:*\n`;
                helpText += `1️⃣ Número deve estar no sistema\n`;
                helpText += `2️⃣ Use /mudardono para alterar\n`;
                helpText += `3️⃣ Reinicie o bot se necessário\n\n`;
                helpText += `🛡️ *Para ser reconhecido como ADMIN:*\n`;
                helpText += `1️⃣ Seja admin do grupo no WhatsApp\n`;
                helpText += `2️⃣ Bot deve ser admin também\n`;
                helpText += `3️⃣ Grupo deve estar ativado\n\n`;
                helpText += `🤖 *Bot como Admin:*\n`;
                helpText += `1️⃣ Adicione: +55 11 93297-9915\n`;
                helpText += `2️⃣ Promova para administrador\n`;
                helpText += `3️⃣ Teste com /ping`;
                break;
                
            default:
                helpText = `❌ *Tópico não encontrado!*\n\n`;
                helpText += `📖 *Tópicos disponíveis:*\n`;
                helpText += `• basico • ativar • admin\n`;
                helpText += `• owner • codigo • config\n\n`;
                helpText += `💡 Use: \`/ajuda [topico]\``;
                break;
        }
        
        helpText += `\n\n🏴‍☠️ VG Anúncios`;
        
        await safeSendMessage(sock, message, helpText);
    }
};