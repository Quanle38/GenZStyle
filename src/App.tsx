import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './pages/home'
import Shop from './pages/shop'
import { MainLayout } from './components/layouts'
import RegisterPage from './pages/register'
import LoginPage from './pages/login'
import UserProfile from './pages/userProfile'
import Cart from './pages/cart'
import ProductPage from './pages/detail'
import ProtectedRoute from './routes/protectedRoute'


function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
          </Route>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/product/:id" element={<ProductPage />} />

          <Route element={<ProtectedRoute/>}>
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/cart" element={<Cart />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
