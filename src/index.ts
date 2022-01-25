import { DataTypes, Sequelize } from 'sequelize';
import { HttpHandler } from './app';
import { WebsocketHandler } from './ws';
import * as config from './config';
import { Error } from './models/Error';
import { Bot } from './models/Bot';

(async () => {
	console.log('Connecting to database...');
	const db = new Sequelize({
		database: 'bridge',
		username: config.db.username,
		password: config.db.password,
		host: config.db.host,
		port: config.db.port,
		dialect: 'postgres'
	});
	Error.init(
		{
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true
			},
			stack: {
				type: DataTypes.STRING,
				allowNull: false,
				primaryKey: false
			},
			user: {
				type: DataTypes.STRING,
				allowNull: false,
				primaryKey: false
			},
			guild: {
				type: DataTypes.STRING,
				allowNull: false,
				primaryKey: false
			},
			channel: {
				type: DataTypes.STRING,
				allowNull: false,
				primaryKey: false
			},
			message: {
				type: DataTypes.STRING,
				allowNull: false,
				primaryKey: false
			},
			bot: {
				type: DataTypes.STRING,
				allowNull: false,
				primaryKey: false
			}
		},
		{ sequelize: db }
	);
	Bot.init({
		name: {
			type: DataTypes.STRING,
			allowNull: false,
			primaryKey: true
		},
		guildCount: {
			type: DataTypes.INTEGER,
			allowNull: true,
			primaryKey: false
		}
	}, { sequelize: db })
	await db.sync({ alter: true });
	await db.authenticate();
	console.log('Initializing webserver...');
	const httpHandler = new HttpHandler();
	await httpHandler.registerRoutes();
	console.log('Initializing websocket...');
	const wsHandler = new WebsocketHandler();
	wsHandler.initWebsocket(httpHandler.server);
	console.log('Starting webserver...');
	const server = httpHandler.startServer();
	server.on('listening', () => console.log('Webserver started!'));
})();
