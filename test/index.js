// Imports
const { fetch } = require('undici');
const { io } = require('socket.io-client');
const config = require('./config');

// Construct socket.io instance
const sock = io(config.apiURI + '/', {
	auth: {
		token: config.token,
		name: 'YourApps',
		platform: 'NodeJS',
		platformVersion: process.version
	},
	rejectUnauthorized: false
});

sock.on('query');

// Add handler for once the socket connects
sock.on('connect', async () => {
	console.log('Connected to socket server');

	// Generate and send a random guild count
	const n = Math.floor(Math.random() * (1000 - 20) + 20);
	console.log(`Emitting guild count (${n})`);
	sock.emit('guildCount', n);

	// Use discord bot token to fetch own status 3 times
	for (let i = 0; i < 3; i++) {
		console.log('Fetching status with bot token in 2s');
		await new Promise((r) => setTimeout(r, 2000));
		console.log(
			await fetch(`${config.apiURI}/status/YourApps`, {
				method: 'GET',
				headers: {
					Authorization: `Bot ${config.token}`
				}
			}).then((r) => r.json())
		);
	}
});

sock.on('connect_error', (e) => {
	console.error(e);
});
