import { MissionUtils } from "@woowacourse/mission-utils"

export const InputView = {
    async readItem() {
        const input = await MissionUtils.Console.readLineAsync("구매하실 상품명과 수량을 입력해 주세요. (예: [사이다-2],[감자칩-1])\n");

        const items = input.split(',').map((item) => {
            const [name, quantity] = item.replace('[', '').replace(']', '').split('-');
            return { name, quantity: +quantity };
        })

        return items;
    },

    async checkMembershipDiscount() {
        const input = await MissionUtils.Console.readLineAsync("\n멤버십 할인을 받으시겠습니까? (Y/N)\n");
        await MissionUtils.Console.print('');

        if (input === 'Y') {
            return true;
        }
        if (input === 'N') {
            return false;
        }
    },

    async checkPromoExclusion(name, quantity) {
        const input = await MissionUtils.Console.readLineAsync(`현재 ${name} ${quantity}개는 프로모션 할인이 적용되지 않습니다. 그래도 구매하시겠습니까? (Y/N)`);

        if (input === 'Y') {
            return true;
        }
        if (input === 'N') {
            return false;
        }
    },

    async checkForOtherItems() {
        const input = await MissionUtils.Console.readLineAsync('\n감사합니다. 구매하고 싶은 다른 상품이 있나요? (Y/N)\n');

        if (input === 'Y') {
            return true;
        }
        if (input === 'N') {
            return false;
        }
    },

    async checkForFreeItemOffer(name, quantity) {
        const input = await MissionUtils.Console.readLineAsync(`현재 ${name}은(는) ${quantity}개를 무료로 더 받을 수 있습니다. 추가하시겠습니까? (Y/N)`);

        if (input === 'Y') {
            return true;
        }
        if (input === 'N') {
            return false;
        }
    }
}