const axios = require('axios')
const fs = require('fs')
const path = require('path')

module.exports = async function loadGistPlugins(url) {
  try {
    const { data } = await axios.get(url)
    const name = path.basename(url)
    fs.writeFileSync(path.join(__dirname, '../plugins', name), data)
    console.log('✅ Gist plugin loaded:', name)
  } catch {
    console.log('❌ Gist load failed')
  }
}
