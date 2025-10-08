Exam: Create a Simple Events App with Location Support


# Task Requirements

App should allow creating multiple events

Add form input for title

Add textarea input for description

Add form inputs for latitude and longitude (decimal degrees - DD)

Entries should be saved in a database

Event marker should be displayed in the map when clicked (use openstreet map)

Use ajax request for network transactions


+ Provide python alter code with name "db_alter_coords.py" that will do the following:

  ~ Create database named events_db

  ~ Create collection named events_entries with the following fields: id (primary key), title, description, lat (in DD format, indexed), lng (in DD format, indexed), created_at, updated_at

  ~ When saving coords to db, it will always be in DD format


+ Create a github repo and branches: master and feature_coord_converter

  ~ Commit each of significant code changes with proper description (like: Added ajax files to update record, etc.) under feature_coord_format_converter branch

  ~ Commit only the core files (don't include vendor)

  ~ Merge feature_coord_format_converter to master branch

  ~ Provide env files


+ Tech stack to use:

  ~ Front end: Vite React and Tailwind CSS

  ~ Back end: Fastify (NodeJS)

  ~ Database: MySQL or PostgreSQL

  ~ Utility: Python


+ Max work hours: 3 to 4 hours only, please submit your work finished or not finished


+ After submitting the exam, please create video demonstration that shows that the output is working

