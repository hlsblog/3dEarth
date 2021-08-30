(function(win){
    var series = [];// 3D飞线
    var dser = [];  // 2D散点坐标
	
	//地球纹理echarts对象
	var myTextureChart = null;
	//地球echarts对象
	var myEarthChart = null
	//exports对象
	win.DrawEarthObj = {};
	
	//地球配置
	var earthOption = {
		globe: {
			environment: 'none',
			globeOuterRadius: 10,
			globeRadius: 90,
			displacementScale: 0.04,
			shading: 'color', //设置之后无光照效果，但是在做炫酷地球的时候，很多时候不需要光照效果
			viewControl: {
				autoRotate: true,
				autoRotateAfterStill: 3,
				autoRotateSpeed: 5,
				rotateSensitivity: [1, 0],
				beta: 202.87352246916825,
				alpha:22.320048
			}
		}
	};
	//设置自动旋转
	function setAutoRotate(flag) {
		let options = myEarthChart.getOption()
		if (options.globe) {
			earthOption.globe.viewControl.autoRotate = flag
			earthOption.globe.viewControl.beta = options.globe[0].viewControl.beta
			myEarthChart.setOption(earthOption);
		}
	}
	//根据纬度计算字体大小，可以防止视觉上字体偏差太多，看不清楚字体
    function getFontsizeByLat(lat) {
        var baseSize = 20,
            miniLat = 22
        if (lat < miniLat) {
            return baseSize
        }
        return baseSize + (lat - miniLat)*0.25
    }
	//总部到其他点的连线
    function getHeadquartersToOtherPointLines3DCoordOpts(originData) {
		var geoCoordMap = win.earthDataConfig.geoCoordMap;
		var sHeadquartersName = win.earthDataConfig.sHeadquartersName
		
        var fromCoord = geoCoordMap[sHeadquartersName]
        var opts = {
            type: 'lines3D',
            effect: {
                show: true,
                period: 3,//速度
                trailLength: 0.1//尾部阴影          
            },
            lineStyle: {//航线的视图效果
                color: earthColorConfig.flyLineColor,
                width: 1,
                opacity: 0.6
            },
            data: [[fromCoord, originData]]
        }
        return opts;
    }
	//从主地点到子地点的连线
	function getLines3DCoordOpts(name, originData) {
		var geoCoordMap = win.earthDataConfig.geoCoordMap;
        var opts = {
            type: 'lines3D',
            zlevel: 1,
            effect: {
                show: true,
                period: 3,//速度
                trailLength: 0.1//尾部阴影          
            },
            lineStyle: {//航线的视图效果
                color: earthColorConfig.defaultTxtColor,
                width: 2,
                opacity: 0.3
            },
            data: []
        }
        var data = []
        var fromCoord = geoCoordMap[name]
        for(var i = 0; i < originData.length; i++) {
            var toCoord = originData[i];
            if(fromCoord && toCoord) {
                data.push({
                    coords: [fromCoord, toCoord],
                    // 数据值
                    value: 10,
                    // 线条样式
                    lineStyle: {}
                })
            }
        }
        opts.data = data
        return opts;
    }
	//子地点散点坐标
    var getScatterGLCoordOpts = function(name, originData) {
		var sHeadquartersName = win.earthDataConfig.sHeadquartersName;
        var bIsHeadquarters = name === sHeadquartersName;
		var defaultTxtColor = win.earthColorConfig.defaultTxtColor;
		
        var emphasisColor = bIsHeadquarters ? earthColorConfig.headquartersEmphasisPointColor :earthColorConfig.emphasisTxtColor
        var data = []
        var vals = Object.keys(originData)
        for(var i=0;i<vals.length;i++) {
            var key = vals[i]
            var val = originData[key]
            data.push({
                name: key,
                value: val,
                symbolSize:18,
                label: {
                    show:true,
                    position: 'top',
                    align: 'center',
                    fontSize:getFontsizeByLat(val[1]),
                    formatter: '{b}',
                    textBorderWidth:1,
                    textBorderColor:'#041f39',
                    color: defaultTxtColor
                },
                tooltip: {
                    show: true,
                    enterable: true,
                    position: function (pos, params, dom, rect, size) {
                        dom.style.display="none"
                        if (HoverHandler.name !== params.name) {
                            HoverHandler.setName(params.name)
                        }
                        HoverHandler.setRealPos();
                        return
                    },
                    formatter: function (params) {
                        return '<div class="my-tips" style="">'+params.name+'</div>'
                    }
                }
            })
        }
        return {
            type: 'scatter',
            coordinateSystem: 'geo',
            zlevel: 2,
            itemStyle: {
                normal: {
                    color: defaultTxtColor
                }
            },
            data: data
        };
    }
	function initSeries() {
		var geoCoordMap = win.earthDataConfig.geoCoordMap;
		var subCoordMap = win.earthDataConfig.subCoordMap
		Object.keys(geoCoordMap).forEach(function(name) {
			var bIsHeadquarters = name === win.earthDataConfig.sHeadquartersName
			var defaultColor = bIsHeadquarters ? earthColorConfig.headquartersPointColor :earthColorConfig.defaultTxtColor
			var emphasisColor = bIsHeadquarters ? earthColorConfig.headquartersEmphasisPointColor :earthColorConfig.emphasisTxtColor
			dser.push({
				type: 'scatter',		
				//type: 'effectScatter',	//当前点产生涟漪的类型（性能在比较低端显卡下可能会卡，如果实在要页面不怎么卡，建议暂不使用改类型）
				coordinateSystem: 'geo',
				rippleEffect: {
					brushType: 'stroke',
					number: 4,
					scale : 4, 
					color: defaultColor
				},
				label: {
					show: true,
					color: defaultColor,
					position: 'left',
					distance: 30,
					fontSize: getFontsizeByLat(geoCoordMap[name][1]),
					formatter: '{b}',
					textBorderWidth:1,
					textBorderColor:'#041f39'
				},
				itemStyle: {
					normal: {
						color: defaultColor
					}
				},
				data: [{
					name: name,
					value: geoCoordMap[name],
					symbolSize:25,
					zlevel: 0,
					label: {
						normal: {
							position: 'top',
							align: 'center'
						}
					},
					tooltip: {
						show: true,
						enterable: true,
						position: function (pos, params, dom, rect, size) {
							dom.style.display="none"
							if (HoverHandler.name !== params.name) {
								HoverHandler.setName(params.name)
							}
							HoverHandler.setRealPos();
							return
						},
						formatter: function (params) {
							//return '<div class="my-tips" style="">'+params.name+'</div>'
						}
					},
					// emphasis: {
					//     itemStyle: {
					//         color: emphasisColor
					//     },
					//     label: {
					//         color: emphasisColor,
					//         position: 'top',
					//         align: 'center'
					//     }
					// }
				}]
			});
			var data = subCoordMap[name]
			if (data) {
				//城市到子矿场的连线
				var vals = Object.values(data)
				series.push(getLines3DCoordOpts(name, vals))
				dser.push(getScatterGLCoordOpts(name, data))
			}
			//从总部到其他非总部点的连线
			if (!bIsHeadquarters) {
				series.push(getHeadquartersToOtherPointLines3DCoordOpts(geoCoordMap[name]))
			}
		});
	}
	//初始化地球纹理
	function initBaseTexture() {
		//地图描边颜色
		var mapBorderColor = earthColorConfig.mapBorderColor;
		//地图描边高亮颜色
		var emphasisMapBorderColor = earthColorConfig.emphasisMapBorderColor;
		//球面贴图国家边界画图配置，引入world.js。如果国家边界不准确，自行去修改其中的边界值（本实例仅供参考）
		var mapOption = {
			backgroundColor: 'transparent',
			title: {
				//show:true
			},
			tooltip: {
				enterable: true,
				trigger: "item",
				renderMode: 'html',
				appendToBody: true
			},
			geo: {
				type: 'map',
				map: 'world',
				left:0,
				top:0,
				right: 0,
				bottom: 0,
				//silent: true,
				boundingCoords: [[-180, 90], [180, -90]],
				zoom:1,
				tooltip: {
					show: false
				},
				itemStyle: {
					areaColor: 'transparent',
					//areaColor: 'black',	//如果不想国家区域是透明的，设置一个颜色值就行
					borderColor: mapBorderColor,
					borderWidth: '1',
				},
				emphasis: {
					itemStyle: {
						areaColor: 'transparent',
						//areaColor: 'black',	//如果不想国家区域是透明的，设置一个颜色值就行
						borderColor: emphasisMapBorderColor,
						borderWidth: '2'
					},
					label: {
						show: true,
						color: emphasisMapBorderColor,
						fontSize: 20,
					}
				},
				label:{
					show: false,
					fontSize:24
				}
			},
			series: dser
		};
		var canvas = document.createElement('canvas');
		var myChart = echarts.init(canvas, null, {
			width: 4096,
			height: 2048
		});
		myChart.setOption(mapOption);
		return myChart;
	}
	//初始化地球
	function initEarth() {
		//初始化series数据
		initSeries();
		//获取地球纹理（国家边界图）
		var baseTexture = initBaseTexture();
		//地球echarts配置，该地球是使用globe进行贴图显示的，详细可以查询echarts globe文档
		earthOption.globe.baseTexture = baseTexture
		earthOption.series = series;
		
		//增加控制球大小的层
		var map = document.querySelector(win.containerConfig.outerLayer);
		var container = document.querySelector("#container");
		
		container.addEventListener("mouseover", function(e){
			setAutoRotate(false)
		})
		container.addEventListener("mouseout", function(){
			setAutoRotate(true)
			HoverHandler.end()
		})
		
		container.style.width = map.offsetWidth + 'px';
		container.style.height = map.offsetHeight + 'px';
		
		myEarthChart = echarts.init(container);
		myEarthChart.setOption(earthOption, true);
		
		win.DrawEarthObj.myEarthChart = myEarthChart;
		win.DrawEarthObj.myTextureChart = baseTexture;
	}
	
	win.DrawEarthObj.initEarth = initEarth;
	win.DrawEarthObj.setAutoRotate= setAutoRotate;
	
}(window))