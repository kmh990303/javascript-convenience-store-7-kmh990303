export class Product {
    #name;
    #price;
    #quantity;
    #promotion;
    #membershipDiscount;

    constructor(name, price, quantity, promotion) {
        this.#name = name;
        this.#price = price;
        this.#quantity = quantity;
        this.#promotion = promotion;
        this.#membershipDiscount = 0;
    }

    addMembershipDiscount(amount) {
        this.#membershipDiscount += amount;
    }

    reduceQuantity(amount) {
        if (this.#quantity >= amount) this.#quantity -= amount;
    }

    isRemainProduct(amount) {
        return this.#quantity >= amount
    }

    isZeroProduct() {
        return this.#quantity === 0;
    }

    checkPromotion() {
        if (this.#promotion.includes('탄산2+1')) return { buy: 2, get: 1 };
        if (this.#promotion.includes('MD추천상품')) return { buy: 1, get: 1 };
        if (this.#promotion.includes('반짝할인')) return { buy: 1, get: 1 };
        if (this.#promotion.includes('null')) return { buy: 0, get: 0 };
    }

    getProdName() {
        return this.#name;
    }

    getProdPrice() {
        return this.#price;
    }

    getProdQuantity() {
        return this.#quantity;
    }

    getProdPromotion() {
        return this.#promotion;
    }
}