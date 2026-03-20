import Notification from "../models/notificationModel.js"
import User from "../models/userModel.js"
import bcrypt from "bcryptjs"
import cloudinary from "cloudinary"

const getProfile = async (req,res) => {
    try{
        const {userName} = req.params
        const user = await User.findOne({userName})
        if(!user){
            return res.status(404).json({error : "User not found"})
        }
        res.status(200).json(user)
    }catch(err){
        console.log(`Error in get User profile controller: ${err}`)
        res.status(500).json({error: "Internal server error"})
    }
}

const followUnfollowUser = async (req, res) => {
    try{
        const {id} = req.params
        const userToModify = await User.findById({_id : id})
        const currentUser = await User.findById({_id : req.user.id})
        if(id === req.user._id){
            return res.status(400).json({error: "you can't unfollow/follow"})
        }
        if(!userToModify || !currentUser){
            return res.status(404).json({error: "user not found"})
        }
        const isFollowing = currentUser.following.includes(id)
        if(isFollowing){
            //unfollow
            await User.findByIdAndUpdate({_id:id}, {$pull:{followers: req.user._id}})
            await User.findByIdAndUpdate({_id:req.user._id}, {$pull:{following: id}})
            res.status(200).json({message : "Unfollow Successfully"})
        }else{
            //follow
            await User.findByIdAndUpdate({_id:id}, {$push:{followers: req.user._id}})
            await User.findByIdAndUpdate({_id:req.user._id}, {$push:{following: id}})
            //send notification
            const newNotification = new Notification({
                from: req.user._id,
                to: id,
                type: "follow"
            })
            await newNotification.save()
            res.status(200).json({message : "Follow Successfully"})
        }
    }catch(err){
        console.log(`Error in follow and unfollow controller: ${err}`)
        res.status(500).json({error: "Internal server error"})
    }
}

const getSuggestedUsers = async (req,res) => {
    try{
        const userId = req.user._id
        const user = await User.findById({_id: userId}).select("-password")
        const randomUsers = await User.aggregate([
            {
                $match : {
                    _id : {$ne: userId}
                }
            },{
                $sample : {
                    size: 10
                }
            }
        ])
        const fillteredUsers = randomUsers.filter((u) => !user.following.includes(u._id))
        const suggestedUsers = fillteredUsers.slice(0,4)
        suggestedUsers.forEach((user) => (user.password = null))
        res.status(200).json(suggestedUsers)
    }catch(err){
        console.log(`Error in getSuggestedUsers controller: ${err}`)
        res.status(500).json({error: "Internal server error"})
    }
}

const updateUser = async (req,res) => {
    try{
        const userId = req.user._id
        const {userName, fullName, email, currentPassword, newPassword, bio, link} = req.body
        let {profileImg, coverImg} = req.body

        let user = await User.findById({_id:userId})
        if(!user){
            return res.status(404).json({error: "user not found"})
        }
        if((!newPassword && currentPassword) || (newPassword && !currentPassword)){
            return res.status(400).json({error: "Provide both the new password and current password"})
        }
        if(currentPassword && newPassword){
            const isMatch = await bcrypt.compare(currentPassword, user.password)
            if(!isMatch){
                return res.status(400).json({error: "Current password is incorrect"})
            }
            if(newPassword.length < 6){
                return res.status(400).json({error : "Password must have at least 6 characters"})
            }
            const salt = await bcrypt.genSalt(10)
            user.password = await bcrypt.hash(newPassword,salt)
        }

        if(profileImg){
            if(user.profileImg){
                await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0])
            }
            const uplodedResponse = await cloudinary.uploader.upload(profileImg)
            profileImg = uplodedResponse.secure_url
        }

        if(coverImg){
            if(user.coverImg){
                await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0])
            }
            const uplodedResponse = await cloudinary.uploader.upload(coverImg)
            coverImg = uplodedResponse.secure_url
        }

        user.userName = userName || user.userName
        user.fullName = fullName || user.fullName
        user.email = email || user.email
        user.bio = bio || user.bio
        user.link = link || user.link
        user.profileImg = profileImg || user.profileImg
        user.coverImg = coverImg || user.coverImg

        user = await user.save()
        user.password = null
        return res.status(200).json(user)
    }catch(err){
        console.log(`Error in updateUser controller: ${err}`)
        res.status(500).json({error: "Internal server error"})
    }
}

export { getProfile,followUnfollowUser,getSuggestedUsers,updateUser }