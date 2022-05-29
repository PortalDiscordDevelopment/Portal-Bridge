// Imports
const { fetch } = require('undici');
const io = require('socket.io-client');
const config = require('./config');

// Construct socket.io instance
const sock = io(config.apiURI + '/', {
	auth: {
		token: config.token,
		name: "YourApps",
		platform: "NodeJS",
		platformVersion: process.version
	},
	rejectUnauthorized: false
});

// Add listener for events from the server
sock.on('')

// Add handler for once the socket connects
sock.on('connect', async () => {
	console.log('Connected to socket server');

	// Generate and send a random guild count
	const n = Math.floor(Math.random() * (1000 - 20) + 20);
	console.log(`Emitting guild count (${n})`);
	sock.emit('guildCount', n);

	const token = await emitPromise(sock, 'getToken');
	console.log(`Recieved token ${token}`);
	console.log('Fetching status with bot token in 5s');
	await new Promise((r) => setTimeout(r, 5000));
	console.log(
		await fetch(`${config.apiURI}/status/YourApps-TS`, {
			method: 'GET',
			headers: {
				Authorization: `Bot ${token}`
			}
		}).then((r) => r.json())
	);
});
sock.on('connect_error', (e) => {
	console.error(e);
});
