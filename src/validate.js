/**
 * Validação final dos comandos VG Anúncios
 * 
 * @author VG Team
 */
const fs = require("fs");
const path = require("path");

console.log("🏴‍☠️ VALIDAÇÃO FINAL - VG Anúncios\n");

// Lista EXATA dos comandos solicitados pelo usuário
const comandosOwnerExatos = [
  "painel", "totalcmd", "nomebot", "cache", "reiniciar", "restart",
  "gpativos", "listagp", "entrar", "gerarcodigogrupo", "sairgp", 
  "seradm", "grupos", "vencimento", "transmitir", "enviapv",
  "enviagp", "bc", "exec", "get-id", "info", "off", "on",
  "set-menu-image", "set-prefix", "bem-vindo"
];

console.log("📋 COMANDOS OWNER SOLICITADOS:");
console.log(`Total esperado: ${comandosOwnerExatos.length} comandos\n`);

const ownerDir = path.join(__dirname, "commands/owner");
const arquivosOwner = fs.readdirSync(ownerDir);

let comandosEncontrados = 0;
let comandosFaltando = [];

comandosOwnerExatos.forEach(comando => {
  const arquivo = `${comando}.js`;
  const caminhoArquivo = path.join(ownerDir, arquivo);
  
  if (fs.existsSync(caminhoArquivo)) {
    console.log(`✅ ${comando}.js`);
    comandosEncontrados++;
  } else {
    console.log(`❌ ${comando}.js - FALTANDO`);
    comandosFaltando.push(comando);
  }
});

console.log(`\n📊 RESULTADO:`);
console.log(`✅ Encontrados: ${comandosEncontrados}/${comandosOwnerExatos.length}`);
console.log(`❌ Faltando: ${comandosFaltando.length}`);

if (comandosFaltando.length > 0) {
  console.log(`\n⚠️  COMANDOS FALTANDO:`);
  comandosFaltando.forEach(cmd => console.log(`   - ${cmd}`));
}

// Verificar arquivos extras (que não foram solicitados)
console.log(`\n📁 ARQUIVOS EXTRAS NO DIRETÓRIO OWNER:`);
const arquivosExtras = arquivosOwner.filter(arquivo => {
  const nomeComando = arquivo.replace('.js', '');
  return !comandosOwnerExatos.includes(nomeComando);
});

if (arquivosExtras.length > 0) {
  arquivosExtras.forEach(arquivo => {
    console.log(`⚠️  ${arquivo} - Não estava na lista solicitada`);
  });
} else {
  console.log(`✅ Nenhum arquivo extra encontrado`);
}

// Verificar duplicatas
console.log(`\n🔍 VERIFICANDO DUPLICATAS:`);
const comandosAdmin = fs.readdirSync(path.join(__dirname, "commands/admin"));
const comandosUser = fs.readdirSync(path.join(__dirname, "commands/user"));

let duplicatasEncontradas = 0;

comandosOwnerExatos.forEach(comando => {
  const arquivo = `${comando}.js`;
  let locais = [];
  
  if (comandosAdmin.includes(arquivo)) locais.push("admin");
  if (comandosUser.includes(arquivo)) locais.push("user");
  
  if (locais.length > 0) {
    console.log(`⚠️  ${comando} também está em: ${locais.join(", ")}`);
    duplicatasEncontradas++;
  }
});

if (duplicatasEncontradas === 0) {
  console.log(`✅ Nenhuma duplicata encontrada`);
}

console.log("\n" + "=".repeat(60));
if (comandosEncontrados === comandosOwnerExatos.length && duplicatasEncontradas === 0) {
  console.log("🎉 VALIDAÇÃO COMPLETA APROVADA!");
  console.log("🏴‍☠️ Todos os comandos solicitados estão presentes!");
  console.log("✅ Nenhuma duplicata encontrada!");
} else {
  console.log("⚠️  VALIDAÇÃO PARCIAL:");
  console.log(`   ${comandosEncontrados}/${comandosOwnerExatos.length} comandos presentes`);
  if (duplicatasEncontradas > 0) {
    console.log(`   ${duplicatasEncontradas} duplicatas encontradas`);
  }
}
console.log("=".repeat(60));