module.exports = {
    name: 'ping',
    description: 'Verifica latência e status detalhado do bot (Owner)',
    usage: '/ping',
    category: 'owner',
    
    async execute(sock, message, args) {
        const { isOwner, getSender, safeSendMessage } = require('../../utils');
        const sender = getSender(message);
        const groupJid = message.key.remoteJid;
        
        if (!isOwner(sender)) {
            return safeSendMessage(sock, groupJid, { text: '⚠️ Apenas donos podem usar este comando!' });
        }
        
        const startTime = Date.now();
        
        try {
            // Envia mensagem inicial
            await safeSendMessage(sock, groupJid, { text: '🏃‍♂️ Calculando ping...' });
            
            const endTime = Date.now();
            const ping = endTime - startTime;
            
            // Informações do sistema
            const uptime = process.uptime();
            const memUsage = process.memoryUsage();
            
            const formatUptime = (seconds) => {
                const days = Math.floor(seconds / 86400);
                const hours = Math.floor((seconds % 86400) / 3600);
                const minutes = Math.floor((seconds % 3600) / 60);
                const secs = Math.floor(seconds % 60);
                
                return `${days}d ${hours}h ${minutes}m ${secs}s`;
            };
            
            const formatBytes = (bytes) => {
                return (bytes / 1024 / 1024).toFixed(2) + ' MB';
            };
            
            const status = ping < 100 ? '🟢 Excelente' :
                          ping < 200 ? '🟡 Bom' :
                          ping < 300 ? '🟠 Regular' : '🔴 Lento';
            
            const response = `🏓 *PING DO BOT - OWNER*\n\n⚡ *Latência:* ${ping}ms\n📊 *Status:* ${status}\n\n🖥️ *Sistema:*\n• Uptime: ${formatUptime(uptime)}\n• RAM usada: ${formatBytes(memUsage.rss)}\n• Heap usado: ${formatBytes(memUsage.heapUsed)}\n• Heap total: ${formatBytes(memUsage.heapTotal)}\n\n🤖 *Bot:*\n• Versão: VG Anúncios 1.0\n• Node.js: ${process.version}\n• Platform: ${process.platform}\n\n🌐 *Conexão:*\n• WebSocket: ${sock.ws && sock.ws.readyState === 1 ? '✅ Conectado' : '❌ Desconectado'}\n• Último ping: ${new Date().toLocaleTimeString('pt-BR')}\n\n📢 *VG Anúncios - Sistema Completo*`;

            await safeSendMessage(sock, groupJid, { text: response });
            
        } catch (error) {
            console.error('Erro ping owner:', error);
            await safeSendMessage(sock, groupJid, { text: `❌ Erro no ping: ${error.message}` });
        }
    }
};