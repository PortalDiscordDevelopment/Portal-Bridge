import { Request, Response } from 'express';
import { Route } from '../app';
import got, { HTTPError } from 'got';
import * as config from '../config';
import { RESTPostOAuth2AccessTokenResult } from 'discord-api-types';

export default class Oauth2 extends Route {
	public override path = '/oauth/callback';
	public async get(req: Request, res: Response) {
		const code = req.query.code as string | undefined;
		if (!code) {
			res.status(400);
			res.send({
				success: false,
				erorr: 'No ouath code given'
			});
			return;
		}
		const uri = `${req.protocol}://${req.get('host')}/oauth/callback`;
		try {
			const oauthResponse: RESTPostOAuth2AccessTokenResult = await got
				.post('https://discord.com/api/v9/oauth2/token', {
					form: {
						client_id: config.clientID,
						client_secret: config.clientSecret,
						grant_type: 'authorization_code',
						code,
						redirect_uri: uri
					}
				})
				.json();
			res.header('authorization', `Bearer ${oauthResponse.access_token}`);
			res.send(oauthResponse);
		} catch (e) {
			res.status(500);
			res.send({
				success: false,
				error: 'Internal discord error',
				errorData: (e as HTTPError).response.body
			});
		}
	}
}
