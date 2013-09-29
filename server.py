#A Simple HTTP server in python for all the backend stuff
#for the Data Visualization Project
#HackNY Fall 2013

#NB This will use Python 3.x and Flask

from urllib import request as urlrequest, parse
import json
import datetime
import calendar
import functools

from flask import Flask, redirect, url_for
app = Flask(__name__)

MAX_ARTICLES = 5
MAX_DAYS = 7

@app.route('/')
def index():
  return redirect(url_for('static', filename='index.html'))

@functools.lru_cache(maxsize=64)
@app.route('/articles/nytimes/<subject>')
def articles(subject):
  begin = (datetime.date.today() - datetime.timedelta(MAX_DAYS)).strftime("%Y%m%d")
  end = (datetime.date.today()).strftime("%Y%m%d")
  api = "http://api.nytimes.com/svc/search/v2/articlesearch.json?" + \
        "q=" + subject + \
        "&begin_date=" + begin + "&end_date=" + end + \
        "&api-key=hackNY"

  data = json.loads(urlrequest.urlopen(api).read().decode())['response']['docs'][:MAX_ARTICLES]
  return json.dumps(data)

@functools.lru_cache(maxsize=64)
@app.route('/article/<url>')
def article(url):
  api = "https://api-ssl.bitly.com/v3/link/lookup?" + \
        "url=" + url + \
        "&access_token=9f2029905b05a9527b20e12275c6ec5eff33f1f5"
  info = {}
  info["url"] = parse.unquote_plus(url)
  info["url_short"] = json.loads(urlrequest.urlopen(api).read().decode())['data']['link_lookup'][0]['aggregate_link']
  info["clicks"] = article_clicks(info["url_short"])

  return json.dumps(info)


def article_clicks(url_short):
  clicks = {}
  api = "https://api-ssl.bitly.com/v3/link/countries?" + \
        "link=" + parse.quote_plus(url_short) + \
        "&unit=day&units=1" + \
        "&access_token=9f2029905b05a9527b20e12275c6ec5eff33f1f5"

  for i in range(MAX_DAYS):    
    ts = (datetime.date.today() - datetime.timedelta(i)).strftime("%s")
    countries = json.loads(urlrequest.urlopen(api + "&unit_reference_ts=" + ts).read().decode())["data"]["countries"]

    clicks[ts] = {}
    for country in countries:
      clicks[ts][country["country"]] = country["clicks"]

  return clicks

if __name__ == '__main__':
  app.debug = True
  app.run()
