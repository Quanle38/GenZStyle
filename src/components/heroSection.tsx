import "../assets/scss/hero.scss";
export function HeroSection(){
    return(
        
        <div className="Hero">
        <h1 className="Hero__title">Find Your Sole Mate With Us</h1>
        <p className="Hero__des">Discover the perfect fit for your feet and your lifestyle !</p>
        <button className="Hero__btn">Shop Now</button>
         <div className="brand">
                    <img className="brand_logo ebay" src="../../../public/images/ebay.png" />
                    <img className="brand_logo amazon" src="../../../public/images/amazon.png" />
                    <img className="brand_logo ajio" src="../../../public/images/AJIO.png" />
                    <img className="brand_logo ebay" src="../../../public/images/ebay.png" />
                    <img className="brand_logo amazon" src="../../../public/images/amazon.png" />
                    <img className="brand_logo ajio" src="../../../public/images/AJIO.png" />
                </div>
        </div>
       
    )
}