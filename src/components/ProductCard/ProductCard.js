import React from "react";
import "./ProductCard.css";

function ProductCard({ name, price, imgSrc }) {
  return (
    <div className="product-card">
      <img src={imgSrc} alt={name} /> {/* Add image src */}
      <h3>{name}</h3>
      <p>{price}</p>
    </div>
  );
}

export default ProductCard;
