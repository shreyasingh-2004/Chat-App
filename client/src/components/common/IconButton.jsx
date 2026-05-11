const IconButton = ({ icon: Icon, onClick, variant = "ghost", size = "md", className = "", disabled = false }) => {
	const sizeClasses = {
		sm: "btn-sm",
		md: "btn-md",
		lg: "btn-lg"
	};
	
	const variantClasses = {
		ghost: "btn-ghost",
		primary: "btn-primary",
		secondary: "btn-secondary",
		danger: "btn-error",
		success: "btn-success"
	};
	
	return (
		<button
			className={`btn btn-circle ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
			onClick={onClick}
			disabled={disabled}
		>
			{Icon && <Icon size={size === "sm" ? 16 : size === "md" ? 20 : 24} />}
		</button>
	);
};

export default IconButton;