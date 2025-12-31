module.exports = {
  command: ['menu'],
  run: async (sock, msg) => {
    sock.sendMessage(msg.key.remoteJid, {
      text: `
🤖 *EX0FALL BOT*

.alive
.ping
.menu
.profile
.plugin

🤍 Developer: DARKKING
      `.trim()
    })
  }
}
