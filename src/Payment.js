const MEMBERSHIP_DISCOUNT_RATE = 0.3;
const MAX_MEMBERSHIP_DISCOUNT = 8000;

export class Payment { // 추가 구매 시 모든 변수 값 초기화하는 메서드 필요!
    #totalPurchaseAmount;
    #promotionDiscount;
    #membershipDiscount;
    #totalNonPromotionAmount;

    #resultQuantity;
    #resultTotalAmount;
    #resultPromDiscount;
    #resultMembershipDiscount;
    #resultHaveToPay;

    #PromotionItemsList;

    constructor() {
        this.#totalPurchaseAmount = 0;
        this.#promotionDiscount = 0;
        this.#membershipDiscount = 0;
        this.#totalNonPromotionAmount = 0;

        this.#resultQuantity = 0;
        this.#resultTotalAmount = 0;
        this.#resultPromDiscount = 0;
        this.#resultMembershipDiscount = 0;
        this.#resultHaveToPay = 0;

        this.#PromotionItemsList = [];
    }

    addPromotionItems(prodName, prodPromotionCount) {
        this.#PromotionItemsList.push([prodName, prodPromotionCount]);
    }

    getPromotionItems() {
        return this.#PromotionItemsList;
    }

    addPurchaseCount(quantity) {
        this.#resultQuantity += quantity;
    }

    addPurchaseAmount(price, quantity) {
        this.#resultTotalAmount += price * quantity;
    }

    addPromotionDiscount(price, quantity) {
        this.#promotionDiscount += price * quantity;
    }

    addNonPromotionAmount(amount) {
        this.#totalNonPromotionAmount += amount;
    }

    calculateMembershipDiscount() {
        this.#resultMembershipDiscount = Math.min(this.#totalNonPromotionAmount * MEMBERSHIP_DISCOUNT_RATE, MAX_MEMBERSHIP_DISCOUNT);
    }

    initMembershipDiscount() {
        this.#resultMembershipDiscount = 0;
    }

    calculateFinalAmount() {
        this.#resultPromDiscount = this.#promotionDiscount;
        this.#resultHaveToPay = this.#resultTotalAmount - this.#resultPromDiscount - this.#resultMembershipDiscount;
    }

    IsNotZeroTotalNonPromotionAmount() {
        return this.#totalNonPromotionAmount !== 0;
    }

    getResultQuantity() {
        return this.#resultQuantity;
    }

    getResultTotalAmount() {
        return this.#resultTotalAmount;
    }

    getResultPromDiscount() {
        return this.#resultPromDiscount;
    }

    getResultMembershipDiscount() {
        return this.#resultMembershipDiscount;
    }

    getResultHaveToPay() {
        return this.#resultHaveToPay
    }
}