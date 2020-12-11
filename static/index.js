let socket; 
let rooms = [];
let messages = []
let room = ""

/**************************
   FUNCTION createRoom: onsubmit listener for room form
*///////////
function createRoom(){
   hideRoomForm();
   room = document.getElementById("newRoom").value
   document.getElementById('newRoom').value='';
   console.log("createRoom CALLED with room: " + room);
   if(!rooms.includes(room)){
      console.log("unique room create");
      socket.emit("create room", room);
      rooms.push(room);
      console.log("rooms are now: " + rooms);   
   }
   else{
      console.log("Already have a room called that");   
   }
   return false;
}

function showUsernameForm(){
   document.getElementById("usernameFormDiv").style.display = "block";
   document.getElementById("changeUsernameLink").style.display = "none";
   document.getElementById("changeRoomLink").style.display = "none";      
}

function hideUsernameForm(){
   document.getElementById("usernameFormDiv").style.display = "none";
   document.getElementById("changeUsernameLink").style.display = "block";
   document.getElementById("changeRoomLink").style.display = "block";
}

function showRoomForm(){
   document.getElementById("newRoomDiv").style.display = "block";
   document.getElementById("changeRoomLink").style.display = "none";
   document.getElementById("changeUsernameLink").style.display = "none";
   document.querySelector('#newRoomLabel').innerHTML = "Create room <sub><a id='cancelRoomForm' onclick='hideRoomForm()' href='#'>Cancel</a></sub>"; 
}

function hideRoomForm(){
   document.getElementById("newRoomDiv").style.display = "none";
   document.getElementById("changeRoomLink").style.display = "block";
   document.getElementById("changeUsernameLink").style.display = "block";
}



document.addEventListener('DOMContentLoaded', () => {
	
	// Connect to websocket
   socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

   // When connected, configure buttons
   socket.on('connect', () => {
		console.log("socket on connect");

      // Hide the username & create room forms      
      //var usernameform = document.getElementById("username");
      //usernameform.style.display = "none";
      //var createRoomForm = document.getElementById("newroom");
      //createRoomForm.style.display = "none";
      
      hideUsernameForm();
      hideRoomForm();
      
		if(localStorage.username){	
			socket.emit("set username", localStorage.username);    		    		
    		document.querySelector("#welcome").innerHTML = "Welcome " + localStorage.username + " "  + document.querySelector("#welcome").innerHTML;
			console.log("username set from localStorage to:" + localStorage.username);
			document.querySelector('#usernameLabel').innerHTML = "Change username <sub><a id='cancelNameForm' onclick='hideUsernameForm()' href='#'>Cancel</a></sub>";
			
			socket.emit("get rooms");
    	}
    
    	// username has never been set so prompt
    	else{
				var result = prompt("Enter username"); 
				if(!result){
					document.location.reload();				
				}
				
				else{   			
    				localStorage.username = result;
    				document.location.reload();
    			}
    	}
    	
   });
   socket.on('receive rooms', data => {
		rooms = [];  		
  		rooms = rooms.concat(data);
  		console.log("recieved rooms: " + data);
  		console.log("saved rooms as: " + rooms);
  		
  		if(localStorage.currentRoom){
                     
            // CHANGE TO ONLY IF CURRENTROOM ACTUALLY EXISTS (SERVER RESTART, ETC) OR 
            // NEED TO CREATE ROOM IF ITS NOT STILL ALIVE
            console.log("ROOMS ARE: " + rooms);
            console.log("Found room in localStorage : " + localStorage.currentRoom);            
                        
            if(!rooms.includes(localStorage.currentRoom)){
               console.log("Need to create room: " + localStorage.currentRoom);
               document.getElementById("newRoom").value = localStorage.currentRoom;
               console.log("document.getElementByID-newRoom is: " + document.getElementById("newRoom"));               
               createRoom();            
            } 
            
            console.log("found current room so joining room: " + localStorage.currentRoom);            
            changeRooms(localStorage.currentRoom);
         }
         else{
            changeRooms("general");         
         }
		setupRoomButtons();
  	});
  	
  	socket.on('receive messages', data => {
  	   console.log("receive messages: " + data);
      //messages = {{ data|tojson }};
      var messages = JSON.parse(data);      
      console.log(`messages is of type ${typeof messages}`);
      console.log("messages: " + messages);
      document.querySelector('#messages').innerHTML = '';
        
      for(let i=0; i<messages.length; i++){
         console.log("Entered loop with message: " + messages[i]);
         document.querySelector('#messages').innerHTML += '<p>' + messages[i] + '</p>';
         // NOT PUTTING PARAGRAPH BREAKS      
      }
      // as per jfiddle.net/KGfG2      
      $('.box').scrollTop($('.box')[0].scrollHeight);
      
      //document.querySelector('#messages').innerHTML = messages;    	   
  	});
  	
  	// emit("announce room join", session['username'] + " has joined the room " + room, broadcast=True, room=room)
   socket.on('announce room join', message => {
         //console.log("socket.rooms: " + socket.rooms);
         document.querySelector('#joinMessage').innerHTML = message;
   });
   
   socket.on('announce room leave', message => {
      console.log("socket.rooms: " + socket.rooms);
      document.querySelector('#joinMessage').innerHTML = message;
   });   
  	
});
  	 	
