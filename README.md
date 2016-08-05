# <img src="http://cidarlab.org/wp-content/uploads/2015/09/phagebook_AWH.png" width="270" height="60"/> API
<!-- ![](http://cidarlab.org/wp-content/uploads/2013/08/research-Phagebook.png) -->

## What is this?
An API to interact with Phagebook.
Background: Phagebook is a social/lab networking web app where synthetic biologists can post specific lab projects or order lab stock across labs. For more information, please check out the <a href="http://cidarlab.org/phagebook/">CIDAR Phagebook page</a>.

## Table of Contents
+ **Background**
+ **Installation**
+ **API**
+ **Examples**

## Background
A normal desktop program executes functions/instructions one after another assuming the argument/data are always ready. However, this is not always the case in a networking environment. For example, when a function argument requires data from the server, it may take time to fetch the data before executing the function. This produces code blocking, a pause in the thread between data request signal and data retrieval. Asynchronous programming means to send another request to the server while blocking is happening, so you don't have to wait until the first fetch is completed to request the next data. Since asynchronous code is executed in a different way from how most people view software execution, a different style of syntax is required. Phagebook API uses asynchronous programming with a websocket, we'll look at the examples to show both asynchronous syntax and the API how-to.

## Getting Started

### Installation
+ **Requirements:** 
    1. Kristopher Kowal's [Q Promise Library](https://github.com/kriskowal/q) for asynchronous server communication.<br />
    *Simplest Approach: Copy and paste the following source script into your HTML's head.*
    `<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/q.js/0.9.6/q.min.js"></script>` 
    
    2. **phagebookAPI.js:** Download the Phagebook API (or the minified version), add it to your project files, and import it as a `<script>` tag after the Q promise library. (loading this script itself will create a `Phagebook` global variable which is used to call any of the listed Phagebook functions below).
    
    3. **Install Phagebook:** Follow the instructions outlined [here](https://github.com/CIDARLAB/Phagebook3/wiki/Installing-Phagebook-3.0).

### Resources
* [Q Promise Reference](https://github.com/kriskowal/q/wiki/API-Reference)
* [Official CIDAR Website](http://www.cidarlab.org/)
* [About Phagebook](http://cidarlab.org/phagebook/)

## API
All functions return a deferred object. It's not important to know what exactly it is, but there are plenty of explanations on what deferred is on the internet. Thus, I won't explain it here. It's important to read the Examples to understand how to use the API.

### .createStatus(String userEmail, String password, String status)
> Creates a new Phagebook status on the user profile. <br/>
> 
> **Sends:** Request to create a status for the specified user.<br/>
> **Receives:** If successful, "Status created successfully." If failed, it does not return anything. <br/>

### .getProjects(String userEmail, String password)
> Gets a list of projects the user is working on.<br/>
> 
> **Sends:** Request for the projects the specified user is currently working on. <br/>
> **Receives:** An array of JSON objects with following parameters: <br/>
> > { 
> >		projectName;
> >		projectId;
> >	}

### .getProject(String userEmail, String password, String projectId)
> Queries for a detailed info of a project. <br/>
> 
> **Sends:** (JSON object) An object spec. <br/>
> **Receives:** A JSON Object with the following parameters:
> >	{
> >		creatorId;
> > 	leadId;
> > 	members;
> > 	notebooks;
> > 	affiliatedLabs;
> > 	name;
> >     dateCreated;
> >     updates;
> >     budget;
> >     grantId;
> >     description;
> >     id;
> >	}

### .createProjectStatus(String userEmail, String password, String orderID, String orderStatus)
> Destroys the specified Phagebook object. <br/>
> 
> **Sends:** (Object selector) A String representing the Phagebook object's *name* or *unique ID* targeted for deletion. <br/>
> **Receives:** N/A <br/>

> **Notes:**
> > + Phagebook will fail to destroy an object if given an ambiguous object selector.
> > + An error message is reported on the 'say' channel if `Phagebook.destroy()` fails.

### .getOrders()
> Queries for any single Phagebook object matching the specified criteria. <br/>
> 
> **Sends:** (JSON object) An object spec. <br/>
> **Receives:** The *first* object matching the fields provided in the spec.

### .getOrder()
> Executes the specified function with the given input parameters. <br/>
> 
> **Sends:** (JSON object) An object containing the following two field-value pairs <br/>
> > 'function': An object selector for the desired function to be executed. <br/>
> > 'args': An ordered list of input arguments. <br/>

> **Receives:** The evaluated value of the function executed with the specified arguments. <br/>

> **Notes:**
> > + Phagebook will send an error message on the 'say' channel if:
> >     1. There is an error during function execution,
> >     2. There is no function matching the function specifier, 
> >     3. There exist ambiguously specified arguments.

### .changeOrderingStatus()
> Sets all fields present in the object spec to their associated values for the Phagebook object represented by the object ID. <br/>
> 
> **Sends:** (JSON object) An object spec or list of multiple object specs containing field-value pairs to be set. Each object spec must contain the object ID to be modified. <br/> 
> **Receives:** The ID of the modified/created object. <br/>
 
> **Notes:**
> > + The object spec must include the object ID.
> > + Fields present in the original object but not in the input object spec are unchanged.
> > + If a new field is encoded in the object spec, it will be added to the existing object.
> > + If the object does not exist or if an object ID is not provided, the object is then constructed by way of `Phagebook.create()`.
<!-- 






 -->
## Examples
All examples below include the use of 'q' promises in order to emphasize the requisite use of the q.js library for asynchronous communication with the server.

### .create()
As defined above *create* returns the ID(s) of the successfully created object(s). Therefore, as can be seen below, we must call *create* then *get* in order to access the new object's 'sequence' field.

    obj = {"name":"My Part", "sequence":"ACTGACTG"};
    Phagebook.create(obj).then(function(id) {
        Phagebook.get(id).then(function(data) {
            MyPartSeq = data.sequence;
        }).done();
    });

'MyPartSeq' is assigned the value of the 'sequence' field of the Phagebook object after it has been successfully created.

    MyPartSeq
<!-- -->

    >> ACTGACTG

### .destroy()
Suppose the part named "My Part" created above exists in our database. Now calling *destroy* on this part will delete it from the database.

    Phagebook.destroy("My Part");

As a matter of preference, you may wish to use the object ID as the selector. First you must *get* the ID of the part you wish to remove (which returns the specified object), then call *destroy* using the returned object's ID field as the selector. 

    Phagebook.get("My Part").then(function(data) {
        objectID = data.id;
        Phagebook.destroy(objectID);
    }).done();

### .set()
Set has multiple built-in functions described in the function definition above. The following example covers all of these possibilities.

First, suppose an object whose object ID field is '1111' *does not exist* in the database. Calling set using that ID as a selector will cause Phagebook to construct a new object with this ID by way of *create*.

    objSpec = {"id":"1111","name":"New Part","sequence":"AGATAGAT"};
    Phagebook.set(objSpec);

Phagebook, in this case, does not recognize an existing part with this object ID and will construct a new object in the database. 

    Phagebook.get("New Part").then(function(data) {
        data.name
        data.id
        data.sequence
    }).done();
<!-- -->

    >> New Part
    >> 1111
    >> AGATAGAT

Now that our part 'New Part' exists, calling *set* will cause any existing fields to be updated with the specified values and any new fields to be added. Again, any fields currently defined in the existing object but missing from the object spec will remain unchanged.

    objSpec = {"id":"1111","sequence":"ATCTATCT"};
    Phagebook.set(objSpec);

Here, Phagebook will modify only the object's sequence field, changing it from "AGATAGAT" to "ATCTATCT".

    Phagebook.get("New Part").then(function(data) {
        data.name
        data.id
        data.sequence
    }).done();
<!-- -->

    >> New Part
    >> 1111
    >> ATCTATCT

Notice we can still access the object using its 'name' field because, despite being left out of the object spec, it was unchanged in database object. <br/>

Finally to demonstrate the case of including a new field-value in the object spec. Phagebook will update the existing object by adding this new field-value pair.

    objSpec = {"id":"1111","author":"Joe Phagebook"};
    Phagebook.set(objSpec);
    Phagebook.get("New Part").then(function(data) {
        data.name
        data.id
        data.sequence
        data.author
    }).done();
<!-- -->

    >> New Part
    >> 1111
    >> ATCTATCT
    >> Joe Phagebook


### .get()
*Get* is featured in many of the other examples, but for clarity, below are the two uses of this function. Remember *get* takes either the 'id' or 'name' fields as an object selector.

###### Get A Single Object
Suppose the following object exists in our database:
    
    obj.id
    >> 1234
    obj.name
    >> Part1234

As noted in the API section, *get* retrieves and returns the complete object associated with the specified selector.

    //Get with 'id' selector
    Phagebook.get("1234").then(function(data) {
        data.name
    }).done();
<!-- -->

    >> Part1234
<!-- -->

    //Get with 'name' selector
    Phagebook.get("Part1234").then(function(data) {
        data.id
    }).done();
<!-- -->

    >> 1234

###### Get Multiple Objects At Once
In order to retrieve multiple objects at once with *get* simply provide a list of object selectors as input. For the following example, suppose there exist the following objects in the database:

    obj_1.id      >> 1111
    obj_1.name    >> Part 1
    obj_2.id      >> 2222
    obj_2.name    >> Part 2
    obj_3.id      >> 3333
    obj_3.name    >> Part 3

Now calling *get* with a list of the above parts will command Phagebook to retrieve and return an ordered list of the specified objects.

    objSelectors = ["Part 1", "2222", "Part 3"];
    Phagebook.get(objSelectors).then(function(data) {
        data[0].id
        data[1].name
        data[2].name
    }).done();
<!-- -->

    >> 1111
    >> Part 2
    >> Part 3

### .query()
For this example, suppose our database contains three objects whose 'schema' fields are defined as 'BasicPart' and four objects whose 'schema' equal 'CompositePart'. The examples below demonstrate various ways in which one might ask Phagebook to retrieve objects by 'schema'.

    //Query for 'Basic Parts'
    Phagebook.query("schema","BasicPart").then(function(data) {
        data.length
    }).done();
<!-- -->

    >> 3
<!-- -->

    //Query for 'Composite Parts'
    Phagebook.query("schema","CompositePart").then(function(data) {
        data.length
    }).done();
<!-- -->

    >> 4
<!-- -->

    //Query for 'Parts'
    Phagebook.query("schema","Part").then(function(data) {
        data.length
    }).done();
<!-- -->

    >> 7


### .queryOne()
*queryOne* follows the same semantic guideline as *query*, although it returns the first object matching the input spec. Suppose the 'author' Joe Phagebook has been busy and stored 100 Phagebook Part objects in the database. The following example demonstrates how one would ask Phagebook to retrieve one of those objects.

    Phagebook.queryOne("author", "Joe Phagebook").then(function(data) {
        data.length
    }).done();
<!-- -->

    >> 1

### .run()
###### Simple Function
Suppose there exists a function in the database named "Double Function":

    function(x) {
        return x+x;
    };

The following example demonstrates how one would call Phagebook to execute this function given specified arguments with *run*.

    Phagebook.run( {function:"Double Function", args:[2]} ).then(function(data) {
        data
    })done();
<!-- -->

    >> 4

###### Function Within a Module
Now suppose a module exists that calls one or more functions within itself. We can specify which functions to execute within that module if we wish.

    //Module named 'Test Module'
    function f() {
        var my = {}; 
        var privateVariable = 2; 
        function privateMethod() { 
            return privateVariable; 
        } 
        my.moduleProperty = 1; 
        my.moduleMethod = function () { 
            return privateMethod(); 
        }; 
        return my; 
    };
<!-- -->
    
    //Run the module and call a particular function 'moduleMethod'
    Phagebook.run( {module:"Test Module", function:"moduleMethod", args:[]} ).then(function(data) {
        data
    }).done();
<!-- -->

    >> 2

### .submit()
*Submit* is as straight-forward as its description explains. This example asks the Phagebook server to execute the following script on the server side (refer to the 'Double Function' defined in the *run* section above).

    Phagebook.submit("Phagebook.run({function:"Double Function", args:[2]})").then(function(data) {
        data
    }).done();
<!-- -->

    >> 4

### .login()
Suppose the following *log in* credentials exist on the database:
> **username:** JoePhagebook <br/>
> **password:** iLovePhagebook3

Log in would be as follows:

    Phagebook.login("JoePhagebook", "iLovePhagebook3").then(function(data) {
        if(data == true) {
            alert("Log in Successful!");
        };
    }).done();
<!-- -->

    >> Log in Successful!

### .logout()

    Phagebook.logout(); 

## Tests
Refer to the PhagebookAPI/tests/ directory for an extensive suite of QUnit tests.

## Contact
**Kevin LeShane:** *leshane [at] bu.edu* <br/>
**Stephanie Paige:** *spaige [at] bu.edu*

![](http://cidarlab.org/wp-content/uploads/2013/08/logo-adjusted.png)