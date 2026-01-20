import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { prisma } from './db';

const app = express();

import { router } from './routes';

app.use(cors());
app.use(express.json());

// Basic health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

app.use('/api', router);

// TODO: Import and use routes

const PORT = process.env.PORT || 3001;

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

export { app, prisma };

