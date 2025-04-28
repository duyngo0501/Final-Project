import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import HomePage from "@/pages/HomePage";
import GamesPage from "@/pages/GamesPage";
import GameDetailPage from "@/pages/GameDetailPage";
import Cart from "@/pages/Cart";
import ProfilePage from "@/pages/ProfilePage";
import BlogPage from "@/pages/BlogPage";
import BlogPostDetailPage from "@/pages/BlogPostDetailPage";
import CheckoutPage from "@/pages/CheckoutPage";
import PrivateRoute from "@/components/PrivateRoute";
import MainLayout from "@/layouts/MainLayout";
import AdminLayout from "@/layouts/AdminLayout";
import AdminGamesPage from "@/pages/admin/AdminGamesPage";
import AdminUsersPage from "@/pages/admin/AdminUsersPage";
import AdminOrdersPage from "@/pages/admin/AdminOrdersPage";
import AdminPromotionsPage from "@/pages/admin/AdminPromotionsPage";
import AdminProtectedRoute from "@/components/auth/AdminProtectedRoute";

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
              <Route path="blog" element={<BlogPage />} />
              <Route path="blog/:postId" element={<BlogPostDetailPage />} />
              <Route
                path="cart"
                element={
                  <PrivateRoute>
                    <Cart />
                  </PrivateRoute>
                }
              />
              <Route
                path="checkout"
                element={
                  <PrivateRoute>
                    <CheckoutPage />
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
            </Route>

            <Route element={<AdminProtectedRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminGamesPage />} />
                <Route path="games" element={<AdminGamesPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="orders" element={<AdminOrdersPage />} />
                <Route path="promotions" element={<AdminPromotionsPage />} />
              </Route>
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
