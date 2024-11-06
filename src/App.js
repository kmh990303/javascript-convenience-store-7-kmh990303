import { OutputView } from "./OutputView.js";
import { loadProductsFromFile } from "../util/loadProductsFromFile.js";

class App {
  async run() { //상품 클래스 만들어야 함
    const products = await loadProductsFromFile("products.md");
    products.forEach((product) => {
      product.promotion === 'no' ? product.promotion = '' : product.promotion;
    })
    OutputView.printProducts(products);
  }
}

export default App;
