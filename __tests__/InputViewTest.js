import { InputView } from "../src/InputView";
import { MissionUtils } from "@woowacourse/mission-utils";

jest.mock('@woowacourse/mission-utils');

describe('InputView 클래스 테스트', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    })

    test('readItem 함수 테스트', async () => {
        MissionUtils.Console.readLineAsync.mockResolvedValue('[사이다-2],[감자칩-1]');

        const items = await InputView.readItem();

        expect(items).toEqual([
            { name: '사이다', quantity: 2 },
            { name: '감자칩', quantity: 1 }
        ]);
    });

    test.each(['N', 'Y'])('checkMembershipDiscount 함수 테스트 - 입력값: %s', async (inputValue) => {
        MissionUtils.Console.readLineAsync.mockResolvedValue(inputValue);

        const result = await InputView.checkMembershipDiscount();

        if (inputValue === 'Y') {
            expect(result).toBe(true);
        }
        if (inputValue === 'N') {
            expect(result).toBe(false);
        }
    })


    test('checkPromotionExclusion 함수 테스트', async () => {
        MissionUtils.Console.readLineAsync.mockResolvedValue('N');

        const result = await InputView.checkPromotionExclusion('콜라', 4);

        expect(result).toBe(false);
    });

    test.each(['Y', 'N'])('checkForOtherItems 함수 테스트 - 입력값 : %s', async (inputValue) => {
        MissionUtils.Console.readLineAsync.mockResolvedValue(inputValue);

        const result = await InputView.checkForOtherItems();

        if (inputValue === 'Y') {
            expect(result).toBe(true);
        }
        if (inputValue === 'N') {
            expect(result).toBe(false);
        }
    });

    test.each(['Y', 'N'])('checkForFreeItemOffer 함수 테스트 - 입력값 : %s', async (inputValue) => {
        MissionUtils.Console.readLineAsync.mockResolvedValue(inputValue);

        const result = await InputView.checkForFreeItemOffer('오렌지주스', 1);

        if (inputValue === 'Y') {
            expect(result).toBe(true);
        }
        if (inputValue === 'N') {
            expect(result).toBe(false);
        }
    });
})