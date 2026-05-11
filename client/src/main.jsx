import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./index.css";
import { AuthContextProvider } from "./context/AuthContext";
import { SocketContextProvider } from "./context/SocketContext";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 60000,
			cacheTime: 300000,
			refetchOnWindowFocus: false,
		},
	},
});

ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<BrowserRouter>
			<QueryClientProvider client={queryClient}>
				<AuthContextProvider>
					<SocketContextProvider>
						<App />
					</SocketContextProvider>
				</AuthContextProvider>
			</QueryClientProvider>
		</BrowserRouter>
	</React.StrictMode>
);