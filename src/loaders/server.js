import cors from "cors";
import routes from "../routes/index.js"


export const setupApp = (express, app) => {
    app.use(express.json())
    app.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });
    app.options('*', cors())
    app.use(express.urlencoded({ extended: false }))
    app.use(express.json())

    app.get('/', (req, res) => {
        const ip =
            req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            (req.connection.socket ? req.connection.socket.remoteAddress : null)
        const toSave = {
            ipAddress: ip,
            time: Date.now()
        }
        res.send(toSave)
    })

    app.use("/api", routes)
}