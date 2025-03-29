import React, { useState, useRef } from "react";
import { Toast } from "primereact/toast";

const CreatePost = () => {
	const toast = useRef(null);

	const [formData, setFormData] = useState({
		title: "",
		description: "",
		files: [],
	});

	const handleFileChange = (e) => {
		setFormData({
			...formData,
			files: e.target.files,
		});
	};

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = async (e) => {
		try {
			e.preventDefault();
			const form = new FormData();
			form.append("avatar", formData.files[0]);
			form.append("type", "community");
			form.append("communityId", "67dc69c3d04f63b7827db73b");

			const response = await fetch(
				"http://localhost:3000/api/avatar/upload", {
					method: "POST",
					headers: {
						// "Content-Type": "application/json",
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
					body: form,
				}
			);

			const data = await response.json();
			console.log(data);
		} catch (e) {
			console.log(e);
			alert(e.message);
		}
	};

	return (
		<div>
			<h1>CreatePost</h1>
			<input
				type="text"
				name="title"
				value={formData.title}
				onChange={handleChange}
				placeholder="Title"
			/>
			<textarea
				name="description"
				value={formData.description}
				onChange={handleChange}
				placeholder="Description"
			></textarea>
			<input type="file" multiple onChange={handleFileChange} />
			<button onClick={handleSubmit}>Submit</button>
		</div>
	);
};

export default CreatePost;
