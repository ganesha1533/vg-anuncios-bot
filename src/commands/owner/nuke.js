module.exports = {
    name: 'nuke',
    description: 'EXTREMO: Remover todos os membros do grupo',
    usage: '/nuke [--all] [--force]',
    category: 'owner',
    
    async execute(sock, message, args) {
        const { safeSendMessage, isGroup, isOwner, getSender } = require('../../utils');
        const groupJid = message.key.remoteJid;
        const sender = getSender(message);
        
        if (!isOwner(sender)) {
            return await safeSendMessage(sock, groupJid, '🚫 ACESSO NEGADO - COMANDO NUKE RESTRITO AO OWNER!');
        }
        
        if (!isGroup(groupJid)) {
            return await safeSendMessage(sock, groupJid, '❌ NUKE só funciona em grupos.');
        }
        
        const hasAll = args.includes('--all');
        const hasForce = args.includes('--force');
        
        try {
            const groupMetadata = await sock.groupMetadata(groupJid);
            const groupName = groupMetadata.subject;
            const participants = groupMetadata.participants;
            
            const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
            const botParticipant = participants.find(p => p.id === botNumber);
            
            if (!botParticipant || (!botParticipant.admin && !hasForce)) {
                return await safeSendMessage(sock, groupJid, '❌ Bot precisa ser ADMIN para NUKE!\\n\\n💡 Use --force para tentar mesmo assim');
            }
            
            let targets = [];
            let adminsCount = 0;
            let membersCount = 0;
            
            for (const participant of participants) {
                if (participant.id === botNumber) continue;
                
                const isAdmin = participant.admin === 'admin' || participant.admin === 'superadmin';
                
                if (isAdmin) {
                    adminsCount++;
                    if (hasAll) {
                        targets.push(participant.id);
                    }
                } else {
                    membersCount++;
                    targets.push(participant.id);
                }
            }
            
            if (targets.length === 0) {
                return await safeSendMessage(sock, groupJid, '❌ Nenhum alvo válido encontrado para NUKE.');
            }
            
            let confirmMsg = '💀 NUKE PREPARADO - CONFIRMAÇÃO FINAL\\n\\n';
            confirmMsg += `🏰 Grupo: ${groupName}\\n`;
            confirmMsg += `🎯 Alvos: ${targets.length} participantes\\n`;
            confirmMsg += `👑 Admins no grupo: ${adminsCount}\\n`;
            confirmMsg += `👥 Membros no grupo: ${membersCount}\\n\\n`;
            
            if (hasAll) {
                confirmMsg += '⚠️ MODO: TOTAL DESTRUCTION\\n';
                confirmMsg += '💀 Todos serão removidos (admins + membros)\\n\\n';
            } else {
                confirmMsg += '🎯 MODO: MEMBROS APENAS\\n';
                confirmMsg += '👑 Admins serão preservados\\n\\n';
            }
            
            confirmMsg += '🕐 Iniciando NUKE em 3 segundos...\\n';
            confirmMsg += '🏴‍☠️ VG Anúncios - Operação Destruição';
            
            await safeSendMessage(sock, groupJid, confirmMsg);
            
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            let removed = 0;
            let errors = 0;
            
            await safeSendMessage(sock, groupJid, '💀 NUKE INICIADO - REMOVENDO ALVOS...');
            
            const batchSize = hasForce ? 5 : 3;
            
            for (let i = 0; i < targets.length; i += batchSize) {
                const batch = targets.slice(i, i + batchSize);
                
                try {
                    const result = await sock.groupParticipantsUpdate(groupJid, batch, 'remove');
                    
                    if (result) {
                        for (const res of result) {
                            if (res.status === 200) {
                                removed++;
                            } else {
                                errors++;
                            }
                        }
                    }
                    
                } catch (batchError) {
                    console.error('Erro no lote NUKE:', batchError);
                    errors += batch.length;
                }
                
                await new Promise(resolve => setTimeout(resolve, hasForce ? 1000 : 2000));
                
                if (i % (batchSize * 2) === 0) {
                    const progress = Math.round(((i + batchSize) / targets.length) * 100);
                    await safeSendMessage(sock, groupJid, `⚡ NUKE Progress: ${progress}% (${removed} removidos)`);
                }
            }
            
            let finalReport = '💀 NUKE CONCLUÍDO - RELATÓRIO FINAL\\n\\n';
            finalReport += `🏰 Grupo: ${groupName}\\n`;
            finalReport += `🎯 Alvos identificados: ${targets.length}\\n`;
            finalReport += `✅ Removidos com sucesso: ${removed}\\n`;
            finalReport += `❌ Falhas na remoção: ${errors}\\n`;
            finalReport += `📈 Taxa de sucesso: ${((removed/targets.length)*100).toFixed(1)}%\\n\\n`;
            
            if (removed > 0) {
                finalReport += '💀 OPERAÇÃO NUKE BEM-SUCEDIDA!\\n';
            } else {
                finalReport += '⚠️ NUKE FALHOU - NENHUMA REMOÇÃO\\n';
            }
            
            finalReport += `\\n⏰ Concluído: ${new Date().toLocaleString('pt-BR')}\\n`;
            finalReport += '🏴‍☠️ VG Anúncios - Operação Destruição Finalizada';
            
            await safeSendMessage(sock, groupJid, finalReport);
            
            console.log(`💀 NUKE EXECUTADO: ${removed}/${targets.length} removidos no grupo ${groupName}`);
            
        } catch (error) {
            console.error('Erro NUKE:', error);
            await safeSendMessage(sock, groupJid, `💀 ERRO NO NUKE:\\n\\n❌ ${error.message}\\n\\n🏴‍☠️ VG Anúncios`);
        }
    }
};
