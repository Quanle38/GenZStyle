import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import "./index.css";
import App from "./App.tsx";
import "./i18n.ts";
import { store } from "./app/store";
import { AuthProvider } from "./contexts/authContext";
import { Toaster } from "sonner";

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <AuthProvider>
      <Toaster position="top-center" richColors />
      <App />
    </AuthProvider>
  </Provider>
);
