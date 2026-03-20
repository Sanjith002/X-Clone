import User from "../models/userModel.js"
import bcrypt from "bcryptjs"
import generateToken from "../utils/generateToken.js"

const signup = async (req,res) => {
    try {
        const {userName, fullName, email, password} = req.body
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if(!emailRegex.test(email)){
            return res.status(400).json({ error : "Invalid email format"})
        }
        const existingEmail = await User.findOne({email})
        const existingUsername = await User.findOne({userName})
        if(existingUsername){
            return res.status(400).json({error : "UserName already exists"})
        } 
        if(existingEmail){
            return res.status(400).json({error : "Email already exists"})
        } 
        if(password.length < 6){
            return res.status(400).json({error : "Password must have at least 6 characters"})
        }
        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password,salt)
        const newUser = new User({
            userName,
            fullName,
            email,
            password: hashPassword
        })

        if(newUser){
            generateToken(newUser._id, res)
            await newUser.save()
            res.status(201).json({
                id: newUser._id,
                userName: newUser.userName,
                fullName: newUser.fullName,
                email: newUser.email,
                password: newUser.password,
                followers: newUser.followers,
                following: newUser.following,
                profileImg: newUser.profileImg,
                coverImg: newUser.coverImg,
                bio: newUser.bio,
                link: newUser.link
            })
        }else{
            res.status(400).json({error: "Invalid user data"})
        }
    } catch(err) {
        console.log(`Error in signup controller : ${err}`)
        res.status(500).json({error : "Internal Server Error"})
    }
}

const login = async (req,res) => {
    try{
        const {userName, password} = req.body
        const user = await User.findOne({userName})
        const isPasswordCorrect = await bcrypt.compare(password, user?.password || "")

        if(!user || !isPasswordCorrect){
            return res.status(400).json({error: "Invalid username or password"})
        }
        generateToken(user._id, res)

        res.status(200).json({
            id: user._id,
            userName: user.userName,
            fullName: user.fullName,
            email: user.email,
            password: user.password,
            followers: user.followers,
            following: user.following,
            profileImg: user.profileImg,
            coverImg: user.coverImg,
            bio: user.bio,
            link: user.link
        })

    }catch(err){
        console.log(`Error in login controller : ${err}`)
        res.status(500).json({error: "Internal server error"})
    }
}

const logout = async (req,res) => {
    try{
        res.cookie("jwt", "" , {maxAge : 0})
        res.status(200).json({message : "Logout Successfully"})
    }catch(err){
        console.log(`Error in logout controller : ${err}`)
        res.status(500).json({error: "Internal server error"})
    }
}

const getMe = async (req,res) => {
    try{
        const user = await User.findOne({_id: req.user._id}).select("-password")
        res.status(200).json(user)
    }catch(err){
        console.log(`Error in getMe Controller : ${err}`)
        res.status(500).json({error: "Internal server error"})
    }
}

export { signup,login,logout,getMe }