const ZW = '\u200E';

module.exports = {
    name: 'hidetag',
    description: 'Marcar todos com tag invisível',
    usage: '/hidetag mensagem',
    category: 'admin',
    async execute(sock, message, args) {
        const { isOwner, isAdmin } = require('../../utils');
        const groupJid = message.key.remoteJid;

        if (!args || args.length === 0) {
            return sock.sendMessage(groupJid, { text: '❌ Forneça uma mensagem. Exemplo: /hidetag Atenção pessoal!' });
        }

        try {
            const meta = await sock.groupMetadata(groupJid);
            const sender = message.key.participant || message.key.remoteJid;
            let senderIsAdmin = false;
            try { senderIsAdmin = await isAdmin(sock, groupJid, sender); } catch { senderIsAdmin = false; }
            if (!senderIsAdmin && !isOwner(sender)) {
                return sock.sendMessage(groupJid, { text: '⚠️ Apenas admins podem usar este comando!' });
            }

            const participants = meta.participants.map(p => p.id);
            const texto = args.join(' ').trim();
            if (!texto) return sock.sendMessage(groupJid, { text: '❌ Texto inválido.' });

            const hiddenPad = ZW.repeat(400);
            const finalText = `${texto}\n${hiddenPad}`;

            await sock.sendMessage(groupJid, {
                text: finalText,
                mentions: participants
            });
        } catch (e) {
            console.error('Erro HIDETAG:', e);
            await sock.sendMessage(groupJid, { text: `❌ Erro ao marcar: ${e.message}` });
        }
    }
};