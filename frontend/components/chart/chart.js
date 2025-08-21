// components/chart/chart.js
Component({
  properties: {
    type: {
      type: String,
      value: 'line'
    },
    data: {
      type: Object,
      value: {}
    },
    width: {
      type: Number,
      value: 300
    },
    height: {
      type: Number,
      value: 200
    }
  },

  data: {
    chartId: ''
  },

  lifetimes: {
    attached() {
      this.setData({
        chartId: 'chart-' + Math.random().toString(36).substr(2, 9)
      });
      this.initChart();
    }
  },

  methods: {
    initChart() {
      const { type, data, width, height } = this.properties;

      // 模拟图表渲染
      console.log('初始化图表:', { type, data, width, height });

      // 这里可以集成真实的图表库，如 F2、ECharts 等
      setTimeout(() => {
        this.triggerEvent('chartReady', {
          chartId: this.data.chartId,
          type: type
        });
      }, 100);
    },

    updateChart(newData) {
      console.log('更新图表数据:', newData);
      // 更新图表数据的逻辑
    }
  }
});
