import express from 'express';
// const app = express();
import http from 'http';
import  connectToDatabase  from './loaders/database.js';
import { setupApp } from './loaders/server.js';
// const server = http.createServer(app);
import { app, server } from './socket/socket.js';

import 'dotenv/config';
const port = process.env.PORT;
connectToDatabase();
setupApp(express, app);


server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})
