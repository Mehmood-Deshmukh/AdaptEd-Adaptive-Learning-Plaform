import React, { useState } from "react";

const UploadAvatar = () => {
	const [formData, setFormData] = useState({ attachments: [] });
	const [previewUrls, setPreviewUrls] = useState([]);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [type, setType] = useState("user");
	const [communityId, setCommunityId] = useState("");

	// Your function for handling file changes
	const handleFileChange = (e) => {
		const files = Array.from(e.target.files);

		setFormData({
			...formData,
			attachments: [...formData.attachments, ...files],
		});

		const newPreviews = [...previewUrls];

		files.forEach((file) => {
			if (file.type.startsWith("image/")) {
				const fileReader = new FileReader();
				fileReader.onload = () => {
					newPreviews.push({
						url: fileReader.result,
						name: file.name,
					});
					setPreviewUrls([...newPreviews]);
				};
				fileReader.readAsDataURL(file);
			}
		});
	};

	const handleUpload = async () => {
		if (formData.attachments.length === 0) {
			setError("Please select at least one file.");
			return;
		}

		setLoading(true);
		setMessage("");
		setError("");

		// Convert files to base64
		const base64Files = await Promise.all(
			formData.attachments.map((file) => {
				return new Promise((resolve, reject) => {
					const reader = new FileReader();
					reader.onload = () => resolve(reader.result.split(",")[1]);
					reader.onerror = () => reject("Failed to read file");
					reader.readAsDataURL(file);
				});
			})
		);

		const payload = {
			files: base64Files, // Array of Base64 strings
			type,
			...(type === "community" && { communityId }),
		};

		try {
			const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/upload-avatar`, {
				method: "POST",
				body: JSON.stringify(payload),
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("token")}`, 
				},
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Failed to upload avatar");
			}

			setMessage("Avatar uploaded successfully!");
		} catch (err) {
			console.error("Error:", err);
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div style={{ padding: "20px" }}>
			<h2>Upload Avatar</h2>
			<input type="file" multiple onChange={handleFileChange} />
			
			<div style={{ display: "flex", marginTop: "10px" }}>
				{previewUrls.map((preview, index) => (
					<div key={index} style={{ marginRight: "10px" }}>
						<img
							src={preview.url}
							alt={preview.name}
							style={{ width: "100px", height: "100px", objectFit: "cover" }}
						/>
						<p>{preview.name}</p>
					</div>
				))}
			</div>

			<div>
				<label>Type:</label>
				<select value={type} onChange={(e) => setType(e.target.value)}>
					<option value="user">User</option>
					<option value="community">Community</option>
				</select>
			</div>

			{type === "community" && (
				<div>
					<label>Community ID:</label>
					<input
						type="text"
						value={communityId}
						onChange={(e) => setCommunityId(e.target.value)}
					/>
				</div>
			)}

			<button onClick={handleUpload} disabled={loading}>
				{loading ? "Uploading..." : "Upload"}
			</button>

			{message && <p style={{ color: "green" }}>{message}</p>}
			{error && <p style={{ color: "red" }}>{error}</p>}
		</div>
	);
};

export default UploadAvatar;
