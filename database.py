import sqlite3

class Database:
    def __init__(self):
        self.conn = sqlite3.connect('emergency_events.db')
        self.create_table()

    def create_table(self):
        with self.conn:
            self.conn.execute('''CREATE TABLE IF NOT EXISTS events
                                 (id INTEGER PRIMARY KEY,
                                  date TEXT,
                                  title TEXT,
                                  description TEXT,
                                  photo TEXT)''')

    def insert_event(self, date, title, description, photo):
        with self.conn:
            self.conn.execute('''INSERT INTO events (date, title, description, photo)
                                 VALUES (?, ?, ?, ?)''', (date, title, description, photo))

    def get_events(self):
        cursor = self.conn.cursor()
        cursor.execute('''SELECT * FROM events''')
        return cursor.fetchall()
