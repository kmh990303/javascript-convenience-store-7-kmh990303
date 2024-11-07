const MEMBERSHIP_DISCOUNT_RATE = 0.3;
const MAX_MEMBERSHIP_DISCOUNT = 8000;

export class Payment {
    #totalPurchaseAmount;
    #promotionDiscount;
    #membershipDiscount;
    #totalNonPromotionAmount;

    constructor() {
        this.#totalPurchaseAmount = 0;
        this.#promotionDiscount = 0;
        this.#membershipDiscount = 0;
        this.#totalNonPromotionAmount = 0;
    }

    addPurchaseAmount(amount) {
        this.#totalPurchaseAmount += amount;
    }

    addPromotionDiscount(price, quantity) {
        this.#promotionDiscount += price * quantity;
    }

    addNonPromotionAmount(amount) {
        this.#totalNonPromotionAmount += amount;
    }

    calculateMembershipDiscount() {
        return Math.min(this.#totalNonPromotionAmount * MEMBERSHIP_DISCOUNT_RATE, MAX_MEMBERSHIP_DISCOUNT);
    }

    calculateFinalAmount() {
        return this.#totalPurchaseAmount - this.#promotionDiscount - this.#membershipDiscount;
    }
}