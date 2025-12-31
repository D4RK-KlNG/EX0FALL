const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require('@whiskeysockets/baileys')

const fs = require('fs')
const path = require('path')
const P = require('pino')
const config = require('./config')
const loadGistPlugins = require('./gist/loader')

async function startEX0FALL() {
  const { state, saveCreds } = await useMultiFileAuthState('./session')

  const sock = makeWASocket({
    auth: state,
    logger: P({ level: 'silent' })
  })

  sock.ev.on('creds.update', saveCreds)

  // AUTO LOAD REMOTE PLUGIN (optional)
  // await loadGistPlugins('RAW_GIST_LINK')

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0]
    if (!msg.message || msg.key.fromMe) return

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      ''

    const prefix = config.prefix.find(p => text.startsWith(p))
    if (!prefix) return

    const command = text.slice(prefix.length).trim().split(' ')[0].toLowerCase()

    const pluginsPath = path.join(__dirname, 'plugins')
    const files = fs.readdirSync(pluginsPath)

    for (const file of files) {
      delete require.cache[require.resolve(`./plugins/${file}`)]
      const plugin = require(`./plugins/${file}`)
      if (plugin.command.includes(command)) {
        plugin.run(sock, msg, text, prefix)
      }
    }
  })

  sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
    if (connection === 'open') {
      console.log('✅ EX0FALL connected')
    }
    if (connection === 'close' &&
      lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
      startEX0FALL()
    }
  })
}

startEX0FALL()
