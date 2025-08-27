import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './pages/home'
import Shop from './pages/shop'
import { MainLayout } from './components/layouts'

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout/>}>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
