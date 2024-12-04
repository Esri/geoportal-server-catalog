require([
		'doh/main', 'dojo/parser', 'dojo/_base/html', 'dojo/query',
		'dojo/dom', 'dojo/on', 'dojo/Deferred', 'dijit/registry',
		'jimu/dijit/Popup', 
		'dojo/domReady!'
	],
	function(doh, parser, html, query, dom, on, Deferred, registry, Popup) {
		parser.parse().then(function() {
			if (window.currentDijit) {
				window.currentDijit.destroy();
			}
			window.currentDijit = null;
			html.empty('jimuDijitContainer');
			window.jimuConfig = {
      	layoutId: 'bodyContainer'
      };
			
			var content = '<div><span>Popup</span></div>';

			doh.register('Properties', [{
				name: 'no buttons',
				timeout: 40000,
				runTest: function(t) {
					var d = new doh.Deferred();
					var contentNode = html.toDom(content);
					
					this.popup = new Popup({
						titleLabel: 'UT',
						content: contentNode,
						container: window.jimuConfig.layoutId,
						width: 640
					});
					html.addClass(this.popup.domNode, 'widget-setting-popup');
					var buttonNodes = query('.jimu-popup-btn', this.popup.domNode);

					setTimeout(
						d.getTestCallback(function() {
							t.t(buttonNodes.length === 0);
						}), 500);
					return d;
				},
				tearDown: function() {
					this.popup.close();
				}
			}, {
				name: 'disable buttons',
				timeout: 40000,
				runTest: function(t) {
					var d = new doh.Deferred();
					var contentNode = html.toDom(content);

					this.popup = new Popup({
						titleLabel: 'UT',
						content: contentNode,
						container: window.jimuConfig.layoutId,
						width: 640,
						buttons: [{
							label: 'OK',
							disable: true
						}, {
							label: 'Cancel'
						}]
					});
					html.addClass(this.popup.domNode, 'widget-setting-popup');
					var buttonNodes = query('.jimu-popup-btn', this.popup.domNode);

					setTimeout(
						d.getTestCallback(function() {
							t.t(html.getStyle(buttonNodes[2], 'display') === 'none');
							t.t(html.getStyle(buttonNodes[3], 'display') !== 'none');
							t.t(html.hasClass(buttonNodes[3], 'jimu-state-disabled'));
						}), 500);

					return d;
				},
				tearDown: function() {
					this.popup.close();
				}
			}, {
				name: 'fixed height',
				timeout: 40000,
				runTest: function(t) {
					var d = new doh.Deferred();
					var contentNode = html.toDom(content);

					this.popup = new Popup({
						titleLabel: 'UT',
						content: contentNode,
						container: window.jimuConfig.layoutId,
						width: 640,
						height: 600,
						buttons: [{
							label: 'OK',
							disable: true
						}, {
							label: 'Cancel'
						}]
					});
					var thatPopup = this.popup;
					setTimeout(
						d.getTestCallback(function() {
							var popupBox = html.getMarginBox(thatPopup.domNode);

							t.t(popupBox.h === 600);
						}), 500);

					return d;
				},
				tearDown: function() {
					this.popup.close();
				}
			}, {
				name: 'auto height',
				timeout: 40000,
				runTest: function(t) {
					var d = new doh.Deferred();
					var contentNode = html.toDom(content);
					html.setStyle(contentNode, 'height', 300 + 'px');

					this.popup = new Popup({
						titleLabel: 'UT',
						content: contentNode,
						container: window.jimuConfig.layoutId,
						width: 640,
						autoHeight: true,
						buttons: [{
							label: 'OK',
							disable: true
						}, {
							label: 'Cancel'
						}]
					});
					var thatPopup = this.popup;
					setTimeout(
						d.getTestCallback(function() {
							var popupBox = html.getMarginBox(thatPopup.domNode);
							console.log('auto height:   ', popupBox.h);

							t.t(popupBox.h === 300 + 20 + 40 + 65); //content + margin + header + buttonsContainer
						}), 500);

					return d;
				},
				tearDown: function() {
					this.popup.close();
				}
			}, {
				name: 'flex height',
				timeout: 400000,
				runTest: function(t) {
					var d = new doh.Deferred();
					var contentNode = html.toDom(content);

					this.popup = new Popup({
						titleLabel: 'UT',
						content: contentNode,
						container: window.jimuConfig.layoutId,
						width: 640,
						buttons: [{
							label: 'OK',
							disable: true
						}, {
							label: 'Cancel'
						}]
					});
					var thatPopup = this.popup;
					var box = html.getContentBox(window.jimuConfig.layoutId);
					var flexHeight = box.h - 40;

					setTimeout(
						d.getTestCallback(function() {
							var popupBox = html.getMarginBox(thatPopup.domNode);

							t.t(popupBox.h === flexHeight || popupBox.h === 800); //flexHeight or maxHeight
						}), 500);

					return d;
				},
				tearDown: function() {
					this.popup.close();
				}
			}, {
				name: 'onClose',
				timeout: 40000,
				runTest: function(t) {
					var d = new doh.Deferred();
					var contentNode = html.toDom(content);

					this.popup = new Popup({
						titleLabel: 'UT',
						content: contentNode,
						container: window.jimuConfig.layoutId,
						width: 640,
						buttons: [{
							label: 'OK',
							disable: true
						}, {
							label: 'Cancel'
						}],
						onClose: function() {
							return false;
						}
					});
					var thatPopup = this.popup;

					setTimeout(
						d.getTestCallback(function() {
							thatPopup.close();

							t.t(thatPopup.domNode !== null);
							t.f(html.getStyle(thatPopup.domNode, 'display') === 'none');
						}), 500);

					return d;
				},
				tearDown: function() {
					this.popup.close();
				}
			}]);
			doh.run();
		});
	});