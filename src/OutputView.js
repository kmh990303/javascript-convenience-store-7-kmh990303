import { MissionUtils } from "@woowacourse/mission-utils"


export const OutputView = {
    async printIntro() {
        await MissionUtils.Console.print('안녕하세요. W편의점입니다.');
        await MissionUtils.Console.print('현재 보유하고 있는 상품입니다.');
    },

    async printProducts(products) {
        for (const product of products) {
            await MissionUtils.Console.print(`- ${product.name} ${(product.price).toLocaleString()}원 ${product.quantity}개 ${product.promotion}\n`.trim());
        }
    },

    async printBuyProductsList(buyProductsList) {
        await MissionUtils.Console.print('상품명		수량	금액\n');
        for (const product of buyProductsList) {
            await MissionUtils.Console.print(`${product.name}		${product.quantity}		${(product.price * product.quantity).toLocaleString()}\n`);
        }
    },

    async printGetPromotionsList(getPromotionsList) {
        await MissionUtils.Console.print('=============증	정===============\n');
        for (const promotion of getPromotionsList) {
            await MissionUtils.Console.print(`${promotion.name}		${promotion.quantity}\n`)
        }
    },

    async printPayResult(priceList) {
        await MissionUtils.Console.print(`총구매액		${priceList.quantity}	${(priceList.price).toLocaleString()}\n`);
        await MissionUtils.Console.print(`행사할인			-${(priceList.totalDiscount.toLocaleString())}\n`);
        await MissionUtils.Console.print(`멤버십할인			-${(priceList.memberDiscount).toLocaleString()}\n`);
        await MissionUtils.Console.print(`내실돈			 ${(priceList.totalChange).toLocaleString()}\n`);
    },

    async printResult(buyProductsList, getPromotionsList, payResult) {
        await MissionUtils.Console.print('==============W 편의점================\n');
        await this.printBuyProductsList(buyProductsList);
        await this.printGetPromotionsList(getPromotionsList);
        await this.printPayResult(payResult);
    }
}