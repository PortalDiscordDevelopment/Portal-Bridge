import crypto from 'crypto';

export const generateToken = () => {
	return new Promise<string>((resolve, reject) => {
		crypto.randomBytes(256, (err, buffer) => {
			if (err) {
				reject(err);
			} else {
				resolve(buffer.toString('hex'));
			}
		});
	});
};
