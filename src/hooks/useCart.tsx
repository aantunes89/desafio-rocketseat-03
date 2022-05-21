import { createContext, ReactNode, useContext, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { Product, Stock } from "../types";

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem("@RocketShoes:cart");

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      // busca estado atual e faz uma cópia
      const updatedCart = [...cart];
      // verifica a existência do produto no carrinho
      const productExists = updatedCart.find(({ id }) => id === productId);

      // busca na API o produto pelo ID
      const stock = await api.get(`/stock/${productId}`);

      // verifica a quantidade que existe em stock
      const stockamount = stock.data.amount;

      // se o produto existir no carrinho guarda a quantidade atual senão zera
      const currentamount = productExists ? productExists.amount : 0;

      // acresce a quantidade do produto em 1
      const amount = currentamount + 1;

      // verifica se a quantidade é maior do que o estoque existente
      if (amount > stockamount) {
        toast.error("Quantidade solicitada fora de estoque");
        return;
      }

      // se o produto existe atualiza sua quantidade
      if (productExists) {
        productExists.amount = amount;
      } else {
        // senão buca o produto, seta a quantidade para um e coloca na copia do carrinho
        const product = await api.get(`/products/${productId}`);

        const newProduct = { ...product.data, amount: 1 };

        updatedCart.push(newProduct);
      }

      // atualiza o estado
      setCart(updatedCart);

      // guarda em localStorage
      localStorage.setItem("@RocketShoes:cart", JSON.stringify(updatedCart));
    } catch {
      toast.error("Erro na adição do produto");
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const oldCart = [...cart];

      const productExists = oldCart.find(({ id }) => id === productId);

      if (!productExists) {
        toast.error("Erro na remoção do produto");
        return;
      }

      const updatedCart = oldCart.filter(({ id }) => id !== productId);

      setCart(updatedCart);

      localStorage.setItem("@RocketShoes:cart", JSON.stringify(updatedCart));
    } catch {
      toast.error("Erro na remoção do produto");
    }
  };

  const updateProductAmount = async ({
    productId,
    amount: newAmmout,
  }: UpdateProductAmount) => {
    try {
      if (newAmmout <= 0) return;

      // verificar disponibilidade e comparar com qtd do carrinho passada
      // se possivel altera senão retorna um erro

      const { data: stock } = await api.get(`/stock/${productId}`);

      const { amount: currentInStock } = stock;

      if (newAmmout > currentInStock) {
        toast.error("Quantidade solicitada fora de estoque");
        return;
      }

      const oldCart = [...cart];

      const newCart = oldCart.map((product) => {
        if (product.id === productId) {
          return {
            ...product,
            amount: newAmmout,
          };
        }
        return product;
      });

      // atualiza o estado
      setCart(newCart);

      // guarda em localStorage
      localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCart));
    } catch {
      toast.error("Erro na alteração de quantidade do produto");
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
