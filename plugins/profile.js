const PhoneNumber = require('awesome-phonenumber')
const levelling = require('../lib/levelling')

module.exports = {
  command: ['profile'],
  run: async (sock, msg) => {
    let who = msg.key.participant || msg.key.remoteJid
    let pp
    try {
      pp = await sock.profilePictureUrl(who, 'image')
    } catch {
      pp = './src/avatar_contact.png'
    }

    const { min, xp } = levelling.xpRange(2)
    const num = who.replace('@s.whatsapp.net', '')

    const text = `
Name: User
Number: ${PhoneNumber('+' + num).getNumber('international')}
XP: 250 (${250 - min}/${xp})
Level: 2
Role: Beginner
`.trim()

    sock.sendMessage(msg.key.remoteJid, {
      image: { url: pp },
      caption: text
    })
  }
        }
