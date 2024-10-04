import jwt from "jsonwebtoken";
import bcrypt from 'bcryptjs';
import sharp from "sharp";

import  { dbMethods, dbModels } from './index.js';

export const successRes = (msg, data, code = 200) => {
    return {
        flag: true,
        message: msg,
        data: data,
        code: code
    }
}

export const errorRes = (msg, error, code = 400) => {
    return {
        flag: false,
        message: msg,
        error: error,
        code: code
    }
}


export const jwtSign = async (payload) => {
    if (payload.email === "hpt123@gmail.com") {
        console.log("Token experies in 1m for hpt123@gmail.com")
        return await jwt.sign(payload,
            process.env.JWT_SECRET,
            { expiresIn: "1m" })

    } else {
        return await jwt.sign(payload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRY })
    }
}

export const jwtVerify = async (token) => {
    return await jwt.verify(token, process.env.JWT_SECRET)
}


export const bcryptHash = (password) => {
    return bcrypt.hashSync(password, 10)
}

export const bcryptCompare = (password, hash) => {
    return bcrypt.compareSync(password, hash)
}

export const generateRandomCN = () => {
    var cn = "CN";
    for (var i = 0; i < 6; i++) {
        cn += Math.floor(Math.random() * 10); // Generate a random number between 0 and 9
    }
    return cn;
}

export const generateUniqueCustomerCode = async () => {
    try {
        let customerCode = this.generateRandomCN();
        let checkAlreadyAvail = await dbMethods.findOne({
            collection: dbModels.User,
            query: { customerCode: customerCode }
        });
        if (checkAlreadyAvail) {
            // If the customer code already exists, generate a new one recursively
            return generateUniqueCustomerCode();
        } else {
            // If the customer code is unique, return it
            return customerCode;
        }
    } catch (error) {
        console.log(error);
        return false
    }
}

export const imageOptimized = async ( buffer, width = 800, height = 800, fit = 'inside', formate = 'jpeg', quality = 80) => {
    const  otimizedImageBuffer = await sharp(buffer)
    .resize(width, height, fit)
    .toFormat(formate, quality ).toBuffer();
    return otimizedImageBuffer;
}

