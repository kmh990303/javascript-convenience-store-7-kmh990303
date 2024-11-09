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
export const buyItemsList = [];
export const payment = new Payment();

class App {
  async run() {
    await this.loadData();
    await OutputView.printIntro();
    await OutputView.printProducts(productsList);
    const buyItems = await InputView.readItem();
    this.processPurchase(buyItems);

    if (payment.IsNotZeroTotalNonPromotionAmount()) { //멤버십 적용 관련 함수
      const checkGetMembership = await InputView.checkMembershipDiscount()
      if (!checkGetMembership) {
        payment.calculateMembershipDiscount();
        payment.initMembershipDiscount();
        payment.calculateFinalAmount();
        OutputView.printResult(buyItemsList, payment.getPromotionItems(), payment, 'N');
      }
      if (checkGetMembership) {
        payment.calculateMembershipDiscount();
        payment.calculateFinalAmount();
        OutputView.printResult(buyItemsList, payment.getPromotionItems(), payment, 'Y');
      }
    }

    const hasOtherItems = await InputView.checkForOtherItems();
    // if (hasOtherItems) {
    //   // 새로 구매할 상품이 있을 경우 필요한 로직 수행
    //   console.log("새로 구매할 상품을 선택해주세요.");
    //   await this.run(); // 재귀 호출로 새로운 상품을 구매하도록
    // } else {
    //   console.log("구매를 종료합니다. 감사합니다.");
    // }
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
    buyItems.forEach((item) => { //item이 구매하려는 항목에 대한 객체
      const matchedProducts = productsList.filter((product) => item.name === product.getProdName());
      buyItemsList.push({ name: item.name, quantity: item.quantity, price: matchedProducts[0].getProdPrice() });

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
      payment.addPurchaseAmount(product.getProdPrice(), item.quantity);
      payment.addNonPromotionAmount(product.getProdPrice() * item.quantity); // 프로모션 아닌 상품은 나중에 멤버십 할인 계산을 위해 더해놓음
      payment.addPurchaseCount(item.quantity);
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

    this.updateProductQuantity(promotionProduct, actualQuantity); //수량 업데이트
    payment.addPromotionItems(item.name, promoApplicableCount * freeQuantity) //총 증정수량 계산
    payment.addPurchaseCount(actualQuantity); // 총 구매 개수 계산
    payment.addPurchaseAmount(promotionProduct.getProdPrice(), actualQuantity); //총 금액 계산
    payment.addPromotionDiscount(promotionProduct.getProdPrice(), promoApplicableCount * freeQuantity); //할인 금액 계산
  }

  handlePartialPromotion(item, promotionProduct, matchedProducts, promotion, payment) {
    const { requiredQuantityForPromo, freeQuantity, promoCycleQuantity } = this.calculatePromotionQuantities(item, promotion);
    const buyPromQuantity = Math.floor(item.quantity / promoCycleQuantity) * requiredQuantityForPromo;
    const buyOriginQuantity = item.quantity - buyPromQuantity;

    if (InputView.checkPromoExclusion(item.name, buyOriginQuantity)) {
      this.updateProductQuantity(promotionProduct, buyPromQuantity);
      this.updateProductQuantity(matchedProducts[1], buyOriginQuantity);
      payment.addPromotionItems(item.name, promoApplicableCount * freeQuantity) //총 증정수량 계산
      payment.addPurchaseCount(item.quantity); // 총 구매 수량 계산 
      payment.addPurchaseAmount(promotionProduct.getProdPrice(), item.quantity); //총 구매액 계산
      payment.addPromotionDiscount(promotionProduct.getProdPrice(), promoApplicableCount * freeQuantity); // 총 행사 할인 계산
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
