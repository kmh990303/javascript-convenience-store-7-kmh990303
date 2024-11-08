import { OutputView } from "./OutputView.js";
import { InputView } from "./InputView.js";
import { loadProductsFromFile } from "../util/loadProductsFromFile.js";
import { loadPromotionsFromFile } from "../util/loadPromotionsFromFile.js";
import { Product } from "./Product.js";
import { Promotion } from "./Promotion.js";
import { Payment } from "./Payment.js";
import { MissionUtils } from "@woowacourse/mission-utils";

export const productsList = [];
export const promotionsList = [];

class App {
  async run() {
    await this.loadData();
    await OutputView.printIntro();
    await OutputView.printProducts(productsList);
    const buyItems = await InputView.readItem();
    this.processPurchase(buyItems);
  }

  async loadData() {
    const products = await loadProductsFromFile("products.md");
    const promotions = await loadPromotionsFromFile("promotions.md");

    promotions.forEach((promotion) => {
      promotionsList.push(new Promotion(promotion.name, promotion.buy, promotion.get, promotion.startDate, promotion.endDate));
    });

    products.forEach((product) => {
      productsList.push(new Product(product.name, product.price, product.quantity, product.promotion));
    });
  }

  processPurchase(buyItems) {
    const payment = new Payment();

    buyItems.forEach((item) => { //item이 구매하려는 항목에 대한 객체
      const matchedProducts = productsList.filter((product) => item.name === product.getProdName());

      if (matchedProducts.length > 1) {
        this.handlePromotionalProduct(item, matchedProducts, payment);
      } else if (matchedProducts.length === 1) {
        this.handleRegularProduct(item, matchedProducts[0], payment);
      }
    });
  }

  handlePromotionalProduct(item, matchedProducts, payment) {
    const promotionProduct = matchedProducts[0];
    const promotion = this.findPromotionForProduct(promotionProduct);

    if (!promotion || !promotion.isActive()) return;

    if (promotionProduct.isRemainProduct(item.quantity)) {
      this.applyPromotion(item, promotionProduct, promotion, payment);
    } else if (!promotionProduct.isZeroProduct()) {
      this.handlePartialPromotion(item, promotionProduct, matchedProducts, promotion, payment);
    } else {
      this.handleRegularProduct(item, matchedProducts[1], payment);
    }
  }

  async handleRegularProduct(item, product, payment) {
    if (product.isRemainProduct(item.quantity)) {
      product.reduceQuantity(item.quantity);
      payment.addPurchaseAmount(product.price, item.quantity);
      payment.addNonPromotionAmount(product.price * item.quantity); // 프로모션 아닌 상품은 나중에 멤버십 할인 계산을 위해 더해놓음
    }
    else if (!product.isRemainProduct(item.quantity)) {
      await MissionUtils.Console.print('[ERROR] 구매하려는 개수만큼 재고가 남아 있지 않습니다. 죄송합니다.')
    }
  }

  findPromotionForProduct(product) {
    const productPromotion = product.getProdPromotion().trim();

    const findPromotion = promotionsList.find((promo) => promo.getPromName().trim() === productPromotion);

    if (!findPromotion) {
      console.log("No matching promotion found.");
      return undefined;
    }

    return findPromotion;
  }

  applyPromotion(item, promotionProduct, promotion, payment) {
    const { promoCycleQuantity, requiredQuantityForPromo, freeQuantity, promoApplicableCount, remainingQuantity } =
      this.calculatePromotionQuantities(item, promotion);

    let actualQuantity = item.quantity;

    if (remainingQuantity >= requiredQuantityForPromo) {
      const acceptsFreeItems = InputView.checkForFreeItemOffer(item.name, freeQuantity);
      actualQuantity = acceptsFreeItems
        ? requiredQuantityForPromo * promoApplicableCount + remainingQuantity
        : requiredQuantityForPromo * promoApplicableCount;
    }

    this.updateProductQuantity(promotionProduct, actualQuantity);
    payment.addPurchaseAmount(promotionProduct.price, actualQuantity);
    payment.addPromotionDiscount(promotionProduct.price, promoApplicableCount * freeQuantity);
  }

  handlePartialPromotion(item, promotionProduct, matchedProducts, promotion, payment) {
    const { requiredQuantityForPromo, freeQuantity, promoCycleQuantity } = promotion;
    const buyPromQuantity = Math.floor(item.quantity / promoCycleQuantity) * requiredQuantityForPromo;
    const buyOriginQuantity = item.quantity - buyPromQuantity;

    if (InputView.checkPromoExclusion(item.name, buyOriginQuantity)) {
      this.updateProductQuantity(promotionProduct, buyPromQuantity);
      this.updateProductQuantity(matchedProducts[1], buyOriginQuantity);
    }
  }

  calculatePromotionQuantities(item, promotion) {
    const requiredQuantityForPromo = promotion.giveBuy();
    const freeQuantity = promotion.giveGet();
    const promoCycleQuantity = requiredQuantityForPromo + freeQuantity;
    const promoApplicableCount = Math.floor(item.quantity / promoCycleQuantity);
    const remainingQuantity = item.quantity % promoCycleQuantity;

    return { promoCycleQuantity, requiredQuantityForPromo, freeQuantity, promoApplicableCount, remainingQuantity };
  }

  updateProductQuantity(product, quantity) {
    productsList.forEach((prod) => {
      if (prod.getProdName() === product.getProdName() && prod.promotion === product.promotion) {
        prod.reduceQuantity(quantity);
      }
    });
  }
}

export default App;
