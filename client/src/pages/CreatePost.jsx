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
        try{
            e.preventDefault();
            const form = new FormData();
            form.append("title", formData.title);
            form.append("description", formData.description);
            form.append("author", "67db126420c33211e0b1d722")
            for (let i = 0; i < formData.files.length; i++) {
                form.append("attachments", formData.files[i]);
            }

            const response = await fetch("http://localhost:3000/api/post/create", {
                method: "POST",
                body: form,
                headers: { 
                    "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2RiMTI2NDIwYzMzMjExZTBiMWQ3MjIiLCJpYXQiOjE3NDI0NTk0NTQsImV4cCI6MTc0MjQ2MzA1NH0.ppRZSTVJ7VWkVwM284vcXwX58scFE34sEh945c8FlUA`,
                }
            });
            
            const data = await response.json();
            console.log(data);

        }catch(e) {
            console.log(e);
            alert(e.message);
        }
    }

	return (
		<div>
			<h1>CreatePost</h1>
			<input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Title"/>
            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" ></textarea>
            <input type="file" multiple onChange={handleFileChange} />
			<button onClick={handleSubmit}>Submit</button>
		</div>
	);
};

export default CreatePost;
