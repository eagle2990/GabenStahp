///<reference path="interfaces/UserDetails.ts"/>
/**
 * Created by EAGLE on 24/02/2017.
 */

import request = require("request");
import async = require("async");

import {Utils} from "./extra/utils";
import {Money} from "./interfaces/Money";
import {Expense} from "./interfaces/Expense";
import {TotalExpensesDetails} from "./interfaces/TotalExpensesDetails";
import {UserDetails} from "./interfaces/UserDetails";


module.exports = function main(ctx, cb) {
    var username: string = ctx.data.username;
    if (!username) cb(new Error("You need to include your community user (the one that appears when you enter your profile. Example https://steamcommunity.com/id/community_user"));

    var min_wage_earnings_per_hour: number = ctx.data.min_wage_hour;
    if (!min_wage_earnings_per_hour) cb(new Error("You need to include the minimum wage PER HOUR of the place you are living"));

    const STEAM_API_KEY: string = ctx.data.STEAM_API_KEY;
    if (!STEAM_API_KEY) cb(new Error("Somebody forgot to include the Steam API key. Call the admin"));


    var user = <UserDetails>{};
    var start;
    var end;

    var errors = [];

    async.waterfall([
        getSteamId,
        getUserCountry,
        getUserDefaultCurrency,
        getSteamGames,
        getExpenses,
        addExpenses
    ], function (err, results) {
        if (err) cb(new Error(err));
        end = new Date();
        console.log("End: " + end);
        console.log("Difference: " + (end - start));
        cb(err, results);
    });

    function getSteamId(callback) {
        start = new Date();
        request.get("https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=" + STEAM_API_KEY + "&vanityurl=" + username,
            function (err, response, body) {
                if (err) cb(new Error(err));
                user.steam_id = JSON.parse(body)["response"].steamid;
                console.log("Start: " + start);
                console.log("Getting user id " + user.steam_id);
                callback(null, user);
            });
    }

    function getUserCountry(user_info: UserDetails, callback) {
        request.get("http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=" + STEAM_API_KEY + "&steamids=" + user_info.steam_id,
            function (err, response, body) {
                if (err) cb(new Error(err));
                console.log("Getting user country");
                var country = JSON.parse(body)["response"]["players"][0]["loccountrycode"];
                user.country_code = (country ? country : "US");
                callback(null, user);
            });
    }

    function getUserDefaultCurrency(user_info: UserDetails, callback) {
        request.get("http://country.io/currency.json",
            function (err, response, body) {
                if (err) cb(new Error(err));
                console.log("Getting user currency");
                user.currency = JSON.parse(body)[user_info.country_code];
                callback(null, user);
            });
    }

    function getSteamGames(user_info: UserDetails, callback) {
        request.get("http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=" + STEAM_API_KEY + "&steamid=" + user_info.steam_id + "&include_appinfo=1&include_played_free_games=1",
            function (err, response, body) {
                if (err) cb(new Error(err));
                console.log("Getting steam games");
                try {
                    callback(null, JSON.parse(body)["response"].games);
                } catch (e) {
                    cb (new Error("Couldn't parse json for user " + user_info.steam_id + "\n" + e));
                }
            });
    }

    function getExpenses(games, callback) {
        async.map(
            games,
            getPriceAndMinutesSpentPerGame,
            function (err, results: Expense) {
                if (err) cb(new Error(err));
                console.log("Getting used time and money");
                callback(null, results)
            })
    };

    function getPriceAndMinutesSpentPerGame(game, callback) {
        request.get("http://store.steampowered.com/api/appdetails?appids=" + game.appid,
            function (err, response, body) {
                if (err) cb(new Error(err));
                console.log("Data of game " + game.appid);
                var price: Money = {currency: user.currency, amount: 0};
                if (body) {
                    var data;
                    try {
                        data = JSON.parse(body)[game.appid].data;
                    } catch (e) {
                        console.log(body);
                        errors.push((new Error("Couldn't parse json for game " + game.appid + "\n" + e)));
                    }

                    if (data && data.price_overview) {
                        price = {
                            amount: data.price_overview.final / 100,
                            currency: data.price_overview.currency
                        };
                    }
                }

                callback(errors.length > 0 ? errors : null, {spent_money: price, spent_minutes: game.playtime_forever});
            });
    }

    function addExpenses(expenses, callback) {
        async.reduce(
            expenses,
            {spent_minutes: 0, spent_money: {currency: user.currency, amount: 0.0}},
            function (memo: Expense, expense: Expense, callback) {
                callback(null,
                    {
                        spent_minutes: Utils.calculateTotalMinutes(memo.spent_minutes, expense.spent_minutes),
                        spent_money: Utils.calculateExpenseByCurrency(memo.spent_money, expense.spent_money)
                    }
                );
            },
            function (err, result) {
                if (err) console.log(result);
                console.log("Adding expenses");
                callback(null, getExpensesDetails(result));
            }
        );
    }

    function getExpensesDetails(expenses: Expense): TotalExpensesDetails {
        console.log("Setting summary");
        return {
            total_hours_played: Utils.FromMinutesToHours(expenses.spent_minutes),
            total_in_games: expenses.spent_money.amount,
            total_spent: getUnearnedWage(Utils.FromMinutesToHours(expenses.spent_minutes), expenses.spent_money.amount),
            currency: expenses.spent_money.currency
        }
    }

    function getUnearnedWage(hours: number, games_total: number) {
        return Utils.ToDecimals(games_total + hours * min_wage_earnings_per_hour, 2);
    }
};

