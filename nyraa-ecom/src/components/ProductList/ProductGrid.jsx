import React from "react";
import ProductCard from "./ProductCard";

const ProductGrid = ({ products, onOptionsClick }) => {
  return (
    <div className="product-grid">
      {products.length > 0 ? (
        products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onOptionsClick={onOptionsClick}
          />
        ))
      ) : (
        <p className="text-center">No products found.</p>
      )}

      <style>{`
        .product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
          padding: 16px 0;
        }
        @media (max-width: 768px) {
          .product-grid {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: 12px;
            padding: 12px 0;
          }
        }
        @media (max-width: 576px) {
          .product-grid {
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            gap: 8px;
            padding: 8px 0;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductGrid;