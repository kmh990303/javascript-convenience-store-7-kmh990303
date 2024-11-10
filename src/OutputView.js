import { MissionUtils } from "@woowacourse/mission-utils";

export const OutputView = {
    printIntro() {
        MissionUtils.Console.print('안녕하세요. W편의점입니다.');
        MissionUtils.Console.print('현재 보유하고 있는 상품입니다.\n');
    },

    printProducts(productsList) {
        for (const product of productsList) {
            const name = product.getProdName();
            const price = product.getProdPrice().toLocaleString();
            const quantity = (product.getProdQuantity() === 0 ? '재고 없음' : `${product.getProdQuantity()}개`);
            const promotion = product.getProdPromotion().includes('null') ? '' : product.getProdPromotion();

            MissionUtils.Console.print(`- ${name} ${price}원 ${quantity} ${promotion}`);
        }
        MissionUtils.Console.print('');
    },

    printBuyProductsList(buyProductsList) {
        MissionUtils.Console.print('상품명\t\t수량\t금액');
        for (const product of buyProductsList) {
            const name = product.name.padEnd(8); // 상품명 열 길이 설정
            const quantity = String(product.quantity).padStart(1); // 수량 열 길이 설정
            const total = (product.price * product.quantity).toLocaleString().padStart(4); // 금액 열 길이 설정

            MissionUtils.Console.print(`${name}\t${quantity}\t${total}`);
        }
    },

    printGetPromotionsList(PromotionItemsList, checkGetMembership = 'N') {
        if (checkGetMembership === 'Y') {
            MissionUtils.Console.print('=============증정===============');
            for (const [name, quantity] of PromotionItemsList) {
                MissionUtils.Console.print(`${name.padEnd(8)}\t${String(quantity).padStart(1)}`);
            }
        }
        MissionUtils.Console.print('====================================');
    },

    printPayResult(payment) {
        MissionUtils.Console.print(
            `총구매액\t${String(payment.getResultQuantity()).padStart(1)}\t${payment.getResultTotalAmount().toLocaleString().padStart(5)}`
        );
        MissionUtils.Console.print(
            `행사할인\t${(-payment.getResultPromDiscount()).toLocaleString().padStart(14)}`
        );
        MissionUtils.Console.print(
            `멤버십할인\t${(-payment.getResultMembershipDiscount()).toLocaleString().padStart(14)}`
        );
        MissionUtils.Console.print(
            `내실돈\t${payment.getResultHaveToPay().toLocaleString().padStart(22)}`
        );
    },


    printResult(buyProductsList, PromotionItemsList, payment, checkGetMembership) {
        MissionUtils.Console.print('==============W 편의점================');
        this.printBuyProductsList(buyProductsList);
        this.printGetPromotionsList(PromotionItemsList, checkGetMembership);
        this.printPayResult(payment);
        MissionUtils.Console.print('');
    }
};
