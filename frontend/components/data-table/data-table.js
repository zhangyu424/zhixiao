// components/data-table/data-table.js
Component({
  properties: {
    columns: {
      type: Array,
      value: []
    },
    data: {
      type: Array,
      value: []
    },
    showHeader: {
      type: Boolean,
      value: true
    },
    striped: {
      type: Boolean,
      value: true
    }
  },

  methods: {
    onCellTap(e) {
      const { row, col, value } = e.currentTarget.dataset;
      this.triggerEvent('cellTap', {
        row,
        col,
        value
      });
    },

    onRowTap(e) {
      const { index, item } = e.currentTarget.dataset;
      this.triggerEvent('rowTap', {
        index,
        item
      });
    }
  }
});
