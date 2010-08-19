from xml.dom.minidom import parse

#classe per gestire il file di configurazione
class NXTwmConf(object):
    def loadConf(self):
        self.doc = parse(open('conf.xml'))


    def getServerAddr(self):
        try:
            return self.doc.getElementsByTagName('server')[0].getAttribute('addr')
        except:
            return 'none'
