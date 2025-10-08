const { computeNextHHMM, formatHHMM } = require('../src/lib/time');

describe('formatHHMM', () => {
    test('formats single digit hour and minute', () => {
        const date = new Date(2023, 0, 1, 7, 5);
        expect(formatHHMM(date)).toBe('07:05');
    });
    test('formats double digit hour and minute', () => {
        const date = new Date(2023, 0, 1, 13, 45);
        expect(formatHHMM(date)).toBe('13:45');
    });
    test('midnight', () => {
        const date = new Date(2023, 0, 1, 0, 0);
        expect(formatHHMM(date)).toBe('00:00');
    });
    test('end of day', () => {
        const date = new Date(2023, 0, 1, 23, 59);
        expect(formatHHMM(date)).toBe('23:59');
    });
});

describe('computeNextHHMM', () => {
    test('adds 3 minutes', () => {
        const base = new Date(2023, 0, 1, 12, 30);
        expect(computeNextHHMM(base, 3)).toBe('12:33');
    });
    test('adds 0 minutes', () => {
        const base = new Date(2023, 0, 1, 12, 30);
        expect(computeNextHHMM(base, 0)).toBe('12:30');
    });
    test('rolls over hour', () => {
        const base = new Date(2023, 0, 1, 12, 59);
        expect(computeNextHHMM(base, 2)).toBe('13:01');
    });
    test('rolls over day', () => {
        const base = new Date(2023, 0, 1, 23, 59);
        expect(computeNextHHMM(base, 2)).toBe('00:01');
    });
    test('handles negative headway', () => {
        const base = new Date(2023, 0, 1, 10, 10);
        expect(computeNextHHMM(base, -10)).toBe('10:00');
    });
    test('handles large headway', () => {
        const base = new Date(2023, 0, 1, 10, 10);
        expect(computeNextHHMM(base, 120)).toBe('12:10');
    });
    test('handles headway over midnight', () => {
        const base = new Date(2023, 0, 1, 23, 50);
        expect(computeNextHHMM(base, 15)).toBe('00:05');
    });
    test('handles leap year', () => {
        const base = new Date(2024, 1, 29, 23, 59);
        expect(computeNextHHMM(base, 2)).toBe('00:01');
    });
    test('handles DST forward', () => {
        // DST forward: 2023-03-26 01:59 -> 03:00 in Europe/Paris
        const base = new Date('2023-03-26T01:59:00+01:00');
        expect(computeNextHHMM(base, 2)).toMatch(/03:01|02:01/); // JS Date may not handle TZ
    });
    test('handles DST backward', () => {
        // DST backward: 2023-10-29 02:59 -> 02:00 in Europe/Paris
        const base = new Date('2023-10-29T02:59:00+02:00');
        expect(computeNextHHMM(base, 2)).toMatch(/03:01|02:01/);
    });
});