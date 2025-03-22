import React, { useState, useRef, useEffect } from "react";
import useAuthContext from "../hooks/useAuthContext";
import { Toast } from "primereact/toast";

/*
	bonus:- use following description to test if the create post works
	title: - how to center a div
	description: -
	i am mostly a chatgpt coder. and recently i have been trying to code on my own. but i dont understand why the fuck can't i center a div? why is it so hard? i mean i know it is meme and all, but why can't i figure it out? i feel even more stupid after knowing that it is widely popular meme. should i just give up on my degree?
	attachment:- https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.linkedin.com%2Fposts%2Fswetaupadhyay35_centering-meme-share-activity-7167162614572150784-HpYv&psig=AOvVaw0-dcTYbGEUh1k29lEmBPcl&ust=1742757593502000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCKiPmJO0nowDFQAAAAAdAAAAABAJ

	no need to thank me
*/

const CreatePostModal = () => {
	const toast = useRef(null);

	const [isOpen, setIsOpen] = useState(false);
	const { state, dispatch } = useAuthContext();
	const [formData, setFormData] = useState({
		title: "",
		description: "",
		tags: [],
		attachments: [],
		communityId: null,
	});
	const [currentTag, setCurrentTag] = useState("");
	const [previewUrls, setPreviewUrls] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [searchResults, setSearchResults] = useState([]);
	const [isSearching, setIsSearching] = useState(false);
	const [selectedCommunity, setSelectedCommunity] = useState(null);
	const modalContentRef = useRef(null);
	const searchTimeoutRef = useRef(null);

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

	useEffect(() => {
		if (searchTerm.trim() === "") {
			setSearchResults([]);
			setIsSearching(false);
			return;
		}

		setIsSearching(true);

		if (searchTimeoutRef.current) {
			clearTimeout(searchTimeoutRef.current);
		}

		searchTimeoutRef.current = setTimeout(async () => {
			try {
				const response = await fetch(
					`${
						import.meta.env.VITE_BACKEND_URL
					}/api/community/search?query=${encodeURIComponent(
						searchTerm
					)}`,
					{
						headers: {
							Authorization: `Bearer ${localStorage.getItem(
								"token"
							)}`,
						},
					}
				);
				if (!response.ok) throw new Error("Search request failed");

				const data = await response.json();
				setSearchResults(data.data);
			} catch (error) {
				console.error("Error searching communities:", error);
				setSearchResults([]);
			} finally {
				setIsSearching(false);
			}
		}, 300);

		return () => {
			if (searchTimeoutRef.current) {
				clearTimeout(searchTimeoutRef.current);
			}
		};
	}, [searchTerm]);

	const handleOpenModal = () => setIsOpen(true);
	const handleCloseModal = () => setIsOpen(false);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
	};

	const handleTagKeyDown = (e) => {
		if (e.key === "Enter" && currentTag.trim()) {
			e.preventDefault();
			setFormData({
				...formData,
				tags: [...formData.tags, currentTag.trim()],
			});
			setCurrentTag("");
		}
	};

	const removeTag = (tagToRemove) => {
		setFormData({
			...formData,
			tags: formData.tags.filter((tag) => tag !== tagToRemove),
		});
	};

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

	const removeAttachment = (indexToRemove) => {
		const updatedAttachments = formData.attachments.filter(
			(_, index) => index !== indexToRemove
		);
		setFormData({ ...formData, attachments: updatedAttachments });

		if (indexToRemove < previewUrls.length) {
			const updatedPreviews = previewUrls.filter(
				(_, index) => index !== indexToRemove
			);
			setPreviewUrls(updatedPreviews);
		}
	};

	const selectCommunity = (community) => {
		setSelectedCommunity(community);
		console.log(community);
		setFormData({ ...formData, communityId: community._id });
		setSearchTerm("");
		setSearchResults([]);
	};

	const removeCommunity = () => {
		setSelectedCommunity(null);
		setFormData({ ...formData, communityId: null });
	};

	const handleSubmit = async (e) => {
		try {
			e.preventDefault();

			if (!formData.communityId) {
				alert("Please select a community for your post");
				return;
			}

			const form = new FormData();
			form.append("title", formData.title);
			form.append("description", formData.description);
			form.append("communityId", formData.communityId);
			form.append("author", state.user._id);
			form.append("tags", formData.tags ? formData.tags : []);

			for (let i = 0; i < formData.attachments.length; i++) {
				form.append("attachments", formData.attachments[i]);
			}

			const response = await fetch(
				`${import.meta.env.VITE_BACKEND_URL}/api/post/create`,
				{
					method: "POST",
					body: form,
					headers: {
						Authorization: `Bearer ${localStorage.getItem(
							"token"
						)}`,
					},
				}
			);

			const data = await response.json();
			console.log(data.data);

			toast.current.show({
				severity: "success",
				summary: "Success",
				detail: data.message,
			});

			handleCloseModal();
		} catch (e) {
			console.error(e);
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
				Create New Post
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
						Create New Post
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
								Select Community
							</label>

							{selectedCommunity ? (
								<div className="mb-3">
									<div
										className="inline-flex items-center px-3 py-2 rounded-md bg-green-100 border border-green-200 shadow-sm"
										style={{
											boxShadow:
												"0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.14)",
										}}
									>
										<span className="font-semibold text-green-800 mr-2">
											{selectedCommunity.name}
										</span>
										<span className="text-xs text-green-600 mr-3">
											{selectedCommunity.membersCount}{" "}
											members
										</span>
										<button
											type="button"
											onClick={removeCommunity}
											className="text-green-600 hover:text-green-800 transition-colors"
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
								</div>
							) : (
								<div className="relative">
									<input
										type="text"
										value={searchTerm}
										onChange={(e) =>
											setSearchTerm(e.target.value)
										}
										className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black"
										placeholder="Search for a community..."
									/>

									{searchTerm.trim() !== "" && (
										<div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
											{isSearching ? (
												<div className="p-3 text-center text-gray-500">
													Searching...
												</div>
											) : searchResults.length > 0 ? (
												searchResults.map(
													(community) => (
														<div
															key={community._id}
															onClick={() =>
																selectCommunity(
																	community
																)
															}
															className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 flex justify-between items-center"
														>
															<div className="text-black font-medium">
																{community.name}
															</div>
															<div className="text-sm text-gray-500">
																{
																	community.membersCount
																}{" "}
																members
															</div>
														</div>
													)
												)
											) : (
												<div className="p-3 text-center text-gray-500">
													No communities found
												</div>
											)}
										</div>
									)}
								</div>
							)}
						</div>

						<div className="mb-5">
							<label className="block text-black text-sm font-medium mb-2">
								Title
							</label>
							<input
								type="text"
								name="title"
								value={formData.title}
								onChange={handleInputChange}
								className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black"
								placeholder="Enter post title"
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
								placeholder="Enter post description"
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
								onChange={(e) => setCurrentTag(e.target.value)}
								onKeyDown={handleTagKeyDown}
								className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black"
								placeholder="Type tag and press Enter"
							/>
						</div>

						<div className="mb-5">
							<label className="block text-black text-sm font-medium mb-2">
								Attachments
							</label>
							<div className="relative">
								<input
									type="file"
									onChange={handleFileChange}
									className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black"
									multiple
								/>
							</div>

							{formData.attachments.length > 0 && (
								<div className="mt-3">
									<p className="text-sm font-medium text-black mb-2">
										Attached Files:
									</p>
									<ul className="space-y-2">
										{formData.attachments.map(
											(file, index) => (
												<li
													key={index}
													className="flex items-center justify-between bg-gray-100 p-2 px-3 rounded-md"
												>
													<span className="text-sm text-black truncate max-w-xs">
														{file.name}
													</span>
													<button
														type="button"
														onClick={() =>
															removeAttachment(
																index
															)
														}
														className="text-gray-500 hover:text-black ml-2 transition-colors"
														aria-label="Remove file"
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
												</li>
											)
										)}
									</ul>
								</div>
							)}
						</div>

						{previewUrls.length > 0 && (
							<div className="mb-5">
								<label className="block text-black text-sm font-medium mb-2">
									Image Preview
								</label>
								<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
									{previewUrls.map((preview, index) => (
										<div
											key={index}
											className="border border-gray-300 rounded-md p-2 bg-gray-50 relative"
										>
											<img
												src={preview.url}
												alt={`Preview of ${preview.name}`}
												className="w-full h-40 object-contain"
											/>
											<p className="text-xs text-black mt-1 truncate">
												{preview.name}
											</p>
										</div>
									))}
								</div>
							</div>
						)}

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
								Create Post
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default CreatePostModal;
