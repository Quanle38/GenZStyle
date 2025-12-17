import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import "./index.css";
import App from "./App.tsx";
import "./i18n.ts";
import { store } from "./app/store";
import { AuthProvider } from "./contexts/authContext"; 

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <Provider store={store}>
      <App />
    </Provider>
  </AuthProvider>
);
