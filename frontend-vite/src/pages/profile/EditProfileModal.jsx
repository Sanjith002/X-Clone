import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import toast from "react-hot-toast";
import { baseUrl } from "../../constant/url";
import { useNavigate } from "react-router-dom";

const EditProfileModal = () => {
	const [formData, setFormData] = useState({
		fullName: "",
		userName: "",
		email: "",
		bio: "",
		link: "",
		newPassword: "",
		currentPassword: "",
	});

	const queryClient = useQueryClient()

	const navigate = useNavigate();

	const {data: authUser} = useQuery({
			queryKey:["authUser"],
			queryFn: async () => {
				try {
					const res = await fetch(`${baseUrl}/api/auth/me`, {
						method: "GET",
						headers: {
							"Content-Type": "application/json",
							"Authorization": `Bearer ${localStorage.getItem("token")}`
						},
					});
					const data = await res.json();
					if(data.error){
						return null
					}
					if (!res.ok) throw new Error(data.error || "Something went wrong");
					return data;
				} catch (error) {
					throw error;
				}
			},
	})

	const {mutate: updateProfile, isPending: isUpdatingProfile} = useMutation({
		mutationFn: async ({fullName, userName, email, bio, link, newPassword, currentPassword}) => {
			try {
				const res = await fetch(`${baseUrl}/api/users/update`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"Authorization": `Bearer ${localStorage.getItem("token")}`
					},
					body: JSON.stringify({
						fullName, userName, email, bio, link, newPassword, currentPassword
					})
				});
				const data = await res.json();
				if (!res.ok) throw new Error(data.error || "Something went wrong");
				return data;
			} catch (error) {
				throw error;
			}
		},
		onSuccess: (updatedUser) => {
			const previousUserName = queryClient.getQueryData(["authUser"])?.userName;
			toast.success("Profile Updated Successfully");
			Promise.all([
				queryClient.invalidateQueries({queryKey: ["userProfile"]}),
                queryClient.invalidateQueries({queryKey: ["authUser"]})
			])
			setFormData({
				fullName: "",
				userName: "",
				email: "",
				bio: "",
				link: "",
				newPassword: "",
				currentPassword: "",
			})
			document.getElementById("edit_profile_modal").close();
			if (updatedUser.userName !== previousUserName) {
				navigate(`/profile/${updatedUser.userName}`);
			}
		},
		onError: (error) => {
			toast.error(error.message)
		}
	})

	const handleInputChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	useEffect(() => {
		if(authUser){
			setFormData({
				fullName: authUser.fullName,
				userName: authUser.userName,
				email: authUser.email,
				bio: authUser.bio,
				link: authUser.link,
				newPassword: "",
				currentPassword: "",
			})
		}
	},[authUser])

	return (
		<>
			<button
				className='btn btn-outline rounded-full btn-sm bg-white text-black'
				onClick={() => document.getElementById("edit_profile_modal").showModal()}
			>
				Edit profile
			</button>
			<dialog id='edit_profile_modal' className='modal'>
				<div className='modal-box border rounded-md border-gray-700 shadow-md'>
					<h3 className='font-bold text-lg my-3'>Update Profile</h3>
					<form
						className='flex flex-col gap-4'
						onSubmit={(e) => {
							e.preventDefault();
							updateProfile(formData)
						}}
					>
						<div className='flex flex-wrap gap-2'>
							<input
								type='text'
								placeholder='Full Name'
								className='flex-1 input border border-gray-700 rounded p-2 input-md'
								value={formData.fullName}
								name='fullName'
								onChange={handleInputChange}
							/>
							<input
								type='text'
								placeholder='UserName'
								className='flex-1 input border border-gray-700 rounded p-2 input-md'
								value={formData.userName}
								name='userName'
								onChange={handleInputChange}
							/>
						</div>
						<div className='flex flex-wrap gap-2'>
							<input
								type='email'
								placeholder='Email'
								className='flex-1 input border border-gray-700 rounded p-2 input-md'
								value={formData.email}
								name='email'
								onChange={handleInputChange}
							/>
							<textarea
								placeholder='Bio'
								className='flex-1 input border border-gray-700 rounded p-2 input-md'
								value={formData.bio}
								name='bio'
								onChange={handleInputChange}
							/>
						</div>
						<div className='flex flex-wrap gap-2'>
							<input
								type='password'
								placeholder='Current Password'
								className='flex-1 input border border-gray-700 rounded p-2 input-md'
								value={formData.currentPassword}
								name='currentPassword'
								onChange={handleInputChange}
							/>
							<input
								type='password'
								placeholder='New Password'
								className='flex-1 input border border-gray-700 rounded p-2 input-md'
								value={formData.newPassword}
								name='newPassword'
								onChange={handleInputChange}
							/>
						</div>
						<input
							type='text'
							placeholder='Link'
							className='flex-1 input border border-gray-700 rounded p-2 input-md'
							value={formData.link}
							name='link'
							onChange={handleInputChange}
						/>
						<button className='btn btn-primary rounded-full btn-sm text-white'>Update</button>
					</form>
				</div>
				<form method='dialog' className='modal-backdrop'>
					<button className='outline-none'>
						{isUpdatingProfile && <LoadingSpinner size="sm" />}
						{!isUpdatingProfile && "Update"}
					</button>
				</form>
			</dialog>
		</>
	);
};
export default EditProfileModal;