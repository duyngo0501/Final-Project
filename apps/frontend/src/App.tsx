import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import HomePage from "@/pages/HomePage";
import GamesPage from "@/pages/GamesPage";
import GameDetailPage from "@/pages/GameDetailPage";
import Cart from "@/pages/Cart";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ProfilePage from "@/pages/ProfilePage";
import PrivateRoute from "@/components/PrivateRoute";
import MainLayout from "@/layouts/MainLayout";

/**
 * The main application component.
 * Sets up routing with MainLayout, context providers.
 * @returns {JSX.Element} The rendered application structure.
 */
function App(): JSX.Element {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="games" element={<GamesPage />} />
              <Route path="games/:id" element={<GameDetailPage />} />
              <Route
                path="cart"
                element={
                  <PrivateRoute>
                    <Cart />
                  </PrivateRoute>
                }
              />
              <Route
                path="profile"
                element={
                  <PrivateRoute>
                    <ProfilePage />
                  </PrivateRoute>
                }
              />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
