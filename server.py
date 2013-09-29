#A Simple HTTP server in python for all the backend stuff
#for the Data Visualization Project
#HackNY Fall 2013

#NB This will use Python 3.x and Flask

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


if __name__ == '__main__':
	app.run()
