import { Request, Response } from 'express';
import { Route } from '../app';
import { fetch, FormData } from 'undici';
import * as config from '../config';
import { RESTPostOAuth2AccessTokenResult } from 'discord-api-types/v10';

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

		// Construct form data for the oauth request
		const body = new FormData();
		body.append('client_id', config.clientID);
		body.append('client_secret', config.clientSecret);
		body.append('grant_type', 'authorization_code');
		body.append('code', code);
		body.append(
			'redirect_uri',
			`${req.protocol}://${req.get('host')}/oauth/callback`
		);

		// Make request
		const oauthResponse = await fetch(
			'https://discord.com/api/v10/oauth2/token',
			{
				method: 'POST',
				body,
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			}
		);

		if (oauthResponse.ok) {
			// Respond with discord's response if successful
			const response =
				(await oauthResponse.json()) as RESTPostOAuth2AccessTokenResult;
			res.header('authorization', `Bearer ${response.access_token}`);
			res.send(response);
		} else {
			// Respond with error if the request was not successful
			res.status(500);
			res.send({
				success: false,
				error: 'Internal discord error',
				errorData: await oauthResponse.json()
			});
		}
	}
}
