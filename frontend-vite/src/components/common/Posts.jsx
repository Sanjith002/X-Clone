import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { baseUrl } from "../../constant/url";
import { useQuery } from "@tanstack/react-query";

const Posts = ({ feedType, userName, userId }) => {

	const getPostEndPoint = () => {
		switch(feedType){
			case "forYou":
				return `${baseUrl}/api/posts/all`
			case "following":
				return `${baseUrl}/api/posts/following`
			case "posts":
				return `${baseUrl}/api/posts/user/${userName}`
			case "likes":
				return `${baseUrl}/api/posts/likes/${userId}`
			default:
				return `${baseUrl}/api/posts/all`	
		}
	}

	const POST_ENDPOINT = getPostEndPoint()

	const {data: POSTS, isLoading} = useQuery({
		queryKey: ["posts", feedType, userName, userId],
		queryFn: async () => {
			try{
				const res = await fetch(POST_ENDPOINT,{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${localStorage.getItem("token")}`
				}
			})
			const data = await res.json()
			if(!res.ok){
				throw new Error(data.error || "Something went wrong")
			}
			return data
			}catch(err){
				throw err
			}
		}
	})

	return (
		<>
			{isLoading && (
				<div className='flex flex-col justify-center'>
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			)}
			{!isLoading && POSTS?.length === 0 && <p className='text-center my-4'>No posts in this tab. Switch 👻</p>}
			{!isLoading && POSTS && (
				<div>
					{POSTS.map((post) => (
						<Post key={post._id} post={post} />
					))}
				</div>
			)}
		</>
	);
};
export default Posts;