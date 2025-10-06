const fs = require('fs');
const path = require('path');
const { safeSendMessage } = require('../../utils');

module.exports = {
    name: 'backup',
    description: 'Fazer backup do banco de dados',
    usage: '/backup',
    category: 'owner',
    
    async execute(sock, message, messageText, phoneNumber) {
        try {
            await safeSendMessage(sock, phoneNumber, { 
                text: '⏳ Gerando backup...' 
            });
            
            const databasePath = path.join(__dirname, '../../database');
            const backupPath = path.join(databasePath, 'backups');
            
            if (!fs.existsSync(backupPath)) {
                fs.mkdirSync(backupPath, { recursive: true });
            }
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupFile = path.join(backupPath, `backup-${timestamp}.json`);
            
            const databases = {};
            const files = fs.readdirSync(databasePath).filter(f => f.endsWith('.json') && f !== 'backups');
            
            files.forEach(file => {
                try {
                    const data = JSON.parse(fs.readFileSync(path.join(databasePath, file), 'utf8'));
                    databases[file] = data;
                } catch (error) {
                    console.error(`Erro ao ler ${file}:`, error);
                }
            });
            
            fs.writeFileSync(backupFile, JSON.stringify(databases, null, 2));
            
            await safeSendMessage(sock, phoneNumber, { 
                text: `✅ Backup criado!\n\n📁 Arquivo: backup-${timestamp}.json\n📊 Bancos: ${files.length}\n⏰ Data: ${new Date().toLocaleString('pt-BR')}` 
            });
            
        } catch (error) {
            console.error('Erro BACKUP:', error);
            await safeSendMessage(sock, phoneNumber, { 
                text: '❌ Erro ao gerar backup.' 
            });
        }
    }
};