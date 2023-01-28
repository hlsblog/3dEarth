//鼠标hover处理类（实现tooltips方案）
 (function(win){
	 var sToolTipsConfig = win.earthDataConfig.tooltips;
	 var HoverHandler = {
		timer: null,
		name: '',
		tipsContainer: null,
		offsetLeft: 0,
		offsetTop: 0,
		currentOffsetLeft: 0,
		currentOffsetTop: 0,
		isMouseOn: false,
		mouseOnPos: [0, 0],
		bAutoTooltips: false,	//设置自动悬浮提示层
		setAutoToolTips: function() {
			this.bAutoTooltips = true;
		},
		setName: function(name){
			this.name = name
		},
		setPos: function(obj){
			this.currentOffsetLeft = obj.offsetLeft
			this.currentOffsetTop = obj.offsetTop
		},
		setRealPos: function(){
			this.offsetLeft = this.currentOffsetLeft
			this.offsetTop = this.currentOffsetTop
		},
		start: function(){
			this.clearTimer()
			//设置自动提示层，不再受页面提示控制
			if (this.bAutoTooltips) {
				return;
			}
			if (this.name) {
				if (!sToolTipsConfig[this.name]) {
					this.setName('')
					this.showTipsRealContent(false)
					return
				}
				this.tipsContainer.style.left = this.offsetLeft  + 'px'
				this.tipsContainer.style.top = this.offsetTop + 'px'
				this.showTipsRealContent(true)
				//setAutoRotate(false)
			}
		},
		end: function() {
			var _this = this;
			if (!_this.name) {
				return
			}
			if (!sToolTipsConfig[this.name]) {
				return
			}
			this.clearTimer()
			this.timer = setTimeout(function(){
				//设置自动提示层，不再受页面提示控制
				if (this.bAutoTooltips) {
					return;
				}
				_this.setName('')
				_this.showTipsRealContent(false)
				//setAutoRotate(true)
			}, 800)
		},
		clearTimer: function(){
			if(this.timer) {
				clearTimeout(this.timer);
			}
		},
		showTipsRealContent(flag) {
			var desc = 'loading...'
			var display = 'none'
			var img = ''
			if (flag) {
				img = sToolTipsConfig[this.name].img
				desc = sToolTipsConfig[this.name].desc
				display = 'block'
			}
			this.tipsContainer.querySelector('img').setAttribute('src', img)
			this.tipsContainer.querySelector(".my-tips").innerHTML = desc
			this.tipsContainer.style.display = display;
		},
		init: function(){
			this.tipsContainer = document.querySelector(win.containerConfig.tooltipsLayer);
			var bMouseDown = false,      //鼠标按下检查
				layzMouseUpTimer = null, //鼠标放开延迟时间对象
				_this = this;
			//获取贴图纹理对象	
			var myChart = DrawEarthObj.myTextureChart;
			//获取地球自转控制方法
			var setAutoRotate = DrawEarthObj.setAutoRotate;
			//鼠标经过地球事件
			myChart.getZr().on("mouseover", function(e){
				if (bMouseDown) {
					return
				}
				_this.start()
			})
			//鼠标移出地球事件
			myChart.getZr().on("mouseout", function(e){
				if (bMouseDown) {
					return
				}
				_this.end()
			})
			//页面鼠标按下事件
			document.addEventListener("mousedown", function(e){
				if(layzMouseUpTimer) {
					clearTimeout(layzMouseUpTimer)
				}
				bMouseDown = true
			})
			//页面鼠标弹起事件
			document.addEventListener("mouseup", function(e){
				if(layzMouseUpTimer) {
					clearTimeout(layzMouseUpTimer)
				}
				layzMouseUpTimer = setTimeout(function(){
					bMouseDown = false
				}, 300)
			})
			//页面鼠标经过事件，记录鼠标位置
			document.addEventListener("mouseover", function(e){
				_this.setPos({
					offsetLeft: e.x,
					offsetTop: e.y
				})
			})
			//页面鼠标移动事件，记录鼠标位置
			document.addEventListener("mousemove", function(e){
				_this.setPos({
					offsetLeft: e.x,
					offsetTop: e.y
				})
			})
			//tooltips弹层鼠标经过事件，停止地球自转，显示tooltips
			this.tipsContainer.addEventListener("mouseover", function(){
				setAutoRotate(false)
				_this.isMouseOn = false
				_this.start()
			}, false)
			//tooltips弹层鼠标移出事件，开始地球自转，隐藏tooltips
			this.tipsContainer.addEventListener("mouseout", function(){
				_this.end()
				setAutoRotate(true)
				_this.isMouseOn = true
			}, false)
		}
	}
	win.HoverHandler = HoverHandler
 }(window))