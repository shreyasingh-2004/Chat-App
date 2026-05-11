import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthContext } from "./context/AuthContext";
import LoadingSpinner from "./components/common/LoadingSpinner";

// Lazy load pages
const Home = lazy(() => import("./pages/home/Home"));
const Login = lazy(() => import("./pages/login/Login"));
const SignUp = lazy(() => import("./pages/signup/SignUp"));

function App() {
	const { authUser } = useAuthContext();

	return (
		<div className="h-screen w-screen overflow-hidden">
			<Suspense fallback={<LoadingSpinner />}>
				<Routes>
					<Route path="/" element={authUser ? <Home /> : <Navigate to="/login" />} />
					<Route path="/login" element={!authUser ? <Login /> : <Navigate to="/" />} />
					<Route path="/signup" element={!authUser ? <SignUp /> : <Navigate to="/" />} />
				</Routes>
			</Suspense>
		</div>
	);
}

export default App;