import express from "express"
import protectRoute from "../middleware/protectRoute.js"
import { createPost,deletePost,createComment,likeUnlikePost,getAllPost,getLikedPosts,getFollowingPosts,getUserPosts } from "../controllers/postController.js"
import { restrictTo } from "../middleware/restrictTo.js"

const router = express.Router()

router.get('/all', protectRoute, getAllPost)
router.get('/user/:userName', protectRoute, getUserPosts)
router.get('/following', protectRoute, getFollowingPosts)
router.get('/likes/:id', protectRoute, getLikedPosts)
router.post('/create', protectRoute, createPost)
router.post('/like/:id', protectRoute, likeUnlikePost)
router.post('/comment/:id', protectRoute, createComment)
router.delete('/:id', protectRoute, deletePost)

export default router