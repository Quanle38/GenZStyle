import { useState } from "react";
import "../assets/scss/bannerCarousel.scss";

export function BannerCarousel() {
    const slides = [
        {
            id: 1,
            bgText: "Slick",
            image: "/images/leg.png",
            title: "Are you ready \n to lead the way",
            desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do.",
            minis: [
                "/images/mini_shoe_1.png",
                "/images/mini_shoe_2.png",
                "/images/mini_shoe_3.png",
                "/images/mini_shoe_3.png",
                "/images/mini_shoe_2.png",
                "/images/mini_shoe_1.png"
            ]
        },
        {
            id: 2,
            bgText: "Style",
            image: "/images/leg.png",
            title: "Discover the \n next generation",
            desc: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem.",
            minis: [
                "/images/mini_shoe_2.png",
                "/images/mini_shoe_3.png",
                "/images/mini_shoe_1.png",
                "/images/mini_shoe_3.png",
                "/images/mini_shoe_2.png",
                "/images/mini_shoe_1.png"
            ]
        }
    ];

    const [current, setCurrent] = useState(0);       // slide chính
    const [miniPage, setMiniPage] = useState(0);     // nhóm ảnh mini

    const handlePrev = () => {
        setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
        setMiniPage(0);
    };

    const handleNext = () => {
        setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
        setMiniPage(0);
    };

    return (
        <div className="carousel">
            {slides.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`slide ${index === current ? "active" : "hidden"}`}
                >
                    <button className="slide__btn--prev" onClick={handlePrev}>
                        {"<"}
                    </button>
                    <button className="slide__btn--next" onClick={handleNext}>
                        {">"}
                    </button>

                    <div className="slide__left">
                        <div className="slide__bg__text">{slide.bgText}</div>
                        <img src={slide.image} className="slide__image" />
                    </div>

                    <div className="slide__right">
                        <h2 className="slide__title">
                            {slide.title.split("\n").map((line, i) => (
                                <span key={i}>
                                    {line} <br />
                                </span>
                            ))}
                        </h2>
                        <p className="slide__desc">{slide.desc}</p>
                        <button className="slide__explore-btn">Explore</button>

                        {/* Mini carousel */}
                        <div className="slide__mini-carousel">
                            <div className="mini-track">
                                {slide.minis
                                    .slice(miniPage * 3, miniPage * 3 + 3)
                                    .map((mini, i) => (
                                        <div className="mini-card" key={i}>
                                            <img src={mini} />
                                        </div>
                                    ))}
                            </div>
                            <div className="mini-dots">
                                {Array.from(
                                    { length: Math.ceil(slide.minis.length / 3) },
                                    (_, i) => (
                                        <span
                                            key={i}
                                            className={`dot ${i === miniPage ? "active" : ""}`}
                                            onClick={() => setMiniPage(i)}
                                        />
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
