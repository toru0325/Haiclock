//test

var win;
var haikus;
var clickSnd;
var bgmSnd;

(function main(){
	Ti.UI.iPhone.hideStatusBar();
	
    Ti.Media.defaultAudioSessionMode = Ti.MediaAUDIO_SESSION_MODE_AMBIENT;
    clickSnd = _crateSound("click.wav", 0.1);
    bgmSnd = _crateSound("bgm2.wav", 0.1);

	bgmSnd.setLooping(true);
	bgmSnd.play();

	//=========== FASE1 ==========
	win = Ti.UI.createWindow({
		backgroundColor:"#aaa",
	})
	
	//=== set loading UIs
	var loadingV = _createLoading();
	win.add(loadingV)
		
	//=== show window
	win.open({transition:Ti.UI.iPhone.AnimationStyle.FLIP_FROM_RIGHT});
	
	//=== load data
	setTimeout(function(){ //=== トランジションを待ってAPIコール
		_loadHikes(function(responsText){
			try{
				//=== リストを用意
				haikus = JSON.parse(responsText);
				
				//=== loading UIを撤収
				_fadeoutAndRemoveLoading(loadingV, fase2);
				
			}catch(e){
				alert("Could not get correct data!");
			}
		});
	}, 600);
	
	
	//=========== FASE2 : 時計スタート ==========
	function fase2(){
		var clockV;
		
		win.animate({
			duration: 2000,
			backgroundColor: "#000",
		});
		
		setTimeout(function(){
			clockV = _createClock();
			win.add(clockV);
			
			setTimeout(fase3, 2000);
		}, 2000);
	}
	
	//=========== FASE3 : アニメーションスタート ==========
	function fase3(){
		_doBg()
		_doHaiku();
	}
})();



function _doBg(){
	var baseV = Ti.UI.createView({
		opacity: 0.0,
	});
	baseV.animate({
		duration: 3000,
		opaque: true,
		opacity: 1.0,
	});
	win.add(baseV);
	
	var v = Ti.UI.createView({
		backgroundImage: "bg.png",
		width: 320, 
		height: 350,
		transform: Ti.UI.create2DMatrix().scale(2.0),
	});
	
	var anim1 = Ti.UI.createAnimation({
		duration: 15000,
		transform: Ti.UI.create2DMatrix().scale(1.7).rotate(179),
		opaque: true,
		opacity: 1.0,
	});
	var anim2 = Ti.UI.createAnimation({
		duration: 5000,
		transform: Ti.UI.create2DMatrix().scale(4.0),
		opaque: true,
		opacity: 0.5,
	});
	_startAnim1();
	baseV.add(v);
	
	
	function _startAnim1(){
		v.animate(anim1);
		setTimeout(function(){
			_startAnim2();
		}, anim1.duration);
	}
	function _startAnim2(){
		v.animate(anim2);
		setTimeout(function(){
			_startAnim1();
		}, anim2.duration);
	}
}


function _crateSound(inResourceDirPath_str, volume_fl){
    try{
        
        var sf = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, inResourceDirPath_str);
        var snd = Ti.Media.createSound({
            sound: sf,
            preload:true,
        });
        snd.setVolume(volume_fl);
        return snd;
        
    }catch(e){
        Ti.API.error(e);
    }
}


