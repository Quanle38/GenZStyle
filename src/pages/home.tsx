import { BannerCarousel } from "../components/bannerCarousel";
import { HeroSection } from "../components/heroSection";
import { PopularProducts } from "../components/popularProduct";

export default function Home(){
    console.log("aaaaaaaa");
    return(
        <div className="Home">
        <HeroSection/>
        <PopularProducts/>
        <BannerCarousel/>
       <div className="flex h-screen items-center justify-center bg-gray-100">
      <button className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition">
        Test Tailwind Button
      </button>
    </div>
        </div>     
    )
}
