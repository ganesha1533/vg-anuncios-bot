# 🚀 GUIA DE INSTALAÇÃO - VG ANÚNCIOS BOT

## ⚡ **INSTALAÇÃO RÁPIDA (5 MINUTOS)**

### **1. Pré-requisitos**
- ✅ **Node.js 18+** - [Baixar aqui](https://nodejs.org/)
- ✅ **Git** - [Baixar aqui](https://git-scm.com/)
- ✅ **WhatsApp** ativo no celular

### **2. Baixar e Instalar**
```bash
# Clonar o repositório
git clone https://github.com/ganesha1533/vg-anuncios-bot.git

# Entrar na pasta
cd vg-anuncios-bot

# Instalar dependências
npm install

# Configurar bot (IMPORTANTE!)
node setup-inicial.js

# Iniciar bot
npm start
```

### **3. Configuração Inicial**
Durante o `node setup-inicial.js` você vai configurar:

1. **📱 Número do dono:** Seu número com código do país (ex: 5511999999999)
2. **👤 Nome do proprietário:** Seu nome
3. **⚡ Prefixo:** Símbolo dos comandos (/, !, #, etc)

### **4. Conectar WhatsApp**
1. Execute `npm start`
2. Escaneie o **QR Code** com seu WhatsApp
3. Aguarde a mensagem **"Conectado!"**
4. ✅ **BOT FUNCIONANDO!**

---

## 🎮 **PRIMEIROS COMANDOS**

Após conectar, teste estes comandos:

### **No privado do bot:**
- `/menu` - Ver todos os comandos
- `/painel` - Painel administrativo (só dono)

### **Em grupos (adicione o bot e faça admin):**
- `/ativar` - Ativar bot no grupo
- `/marcar` - Marcar todos os membros
- `/welcome on` - Ativar boas-vindas

---

## 🔧 **SCRIPTS DISPONÍVEIS**

```bash
npm start          # Iniciar bot
npm run setup      # Reconfigurar bot
npm run clean      # Limpar cache
npm run backup     # Fazer backup
```

---

## ❌ **PROBLEMAS COMUNS**

### **Bot não conecta:**
```bash
npm run clean
npm install --force
npm start
```

### **Erro de permissão:**
- Certifique-se que é admin nos grupos
- Verifique se o número de dono está correto

### **QR Code não aparece:**
- Use Node.js 18+
- Feche outros bots WhatsApp
- Limpe o cache: `npm run clean`

---

## 🎯 **COMANDOS PRINCIPAIS**

### 👑 **DONO (Você)**
| Comando | Descrição |
|---------|-----------|
| `/painel` | Painel completo do bot |
| `/transmitir` | Enviar mensagem para todos os grupos |
| `/testall` | Testar bot em todos os grupos |

### 👨‍💼 **ADMINS DE GRUPO**
| Comando | Descrição |
|---------|-----------|
| `/marcar` | Marcar todos os membros |
| `/ban` | Banir usuário |
| `/welcome` | Configurar boas-vindas |

### 👤 **USUÁRIOS**
| Comando | Descrição |
|---------|-----------|
| `/menu` | Menu principal |
| `/ajuda` | Central de ajuda |

---

## 🏴‍☠️ **PARABÉNS!**

Seu **VG Anúncios Bot** está funcionando! 

**Em caso de dúvidas:**
- 🐛 [Reportar problemas](https://github.com/ganesha1533/vg-anuncios-bot/issues)
- 📖 [Documentação completa](https://github.com/ganesha1533/vg-anuncios-bot)

**Bot desenvolvido pela VG Anúncios Team** ✨