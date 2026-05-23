import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./router";
import { I18nextProvider } from "react-i18next";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { CurrencyProvider } from "./contexts/CurrencyContext";
import i18n from "./i18n";

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <NotificationProvider>
          <CurrencyProvider>
            <BrowserRouter basename={__BASE_PATH__}>
              <AppRoutes />
            </BrowserRouter>
          </CurrencyProvider>
        </NotificationProvider>
      </AuthProvider>
    </I18nextProvider>
  );
}

export default App;