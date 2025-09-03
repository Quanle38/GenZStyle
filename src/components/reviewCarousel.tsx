import { useState } from "react";
import "../assets/scss/reviewCarousel.scss";

export function ReviewCarousel() {
    const reviews = [
        {
            id: 1,
            name: "Ava Joshi",
            img: "/images/avt_male.png",
            review:
                "Lorem Ipsum Dolor Sit Amet Consectetur Adipisicing Elit, Sed Do Eiusmod Tempor Incididunt Ut Labore Et Dolore Magna Aliqua."
        },
        {
            id: 2,
            name: "Otis Bisnoy",
            img: "/images/avt_female.png",
            review:
                "Lorem Ipsum Dolor Sit Amet Consectetur Adipisicing Elit, Sed Do Eiusmod Tempor Incididunt Ut Labore Et Dolore Magna Aliqua."
        },
        {
            id: 3,
            name: "Sophia Tran",
            img: "/images/avt_female.png",
            review:
                "Lorem Ipsum Dolor Sit Amet Consectetur Adipisicing Elit, Sed Do Eiusmod Tempor Incididunt Ut Labore Et Dolore Magna Aliqua."
        },
        {
            id: 4,
            name: "Daniel Lee",
            img: "/images/avt_male.png",
            review:
                "Lorem Ipsum Dolor Sit Amet Consectetur Adipisicing Elit, Sed Do Eiusmod Tempor Incididunt Ut Labore Et Dolore Magna Aliqua."
        }
    ];

    const [current, setCurrent] = useState(0);

    return (
        <div className="review-carousel">
            {/* Header */}
            <div className="review-carousel__header">
                <div className="review-carousel__header-space" />
                <h2 className="review-carousel__title">Customer Review</h2>
                <div className="review-carousel__header-space" />
            </div>

            {/* Body */}
            <div className="review-carousel__body">
                {reviews
                    .slice(current * 2, current * 2 + 2) // hiển thị 2 card mỗi lần
                    .map((review) => (
                        <div key={review.id} className="review-carousel__card">
                            <img src={review.img} alt={review.name} className="review-carousel__avatar" />
                            <div className="review-carousel__content">
                                <h4 className="review-carousel__name">{review.name}</h4>
                                <div className="review-carousel__stars">★★★★★</div>
                                <p className="review-carousel__text">{review.review}</p>
                            </div>
                        </div>
                    ))}
            </div>

            {/* Dots */}
            <div className="review-carousel__dots">
                {Array.from({ length: Math.ceil(reviews.length / 2) }, (_, i) => (
                    <span
                        key={i}
                        className={`review-carousel__dot ${i === current ? "active" : ""}`}
                        onClick={() => setCurrent(i)}
                    />
                ))}
            </div>
        </div>
    );
}