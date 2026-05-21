# Vue.js + ApexCharts - Time-series chart with downsampled data

This example shows how to use Vue.js with ApexCharts and how to switch between downsampled and raw data on a time-series
chart during zooming and panning.

The source code was written based on a problem I encountered while working on a project using Vue.js and ApexCharts.
ApexCharts is an excellent library for creating charts, and the integration with Vue.js is straightforward. However,
when it comes to displaying a time-series chart with thousands of points, the performance of the chart can be very low,
especially for events as zooming and panning, causing sometimes the page to freeze.

The solution includes the configuration of the chart to use downsampled data whe the level of zoom is low, and switch to
raw data when the level of zoom is high. This is done by configuring the `zoomed`, `scrolled` and `beforeResetZoom`
events of the chart, while still using the reactive state of the Vue.js component. To complete the solution, it is
necessary to include a hidden dataset with the minimum and maximum dates and null values that covers the entire
time-series datasets to allow the chart to zoom out to a lower level and to pan across the x-axis, not only with the
buttons included in the chart, but also with the mouse wheel. If such dataset is not included, such events will work
only by clicking the buttons on the chart.

## Author

- Aaron Estrada [aaron.estrada.poggio@gmail.com](mailto:aaron.estrada.poggio@gmail.com)

## Requirements

- Vue.js ^3.5.32
- ApexCharts ^5.12.0
- vue-apexcharts ^1.11.1

## Project structure

```
public/             Public assets for application
src/                Source code for application
  libs/             Helper functions and classes
  App.vue           Application component
  main.js           Application configuration
index.html          HTML entrypoint
package.json        Package manifest
package-lock.json   Locked package manifest
vite.config.js      Vite configuration
```

## Project Setup

```bash
npm install
```

### Compile and Hot-Reload for Development

```bash
npm run dev
```

### Compile and Minify for Production

```bash
npm run build
```

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).