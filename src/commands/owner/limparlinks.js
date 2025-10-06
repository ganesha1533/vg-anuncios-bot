/**
 * 🗑️ LIMPAR LINKS COLETADOS
 * Comando para o dono limpar a lista de links
 */
const fs = require('fs');
const path = require('path');
const config = require('../../config');
const { safeSendMessage } = require('../../utils');

const LINKS_FILE = path.join(__dirname, '..', '..', 'database', 'links-coletados.json');

module.exports = {
    name: 'limparlinks',
    aliases: ['clearlinks', 'resetlinks'],
    description: 'Limpa todos os links coletados (apenas dono)',
    usage: '/limparlinks',
    category: 'owner',
    
    async execute(sock, message, args) {
        try {
            const sender = message.key.participant || message.key.remoteJid;
            const phoneNumber = sender.split('@')[0];
            
            // Verificar se é o dono
            if (phoneNumber !== config.OWNER_NUMBER) {
                return await safeSendMessage(sock, message.key.remoteJid, {
                    text: '❌ Apenas o dono pode limpar os links coletados.'
                });
            }
            
            // Ler quantidade atual
            let quantidadeAtual = 0;
            try {
                if (fs.existsSync(LINKS_FILE)) {
                    const links = JSON.parse(fs.readFileSync(LINKS_FILE, 'utf8'));
                    quantidadeAtual = links.length;
                }
            } catch (e) {
                console.error('Erro ao ler arquivo de links:', e);
            }
            
            // Limpar arquivo
            try {
                fs.writeFileSync(LINKS_FILE, JSON.stringify([], null, 2));
                
                await safeSendMessage(sock, message.key.remoteJid, {
                    text: `🗑️ LINKS LIMPOS COM SUCESSO\n━━━━━━━━━━━━━━━━━━━━━━━━━\n\n✅ ${quantidadeAtual} links foram removidos\n📅 ${new Date().toLocaleString('pt-BR')}\n👤 Limpeza realizada pelo dono\n\n🔄 A coleta automática continua ativa\n📋 Use /coletarlinks para verificar\n\n📢 VG Anúncios - Sistema Limpo`
                });
                
            } catch (error) {
                console.error('Erro ao limpar links:', error);
                await safeSendMessage(sock, message.key.remoteJid, {
                    text: '❌ Erro ao limpar os links coletados.'
                });
            }
            
        } catch (error) {
            console.error('Erro no comando limparlinks:', error);
            await safeSendMessage(sock, message.key.remoteJid, {
                text: '❌ Erro interno no comando.'
            });
        }
    }
};