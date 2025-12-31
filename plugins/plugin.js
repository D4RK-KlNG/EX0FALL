const loadGistPlugins = require('../gist/loader')

module.exports = {
  command: ['plugin'],
  run: async (sock, msg, text) => {
    const link = text.split(' ')[1]
    if (!link) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: 'Usage: .plugin <raw_gist_link>'
      })
    }
    await loadGistPlugins(link)
    sock.sendMessage(msg.key.remoteJid, {
      text: '✅ Plugin added. Restart EX0FALL.'
    })
  }
}
