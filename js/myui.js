// extend
function extend(prototype, content) { 
	for (var key in content) { 
		prototype[key] = content[key];
	}
}
var myui = [];
/** MyView */
function MyView(viewWidth, viewHeight, x, y) {
	this.id = myui.length;
	myui.push(this);
	
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
	this.parent = undefined;
	this.children = [];
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
		if (!target) {
			this.jQueryObject = this.jQueryObject.appendTo($("body"));
			this.parent = null;
		}
		else if (target instanceof MyView) { 
			this.jQueryObject = this.jQueryObject.appendTo(target.jQueryObject);
			this.parent = target;
			target.children[this.id] = this;
		}
		return this;
	},
	remove: function () { 
		this.jQueryObject = this.jQueryObject.detach();
		if (this.parent) {
			this.parent.children[this.id] = undefined;
			this.parent = undefined;
		}
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
		this.jQueryObject.addClass("myframe");
		
		this.jQueryObject.css("border", borderWidth.toString() + "px solid " + borderColor);
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
function MyButton(buttonWidth, buttonHeight, text, img, x, y) { 
	MyView.call(this, buttonWidth, buttonHeight, x, y);
	this.jQueryObject.addClass("mybutton");
	
	if (text) {
		this.jQueryObject.text(text);
		this.jQueryObject.css("text-align", "center");
		this.jQueryObject.css("border", "1px solid black");
	}
	if (img)
		this.jQueryObject.css({
			"background-image": "url(\"" + img + "\")",
			"background-repeat": "no-repeat",
			"background-position": "center center",
			"background-size": "cover"
		});
}
MyButton.prototype = new MyView();
extend(MyButton.prototype, {
	constructor: MyFrame,
	click: function () { 
		if (arguments.length == 0)
			return this.jQueryObject.click();
		else
			this.jQueryObject.click(arguments[0]);
	},
	//img and text
});
/** MyTitleBar : MyView */
function MyTitleBar(titleBarHeight, color, title, x, y) { 
	MyView.call(this, "100%", titleBarHeight, x, y);
	this.jQueryObject.addClass("mytitlebar");
	
	if (color)
		this.jQueryObject.css("background-color", color);
	if (title)
		this.jQueryObject.text(title);
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
	this.jQueryObject.addClass("mywindow");
	
	this.titleBar = new MyTitleBar(titleBarHeight, borderAndTitleBarColor, title, 0, 0);
	this.closeBox = new MyButton(16, 16, "x");
	this.contentView = new MyView(windowWidth - 2 * borderWidth, windowHeight - 2 * borderWidth, 0, 0);
	
	this.closeBox.jQueryObject.css({ "right": "0", "top": "0" });
	this.closeBox.addTo(this.titleBar);
	this.contentView.addTo(this);
	if (hasTitleBar != false)
		this.addTitleBar();
	
	var mouseLoc;
	var win = this;
	this.closeBox.click(function () {
		win.close();
	});
	this.titleBar.jQueryObject.bind('mousedown', function (jEvent) {
		mouseLoc = { x: jEvent.clientX, y: jEvent.clientY };
		var doc = $(document);
		doc.bind("mousemove", function (je) {
			win.move({ left: je.clientX - mouseLoc.x, top: je.clientY - mouseLoc.y });
			mouseLoc = { x: je.clientX, y: je.clientY };
			return false;
		});
		doc.bind("mouseup", function () {
			doc.unbind("mouseup");
			doc.unbind("mousemove");
			return false;
		});
		
		return false;
	});
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
			this.titleBar.remove();
			this.contentView.height(this.height());
			this.contentView.offset({ left: 0, top: 0 });
		}
	},
	hasTitleBar: function () { 
		return $(".mytitlebar", this.jQueryObject).length > 0;
	},
	isClosed: function () {
		return true;
	},
	open: function () { 
		if (this.isClosed()) {
			this.addTo();
			this.isClosed = function () { return false; };
		}
	},
	close: function () { 
		if (!this.isClosed()) { 
			this.remove();
			this.isClosed = function () { return true; };
		}
	}
});
