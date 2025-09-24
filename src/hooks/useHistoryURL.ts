import { useEffect, useState } from "react";

export default function useHistoryURL(){
    const [backUrl, setBackUrl] = useState<string|null>(sessionStorage.getItem("backUrl") || null);
    const setURL = (url : string) => {
        sessionStorage.setItem("backUrl",url);
        setBackUrl(url);
    }
    useEffect(()=>{
        const currentUrl = window.location.href
        sessionStorage.setItem("backUrl",currentUrl);
        setBackUrl(currentUrl);
    },[backUrl])
    return {setURL, backUrl } ;
}