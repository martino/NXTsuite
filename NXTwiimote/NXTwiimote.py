import sys
import gtk
import gobject
from NWMote import NWMote
from NXTwmConf import NXTwmConf

class NXTwiimote(object):
    def on_window_destroy(self, widget, data=None):
        if self.nw.Wii():
            self.nw.disconnectWiiMote()
        if self.nw.NXT():
            self.nw.disconnectNXT() 
        gtk.main_quit()

    def gtkMessage(self, msg, typeMsg):
        dlg = gtk.MessageDialog(self.window, gtk.DIALOG_MODAL, typeMsg, gtk.BUTTONS_OK, msg)
        dlg.run()
        dlg.destroy()

    def connect_wiimote(self, widget, data=None):
        print 'connetto wiimote'
        self.gtkMessage('Premi i tasti 1 e 2 per collegare il WiiMote', gtk.MESSAGE_INFO)
        self.wiiconnected = self.nw.connectWiiMote()
        if self.wiiconnected:
            self.miwiid.set_sensitive(True)
            self.miwiic.set_sensitive(False)
            self.minxtc.set_sensitive(True)
            self.updateWiiStatus()
            gobject.timeout_add(60000, self.updateWiiStatus)
            self.sbgen.push(1, "Collega il NXT")
        else:
            self.gtkMessage('Non sono stati trovati WiiMote', gtk.MESSAGE_ERROR)

    def disconnect_wiimote(self, widget, data=None):
        print 'disconnetto wiimote'
        if self.nw.disconnectWiiMote():
            if self.nw.NXT():
                self.nw.disconnectNXT()
                self.minxtc.set_sensitive(False)
                self.minxtd.set_sensitive(False)
            self.miwiic.set_sensitive(True)
            self.miwiid.set_sensitive(False)
            self.rbCM1.set_sensitive(False)
            self.rbCM2.set_sensitive(False)
            self.btnSS.set_sensitive(False)
            self.lblDisA.set_sensitive(False)
            self.lblDis.set_sensitive(False)
            self.lblDis.set_text("NA")
            self.sbbatt.push(1,"")       
            self.sbgen.push(1,"WiiMote disconnesso")

    def connect_nxt(self, widget, data=None):
        print 'connetto nxt'
        self.sbgen.push(1, "Connessione...")
        if self.nw.connectNXT():    
            self.minxtd.set_sensitive(True)
            self.minxtc.set_sensitive(False)
            self.rbCM1.set_sensitive(True)
            self.rbCM2.set_sensitive(True)
            self.btnSS.set_sensitive(True)
            self.lblDisA.set_sensitive(True)
            self.lblDis.set_sensitive(True)
            self.updateNXTStatus()
            gobject.timeout_add(1000, self.updateNXTStatus)
            self.sbgen.push(1,"Premi Start!")
        else:
            self.gtkMessage('Errore nella connessione con il NXT', gtk.MESSAGE_ERROR)
            self.sbgen.push(1,"Collega il NXT")

            
    def disconnect_nxt(self, widget, data=None):
        print 'disconnetto nxt'
        res = self.nw.disconnectNXT()
        if res:
            self.minxtc.set_sensitive(True)
            self.minxtd.set_sensitive(False)
            self.sbgen.push(1,"NXT disconnesso")
            #disabilitare tutto 
            self.rbCM1.set_sensitive(False)
            self.rbCM2.set_sensitive(False)
            self.btnSS.set_sensitive(False)
            self.lblDis.set_text("NA")
            self.lblDisA.set_sensitive(False)
            self.lblDis.set_sensitive(True)
        else:
            self.gtkMessage('Errore nella disconnessione del NXT', gtk.MESSAGE_ERROR)


    def menu_item_handler(self, menuitam, data=None):
        if self.about_dialog:
            self.about_dialog.present()
            return

        authors = ["Martino Pizzol <martino@anche.no>"]

        about_dialog = gtk.AboutDialog()
        about_dialog.set_transient_for(self.window)
        about_dialog.set_destroy_with_parent(True)
        about_dialog.set_name("NXTwiimote")
        about_dialog.set_version("0.1")
        about_dialog.set_comments("Controllo remoto di un robot NXT con un WIImote")
        about_dialog.set_authors(authors)
        def close(dialog, response, editor):
            editor.about_dialog = None
            dialog.destroy()

        def delete_event(dialog, event, editor):
            editor.about_dialog = None
            return True
        about_dialog.connect("response", close, self)
        about_dialog.connect("delete-event", delete_event, self)

        self.about_dialog = about_dialog
        about_dialog.show()

    def on_go(self, widget):
        control = 2
        if self.rbCM1.get_active():
            control = 1
        if self.nw.isControl():
            self.btnSS.set_image(self.imageP)
            self.nw.stopControl()
            self.rbCM1.set_sensitive(True)
            self.rbCM2.set_sensitive(True)
            self.sbgen.push(1, "")
        else:
            if self.nw.Wii() & self.nw.NXT():
                self.nw.startControl(control)
            self.btnSS.set_image(self.imageS)
            self.rbCM1.set_sensitive(False)
            self.rbCM2.set_sensitive(False)
            self.sbgen.push(1, "Spara con A")
    
    def updateWiiStatus(self):
        if self.nw.Wii():
            self.sbbatt.push(1, "Batteria WiiMote: %.2f%%"%self.nw.getWiiBattery()) 
            return True
        else:
            return False
            
    def updateNXTStatus(self):
        if self.nw.NXT():
            distance = self.nw.get_NXTdistance()
            if distance > -1:
                self.lblDis.set_text("%d cm"%distance)        
            else:
                self.lblDis.set_text("NA")
            return True
        else:
            return False

    def __init__(self):
        gtk.gdk.threads_init()
        gtk.gdk.threads_enter()
        self.builder = gtk.Builder()
        self.builder.add_from_file("NXTwiimote.glade")

        self.window = self.builder.get_object("window")
        self.miwiic = self.builder.get_object("miWiiConnect")
        self.miwiid = self.builder.get_object("miWiiDisconnect")
        self.minxtc = self.builder.get_object("miNxtConnect")
        self.minxtd = self.builder.get_object("miNxtDisconnect")
        self.rbCM1  = self.builder.get_object("rbCM1")
        self.rbCM2  = self.builder.get_object("rbCM2")
        self.btnSS  = self.builder.get_object("bStartStop")
        self.lblDisA= self.builder.get_object("lblInfo1")
        self.lblDis = self.builder.get_object("lblDistanza")
        self.sbgen  = self.builder.get_object("sbGeneral")
        self.sbbatt = self.builder.get_object("sbBattery")
        self.imageP = self.builder.get_object("image6")
        self.imageS = self.builder.get_object("image4")
        self.about_dialog = None

        #carica dall'xml l'indirizzo del server
        self.conf = NXTwmConf()
        try:
            self.conf.loadConf()
        except:
           errorMessage = 'Manca il file di configurazione'

        server = self.conf.getServerAddr()
        if server == 'none':
            self.nw = NWMote()
            errorMessage = 'Non e` specificato l\' indirizzo del server'
        else:
            self.nw = NWMote(server)

        self.builder.connect_signals(self)
        self.window.show()
        
        if server == 'none':
            self.gtkMessage(errorMessage, gtk.MESSAGE_ERROR)
            gtk.main_quit()        
        
        self.sbgen.push(1, "Collega il WiiMote")

if __name__ == "__main__":
    nxtwiimote = NXTwiimote()
    gtk.main()
    gtk.gdk.threads_leave()
