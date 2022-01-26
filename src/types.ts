interface ClientToServerEvents {
	guildCount: (count: number) => void;
	getToken: (respond: (token: string) => void) => void;
}

interface SocketData {
	bot: string;
	nodeVer: string;
	userAgent: string;
	token: string;
	apiToken: string;
	connectedAt: Date;
}
