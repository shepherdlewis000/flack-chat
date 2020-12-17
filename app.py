import os
import requests
import json 

from flask import Flask, jsonify, render_template, request, session, url_for
from flask_socketio import SocketIO, send, emit, join_room, leave_room

# Automatically reload when template files change
TEMPLATES_AUTO_RELOAD = True

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY");
socketio = SocketIO(app)

# rooms = ["general", "second"]
rooms = ["general"]

# Each group has a list of messages
messageLists = []
# setup messageList dictionary with room and message lists of up to 100
for room in rooms:   
   messages = {
      "room": room,
      "myMessages": []   
   }
   messageLists.append(messages)

def addMessage(room, message):
   #############
   for alist in messageLists:
      if(alist["room"] == room):
         alist["myMessages"].append(message)
         print ("ok now alist msgs are: " + str(alist["myMessages"]))
         messages = json.dumps(alist["myMessages"])      
         emit("receive messages", messages, room=room)
   
@app.route("/")
def index():
    return render_template("index.html")

@socketio.on("set username")
def newuser(data):
	print ("new user: " + data)
	session.clear()
	session['username'] = data
   #emit("announce room join", session['username'] + " has joined the room " + room, room=room)
   
@socketio.on("create room")
def createRoom(room):
   print("new room: " + room)
   rooms.append(room)
   
   ######### creating msg queue for new room
   messages = {
      "room": room,
      "myMessages": []   
   }
   messageLists.append(messages)
         
   emit("receive rooms", rooms, broadcast=True)
   print("current rooms: " + str(rooms))
   
@socketio.on("get rooms")
def send_rooms():
	print("server: get rooms recieved, emitting recieve rooms")
	emit("receive rooms", rooms)

@socketio.on("leave room")
def leaveroom(room):
   if(room):
      print("leave rooms received. Leaving room:" + room)
      leave_room(room)
      emit("announce room leave", session['username'] + " has left the room " + room, room=room)
      
@socketio.on("change rooms")
def setroom(room):
	print("change rooms recieved. Joining room: " + room);
	join_room(room)
	# BELOW WORKS BUT SENDS TO EVERY ROOM, why? - TURNS OUT IT WAS BROWSER CACHING
	emit("announce room join", session['username'] + " has joined the room " + room, room=room)
	getMessagesOfGroup(room)
   
@socketio.on("post message")
def postmessage(data):
   room = data["room"]
   message = data["message"]
   print("postmessage with room: " + room + " and " + message )   
   addMessage(room, message)
   
@socketio.on("get messages")
def sendmessages(room):
   print("send messages")
   emit("receive messages", getMessagesOfGroup(room))

def getMessagesOfGroup(room):
   for alist in messageLists:
      if alist["room"] == room:
         # found room match in getMessagesOfGroup"
         messages = json.dumps(alist["myMessages"])         
         emit("receive messages", messages, room=room)
         