# <img src="http://cidarlab.org/wp-content/uploads/2015/09/phagebook_AWH.png" width="270" height="60"/> API
<!-- ![](http://cidarlab.org/wp-content/uploads/2013/08/research-clotho.png) -->

## What is this?
An API to interact with Phagebook.
Background: Phagebook is a social/lab networking web app where synthetic biologists can post specific lab projects or order lab stock across labs. For more information, please check out the <a href="http://cidarlab.org/phagebook/">CIDAR Phagebook page</a>.

## Table of Contents
	1. Getting started
	2. API
	3. Examples

## Getting Started

### Installation
+ **Requirements:** 
    1. Kristopher Kowal's [Q Promise Library](https://github.com/kriskowal/q) for asynchronous server communication.<br />
    *Simplest Approach: Copy and paste the following source script into your HTML's head.*
    `<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/q.js/0.9.6/q.min.js"></script>` 
    
    2. **clotho3api.js:** Download the Clotho API, add it to your project files, and include it as a `<script>` tag within your HTML (loading this script will create a `Clotho` global variable which is used to call any of the listed Clotho functions below).
    
    3. **Install Clotho:** Follow the instructions outlined [here](https://github.com/CIDARLAB/clotho3/wiki/Installing-Clotho-3.0).

### Resources
* [Q Promise Reference](https://github.com/kriskowal/q/wiki/API-Reference)
* [Official CIDAR Website](http://www.cidarlab.org/)
* [About Phagebook](http://cidarlab.org/phagebook/)

## API
### .createStatus()
> Creates the specified Clotho object(s). <br/>
> 
> **Input:** (JSON object) An object describing an instance or instances of a Clotho schema.<br/>
> **Returns:** The ID (or sequential list of IDs if more than one object was specified) of the successfully created object. <br/>

> **Notes:** 
> > + If the specification includes an 'id' field the object will receive that ID value. Otherwise a unique ID will be created.
> > + Status notifications are reported on the 'say' channel regarding successfulness of object creation. If an object failed to be created, an explanation will also be reported.

### .createProjectStatus()
> Destroys the specified Clotho object. <br/>
> 
> **Input:** (Object selector) A String representing the Clotho object's *name* or *unique ID* targeted for deletion. <br/>
> **Returns:** N/A <br/>

> **Notes:**
> > + Clotho will fail to destroy an object if given an ambiguous object selector.
> > + An error message is reported on the 'say' channel if `Clotho.destroy()` fails.

### .changeOrderingStatus()
> Sets all fields present in the object spec to their associated values for the Clotho object represented by the object ID. <br/>
> 
> **Input:** (JSON object) An object spec or list of multiple object specs containing field-value pairs to be set. Each object spec must contain the object ID to be modified. <br/> 
> **Returns:** The ID of the modified/created object. <br/>
 
> **Notes:**
> > + The object spec must include the object ID.
> > + Fields present in the original object but not in the input object spec are unchanged.
> > + If a new field is encoded in the object spec, it will be added to the existing object.
> > + If the object does not exist or if an object ID is not provided, the object is then constructed by way of `Clotho.create()`.

### .getProjects()
> Gets a specified Clotho object. <br/>
> 
> **Input:** (Object selector) A String representing the desired Clotho object's *name* or *unique ID*. <br/>
> **Returns:** The object(s) specified by the input object selector(s). <br/>

> **Notes:**
> > + If the input object selector is ambiguous Clotho will return the first object posted by MongoDB (essentially arbitrarty).
> > + Clotho will report an error message on the 'say' channel if an object could not be retrieved.

### .getProject()
> Queries for all Clotho objects matching the specified criteria. <br/>
> 
> **Input:** (JSON object) An object spec. <br/>
> **Returns:** All objects matching the fields provided in the spec.

### .getOrders()
> Queries for any single Clotho object matching the specified criteria. <br/>
> 
> **Input:** (JSON object) An object spec. <br/>
> **Returns:** The *first* object matching the fields provided in the spec.

### .getOrder()
> Executes the specified function with the given input parameters. <br/>
> 
> **Input:** (JSON object) An object containing the following two field-value pairs <br/>
> > 'function': An object selector for the desired function to be executed. <br/>
> > 'args': An ordered list of input arguments. <br/>

> **Returns:** The evaluated value of the function executed with the specified arguments. <br/>

> **Notes:**
> > + Clotho will send an error message on the 'say' channel if:
> >     1. There is an error during function execution,
> >     2. There is no function matching the function specifier, 
> >     3. There exist ambiguously specified arguments.
<!-- 






 -->
## Examples
All examples below include the use of 'q' promises in order to emphasize the requisite use of the q.js library for asynchronous communication with the server.

### .create()
As defined above *create* returns the ID(s) of the successfully created object(s). Therefore, as can be seen below, we must call *create* then *get* in order to access the new object's 'sequence' field.

    obj = {"name":"My Part", "sequence":"ACTGACTG"};
    Clotho.create(obj).then(function(id) {
        Clotho.get(id).then(function(data) {
            MyPartSeq = data.sequence;
        }).done();
    });

'MyPartSeq' is assigned the value of the 'sequence' field of the Clotho object after it has been successfully created.

    MyPartSeq
<!-- -->

    >> ACTGACTG

### .destroy()
Suppose the part named "My Part" created above exists in our database. Now calling *destroy* on this part will delete it from the database.

    Clotho.destroy("My Part");

As a matter of preference, you may wish to use the object ID as the selector. First you must *get* the ID of the part you wish to remove (which returns the specified object), then call *destroy* using the returned object's ID field as the selector. 

    Clotho.get("My Part").then(function(data) {
        objectID = data.id;
        Clotho.destroy(objectID);
    }).done();

### .set()
Set has multiple built-in functions described in the function definition above. The following example covers all of these possibilities.

First, suppose an object whose object ID field is '1111' *does not exist* in the database. Calling set using that ID as a selector will cause Clotho to construct a new object with this ID by way of *create*.

    objSpec = {"id":"1111","name":"New Part","sequence":"AGATAGAT"};
    Clotho.set(objSpec);

Clotho, in this case, does not recognize an existing part with this object ID and will construct a new object in the database. 

    Clotho.get("New Part").then(function(data) {
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
    Clotho.set(objSpec);

Here, Clotho will modify only the object's sequence field, changing it from "AGATAGAT" to "ATCTATCT".

    Clotho.get("New Part").then(function(data) {
        data.name
        data.id
        data.sequence
    }).done();
<!-- -->

    >> New Part
    >> 1111
    >> ATCTATCT

Notice we can still access the object using its 'name' field because, despite being left out of the object spec, it was unchanged in database object. <br/>

Finally to demonstrate the case of including a new field-value in the object spec. Clotho will update the existing object by adding this new field-value pair.

    objSpec = {"id":"1111","author":"Joe Clotho"};
    Clotho.set(objSpec);
    Clotho.get("New Part").then(function(data) {
        data.name
        data.id
        data.sequence
        data.author
    }).done();
<!-- -->

    >> New Part
    >> 1111
    >> ATCTATCT
    >> Joe Clotho


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
    Clotho.get("1234").then(function(data) {
        data.name
    }).done();
<!-- -->

    >> Part1234
<!-- -->

    //Get with 'name' selector
    Clotho.get("Part1234").then(function(data) {
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

Now calling *get* with a list of the above parts will command Clotho to retrieve and return an ordered list of the specified objects.

    objSelectors = ["Part 1", "2222", "Part 3"];
    Clotho.get(objSelectors).then(function(data) {
        data[0].id
        data[1].name
        data[2].name
    }).done();
<!-- -->

    >> 1111
    >> Part 2
    >> Part 3

### .query()
For this example, suppose our database contains three objects whose 'schema' fields are defined as 'BasicPart' and four objects whose 'schema' equal 'CompositePart'. The examples below demonstrate various ways in which one might ask Clotho to retrieve objects by 'schema'.

    //Query for 'Basic Parts'
    Clotho.query("schema","BasicPart").then(function(data) {
        data.length
    }).done();
<!-- -->

    >> 3
<!-- -->

    //Query for 'Composite Parts'
    Clotho.query("schema","CompositePart").then(function(data) {
        data.length
    }).done();
<!-- -->

    >> 4
<!-- -->

    //Query for 'Parts'
    Clotho.query("schema","Part").then(function(data) {
        data.length
    }).done();
<!-- -->

    >> 7


### .queryOne()
*queryOne* follows the same semantic guideline as *query*, although it returns the first object matching the input spec. Suppose the 'author' Joe Clotho has been busy and stored 100 Clotho Part objects in the database. The following example demonstrates how one would ask Clotho to retrieve one of those objects.

    Clotho.queryOne("author", "Joe Clotho").then(function(data) {
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

The following example demonstrates how one would call Clotho to execute this function given specified arguments with *run*.

    Clotho.run( {function:"Double Function", args:[2]} ).then(function(data) {
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
    Clotho.run( {module:"Test Module", function:"moduleMethod", args:[]} ).then(function(data) {
        data
    }).done();
<!-- -->

    >> 2

### .submit()
*Submit* is as straight-forward as its description explains. This example asks the Clotho server to execute the following script on the server side (refer to the 'Double Function' defined in the *run* section above).

    Clotho.submit("clotho.run({function:"Double Function", args:[2]})").then(function(data) {
        data
    }).done();
<!-- -->

    >> 4

### .login()
Suppose the following *log in* credentials exist on the database:
> **username:** JoeClotho <br/>
> **password:** iLoveClotho3

Log in would be as follows:

    Clotho.login("JoeClotho", "iLoveClotho3").then(function(data) {
        if(data == true) {
            alert("Log in Successful!");
        };
    }).done();
<!-- -->

    >> Log in Successful!

### .logout()

    Clotho.logout(); 

## Tests
Refer to the clothoAPI/tests/ directory for an extensive suite of QUnit tests.

## Contact
**Kevin LeShane:** *leshane [at] bu.edu* <br/>
**Stephanie Paige:** *spaige [at] bu.edu*

![](http://cidarlab.org/wp-content/uploads/2013/08/logo-adjusted.png)