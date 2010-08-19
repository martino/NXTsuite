import nxt.locator, sys
from NXTconf import NXTconf
from nxt.sensor import *
from nxt.motor import *
from twisted.web import xmlrpc, server


class NXTserver(xmlrpc.XMLRPC):
    connected = False;
    def init(self):
        print 'NXTserver running'
        #carica la configurazione
        self.conf = NXTconf()
        try:
            self.conf.load()
        except:
            return False
        self.sock = None
        self.brick = None
        self.scan() 
        return True
   
    def scan(self):
        if self.sock == None:
            try:
                #aggiungere il bt address
                self.sock = nxt.locator.find_one_brick()
                print 'Brick found'
                return True
            except:
                print 'No brick found'
                return False
        else:
            return True

    def xmlrpc_connect(self):
        if self.brick != None:
            return True

        if self.scan():
            self.brick = self.sock.connect()
            if self.brick == None:
                print 'Not connected'
                print self.sock
                return False
            else:   
                print 'Connection OK'
                return True
        else:
            return False

    def xmlrpc_disconnect(self):
        try:
            self.brick.sock.close()
            self.brick = None
            ret = True
            print 'Connection close'
        except:
            ret = False
        return ret

    # restituisce la distanza percepita dal sensore ultrasonico in cm
    def xmlrpc_ultrasonicStatus(self):
        print 'Ultrasonic Status'
        try:
            ret = UltrasonicSensor(self.brick, self.conf.getUltrasonicSensor()).get_sample()
        except:
            ret = -1 
        return ret 

    # restituisce la carica della batteria in millivolt
    def xmlrpc_batteryStatus(self):
        print 'Battery Status'
        try:
            ret = self.brick.get_battery_level()
        except:
            ret = -1
        return ret

    def xmlrpc_goMotor(self, powerL=100, powerR=100):
        print 'Go'
        if(powerL>127):
            powerL = 127
        elif powerL<-128:
            powerL = -128

        if(powerR>127):
            powerR = 127
        elif powerR<-128:
            powerR = -128

        rMotorA = self.runMotor(self.conf.getMoveMotor()[0],powerL)
        rMotorB = self.runMotor(self.conf.getMoveMotor()[1],powerR)
        return rMotorA & rMotorB

    def xmlrpc_stop(self):
        print 'Stop'
        rMotorA = self.stopMotor(self.conf.getMoveMotor()[0])
        rMotorB = self.stopMotor(self.conf.getMoveMotor()[1])
        return rMotorA & rMotorB

    def xmlrpc_shot(self):
        print 'Shot'
        return self.updateMotor(self.conf.getShotMotor(), 127, 360)

    def updateMotor(self, port, power, degree):
        try:
            Motor(self.brick, port).update(power, degree)
            return True
        except:
            return False

    def runMotor(self, port, power):
        try:
            Motor(self.brick, port).run(power, 1)
            return True
        except:
            return False

    def stopMotor(self, motor):
        try:
            Motor(self.brick, motor).stop()
            return True
        except:
            return False
        
        
if __name__ == '__main__':
    from twisted.internet import reactor
    nser = NXTserver()
    if nser.init():
        reactor.listenTCP(8088, server.Site(nser))
        print 'TCP port 8088'
        reactor.run()
    else:
        print 'Error loading configuration'

