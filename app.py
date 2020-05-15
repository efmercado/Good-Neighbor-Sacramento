from flask import Flask, render_template

# Import our pymongo library, which lets us connect our Flask app to our Mongo database.
import pymongo
import json

import pandas as pd
import numpy as np

from pprint import pprint


# Create an instance of our Flask app.
app = Flask(__name__)

# Create connection variable
conn = 'mongodb://localhost:27017'

# Pass connection to the pymongo instance.
client = pymongo.MongoClient(conn)

# Connect to a database. Will create one if not already available.
db = client.realestate_db
# Drops collection if available to remove duplicates
db.realestate.drop()


df = pd.read_csv("./static/data/rdc_realestate_historial_data.csv")
data_json = json.loads(df.to_json(orient='records'))
db.realestate.insert_many(data_json)

# Drops collection if available to remove duplicates
db.districts.drop()

df = pd.read_csv("districts_beats.csv")
data_json= json.loads(df.to_json(orient='records'))
db.districts.insert_many(data_json)

db.realestate.find()

# Set route
@app.route('/')
def index():

    record = list(db.realestate.find())
    district = list(db.districts.find())

    

    user = {'firstname': "Mr.", 'lastname': "My Father's Son"}

    # Return the template with the teams list passed in
    return render_template('index.html', record=record, user=user, district=district)


if __name__ == "__main__":
    app.run(debug=True)
