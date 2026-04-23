import { get, ref, remove, set } from "firebase/database";
import { useEffect, useRef, useState } from "react";
import { db } from "../app/firebase";

const ORDER_TIMEOUT_MS = 10 * 60 * 1000;

export const useOrderTimer = (orderId: string | null, onExpired: () => void) => {
    const [secondLeft, setSecondLeft] = useState<number>(ORDER_TIMEOUT_MS / 1000);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const onExpiredRef = useRef(onExpired);

    useEffect(() => {
        onExpiredRef.current = onExpired;
    }, [onExpired])

    const clearOrderFromFireBase = async (id : string) =>{
        await remove(ref(db, `pendingOrders/${id}`));
        localStorage.removeItem("orderCode");
        localStorage.removeItem("qrURL");
    }

    const startTimer = (expiresAt : number ) => {
        if(intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        intervalRef.current = setInterval(() => {
            const remaining = Math.floor((expiresAt - Date.now()) / 1000);
            if(remaining <= 0 ) {
                clearInterval(intervalRef.current!);
                setSecondLeft(0);
                if(orderId){
                    clearOrderFromFireBase(orderId);
                }
                onExpiredRef.current()
            }else {
                setSecondLeft(remaining);
            }
        }, 1000)
    }

    useEffect(() => {
        if(!orderId) return;
        const init = async () => {
            const snapShot = await get(ref(db, `pendingOrders/${orderId}`));
            if(snapShot.exists()){
                const data = snapShot.val();
                const remaining = data.expiresAt - Date.now();
                if(remaining <= 0) {
                    await clearOrderFromFireBase(orderId);
                    onExpiredRef.current()
                }else {
                    setSecondLeft(Math.floor(remaining / 1000));
                    startTimer(data.expiresAt)
                }
            } else {
                const startTime = Date.now();
                const expiresAt = startTime + ORDER_TIMEOUT_MS;
                await set(ref(db, `pendingOrders/${orderId}`), {
                    orderId,
                    startTime,
                    expiresAt
                });
                setSecondLeft(ORDER_TIMEOUT_MS / 1000);
                startTimer(expiresAt);
            }
        }
        init();
        return ()=> {
            if(intervalRef.current){
                clearInterval(intervalRef.current);
            }
        }
    },[orderId])
    return {secondLeft, clearOrderFromFireBase}
}