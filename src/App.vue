<script>
import {toRaw} from "vue";
import {LTTB} from 'downsample/methods/LTTB';

import {generateTemperaturePoints, pointFilter} from '@/libs/Helpers.js';

const RANGE_MIN_MAX_INVISIBLE_LABEL = 'rangeMinMaxInvisible';


export default {
  name: 'App',
  data() {
    /**
     * As a test, we generate three temperature datasets with different parameters
     */
    let northStationData = generateTemperaturePoints({
      startDate: new Date('2026-01-01T00:00:00'),
      count: 10000,
      intervalMs: 60 * 1000,
      baseTemp: 15,
      dailyAmplitude: 6.5,
      noise: 1.1,
      warmingTrendPerHour: 0.0021
    });

    let cityCenterData = generateTemperaturePoints({
      startDate: new Date('2026-01-01T00:00:00'),
      count: 10000,
      intervalMs: 63 * 1000,
      baseTemp: 18,
      dailyAmplitude: 7.2,
      noise: 1.3,
      warmingTrendPerHour: 0.0025
    });

    let southStationData = generateTemperaturePoints({
      startDate: new Date('2026-01-01T00:00:00'),
      count: 10000,
      intervalMs: 58 * 1000,
      baseTemp: 20,
      dailyAmplitude: 6.8,
      noise: 1.0,
      warmingTrendPerHour: 0.0015
    });

    /**
     * Find the minimum and maximum dates in the generated datasets
     */
    const allX = [northStationData, cityCenterData, southStationData].flatMap(s => s.map(p => p.x));

    let minimumDate = Math.min(...allX);
    let maximumDate = Math.max(...allX);

    /**
     * Downsampling of generated datasets to reduce the number of points.
     * In this case, we use the LTTB method with 700 points per dataset.
     */
    let northStationLTTB = LTTB(northStationData, 700);
    let cityCenterLTTB = LTTB(cityCenterData, 700);
    let southStationLTTB = LTTB(southStationData, 700);

    /**
     * Keep datasets in the reactive state
     * to be accessible in the component
     */
    return {
      toRaw,
      data: {
        northStation: {
          raw: northStationData,
          downsample: northStationLTTB,
          color: '#201002',
          label: 'North Station',
        },
        cityCenter: {
          raw: cityCenterData,
          downsample: cityCenterLTTB,
          color: '#E2AA68',
          label: 'City Center',
        },
        southStation: {
          raw: southStationData,
          downsample: southStationLTTB,
          color: '#C35724',
          label: 'South Station',
        }
      },
      ranges: {
        minimumDate: minimumDate,
        maximumDate: maximumDate,
      }
    }
  },
  methods: {
    plotRangeOnChange(chartContext, minDate, maxDate) {
      let dataUpdate = [];

      Object.keys(this.data).forEach(key => {
        let dataTypeName = 'raw'
        let dataRaw = pointFilter(this.data[key].raw, minDate, maxDate);

        /**
         * Based on the number of points in the raw dataset after filtering,
         * decide whether to keep raw or downsampled datasets.
         *
         * The criteria in this case is to verify the number of points, but it could
         * also be the range of dates.
         */
        if (dataRaw.length > 1000) {
          dataRaw = pointFilter(this.data[key].downsample, minDate, maxDate);
          dataTypeName = 'downsampled';
        }

        dataUpdate.push({
          name: `${this.data[key].label} (${dataTypeName})`,
          data: toRaw(dataRaw),
        });
      });

      /**
       * Add the minimum and maximum points available in the datasets
       * to avoid zooming and scrolling to lose the minimum and maximum ranges.
       */
      dataUpdate.push(toRaw(this.plotMinMaxDataset));

      chartContext.updateOptions({
        series: toRaw(dataUpdate),
        xaxis: {
          min: minDate,
          max: maxDate,
        }
      });
    }
  },
  computed: {
    plotOptions() {

      /**
       * Marker sizes and colors for the legend for visible data
       */
      let markersSize = [];
      let colorData = [];
      Object.keys(this.data).forEach(key => {
        markersSize.push(8);
        colorData.push(this.data[key].color);
      });

      markersSize.push(0);

      return {
        chart: {
          id: 'vuechart-example',
          events: {
            /**
             * Update data based on the selected range in the x-axis when events occur
             */
            zoomed: (chartContext, {xaxis}) => this.plotRangeOnChange(chartContext, xaxis.min, xaxis.max),
            scrolled: (chartContext, {xaxis}) => this.plotRangeOnChange(chartContext, xaxis.min, xaxis.max),
            beforeResetZoom: (chartContext) => this.plotRangeOnChange(chartContext, null, null),
          },
        },
        legend: {
          formatter: function (seriesName) {
            /**
             * Hide the marker containing the minimum and maximum values in the x-axis range
             */
            return seriesName === RANGE_MIN_MAX_INVISIBLE_LABEL ? null : seriesName;
          },
          markers: {
            size: markersSize
          },
        },
        colors: colorData,
        stroke: {
          curve: 'smooth',
          width: 3
        },
        xaxis: {
          type: 'datetime',
          labels: {
            datetimeFormatter: {
              year: 'yyyy',
              month: 'MMM yyyy',
              day: 'MMM dd',
              hour: 'HH:mm'
            }
          }
        },
        yaxis: {
          title: {
            text: 'Temperature (°C)'
          }
        },
        tooltip: {
          shared: true,
          x: {
            format: "MMM dd, yyyy HH:mm:ss",
          }
        },
        dataLabels: {
          enabled: false
        },
      }
    },
    plotSeries() {
      let seriesData = [];
      Object.keys(this.data).forEach(key => {
        seriesData.push({
          name: `${this.data[key].label} (downsampled)`,
          data: toRaw(this.data[key].downsample),
        })
      });

      /**
       * Add the minimum and maximum points available in the datasets
       * to avoid zooming and scrolling to lose the minimum and maximum ranges.
       */
      seriesData.push(toRaw(this.plotMinMaxDataset));
      return seriesData;
    },
    plotMinMaxDataset() {
      /**
       * Add the minimum and maximum points available in the datasets
       * to avoid zooming and scrolling to lose the minimum and maximum ranges.
       */
      return {
        name: RANGE_MIN_MAX_INVISIBLE_LABEL,
        data: [
          {x: new Date(this.ranges.minimumDate).getTime(), y: null},
          {x: new Date(this.ranges.maximumDate).getTime(), y: null},
        ],
        showInLegend: false,
      };
    }
  }
}
</script>

<template>
  <div style="max-width: 80%">
    <apexchart
        type="line"
        :options="plotOptions"
        :series="toRaw(plotSeries)"
    />
  </div>
</template>
