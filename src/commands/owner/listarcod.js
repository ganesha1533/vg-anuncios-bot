const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'listarcod',
    description: 'Listar códigos de ativação',
    usage: '/listarcod',
    category: 'owner',
    
    async execute(sock, message, args) {
        // Usar sistema de validação padrão
        const { isOwner, getSender, safeSendMessage } = require('../../utils');
        const senderJid = getSender(message);
        
        if (!isOwner(senderJid)) {
            return safeSendMessage(sock, message.key.remoteJid, { text: '❌ Apenas donos podem usar este comando.' });
        }
        
        try {
            // Carregar códigos com nova estrutura
            const codesPath = path.join(__dirname, '../../../database/activation-codes.json');
            let codesData = { codes: [], stats: { generated: 0, used: 0 } };
            
            try {
                const fileData = fs.readFileSync(codesPath, 'utf8');
                codesData = JSON.parse(fileData);
                if (!codesData.codes) codesData.codes = [];
            } catch (error) {
                return safeSendMessage(sock, message.key.remoteJid, { text: '❌ Nenhum código encontrado.' });
            }
            
            if (codesData.codes.length === 0) {
                return safeSendMessage(sock, message.key.remoteJid, { text: '📋 Nenhum código de ativação criado ainda.' });
            }
            
            // Carregar grupos ativos para contagem
            const activeGroupsPath = path.join(__dirname, '../../../database/active-groups.json');
            let activeGroups = {};
            
            try {
                const activeData = fs.readFileSync(activeGroupsPath, 'utf8');
                activeGroups = JSON.parse(activeData);
            } catch (error) {
                activeGroups = {};
            }
            
            let listaMsg = '📋 *CÓDIGOS DE ATIVAÇÃO*\n\n';
            
            const agora = new Date();
            let totalCodigos = codesData.codes.length;
            let codigosAtivos = 0;
            let codigosExpirados = 0;
            let codigosUsados = 0;
            
            // Mostrar apenas os últimos 10 códigos para não sobrecarregar
            const ultimosCodigos = codesData.codes.slice(-10).reverse();
            
            for (const codeInfo of ultimosCodigos) {
                // Contar grupos usando este código E obter nomes dos grupos
                let gruposUsando = 0;
                let nomesGrupos = [];
                
                for (const groupId in activeGroups) {
                    if (activeGroups[groupId].codigo === codeInfo.id) {
                        gruposUsando++;
                        // Tentar obter nome do grupo
                        const groupName = activeGroups[groupId].name || activeGroups[groupId].groupName || 'Grupo sem nome';
                        nomesGrupos.push(groupName);
                    }
                }
                
                // Formato de data brasileiro consistente
                const criado = codeInfo.createdAt.includes('-') ? 
                    new Date(codeInfo.createdAt).toLocaleDateString('pt-BR') : 
                    codeInfo.createdAt;
                    
                let vencimento = null;
                
                if (codeInfo.days && codeInfo.usedAt) {
                    const usedDate = codeInfo.usedAt.includes('-') ? 
                        new Date(codeInfo.usedAt) : 
                        new Date(codeInfo.usedAt);
                    vencimento = new Date(usedDate);
                    vencimento.setDate(vencimento.getDate() + codeInfo.days);
                }
                
                let status = '';
                if (codeInfo.used) {
                    if (vencimento && agora > vencimento) {
                        status = '⚫ EXPIRADO';
                        codigosExpirados++;
                    } else {
                        status = '🟡 EM USO';
                        codigosAtivos++;
                    }
                    codigosUsados++;
                } else {
                    status = '🟢 DISPONÍVEL';
                    codigosAtivos++;
                }
                
                listaMsg += `🔑 \`${codeInfo.id}\`\n`;
                listaMsg += `   📊 ${status}\n`;
                listaMsg += `   🏷️ Tipo: ${codeInfo.type.toUpperCase()}\n`;
                listaMsg += `   ⏱️ Duração: ${codeInfo.days ? codeInfo.days + ' dias' : 'Vitalício'}\n`;
                listaMsg += `   👥 ${gruposUsando}/${codeInfo.maxGroups} grupos\n`;
                listaMsg += `   📅 Criado: ${criado}\n`;
                
                // Mostrar nomes dos grupos usando o código
                if (nomesGrupos.length > 0) {
                    listaMsg += `   🏰 Grupos: ${nomesGrupos.join(', ')}\n`;
                }
                
                if (codeInfo.used && codeInfo.usedAt) {
                    const usado = codeInfo.usedAt.includes('-') ? 
                        new Date(codeInfo.usedAt).toLocaleDateString('pt-BR') : 
                        codeInfo.usedAt;
                    listaMsg += `   ✅ Usado: ${usado}\n`;
                    if (vencimento) {
                        listaMsg += `   ⏰ Vence: ${vencimento.toLocaleDateString('pt-BR')}\n`;
                    }
                }
                
                listaMsg += '\n';
            }
            
            listaMsg += `📊 *ESTATÍSTICAS GERAIS*\n`;
            listaMsg += `📈 Total: ${totalCodigos} códigos\n`;
            listaMsg += `🟢 Disponíveis: ${codigosAtivos - codigosUsados}\n`;
            listaMsg += `🟡 Em uso: ${codigosUsados - codigosExpirados}\n`;
            listaMsg += `⚫ Expirados: ${codigosExpirados}\n\n`;
            
            if (totalCodigos > 10) {
                listaMsg += `ℹ️ Mostrando últimos 10 de ${totalCodigos} códigos\n\n`;
            }
            
            listaMsg += `🏴‍☠️ *VG Anúncios - Bot Profissional*`;
            
            await safeSendMessage(sock, message.key.remoteJid, { text: listaMsg });
            
        } catch (error) {
            console.error('Erro listar códigos:', error);
            await safeSendMessage(sock, message.key.remoteJid, { text: '❌ Erro ao listar códigos.' });
        }
    }
};