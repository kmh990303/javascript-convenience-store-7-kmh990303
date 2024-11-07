import { OutputView } from "./OutputView.js";
import { loadProductsFromFile } from "../util/loadProductsFromFile.js";
import { loadPromotionsFromFile } from "../util/loadPromotionsFromFile.js";
import { Product } from "./Product.js";
import { Promotion } from "./Promotion.js";

export const productsList = [];

class App {
  async run() {
    const products = await loadProductsFromFile("products.md");
    // const promotions = await loadPromotionsFromFile("promotions.md");

    products.forEach((product) => {
      productsList.push(new Product(product.name, product.price, product.quantity, product.promotion));
    })

    await OutputView.printIntro();
    await OutputView.printProducts(productsList);
  }
}

export default App;
