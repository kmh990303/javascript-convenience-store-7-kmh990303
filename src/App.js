import { OutputView } from "./OutputView.js";
import { InputView } from "./InputView.js";
import { loadProductsFromFile } from "../util/loadProductsFromFile.js";
import { loadPromotionsFromFile } from "../util/loadPromotionsFromFile.js";
import { Product } from "./Product.js";
import { Promotion } from "./Promotion.js";
import { Payment } from "./Payment.js";
import { MissionUtils } from "@woowacourse/mission-utils";

let productsList = [];
let promotionsList = [];
let buyItemsList = [];
let payment = new Payment();
let count = 0;

class App {
  async run() {
    while (true) {
      count += 1;
      if (count === 1) await this.loadData();
      OutputView.printIntro();
      OutputView.printProducts(productsList);

      const buyItems = await InputView.readItem();
      await this.processPurchase(buyItems);

      if (payment.IsNotZeroTotalNonPromotionAmount()) {
        const checkGetMembership = await InputView.checkMembershipDiscount()
        if (!checkGetMembership) {
          payment.calculateMembershipDiscount();
          payment.initMembershipDiscount();
          payment.calculateFinalAmount();
          OutputView.printResult(buyItemsList, payment.getPromotionItems(), payment, 'N');

          const hasOtherItems = await InputView.checkForOtherItems();

          if (hasOtherItems) {
            MissionUtils.Console.print('');
            this.initAll();
          } else {
            break;
          }
        }
        if (checkGetMembership) {
          payment.calculateMembershipDiscount();
          payment.calculateFinalAmount();
          OutputView.printResult(buyItemsList, payment.getPromotionItems(), payment, 'Y');

          const hasOtherItems = await InputView.checkForOtherItems();

          if (hasOtherItems) {
            MissionUtils.Console.print('');
            this.initAll();
          } else {
            break;
          }
        }
      }
    }
  }

  initAll() {
    buyItemsList = [];
    payment = new Payment();
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

  async processPurchase(buyItems) {
    buyItems.forEach(async (item) => {
      const matchedProducts = productsList.filter((product) => item.name === product.getProdName());
      buyItemsList.push({ name: item.name, quantity: item.quantity, price: matchedProducts[0].getProdPrice() });

      if (matchedProducts.length > 1) {
        this.handlePromotionalProduct(item, matchedProducts, payment);
      } else if (matchedProducts.length === 1) {
        this.handleRegularProduct(item, matchedProducts[0], payment);
      }
    });
  }

  async handlePromotionalProduct(item, matchedProducts, payment) {
    const promotionProduct = matchedProducts[0];
    const promotion = this.findPromotionForProduct(promotionProduct);

    if (!promotion || !promotion.isActive()) return;

    if (promotionProduct.isRemainProduct(item.quantity)) {
      this.applyPromotion(item, promotionProduct, promotion, payment);
      return;
    }
    if (!promotionProduct.isRemainProduct(item.quantity) && !promotionProduct.isZeroProduct()) {
      this.handlePartialPromotion(item, promotionProduct, matchedProducts, promotion, payment);
      return;
    }
    if (!promotionProduct.isRemainProduct(item.quantity) && promotionProduct.isZeroProduct()) {
      this.handleRegularProduct(item, matchedProducts[1], payment);
      return;
    }
  }

  handleRegularProduct(item, product, payment) {
    if (product.isRemainProduct(item.quantity)) {
      product.reduceQuantity(item.quantity);
      payment.addPurchaseAmount(product.getProdPrice(), item.quantity);
      payment.addNonPromotionAmount(product.getProdPrice() * item.quantity);
      payment.addPurchaseCount(item.quantity);

      return;
    }
    else if (!product.isRemainProduct(item.quantity)) {
      MissionUtils.Console.print('[ERROR] 구매하려는 개수만큼 재고가 남아 있지 않습니다. 죄송합니다.')
      return;
    }
  }

  findPromotionForProduct(product) {
    const productPromotion = product.getProdPromotion().trim();

    const findPromotion = promotionsList.find((promo) => promo.getPromName().trim() === productPromotion)

    return findPromotion;
  }

  async applyPromotion(item, promotionProduct, promotion, payment) {
    const { promoCycleQuantity, requiredQuantityForPromo, freeQuantity, promoApplicableCount, remainingQuantity } =
      this.calculatePromotionQuantities(item, promotion);

    let actualQuantity = item.quantity;

    if (remainingQuantity >= requiredQuantityForPromo) {
      const acceptsFreeItems = await InputView.checkForFreeItemOffer(item.name, freeQuantity);
      actualQuantity = acceptsFreeItems
        ? requiredQuantityForPromo * promoApplicableCount + remainingQuantity
        : requiredQuantityForPromo * promoApplicableCount;
    }

    this.updateProductQuantity(promotionProduct, actualQuantity);
    payment.addPromotionItems(item.name, promoApplicableCount * freeQuantity);
    payment.addPurchaseCount(actualQuantity);
    payment.addPurchaseAmount(promotionProduct.getProdPrice(), actualQuantity);
    payment.addPromotionDiscount(promotionProduct.getProdPrice(), promoApplicableCount * freeQuantity);
  }

  async handlePartialPromotion(item, promotionProduct, matchedProducts, promotion, payment) {
    const { requiredQuantityForPromo, freeQuantity, promoCycleQuantity, promoApplicableCount, remainingQuantity } = this.calculatePromotionQuantities(item, promotion);
    const buyPromQuantity = Math.floor(item.quantity / promoCycleQuantity) * requiredQuantityForPromo;
    const buyOriginQuantity = item.quantity - buyPromQuantity;

    if (await InputView.checkPromotionExclusion(item.name, buyOriginQuantity)) {
      this.updateProductQuantity(promotionProduct, buyPromQuantity);
      this.updateProductQuantity(matchedProducts[1], buyOriginQuantity);
      payment.addPromotionItems(item.name, promoApplicableCount * freeQuantity)
      payment.addPurchaseCount(item.quantity);
      payment.addPurchaseAmount(promotionProduct.getProdPrice(), item.quantity);
      payment.addPromotionDiscount(promotionProduct.getProdPrice(), promoApplicableCount * freeQuantity);
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
      if (prod.getProdName() === product.getProdName() && prod.getProdPromotion() === product.getProdPromotion()) {
        prod.reduceQuantity(quantity);
        return;
      }
    });
  }
}

export default App;
