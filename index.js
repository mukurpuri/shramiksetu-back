import express from 'express'
import dotenvJSON from "dotenv-json";
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors'
import { UserRoute, ThemeRoute } from './routes';
import authMiddleware from "./middlewares/auth-middleware";
import InitiateMongoServer from './config/db';
import path from 'path';

dotenvJSON({
    path: "./.env.json"
});

/* Initiating Mongo Server */
InitiateMongoServer();

/* Setting up Express App*/
const app = express();
const port = process.env.PORT || 7777;
app.use(cors());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static('public'));
app.use('/', async (req, res) => {
    return res.status(400).json({
        message: "Not found /"
    });
});
app.use('/user', UserRoute);
app.use('/theme', ThemeRoute);

if (process.env.NODE_ENV === 'production') {
    // Exprees will serve up production assets
    app.use(express.static(path.join(__dirname, 'build')));

    // Express serve up index.html file if it doesn't recognize route
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'build', 'index.html'));
    });
}
app.listen(port,() => console.log(`Server is listening on port ${port}`));
module.exports = app;