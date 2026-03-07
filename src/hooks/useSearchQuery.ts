import { useSearchParams } from "react-router-dom";

export default function useSearchQuery(key : string = "q") {
    const [searchParams, setSearchParams] = useSearchParams();
    const value = searchParams.get(key) ?? "";
    const setValue = (next : string) => {
        setSearchParams(prev => {
            if(!next) {
                prev.delete(key);
            }else {
                prev.set(key,next);
            }
            return prev;
        })
    }  
    return [value,setValue] as const ;
}