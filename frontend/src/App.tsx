import { useApp, AppProvider } from "./context/AppContext";
import IdleScreen from "./components/IdleScreen";
import WelcomeScreen from "./components/WelcomeScreen";
import ChatScreen from "./components/ChatScreen";
import "./App.css";

function MainApp() {
  const { viewMode } = useApp();

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
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
