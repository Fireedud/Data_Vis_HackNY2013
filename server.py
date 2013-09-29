#A Simple HTTP server in python for all the backend stuff
#for the Data Visualization Project
#HackNY Fall 2013

#NB This will use Python 3.x and Flask

from urllib import request as urlrequest
import json

from flask import Flask, redirect, url_for
app = Flask(__name__)

@app.route('/')
def index():
	return redirect(url_for('static', filename='index.html'))

@app.route('/css/')
def css():
	return redirect(url_for('static', filename=request.path))

@app.route('/js/')
def js():
	return redirect(url_for('static', filename=request.path))

@app.route('/article/<subject>')
def nytimes(subject):
	data = json.loads(urlrequest.urlopen("http://api.nytimes.com/svc/search/v1/article?format=json&query=" + subject + "&api-key=hackNY").read().decode())['results'][:3]
	return json.dumps(data)


if __name__ == '__main__':
	#app.debug = True
	app.run()
