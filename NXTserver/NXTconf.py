#importa da un file di configurazione la mappa porta - sensore/motore
#porte disponibili: PORT_A PORT_B PORT_C PORT_ALL PORT_1 PORT_2 PORT_3 PORT_4
from nxt.motor import *
from nxt.sensor import *
from xml.dom.minidom import parse

class NXTconf(object):
    def load(self):
        self.doc = parse(open('conf.xml'))


    def getPort(self, pname):
        if pname == 'A':
            return PORT_A
        elif pname == 'B':
            return PORT_B
        elif pname == 'C':
            return PORT_C
        elif pname == '1':
            return PORT_1
        elif pname == '2':
            return PORT_2
        elif pname == '3':
            return PORT_3
        elif pname == '4':
            return PORT_4

    def getPortItem(self, item):
        return self.getPort(self.doc.getElementsByTagName(item)[0].getAttribute('port')) 
        

    def getMoveMotor(self):
        left = self.getPortItem('left')
        right = self.getPortItem('right')
        motorList = [left, right]
        return motorList


    def getShotMotor(self):
        return self.getPortItem('center')

    def getUltrasonicSensor(self):
        return self.getPortItem('ultrasonic')

    def getColorSensor(self):
        return self.getPortItem('color')

    def getNXTbtAddr(self):
        return self.doc.getElementsByTagName('nxt')[0].getAttribute('addr')

