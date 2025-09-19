import { useTranslation } from "react-i18next";
import "../assets/scss/hero.scss";
export function HeroSection(){
    const {t} = useTranslation("hero");
    return(
        
        <div className="Hero">
        <h1 className="Hero__title">{t("title")}</h1>
        <p className="Hero__des">{t("description")}</p>
        <button className="Hero__btn">{t("button")}</button>
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