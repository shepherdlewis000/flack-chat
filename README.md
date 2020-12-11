This is an simple online messaging service using Flask/Python similar in spirit to Slack (https://slack.com).

DEMO: https://my-flack-chat.herokuapp.com/

Users are able to sign in to the site using a display name, create channels (i.e. chatrooms) to communicate in, as well as see and join existing channels. Once a channel is selected, users are able to send and receive messages with one another in real time.
 
Features

Display name: When a user visits the application for the first time, they are prompted to type in a display name that will be associated with every message the user sends. It the user closes the page and returns later, the display name is remembered/recalled. Usernames are saved locally on client using browser's localStorage.

Channel creation: Any user is able to create a new channel so long as its name does not conflict with an existing channel.

Channel List: User are able to see a list of all current channels, and selecting one allows the user to view the channel. 
 
Messages View: Once a channel is selected, the user can see any messages that have already been sent in that channel, up to a maximum of 100 messages stored in server-side memory.
 
Sending Messages: Once in a channel, users are able to send text messages to others the channel. When a user sends a message, their display name and the timestamp of the message are associated with the message. All users in the channel then see the new message (with display name and timestamp) appear on their channel page. Sending and receiving messages do not require reloading the page.
 
Remembering the Channel: If a user is on a channel page, closes the web browser window, and goes back to your web application, the application remembers what channel the user was on previously and takes the user back to that channel.
 
Change username: Users are able to change their username once initially set.

Requirements: Python modules requests, os, json, gunicorn

BUGS/TODO: Duplicate output of welcome message, spruce up UI styling. As this is a project done a while back and I've moved on to Javascript/Node, I'm not sure when I'll get to it.

