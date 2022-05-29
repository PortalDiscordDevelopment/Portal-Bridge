export interface ClientToServerEvents {
	guildCount: (count: number) => void;
	getToken: (respond: (token: string) => void) => void;
}

export interface SocketHandshakeData {
	token: string;
	name: string;
	platform: string;
	platformVersion: string;
}

export interface SocketData extends SocketHandshakeData {
	connectedAt: Date;
}
