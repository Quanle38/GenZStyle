import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './pages/home'
import Shop from './pages/shop'
import { MainLayout } from './components/layouts'
import RegisterPage from './pages/register'
import LoginPage from './pages/login'
import UserProfile from './pages/userProfile'

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout/>}>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            
          </Route>
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/user" element={<UserProfile />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
