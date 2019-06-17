jQuery(document).ready(function() {

    if (Cookies.get('auth')) {

        getUsername(function(data) {

            console.log(data);
        })
    }
    else {

        $(location).attr('href', 'https://app.andersentech.net/login.html');
    }

    //Simple function to get the number of days in the passed in month
    function daysInMonth(month, year) {
        return new Date(year, month, 0).getDate()+1;
    }

    var date = new Date();
    
    //Get first day of the month in order to know which day to start on the calendar
    var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);

    //Create arrays for the days of the week, the months and the user's contacts
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var contacts = [];

    //Necessary info to setup the current month's information
    var month = date.getMonth();
    var monthShown = months[date.getMonth() % 12];
    var yearShown = Number(date.getFullYear());
    var dayAmount = daysInMonth(month, yearShown);

    //Setting up the calendar grid, month, and prev/next buttons
    /**********************************************************/
    console.log(daysInMonth(month, yearShown));
    setupNewMonth(month, yearShown, dayAmount);
    /**********************************************************/
    //End of Calendar setup

    //Get events from DB and populate the calendar

  //if the div id starts with 'day' on click, show event description for that day

    $('#changeBg').blur(function(){
        var colorChange = document.getElementById('changeBg').value;
        $('html').css("background","transparent");
        $('html').css("background-color","#" + colorChange);
    });


    $('#contactButton').click(function(){
        $('#buttonArea').append("<div id = 'contactsArea'>")
        $('#contactsArea').append("<div id = 'contactsList'> <b>Your Contacts</b> <br> </div>");

        for(var x = 0; x<contacts.length; x++){
            $('#contactsList').append(contacts[x] + "<br>");
        }
        $('#contactsArea').append("<button class = 'bttn-stretch bttn-md bttn-primary' id='addContacts' type='button'> Add Contacts </button>");

    });
    
    $(document).on("click", "#addContacts",function(){
        console.log('addContacts button clicked');
        var firstForm = $("<input type = 'text' name = 'firstname' id = 'firstname'>");
        var lastForm = $("<input type = 'text' name = 'lastname' id = 'lastname'>");

        if(document.getElementById('addContactsForm')=== null){
            $('#contactsArea').append("<div id = 'addContactsForm'>");
            $('#addContactsForm').append('First Name: ');
            $('#addContactsForm').append(firstForm);
            $('#addContactsForm').append('Last Name: ');
            $('#addContactsForm').append(lastForm);
            $('#addContactsForm').append("<button class = 'bttn-unite bttn-md bttn-primary' id = 'submitButton'> Submit </button>");
        }
    });

    $(document).on("click", "#submitButton", function(){
    // to-do, when contact added, send it to the DB, for now, adding it to user's contacts array and listing it out

        var name = $('#firstname').val() + " " + $('#lastname').val();

        contacts.push(name);
        $('#contactsList').empty();
        $('#contactsList').append("<b> Your Contacts </b> <br>");
        for(var x = 0; x<contacts.length; x++){
            $('#contactsList').append(contacts[x] + "<br>");
        }
    });

    $('#addEventButton').click(function(){
        //add form for adding an event
        var form = $(`
            <div class = 'container'>
                <form id ='addEvent'>
                    <h3>Add an Event</h3>
                    <fieldset>
                        <input name = "Title" placeholder = 'Title' type = 'text' tabindex="1" required autofocus>
                    </fieldset>
                    <fieldset>
                        <input name = "Date" placeholder="Date" type="date" tabindex="2" required>
                    </fieldset>
                    <fieldset>
                        Priority Level
                        <br>
                        <input type="radio" name="priority" id = "lowP" value = "low" tabindex="3">Low (default)
                        <br>
                        <input type="radio" name="priority" id = "mediumP" tabindex="3" value = "medium">Medium
                        <br>
                        <input type="radio" name="priority" id = "lowP" tabindex="3" value = "high">High
                        <br>
                    </fieldset>
                    <fieldset>
                        <textarea id = "evd" placeholder="Type event description here..." tabindex="5" required></textarea>
                    </fieldset>
                    <fieldset>
                        <button name="submit" type="submit" id="event-submit", data-submit="Sending">Submit</button>
                    </fieldset>
                </form>
            </div>`
        );

        form.appendTo('#popup');

        $('#addEvent').submit(function(event) {

            event.preventDefault();

            /*getUsername(function(targetUser) {
            var formData = {
            "targetUser": targetUser,
            "eventDate": $("input[name=Date").val(),
            "shortName": $("input[name=Title").val(),
            "description": $("#evd").val(),
            "priorityLevel": 1
            };
            console.log(formData);
            });*/

            getUsername(function(username) {

                var formData = {
                    "targetUser": username,
                    "eventDate": $("input[name=Date").val(),
                    "shortName": $("input[name=Title").val(),
                    "description": $("#evd").val(),
                    "priorityLevel": 1
                };

                console.log(formData);

                AJAXRequest('POST', 'add_event', formData, function(){
                    location.reload(true);
                });

            });
        });
    });

    $('#addUserButton').click(function(){
        //direct to new user page
        window.location.href='https://app.andersentech.net/newUser.html';
    });

    $('#deleteUserButton').click(function(){
        //direct to delete user page
        window.location.href='https://app.andersentech.net/deleteUser.html';
    });
	
	$('#loginButton').click(function(){
        //direct to delete user page
        window.location.href='https://app.andersentech.net/login.html';
    });
	
	$('#logoutButton').click(function(){
		
        Cookies.set('auth', 'NULL');
        $(location).attr('href', 'https://app.andersentech.net/login.html');

	});

    //Sets up what happens when next and prev buttons are clicked
    /************************************************************/
    $('#next').click(function() {

        var daysInMonth;

        //If December, will reset back to January
        if (month == 11) {
            month = 0;
            monthShown = months[month%12];
            ++yearShown;

            daysInMonth = daysInThisMonth(month, yearShown);

        //If not, will simply increment the month
        //  leaving the year alone.
        } else {
            ++month;
            monthShown = months[month%12];

            daysInMonth = daysInThisMonth(month, yearShown);
        }

        setupNewMonth(month, yearShown, daysInMonth);

    });

    $('#prev').click(function() {

        var daysInMonth;

        //If January, will reset back to December
        if (month == 0) {
            month = 11;
            monthShown = months[month%12];
            --yearShown;

            daysInMonth = daysInThisMonth(month, yearShown);

        //If not, will simply decrement the month
        //  leaving the year alone.
        } else {
            --month;
            monthShown = months[month%12];

            daysInMonth = daysInThisMonth(month, yearShown);
        }

        setupNewMonth(month, yearShown, daysInMonth);

    });
    /************************************************************/
    //End of button set up

});

