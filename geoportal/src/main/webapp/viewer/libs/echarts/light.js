(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['exports', './echarts'], factory);
    } else if (typeof exports === 'object' && typeof exports.nodeName !== 'string') {
        // CommonJS
        factory(exports, require('./echarts'));
    } else {
        // Browser globals
        factory({}, root.echarts);
    }
}(this, function(exports, echarts) {
    var log = function(msg) {
        if (typeof console !== 'undefined') {
            console && console.error && console.error(msg);
        }
    };
    if (!echarts) {
        log('ECharts is not Loaded');
        return;
    }
    echarts.registerTheme('light', {
        "color": [
            "#2ec7c9",
            "#b6a2de",
            "#5ab1ef",
            "#ffb980",
            "#d87a80",
            "#8d98b3",
            "#e5cf0d",
            "#97b552",
            "#95706d",
            "#dc69aa",
            "#07a2a4",
            "#9a7fd1",
            "#588dd5",
            "#f5994e",
            "#c05050",
            "#59678c",
            "#c9ab00",
            "#7eb00a",
            "#6f5553",
            "#c14089"
        ],
        "textStyle": {},
        "title": {
            "textStyle": {
                "color": "#008acd"
            },
            "subtextStyle": {
                "color": "#aaaaaa"
            }
        },
        "line": {
            "itemStyle": {
                "normal": {}
            },
            "lineStyle": {
                "normal": {
                    "width": "1"
                }
            },
            "symbolSize": "5",
            "symbol": "circle",
            "smooth": false
        },
        "radar": {
            "itemStyle": {
                "normal": {}
            },
            "lineStyle": {
                "normal": {
                    "width": "1"
                }
            },
            "symbolSize": "6",
            "symbol": "circle",
            "smooth": false
        },
        "gauge": {
            "axisLine": {
                "lineStyle": {
                    "color": [
                        [0.31, '#58f7f3'],
                        [1, '#E5E5E5']
                    ]
                }
            },
            "itemStyle": {
                "normal": {
                    "color": "#686868"
                },
                "emphasis": {
                    "color": "#686868"
                }
            }
        },
        "categoryAxis": {
            "axisLine": {
                "show": true,
                "lineStyle": {
                    "color": "#008acd"
                }
            },
            "axisTick": {
                "show": false,
                "lineStyle": {
                    "color": "#333"
                }
            },
            "axisLabel": {
                "show": true,
                "textStyle": {
                    "color": "#333"
                }
            },
            "splitLine": {
                "show": true,
                "lineStyle": {
                    "type": "dashed",
                    "color": [
                        "rgba(0,0,0,0.1)"
                    ]
                }
            },
            "splitArea": {
                "show": false,
                "areaStyle": {
                    "color": [
                        "rgba(250,250,250,0.3)",
                        "rgba(200,200,200,0.3)"
                    ]
                }
            }
        },
        "valueAxis": {
            "axisLine": {
                "show": true,
                "lineStyle": {
                    "color": "#008acd"
                }
            },
            "axisTick": {
                "show": false,
                "lineStyle": {
                    "color": "#333"
                }
            },
            "axisLabel": {
                "show": true,
                "textStyle": {
                    "color": "#333"
                }
            },
            "splitLine": {
                "show": true,
                "lineStyle": {
                    "type": "dashed",
                    "color": [
                        "rgba(0,0,0,0.1)"
                    ]
                }
            },
            "splitArea": {
                "show": false,
                "areaStyle": {
                    "color": [
                        "rgba(250,250,250,0.3)",
                        "rgba(200,200,200,0.3)"
                    ]
                }
            }
        },
        "toolbox": {
            "iconStyle": {
                "normal": {
                    "borderColor": "#2ec7c9"
                },
                "emphasis": {
                    "borderColor": "#18a4a6"
                }
            }
        },
        "legend": {
            "textStyle": {
                "color": "#333333"
            }
        },
        "tooltip": {
            "axisPointer": {
                "lineStyle": {
                    "color": "#008acd",
                    "width": "1"
                },
                "crossStyle": {
                    "color": "#008acd",
                    "width": "1"
                }
            }
        },
        "dataZoom": {
            "backgroundColor": "#F4F4F4",
            "dataBackgroundColor": "rgba(47,69,84,0.3)",
            "fillerColor": "#E0E0E0",
            "handleColor": "#777777",
            "handleSize": "100%",
            "borderColor": '#F4F4F4',
            "textStyle": {
                "color": "#939393"
            }
        }
    });
}));