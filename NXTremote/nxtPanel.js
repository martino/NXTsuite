nxtTabPanel = Ext.extend(Ext.TabPanel, {
	initComponent: function(){
		// definisco tutti i componenti del pannello NXT
		
		//toolbar Superiore
		this.buttonConnection = new Ext.Button({
			ui:'action',
			text:'On',
		});
		this.buttonConnection.setHandler(this.connectionHandler, this);
		
		var tbMain = new Ext.Toolbar({
			dock:'top',
			xtype: 'toolbar',
			title: 'NXTremote',
			items: [{xtype: 'spacer'},{xtype: 'spacer'},this.buttonConnection]
			
		});
		
		//Pannelli principali inseriti poi nel tabPanel principale
		//pannello informazioni
		this.pInfo = new Ext.Panel({
			iconCls: 'info',
			layout: {
				type:'vbox',
				pack:'center',	
				align:'stretch'
			},
			scroll:'vertical',
			defaults:{
				layout:'hbox',
				flex:1,
				defaults:{
					flex:1
				}
			},
			html:'<h5>Collegati con il NXT</h5>'
		});
		this.tabBar = {dock:'bottom', layout:{pack:'center'}};
		this.dockedItems = [tbMain];
		this.fullscreen = true;
		this.animation = {type:'fade', cover:true};
		this.items = [this.pInfo];
		this.distanza = 2;
		this.connected = false;
		this.distance = false;
		nxtTabPanel.superclass.initComponent.call(this);
	},
	createMovePanel: function(){
		this.pMove = new TouchImpl({
			iconCls: 'settings'
		});
	},
	createSensorPanel: function(){
			this.updateDistance = function(){
					this.distanza = this.distanza +1;
					URL = 'NXTconnect/ultrasonicStatus';
					Ext.Ajax.request({
			        	url: URL,
						success: function(response, opts) {
							console.log("ultrasonic " +response);
							var txtResponse = 12;
							var txt = "Distanza: "+response.responseText;
							console.log(txt);
							Ext.getCmp('ustext').setTitle(txt);

						}
					});
					this.task.delay(1000);
			}
			var bCheckDistance = new Ext.Button({
				text:'Controlla Distanza',
				id:'bCD',
				ui: 'action_round'
			});
			bCheckDistance.setHandler(this.checkDistance, this);

			var bSlow = new Ext.Button({
				text:'Lento',
				ui: 'normal'
			});
			bSlow.setHandler(this.setSpeed, this);
			var bNormal = new Ext.Button({
				text:'Normale',
				ui: 'normal'
			});
			bNormal.setHandler(this.setSpeed, this);
			var bFast = new Ext.Button({
				text:'Veloce',
				ui: 'normal'
			});
			bFast.setHandler(this.setSpeed, this);

			this.dockedBottom = new Ext.Toolbar({
		            dock: 'bottom',
			    xtype: 'toolbar',
				id:'actionText',
				title:'Velocita`: Normale',
		            ui: 'light',
		    	    items:[{xtype:'spacer'}]
			    });

			//pannello
			this.pSensor = new Ext.Panel({
				iconCls: 'settings',
				layout: {
					type:'vbox',
					pack:'center',	
					align:'stretch'
				},
				scroll:'vertical',
				defaults:{
					layout:'hbox',
					flex:1,
					defaults:{
						flex:1
					}
				},
				dockedItems: this.dockedBottom,
				items:[bSlow, bNormal,bFast,bCheckDistance]
			});
			this.task = new Ext.util.DelayedTask(this.updateDistance, this);


	},
	checkDistance: function(button, event){
		if(!this.distance){
			//parte
			this.task.delay(1000);
			Ext.getCmp('bCD').setText("Ferma il controllo distanza");
		}else{
			//si ferma
			this.task.cancel();
			Ext.getCmp('bCD').setText("Controlla la distanza");
			Ext.getCmp('ustext').setTitle("Distanza: OFF");
		}
		this.distance = !this.distance;
	},
	setSpeed: function(button, event){
		if(button.text == "Lento")
			this.pMove.speed = 30;
		else
			if(button.text == "Normale")
				this.pMove.speed = 80;
			else
				this.pMove.speed = 120;
		Ext.getCmp('actionText').setTitle("Velocita`: "+button.text);
	},

	connectionHandler: function(button, event){
			var URL = '';
			if(this.connected){
				URL = 'NXTconnect/disconnect';
			}else{
				URL = 'NXTconnect/connect';
			}
			console.log(URL);
			Ext.Ajax.request({
	        	url: URL,
				scope:this,
	            success: function(response, opts) {
					if(URL == 'NXTconnect/connect'){
						console.log(response);
						if(response.responseText == 1){
							// connesso
							//pannello dei movimenti
							this.createMovePanel();
							//pannello dei sensori
							this.createSensorPanel();
							this.add(this.pMove);
							this.add(this.pSensor);
							this.pInfo.update("<h5>Connessione stabilita</h5>");
							this.doLayout();
							this.setCard(1);
							this.buttonConnection.setText('Off');
							this.connected = true;
						}else{
							//connessione non riuscita
							this.pInfo.update("<h5>Connessione fallita</h5>");
							this.doLayout();
						}
					}
					if(URL == 'NXTconnect/disconnect'){
						if(response.responseText == 1){
							//disconnesso
							this.setCard(0);
							this.pInfo.update("<h5>Disconnesso</h5>");
							this.doLayout();
							this.remove(this.pMove, false);
							this.remove(this.pSensor, false);
							this.doLayout();
							this.buttonConnection.setText('On');
							this.connected = false;
							this.task.cancel();
							Ext.getCmp('bCD').setText("Controlla la distanza");
							Ext.getCmp('ustext').setTitle("Distanza: OFF");
						}else{
							//disconnessione fallita
							this.setCard(0);
							this.pInfo.update("<h5>Disconnessione fallita</h5>");
							this.doLayout();
						}
					}
	            },
				failure: function (response, opts){
					this.pInfo.update("<h5>Errore di comunicazione con il server</h5>");
					this.doLayout();
				}
	        });
			console.log(this.connected);
	},
});
