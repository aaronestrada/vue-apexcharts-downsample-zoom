export function generateTemperaturePoints({
                                              startDate,
                                              count,
                                              intervalMs,
                                              baseTemp = 18,
                                              dailyAmplitude = 7,
                                              noise = 1.2,
                                              warmingTrendPerHour = 0
                                          }) {
    return Array.from({length: count}, (_, index) => {
        const x = startDate.getTime() + (index * intervalMs);
        const hourOfDay = new Date(x).getHours();
        const dailyCycle = Math.sin((((hourOfDay - 5) / 24) * 2) * Math.PI);
        const randomNoise = (Math.random() * 2 - 1) * noise;
        const trend = index * (intervalMs / (60 * 60 * 1000)) * warmingTrendPerHour;
        const y = Number((baseTemp + (dailyCycle * dailyAmplitude) + trend + randomNoise).toFixed(1));

        return {x: x, y: y};
    });
}

export function pointFilter(points, minDate = null, maxDate = null) {
    if (minDate === null || maxDate === null)
        return points;

    return points.filter(point => point.x >= minDate && point.x <= maxDate);
}