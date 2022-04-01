PennController.ResetPrefix()
Sequence("welcome", "headphoneCheck", "passed", "instr", "HPTask", "send", "debrief","exit" );
//PennController.DebugOff();
PennController.SendResults( "send" );

//add consent/assent

PennController("welcome",
        defaultText
            .print()
        ,
        
        newText("<p><strong>Welcome to the experiment!</strong></p>")
        ,
        newText("<p>Before we get going, let's check a few things to make sure this experiment will work properly. </p>")
        ,
        newText("<li>This experiment works best on <i>Chrome </i>or <i>Firefox </i>browsers. If you aren’t using Chrome or Firefox, please restart the study using one of those browsers. </li>")
        ,
        newText("<br/>")
        ,
        newText("<li>This experiment works best in a quiet room without lots of distractions. We can't tell where you are, of course, but we would really appreciate it if you could try to minimize distractions during this experiment! </li>")
        ,
        newText("<br/>")
        ,
        newText("<li>During this experiment, we ask that you please wear headphones. Make sure your volume is turned on and to a comfortable level. Next, you will complete a short task that will check the volume and output of your headphones. </li>")
        ,
        newText("<br/>")
        ,
        newText("<br/>")
        ,
        newButton("check", "Start Headphone Check")
            .print()
            .wait()
);

// The Farm's jQuery library is outdated, we need to polyfill a couple methods
jQuery.prototype.on = function(...args) { return jQuery.prototype.bind.apply(this, args); }
jQuery.prototype.prop = function(...args) { return jQuery.prototype.attr.apply(this, args); }

PennController( "headphoneCheck" ,
    // This Canvas will contain the test itself
    newCanvas("headphonecheck", 500,2000)
        .print()
    ,
    // The HeadphoneCheck module fills the element whose id is "hc-container"
    newFunction( () => getCanvas("headphonecheck")._element.jQueryElement.attr("id", "hc-container") ).call()
    ,
    // Create this Text element, but don't print it just yet
    newText("failure", "Sorry, you failed the headphone check")
    ,
    
    newVar("passed", 0)
        .global()
    ,
    
    newVar("totalCorrect")
        .global()
    ,
    
    // This is where it all happens
    newFunction( () => {
        $(document).on('hcHeadphoneCheckEnd', function(event, data) {
            getCanvas("headphonecheck").remove()._runPromises();
            if (data.didPass) getVar("passed").set( 1 )._runPromises();
            getVar("totalCorrect").set( data.data.totalCorrect )._runPromises();
            getButton("dummy").click()._runPromises();
        });
        HeadphoneCheck.runHeadphoneCheck(); 
    }).call()
    ,
    
    // This is an invisible button that's clicked in the function above upon success
    newButton("dummy").wait()
).log( "ParticipantID", PennController.GetURLParameter("id") )
;

PennController( "passed" ,

    getVar("passed").test.is(0)
        .success(
            newText("Hmm, it seems like you are not wearing headphones. <br/> If possible, please put on headphones before continuing.<br/><br/>")   
                .print()
            ,
            newTimer("wait", 2000)
                .start()
                .wait()
        )
        .failure(
            newText("Great, it appears you are wearing headphones. Thanks!<br/><br/>")   
                .print()
            ,
            newTimer("wait", 500)
                .start()
                .wait()
        )
    ,
    newText("Now lets move on to the main task.<br/><br/>")
        .print()
    ,
     
    newButton("Continue")
        .print()
        .wait()
); //.log( "ParticipantID", PennController.GetURLParameter("id") );


PennController("instr",
        defaultText
            .print()
        ,
        newText("<p><strong>Instructions</strong></p>")
        ,
        newText("<p>Blah blah blah. Tuning of last chord. </p>")
        ,
        newText("<p>**add examples**</p>")
        ,
        newButton("button", "Continue")
            .print()
            .wait()
);

PennController("HPTask",
        defaultText
            .print()
        ,
        newText("<p><strong>TASK HAPPENS HERE</strong></p>")
        ,
        newButton("button", "Continue")
            .print()
            .wait()
);

PennController( "debrief" ,
        defaultText
            .print()
        ,
        newText("<p><strong>Thank you for participating in our study!</strong></p>")
        ,
        newText("<br/>")
        ,
        newText("<p>The aim of this study was blah blah blah.</p>")
        ,
        newText("<p>Of course, we don’t know the results of this experiment yet as we are still collecting data. However, if you still have any questions about this experiment, please feel free to contact Dr. Slevc at slevc@umd.edu.</p>")
        ,
        newText("<p>Finally, please don’t share any information about the experiment with other people who might participate, just in case knowing the goal of the experiment could bias peoples’ responses in some way.</p>")
        ,
        // UPDATE THIS:
        newText("<p>Thanks again for participating! "+'<strong><a href="https://umpsychology.sona-systems.com/">Click here to confirm participation on SONA</a>.</strong>')
            .print()
            .wait()
);

PennController( "exit" ,
        newText("<p>You may now close your browser window.</p>").print()
        ,
        newTimer("dummy", 10)
            .wait() // This will wait forever
);
