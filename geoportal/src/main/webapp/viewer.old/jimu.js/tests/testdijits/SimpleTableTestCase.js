require([
		'doh/main', 'dojo/parser', 'dojo/_base/html', 'dojo/query',
		'dojo/dom', 'dojo/on', 'dojo/Deferred', 'dijit/registry', 'dojo/robotx',
		'jimu/dijit/SimpleTable', 'jimu/utils',
		'dojo/domReady!'
	],
	function(doh, parser, html, query, dom, on, Deferred, registry, robot, Table, utils) {
		parser.parse().then(function() {
			var tableTestDiv = document.getElementById('tableTestDiv');
			var fields = [{
				name: 'wkid',
				title: 'wkid',
				type: 'text',
				'class': "wkid",
				unique: true,
				hidden: true,
				editable: false
			}, {
				name: 'label',
				title: 'label',
				type: 'text',
				unique: true,
				editable: false
			}, {
				name: 'outputUnit',
				title: 'output',
				type: 'text',
				hidden: true,
				editable: false
			}, {
				name: 'transformationWkid',
				title: 'transformationWkid',
				type: 'text',
				'class': 'transformationWkid',
				editable: false,
				hidden: true
			}, {
				name: 'transformationLabel',
				title: 'transformationLabel',
				type: 'text',
				editable: false,
				hidden: true
			}, {
				name: 'transformForward',
				title: 'transformForward',
				type: 'checkbox',
				editable: false,
				hidden: true
			}, {
				name: 'actions',
				title: 'actions',
				type: 'actions',
				'class': "actions",
				actions: ['edit', 'up', 'down', 'delete']
			}];
			var args = {
				fields: fields,
				selectable: true
			};

			if (window.currentDijit) {
				window.currentDijit.destroy();
			}
			window.currentDijit = null;
			html.empty('jimuDijitContainer');

			var outputCoordinateTable = new Table(args);
			outputCoordinateTable.placeAt('jimuDijitContainer');
			outputCoordinateTable.startup();
			window.parent.currentDijit = window.currentDijit = outputCoordinateTable;

			var spatialReferences = [{
				"wkid": "3857",
				"label": "WGS_1984_Web_Mercator_Auxiliary_Sphere",
				"outputUnit": "",
				"transformationWkid": "",
				"transformationLabel": "",
				"transformForward": false
			}, {
				"wkid": "2285",
				"label": "NAD_1983_StatePlane_Washington_North_FIPS_4601_Feet",
				"outputUnit": "",
				"transformationWkid": "108190",
				"transformationLabel": "WGS_1984_(ITRF00)_To_NAD_1983",
				"transformForward": true
			}, {
				"wkid": "4269",
				"label": "GCS_North_American_1983",
				"outputUnit": "",
				"transformationWkid": "108190",
				"transformationLabel": "WGS_1984_(ITRF00)_To_NAD_1983",
				"transformForward": true
			}];

			var handles = [];

			doh.register('public function', [{
				name: 'addRow',
				runTest: function(t) {
					outputCoordinateTable.addRow(spatialReferences[0]);
					var rowDatas = outputCoordinateTable.getData();
					t.t(rowDatas.length === 1);
					t.t(utils.isEqual(rowDatas[0], spatialReferences[0]));
				},
				timeout: 3000
			}, {
				name: 'addRows',
				runTest: function(t) {
					var datas = spatialReferences.slice(1);
					outputCoordinateTable.addRows(datas);
					var rowDatas = outputCoordinateTable.getData();

					t.t(rowDatas.length === 3);
					t.t(utils.isEqual(rowDatas, spatialReferences));
				},
				timeout: 3000
			}, {
				name: 'clear',
				runTest: function(t) {
					var beforeClearDatas = outputCoordinateTable.getData();
					outputCoordinateTable.clear();
					var afterClearDatas = outputCoordinateTable.getData();

					t.t(afterClearDatas.length === 0);
					t.f(utils.isEqual(afterClearDatas, beforeClearDatas));
				},
				timeout: 3000
			}, {
				name: 'deleteRow',
				setUp: function() {
					outputCoordinateTable.addRows(spatialReferences);
				},
				runTest: function(t) {
					var rows = outputCoordinateTable.getRows();
					outputCoordinateTable.deleteRow(rows[1]);
					var afterDeleteRows = outputCoordinateTable.getRows();

					rows.splice(1, 1);
					t.t(afterDeleteRows.length === 2);
					t.t(utils.isEqual(rows, afterDeleteRows));
				},
				tearDown: function() {
					outputCoordinateTable.clear();
				},
				timeout: 3000
			}, {
				name: 'editRow',
				setUp: function() {
					outputCoordinateTable.addRow(spatialReferences[0]);
				},
				runTest: function(t) {
					var rows = outputCoordinateTable.getRows();
					var beforeEditData = outputCoordinateTable.getRowData(rows[0]);
					var result = outputCoordinateTable.editRow(rows[0], spatialReferences[1]);
					var afterEditData = outputCoordinateTable.getRowData(rows[0]);

					t.t(result.success);
					t.t(utils.isEqual(afterEditData, spatialReferences[1]));
					t.f(utils.isEqual(afterEditData, beforeEditData));
				},
				tearDown: function() {
					outputCoordinateTable.clear();
				},
				timeout: 3000
			}, {
				name: 'selectRow selectedRow selectedRowData',
				setUp: function() {
					outputCoordinateTable.addRows(spatialReferences);
				},
				runTest: function(t) {
					var d = new doh.Deferred();
					var rows = outputCoordinateTable.getRows();
					var selecthandle = on(outputCoordinateTable, 'row-select', function(tr) {
						d.getTestCallback(function() {
							var trs = query('.simple-table-row.selected', outputCoordinateTable.tbody);

							t.t(trs.length === 1);
							t.t(utils.isEqual(trs[0], tr));
							t.t(utils.isEqual(rows[0], tr));

							var selectedRow = outputCoordinateTable.getSelectedRow();
							var selectedRowData = outputCoordinateTable.getSelectedRowData();
							t.t(utils.isEqual(tr, selectedRow));
							t.t(utils.isEqual(spatialReferences[0], selectedRowData));
						})();
					});
					handles.push(selecthandle);
					outputCoordinateTable.selectRow(rows[0]);

					return d;
				},
				tearDown: function() {
					for (var i = 0; i < handles.length; i++) {
						if (handles[i]) {
							handles[i].remove();
						}
					}
					handles = [];
					outputCoordinateTable.clear();
				},
				timeout: 3000
			}, {
				name: 'getRowDataArrayByFieldValue',
				setUp: function() {
					outputCoordinateTable.addRows(spatialReferences);
				},
				runTest: function(t) {
					var result = outputCoordinateTable.getRowDataArrayByFieldValue('transformationLabel', 'WGS_1984_(ITRF00)_To_NAD_1983');

					var datas = outputCoordinateTable.getData();
					datas.splice(0, 1);
					t.t(utils.isEqual(result, datas));
				},
				tearDown: function() {
					outputCoordinateTable.clear();
				},
				timeout: 3000
			}]);

			doh.register('property', [{
				name: 'unique',
				timeout: 3000,
				setUp: function() {
					outputCoordinateTable.addRow(spatialReferences[0]);
				},
				runTest: function(t) {
					var result = outputCoordinateTable.addRow(spatialReferences[0]),
						datas = outputCoordinateTable.getData();

					t.f(result.success);
					t.t(datas.length === 1);
				},
				tearDown: function() {
					outputCoordinateTable.clear();
				}
			}]);

			doh.register('event', [{
				name: 'actions-edit',
				timeout: 40000,
				setUp: function() {
					outputCoordinateTable.addRows(spatialReferences);
				},
				runTest: function(t) {
					var d = new doh.Deferred();

					var handle = on(outputCoordinateTable, 'actions-edit', function(tr) {
						console.log(tr);
						console.log(actionsEditNode.parentNode.parentNode.parentNode);
						d.getTestCallback(function() {
							t.t(utils.isEqual(tr, actionsEditNode.parentNode.parentNode.parentNode));
						})();
					});
					handles.push(handle);
					var actionsEditNode = query('.simple-table-row .actions-td .row-edit-div', outputCoordinateTable.tbody)[0];
					console.log(actionsEditNode);
					robot.mouseMoveAt(actionsEditNode, 200, 100);
					robot.mouseClick({
						left: true,
						middle: false,
						right: false
					}, 100);

					return d;
				},
				tearDown: function() {
					for (var i = 0; i < handles.length; i++) {
						if (handles[i]) {
							handles[i].remove();
						}
					}
					handles = [];
					outputCoordinateTable.clear();
				}
			}, {
				name: 'BeforeRowEdit',
				timeout: 40000,
				setUp: function() {
					outputCoordinateTable.addRows(spatialReferences);
				},
				runTest: function(t) {
					var d = new doh.Deferred();

					var handle = on(outputCoordinateTable, 'actions-edit', function(tr) {
						d.errback(true);
					});
					handles.push(handle);
					var handle2 = on(outputCoordinateTable, 'BeforeRowEdit', function(tr) {
						return false;
					});
					handles.push(handle2);
					var actionsEditNode = query('.simple-table-row .actions-td .row-edit-div', outputCoordinateTable.tbody)[2];
					console.log(actionsEditNode);
					robot.mouseMoveAt(actionsEditNode, 200, 100);
					robot.mouseClick({
						left: true,
						middle: false,
						right: false
					}, 100);
					robot.sequence(function() {
						d.callback(true);
					}, 200);

					return d;
				},
				tearDown: function() {
					for (var i = 0; i < handles.length; i++) {
						if (handles[i]) {
							handles[i].remove();
						}
					}
					handles = [];
					outputCoordinateTable.clear();
				}
			}, {
				name: 'BeforeRowUp',
				timeout: 40000,
				setUp: function() {
					outputCoordinateTable.addRows(spatialReferences);
				},
				runTest: function(t) {
					var d = new doh.Deferred();

					var handle = on(outputCoordinateTable, 'BeforeRowUp', function(tr) {
						return false;
					});
					handles.push(handle);
					var actionsUpNode = query('.simple-table-row .actions-td .row-up-div', outputCoordinateTable.tbody)[1];
					robot.mouseMoveAt(actionsUpNode, 200, 100);
					robot.mouseClick({
						left: true,
						middle: false,
						right: false
					}, 100);
					robot.sequence(d.getTestCallback(function() {
						var trs = query('.simple-table-row', outputCoordinateTable.tbody);
						var ftrData = outputCoordinateTable.getRowData(trs[0]),
							strData = outputCoordinateTable.getRowData(trs[1]);

						t.t(utils.isEqual(strData, spatialReferences[1]));
						t.f(utils.isEqual(ftrData, spatialReferences[1]));
					}), 200);

					return d;
				},
				tearDown: function() {
					for (var i = 0; i < handles.length; i++) {
						if (handles[i]) {
							handles[i].remove();
						}
					}
					handles = [];
					outputCoordinateTable.clear();
				}
			}, {
				name: 'BeforeRowDown',
				timeout: 40000,
				setUp: function() {
					outputCoordinateTable.addRows(spatialReferences);
				},
				runTest: function(t) {
					var d = new doh.Deferred();

					var handle = on(outputCoordinateTable, 'BeforeRowDown', function(tr) {
						return false;
					});
					handles.push(handle);
					var actionsUpNode = query('.simple-table-row .actions-td .row-down-div', outputCoordinateTable.tbody)[1];
					robot.mouseMoveAt(actionsUpNode, 200, 100);
					robot.mouseClick({
						left: true,
						middle: false,
						right: false
					}, 100);
					robot.sequence(d.getTestCallback(function() {
						var trs = query('.simple-table-row', outputCoordinateTable.tbody);
						var ttrData = outputCoordinateTable.getRowData(trs[2]),
							strData = outputCoordinateTable.getRowData(trs[1]);

						t.t(utils.isEqual(strData, spatialReferences[1]));
						t.f(utils.isEqual(ttrData, spatialReferences[1]));
					}), 200);

					return d;
				},
				tearDown: function() {
					for (var i = 0; i < handles.length; i++) {
						if (handles[i]) {
							handles[i].remove();
						}
					}
					handles = [];
					outputCoordinateTable.clear();
				}
			}, {
				name: 'BeforeRowDelete',
				timeout: 40000,
				setUp: function() {
					outputCoordinateTable.addRows(spatialReferences);
				},
				runTest: function(t) {
					var d = new doh.Deferred();

					var handle = on(outputCoordinateTable, 'BeforeRowDelete', function(tr) {
						return false;
					});
					handles.push(handle);
					var actionsUpNode = query('.simple-table-row .actions-td .row-delete-div', outputCoordinateTable.tbody)[1];
					robot.mouseMoveAt(actionsUpNode, 200, 100);
					robot.mouseClick({
						left: true,
						middle: false,
						right: false
					}, 100);
					robot.sequence(d.getTestCallback(function() {
						var datas = outputCoordinateTable.getData();

						t.t(datas.length === 3);
					}), 200);

					return d;
				},
				tearDown: function() {
					for (var i = 0; i < handles.length; i++) {
						if (handles[i]) {
							handles[i].remove();
						}
					}
					handles = [];
					outputCoordinateTable.clear();
				}
			}, {
				name: 'row-click',
				timeout: 40000,
				setUp: function() {
					outputCoordinateTable.addRows(spatialReferences);
				},
				runTest: function(t) {
					var d = new doh.Deferred();

					var handle = on(outputCoordinateTable, 'row-click', function(tr) {
						d.getTestCallback(function() {
							t.t(utils.isEqual(tr, trNode));
						})();
					});
					handles.push(handle);
					var trNode = query('.simple-table-row', outputCoordinateTable.tbody)[1];
					console.log(trNode);
					robot.mouseMoveAt(trNode, 200, 100);
					robot.mouseClick({
						left: true,
						middle: false,
						right: false
					}, 100);

					return d;
				},
				tearDown: function() {
					for (var i = 0; i < handles.length; i++) {
						if (handles[i]) {
							handles[i].remove();
						}
					}
					handles = [];
					outputCoordinateTable.clear();
				}
			}, {
				name: 'row-select',
				timeout: 40000,
				setUp: function() {
					outputCoordinateTable.addRows(spatialReferences);
				},
				runTest: function(t) {
					var d = new doh.Deferred();

					var handle = on(outputCoordinateTable, 'row-select', function(tr) {
						d.getTestCallback(function() {
							t.t(utils.isEqual(tr, trNode));
						})();
					});
					handles.push(handle);
					var trNode = query('.simple-table-row', outputCoordinateTable.tbody)[2];
					console.log(trNode);
					robot.mouseMoveAt(trNode, 200, 100);
					robot.mouseClick({
						left: true,
						middle: false,
						right: false
					}, 100);

					return d;
				},
				tearDown: function() {
					for (var i = 0; i < handles.length; i++) {
						if (handles[i]) {
							handles[i].remove();
						}
					}
					handles = [];
					outputCoordinateTable.clear();
				}
			}, {
				name: 'row-clear',
				timeout: 4000,
				setUp: function() {
					outputCoordinateTable.addRows(spatialReferences);
				},
				runTest: function(t) {
					var d = new doh.Deferred();

					var handle = on(outputCoordinateTable, 'rows-clear', function() {
						d.getTestCallback(function() {
							var datas = outputCoordinateTable.getData();
							t.t(datas.length === 0);
						})();
					});
					handles.push(handle);
					outputCoordinateTable.clear();

					return d;
				},
				tearDown: function() {
					for (var i = 0; i < handles.length; i++) {
						if (handles[i]) {
							handles[i].remove();
						}
					}
					handles = [];
					outputCoordinateTable.clear();
				}
			}, {
				name: 'row-add',
				timeout: 3000,
				runTest: function(t) {
					var d = new doh.Deferred();

					var handle = on(outputCoordinateTable, 'row-add', function(tr) {
						d.getTestCallback(function() {
							var rowData = outputCoordinateTable.getRowData(tr);
							t.t(utils.isEqual(rowData, spatialReferences[0]));
						})();
					});
					handles.push(handle);
					outputCoordinateTable.addRow(spatialReferences[0]);

					return d;
				},
				tearDown: function() {
					for (var i = 0; i < handles.length; i++) {
						if (handles[i]) {
							handles[i].remove();
						}
					}
					handles = [];
					outputCoordinateTable.clear();
				}
			}, {
				name: 'row-edit',
				timeout: 3000,
				setUp: function() {
					outputCoordinateTable.addRow(spatialReferences[0]);
				},
				runTest: function(t) {
					var d = new doh.Deferred();

					var handle = on(outputCoordinateTable, 'row-edit', function(tr) {
						var afterEditData = outputCoordinateTable.getRowData(tr);

						d.getTestCallback(function() {
							t.t(utils.isEqual(afterEditData, spatialReferences[1]));
							t.f(utils.isEqual(afterEditData, beforeEditData));
						})();
					});
					handles.push(handle);
					var rows = outputCoordinateTable.getRows();
					var beforeEditData = outputCoordinateTable.getRowData(rows[0]);
					outputCoordinateTable.editRow(rows[0], spatialReferences[1]);

					return d;
				},
				tearDown: function() {
					for (var i = 0; i < handles.length; i++) {
						if (handles[i]) {
							handles[i].remove();
						}
					}
					handles = [];
					outputCoordinateTable.clear();
				}
			}, {
				name: 'row-delete',
				timeout: 4000,
				setUp: function() {
					outputCoordinateTable.addRows(spatialReferences);
				},
				runTest: function(t) {
					var d = new doh.Deferred();
					var handle = on(outputCoordinateTable, 'row-delete', function(tr) {
						d.getTestCallback(function() {
							t.t(utils.isEqual(tr, rows[1]));

							var afterDeleteRows = outputCoordinateTable.getRows();

							rows.splice(1, 1);
							t.t(afterDeleteRows.length === 2);
							t.t(utils.isEqual(rows, afterDeleteRows));
						})();
					});
					handles.push(handle);

					var rows = outputCoordinateTable.getRows();
					outputCoordinateTable.deleteRow(rows[1]);

					return d;
				},
				tearDown: function() {
					for (var i = 0; i < handles.length; i++) {
						if (handles[i]) {
							handles[i].remove();
						}
					}
					handles = [];
					outputCoordinateTable.clear();
				}
			}, ]);

			doh.run();
		});
	});