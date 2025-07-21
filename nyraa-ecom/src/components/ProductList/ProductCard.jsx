import React from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";

const ProductCard = ({ product, onOptionsClick }) => {
  return (
    <div className="product-card">
      <Link
        to={`/product/${product.id}`}
        state={{ product }}
        className="text-decoration-none"
      >
        <div className="image-container">
          <img
            src={product.image}
            alt={product.name}
            className="product-image"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/300x400";
            }}
          />
          {product.discount > 0 && (
            <span className="discount-badge">{product.discount}% OFF</span>
          )}
        </div>
        <div className="product-info">
          <h3 className="product-title">{product.name}</h3>
          <div className="product-rating">
            {"★".repeat(product.rating)}
            {"☆".repeat(5 - product.rating)}
          </div>
          <div className="product-price">
            {product.discount > 0 && (
              <span className="original-price">
                ₹{product.originalPrice.toFixed(0)}
              </span>
            )}
            <span className="current-price">₹{product.price.toFixed(0)}</span>
          </div>
        </div>
      </Link>
      <Button
        variant="outline-dark"
        className="quick-show-btn"
        onClick={() => onOptionsClick(product)}
      >
        Shop Now
      </Button>

      <style>{`
        .product-card {
          position: relative;
          border: 1px solid #eee;
          border-radius: 8px;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          background: #fff;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .image-container {
          position: relative;
          width: 100%;
          padding-top: 133.33%;
        }
        .product-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .discount-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          background: #ff4d4f;
          color: #fff;
          padding: 4px 8px;
          font-size: 0.75rem;
          font-weight: bold;
          border-radius: 4px;
        }
        .product-info {
          padding: 12px;
          flex-grow: 1;
        }
        .product-title {
          font-size: 0.95rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .product-rating {
          font-size: 0.8rem;
          color: #FFD700;
          margin-bottom: 4px;
        }
        .product-price {
          font-size: 0.9rem;
        }
        .original-price {
          text-decoration: line-through;
          color: #888;
          margin-right: 8px;
        }
        .current-price {
          font-weight: bold;
          color: #333;
        }
        .quick-show-btn {
          width: 100%;
          font-size: 0.85rem;
          padding: 6px;
          border-radius: 0;
          transition: background-color 0.2s, color 0.2s;
        }
        .quick-show-btn:hover {
          background-color: #333;
          color: #fff;
        }
        @media (max-width: 991px) {
          .product-card {
            border-radius: 6px;
          }
          .product-title {
            font-size: 0.9rem;
          }
          .product-price,
          .product-rating {
            font-size: 0.85rem;
          }
          .quick-show-btn {
            font-size: 0.8rem;
            padding: 5px;
          }
          .discount-badge {
            font-size: 0.7rem;
            padding: 3px 6px;
          }
        }
        @media (max-width: 767px) {
          .product-card {
            border-radius: 6px;
          }
          .product-title {
            font-size: 0.85rem;
          }
          .product-price,
          .product-rating {
            font-size: 0.8rem;
          }
          .quick-show-btn {
            font-size: 0.75rem;
            padding: 4px;
          }
          .discount-badge {
            font-size: 0.65rem;
            padding: 2px 5px;
          }
        }
        @media (max-width: 575px) {
          .product-card {
            border-radius: 4px;
          }
          .product-title {
            font-size: 0.8rem;
          }
          .product-price,
          .product-rating {
            font-size: 0.75rem;
          }
          .quick-show-btn {
            font-size: 0.7rem;
            padding: 3px;
          }
          .discount-badge {
            font-size: 0.6rem;
            padding: 2px 4px;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductCard;