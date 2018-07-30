const XDate = require('xdate');
const PDate = require('persian-date');
const JDate = require('./jdate');

const cache = {
  sameMonth: {},
  dates: {}
};


let isIntlSupported = typeof Intl !== 'undefined' && typeof Intl.DateTimeFormat === 'function';

function pDate(xd) {
  return new PDate(xd instanceof XDate ? xd.toDate() : xd);
}

function jDate(xd) {
  return new JDate(new Date(xd.getFullYear(), xd.getMonth(), xd.getDate()));
}

var pSetLocale = function () {

  XDate.locales['fa'] = {
    dayNamesShort: [
      'ی',
      'د',
      'س',
      'چ',
      'پ',
      'ج',
      'ش',
    ],
    monthNamesShort: [
      'فرو',
      'اردیبهشت',
      'خرداد',
      'تیر',
      'شهریور',
      'مرداد',
      'مهر',
      'آبان',
      'آذر',
      'دی',
      'بهمن',
      'اسفند',
    ],
    monthNames: [
      'فرو',
      'اردیبهشت',
      'خرداد',
      'تیر',
      'شهریور',
      'مرداد',
      'مهر',
      'آبان',
      'آذر',
      'دی',
      'بهمن',
      'اسفند',
    ]
  };
};

function pDateDay(xd) {

  if (isIntlSupported) {
    const options = {day: 'numeric'};
    return new Intl.DateTimeFormat('fa-IR', options).format(xd.toDate());
  }

  const key = xd.toString();
  if (cache.dates[key]) {
    return cache.dates[key];
  }

  return cache.dates[key] = pDate(xd).format('D');
}

/**
 * to improve speed in jalali calculations
 * @param a
 * @param b
 * @param jalali
 * @returns {*}
 */
function sameMonth(a, b, jalali = false) {

  if (!(a instanceof XDate && b instanceof XDate)) return false;

  const key = a.toString() + b.toString();

  if (cache.sameMonth[key]) {
    return cache.sameMonth[key];
  }

  return cache.sameMonth[key] = isSameMonth(a, b, jalali);
}

function isSameMonth(a, b, jalali = false) {

  if (jalali) {

    if (isIntlSupported) {

      const options = {year: 'numeric', month: 'numeric'};

      a = new Intl.DateTimeFormat('fa-IR', options).format(a.toDate());
      b = new Intl.DateTimeFormat('fa-IR', options).format(b.toDate());

      return a === b;
    }

    // Android does not supoort Intl
    // pDate is too slow
    // jDate has some issues to calculate days, but months are right and has better performance
    // Cache is provided to improve performance

    a = jDate(a);
    b = jDate(b);
    return a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth();
  }

  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth();
}

function month(xd, jalali = false) {
  const year = xd.getFullYear(), month = xd.getMonth();
  const days = new Date(year, month + 1, 0).getDate();
  const firstDay = jalali ? pDate(xd).date(1) : new XDate(year, month, 1, 0, 0, 0, true);
  const lastDay = jalali ? pDate(xd).endOf('month') : new XDate(year, month, days, 0, 0, 0, true);
  return fromTo(firstDay, lastDay);
}

function fromTo(a, b) {
  const days = [];
  let from = +a, to = +b;
  for (; from <= to; from = new XDate(from, true).addDays(1).getTime()) {
    days.push(new XDate(from, true));
  }
  return days;
}

function pDiffMonths(a, b) {

  const isNegative = a.diffDays(b) < 0;

  const fromDate = pDate(isNegative ? b : a).toLocale('en').date(1);
  const toDate = pDate(isNegative ? a : b).toLocale('en').date(1);

  let fromMonth = fromDate.month();
  let toMonth = toDate.month();

  let yearsDiff = toDate.year() - fromDate.year();
  let monthsDiff = 0;

  let targetMonth = yearsDiff ? 12 : toMonth;


  while (fromMonth <= targetMonth) {

    if (fromMonth < targetMonth) monthsDiff++;

    fromMonth++;

    if (fromMonth >= targetMonth) {
      if (yearsDiff) {
        yearsDiff--;
        fromMonth = 0;
        targetMonth = yearsDiff ? 12 : toMonth;
      }
    }
  }

  return isNegative ? -monthsDiff : monthsDiff;
}

module.exports = {
  pSetLocale,
  pDate,
  sameMonth,
  month,
  pDiffMonths,
  pDateDay
};