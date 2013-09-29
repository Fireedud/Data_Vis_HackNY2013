Data_Vis_HackNY2013
===================

Data Visualization for HackNY 2013


This project is currently a data visualization of how New York Times articles spread over time.

Front End:
The User is presented with a website, where he or she can enter a topic. Then the user is shown a map,
where the color of each country corresponds with how widespread the news articles are. The user is also
presented with a slider that changes the map over the course of a week, allowing the user to see how 
the data spreads.

Back End:
The server is written in python, built on flask (NB: flask is not included in this repo). The server 
receieves a GET request for a certain topic. The server uses the New York Times API to find the most 
relevant news articles for that topic. The server then uses the bit.ly API to calculate where and when 
the article was being clicked. This data is then sent as JSON the client, where client-side scripting
in javascript handles displaying the data.
