const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require('@whiskeysockets/baileys')

const Pino = require('pino')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

async function startEX0FALL () {
  const { state, saveCreds } = await useMultiFileAuthState('./session')

  const sock = makeWASocket({
    logger: Pino({ level: 'silent' }),
    printQRInTerminal: false,
    auth: state,
    browser: ['EX0FALL', 'Chrome', '1.0']
  })

  let pairingRequested = false

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update

    if (connection === 'connecting' && !sock.authState.creds.registered && !pairingRequested) {
      pairingRequested = true

      rl.question('Enter WhatsApp number (with country code): ', async (num) => {
        try {
          const code = await sock.requestPairingCode(num.trim())
          console.log('🔗 Pairing Code:', code)
        } catch (e) {
          console.log('❌ Pairing failed:', e.message)
        }
      })
    }

    if (connection === 'open') {
      console.log('✅ EX0FALL connected successfully')
    }

    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode
      if (reason !== DisconnectReason.loggedOut) {
        console.log('⚠️ Connection lost, reconnecting...')
        startEX0FALL()
      } else {
        console.log('❌ Logged out. Delete session and re-pair.')
      }
    }
  })

  sock.ev.on('creds.update', saveCreds)
}

startEX0FALL()
