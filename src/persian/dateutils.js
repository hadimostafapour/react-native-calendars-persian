const XDate = require('xdate');
const moment = require('moment-jalaali');

const cache = {
  sameMonth: {},
  dates: {},
  months: {}
};

let isIntlSupported = typeof Intl !== 'undefined' && typeof Intl.DateTimeFormat === 'function';

function pFormat(xd, format) {
    return toPersian(moment(typeof xd === 'string' ? xd : xd.toDate()).format(format));
}

function pMoment(xd){
  return moment(xd.toDate());
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

function toPersian(string){
  return (string + '').replace(/\d/g, function (i) {
    return String.fromCharCode(parseInt(i) + 1776);
  });
}

function pDateDay(xd) {

  const key = xd.toDateString();
  if (cache.dates.hasOwnProperty(key)) {
    return cache.dates[key];
  }

  if (isIntlSupported) {
    const options = {day: 'numeric'};
    return cache.dates[key] = new Intl.DateTimeFormat('fa-IR', options).format(xd.toDate());
  }

  return cache.dates[key] = toPersian(pMoment(xd).jDate());
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

  const key = a.toDateString() + b.toDateString();
  if (cache.sameMonth.hasOwnProperty(key)) {
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

    a = pMoment(a);
    b = pMoment(b);
    return a.jYear() === b.jYear() &&
      a.jMonth() === b.jMonth();
  }

  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth();
}


function toXd(moment){
  return new XDate(moment.year(), moment.month(), moment.date(), 0, 0, 0, true)
}

function month(xd, jalali = false) {

  const key = xd.toDateString();
  if(cache.months.hasOwnProperty(key)) return cache.months[key];

  const year = xd.getFullYear(), month = xd.getMonth();
  const days = new Date(year, month + 1, 0).getDate();
  const firstDay = jalali ? toXd(pMoment(xd).startOf('jMonth')) : new XDate(year, month, 1, 0, 0, 0, true);
  const lastDay = jalali ? toXd(pMoment(xd).endOf('jMonth')) : new XDate(year, month, days, 0, 0, 0, true);
  return cache.months[key] = fromTo(firstDay, lastDay);
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

  const fromDate = pMoment(isNegative ? b : a);
  const toDate = pMoment(isNegative ? a : b);

  let fromMonth = fromDate.jMonth();
  let toMonth = toDate.jMonth();

  let yearsDiff = toDate.jYear() - fromDate.jYear();
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
  toPersian,
  pFormat,
  sameMonth,
  month,
  pDiffMonths,
  pDateDay
};