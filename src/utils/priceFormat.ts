const priceFormat = (price : number) =>{
    const formatted = price.toLocaleString('vi-VN',{
        style : 'currency',
        currency : 'VND'
    });
    return formatted;
}
export default priceFormat;