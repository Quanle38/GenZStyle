import BestSellingList from "./bestSellingList";
import productList from "../data/product.json"
import { useTranslation } from "react-i18next";
export default function BestSelling() {
    const sliceData = productList.slice(0, 6);
    const { t } = useTranslation("bestSelling");
    return (
        <div className="w-full pt-[124px] pb-[51px]">

            <div className="w-full h-3/4 flex justify-center items-center gap-[12px]">
                <div className="w-[41px] h-[2.5px] bg-[var(--black)]"></div>
                <h2 className="h-[62px] w-[300px] font-medium text-5xl text-center">
                    {t("title")}
                </h2>
                <div className="w-[41px] h-[2.5px] bg-[var(--black)]"></div>
            </div>

            <div className="w-full flex justify-center items-center gap-[42px] py-[42px]">
                <button className="bg-[var(--black)] text-[var(--white)] min-w-[122px] h-[79px] text-[25px] font-medium px-[35px] hover:opacity-[0.5]">
                    {t("man")}
                </button>
                <button className="text-[var(--description)] border-[2px] border-[var(--description)] min-w-[122px] h-[79px] text-[25px] font-medium px-[35px] hover:bg-[var(--description)] hover:text-[var(--white)]">
                    {t("woman")}
                </button>
                <button className="text-[var(--description)] border-[2px] border-[var(--description)] min-w-[122px] h-[79px] text-[25px] font-medium px-[35px] hover:bg-[var(--description)] hover:text-[var(--white)]">
                    {t("boy")}
                </button>
                <button className="text-[var(--description)] border-[2px] border-[var(--description)] min-w-[122px] h-[79px] text-[25px] font-medium px-[35px] hover:bg-[var(--description)] hover:text-[var(--white)]">
                    {t("child")}
                </button>
            </div>
            <div className="w-full h-[900px] ">
                <BestSellingList productList={sliceData} />
            </div>

        </div>
    )
}