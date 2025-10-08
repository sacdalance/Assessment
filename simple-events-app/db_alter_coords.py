# db_alter_coords.py
import psycopg2
from psycopg2 import sql
from datetime import datetime
import os

# Database configuration
DB_CONFIG = {
    'user': os.getenv('PGUSER', 'postgres'),
    'password': os.getenv('PGPASSWORD', 'your_password'),
    'host': os.getenv('PGHOST', 'localhost'),
    'port': os.getenv('PGPORT', '5432')
}

def create_database():
    """Create the events_db database if it doesn't exist"""
    try:
        # Connect to default postgres database
        conn = psycopg2.connect(
            dbname="postgres",
            **DB_CONFIG
        )
        conn.autocommit = True
        cur = conn.cursor()
        
        # Check if database exists
        cur.execute("SELECT 1 FROM pg_database WHERE datname = 'events_db'")
        if not cur.fetchone():
            cur.execute("CREATE DATABASE events_db")
            print("Database 'events_db' created successfully")
        else:
            print("Database 'events_db' already exists")
            
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"Error creating database: {e}")
        return False
    
    return True

def create_table_and_indexes():
    """Create events_entries table with proper fields and indexes"""
    try:
        # Connect to events_db
        conn = psycopg2.connect(
            dbname="events_db",
            **DB_CONFIG
        )
        cur = conn.cursor()
        
        # Create table with id as primary key
        cur.execute("""
            CREATE TABLE IF NOT EXISTS events_entries (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT,
                lat DOUBLE PRECISION NOT NULL,
                lng DOUBLE PRECISION NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        # Create indexes on lat and lng for better query performance (DD format)
        cur.execute("CREATE INDEX IF NOT EXISTS idx_events_lat ON events_entries(lat);")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_events_lng ON events_entries(lng);")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_events_lat_lng ON events_entries(lat, lng);")
        
        conn.commit()
        print("Table 'events_entries' and indexes created successfully")
        print("Coordinates stored in DD (Decimal Degrees) format")
        print("Indexes created on lat, lng, and lat+lng for optimal performance")
        
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"Error creating table: {e}")
        return False
    
    return True

def insert_sample_event():
    """Insert a sample event to test the setup (always in DD format)"""
    try:
        conn = psycopg2.connect(
            dbname="events_db",
            **DB_CONFIG
        )
        cur = conn.cursor()
        
        now = datetime.utcnow()
        cur.execute("""
            INSERT INTO events_entries (title, description, lat, lng, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id;
        """, (
            "Sample Event",
            "This is a test event to verify the database setup",
            37.7749,  # San Francisco latitude in DD format
            -122.4194,  # San Francisco longitude in DD format
            now,
            now
        ))
        
        event_id = cur.fetchone()[0]
        conn.commit()
        print(f"Sample event created with ID: {event_id}")
        print("Coordinates saved in DD format: 37.7749, -122.4194")
        
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"Error inserting sample event: {e}")

if __name__ == "__main__":
    print("Setting up Events Database...")
    print("All coordinates will be stored in DD (Decimal Degrees) format")
    
    if create_database():
        if create_table_and_indexes():
            insert_sample_event()
            print("\nDatabase setup completed successfully!")
            print("Database: events_db")
            print("Table: events_entries (id, title, description, lat, lng, created_at, updated_at)")
            print("Coordinates: DD format with indexes for performance")
        else:
            print("Failed to create table and indexes")
    else:
        print("Failed to create database")