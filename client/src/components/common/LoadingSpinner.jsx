const LoadingSpinner = () => {
	return (
		<div className="h-screen w-screen flex items-center justify-center bg-white dark:bg-gray-900">
			<div className="flex flex-col items-center gap-3">
				<div className="w-10 h-10 border-3 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
				<p className="text-gray-600 dark:text-gray-400">Loading...</p>
			</div>
		</div>
	);
};

export default LoadingSpinner;