# <img src="http://cidarlab.org/wp-content/uploads/2015/09/phagebook_AWH.png" width="270" height="60"/> API
<!-- ![](http://cidarlab.org/wp-content/uploads/2013/08/research-Phagebook.png) -->

## What is this?
An API to interact with Phagebook.<br/>
Background: Phagebook is a social/lab networking web app where synthetic biologists can post specific lab projects or order lab stock across labs. For more information, please check out the <a href="http://cidarlab.org/phagebook/">CIDAR Phagebook page</a>.

## Table of Contents
+ **Background**
+ **Installation**
+ **API**

## Background
If you know already about coroutines or asynchronous programming, feel free to skip the *background*.<br/>
A normal desktop program executes functions/instructions one after another assuming the argument/data are always ready. However, this is not always the case in a networking environment. For example, when a function argument requires data from the server, it may take time to fetch the data before executing the function. This produces code blocking, a pause in the thread between data request signal and data retrieval. Asynchronous programming means to send another request to the server while blocking is happening, so you don't have to wait until the first fetch is completed to request the next data. A good reference for asynchronous programming is [here](https://www.youtube.com/watch?v=7sCu4gEjH5I)Since asynchronous code is executed in a different way from how most people view software execution, a different style of syntax is required. Phagebook API uses asynchronous programming with a websocket, we'll look at the examples to show both asynchronous syntax and the API how-to.

## Installation

### Requirements
+ Kristopher Kowal's [Q Promise Library](https://github.com/kriskowal/q) for asynchronous server communication.<br />*Simplest Approach: Copy and paste the following source script into your HTML's head.*`<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/q.js/0.9.6/q.min.js"></script>` 
    
+ **phagebookAPI.js:** Download the Phagebook API (or the minified version), add it to your project files, and import it as a `<script>` tag after the Q promise library. (loading this script itself will create a `Phagebook` global variable which is used to call any of the listed Phagebook functions below).
    
+ **Install Phagebook:** Follow the instructions outlined [here](https://github.com/CIDARLAB/phagebook/wiki/Getting-Started).

### Resources
* [How Do Python Coroutines Work?](https://www.youtube.com/watch?v=7sCu4gEjH5I) (mentioned above)
* [Q Promise Reference](https://github.com/kriskowal/q/wiki/API-Reference)
* [Official CIDAR Website](http://www.cidarlab.org/)
* [About Phagebook](http://cidarlab.org/phagebook/)

## API
All functions return a [deferred](https://github.com/kriskowal/q/wiki/API-Reference#promise-creation) object. It's not important to know what exactly a deferred is, but there are plenty of explanations on what deferred is on the internet. Thus, I won't explain it here. What's important is that when you call any of the API functions, you immediately call `.then()` on it and pass the name of the function you wish to be executed when data is received from server. The callback function may have one argument at maximum, which will be your returned data. It's important to read the [Q Promise Reference](https://github.com/kriskowal/q/wiki/API-Reference) to understand how to use the API.

### .createStatus(String userEmail, String password, String status)
> Creates a new Phagebook status on the user profile. <br/>
> 
> **Sends:** Request to create a status for the specified user.<br/>
> **Receives:** If successful, a message "Status created successfully." If failed, it does not receive anything. <br/>

### .getProjects(String userEmail, String password)
> Gets a list of projects the user is working on.<br/>
> 
> **Sends:** Request for the projects the specified user is currently working on. <br/>
> **Receives:** An array of JSON objects with following parameters: <br/>
> > { <br/>
> >		projectName;<br/>
> >		projectId;<br/>
> >	}<br/>

### .getProject(String userEmail, String password, String projectId)
> Queries for a detailed info of a project. <br/>
> 
> **Sends:** Request for the object info. <br/>
> **Receives:** A JSON Object with the following parameters:
> >	{<br/>
> >		creatorId;<br/>
> > 	leadId;<br/>
> > 	members;<br/>
> > 	notebooks;<br/>
> > 	affiliatedLabs;<br/>
> > 	name;<br/>
> >     dateCreated;<br/>
> >     updates;<br/>
> >     budget;<br/>
> >     grantId;<br/>
> >     description;<br/>
> >     id;<br/>
> >	}<br/>

### .createProjectStatus(String userEmail, String password, String projectID, String projectStatus)
> Adds a new status message for a specific project. <br/>
> 
> **Sends:** Request for additional project status. <br/>
> **Receives:** If successful, a message "Status created successfully." If failed, it does not receive anything. <br/>

### .getOrders(String userEmail, String password)
> Gets a list of orders the user have requested and is currently pending.<br/>
> 
> **Sends:** Request for the orders for the specified user. <br/>
> **Receives:** An array of JSON objects with following parameters: <br/>
> > { <br/>
> >		orderName;<br/>
> >		orderId;<br/>
> >	}<br/>

### .getOrder(String userEmail, String password, String orderID)
> Queries for a detailed info of an order. <br/>
> 
> **Sends:** Request for the object info. <br/>
> **Receives:** A JSON Object with the following parameters:
> >	{<br/>
> >		id;<br/>
> >		name;<br/>
> >		description;<br/>
> >		dateCreated;<br/>
> >		createdById;<br/>
> >		products;<br/>
> >		budget;<br/>
> >		maxOrderSize;<br/>
> >		approvedById;<br/>
> >		receivedById;<br/>
> >		relatedProjects;<br/>
> >		status;<br/>
> >	}<br/>

### .changeOrderingStatus(String userEmail, String password, String orderID, String ORDERSTATUS)
> Changes the state of the specific order.<br/>
> ORDERSTATUS must be one of the following predefined values:<br/>
> Phagebook.INPROGRESS<br/>
> Phagebook.APPROVED<br/>
> Phagebook.SUBMITTED<br/>
> Phagebook.DENIED<br/>
> Phagebook.RECEIVED<br/>
> 
> **Sends:** Request to change order status. <br/>
> **Receives:** If successful, a message "Status created successfully." If failed, it does not receive anything. <br/>

## Examples
Refer to the PhagebookAPI/tests/ directory for example code and tests.

## Contact
**Joonho Han:** *joonho18 [at] bu.edu* <br/>
**Chandler Zhang:** *chz [at] bu.edu*

![](http://cidarlab.org/wp-content/uploads/2013/08/logo-adjusted.png)