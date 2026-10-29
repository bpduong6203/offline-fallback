// Keep engine amounts in integer units; one unit represents 1,000 eggs.
export const EGGS_PER_UNIT = 1000;
export const toEggs = (units:number) => units * EGGS_PER_UNIT;
export const fromEggs = (eggs:number) => eggs / EGGS_PER_UNIT;
const moneyFormat = new Intl.NumberFormat('vi-VN');
export const formatMoney = (units:number) => moneyFormat.format(toEggs(units)) + ' trứng';
