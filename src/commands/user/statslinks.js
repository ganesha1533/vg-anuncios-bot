/**
 * 📊 ESTATÍSTICAS DE LINKS
 * Mostra estatísticas detalhadas dos links coletados
 */
const fs = require('fs');
const path = require('path');
const { safeSendMessage } = require('../../utils');

const LINKS_FILE = path.join(__dirname, '..', '..', 'database', 'links-coletados.json');

module.exports = {
    name: 'statslinks',
    aliases: ['estatisticaslinks', 'infolinks'],
    description: 'Mostra estatísticas detalhadas dos links coletados',
    usage: '/statslinks',
    category: 'user',
    
    async execute(sock, message, args) {
        try {
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
                    text: `📊 ESTATÍSTICAS - VAZIO\n━━━━━━━━━━━━━━━━━━━━━━━━━\n\n❌ Nenhum link foi coletado ainda.\n\n🔍 O sistema de coleta automática está ativo\n📋 Links serão salvos automaticamente\n📢 VG Anúncios - Coletor`
                });
            }
            
            // Calcular estatísticas
            const agora = Date.now();
            const umDia = 24 * 60 * 60 * 1000;
            const umaSemana = 7 * umDia;
            const umMes = 30 * umDia;
            
            const linksHoje = links.filter(link => agora - link.timestamp < umDia).length;
            const linksSemana = links.filter(link => agora - link.timestamp < umaSemana).length;
            const linksMes = links.filter(link => agora - link.timestamp < umMes).length;
            
            // Contar por remetente
            const porRemetente = {};
            links.forEach(link => {
                const remetente = link.remetente || 'Desconhecido';
                porRemetente[remetente] = (porRemetente[remetente] || 0) + 1;
            });
            
            // Top 5 remetentes
            const topRemetentes = Object.entries(porRemetente)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5);
            
            // Primeiro e último link
            const linksOrdenados = links.sort((a, b) => a.timestamp - b.timestamp);
            const primeiroLink = linksOrdenados[0];
            const ultimoLink = linksOrdenados[linksOrdenados.length - 1];
            
            // Criar relatório
            let relatorio = `📊 ESTATÍSTICAS DE LINKS\n━━━━━━━━━━━━━━━━━━━━━━━━━\n\n📈 RESUMO GERAL:\n• Total coletado: ${links.length} links\n• Hoje: ${linksHoje} links\n• Esta semana: ${linksSemana} links\n• Este mês: ${linksMes} links\n\n📅 PERÍODO:\n• Primeiro: ${primeiroLink ? new Date(primeiroLink.timestamp).toLocaleDateString('pt-BR') : 'N/A'}\n• Último: ${ultimoLink ? new Date(ultimoLink.timestamp).toLocaleDateString('pt-BR') : 'N/A'}\n\n👥 TOP CONTRIBUIDORES:\n`;

            topRemetentes.forEach(([remetente, quantidade], index) => {
                const emoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '👤';
                relatorio += `${emoji} ${remetente}: ${quantidade} links\n`;
            });
            
            // Média por dia
            if (linksOrdenados.length >= 2) {
                const diasTotal = Math.ceil((ultimoLink.timestamp - primeiroLink.timestamp) / umDia) || 1;
                const mediaPorDia = (links.length / diasTotal).toFixed(1);
                relatorio += `\n📊 MÉDIA: ${mediaPorDia} links/dia`;
            }
            
            relatorio += `\n\n🔄 COMANDOS:\n• /coletarlinks - Ver todos os links\n• /statslinks - Ver estatísticas\n• /exportarlinks - Exportar (dono)\n\n📢 VG Anúncios - Estatísticas`;

            await safeSendMessage(sock, message.key.remoteJid, { text: relatorio });
            
        } catch (error) {
            console.error('Erro no comando statslinks:', error);
            await safeSendMessage(sock, message.key.remoteJid, {
                text: '❌ Erro ao calcular estatísticas.'
            });
        }
    }
};