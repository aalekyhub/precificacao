import { app } from '../server/app';

// Vercel Serverless Function Wrapper
export default async function handler(req: any, res: any) {
    return app(req, res);
}
