import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import BestSellingList from "../components/bestSellingList";
import { HeroSection } from "../components/heroSection";
import { BsGrid3X2 } from "react-icons/bs";
import { FaListUl } from "react-icons/fa";
import productList from "./../data/product.json";
import ListProduct from "../components/listProduct";
import type { PaginationProps } from 'antd';
import { Pagination } from 'antd';
import type { Product } from "../types/product.type";

export default function Shop() {
    type CateValue = "all" | "men" | "women" | "child" | "boy";

    const cateData: { id: number; name: string; value: CateValue }[] = [
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
    const [pageSize, setPageSize] = useState(6);
    const [currentPage, setCurrentPage] = useState(1);
    const onChange: PaginationProps['onChange'] = (page, size) => {
        setCurrentPage(page);
        setPageSize(size);
    };
    const [filterData, setFilterData] = useState<Product[]>(productList);

    useEffect(() => {
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;
        const slideData = productList.slice(start, end);
        setFilterData(slideData);
    }, [currentPage, pageSize])

    const [selectDisplay, setSelectDisplay] = useState<"grid" | "list">("grid");
    const [cateGroup, setCateGroup] = useState<CateValue[]>(["all"]);
    const [price, setPrice] = useState("all");
    const [brands, setBrands] = useState<string[]>([]);
    const [searchParams, setSearchParams] = useSearchParams();
    const handleClear = () => {
        const baseUrl = window.location.origin + window.location.pathname;
        const url = new URL(baseUrl);
        window.location.href = url.toString();
    }

    // đồng bộ filter từ URL khi load trang
    useEffect(() => {
        const cateParam = searchParams.get("cate");
        if (cateParam) {
            setCateGroup(cateParam.split(",") as CateValue[]);
        }

        const priceParam = searchParams.get("price");
        if (priceParam) {
            setPrice(priceParam);
        }

        const brandParam = searchParams.get("brand");
        if (brandParam) {
            setBrands(brandParam.split(","));
        }
    }, []);

    // Apply filter -> ghi lên URL
    const handleApply = () => {
        const params: Record<string, string> = {};

        if (!(cateGroup.length === 1 && cateGroup[0] === "all")) {
            params.cate = cateGroup.join(",");
        }
        if (price !== "all") {
            params.price = price;
        }
        if (brands.length > 0) {
            params.brand = brands.join(",");
        }

        setSearchParams(params);
    };

    return (
        <div className="Shop">
            <HeroSection />
            <div className="pt-[450px] pb-[100px] flex justify-between">
                {/* Filter sidebar */}
                <div className="Shop__Filter w-[250px] flex justify-center">
                    <div className="w-[80%]">
                        <h4 className="text-xl font-semibold mb-[12px]">Filters</h4>

                        {/* Categories */}
                        <div className="cate">
                            <h5 className="text-base font-medium mb-[8px]">Categories</h5>
                            {cateData.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-[5px] leading-[20px] pb-[5px]"
                                >
                                    <input
                                        type="checkbox"
                                        value={item.value}
                                        checked={cateGroup.includes(item.value)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                if (item.value === "all") {
                                                    setCateGroup(["all"]);
                                                } else {
                                                    const newGroup = [
                                                        ...cateGroup.filter((v) => v !== "all"),
                                                        item.value,
                                                    ];
                                                    const allCateExceptAll = cateData
                                                        .filter((c) => c.value !== "all")
                                                        .map((c) => c.value);
                                                    if (allCateExceptAll.every((c) => newGroup.includes(c))) {
                                                        setCateGroup(["all"]);
                                                    } else {
                                                        setCateGroup(newGroup);
                                                    }
                                                }
                                            } else {
                                                setCateGroup(
                                                    cateGroup.filter((v) => v !== item.value)
                                                );
                                            }
                                        }}
                                        className="w-[18px] h-[18px]"
                                    />
                                    <p className="w-[60%] text-base">{item.name}</p>
                                </div>
                            ))}
                        </div>

                        {/* Price */}
                        <div className="price">
                            <h5 className="text-base font-medium mb-[8px]">Price Range</h5>
                            <select
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="price__select w-full h-[40px] py-[9px] px-[13px] rounded-[5px] border border-[var(--border)]"
                            >
                                {priceData.map((item) => (
                                    <option key={item.id} value={item.value}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Brands */}
                        <div className="brand">
                            <h5 className="text-base font-medium mb-[8px]">Brand</h5>
                            {brandData.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-[5px] leading-[20px] pb-[5px]"
                                >
                                    <input
                                        type="checkbox"
                                        value={item.value}
                                        checked={brands.includes(item.value)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setBrands([...brands, item.value]);
                                            } else {
                                                setBrands(brands.filter((b) => b !== item.value));
                                            }
                                        }}
                                        className="w-[18px] h-[18px]"
                                    />
                                    <p className="w-[60%] text-base">{item.name}</p>
                                </div>
                            ))}
                        </div>

                        {/* Apply button */}
                        <button
                            onClick={() => handleApply()}
                            className="apply w-full h-[40px] bg-[var(--black)] text-sm text-white rounded mt-[24px] font-medium"
                        >
                            Apply Filters
                        </button>
                        <button
                            onClick={() => handleClear()}
                            className="apply w-full h-[40px]  text-sm text-[var(--black)] rounded border border-[var(--black)] mt-[12px] font-medium hover:font-bold"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>

                {/* Product list */}
                <div className="Shop__Product w-[85%] min-h-[900px]">
                    <div className="header flex justify-center items-center ">
                        <div className="left w-[50%]">
                            <h3 className="title text-2xl font-semibold">Shop All Products</h3>
                            <p className="subtitle text-base text-[var(--subShop)]">
                                Showing {filterData.length} products
                            </p>
                        </div>
                        <div className="right w-[50%] flex justify-start items-center gap-2">
                            <div className="dropdown w-[190px]">
                                <select
                                    className="price__select w-full h-[40px] py-[9px] px-[13px] rounded-[5px] border border-[var(--border)]"
                                >
                                    {priceData.map((item) => (
                                        <option key={item.id} value={item.value}>
                                            {item.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="swapbtn w-[83px] h-[38px] rounded-[8px] border border-[var(--border)]">
                                <button
                                    className={`buttonGrid w-[40px] h-[36px] rounded-[6px] relative ${selectDisplay === "grid" ? "bg-black text-white" : ""
                                        }`}
                                    onClick={() => setSelectDisplay("grid")}
                                >
                                    <BsGrid3X2 className="m-auto" />
                                </button>
                                <button
                                    className={`buttonGrid w-[40px] h-[36px] rounded-[6px] relative ${selectDisplay === "list" ? "bg-black text-white" : ""
                                        }`}
                                    onClick={() => setSelectDisplay("list")}
                                >
                                    <FaListUl className="m-auto" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="body py-[70px]">
                        {selectDisplay === "grid" ? (
                            <BestSellingList productList={filterData} />
                        ) : (
                            <ListProduct products={filterData} />
                        )}
                        <div className="mt-[50px] w-full flex justify-center">
                            <Pagination className="text-lg font-medium" current={currentPage} pageSize={pageSize} onChange={onChange} total={productList.length} />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
