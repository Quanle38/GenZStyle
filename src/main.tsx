import "antd/dist/reset.css"
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import "./index.css";
import App from "./App.tsx";
import "./i18n.ts";
import { store } from "./app/store";
import { AuthProvider } from "./contexts/authContext";
import { NotificationProvider } from "./contexts/notificationContext.tsx";


createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <AuthProvider>
      <NotificationProvider>
      <App />
      </NotificationProvider>
    </AuthProvider>
  </Provider>
);
