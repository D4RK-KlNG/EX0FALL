module.exports = {
  command: ['alive'],
  run: async (sock, msg) => {
    sock.sendMessage(msg.key.remoteJid, {
      text: '✅ EX0FALL is alive\n🤍 Developer: DARKKING'
    })
  }
}
