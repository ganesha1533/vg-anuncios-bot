#!/usr/bin/env node

/**
 * Script de Configuração Inicial - VG Anúncios Bot
 * 
 * Este script ajuda na configuração inicial do bot WhatsApp
 * Configure seu número de dono, prefixo e outras opções básicas
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');
const { existsSync } = require('fs');

class BotSetup {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        this.configPath = path.join(__dirname, 'src', 'config.js');
        this.ownerPath = path.join(__dirname, 'database', 'owner.json');
    }

    async iniciar() {
        console.log(`
╔══════════════════════════════════════════════════════════╗
║               🤖 VG ANÚNCIOS BOT SETUP 🤖               ║
║                                                          ║
║        Configuração inicial do seu bot WhatsApp         ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝

Bem-vindo! Vamos configurar seu bot em alguns passos simples.

IMPORTANTE:
• Use o número com código do país (ex: 5511999999999)
• Não use espaços, traços ou parênteses
• Certifique-se de ter acesso ao WhatsApp do número informado

`);

        try {
            const config = await this.coletarInformacoes();
            await this.salvarConfiguracoes(config);
            await this.criarArquivosDiretorio();
            
            console.log(`
╔══════════════════════════════════════════════════════════╗
║                    ✅ SETUP CONCLUÍDO! ✅               ║
╚══════════════════════════════════════════════════════════╝

🎉 Configuração realizada com sucesso!

📋 PRÓXIMOS PASSOS:
1. Execute: npm install (para instalar dependências)
2. Execute: npm start (para iniciar o bot)
3. Escaneie o QR Code com seu WhatsApp
4. Pronto! Seu bot estará funcionando

💡 DICAS:
• Use /menu para ver todos os comandos
• Use /painel para ver informações do bot
• Adicione o bot em grupos e use /ativar com códigos

🏴‍☠️ VG Anúncios - Bot Profissional
            `);

        } catch (error) {
            console.error('❌ Erro durante a configuração:', error.message);
        } finally {
            this.rl.close();
        }
    }

    async pergunta(texto) {
        return new Promise((resolve) => {
            this.rl.question(texto, resolve);
        });
    }

    async coletarInformacoes() {
        const config = {};

        // Número do dono
        while (!config.ownerNumber) {
            const numero = await this.pergunta('📱 Digite o número do DONO do bot (ex: 5511999999999): ');
            
            if (this.validarNumero(numero)) {
                config.ownerNumber = numero;
                console.log('✅ Número válido!');
            } else {
                console.log('❌ Número inválido! Use apenas números com código do país.');
            }
        }

        // Nome do dono
        config.ownerName = await this.pergunta('👤 Digite o NOME do dono do bot: ') || 'VG Owner';

        // Prefixo
        let prefixo;
        while (!prefixo) {
            prefixo = await this.pergunta('⚡ Digite o PREFIXO dos comandos (ex: /, !, #): ') || '/';
            
            if (prefixo.length === 1) {
                config.prefix = prefixo;
                console.log(`✅ Prefixo definido: ${prefixo}`);
                break;
            } else {
                console.log('❌ Use apenas 1 caractere para o prefixo!');
                prefixo = null;
            }
        }

        return config;
    }

    validarNumero(numero) {
        const numeroLimpo = numero.replace(/\D/g, '');
        return numeroLimpo.length >= 10 && numeroLimpo.length <= 15;
    }

    async salvarConfiguracoes(config) {
        console.log('\n📝 Salvando configurações...');
        await this.atualizarConfig(config);
        await this.criarOwnerJson(config);
        console.log('✅ Configurações salvas!');
    }

    async atualizarConfig(config) {
        const configContent = `/**
 * Configurações do VG Anúncios Bot
 * Editado através do setup inicial
 */

module.exports = {
    // Configurações básicas
    PREFIX: '${config.prefix}',
    OWNER_NUMBER: '${config.ownerNumber}@s.whatsapp.net',
    OWNER_NAME: '${config.ownerName}',
    
    // Bot info
    BOT_NAME: 'VG Anúncios',
    BOT_VERSION: '6.4.0',
    
    // URLs e links
    GITHUB_REPO: 'https://github.com/ganesha1533/vg-anuncios-bot',
};
`;

        const configDir = path.dirname(this.configPath);
        if (!existsSync(configDir)) {
            fs.mkdirSync(configDir, { recursive: true });
        }
        
        fs.writeFileSync(this.configPath, configContent, 'utf8');
    }

    async criarOwnerJson(config) {
        const ownerData = {
            number: config.ownerNumber + '@s.whatsapp.net',
            name: config.ownerName,
            setupDate: new Date().toISOString(),
            isActive: true
        };

        const dbDir = path.dirname(this.ownerPath);
        if (!existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }

        fs.writeFileSync(this.ownerPath, JSON.stringify(ownerData, null, 4), 'utf8');
    }

    async criarArquivosDiretorio() {
        const dirs = [
            path.join(__dirname, 'database'),
            path.join(__dirname, 'assets', 'auth'),
            path.join(__dirname, 'assets', 'temp'),
            path.join(__dirname, 'src', 'commands', 'owner'),
            path.join(__dirname, 'src', 'commands', 'admin'),
            path.join(__dirname, 'src', 'commands', 'user')
        ];
        
        dirs.forEach(dir => {
            if (!existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });

        console.log('📁 Estrutura de diretórios criada!');
    }
}

// Executar setup se chamado diretamente
if (require.main === module) {
    const setup = new BotSetup();
    setup.iniciar().catch(console.error);
}

module.exports = BotSetup;