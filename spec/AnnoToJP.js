import dayjs from 'dayjs';
import { DateCompareManager } from './DateCompareManager.js';
import { readFileSync } from 'fs';
const calendarInfo = JSON.parse(readFileSync('./japanese_calendar.json'));
const Borders = calendarInfo.borders.map(c => ({
    jcalendar: c.jcalendar,
    alphabet: c.jalphabet,
    border: new DateCompareManager(...c.begin),
}));

/**
 *
 * @param {string|number} dateData
 * @returns {dayjs.Dayjs|null}
 */
function ToDateCompareManager(dateData) {
    if (typeof dateData !== 'number' && typeof dateData !== 'string') return null;
    if (typeof dateData === 'number' && !Number.isFinite(dateData)) return null;
    const ret = typeof dateData === 'number' ? dayjs(dateData.toString()) : dayjs(dateData);
    return ret.isValid() ? DateCompareManager.FromDayjs(ret) : null;
}

/**
 * @param {{year: number, month: number, day: number}} beginBorderInfo
 * @param {{jcalendar: string, alphabet: string, border: DateCompareManager}} endInfo
 * @returns 
 */
function CreatePastEraResponse(beginBorderInfo, endInfo) {
    const EndDate = new Date(endInfo.border.year, endInfo.border.month - 1, endInfo.border.day);
    EndDate.setDate(EndDate.getDate() - 1);
    return {
        begin: beginBorderInfo,
        end: {
            year: EndDate.getFullYear(),
            month: EndDate.getMonth() + 1,
            day: EndDate.getDate(),
        }
    };
}

/**
 * 指定された元号の表記、開始日、終了日を取得する
 * @param {string} era
 * @returns {{ begin: { year: number, month: number, day: number }, end: { year: number, month: number, day: number } }|{ begin: { year: number, month: number, day: number } }|null}
 */
export function GetBorderInfoFromEra(era) {
    /** @type {number|null} */
    let beginInfoIndex = null;
    const beginInfo = Borders.find(
        (b, i) => (
            (beginInfoIndex = i), b.alphabet === era || b.jcalendar === era || b.jcalendar.substring(0, 1) === era
        )
    );
    if (beginInfo == null || beginInfoIndex == null) return null;
    const beginBorderInfo = {
        year: beginInfo.border.year,
        month: beginInfo.border.month,
        day: beginInfo.border.day,
    };
    if (beginInfoIndex === Borders.length - 1) return { begin: beginBorderInfo };
    else {
        const endInfo = Borders[beginInfoIndex + 1];
        return CreatePastEraResponse(beginBorderInfo, endInfo);
    }
}

/**
 * 指定された西暦の日付を和暦の日付に変換する
 * @param {string|number} dateData
 * @returns { era: { long: string, short: string, alphabet: string }, border: { year: number, month: number, day: number }}
 */
export function GetJapaneseCalendar(dateData) {
    const dayInfo = ToDateCompareManager(dateData);
    if (dayInfo == null) return null;
    const i = Borders.findIndex(b => b.border.greater(dayInfo))
    if (i === 0) return null;
    const data = Borders[i - 1];
    return {
        era: {
            long: data.jcalendar,
            short: data.jcalendar.substring(0, 1),
            alphabet: data.alphabet,
        },
        calendar: {
            year: dayInfo.year - data.border.year + 1,
            month: dayInfo.month,
            day: dayInfo.day,
        },
    };
}

/**
 * 指定された日付の元号を取得する
 * @param {string|number} dateData
 * @returns {{long: string, short: string, alphabet: string}|null}
 */
export function GetEra(dateData) {
    const data = GetJapaneseCalendar(dateData);
    if (data == null) return null;
    return data.era;
}
