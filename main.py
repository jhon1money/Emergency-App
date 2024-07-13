from kivy.app import App
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.label import Label
from kivy.uix.textinput import TextInput
from kivy.uix.button import Button
from kivy.uix.image import Image
from kivy.uix.filechooser import FileChooserIconView
from kivy.uix.popup import Popup
from kivy.uix.scrollview import ScrollView
from kivy.uix.gridlayout import GridLayout
from database import Database
from datetime import datetime
from kivy.core.window import Window

class EmergencyApp(BoxLayout):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.orientation = 'vertical'
        self.db = Database()
        self.current_image_path = ''

        # Create UI elements
        self.create_ui()
        self.load_events()

    def create_ui(self):
        # Input Fields
        self.title_input = TextInput(hint_text="Título", multiline=False)
        self.description_input = TextInput(hint_text="Descripción")
        self.photo_button = Button(text="Seleccionar Foto", on_press=self.open_file_chooser)

        self.add_widget(self.title_input)
        self.add_widget(self.description_input)
        self.add_widget(self.photo_button)

        # Submit Button
        self.submit_button = Button(text="Registrar Evento", on_press=self.save_event)
        self.add_widget(self.submit_button)

        # Events List
        self.events_list = GridLayout(cols=1, size_hint_y=None)
        self.events_list.bind(minimum_height=self.events_list.setter('height'))
        self.scroll_view = ScrollView(size_hint=(1, None), size=(Window.width, Window.height/2))
        self.scroll_view.add_widget(self.events_list)
        self.add_widget(self.scroll_view)

    def open_file_chooser(self, instance):
        content = FileChooserIconView(on_selection=self.selected)
        self.file_chooser_popup = Popup(title="Seleccionar Foto", content=content, size_hint=(0.9, 0.9))
        self.file_chooser_popup.open()

    def selected(self, filechooser, selection):
        if selection:
            self.current_image_path = selection[0]
            self.file_chooser_popup.dismiss()

    def save_event(self, instance):
        title = self.title_input.text
        description = self.description_input.text
        date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        photo = self.current_image_path

        if title and description and photo:
            self.db.insert_event(date, title, description, photo)
            self.title_input.text = ''
            self.description_input.text = ''
            self.current_image_path = ''
            self.load_events()

    def load_events(self):
        self.events_list.clear_widgets()
        events = self.db.get_events()
        for event in events:
            event_box = BoxLayout(orientation='horizontal', size_hint_y=None, height=40)
            event_label = Label(text=f"{event[1]} - {event[2]}")
            view_button = Button(text="Ver", size_hint_x=None, width=100, on_press=lambda x, e=event: self.view_event(e))
            event_box.add_widget(event_label)
            event_box.add_widget(view_button)
            self.events_list.add_widget(event_box)

    def view_event(self, event):
        content = BoxLayout(orientation='vertical')
        content.add_widget(Label(text=f"Fecha: {event[1]}"))
        content.add_widget(Label(text=f"Título: {event[2]}"))
        content.add_widget(Label(text=f"Descripción: {event[3]}"))
        content.add_widget(Image(source=event[4]))
        popup = Popup(title="Detalles del Evento", content=content, size_hint=(0.9, 0.9))
        popup.open()

class EmergencyAppApp(App):
    def build(self):
        return EmergencyApp()

if __name__ == '__main__':
    EmergencyAppApp().run()
