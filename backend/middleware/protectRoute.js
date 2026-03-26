import jwt from "jsonwebtoken"
import User from "../models/userModel.js"

const protectRoute = async (req,res,next) => {
    try{
        const authHeader = req.headers.authorization

        if(!authHeader || !authHeader.startsWith("Bearer ")){
            return res.status(401).json({error:"No token provided"})
        }

        const token = authHeader.split(" ")[1]
        if(!token){
            return res.status(401).json({error:"Unauthorized: No token provided"})
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        if(!decoded){
            return res.status(400).json({error:"Unauthorized: Invalid Token"})
        }
        const user = await User.findOne({_id: decoded.userId}).select("-password")
        if(!user){
            return res.status(400).json({error:"User not found"})
        }
        req.user = user
        next()
    }catch(err){
        console.log(`Error in protectRoute middleware: ${err} `)
        res.status(500).json({error : "Internal server error"})
    }
}

export default protectRoute