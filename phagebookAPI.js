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

    var socket = new WebSocket("ws://cidarlab.org:9090/websocket/"); // Change this address to CNAME of Phagebook when using in real life environment
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
        socket.messageCache = []
    };

    // Process the message received
    // The message is only received when the client sends message first. Thus, the messages received are the serverside response.
    socket.onmessage = function(evt) {
        // Parse message into JSON 
        var dataJSON = JSON.parse(evt.data); // This "data" is not the same as
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

    // Creates the JSON object format.
    function Message(channel, data, requestID, options) {
        this.channel = channel;
        this.data = data;
        this.requestId = requestID;
        if (typeof options != undefined){ 
        // Create "options" parameter only when the protocal has options.
            this.options = options;
        }
    }

	// Helper function to initialize the "data" parameter of the JSON object the server socket accepts
    socket.FormattedData = function(userEmail, password, id, status){ 
		this.username = userEmail; 
		this.password = password; 
        if (typeof id != undefined){ 
        // Create "id" parameter only when the protocol has id.
            this.id = id;
        }
        if (typeof status != undefined){ 
        // Create "status" parameter only when the protocol has status.
            this.status = status;
        }
    }

    // A generator would be nice
    var lastRequestId = -1;
    function nextId(){
        lastRequestId++;
        return lastRequestId; 
    } 

    // Helper function: Sends message to server 
    // Will be called multiple times, changing "lastRequestId".
    socket.emit = function(channel, data, options) {
    
            var requestID = nextId();
            var message = new Message(channel, data, requestID, options);
            
            // Create 'deferred' object ... Q is a global variable
            var deferred = Q.defer();
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
    	*	Currently the API directly accepts userEmail and password as credentials. I'm not sure if this is a good practice or
    	*	if something else should be passed on, but we'll see. - Joonho Han.
    	*/

        INPROGRESS: "INPROGRESS",
        APPROVED: "APPROVED",
        SUBMITTED: "SUBMITTED",
        DENIED: "DENIED",
        RECEIVED: "RECEIVED",

         /*Received: {
			data: "Status created blah blah"
         }
         */
        createStatus: function (userEmail, password, status){
            return socket.emit("CREATE_STATUS", new socket.FormattedData(userEmail, password, null, status));
        }, 

        /*Received: {
			data: "Status changed blah blah"
         }
         */
        changeOrderingStatus: function (userEmail, password, orderID, orderStatus) {
            return socket.emit("CHANGE_ORDERING_STATUS", new socket.FormattedData(userEmail, password, orderID, orderStatus));
        }, 

        /*Received: {
			data: "Status created successfully blah blah"
         }
         */
        createProjectStatus: function (userEmail, password, projectID, projectStatus) {
            return socket.emit("CREATE_PROJECT_STATUS", new socket.FormattedData(userEmail, password, projectID, projectStatus));
        }, 

        /*Received: {
			data: {
				projectId: B@#^EF@I#E
				projectName: NF@$O&*G$
			} x However many Projects there are
         }
         */
        getProjects: function (userEmail, password) {
            return socket.emit("GET_PROJECTS", new socket.FormattedData(userEmail, password));
        }, 

        /*Received: {
			data: [
				orderId: B@#^EF@I#E
				orderName: NF@$O&*G$
			] x However many orders there are
         }
         */
        getOrders: function (userEmail, password) {
            return socket.emit("GET_ORDERS", new socket.FormattedData(userEmail, password));
        }, 

        /*Received: {
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
        getProject: function (userEmail, password, projectID) {
            return socket.emit("GET_PROJECT", new socket.FormattedData(userEmail, password, projectID));
        }, 

        /*Received: {
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
        getOrder: function (userEmail, password, orderID) {
            return socket.emit("GET_ORDER", new socket.FormattedData(userEmail, password, orderID));
        }
        
    };
}(Phagebook = window.Phagebook || {}));