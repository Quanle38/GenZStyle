import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import userReducer from '../features/user/userSlice'
import cartReducer from '../features/cart/cartSlice'
import productReducer from '../features/product/productSlice'
import couponReducer from '../features/coupon/couponSlice'
import addressReducer from '../features/address/addressSlice'
import orderReducer from '../features/order/orderSlice'
import conditionSetReducer from '../features/conditionSet/conditionSetSlice'
import cartCouponReducer from "../features/cartCoupon/cartCouponSlice"
import historyReducer from "../features/history/historySlice"
import paymentReducer from "../features/payment/paymentSlice"
import reportReducer from "../features/report/reportSlice";



export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    cart: cartReducer,
    product: productReducer,
    coupon: couponReducer,
    address: addressReducer,
    order:   orderReducer,
    condition : conditionSetReducer,
    cartCoupon : cartCouponReducer,
    history : historyReducer,
    payment: paymentReducer,
    report: reportReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch