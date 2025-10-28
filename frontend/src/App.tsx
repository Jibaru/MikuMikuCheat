import { useApp, AppProvider } from "./context/AppContext";
import IdleScreen from "./components/screens/IdleScreen";
import WelcomeScreen from "./components/screens/WelcomeScreen";
import ChatScreen from "./components/screens/ChatScreen";
import "./App.css";

function MainApp() {
	const { viewMode } = useApp();

	const renderScreen = () => {
		switch (viewMode) {
			case "idle":
				return <IdleScreen />;
			case "recording":
				return <WelcomeScreen />;
			case "chat":
				return <ChatScreen />;
			default:
				return <div>Unknown mode</div>;
		}
	};

	return <div className={`fade-screen ${viewMode}`}>{renderScreen()}</div>;
}

export default function App() {
	return (
		<AppProvider>
			<MainApp />
		</AppProvider>
	);
}
