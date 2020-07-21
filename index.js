import express from 'express'
import dotenvJSON from "dotenv-json";
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors'
import { UserRoute, ThemeRoute, CompanyRoute, QARoute, AreaRoute } from './routes';
import authMiddleware from "./middlewares/auth-middleware";
import InitiateMongoServer from './config/db';

const path = require('path');

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

//app.use(express.static(path.resolve('./public')));

app.use(bodyParser.json());
app.use(cookieParser());

app.use(express.static('public'))
app.use(express.static('public/uploads/'))



app.use('/privacy-policy', async (req, res) => {
    return res.sendFile(path.join(__dirname + '/privacy-policy.html'));
});
app.use('/user', UserRoute);
app.use('/qa', QARoute);
app.use('/areas', AreaRoute);

// if (process.env.NODE_ENV === 'production') {
//     // Exprees will serve up production assets
//     app.use(express.static(path.join(__dirname, 'build')));

//     // Express serve up index.html file if it doesn't recognize route
//     app.get('*', (req, res) => {
//       res.sendFile(path.join(__dirname, 'build', 'index.html'));
//     });
// }

app.listen(port,() => console.log(`Server is listening on port ${port}`));
module.exports = app;