#A Simple HTTP server in python for all the backend stuff
#for the Data Visualization Project
#HackNY Fall 2013

#NB This will use Python 3.x and Flask

from urllib import request as urlrequest
import json
import functools

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

@functools.lru_cache(maxsize=64)
@app.route('/article/<subject>')
def nytimes(subject):
	data = json.loads(urlrequest.urlopen("http://api.nytimes.com/svc/search/v2/articlesearch.json?q=" + subject + "&begin_date=20130828&end_date=20130929&api-key=hackNY").read().decode())['response']['docs'][:3]
	for item in data:
		urlproxy = httpstring(item['web_url'])
		item["bitly"] = json.loads(urlrequest.urlopen("https://api-ssl.bitly.com/v3/link/lookup?url=" + urlproxy + "&access_token=9f2029905b05a9527b20e12275c6ec5eff33f1f5").read().decode())['data']['link_lookup'][0]['aggregate_link']
		item['click_info'] = click_info(item['bitly'])
	return json.dumps(data)

def httpstring(url):
	'''Make a url suitable for passing as an argument to another url.

	This means eliminating all special characters.'''
	urlproxy = ""
	for char in url:
		if char == ':':
			urlproxy += '%3A'
		elif char == '/':
			urlproxy += '%2F'
		else:
			urlproxy += char
	return urlproxy

@functools.lru_cache(maxsize=64)
def click_info(bitly):
	'''Gather click info given a bitly link'''
	bitly = httpstring(bitly)
	clicks = {}
	for i in range(4):
		info = json.loads(urlrequest.urlopen("https://api-ssl.bitly.com/v3/link/countries?access_token=9f2029905b05a9527b20e12275c6ec5eff33f1f5&link=" + bitly + "&unit=week&units=" + str(i+1)).read().decode())["data"]["countries"]
		clicks["week" + str(i+1)] = {}
		if i == 0:
			for x in info:
				clicks["week" + str(i+1)][x["country"]] = x["clicks"]
		else:
			for x in info:
				try:
					clicks["week" + str(i+1)][x["country"]] = x["clicks"] - clicks["week" + str(i)][x["country"]]
				except KeyError:
					clicks["week" + str(i+1)][x["country"]] = x["clicks"]
	return clicks
			
		

if __name__ == '__main__':
	#app.debug = True
	app.run()
