import { readFileSync } from 'fs';
const calendarInfo = JSON.parse(readFileSync('./japanese_calendar.json'));

/**
 * 指定元号の始まりの年を取得する
 * @param {string} era
 * @returns {number|null}
 */
export function GetStartYear(era) {
    for (const cal of calendarInfo.borders) {
        const longEra = cal.jcalendar;
        if (longEra === era || longEra.substring(0, 1) === era || cal.jalphabet === era) return cal.begin[0];
    }
    return null;
}

/**
 * 日付を年・月・日に分割する
 * @param {string} dateNum
 * @returns
 */
export function dateSplit(dateNum) {
    const splitData = dateNum.split(/[\/.-]/);
    if (splitData.length === 3) {
        return {
            year: splitData[0],
            month: splitData[1],
            day: splitData[2],
        };
    } else if (splitData.length === 1) {
        if (dateNum.length < 5 || dateNum.length > 7) return null;
        return {
            year: dateNum.substring(0, dateNum.length - 4),
            month: dateNum.substring(dateNum.length - 4, dateNum.length - 2),
            day: dateNum.substring(dateNum.length - 2),
        };
    } else return null;
}

/**
 * 
 * @param {{year: string, month: string, day: string}|null} dateMap 
 * @returns {{year: number, month: number, day: number}|null}
 */
export function parseStringMapToNumMap(dateMap) {
    if (dateMap == null) return null;
    const ret = {};
    for (const [key, value] of Object.entries(dateMap)) {
        if (!value.match(/^\d{1,}$/)) return null;
        ret[key] = parseInt(value);
        if (isNaN(ret[key])) return null;
    }
    return ret;
}

/**
 * 和暦日付を西暦日付に変換する
 * @param {string} jpCalendar
 * @returns {}
 */
export function JPToAnno(jpCalendar) {
    const dateInfo = jpCalendar.match(/(?<era>[^\d]+)(?<year>\d{1,3})[-/.]*(?<month>\d{2})[-/.]*(?<day>\d{2})/);
    if (dateInfo == null || dateInfo.length != 5) return null;
    const StartYear = GetStartYear(dateInfo.groups.era);
    if (StartYear == null) return null;
    return {
        year: parseInt(dateInfo.groups.year) + StartYear - 1,
        month: parseInt(dateInfo.groups.month),
        day: parseInt(dateInfo.groups.day)
    };
}