function _doHaiku(){
	var baseV = Ti.UI.createView({
		zIndex: 20,
	});
	win.add(baseV);
	
	var i = 0;
	_next();
	
	function _next(){
		var v = _createItem(haikus[i]);
		
		i = (i<haikus.length-1) ? i+1 : 0;
		
		v.transform = Ti.UI.create2DMatrix().scale(0.5).rotate(10);
		v.opacity = 0.0;
		v.animate({
			duration: 3000,
			transform: Ti.UI.create2DMatrix().scale(0.8),
			opaque: true,
			opacity: 1.0,
			curve: Ti.UI.ANIMATION_CURVE_EASE_OUT,
		});
		setTimeout(function(){
			v.animate({
				duration: 3000,
				transform: Ti.UI.create2DMatrix().scale(1.5).rotate(-10),
				opaque: true,
				opacity: 0.0,
				curve: Ti.UI.ANIMATION_CURVE_EASE_IN,
			});
			setTimeout(function(){
				baseV.remove(v);
				_next();
			}, 3000 + 100);
		}, 3000+2000);
		
		baseV.add(v);			
	}
			
	function _createItem(obj){
		var SIZE = 100;
		
		var itemV = Ti.UI.createView({
			width:300,
			height:350,
			//backgroundColor: "#444",
		});
		itemV.add( Ti.UI.createView({
			height:"auto",
		}) );
		var v = Ti.UI.createImageView({
			image: obj.user.profile_image_url,
			preventDefaultImage: true,
			width: SIZE,
			height: SIZE,
			left: 0,
			top: 0,
		});			
		itemV.add(v);
		var lv = Ti.UI.createLabel({
			text: obj.user.screen_name,
			color: "#fff",
			font: {fontSize:25, fontFamily:'Helvetica', fontWeight:'bold'},
			height: 30,
			left: 0,
			top: SIZE + 5,
		});
		itemV.add(lv);
		var lv = Ti.UI.createLabel({
			text: obj.text,
			color: "#bbb",
			font: {fontSize:20, fontFamily:'Helvetica'},
			height: "auto",
			left: 0,
			top: SIZE + 40,
		});
		itemV.add(lv);
		
		itemV.addEventListener("click", function(){
			clickSnd.play();
			Ti.Platform.openURL(obj.user.url);
		});
		//itemV.anchorPoint = {x:0, y:0};
		
		return itemV;
	}
}



var clockIntId;
function _createClock(){
	var baseV = Ti.UI.createView({
		zIndex: 10,
	});
	
	var clockV = Ti.UI.createLabel({
		color: "#fff",
		textAlign: "center",
		height: 75,
		font: {fontSize:70, fontFamily:'AppleGothic', fontWeight:'bold'},
		bottom: 10,
		opacity: 0.2,
	});
	baseV.add(clockV);
	
	clockIntId = setInterval(_updateClock, 1000);
	_updateClock();
		
	clockV.transform = Ti.UI.create2DMatrix().translate(0, clockV.height);
	clockV.animate({
		duration: 1000,
		transform: Ti.UI.create2DMatrix(),
		curve: Ti.UI.ANIMATION_CURVE_EASE_OUT,
	});
	
	return baseV;
	
	function _updateClock(){
        var d = new Date();
        var s = d.toString().split(" ");
		
		clockV.text = s[4].substring(0, 8);
	}
}


function _createLoading(){
	var baseV = Ti.UI.createView();
	
	var lv = Ti.UI.createLabel({
		text: "Now downloading\nthe latest 'Haikus' form server",
		color: "#000",
		textAlign: "center",
		font: {fontSize:14,fontFamily:'Verdana', fontWeight:'bold'},
	})
	baseV.add(lv);
	
	var v = Ti.UI.createView({
		width: 20,
		height: 20,
		top: 180,
	})
	v.add( Ti.UI.createActivityIndicator({
		style: Ti.UI.iPhone.ActivityIndicatorStyle.DARK,
		visible: true,
	}) );
	
	baseV.add(v);
	
	return baseV;
}


function _fadeoutAndRemoveLoading(loadingV, cb_func){
	var fadeT = 400;
	loadingV.animate({
		duration:fadeT,
		opacity: 0.0,
		opaque: true,
		transform: Ti.UI.create2DMatrix().translate(0, 10),
	})
	setTimeout(function(){
		win.remove(loadingV);
		cb_func();
	}, fadeT);
}


function _loadHikes(cb_func){
	var xhr = Titanium.Network.createHTTPClient();

	xhr.onload = function(e){
		cb_func(this.responseText);
	}
	
	xhr.open('GET','http://h.hatena.ne.jp/api/statuses/public_timeline.json');
	xhr.send();
}