import React, { useState } from 'react';

const CreatePostModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: [],
    attachments: []
  });
  const [currentTag, setCurrentTag] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleOpenModal = () => setIsOpen(true);
  const handleCloseModal = () => setIsOpen(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault();
      setFormData({ ...formData, tags: [...formData.tags, currentTag.trim()] });
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData({ ...formData, attachments: [...formData.attachments, ...files] });
    
    // Preview for the first image
    if (files[0] && files[0].type.startsWith('image/')) {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result);
      };
      fileReader.readAsDataURL(files[0]);
    }
  };

  const removeAttachment = (indexToRemove) => {
    const updatedAttachments = formData.attachments.filter((_, index) => index !== indexToRemove);
    setFormData({ ...formData, attachments: updatedAttachments });
    
    if (indexToRemove === 0 && updatedAttachments.length > 0 && updatedAttachments[0].type.startsWith('image/')) {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result);
      };
      fileReader.readAsDataURL(updatedAttachments[0]);
    } else if (updatedAttachments.length === 0) {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder for submit function
    console.log('Submitting form data:', formData);
    handleCloseModal();
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-screen overflow-y-auto">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-black">Create New Post</h2>
          <button 
            onClick={handleCloseModal}
            className="text-black hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label className="block text-black text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="Enter post title"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-black text-sm font-medium mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="Enter post description"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-black text-sm font-medium mb-2">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <div key={index} className="flex items-center bg-gray-100 px-2 py-1 rounded-md">
                  <span className="text-sm text-black mr-1">{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-gray-500 hover:text-black"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <input
              type="text"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyDown={handleTagKeyDown}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="Type tag and press Enter"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-black text-sm font-medium mb-2">Attachments</label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              multiple
            />
            {formData.attachments.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium text-black mb-1">Attached Files:</p>
                <ul className="space-y-1">
                  {formData.attachments.map((file, index) => (
                    <li key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded-md">
                      <span className="text-sm truncate max-w-xs">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="text-gray-500 hover:text-black ml-2"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {previewUrl && (
            <div className="mb-4">
              <label className="block text-black text-sm font-medium mb-2">Preview</label>
              <img 
                src={previewUrl} 
                alt="Attachment preview" 
                className="max-w-full max-h-64 object-contain border border-gray-300 rounded-md"
              />
            </div>
          )}
          
          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 mr-2 border border-black text-black rounded-md hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              Create Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;