//});

function setUsername(){
   hideUsernameForm();
	console.log("setUsername CALLED");
	localStorage.username = document.querySelector('#username').value;
   document.querySelector('#username').value = '';	
	socket.emit("set username", localStorage.username);
	
	if(localStorage.currentRoom){
	   console.log("found currRoom in localStorage: " + localStorage.currentRoom);
      changeRooms(localStorage.currentRoom);	
	}
	else{
      localStorage.setItem('currentRoom', 'general');
      changeRooms("general");	
	}
	document.querySelector('#welcome').innerHTML = "Welcome " + localStorage.username;
	
	/* set back to room general
	localStorage.setItem('currentRoom', 'general');
	changeRooms("general");
	document.querySelector("#welcome").innerHTML = "Welcome " + localStorage.username;
   */
   
   // HAD TO REVERT SOME STUFF
   //changeRooms(localStorage.currentRoom);
   //document.querySelector("#welcome").innerHTML = "Welcome " + localStorage.username;
   
	console.log("username set to:" + localStorage.username);
	console.log("current room: " + localStorage.currentRoom);
	return false;
}	

function changeRooms(room){
	console.log("changeRooms() with param: " + room);
	socket.emit("leave room", localStorage.currentRoom);
	localStorage.currentRoom = room;
	document.querySelector('#current-room').innerHTML = "Current room: " + localStorage.currentRoom;
	socket.emit("change rooms", room);
	
   // ADDED BELOW TO TRY AND GET MESSAGE LIST REFRESH	
	//document.location.reload();
}

function submitMessage(message){
   message = document.getElementById('message').value;
   document.getElementById('message').value = '';
   console.log("submitMessage called with: " + message);
   var today = new Date();
   var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
   message = time + " - " + localStorage.username + ": " + message;
   console.log("formatted message: " + message);
   var data = {
      room: localStorage.currentRoom,
      message: message
   }
   socket.emit("post message", data);
}

function setupRoomButtons(){
	// clear previous room buttons
	document.querySelector('#roomButtons').innerHTML = "";
	
	for(let room of rooms){
		const mybut = document.createElement('button');
		//on_off_switch.className = 'switch demo3'
		
      // BELOW CAN BE ELIMINATED BC ACTIVE NO LONGER NEEDED		
		if(room == localStorage.currentRoom){
			//console.log("This button is current room setting active: " + room);
			//mybut.className = "btn-primary group-buttons active";
			mybut.className = "btn-primary group-buttons";
		}
		else{		
			mybut.className = "btn-primary group-buttons";
		}		
		mybut.innerHTML = room;
		//mybut.data-room = room;
		mybut.onclick = function () {
		   if(room != localStorage.currentRoom)
			   changeRooms(room);		
		}
		
		document.querySelector('#roomButtons').append(mybut);		
	}
}

