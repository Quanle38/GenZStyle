function getLocal(key : string) {
    const value = localStorage.getItem(key);
    return value || null;
}

function setLocal(key : string, value : string){
    localStorage.setItem(key , value);
}

function removeLocal(key : string) {
    localStorage.removeItem(key);
}

export {getLocal, setLocal, removeLocal}