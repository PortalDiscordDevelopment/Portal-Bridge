const io = require("socket.io-client");
const sock = io("http://localhost:8080/", {
    query: {
        'User-Agent': `PortalBot TestBot (NodeJS ${process.version})`
    },
    rejectUnauthorized: false
})
sock.on('connect', () => {
    console.log("connected")
})
sock.on('connect_error', e => {
    console.error(e)
})
let i = 0;
setInterval(() => {
    console.log(`Emitting guild count (${i})`)
    sock.emit('guildCount', i)
    i++
}, 5000)