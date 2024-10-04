import { helperUtils, dbMethods, dbModels } from "../utils/index.js";
import  constants  from "../utils/constants.js"
const { HttpStatus } = constants;

export const auth = async (req, res, next) => {
    try {
        const token = req.header("Authorization");
        if (!token) return res.status(HttpStatus.UNAUTHORIZED).send(helperUtils.errorRes("Access Denied No Token Found", {}, 401));
        let payload = await helperUtils.jwtVerify(token)
        if (!payload) return res.status(HttpStatus.UNAUTHORIZED).send(helperUtils.errorRes("Invalid Auth token", {}, 401));
        req.user = payload
        next()
    } catch (error) {
        console.log(error);
        return res.status(HttpStatus.UNAUTHORIZED).send(helperUtils.errorRes("Invalid Token", {}, 401))
    }
}
