import cwiid, xmlrpclib, time, math


class NWMote(object):
    def __init__(self,serverAddress="http://localhost:8088"):
        self.wiimote = None
        self.last = time.time() 
        self.control = False
        self.nxtserver = xmlrpclib.Server(serverAddress)
        self.nxtconnected = False
        self.wiiconnected = False
        self.speed = 100

    def connectNXT(self):
        try:
            self.nxtconnected = self.nxtserver.connect()
            return self.nxtconnected
        except:
            return False

    def disconnectNXT(self):
        try:
            try:
                self.nxtserver.stop()
            except:
                print 'Error NXT'
            res = self.nxtserver.disconnect()
            self.nxtconnected = not res
            return res
        except:
            return False

    def NXT(self):
        return self.nxtconnected
    
    def Wii(self):
        return self.wiiconnected
    
    def isControl(self):
        return self.control
    
    def disconnectWiiMote(self):
        print 'disconnect'
        if self.wiimote is not None:
            self.wiimote.close()
            self.wiimote = None
            self.wiiconnected = False
            return True
        return False

    def connectWiiMote(self):
        try:
            self.wiimote = cwiid.Wiimote()
        except:
            self.wiimote = None
            return False
        #attivo i bit degli eventi da catturare
        self.wiimote.rpt_mode = cwiid.RPT_ACC | cwiid.RPT_BTN
        #calibro il telecomando
        self.acc_cal = self.wiimote.get_acc_cal(cwiid.EXT_NONE)
        #imposto la callback che gestisce i messaggi
        self.wiimote.enable(cwiid.FLAG_MESG_IFC | cwiid.FLAG_REPEAT_BTN)
        self.wiimote.mesg_callback = self.callback
        self.wiimote.rumble = 1
        time.sleep(.2)
        self.wiimote.rumble = 0
        self.last = time.time()
        self.wiiconnected = True
        return True

    def startControl(self, typeControl):
        self.last = time.time()
        self.control = True
        self.tcontrol = typeControl
        self.ax = self.ay = self.az = 0
  
    def stopControl(self):
        self.control = False
        try:
            self.nxtserver.stop()
        except:
            print 'Error NXT'
   
    #restituisce la percentuale di batteria rimasta        
    def getWiiBattery(self):
        return 100.0*self.wiimote.state['battery']/cwiid.BATTERY_MAX
    
    #restituisce i dati dell'accelerometro
    def get_accels(self):
        ax = (float(self.wiimote.state['acc'][cwiid.X]) - float(self.acc_cal[0][cwiid.X]))/(float(self.acc_cal[1][cwiid.X])-float(self.acc_cal[0][cwiid.X]))
        ay = (float(self.wiimote.state['acc'][cwiid.Y]) - float(self.acc_cal[0][cwiid.Y]))/(float(self.acc_cal[1][cwiid.Y])-float(self.acc_cal[0][cwiid.Y]))
        az = (float(self.wiimote.state['acc'][cwiid.Z]) - float(self.acc_cal[0][cwiid.Z]))/(float(self.acc_cal[1][cwiid.Z])-float(self.acc_cal[0][cwiid.Z]))
        return ax, ay, az

    #restituisce il pitch e il roll misurato
    def get_pitch_roll(self):
        ax, ay, az = self.get_accels()
        if az == 0:
            az = 0.0000000001
        roll = math.atan(ax/az)
        if az <= 0.0:
            if ax > 0:
                roll += math.pi
            else:
                roll -= math.pi
        pitch = math.atan(ay/az*math.cos(roll))
        return roll, pitch

    def get_buttonA(self,mode):
        buttons = self.wiimote.state['buttons']
        if mode:
            if (buttons == cwiid.CLASSIC_BTN_X + cwiid.CLASSIC_BTN_UP) or (buttons == cwiid.CLASSIC_BTN_X + cwiid.CLASSIC_BTN_LEFT) or (buttons == cwiid.CLASSIC_BTN_X):
                return True
        else:
            if buttons == cwiid.CLASSIC_BTN_X:
                return True
        return False
    
    def get_button1(self,mode):
        buttons = self.wiimote.state['buttons']
        if mode:
            if (buttons == cwiid.CLASSIC_BTN_X + cwiid.CLASSIC_BTN_UP) or (buttons == cwiid.CLASSIC_BTN_X + cwiid.CLASSIC_BTN_LEFT) or (buttons == cwiid.CLASSIC_BTN_UP):
                return True
        else:
            if buttons == cwiid.CLASSIC_BTN_UP:
                return True
        return False
    
    def get_button2(self,mode):
        buttons = self.wiimote.state['buttons']
        if mode:
            if (buttons == cwiid.CLASSIC_BTN_X + cwiid.CLASSIC_BTN_UP) or (buttons == cwiid.CLASSIC_BTN_X + cwiid.CLASSIC_BTN_LEFT) or (buttons == cwiid.CLASSIC_BTN_LEFT):
                return True
        else:
            if buttons == cwiid.CLASSIC_BTN_LEFT:
                return True
        return False
    
    def get_NXTdistance(self):
        try:
            return self.nxtserver.ultrasonicStatus()
        except:
            print "NXTServerError - ultrasonicStatus"
            return -1

    #callback che si occupa di gestire i dati del telecomando
    def callback(self, messages, buttons):
        if not self.control:
            return 
        if not self.Wii():
            return 
        #analizzo i messaggi
        try:
            curr = time.time()
            if curr - self.last > 0.15:
                roll, pitch = self.get_pitch_roll()
                tmp = 0
                if self.tcontrol == 1: #mario kart type [bottoni]
                    if self.get_button1(self.tcontrol):
                        tmp = 1
                    elif self.get_button2(self.tcontrol):
                        tmp = -1
                else: # wii totale
                    tmp = roll
                speedL = speedR = tmp

                if pitch < -0.1:
                    #print "sinistra"
                    speedL *= self.speed
                    speedR *= -self.speed
                elif pitch > 0.1:
                    #print "destra"
                    speedL *= -self.speed
                    speedR *= self.speed
                else:
                    #print "rettilineo"
                    speedR *= self.speed
                    speedL *= self.speed
                try:
                    self.nxtserver.goMotor(speedL, speedR)
                except:
                    print "NXTServerError - go"
       
                if self.get_buttonA(self.tcontrol):
                    try:
                        self.nxtserver.shot()
                    except:
                        print "NXTServerError - shot"
                self.last = curr
        except:
               return

