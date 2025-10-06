module.exports = {
    name: 'ping',
    description: 'Teste de latência',
    category: 'user',
    
    async execute(sock, message, args) {
        const groupJid = message.key.remoteJid;
        const start = Date.now();
        
        await sock.sendMessage(groupJid, { 
            text: 'Pong!' 
        });
        
        const latency = Date.now() - start;
        
        await sock.sendMessage(groupJid, { 
            text: `🏓 Pong!\nLatência: ${latency}ms\n\n📢 VG Anúncios - Sistema Online` 
        });
    }
}; 