function daysInThisMonth(month, year) {

    var monthStart = new Date(year, month, 1);
    var monthEnd = new Date(year, month + 1, 1);
    var monthLength = (monthEnd - monthStart) / (1000 * 60 * 60 * 24);

    if (month ==2) {
        ++monthLength;
    }

    return monthLength;
}

//Determines on what day the month begins
//  in order to align grid correctly.
function determineMonthBegin(nextDay) {

    var monthBegin;

    /*switch(nextDay){
        case 'Sunday':
          monthBegin = 1;
        case 'Monday':
           monthBegin = 2;
        case 'Tuesday':
            monthBegin = 3;
        case 'Wednesday':
            monthBegin = 4;
        case 'Thursday':
            monthBegin = 5;
        case 'Friday':
            monthBegin = 6;
        case 'Saturday':
            monthBegin = 7;
    }*/

    if (nextDay == 'Sunday') {
        monthBegin = 1;
    } else if (nextDay == 'Monday') {
        monthBegin = 2;
    } else if (nextDay == 'Tuesday') {
        monthBegin = 3;
    } else if (nextDay == 'Wednesday') {
        monthBegin = 4;
    } else if (nextDay == 'Thursday') {
        monthBegin = 5;
    } else if (nextDay == 'Friday') {
        monthBegin = 6;
    } else if (nextDay == 'Saturday') {
        monthBegin = 7;
    }

    return monthBegin;

}

//Selects which banner to use for the given month
function monthBanner(month) {
    $('#month').empty();

    $('#month').append("<img id='curMonth' src = 'months/" + month + ".png' height='120' width='360'>");

}

//Just creating the suffix after the date
function determineSuffix(day) {

    var suffix;

    if (day == 1 || day == 21 || day == 31) {
        suffix = "st";
    } else if (day == 2 || day == 22) {
        suffix = "nd";
    } else if (day == 3 || day == 23) {
        suffix = "rd";
    } else {
        suffix = "th"
    }

    return suffix;
}

//Simply iterates through the days
function getDayIter(beginDay){

    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    for (var d = 0; d < days.length; d++) {
        if (days[d].substr(0, 2).localeCompare(beginDay.toString().substr(0, 2)) == 0) {
            var iter = d;
            break;
        }
    }
    return iter;
}


//Sets up the columns on top of the calendar.
function setupWeekdayColumns() {

    $('#calendar').append("<tr id='SunThroughSat'>")

        $('#calendar').append("<th class='colHead Sundays'>Sunday</th>");
        $('#calendar').append("<th class='colHead Mondays'>Monday</th>");
        $('#calendar').append("<th class='colHead Tuesdays'>Tuesday</th>");
        $('#calendar').append("<th class='colHead Wednesdays'>Wednesday</th>");
        $('#calendar').append("<th class='colHead Thursdays'>Thurday</th>");
        $('#calendar').append("<th class='colHead Fridays'>Friday</th>");
        $('#calendar').append("<th class='colHead Saturdays'>Saturday</th>");

    $('#calendar').append("</tr>");

}

