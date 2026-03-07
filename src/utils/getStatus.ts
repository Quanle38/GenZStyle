 const getStatus = (index : number, active : number) => {
    if(index < active) return "finish";
    if(index === active) return "process";
    return "wait";
}
export default getStatus;