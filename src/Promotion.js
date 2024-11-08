export class Promotion {
    #name;
    #buy;
    #get;
    #startDate;
    #endDate;

    constructor(name, buy, get, startDate, endDate) {
        this.#name = name;
        this.#buy = buy;
        this.#get = get;
        this.#startDate = startDate;
        this.#endDate = endDate;
    }

    isActive() {
        const today = new Date();
        return today >= this.#startDate && today <= this.#endDate;
    }

    calculateFreeItems(quantity) {
        if (this.#buy !== 0 && this.#get !== 0 && quantity >= this.#buy) {
            return Math.floor(quantity / this.#buy) * this.#get;
        }
        return 0;
    }

    getPromName() {
        return this.#name;
    }

    giveBuy() {
        return this.#buy;
    }

    giveGet() {
        return this.#get;
    }
}