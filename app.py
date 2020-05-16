from flask import Flask, render_template, jsonify

# Import our pymongo library, which lets us connect our Flask app to our Mongo database.
import pymongo
import json

import pandas as pd
import numpy as np
from bson.json_util import dumps
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
df = pd.read_csv("./static/data/districts_beats.csv")
data_json = json.loads(df.to_json(orient='records'))
db.districts.insert_many(data_json)

# Drops collection if available to remove duplicates
db.districts_zip.drop()
df = pd.read_csv("./static/data/sacramento_neighborhoods.csv")
data_json = json.loads(df.to_json(orient='records'))
db.districts_zip.insert_many(data_json)

# Set route
@app.route('/')
def index():

    record = list(db.realestate.find())
    district = list(db.districts.find())

    
    return render_template('index.html', record=record, district=district)

@app.route('/districts_beats')
def districts_data():

    district = list(db.districts.find())

    return dumps(district)

@app.route('/sac_realestate')
def realestate_data():

    record = list(db.realestate.find())

    return dumps(record)

@app.route('/districts_zip')
def districtsZip_data():

    record = list(db.districts_zip.find())

    return dumps(record)


if __name__ == "__main__":
    app.run(debug=True)
