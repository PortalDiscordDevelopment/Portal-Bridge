import { Request, Response } from "express";
import { Method, Route } from "src/app";

export default class Index extends Route {
    override path = "/"
    override async [Method.GET](req: Request, res: Response) {
        
    }
}