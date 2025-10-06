/**
 * 🧪 TESTE DE DONO
 * Comando especial para testar se o dono está sendo detectado corretamente
 */
const { isOwner, getSender, safeSendMessage } = require('../../utils');

module.exports = {
    name: 'testdono',
    aliases: ['testowner', 'soudono'],
    description: 'Testa se você está sendo reconhecido como dono',
    usage: '/testdono',
    category: 'owner',
    
    async execute(sock, message, args) {
        try {
            const sender = getSender(message);
            const senderNumber = sender.split('@')[0].split(':')[0];
            const senderClean = senderNumber.replace(/\D/g, '').replace(/^55/, '');
            
            // Verificar se é dono
            const isDono = isOwner(sender);
            
            let resposta = `🧪 TESTE DE DETECÇÃO DO DONO\n━━━━━━━━━━━━━━━━━━━━━━━━━\n\n📱 SEU NÚMERO: +55${senderClean}\n🔍 SENDER RAW: ${sender}\n👑 DONO DETECTADO: ${isDono ? '✅ SIM' : '❌ NÃO'}\n\n📋 DIAGNÓSTICO COMPLETO:\n• Número extraído: ${senderClean}\n• Formato completo: ${senderNumber}\n• JID completo: ${sender}\n• Hardcoded owner: 16981758604\n\n🎯 RESULTADO: ${isDono ? 'VOCÊ É RECONHECIDO COMO DONO!' : 'NÃO RECONHECIDO COMO DONO'}\n\n📢 VG Anúncios - Teste do Sistema`;

            await safeSendMessage(sock, message.key.remoteJid, {
                text: resposta
            });
            
        } catch (error) {
            console.error('Erro no comando testdono:', error);
            await safeSendMessage(sock, message.key.remoteJid, {
                text: '❌ Erro no teste de dono.'
            });
        }
    }
};