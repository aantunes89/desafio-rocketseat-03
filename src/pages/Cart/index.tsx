import React from "react";
import {
  MdDelete,
  MdAddCircleOutline,
  MdRemoveCircleOutline,
} from "react-icons/md";
import { useCart } from "../../hooks/useCart";
import { formatPrice } from "../../util/format";

// import { useCart } from '../../hooks/useCart';
// import { formatPrice } from '../../util/format';
import { Container, ProductTable, Total } from "./styles";

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  amount: number;
}

interface CartFormated extends Product {
  total: string;
}

const Cart = (): JSX.Element => {
  const { cart, removeProduct, updateProductAmount } = useCart();

  const cartFormatted = cart.map(
    (product): CartFormated => ({
      ...product,
      total: formatPrice(product.amount * product.price),
    })
  );

  const total = formatPrice(
    cart.reduce((sumTotal, product) => {
      sumTotal += product.amount * product.price;
      return sumTotal;
    }, 0)
  );

  function handleProductIncrement({ id, amount: oldamount }: Product) {
    updateProductAmount({ productId: id, amount: oldamount + 1 });
  }

  function handleProductDecrement({ id, amount: oldamount }: Product) {
    updateProductAmount({ productId: id, amount: oldamount - 1 });
  }

  function handleRemoveProduct(productId: number) {
    removeProduct(productId);
  }

  function renderProducts() {
    return cartFormatted.map((product) => {
      return (
        <tr data-testid="product" key={product.id + 1}>
          <td>
            <img src={product.image} alt={product.title} />
          </td>
          <td>
            <strong>{product.title}</strong>
            <span>{formatPrice(product.price)}</span>
          </td>
          <td>
            <div>
              <button
                type="button"
                data-testid="decrement-product"
                disabled={product.amount <= 1}
                onClick={() => handleProductDecrement(product)}
              >
                <MdRemoveCircleOutline size={20} />
              </button>
              <input
                type="text"
                data-testid="product-amount"
                readOnly
                value={product.amount}
              />
              <button
                type="button"
                data-testid="increment-product"
                onClick={() => handleProductIncrement(product)}
              >
                <MdAddCircleOutline size={20} />
              </button>
            </div>
          </td>
          <td>
            <strong>{product.total}</strong>
          </td>
          <td>
            <button
              type="button"
              data-testid="remove-product"
              onClick={() => handleRemoveProduct(product.id)}
            >
              <MdDelete size={20} />
            </button>
          </td>
        </tr>
      );
    });
  }

  return (
    <Container>
      <ProductTable>
        <thead>
          <tr>
            <th aria-label="product image" />
            <th>PRODUTO</th>
            <th>QTD</th>
            <th>SUBTOTAL</th>
            <th aria-label="delete icon" />
          </tr>
        </thead>
        <tbody>{renderProducts()}</tbody>
      </ProductTable>

      <footer>
        <button type="button">Finalizar pedido</button>

        <Total>
          <span>TOTAL</span>
          <strong>{total}</strong>
        </Total>
      </footer>
    </Container>
  );
};

export default Cart;
