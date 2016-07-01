// Add script tag to html for Q Promise library hosted at cdnjs and JQuery library
//<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/q.js/0.9.6/q.min.js"></script>

//Encapsulate all code in this immediately-invoked function expression (aka: self-evoking anonymous function).
//Maintains scope and state for entirety of the library's execution.
(function(Phagebook) {

	//Callback function (for processing received messages) hash table --> Key: request id, Value: callback function
    // Callback are functions that respond to only sent/responded messages.
    var callbackHash = {}; 

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                              WebSocket                                                //
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////

    var socket = new WebSocket("wss://localhost:9090/websocket"); // Change this address to CNAME of Phagebook
    socket.messageCache = []; // Queue of potential socket messages that were sent before the socket was opened.

    socket.onopen = function() {
        console.log("websocket opened!");
        ///Remember JS is single-threaded so the WebSocket will not reach readystate=1 until 
        ///the entire library finishes loading. In the off chance the user writes a script that calls
        ///a Phagebook function immediately upon completion of dependencies loading, the socket will not 
        ///have had enough time to enter readystate. Handle this by storing those calls (if any are made)
        ///and executing them in this socket.onopen() method.
        for (var i=0; i < socket.messageCache.length; i++){
            socket.send(socket.messageCache[i]);
        }
    };

    // Process the message received
    // The message is only received when the client sends message first. Thus, the messages received are the serverside response.
    socket.onmessage = function(evt) {
        // Parse message into JSON 
        var dataJSON = JSON.parse(evt.data);
        var channel = dataJSON.channel;
        var requestId = dataJSON.requestId;
        if (requestId !== null) {
            // If callback function exists, run it
            var callback = callbackHash[channel + requestId];
            if (callback !== undefined) {
                callback(dataJSON.data);
                delete callbackHash[channel + requestId];
            }
        }
    };

    // Sends data when socket is ready.
    // THIS IS WHERE MESSAGES ARE CACHED.
    socket.sendwhenready = function(message) {
        if (socket.readyState == 1) {
            socket.send(message);
        }
        else {
            console.log("caching " + message);
            socket.messageCache.push(message);
        }
    }

    // // Converts the data to send into a JSON format.
    // function Message(channel, data, requestID, options) {
    //     this.channel = channel;
    //     this.data = data;
    //     this.requestId = requestID;
    //     if (typeof options != undefined){ 
    //     // Create "options" parameter only when the protocal has options.
    //         this.options = options;
    //     }
    // }

    // A generator would be nice
    var lastRequestId = -1;
    function nextId(){
        lastRequestId++;
        return lastRequestId; 
    } 

    // Helper function: Sends message to server 
    // Will be called multiple times, changing "lastRequestId".
    socket.emit = function(channel, data) {
        // Create 'deferred' object ... Q is a global variable
        var deferred = Q.defer();

        var requestID = nextId();
        var message = {
	        this.channel = channel;
	        this.data = data;
	        this.requestId = requestID;
        };
        var callback = function(dataFromServer) {
            deferred.resolve(dataFromServer);
        };
        
        // Hash callback function: (channel + requestID) because we need to distinguish between "say" messages and desired responses from server. 
        callbackHash[channel + requestID] = callback; /////////// Indexing the hashtable.
        socket.sendwhenready(JSON.stringify(message));
        return deferred.promise;
    };

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                          Phagebook Object                                             //
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    window.Phagebook = Phagebook.prototype = { //Phagebook function prototypes

    	/* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! NOTE !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		*	Every app that uses phagebookAPI requires user credentials because all protocol returns a user specific info.
		*	There are 2 ways to do this: Have a "user" object on the client namespace to interact with and retrieve data,
		*	Or send the credentials with the desired socket command and let Phagebook search and return just the user specific data.
    	*	As of 2016 June 29th, Phagebook Server Socket uses the second method. This could be changed.
    	*	Currently the API directly accepts username and password as credentials. I'm not sure if this is a good practice or
    	*	if something else should be passed on, but we'll see. - Joonho Han.
    	*/

         /*
         Input: {
			channel (HANDLED BY THIS FUNCTION): asdfdsasdface
			requestID (HANDLED BY "emit"): 5vede7cr8T%$YEYE 
			data: {
				username: EH^%E^$EG
				password: HDTEG%ED$%
				status: HEH%E%EH#E
			}
         }
         Received: {
			data: "Status created blah blah"
         }
         */
        createStatus: function (username, password, status){
            return socket.emit("CREATE_STATUS", { 
            		this.username = username; 
            		this.password = password; 
            		this.status = status;
            	});
        }, 

        /*
         Input: {
			channel (HANDLED BY THIS FUNCTION): asdfdsasdface
			requestID (HANDLED BY "emit"): 5vede7cr8T%$YEYE
			data: {
				username: EH^%E^$EG
				password: HDTEG%ED$%
				id: HEH%E%EH#E
				status: N#$Ofo8q83f7
			}
         }
         Received: {
			data: "Status created blah blah"
         }
         */
        chageOrderingStatus: function (username, password, orderID, orderStatus) {
            return socket.emit("CHANGE_ORDERING_STATUS", { 
            		this.username = username; 
            		this.password = password; 
            		this.id = orderID;
            		this.status = orderStatus;
            	});
        }, 

        /*
         Input: {
			channel (HANDLED BY THIS FUNCTION): asdfdsasdface
			requestID (HANDLED BY "emit"): 5vede7cr8T%$YEYE
			data: {
				username: EH^%E^$EG
				password: HDTEG%ED$%
				id: HEH%E%EH#E
				status: N#$Ofo8q83f7
			}
         }
         Received: {
			data: "Status created successfully blah blah"
         }
         */
        createProjectStatus: function (username, password, projectID, projectStatus) {
            return socket.emit("CREATE_PROJECT_STATUS", { 
            		this.username = username;
            		this.password = password; 
            		this.id = projectID;
            		this.status = projectStatus;
            	});
        }, 

        /*
         Input: {
			channel (HANDLED BY THIS FUNCTION): asdfdsasdface
			requestID (HANDLED BY "emit"): 5vede7cr8T%$YEYE
			data: {
				username: EH^%E^$EG
				password: HDTEG%ED$%
			}
         }
         Received: {
			data: [
				projectId: B@#^EF@I#E
				projectName: NF@$O&*G$
			] x However many Projects there are
         }
         */
        getProjects: function (username, password) {
            return socket.emit("GET_PROJECTS", {
            	this.username = username;
            	this.password = password;
            });
        }, 

        /*
         Input: {
			channel (HANDLED BY THIS FUNCTION): asdfdsasdface
			requestID (HANDLED BY "emit"): 5vede7cr8T%$YEYE
			data: {
				username: EH^%E^$EG
				password: HDTEG%ED$%
			}
         }
         Received: {
			data: [
				orderId: B@#^EF@I#E
				orderName: NF@$O&*G$
			] x However many orders there are
         }
         */
        getOrders: function (username, password) {
            return socket.emit("GET_ORDERS", {
            	this.username = username;
            	this.password = password;
            });
        }, 

        /*
         Input: {
			channel (HANDLED BY THIS FUNCTION): asdfdsasdface
			requestID (HANDLED BY "emit"): 5vede7cr8T%$YEYE
			data: {
				username: EH^%E^$EG
				password: HDTEG%ED$%
				id: QR@$FFEWGRES#$T% (The project ID)
			}
         }
         Received: {
			data: {
				creatorId;
                leadId;
                members;
                notebooks;
                affiliatedLabs;
                name;
                dateCreated;
                updates;
                budget;
                grantId;
                description;
                id;
			}
         }
         */
        getProject: function (username, password, projectID) {
            return socket.emit("GET_PROJECT", {
            	this.username = username;
            	this.password = password;
            	this.id = projectID;
            });
        }, 

        /*
         Input: {
			channel (HANDLED BY THIS FUNCTION): asdfdsasdface
			requestID (HANDLED BY "emit"): 5vede7cr8T%$YEYE
			data: {
				username: EH^%E^$EG
				password: HDTEG%ED$%
				id: QR@$FFEWGRES#$T% (The order ID)
			}
         }
         Received: {
			data: {
				id;
				name;
				description;
				dateCreated;
				createdById;
				products;
				budget;
				maxOrderSize;
				approvedById;
				receivedById;
				relatedProjects;
				status;
			}
         }
         */
        getOrder: function (username, password, orderID) {
            return socket.emit("GET_ORDER", {
            	this.username = username;
            	this.password = password;
            	this.id = orderID;
            });
        }
        
    };
}(Phagebook = window.Phagebook || {}));