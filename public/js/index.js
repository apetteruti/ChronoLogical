$(document).ready(function () {

    //variables to hold user information from the form
    var loginForm = $("form#login");
    var usernameloginInput = $("input#usernamelogin-input.form-control");
    var passwordloginInput = $("input#passwordlogin-input.form-control");

    //LOGIN FORM ON SUBMIT
    loginForm.on("submit", function (event) {
        event.preventDefault();

        //creates the userData object to be passed into the loginUser function (which is hoisted from below)
        var userLogin = {
            username: usernameloginInput.val().trim(),
            password: passwordloginInput.val().trim()
        };
        console.log(userLogin);

        //checks to see if there is info entered in both fields in the form -> if not it returns nothing
        if (!userLogin.username || !userLogin.password) {
            return;
        }

        //if there's info in both fields, then it runs the loginUser function from below and clears the form
        loginUser(userLogin.username, userLogin.password);
        usernameloginInput.val("");
        passwordloginInput.val("");

    }); //end of LOGIN FORM ON SUBMIT

    function loginUser(username, password) {
        //ajax post request to send info to the server - api-routes will have the SQL comparison to the table/user model
        $.post("/api/index", {
            //the two variables from the object
            username: username,
            password: password
        }).then(function (data) {
            window.location.replace(data);
            // console.log(username + password);
        }).catch(function (err) {
            console.log(err);
        });
    }

    //SIGN UP FORM
    var signUpForm = $("form#signup");
    var emailInput = $("input#email-input");
    var usernameInput = $("input#username-input");
    var passwordInput = $("input#password-input");

    //on submit form
    signUpForm.on("submit", function (event) {
        event.preventDefault();
        var userData = {
            email: emailInput.val().trim(),
            username: usernameInput.val().trim(),
            password: passwordInput.val().trim()
        };

        if (!userData.email || !userData.username || !userData.password) {
            return;
        }

        //calls signUpUser function from below
        signUpUser(userData.email, userData.username, userData.password);
        emailInput.val("");
        usernameInput.val("");
        passwordInput.val("");
    });

    function signUpUser(email, username, password) {
        $.post("/api/signup", {
            email: email,
            username: username,
            password: password
        }).then(function (data) {
            window.location.replace(data);
            console.log(email + username + password);
        }).catch(function (err) {
            console.log(err);
        });
    }

    // public timeline selection, error handling and updating the span element
    $(document).on("click", ".publicTimelineOption", function () {
        $("#option1").empty();
        var selected = $(this).data("name");
        var id = $(this).data("id")
        $("#option1").attr("data-id", id);

        var option2 = $("#option2").text();

        if (selected == option2) {
            alert("Timeline 1 must differ from Timeline 2")
            $("#option1").empty();
        } else {
            $("#option1").text(selected);
        }

    }); /* end on click */

    // user or another public, error handling, updating span element
    $(document).on("click", ".userTimelineOption", function () {
        $("#option2").empty();
        var selected = $(this).data("name");
        var id = $(this).data("id")

        $("#option2").attr("data-id", id);

        var option1 = $("#option1").text();

        if (selected == option1) {
            alert("Timeline 2 must differ from Timeline 1");
            $("#option2").empty();
        } else {
            $("#option2").text(selected);
        }
    });

    // clear button on click function
    $(document).on("click", ".clearButton", function () {
        // $("#option1").removeAttr("data-id");
        // $("#option2").removeAttr("data-id");
        $("#option1").empty();
        $("#option2").empty();
        location.reload();
    }); // end clear button on click function



    // when clicking on go, will grab the values of selected timelines, will do
    // an api call to retrieve both timelines
    $(document).on("click", ".goButton", function () {
        // var timeline1 = undefined;
        // var timeline2 = undefined;

        timeline1 = $("#option1").data("id");
        timeline2 = $("#option2").data("id");

        console.log(timeline1, timeline2);

        if (timeline1 == undefined && timeline2 == undefined) {
            alert("please select at least one timeline");
        } else if (timeline1 == undefined) {
            $.get("/api/timeline/" + timeline2)
                .then(function (res) {
                    renderTimeline(res);
                });
        } else if (timeline2 == undefined) {
            $.get("/api/timeline/" + timeline1)
                .then(function (res) {
                    renderTimeline(res);
                });
        } else {
            timelines = {
                timeline1: timeline1,
                timeline2: timeline2
            };
            $.post("/api/combined", timelines)
                .then(function (res) {
                    // render timeline with a function
                    renderTwoTimelines(res, timeline1, timeline2);
                });
        };

        var renderTimeline = function (data) {
            // empty the div
            $(".timeline__items").empty();
            // for each item in data response
            data.forEach(element => {
                var timelineItem = $("<div>");
                timelineItem.addClass("timeline__item");

                var timelineContent = $("<div>");
                timelineContent.addClass("timeline__content");

                var h2 = $("<h2>")
                h2.text(element.event_name);
                timelineContent.append(h2);

                var hr = $("<hr>");
                timelineContent.append(hr);

                var start = $("<span>");
                var strongStart = $("<strong>");
                var startText = element.start_date;
                var startDate = startText.split("T");
                strongStart.text("Start: ");
                start.text(startDate[0] + " || ");
                start.prepend(strongStart);
                timelineContent.append(start);

                var end = $("<span>");
                var strongEnd = $("<strong>");
                var endText = element.end_date;
                var endDate = endText.split("T");
                strongEnd.text("End: ");
                end.text(endDate[0]);
                end.prepend(strongEnd);
                timelineContent.append(end);

                var hr = $("<hr>");
                timelineContent.append(hr);

                var desc = $("<p>");
                desc.text(element.event_description);
                timelineContent.append(desc);
                // append the timeline content div to the timeline item
                timelineItem.append(timelineContent);
                $(".timeline__items").append(timelineItem);
            }); // end forEach
            // timeline script to initiate timeline
            $('.timeline').timeline({
                verticalStartPosition: 'left',
                verticalTrigger: '150px',
            });
        };

        var renderTwoTimelines = function (data, t1, t2) {
            data.forEach(element => {
                var timelineItem = $("<div>");
                timelineItem.addClass("timeline__item");

                var timelineContent = $("<div>");
                timelineContent.addClass("timeline__content");

                if (element.TimelineId == t1) {
                    timelineContent.addClass("timeline1");
                } else {
                    timelineContent.addClass("timeline2");
                }

                var h2 = $("<h2>")
                h2.text(element.event_name);
                timelineContent.append(h2);

                var hr = $("<hr>");
                timelineContent.append(hr);

                var start = $("<span>");
                var strongStart = $("<strong>");
                var startText = element.start_date;
                var startDate = startText.split("T");
                strongStart.text("Start: ");
                start.text(startDate[0] + " || ");
                start.prepend(strongStart);
                timelineContent.append(start);

                var end = $("<span>");
                var strongEnd = $("<strong>");
                var endText = element.end_date;
                var endDate = endText.split("T");
                strongEnd.text("End: ");
                end.text(endDate[0]);
                end.prepend(strongEnd);
                timelineContent.append(end);

                var hr = $("<hr>");
                timelineContent.append(hr);

                var desc = $("<p>");
                desc.text(element.event_description);
                timelineContent.append(desc);
                // append the timeline content div to the timeline item
                timelineItem.append(timelineContent);
                // append each timeline item to the timeline__items div
                $(".timeline__items").append(timelineItem);
            });

            // timeline script to initiate timeline
            $('.timeline').timeline({
                verticalStartPosition: 'left',
                verticalTrigger: '150px',
            });
        };
    }); /* end on click */
}); // end document on ready