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
    echarts.registerTheme('dark', {
        "color": [
            "#fc97af",
            "#87f7cf",
            "#f7f494",
            "#72ccff",
            "#f7c5a0",
            "#d4a4eb",
            "#d2f5a6",
            "#76f2f2"
        ],
        "textStyle": {},
        "title": {
            "textStyle": {
                "color": "#ffffff"
            },
            "subtextStyle": {
                "color": "#dddddd"
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
            "symbolSize": "5",
            "symbol": "circle",
            "smooth": false
        },
        "gauge": {
            "axisLine": {
                "lineStyle": {
                    "color": [
                        [0.31, '#58f7f3'],
                        [1, '#1E5F6F']
                    ]
                }
            },
            "itemStyle": {
                "normal": {
                    "color": "#D9D9D9"
                },
                "emphasis": {
                    "color": "#D9D9D9"
                }
            }
        },
        "categoryAxis": {
            "axisLine": {
                "show": true,
                "lineStyle": {
                    "color": "#333"
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
                    "color": "#939393"
                }
            },
            "splitLine": {
                "show": true,
                "lineStyle": {
                    type: 'dashed',
                    "color": [
                        "rgba(255,255,255,0.1)"
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
                    "color": "#333"
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
                    "color": "#939393"
                }
            },
            "splitLine": {
                "show": true,
                "lineStyle": {
                    "type": 'dashed',
                    "color": [
                        "rgba(255,255,255,0.1)"
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
                    "borderColor": "#999999"
                },
                "emphasis": {
                    "borderColor": "#666666"
                }
            }
        },
        "legend": {
            "textStyle": {
                "color": "#999999"
            }
        },
        "tooltip": {
            "axisPointer": {
                "lineStyle": {
                    "color": "#cccccc",
                    "width": 1
                },
                "crossStyle": {
                    "color": "#cccccc",
                    "width": 1
                }
            }
        },
        "dataZoom": {
            "backgroundColor": "#525252",
            "dataBackgroundColor": "rgba(47,69,84,0.3)",
            "fillerColor": "#737373",
            "handleColor": "#BDBDBD",
            "handleSize": "100%",
            "borderColor": '#525252',
            "textStyle": {
                "color": "#939393"
            }
        }
    });
}));