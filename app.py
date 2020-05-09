from flask import Flask, render_template

# Import our pymongo library, which lets us connect our Flask app to our Mongo database.
import pymongo
import json

# Create an instance of our Flask app.
app = Flask(__name__)

# Create connection variable
conn = 'mongodb://localhost:27017'

# Pass connection to the pymongo instance.
client = pymongo.MongoClient(conn)

# Connect to a database. Will create one if not already available.


db = client['countries_db']
collection_currency = db['currency']
with open('currencies.json') as f:
    file_data = json.load(f)

# if pymongo < 3.0, use insert()
collection_currency.insert(file_data)
# if pymongo >= 3.0 use insert_one() for inserting one document
collection_currency.insert_one(file_data)
# if pymongo >= 3.0 use insert_many() for inserting many documents
collection_currency.insert_many(file_data)

client.close()


db = client.team_db
# Drops collection if available to remove duplicates
db.team.drop()

# Creates a collection in the database and inserts two documents
db.team.insert_many(
    [
        {
            'player': 'Jessica',
            'position': 'Point Guard'
        },
        {
            'player': 'Mark',
            'position': 'Center'
        }
    ]
)


# Set route
@app.route('/')
def index():
    # Store the entire team collection in a list
    teams = list(db.team.find())
    print(teams)

    # Return the template with the teams list passed in
    return render_template('index.html', teams=teams)


if __name__ == "__main__":
    app.run(debug=True)
