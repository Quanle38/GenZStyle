import BestSellingList from "../components/bestSellingList";
import { HeroSection } from "../components/heroSection";

export default function Shop() {
    const cateData = [
        { id: 1, name: "All", value: "all" },
        { id: 2, name: "Men", value: "men" },
        { id: 3, name: "Women", value: "women" },
        { id: 4, name: "Boy", value: "boy" },
        { id: 5, name: "Child", value: "child" },
    ];

    const priceData = [
        { id: 1, name: "All Prices", value: "all" },
        { id: 2, name: "100", value: "100" },
        { id: 3, name: "200", value: "200" },
        { id: 4, name: "300", value: "300" },
        { id: 5, name: "400", value: "400" },
    ];

    const brandData = [
        { id: 1, name: "Puma", value: "puma" },
        { id: 2, name: "Adidas", value: "adidas" },
        { id: 3, name: "Nike", value: "nike" },
        { id: 4, name: "Reebok", value: "reebok" },
        { id: 5, name: "Under Armour", value: "under-armour" },
    ];

    return (
        <>
            <div className="Shop">
                <HeroSection />
                <div className="pt-[450px] pb-[100px] flex justify-between">
                    <div className="Shop__Filter w-[250px]  flex justify-center">
                        <div className="w-[80%] ">
                            <h4 className="text-xl font-semibold mb-[12px]">Filters</h4>
                            <div className="cate">
                                <h5 className="text-base font-medium mb-[8px]">Categories</h5>
                                {cateData.map((item) => (
                                    <div key={item.id} className="flex items-center gap-[5px] leading-[20px] pb-[5px]">
                                        <input className="w-[18px] h-[18px]" type="checkbox" value={item.value} />{" "}
                                        <p className="w-[60%]  text-base ">{item.name}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="price">
                                <h5 className="text-base font-medium mb-[8px]">Price Range</h5>
                                <select className="price__select  w-full h-[40px] py-[9px] px-[13px] rounded-[5px] border border-[var(--border)]">
                                    {priceData.map((item) => (
                                        <option className="price__option" value={item.value}>
                                            {item.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="brand">
                                <h5 className="text-base font-medium mb-[8px]">Brand</h5>
                                {brandData.map((item) => (
                                    <div key={item.id} className="flex items-center gap-[5px] leading-[20px] pb-[5px]">
                                        <input className="w-[18px] h-[18px]" type="checkbox" value={item.value} />{" "}
                                        <p className="w-[60%]  text-base ">{item.name}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="Shop__Product bg-red-400 w-[85%] min-h-[900px]">
                     <div className="header"></div>
                     <div className="body">
                        <BestSellingList/>
                     </div>
                    </div>
                </div>
            </div>
        </>
    );
}