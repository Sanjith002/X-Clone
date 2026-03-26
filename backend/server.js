import express from "express"
import dotenv from "dotenv"
import authRoute from "./routes/authRoute.js"
import connectDB from "./db/connectDB.js"
import cookieParser from "cookie-parser"
import userRoute from "./routes/userRoute.js"
import cloudinary from "cloudinary"
import postRoute from "./routes/postRoute.js"
import notificationRoute from "./routes/notificationRoute.js"
import cors from "cors"

dotenv.config()
cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET_KEY
})

const PORT = process.env.PORT || 5000
const app = express()

app.use(cors({
    origin: "https://x-clone02.pages.dev",
    credentials: true
}))
app.use(express.urlencoded({
    extended: true,
    limit: "50mb"
}))
app.use(express.json({
    limit: "50mb"
}))
app.use(cookieParser())
app.use('/api/auth', authRoute)
app.use('/api/users', userRoute)
app.use('/api/posts', postRoute)
app.use('/api/notifications', notificationRoute)

connectDB().then(() => {
    app.listen(PORT, () => {
       console.log(`server is running on ${PORT}`)
    })
})
