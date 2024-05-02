var jwt = require('jsonwebtoken');

require('dotenv').config();

const SECRET_KEY = process.env.JWT_SECRET;

const Auth = (req, res, next)=>{
    const token = req.header.authorization;
    try {
        if(!token){
            return res.status(401).json({ msg: "Access denied. No token provided." });
        }

        jwt.verify(token ,SECRET_KEY, (err,decoded)=>{
            if(err){
                return res.status(401).json({ msg: "Invalid token." });
            }

            req.user = decoded;
            next();
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Server Error" });
    }
}


module.exports = Auth;