//地球数据配置
window.earthDataConfig = {
	//总部（特殊点）
    sHeadquartersName: '北京',
	tooltips: {
        '香港': {
            desc: '香港描述',
            img: './images/tooltips.png'
        },
        '北京': {
            desc: '北京描述',
            img: './images/tooltips.png'
        },
        '新疆': {
            desc: '新疆描述',
            img: './images/tooltips.png'
        },
        '哈密': {
            desc: '哈密描述',
            img: './images/tooltips.png'
        },
        '茂名': {
            desc: '茂名市，广东省地级市。位于中国南海之滨，地处广东省西南部，背靠祖国大西南。辖茂南区、电白区，代管高州市、化州市、信宜市。',
            img: './images/maoming.png'
        }
    },
    //设置主地点
    geoCoordMap: {
        '香港': [114.173355, 22.320048],
        '北京': [ 116.403119, 39.913385],
		'新疆': [87.620548,43.865817],
        '茂名': [110.934522,21.673724],
    },
    //设置子地点
    subCoordMap: {
        '新疆': {
            '哈密': [93.518606,42.823553]
        }
    }
}
window.containerConfig = {
	outerLayer: '.map',
	tooltipsLayer: '.my-tips-container'
}

window.earthColorConfig = {
	//默认城市点颜色
    defaultTxtColor: '#4dffc9',
    //城市点高亮颜色
    emphasisTxtColor: '#fffb00',
    //首都标点颜色
    headquartersPointColor: '#fffb00',
    //首都高亮颜色
    headquartersEmphasisPointColor: '#fffb00',
	//地图描边颜色
	mapBorderColor: '#00b0ff',
	//地图描边高亮颜色
	emphasisMapBorderColor: '#00ffc6',
	//飞行线颜色
    flyLineColor: '#4dffc9'
}