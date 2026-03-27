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
import PaymentPage from './pages/payment'
import AccountManagement from './components/accountManagement'
import OrderHistoryPage from './pages/orderHistory'
import CouponManagement from './components/couponManagement'
import AdminLayout from './components/layouts/adminLayout'
import OverViewPage from './pages/overView'
import OrderManagement from './components/orderManagement'
import ConditionSetManagement from './components/conditionSetManagement'
import ProductManagement from './components/productManagement'


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
          <Route path="/history" element={<OrderHistoryPage/>} />

          
          <Route path='/admin' element={<AdminLayout />}>
          <Route path="overview" element={<OverViewPage/>} />
          <Route path="coupon" element={<CouponManagement/>} />
          <Route path="account" element={<AccountManagement/>} />
          <Route path="order" element={<OrderManagement/>} />
          <Route path="condition" element={<ConditionSetManagement/>} />
          <Route path="product" element={<ProductManagement/>} />



          </Route>

          
          <Route element={<ProtectedRoute/>}>
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/payment" element={<PaymentPage />} />

          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
