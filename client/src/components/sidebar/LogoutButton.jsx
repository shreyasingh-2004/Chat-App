import { BiLogOut } from "react-icons/bi";
import useLogout from "../../hooks/useLogout";

const LogoutButton = () => {
	const { logout, loading } = useLogout();
	
	return (
		<button 
			className="btn btn-sm btn-circle btn-ghost text-red-500 hover:bg-red-500/10" 
			onClick={logout}
			disabled={loading}
		>
			{loading ? (
				<span className="loading loading-spinner loading-sm"></span>
			) : (
				<BiLogOut size={20} />
			)}
		</button>
	);
};

export default LogoutButton;