// ================================
//  EX0FALL WhatsApp Bot
//  Developer : DARKKING
//  Library   : Baileys (MD)
// ================================

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

// ================================
// START BOT
// ================================
async function startEX0FALL () {
  const { state, saveCreds } = await useMultiFileAuthState('./session')

  const sock = makeWASocket({
    auth: state,
    logger: P({ level: 'silent' }),
    printQRInTerminal: false // ❌ disable QR
  })

  // ================================
  // PAIRING CODE LOGIN
  // ================================
  if (!state.creds.registered) {
    const phoneNumber = '91XXXXXXXXXX' 
    // ⬆️ CHANGE THIS: countrycode + number (no +)

    const code = await sock.requestPairingCode(phoneNumber)
    console.log('\n🔐 Pairing Code:', code)
    console.log('👉 WhatsApp > Linked devices > Link with phone number\n')
  }

  sock.ev.on('creds.update', saveCreds)

  // ================================
  // MESSAGE HANDLER
  // ================================
  sock.ev.on('messages.upsert', async ({ messages }) => {
    try {
      const msg = messages[0]
      if (!msg.message || msg.key.fromMe) return

      const jid = msg.key.remoteJid

      const text =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        ''

      const prefix = config.prefix.find(p => text.startsWith(p))
      if (!prefix) return

      const command = text
        .slice(prefix.length)
        .trim()
        .split(/ +/)[0]
        .toLowerCase()

      const pluginsDir = path.join(__dirname, 'plugins')
      const pluginFiles = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'))

      for (const file of pluginFiles) {
        const filePath = `./plugins/${file}`
        delete require.cache[require.resolve(filePath)]
        const plugin = require(filePath)

        if (plugin.command && plugin.command.includes(command)) {
          await plugin.run(sock, msg, text, prefix)
        }
      }
    } catch (err) {
      console.log('❌ Message Error:', err)
    }
  })

  // ================================
  // CONNECTION HANDLER
  // ================================
  sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
    if (connection === 'open') {
      console.log('✅ EX0FALL connected successfully')
      console.log('👑 Developer: DARKKING')
    }

    if (
      connection === 'close' &&
      lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
    ) {
      console.log('⚠️ Connection lost, reconnecting...')
      startEX0FALL()
    }

    if (
      connection === 'close' &&
      lastDisconnect?.error?.output?.statusCode === DisconnectReason.loggedOut
    ) {
      console.log('❌ Logged out. Delete session & restart.')
    }
  })
}

// ================================
// RUN
// ================================
startEX0FALL()
