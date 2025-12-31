// ================================
//  EX0FALL WhatsApp Bot
//  Developer : DARKKING
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

let pairingRequested = false

async function startEX0FALL () {
  const { state, saveCreds } = await useMultiFileAuthState('./session')

  const sock = makeWASocket({
    auth: state,
    logger: P({ level: 'silent' }),
    printQRInTerminal: false
  })

  sock.ev.on('creds.update', saveCreds)

  // ================================
  // CONNECTION UPDATE
  // ================================
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update

    if (connection === 'open') {
      console.log('✅ Connected to WhatsApp')

      // 🔐 REQUEST PAIRING CODE (SAFE)
      if (!state.creds.registered && !pairingRequested) {
        pairingRequested = true

        const phoneNumber = '91XXXXXXXXXX' 
        // ⬆️ CHANGE THIS

        try {
          const code = await sock.requestPairingCode(phoneNumber)
          console.log('\n🔐 Pairing Code:', code)
          console.log('👉 WhatsApp → Linked devices → Link with phone number\n')
        } catch (err) {
          console.log('❌ Pairing failed:', err.message)
        }
      }
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
      console.log('❌ Logged out. Delete session folder & restart.')
    }
  })

  // ================================
  // MESSAGE HANDLER
  // ================================
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0]
    if (!msg.message || msg.key.fromMe) return

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      ''

    const prefix = config.prefix.find(p => text.startsWith(p))
    if (!prefix) return

    const command = text.slice(prefix.length).trim().split(/ +/)[0].toLowerCase()

    const pluginsDir = path.join(__dirname, 'plugins')
    const pluginFiles = fs.readdirSync(pluginsDir)

    for (const file of pluginFiles) {
      delete require.cache[require.resolve(`./plugins/${file}`)]
      const plugin = require(`./plugins/${file}`)
      if (plugin.command.includes(command)) {
        plugin.run(sock, msg, text, prefix)
      }
    }
  })
}

startEX0FALL()
