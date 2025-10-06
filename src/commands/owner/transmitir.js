const ZW = '\u200E';

module.exports = {
    name: 'transmitir',
    description: 'Transmitir mensagem para todos os grupos marcando todos invisível',
    usage: '/transmitir sua mensagem aqui',
    category: 'owner',
    async execute(sock, message, args) {
        const { isOwner, getSender, safeSendMessage } = require('../../utils');
        const sender = getSender(message);
        const groupJid = message.key.remoteJid;
        
        if (!isOwner(sender)) {
            return safeSendMessage(sock, groupJid, { text: '🚫 Apenas o dono do bot pode usar este comando!' });
        }

        if (!args || args.length === 0) {
            return safeSendMessage(sock, groupJid, { text: '❌ TRANSMISSÃO - MODO DE USO\n━━━━━━━━━━━━━━━━━━━━━━━━━\n\n📝 Uso: /transmitir mensagem\n\n🏷️ FUNCIONAMENTO:\n• /transmitir Olá pessoal! (marca todos invisível)\n• Sempre marca todos os participantes\n• Marcação completamente invisível\n\n🏴‍☠️ VG Anúncios' });
        }

        const texto = args.join(' ');
        
        if (!texto.trim()) {
            return safeSendMessage(sock, groupJid, { text: '❌ Mensagem não pode estar vazia.' });
        }

        try {
            await safeSendMessage(sock, groupJid, { text: '📡 INICIANDO TRANSMISSÃO...\n━━━━━━━━━━━━━━━━━━━━━━━━━\n⏳ Carregando grupos...' });
            
            const grupos = await sock.groupFetchAllParticipating();
            const listaGrupos = Object.values(grupos);

            let enviados = 0;
            let erros = 0;
            let participantesTotal = 0;
            
            for (const grupo of listaGrupos) {
                try {
                    let body = `📢 TRANSMISSÃO VG ANÚNCIOS\n━━━━━━━━━━━━━━━━━━━━━━━━━\n\n${texto}\n\n📅 ${new Date().toLocaleString('pt-BR')}\n🏴‍☠️ VG Anúncios - Bot Profissional`;
                    let mentions = [];
                    
                    // SEMPRE MARCAR TODOS INVISÍVEL
                    try {
                        const meta = await sock.groupMetadata(grupo.id);
                        const participantsList = meta.participants.map(p => p.id);
                        mentions = participantsList;
                        participantesTotal += participantsList.length;
                        
                        // EXATAMENTE IGUAL O HIDETAG
                        const hiddenPad = ZW.repeat(400);
                        body = `${body}\n${hiddenPad}`;
                    } catch (metaError) {
                        console.error(`Erro ao obter metadados do grupo ${grupo.subject}:`, metaError);
                    }
                    
                    await sock.sendMessage(grupo.id, {
                        text: body,
                        mentions: mentions
                    });
                    
                    enviados++;
                    
                    await new Promise(r => setTimeout(r, 1500));
                } catch (err) {
                    console.error(`Erro grupo ${grupo.subject}:`, err);
                    erros++;
                }
            }

            let relatorio = `✅ TRANSMISSÃO CONCLUÍDA\n━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
            relatorio += `📊 ESTATÍSTICAS:\n`;
            relatorio += `• Total de grupos: ${listaGrupos.length}\n`;
            relatorio += `• Enviados com sucesso: ${enviados}\n`;
            relatorio += `• Erros de envio: ${erros}\n`;
            relatorio += `• Participantes marcados: ${participantesTotal}\n`;
            relatorio += `🏷️ Modo: MARCAR TODOS INVISÍVEL\n`;
            relatorio += `\n⏰ Tempo de envio: ${Date.now()}\n`;
            relatorio += `📈 Taxa de sucesso: ${((enviados/listaGrupos.length)*100).toFixed(1)}%\n\n`;
            relatorio += `🏴‍☠️ VG Anúncios - Bot Profissional`;

            await safeSendMessage(sock, groupJid, { text: relatorio });
            
        } catch (e) {
            console.error('Erro TRANSMITIR:', e);
            await safeSendMessage(sock, groupJid, { text: `❌ Erro na transmissão: ${e.message}` });
        }
    }
};