//Sets up new month
function setupNewMonth(thisMonth, thisYear, dayAmount) {
    $('#calendar').empty();

    var firstDay = new Date(thisYear, thisMonth, 1);

    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    //Selects banner for the month passed in
    monthBanner(thisMonth);

    setupWeekdayColumns();

    var day = 1, week = 1;
    var dayIter = getDayIter(firstDay);
    var nextDay = days[dayIter % 7];
    var weekSeperator, monthBegin;

    //Will begin at the first day of the month
    //  In December 2017's case, begin at position 6
    //  since the first day is a Friday
    weekSeperator = determineMonthBegin(nextDay);
    monthBegin = weekSeperator;

    //Make first row in table
    $('#calendar').append("<tr id='week1'>");

    //dayAmount is passed in
    while (day <= dayAmount) {

        suffix = determineSuffix(day);
        nextDay = days[dayIter % 7];

        //Used to seperate the days up into weeks, by
        //  adding new rows to table
        if (nextDay == "Sunday" && week != 1) {
            $('#calendar').append("<tr id='week" + week + "'>");
        }

        //Only on the first week you will add in blank days
        //  to correct posisitioning of calendar
        if (weekSeperator == monthBegin && week == 1) {
            for (i = 1; i < monthBegin; i++) {
               $('#calendar').append("<td class='blankDays'></td>");
            }   
        }

        //Actually add in the days
        $('#calendar').append("<td id='day" + day + "' class='" + nextDay +"s weekdays'>" + day + suffix + ": </td>");

        //Closes each week
        if (nextDay == "Saturday") {
            $('#calendar').append("</tr>");
            week++;
        }   

        ++dayIter;
        ++day;
        ++weekSeperator;

    }

    //Closes the last week row
    $('#calendar').append("</tr>");

    //Only for today's date, to change border color.
    /*************************************************************************/
    var date = new Date();
    $("#day"+date.getDate()+"").removeClass('weekdays').addClass('currentDay');
    /*************************************************************************/

    getUsername(function(username) {

        AJAXRequest('GET', 'get_month/' + username + '/' + thisYear + '/' + (thisMonth + 1), null, function(data){
            var eventDays = [];
            
            monthsData = data;
            console.log(data);

            for(var x = 0; x<data.length; x++){

                dayEvents = data[x];
                dateOfEvent = dayEvents['Date']
                
                day = dateOfEvent.substr(8,9);

                if(day.charAt(0) == 0){ 
                    //if a day is a single digit, shave off the leading zero (for div id purposes)
                    day = day.charAt(1);
                }

                title = dayEvents['ShortName']
                desc = dayEvents['Description']

                //$('#day'+day).append('<br>' + title +  "<button class = 'bttn-unite bttn-xs bttn-primary'id='descDay" + day+"'>More</button>")
                if (!eventDays.includes(day)) {
                    eventDays.push(day);
                    $('#day'+day).append("Click to See Events");
                }
            }

        });
    });

    $('[id^="day"]').click(function(e){
        
                var eventTitle = [];
                var eventDesc = [];
                //get day number (from grid of divs) that was clicked
                dayNum = e.target.id.substring(3);
                console.log(dayNum);

                getUsername(function(username) {

                    AJAXRequest('GET', 'get_month/' + username + '/' + thisYear + '/' + (thisMonth + 1), null, function(data){
                        console.log(data);
                        for(var x = 0; x<data.length; x++){
                            dayEvents = data[x];
                            dateOfEvent = dayEvents['Date']
                            day = dateOfEvent.substr(8,9);
                            if(day.charAt(0) == 0){ 
                                //if a day is a single digit, shave off the leading zero (for div id purposes)
                                day = day.charAt(1);
                            }
                            title = dayEvents['ShortName']
                            desc = dayEvents['Description']
            
                            if(dayNum == day){
                                eventTitle.push(title);
                                console.log(eventTitle)
                                eventDesc.push(desc);
                                console.log(eventDesc)
                            }
                            
                        }
                        var myWindow=window.open("", "Day's Events", "height=200,width=400,status=yes,toolbar=no,menubar=no,location=no");
                        for(var x =0; x<eventTitle.length; x++){
                            console.log(eventTitle)
                            myWindow.document.write("<title>Day's Events</title><div class='popupWindow'>"  + "<h2>"+eventTitle[x] + "</h2><br>"+eventDesc[x] + "</div> <br>");
                        }
                        //myWindow.document.write("<div id='popupWindow'>"  + "<h2>"+eventTitle + "</h2><br>"+eventDesc + "</div>");
                    });
                });
                
                //var myWindow=window.open("", "Day's Events", "height=200,width=400,status=yes,toolbar=no,menubar=no,location=no");
               //myWindow.document.write("<div id='popupWindow'>"  + "<h2>"+eventTitle + "</h2><br>"+eventDesc + "</div>");
         
        
            });

}
