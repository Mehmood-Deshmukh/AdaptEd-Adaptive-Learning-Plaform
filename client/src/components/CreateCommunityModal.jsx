import React, { useState, useRef, useEffect } from "react";
import useAuthContext from "../hooks/useAuthContext";
import { useNavigate } from "react-router-dom";
import { Toast } from "primereact/toast";

const CreateCommunityModal = ({ commnunities, setCommunities }) => {
	const navigate = useNavigate();
	const toast = useRef(null);
	const [isOpen, setIsOpen] = useState(false);
	const { state } = useAuthContext();
	const { user } = state;

	const [formData, setFormData] = useState({
		name: "",
		description: "",
		domain: "",
		tags: [],
		dominentCluster: user?.clusterId || "",
	});

	const [currentTag, setCurrentTag] = useState("");
	const modalContentRef = useRef(null);

	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "auto";
		}
		return () => {
			document.body.style.overflow = "auto";
		};
	}, [isOpen]);

	const handleOpenModal = () => setIsOpen(true);
	const handleCloseModal = () => setIsOpen(false);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
	};

	const addTag = (tag) => {
		if (tag.trim() && !formData.tags.includes(tag.trim())) {
			setFormData({
				...formData,
				tags: [...formData.tags, tag.trim()],
			});
		}
	};

	const handleTagKeyDown = (e) => {
		if (e.key === "Enter" && currentTag.trim()) {
			e.preventDefault();
			addTag(currentTag);
			setCurrentTag("");
		}
	};

	const handleTagInputChange = (e) => {
		const value = e.target.value;

		if (value.includes(",")) {
			const parts = value.split(",");
			const newTag = parts[0].trim();

			if (newTag) {
				addTag(newTag);
			}

			setCurrentTag(parts.slice(1).join(","));
		} else {
			setCurrentTag(value);
		}
	};

	const removeTag = (tagToRemove) => {
		setFormData({
			...formData,
			tags: formData.tags.filter((tag) => tag !== tagToRemove),
		});
	};

	const handleSubmit = async (e) => {
		try {
			e.preventDefault();

			const dataToSend = {
				...formData,
				dominentCluster: user?.clusterId || formData.dominentCluster,
			};

			const response = await fetch(
				`${import.meta.env.VITE_BACKEND_URL}/api/community/create`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${localStorage.getItem(
							"token"
						)}`,
					},
					body: JSON.stringify(dataToSend),
				}
			);

			const data = await response.json();

			if (data.success) {
				toast.current.show({
					severity: "success",
					summary: "Success",
					detail: data.message,
				});
				// navigate(`/community/${data.data._id}`);
				setCommunities([data.data, ...commnunities]);
			} else {
				toast.current.show({
					severity: "error",
					summary: "Error",
					detail: data.message || "Failed to create community",
				});
			}
		} catch (e) {
			console.error(e);
			toast.current.show({
				severity: "error",
				summary: "Error",
				detail: "An unexpected error occurred",
			});
		} finally {
			setFormData({
				name: "",
				description: "",
				domain: "",
				tags: [],
				dominentCluster: user?.clusterId || "",
			});
			setCurrentTag("");
			handleCloseModal();
		}
	};

	const handleOutsideClick = (e) => {
		if (
			modalContentRef.current &&
			!modalContentRef.current.contains(e.target)
		) {
			handleCloseModal();
		}
	};

	if (!isOpen) {
		return (
			<button
				onClick={handleOpenModal}
				className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
			>
				Create Community
			</button>
		);
	}

	return (
		<div
			className="fixed inset-0 flex items-center justify-center p-4 z-50"
			onClick={handleOutsideClick}
			style={{
				backgroundColor: "rgba(0, 0, 0, 0.4)",
				backdropFilter: "blur(5px)",
			}}
		>
			<Toast ref={toast} />
			<div
				ref={modalContentRef}
				className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-auto max-h-[90vh] overflow-hidden flex flex-col"
				style={{
					boxShadow:
						"0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
				}}
			>
				<div className="py-4 px-6 border-b border-gray-200 flex justify-between items-center">
					<h2 className="text-xl font-semibold text-black">
						Create New Community
					</h2>
					<button
						onClick={handleCloseModal}
						className="text-black hover:text-gray-700 transition-colors"
						aria-label="Close modal"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<line x1="18" y1="6" x2="6" y2="18"></line>
							<line x1="6" y1="6" x2="18" y2="18"></line>
						</svg>
					</button>
				</div>

				<div className="overflow-y-auto flex-grow p-0">
					<form onSubmit={handleSubmit} className="p-6">
						<div className="mb-5">
							<label className="block text-black text-sm font-medium mb-2">
								Community Name
							</label>
							<input
								type="text"
								name="name"
								value={formData.name}
								onChange={handleInputChange}
								className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black"
								placeholder="Enter community name"
								required
							/>
						</div>

						<div className="mb-5">
							<label className="block text-black text-sm font-medium mb-2">
								Description
							</label>
							<textarea
								name="description"
								value={formData.description}
								onChange={handleInputChange}
								rows={4}
								className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black"
								placeholder="Enter community description"
								required
							/>
						</div>

						<div className="mb-5">
							<label className="block text-black text-sm font-medium mb-2">
								Domain
							</label>
							<input
								type="text"
								name="domain"
								value={formData.domain}
								onChange={handleInputChange}
								className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black"
								placeholder="Enter domain (e.g., Technology, Health, Education)"
								required
							/>
						</div>

						<div className="mb-5">
							<label className="block text-black text-sm font-medium mb-2">
								Tags
							</label>
							<div className="flex flex-wrap gap-2 mb-2">
								{formData.tags.map((tag, index) => (
									<div
										key={index}
										className="flex items-center bg-gray-100 px-3 py-1 rounded-full"
									>
										<span className="text-sm text-black mr-2">
											{tag}
										</span>
										<button
											type="button"
											onClick={() => removeTag(tag)}
											className="text-gray-500 hover:text-black transition-colors"
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="16"
												height="16"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
											>
												<line
													x1="18"
													y1="6"
													x2="6"
													y2="18"
												></line>
												<line
													x1="6"
													y1="6"
													x2="18"
													y2="18"
												></line>
											</svg>
										</button>
									</div>
								))}
							</div>
							<input
								type="text"
								value={currentTag}
								onChange={handleTagInputChange}
								onKeyDown={handleTagKeyDown}
								className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black"
								placeholder="Type tag and press Enter or add comma to separate tags"
							/>
						</div>

						<div className="flex justify-end mt-6 space-x-3">
							<button
								type="button"
								onClick={handleCloseModal}
								className="px-5 py-2 border border-gray-300 text-black rounded-md hover:bg-gray-50 transition-colors font-medium"
							>
								Cancel
							</button>
							<button
								type="submit"
								className="px-5 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors font-medium"
							>
								Create Community
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default CreateCommunityModal;
