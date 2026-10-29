// Keep engine amounts in integer units; one unit represents 1,000 eggs.
export const EGGS_PER_UNIT = 1000;
export const toEggs = (units:number) => units * EGGS_PER_UNIT;
export const fromEggs = (eggs:number) => eggs / EGGS_PER_UNIT;
export const formatMoney = (units:number) => new Intl.NumberFormat('vi-VN').format(toEggs(units)) + ' trứng';
