import { MissionUtils } from "@woowacourse/mission-utils"


export const OutputView = {
    async printIntro() {
        await MissionUtils.Console.print('안녕하세요. W편의점입니다.');
        await MissionUtils.Console.print('현재 보유하고 있는 상품입니다.\n');
    },

    async printProducts(productsList) {
        for (const product of productsList) {
            const name = product.getProdName();
            const price = product.getProdPrice().toLocaleString();
            const quantity = product.getProdQuantity() === 0 ? '재고 없음' : `${product.getProdQuantity()}개`;
            const promotion = product.getProdPromotion().includes('null') ? '' : product.getProdPromotion();

            await MissionUtils.Console.print(`- ${name} ${price}원 ${quantity} ${promotion}`);
        }
        await MissionUtils.Console.print('');
    },

    async printBuyProductsList(buyProductsList) {
        await MissionUtils.Console.print('상품명		수량	금액\n');
        for (const product of buyProductsList) {
            await MissionUtils.Console.print(`${product.name}		${product.quantity}		${(product.price * product.quantity).toLocaleString()}\n`);
        }
    },

    async printGetPromotionsList(PromotionItemsList) {
        await MissionUtils.Console.print('=============증	정===============\n');
        for (const [name, quantity] of PromotionItemsList) {
            await MissionUtils.Console.print(`${name}		${quantity}\n`)
        }
        await MissionUtils.Console.print('====================================\n');
    },

    async printPayResult(payment) {
        await MissionUtils.Console.print(`총구매액		${payment.getResultQuantity()}	${(payment.getResultTotalAmount()).toLocaleString()}\n`);
        await MissionUtils.Console.print(`행사할인			-${(payment.getResultPromDiscount().toLocaleString())}\n`);
        await MissionUtils.Console.print(`멤버십할인			-${(payment.getResultMembershipDiscount()).toLocaleString()}\n`);
        await MissionUtils.Console.print(`내실돈			 ${(payment.getResultHaveToPay()).toLocaleString()}\n`);
    },

    async printResult(buyProductsList, PromotionItemsList, payment) {
        await MissionUtils.Console.print('\n==============W 편의점================\n');
        await this.printBuyProductsList(buyProductsList);
        await this.printGetPromotionsList(PromotionItemsList);
        await this.printPayResult(payment);
    }
}