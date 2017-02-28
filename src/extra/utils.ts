import {Money} from "../interfaces/Money";
/**
 * Created by EAGLE on 26/02/2017.
 */
export class Utils {
    private static MINUTES_IN_HOUR: number = 60;

    public static ToDecimals(value, decimals: number) {
        return parseFloat(value.toFixed(decimals));
    }

    public static FromMinutesToHours(minutes: number) {
        return minutes / this.MINUTES_IN_HOUR;
    }

    public static calculateExpenseByCurrency(memo: Money, expense: Money): Money {
        return {currency: expense.currency, amount: Utils.ToDecimals(memo.amount + expense.amount, 2)};
    }

    public static calculateTotalMinutes(currentValue, minutes) {
        return currentValue + minutes;
    }
}