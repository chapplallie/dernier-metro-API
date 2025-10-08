// Pure functions for time logic

function computeNextHHMM(baseDate, headwayMin) {
    const next = new Date(baseDate.getTime() + headwayMin * 60 * 1000);
    return formatHHMM(next);
}

function formatHHMM(date) {
    return String(date.getHours()).padStart(2, '0') + ':' + String(date.getMinutes()).padStart(2, '0');
}

module.exports = { computeNextHHMM, formatHHMM };