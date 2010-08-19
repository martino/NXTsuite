TouchImpl = Ext.extend(Ext.Panel, {
    initComponent : function() {
        this.touchPad = new TouchImpl.TouchPad({
            listeners: {
                action: this.onAction,
                scope: this
            }
        });
        var toolbar = new Ext.Toolbar({
			dock:'top',
			xtype: 'toolbar',
			title: 'NXT MovePad'
		});
		
	var shotButton = new Ext.Button({
		text:'Shot',
	});
	shotButton.setHandler(this.shotHandler, this);
	
	var dockedBottom = new Ext.Toolbar({
       	dock: 'bottom',
	    xtype: 'toolbar',
    	ui: 'light',
		id: 'ustext',
		title:'Distanza: OFF',
	    layout: 'center',
    	items:[{xtype:'spacer'},shotButton]
	});

	this.dockedItems = [ dockedBottom];
    this.layout = 'fit';
   	this.items = [this.touchPad];
    TouchImpl.superclass.initComponent.call(this);
	this.startX = 0.0;
	this.startY = 0.0;
	this.speed = 80;
	},
    onAction : function(type, e) {
		if(type=='doubletap'){
			Ext.Ajax.request({
				url:'NXTconnect/stop',
				success: function(response,opts){
				}
			});
		}
		if(type=='touchstart'){
			//console.log(type+" x:"+e.pageX+" y:"+e.pageY);
			this.startX = e.pageX;
			this.startY = e.pageY;
		}
		if(type=="touchend"){
			moveX = this.startX - e.pageX;
			moveY = this.startY - e.pageY;
			powerL = -1;
			powerR = -1;
			if(Math.abs(moveX) > Math.abs(moveY)){
				//movimento sull'asse X
				if(moveX<0){
					if(moveX < -20){
						move="Destra";
						powerL = -this.speed;
						powerR = this.speed;
					}
				}else{
					if(moveX > 20){
						move="Sinistra";
						powerL = this.speed;
						powerR = -this.speed;
					}
				}
			}else{
				//movimento sull'asse Y
				if(moveY<0){
					if(moveY < -20){
						move="Down";
						powerL = -this.speed;
						powerR = -this.speed;
					}
				}else{
					if(moveY > 20){
						move="Up";
						powerL = this.speed;
						powerR = this.speed;
					}
				}
			}

			if(powerL != -1){
			//console.log(move);
			var moveURL = 'NXTconnect/goMotor?powerL='+powerL+'&powerR='+powerR;
			//console.log("ajax request");
            //console.log(moveURL);
			Ext.Ajax.request({
                		url: moveURL,
                		success: function(response, opts) {
							//console.log(response);
							//console.log("ajax success");
                		}
            		});
			}
	}
    },shotHandler: function(button, event){
		Ext.Ajax.request({
            		url: "NXTconnect/shot",
            		success: function(response, opts) {
						//console.log(response);
						//console.log("ajax success");
            		}
        		});
		}	
});

TouchImpl.TouchPad = Ext.extend(Ext.Component, {
    id: 'touchpad',
    html: '<h5>Move NXT<br/>Touch Here<br/>Double Tap to stop</h5>',
    
    initComponent : function() {
        this.addEvents('action');
        TouchImpl.TouchPad.superclass.initComponent.call(this);
    },
    
    afterRender: function() {
        TouchImpl.TouchPad.superclass.afterRender.call(this);
        
        this.mon(this.el, {
            touchstart: this.handleEvent,
            touchend: this.handleEvent,
            doubletap: this.handleEvent,
	    scope: this
        });
    },
    handleEvent: function(e) {
        this.fireEvent('action', e.type, e);
    }
});

