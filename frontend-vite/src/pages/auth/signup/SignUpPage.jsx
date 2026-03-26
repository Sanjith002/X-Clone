import { Link } from "react-router-dom";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import XSvg from "../../../components/svgs/X";

import { MdOutlineMail } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { MdPassword } from "react-icons/md";
import { MdDriveFileRenameOutline } from "react-icons/md";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { baseUrl } from "../../../constant/url"

const SignUpPage = () => {
	const [formData, setFormData] = useState({
		userName: "",
		fullName: "",
		email: "",
		password: "",
	});

	const queryClient = useQueryClient()

	const {mutate: signup, isPending, isError, error } = useMutation({
		mutationFn: async ({ userName, fullName, email, password }) => {
			try {
				const res = await fetch(`${baseUrl}/api/auth/signup`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"Accept": "application/json"
					},
					body: JSON.stringify({ userName, fullName, email, password }),
				});

				const data = await res.json();
				if (!res.ok) throw new Error(data.error || "Something went wrong");
				return data;
			} catch (error) {
				console.error(error);
				throw error;
			}
		},
		onSuccess: (data) => {
			localStorage.setItem("token", data.token)
			localStorage.setItem("user", JSON.stringify(data.user))
			toast.success("Account created successfully");
			setFormData({
				userName: "",
				fullName: "",
				email: "",
				password: "",
			})
			queryClient.invalidateQueries({
				queryKey: ["authUser"]
			})
		},
		onError: (error) => {
			toast.error(error.message)
		}
	})

	const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

	const handleSubmit = (e) => {
		e.preventDefault();
		signup(formData);
	};

	const handleInputChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	return (
		<div className='max-w-screen-xl mx-auto flex h-screen px-10'>
			<div className='flex-1 hidden lg:flex items-center  justify-center'>
				<XSvg className=' lg:w-2/3 fill-white' />
			</div>
			<div className='flex-1 flex flex-col justify-center items-center'>
				<form className='lg:w-2/3  mx-auto md:mx-20 flex gap-4 flex-col' onSubmit={handleSubmit}>
					<XSvg className='w-24 lg:hidden fill-white' />
					<h1 className='text-4xl font-extrabold text-white'>Join today.</h1>
					<div className='flex gap-4 flex-wrap'>
						<label className='input input-bordered rounded flex items-center gap-2 flex-1'>
							<FaUser />
							<input
								type='text'
								className='grow '
								placeholder='Username'
								name='userName'
								onChange={handleInputChange}
								value={formData.userName}
							/>
						</label>
						<label className='input input-bordered rounded flex items-center gap-2 flex-1'>
							<MdDriveFileRenameOutline />
							<input
								type='text'
								className='grow'
								placeholder='Full Name'
								name='fullName'
								onChange={handleInputChange}
								value={formData.fullName}
							/>
						</label>
					</div>
					<label className='input input-bordered rounded flex items-center gap-2'>
						<MdOutlineMail />
						<input
							type='email'
							className='grow'
							placeholder='Email'
							name='email'
							onChange={handleInputChange}
							value={formData.email}
						/>
					</label>
					<label className='input input-bordered rounded flex items-center gap-2'>
						<MdPassword />
						<input
							type= {showPassword ? "text" : "password"}
							className='grow'
							placeholder='Password'
							name='password'
							onChange={handleInputChange}
							value={formData.password}
							onFocus={() => setIsFocused(true)}
			        		onBlur={() => setIsFocused(false)}
						/>
						{isFocused && <button
              				type="button"
			        		onMouseDown={(e) => e.preventDefault()}
              				onClick={() => setShowPassword(!showPassword)}
              				className="text-md cursor-pointer"
            				>
              				{showPassword ? <FaEyeSlash /> : <FaEye />}
            			</button>}
					</label>
					<button className='btn rounded-full btn-primary text-white'>{isPending ? "Loading" : "Sign Up"}</button>
					{isError && <p className='text-red-500'>{error.message}</p>}
				</form>
				<div className='flex flex-col lg:w-2/3 gap-2 mt-4'>
					<p className='text-white text-lg'>Already have an account?</p>
					<Link to='/login'>
						<button className='btn rounded-full btn-primary text-white btn-outline w-full'>Sign in</button>
					</Link>
				</div>
			</div>
		</div>
	);
};
export default SignUpPage;