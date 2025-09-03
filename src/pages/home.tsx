import { BannerCarousel } from "../components/bannerCarousel";
import BestSelling from "../components/bestSelling";
import { HeroSection } from "../components/heroSection";
import { PopularProducts } from "../components/popularProduct";
import { ReviewCarousel } from "../components/reviewCarousel";

export default function Home(){
    console.log("aaaaaaaa");
    return(
        <div className="Home">
        <HeroSection/>
        <PopularProducts/>
        <BannerCarousel/>
        <BestSelling/>
        <ReviewCarousel/>
        </div>     
    )
}
