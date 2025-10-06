module.exports = {
    name: 'welcome',
    description: 'Configurar mensagem de boas-vindas do grupo',
    usage: '/welcome [on/off/msg] [mensagem]',
    category: 'admin',
    
    async execute(sock, message, args) {
        const { safeSendMessage, isGroup } = require('../../utils');
        const { readJSON, writeJSON } = require('../../utils/database');
        const path = require('path');
        
        // Verificar se é um grupo
        if (!isGroup(message.key.remoteJid)) {
            return await safeSendMessage(sock, message.key.remoteJid, '❌ Este comando só funciona em grupos.');
        }
        
        if (args.length === 0) {
            return await safeSendMessage(sock, message.key.remoteJid, `🎉 *SISTEMA DE BOAS-VINDAS*\n\n📝 *Comandos:*\n• \`/welcome on\` - Ativar boas-vindas\n• \`/welcome off\` - Desativar boas-vindas\n• \`/welcome msg Sua mensagem aqui\` - Definir mensagem\n• \`/welcome\` - Ver status atual\n\n💡 *Variáveis disponíveis:*\n• \`@user\` - Menciona o novo membro\n• \`@group\` - Nome do grupo\n• \`@date\` - Data atual\n\n🏴‍☠️ VG Anúncios`);
        }
        
        try {
            const groupJid = message.key.remoteJid;
            const groupMetadata = await sock.groupMetadata(groupJid);
            const groupName = groupMetadata.subject;
            
            // Carregar configurações de boas-vindas
            const welcomePath = path.join(__dirname, '../../../database/welcome.json');
            let welcomeData = {};
            
            try {
                welcomeData = readJSON(welcomePath) || {};
            } catch (error) {
                welcomeData = {};
            }
            
            if (!welcomeData[groupJid]) {
                welcomeData[groupJid] = {
                    enabled: false,
                    message: `🎉 *BEM-VINDO(A) AO GRUPO!*\n\n👋 Olá @user!\n📚 Seja bem-vindo(a) ao @group\n📅 Data: @date\n\n🔔 Leia as regras e participe!\n🏴‍☠️ VG Anúncios`
                };
            }
            
            const option = args[0].toLowerCase();
            
            if (option === 'on') {
                welcomeData[groupJid].enabled = true;
                writeJSON(welcomePath, welcomeData);
                
                return await safeSendMessage(sock, groupJid, `✅ *BOAS-VINDAS ATIVADAS!*\n\n🏰 Grupo: ${groupName}\n📝 Mensagem atual:\n\n${welcomeData[groupJid].message}\n\n💡 Use \`/welcome msg [texto]\` para alterar\n🏴‍☠️ VG Anúncios`);
                
            } else if (option === 'off') {
                welcomeData[groupJid].enabled = false;
                writeJSON(welcomePath, welcomeData);
                
                return await safeSendMessage(sock, groupJid, `❌ *BOAS-VINDAS DESATIVADAS!*\n\n🏰 Grupo: ${groupName}\n\n🏴‍☠️ VG Anúncios`);
                
            } else if (option === 'msg') {
                if (args.length < 2) {
                    return await safeSendMessage(sock, groupJid, '❌ Forneça a mensagem. Exemplo: /welcome msg Bem-vindo @user ao nosso grupo!');
                }
                
                const newMessage = args.slice(1).join(' ');
                welcomeData[groupJid].message = newMessage;
                writeJSON(welcomePath, welcomeData);
                
                return await safeSendMessage(sock, groupJid, `✅ *MENSAGEM ALTERADA!*\n\n📝 Nova mensagem:\n\n${newMessage}\n\n💡 *Variáveis:* @user, @group, @date\n🏴‍☠️ VG Anúncios`);
                
            } else {
                // Mostrar status atual
                const status = welcomeData[groupJid].enabled ? '✅ ATIVADO' : '❌ DESATIVADO';
                
                return await safeSendMessage(sock, groupJid, `🎉 *STATUS BOAS-VINDAS*\n\n🏰 Grupo: ${groupName}\n📊 Status: ${status}\n\n📝 Mensagem atual:\n${welcomeData[groupJid].message}\n\n🏴‍☠️ VG Anúncios`);
            }
            
        } catch (error) {
            console.error('Erro WELCOME:', error);
            await safeSendMessage(sock, message.key.remoteJid, '❌ Erro ao configurar boas-vindas.');
        }
    }
};