/**
 * Sistema de logs do VG Anúncios
 * 
 * @author VG Team
 */
const chalk = require("chalk");
const moment = require("moment-timezone");

/**
 * Formatar timestamp
 */
function timestamp() {
  return moment().tz("America/Sao_Paulo").format("DD/MM/YYYY HH:mm:ss");
}

/**
 * Log de sucesso
 */
function successLog(message) {
  console.log(chalk.green(`[${timestamp()}] ✅ ${message}`));
}

/**
 * Log de erro
 */
function errorLog(message) {
  console.log(chalk.red(`[${timestamp()}] ❌ ${message}`));
}

/**
 * Log de aviso
 */
function warningLog(message) {
  console.log(chalk.yellow(`[${timestamp()}] ⚠️ ${message}`));
}

/**
 * Log de informação
 */
function infoLog(message) {
  console.log(chalk.blue(`[${timestamp()}] ℹ️ ${message}`));
}

/**
 * Log padrão
 */
function sayLog(message) {
  console.log(chalk.white(`[${timestamp()}] 💬 ${message}`));
}

/**
 * Banner do VG Anúncios
 */
function bannerLog() {
  console.log(chalk.cyan.bold('\n🎯 VG ANÚNcios v6.4.0 🎯\n'));
}

module.exports = {
  successLog,
  errorLog,
  warningLog,
  infoLog,
  sayLog,
  bannerLog,
  timestamp
};