// Live economics check for the paid diagnostic: can the model deliver the income
// in the days the founder wants to work? Pure function, used by the page and the report.

export const DEFAULTS = { weeksPerYear: 44, sellingShare: 0.3, comfortable: 80 };

/**
 * @param {object} i
 *   targetIncome  annual personal income wanted (£)
 *   annualCosts   annual business costs (£), default 0
 *   price         price of the main offer, per client or project (£)
 *   daysPerSale   delivery days each client or project takes
 *   daysPerWeek   days a week the founder wants to work
 *   weeksPerYear  working weeks a year (default 44)
 *   sellingShare  share of working time needed for selling and admin (default 0.3)
 */
export function economics(i) {
  const n = (v, d = 0) => (Number.isFinite(+v) && +v > 0 ? +v : d);
  const income = n(i.targetIncome), costs = n(i.annualCosts), price = n(i.price), perSale = n(i.daysPerSale);
  const days = n(i.daysPerWeek), weeks = n(i.weeksPerYear, DEFAULTS.weeksPerYear);
  const selling = Math.min(0.8, Math.max(0, i.sellingShare ?? DEFAULTS.sellingShare));
  if (!income || !price || !perSale || !days) return { complete: false };

  const revenueNeeded = income + costs;
  const salesNeeded = Math.ceil(revenueNeeded / price);
  const deliveryDaysNeeded = salesNeeded * perSale;
  const workingDays = days * weeks;
  const deliveryDaysAvailable = Math.round(workingDays * (1 - selling));
  const capacityPct = Math.round((deliveryDaysNeeded / deliveryDaysAvailable) * 100);
  const effectiveDayRate = Math.round(price / perSale);
  // The price per sale that would use only a comfortable share of delivery capacity.
  const comfortableSales = Math.max(1, Math.floor((deliveryDaysAvailable * DEFAULTS.comfortable) / 100 / perSale));
  const priceThatFits = Math.ceil(revenueNeeded / comfortableSales / 50) * 50;

  let status = "fits";
  if (capacityPct > 100) status = "does_not_fit";
  else if (capacityPct > DEFAULTS.comfortable) status = "tight";

  return {
    complete: true, revenueNeeded, salesNeeded, salesPerMonth: +(salesNeeded / 12).toFixed(1),
    deliveryDaysNeeded, deliveryDaysAvailable, capacityPct, effectiveDayRate, priceThatFits, status,
  };
}

export const STATUS_TEXT = {
  fits: "On these numbers, the model fits the time you want to give it, with room for the selling every business needs.",
  tight: "It can work, but only just. There's little slack for quiet months, illness or a client who takes longer than planned.",
  does_not_fit: "On these numbers, the model doesn't add up: you'd need more delivery days than you want to work. Something has to change: the price, the scope, how it's delivered, or the income target.",
};
