export const formatDate = (dateString) => {
	const date = new Date(dateString);
	const now = new Date();
	const diffTime = Math.abs(now - date);
	const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
	const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
	const diffMinutes = Math.floor(diffTime / (1000 * 60));

	if (diffDays > 0) {
		return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
	} else if (diffHours > 0) {
		return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
	} else {
		return diffMinutes === 0
			? "just now"
			: `${diffMinutes} minutes ago`;
	}
};

export const formatNumber = (num) => {
	if (!num) return 0;
	if (Array.isArray(num)) return num.length;

	if (num >= 1000) {
		return (num / 1000).toFixed(1) + "k";
	}
	return num;
};

export const getAttachmentUrl = (attachmentId) => {
	return `${
		import.meta.env.VITE_BACKEND_URL
	}/api/attachments/${attachmentId}`;
};

