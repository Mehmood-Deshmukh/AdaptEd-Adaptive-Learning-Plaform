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
            form.append("avatar", formData.files[0]);
            form.append("type", "user");

            const response = await fetch("http://localhost:3000/api/avatar/delete", {
                method: "POST",
                body: JSON.stringify({
                    type: "user",
                }
                ),
                headers: { 
                    "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2QwYWE4ZmY3OTQ0OGY0MjBlYTU1NGEiLCJyb2xlIjoidXNlciIsImlhdCI6MTc0MzEwODc0OCwiZXhwIjoxNzQzMTEyMzQ4fQ.M45i6r4G17qop3jy0TfMKj3wTN9sGJsNkTJq19STakI`,
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
