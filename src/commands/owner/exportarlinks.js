/**
 * 📤 EXPORTAR LINKS
 * Comando para exportar todos os links coletados em formato texto
 */
const fs = require('fs');
const path = require('path');
const config = require('../../config');
const { safeSendMessage } = require('../../utils');

const LINKS_FILE = path.join(__dirname, '..', '..', 'database', 'links-coletados.json');

module.exports = {
    name: 'exportarlinks',
    aliases: ['exportlinks', 'downloadlinks'],
    description: 'Exporta todos os links coletados em formato texto',
    usage: '/exportarlinks',
    category: 'owner',
    
    async execute(sock, message, args) {
        try {
            const sender = message.key.participant || message.key.remoteJid;
            const phoneNumber = sender.split('@')[0];
            
            // Verificar se é o dono
            if (phoneNumber !== config.OWNER_NUMBER) {
                return await safeSendMessage(sock, message.key.remoteJid, {
                    text: '❌ Apenas o dono pode exportar os links coletados.'
                });
            }
            
            // Ler links salvos
            let links = [];
            try {
                if (fs.existsSync(LINKS_FILE)) {
                    links = JSON.parse(fs.readFileSync(LINKS_FILE, 'utf8'));
                }
            } catch (e) {
                console.error('Erro ao ler arquivo de links:', e);
                return await safeSendMessage(sock, message.key.remoteJid, {
                    text: '❌ Erro ao ler arquivo de links.'
                });
            }
            
            if (links.length === 0) {
                return await safeSendMessage(sock, message.key.remoteJid, {
                    text: '📋 Nenhum link foi coletado ainda para exportar.'
                });
            }
            
            // Criar arquivo de exportação
            const exportFileName = `links-exportados-${Date.now()}.txt`;
            const exportPath = path.join(__dirname, '..', '..', 'database', exportFileName);
            
            // Organizar links por data
            const linksOrdenados = links.sort((a, b) => b.timestamp - a.timestamp);
            
            // Criar conteúdo do arquivo
            let conteudo = `📋 LINKS DE GRUPOS COLETADOS - VG ANÚNCIOS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n📊 Total de links: ${links.length}\n📅 Exportado em: ${new Date().toLocaleString('pt-BR')}\n🤖 Sistema: VG Anúncios Bot\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

            linksOrdenados.forEach((linkData, index) => {
                conteudo += `${index + 1}. ${linkData.link}\n`;
                conteudo += `   📅 ${linkData.data}\n`;
                conteudo += `   👤 ${linkData.remetente}\n`;
                conteudo += `   💬 ${linkData.grupo}\n`;
                conteudo += `   ⏰ ${linkData.timestamp}\n\n`;
            });
            
            conteudo += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n📢 VG Anúncios - Sistema de Coleta Automática\n🔗 Links coletados automaticamente de conversas\n📱 Bot desenvolvido para análise de grupos`;

            // Salvar arquivo
            try {
                fs.writeFileSync(exportPath, conteudo, 'utf8');
                
                // Enviar arquivo
                await sock.sendMessage(message.key.remoteJid, {
                    document: fs.readFileSync(exportPath),
                    fileName: exportFileName,
                    mimetype: 'text/plain',
                    caption: `📤 EXPORTAÇÃO CONCLUÍDA\n━━━━━━━━━━━━━━━━━━━━━━━━━\n\n✅ ${links.length} links exportados\n📄 Arquivo: ${exportFileName}\n📅 ${new Date().toLocaleString('pt-BR')}\n\n📋 ESTATÍSTICAS:\n• Links únicos coletados\n• Organizados por data\n• Com informações completas\n\n📢 VG Anúncios - Exportação`
                });
                
                // Remover arquivo temporário após envio
                setTimeout(() => {
                    try {
                        if (fs.existsSync(exportPath)) {
                            fs.unlinkSync(exportPath);
                        }
                    } catch (e) {
                        console.error('Erro ao remover arquivo temporário:', e);
                    }
                }, 10000); // Remove após 10 segundos
                
            } catch (error) {
                console.error('Erro ao criar arquivo de exportação:', error);
                await safeSendMessage(sock, message.key.remoteJid, {
                    text: '❌ Erro ao criar arquivo de exportação.'
                });
            }
            
        } catch (error) {
            console.error('Erro no comando exportarlinks:', error);
            await safeSendMessage(sock, message.key.remoteJid, {
                text: '❌ Erro interno no comando.'
            });
        }
    }
};