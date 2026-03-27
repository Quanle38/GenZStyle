import "antd/dist/reset.css"
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import "./index.css";
import App from "./App.tsx";
import "./i18n.ts";
import { store } from "./app/store";
import { AuthProvider } from "./contexts/authContext";
import { Toaster } from "react-hot-toast";



createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <AuthProvider>
      <App />
      <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#140f2a",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.1)"
            }
          }}
        />
    </AuthProvider>
  </Provider>
);
