interface ClientToServerEvents {
	guildCount: (count: number) => void;
}

interface SocketData {
	bot: string;
	nodeVer: string;
}
