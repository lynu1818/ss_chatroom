import "./App.css";
import { BrowserRouter as Router } from "react-router-dom";
import Routes from "./Routes";
import { AuthProvider } from "./AuthContext";
import GlobalMessageListener from "./GlobalMessageListener";

function App() {
  return (
    <Router>
      <AuthProvider>
        <GlobalMessageListener>
          <div>
            <Routes />
          </div>
        </GlobalMessageListener>
      </AuthProvider>
    </Router>
  );
}

export default App;
