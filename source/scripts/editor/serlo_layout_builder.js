/*global define*/
define([
    'jquery',
    'underscore',
    'cache',
    'row',
    'column',
    'layout_add',
    'events'
],
    function ($, _, Cache, Row, Column, LayoutAdd, eventScope) {
        "use strict";
        var LayoutBuilder;

        LayoutBuilder = function (configuration) {
            if (configuration === undefined) {
                throw new Error('No LayoutBuilderConfiguration set for LayoutBuilder');
            }

            var that = this,
                layoutAdd;

            eventScope(this);

            that.layouts = configuration.layouts;
            that.rows = [];

            layoutAdd = new LayoutAdd(that.layouts);

            layoutAdd.addEventListener('add-layout', function (layout) {
                that.addRow(layout);
            });

            that.$el = layoutAdd.$el;
        };

        LayoutBuilder.prototype.addRow = function (requestedLayout, data, atIndex) {
            var newRow,
                before,
                that = this;

            newRow = new Row(requestedLayout, that.rows.length, data, that.layouts);

            newRow.addEventListener('remove', function (row) {
                that.removeRow(row);
            });

            newRow.addEventListener('add-layout', function (layout) {
                that.addRow(layout, null, newRow.index);
            });

            newRow.index = atIndex === undefined ? that.rows.length : atIndex;

            // insert newRow in that.rows
            // at given index
            before = that.rows.splice(0, newRow.index);
            before.push(newRow);
            that.rows = before.concat(that.rows);

            that.trigger('add', newRow);

            return newRow;
        };

        LayoutBuilder.prototype.removeRow = function (row) {
            row.$el.remove();

            this.rows.splice(row.index, 1);
            this.updateRowIndexes();

            row.trigger('update');
            row = null;
        };

        LayoutBuilder.prototype.updateRowIndexes = function () {
            _.each(this.rows, function (row, i) {
                row.index = i;
            });
        };

        return LayoutBuilder;
    }
);