const got = require('got');
const io = require('socket.io-client');
const config = require('./config');
const sock = io(config.apiURI + '/', {
	extraHeaders: {
		'User-Agent': `PortalBot YourApps-TS (NodeJS ${process.version})`
	},
	auth: {
		token: config.token
	},
	rejectUnauthorized: false
});
const emitPromise = (sock, event) => new Promise((resolve, reject) => {
		sock.emit(event, (data) => {
			resolve(data);
		});
		setTimeout(() => reject(new Error('Emitpromise Timeout')), 5000);
	});
sock.on('connect', async () => {
	console.log('connected');
	const n = Math.floor(Math.random() * (1000 - 20) + 20);
	console.log(`Emitting guild count (${n})`);
	sock.emit('guildCount', n);
	console.log('Requesting token for api calls');
	const token = await emitPromise(sock, 'getToken');
	console.log(`Recieved token ${token}`);
	console.log('Fetching status with bot token in 5s');
	await new Promise(r => setTimeout(r, 5000));
	console.log(
		await got.get(`${config.apiURI}/status/YourApps-TS`, {
			headers: {
				Authorization: `Bot ${token}`
			}
		}).json()
	)
});
sock.on('connect_error', (e) => {
	console.error(e);
});
