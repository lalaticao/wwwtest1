// extend
function extend(prototype, content) { 
	for (var key in content) { 
		prototype[key] = content[key];
	}
}
/** MyView */
function MyView(viewWidth, viewHeight, x, y) { 
	var jq = $("<div/>", {
		css: {
			"margin": "0",
			"padding": "0",
			"display": "block",
			"position": "absolute"
		}
	});
	jq.addClass("myview");
	if (viewWidth)
		jq.width(viewWidth);
	if (viewHeight)
		jq.height(viewHeight);
	jq.offset({ left: x, top: y });
	
	this.jQueryObject = jq;
}
MyView.prototype = {constructor: MyView,
	width: function () { 
		if (arguments.length == 0)
			return this.jQueryObject.width();
		else
			this.jQueryObject.width(arguments[0]);
	},
	height: function () {
		if (arguments.length == 0)
			return this.jQueryObject.height();
		else
			this.jQueryObject.height(arguments[0]);
	},
	offset: function () { 
		if (arguments.length == 0)
			return this.jQueryObject.offset();
		else
			this.jQueryObject.offset(arguments[0]);
	},
	move: function (offset) { 
		var o = this.offset();
		o.left += offset.left;
		o.top += offset.top;
		this.offset(o);
	},
	addTo: function (target) { 
		if (target instanceof MyView)
			target = target.jQueryObject;
		if (target instanceof $)
			this.jQueryObject = this.jQueryObject.appendTo(target);
		return this;
	},
	insertBefore: function (target) { 
		if (target instanceof MyView)
			target = target.jQueryObject;
		if (target instanceof $)
			this.jQueryObject = this.jQueryObject.insertBefore(target);
	},
	insertAfter: function (target) { 
		if (target instanceof MyView)
			target = target.jQueryObject;
		if (target instanceof $)
			this.jQueryObject = this.jQueryObject.insertAfter(target);
	}
};
/** MyFrame : MyView */
function MyFrame(frameWidth, frameHeight, borderWidth, borderColor, x, y) { 
	if (frameWidth && frameHeight) { 
		if (!borderWidth)
			borderWidth = 0;
		if (!borderColor)
			borderColor = "black";
		MyView.call(this, frameWidth - 2 * borderWidth, frameHeight - 2 * borderWidth, x, y);
		this.jQueryObject.css("border", borderWidth.toString() + "px solid " + borderColor);
		this.jQueryObject.addClass("myframe");
	}
	//else raise exception
}
MyFrame.prototype = new MyView();
extend(MyFrame.prototype, {
	constructor: MyFrame,
	borderWidth:function () {
		if (arguments.length == 0)
			return parseInt(this.jQueryObject.css("border-width"));
		else
			this.jQueryObject.css("border-width", arguments[0]+"px");
	},
	borderColor:function () {
		if (arguments.length == 0)
			return this.jQueryObject.css("border-color");
		else
			this.jQueryObject.css("border-color", arguments[0]);
	},
	frameWidth:function () {
		return this.borderWidth() * 2 + this.width();
	},
	frameHeight:function () {
		return this.borderHeight() * 2 + this.height();
	}
});
/** MyButton : MyView */
//...

/** MyTitleBar : MyView */
function MyTitleBar(titleBarHeight, color, title, x, y) { 
	MyView.call(this, "100%", titleBarHeight, x, y);
	if (color)
		this.jQueryObject.css("background-color", color);
	if (title)
		this.jQueryObject.text(title);
	this.jQueryObject.addClass("mytitlebar");
}
MyTitleBar.prototype = new MyView();
extend(MyTitleBar.prototype, {
	constructor: MyTitleBar,
	color: function () {
		if (arguments.length == 0)
			return this.jQueryObject.css("background-color");
		else
			this.jQueryObject.css("background-color", arguments[0]);
	},
	title: function () {
		if (arguments.length == 0)
			return this.jQueryObject.text();
		else
			this.jQueryObject.text(arguments[0]);
	}
});

/** MyWindow : MyFrame */ 
function MyWindow(windowWidth, windowHeight, hasTitleBar, title, x, y) { 
	var borderWidth = 1;
	var borderAndTitleBarColor = "#729fcf";
	var titleBarHeight = 20;
	MyFrame.call(this, windowWidth, windowHeight, borderWidth, borderAndTitleBarColor, x, y);
	this.titleBar = new MyTitleBar(titleBarHeight, borderAndTitleBarColor, title, 0, 0);
	this.contentView = new MyView(windowWidth - 2 * borderWidth, windowHeight - 2 * borderWidth, 0, 0);
	
	this.contentView.addTo(this);
	if (hasTitleBar != false)
		this.addTitleBar();
	this.jQueryObject.addClass("mywindow");
}
MyWindow.prototype = new MyFrame();
extend(MyWindow.prototype, {
	constructor: MyWindow,
	addTitleBar: function () {
		if (!this.hasTitleBar()) { 
			this.titleBar.addTo(this);
			this.contentView.height(this.height() - this.titleBar.height());
			this.contentView.offset({ left: 0, top: this.titleBar.height() });
		}
	},
	removeTitleBar: function () { 
		if (this.hasTitleBar()) { 
			this.titleBar.jQueryObject.detach();
			this.contentView.height(this.height());
			this.contentView.offset({ left: 0, top: 0 });
		}
	},
	hasTitleBar: function () { 
		return $(".mytitlebar", this.jQueryObject).length > 0;
	}
});

$(function () {

	var myWindow = new MyWindow(500, 300, true, "black", 50, 50);
	myWindow.addTo($("body"));

});