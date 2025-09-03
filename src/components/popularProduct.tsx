// import { Carousel } from "antd";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import "../assets/scss/popularProducts.scss";
import { FaArrowRightLong, FaArrowLeftLong } from "react-icons/fa6";
import type { Settings } from "react-slick";
export function PopularProducts() {
  const settings : Settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 3,
    nextArrow: (
      <div className="arrow next">
        <FaArrowRightLong />
      </div>
    ),
    prevArrow: (
      <div className="arrow prev">
        <FaArrowLeftLong />
      </div>
    ),
    appendDots: dots => (
      <div
        style={{
          bottom: "-30px",
        }}
      >
        <ul style={{ margin: "0px" }}> {dots} </ul>
      </div>
    ),
    customPaging: i  => (
      <div
        style={{
          width: "12px",
          height: "12px",
          borderRadius: "50%",
          background: "var(--border)",
        }}
      />
    ),
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 2, slidesToScroll: 2 },
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 1, slidesToScroll: 1 },
      },
    ],
  };

  const products = [
    { id: 1, name: "Running sport shoe", price: "₹ 3999.00", image: "/images/shoe1.png" },
    { id: 2, name: "Running sport shoe", price: "₹ 3999.00", image: "/images/shoe2.png" },
    { id: 3, name: "Running sport shoe", price: "₹ 3999.00", image: "/images/shoe3.png" },
    { id: 4, name: "Casual Sneakers", price: "₹ 2999.00", image: "/images/shoe1.png" },
    { id: 5, name: "Training Shoes", price: "₹ 3599.00", image: "/images/shoe2.png" },
    { id: 6, name: "Walking Shoes", price: "₹ 1899.00", image: "/images/shoe3.png" },
  ];

  return (
    <div className="PopularProducts">
      <div className="PopularProducts__left">
        <div className="heading">
          <div className="abc" />
          <span className="subtitle">Our Trending Shoe</span>
        </div>
        <h2>Most Popular Products</h2>
        <p>Lorem Ipsum Dolor Sit Amet, Consectetur Adipisicing Elit,</p>
        <button className="btn-explore">Explore</button>
      </div>

      <div className="PopularProducts__right">
        <Slider {...settings}>
          {products.map(product => (
            <div className="carousel-item" key={product.id}>
              <div className="card">
                <div className="img-box">
                  <img src={product.image} alt={product.name} />
                </div>
                <p className="name">{product.name}</p>
                <div className="info-product">
                  <p className="price">{product.price}</p>
                  <button className="btn-arrow">
                    <FaArrowRightLong />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
}
