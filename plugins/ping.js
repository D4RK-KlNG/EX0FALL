module.exports = {
  command: ['ping'],
  run: async (sock, msg) => {
    const start = Date.now()
    await sock.sendMessage(msg.key.remoteJid, { text: '🏓 Pong' })
    await sock.sendMessage(msg.key.remoteJid, {
      text: `⚡ Speed: ${Date.now() - start} ms`
    })
  }
      }
