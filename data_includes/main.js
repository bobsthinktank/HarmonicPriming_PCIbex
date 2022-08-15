PennController.ResetPrefix()
Sequence("consent", "welcome", "headphoneCheck", "passed", "instr", "HPTaskPrac", "instr2", randomize("HPTaskA"), randomize("HPTaskB" ), "send", "debrief","exit" ) 
PennController.DebugOff();
PennController.SendResults( "send" );

// for future ref: even time for ZMzm responses is from *trial* start, so subtract 6-secs from start for RT
// note 5/12: one item number listed incorrectly in HP_list_blockB (everything else ok) so use finename for item # for analysis

PennController( "consent" ,

    newDropDown("age" , "I am...")
        .add( "Less than 18 years old." , "18 years old, or over.")
        .log()
        .center()
        .print()
        .wait()
    ,
    newButton("agreeC","By clicking this button I indicate my consent.")
        .center()
    ,
    newButton("agreeA","By clicking this button I indicate my assent.")
        .center()
    ,
    getDropDown("age")
        .test.selected("Less than 18 years old.").success( 
            newHtml("introA", "AssentForm.html")
                .center()
                .print()
            ,
            
            getButton("agreeA")
                .print()
                .wait()
        )
        .failure(
            newHtml("introC", "ConsentForm.html")
                .center()
                .print()
            ,
            getButton("agreeC")
                .print()
                .wait()
    )
).log( "ParticipantID", PennController.GetURLParameter("id") )
;

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
        .log("final")
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
            newText("<p>Hmm, it seems like you are not wearing headphones. <br/><br/> Please put on headphones before continuing.</p>")   
                .print()
            ,
            newTimer("wait", 2000)
                .start()
                .wait()
        )
        .failure(
            newText("<p>Great, it appears you are wearing headphones. Thanks!</p>")   
                .print()
            ,
            newTimer("wait2", 500)
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
).log( "ParticipantID", PennController.GetURLParameter("id") );


PennController("instr",
        defaultText
            .print()
        ,
        newText("<p><strong>Instructions</strong></p>")
        ,
        newText("<p>On each trial of this experiment, you will hear a 9-chord sequence. Your task is to indicate as quickly as possible if the final chord sounds the same as what you expected (SAME), or sounds more bright or tinny (BRIGHT). </p>")
        ,
        newText("<p>If the final chord sounds the same, press *Z*</p>")
        ,
        newText("<p>If the final chord sounds bright or tinny, press *M*</p>")
        ,
        newButton("button", "Click here for an example")
            .print()
            .wait()
);

PennController.Template( "HP_practice.csv" ,
    variable => PennController( "HPTaskPrac" ,
        
        newCanvas("screen", 800,580)
            .center()
            .print()
        ,
        
        newText("pracintro", variable.Brightness)
            .before( newText("pracintrostart","In this example, the final chord is &nbsp;"))
            .center()
        ,
        newText("pracintro2", "Remember to be as FAST and ACCURATE as possible in your response!").center()
        ,
        newText("cue", "+").center()
        ,
        newText("press", "<i><strong>Z</strong> for SAME or <strong>M</strong> for BRIGHT</i>").center()
        ,
        newText("right","Right!").center()
        ,
        newText("wrong","No, that one was&nbsp;"+variable.Brightness)
            .center()
            .color("red")
        ,
        
        newButton("button", "Click to hear this example.").center()
		,
        getCanvas("screen")
            .add("center at 50%","middle at 30%", getText("pracintro"))
            .add("center at 50%","middle at 40%", getText("pracintro2"))
            .add("center at 50%","middle at 60%", getButton("button"))
            .print()
        ,
        getButton("button")
            .wait()
        ,
            
        getCanvas("screen")
            .remove(getText("pracintro"))
            .remove(getText("pracintro2"))
            .remove(getButton("button"))
            .add("center at 50%","middle at 50%", getText("cue") )
        ,
        newTimer("wait3", 500)
            .start()
            .wait()
        ,
        newAudio("audio", variable.SoundPath)
            .play()
        //    .wait()
        ,
        newTimer("wait4",6000)
            .start()
            .wait()
        ,
        getCanvas("screen")
			.remove(getText("cue"))
			.add("center at 50%","middle at 50%", getText("press") )
			.print()
        ,
        
        newKey("ZMzm")
			.log()
			.wait()
		,
		
		getKey("ZMzm")
			.test.pressed(variable.Ans)
			    .success(
			        getCanvas("screen")
			            .add("center at 50%","middle at 60%",getText("right"))
			                .print()
			        )
			    .failure(
			        getCanvas("screen")
			            .add("center at 50%","middle at 60%",getText("wrong"))
			                .print()
			        ,
			        newTimer(3000)
			            .start()
			            .wait()
			        )
		,
        
        getCanvas("screen")
            .remove(getText("press"))
        ,
        newTimer("wait5",1000)
            .start()
            .wait()
        ,
        getCanvas("screen").remove()

    )
    .log( "ParticipantID", PennController.GetURLParameter("id") )
    .log("List", variable.Group)
    .log("Item", variable.ItemNumber)
    .log("Condition", variable.SoundFile)
);

PennController("instr2",
        defaultText
            .print()
        ,
        newText("<p>Ok, now for the main task!</p>")
        ,
        newText("<p>This consists of 48 chord sequences, which shouldn't take you very long to finish.</p>")
        ,
        newText("<p>Please try to be as FAST and ACCURATE as possible in your response!</p>")
        ,
        newText("<p>You will get feedback after each response. There will be a short delay if you make an error or if you take longer than one second to respond. , there will be a short pause. Because of this, the experiment will take less time if your responses are both fast and accurate.</p>")
        ,
        newText("<p><strong>Thanks in advance for taking this seriously and helping us with our research!</strong></p>")
        ,
        newText("&nbsp;")
        ,
        newButton("button", "Click when you are ready to begin")
            .center()
            .print()
            .wait()
);

PennController.Template( "HP_list_blockA.csv" ,
    variable => PennController( "HPTaskA" ,
        
        newCanvas("screen", 800,580)
            .center()
            .print()
        ,
        
        newText("cue", "+").center()
        ,
        newText("press", "<i>Press <strong>Z</strong> for same or <strong>M</strong> for bright</i>").center()
        ,
        newText("right","Right!").center()
        ,
        newText("wrong","No, that one was&nbsp;"+variable.Brightness2).center()
            .color("red")
        ,
        
        getCanvas("screen").add("center at 50%","middle at 50%", getText("cue") )
        ,
        newTimer("wait3", 500)
            .start()
            .wait()
        ,
        newAudio("audio", variable.SoundPath)
            .play()
        ,
        newTimer("wait4",6000)
            .start()
            .wait()
        ,
        getCanvas("screen")
			.remove(getText("cue"))
			.add("center at 50%","middle at 50%", getText("press") )
			.print()
        ,
        
        newKey("ZMzm")
			.log()
			.wait()
        ,
		getKey("ZMzm")
			.test.pressed(variable.Ans)
			    .success(
			        getCanvas("screen")
			            .add("center at 50%","middle at 60%",getText("right"))
			                .print()
			        )
			    .failure(
			        getCanvas("screen")
			            .add("center at 50%","middle at 60%",getText("wrong"))
			                .print()
			        ,
			        newTimer(3000)
			            .start()
			            .wait()
			        )
		,
		
//        getCanvas("screen")
//            .remove(getText("press"))
//        ,
        newTimer("wait5",1000)
            .start()
            .wait()
        ,
        getCanvas("screen").remove()

    )
    .log( "ParticipantID", PennController.GetURLParameter("id") )
    .log("List", variable.Group)
    .log("Item", variable.ItemNumber)
    .log("Condition", variable.SoundFile)
);

PennController.Template( "HP_list_blockB.csv" ,
    variable => PennController( "HPTaskB" ,
        
        newCanvas("screen", 800,580)
            .center()
            .print()
        ,
        
        newText("cue", "+").center()
        ,
        newText("press", "<i>Press <strong>Z</strong> for same or <strong>M</strong> for bright</i>").center()
        ,
        newText("right","Right!").center()
        ,
        newText("wrong","No, that one was&nbsp;"+variable.Brightness2).center()
            .color("red")
        ,
        
        getCanvas("screen").add("center at 50%","middle at 50%", getText("cue") )
        ,
        newTimer("wait3", 500)
            .start()
            .wait()
        ,
        newAudio("audio", variable.SoundPath)
            .play()
        ,
        newTimer("wait4",6000)
            .start()
            .wait()
        ,
        getCanvas("screen")
			.remove(getText("cue"))
			.add("center at 50%","middle at 50%", getText("press") )
			.print()
        ,
        
        newKey("ZMzm")
			.log()
			.wait()
        ,
		getKey("ZMzm")
			.test.pressed(variable.Ans)
			    .success(
			        getCanvas("screen")
			            .add("center at 50%","middle at 60%",getText("right"))
			                .print()
			        )
			    .failure(
			        getCanvas("screen")
			            .add("center at 50%","middle at 60%",getText("wrong"))
			                .print()
			        ,
			        newTimer(3000)
			            .start()
			            .wait()
			        )
		,
		
//        getCanvas("screen")
//            .remove(getText("press"))
//        ,
        newTimer("wait5",1000)
            .start()
            .wait()
        ,
        getCanvas("screen").remove()

    )
    .log( "ParticipantID", PennController.GetURLParameter("id") )
    .log("List", variable.Group)
    .log("Item", variable.ItemNumber)
    .log("Condition", variable.SoundFile)
);

PennController( "debrief" ,
        defaultText
            .print()
        ,
        newText("<p><strong>Thank you for participating in our study!</strong></p>")
        ,
        newText("<br/>")
        ,
        newText("<p>This study was designed to assess the processing of harmonic (musical) structure. We are interested in how listeners’ harmonic expectations differ as a function of scale type, and so you heard sequences in either a typical “rock” scale or a more “standard” scale. These sequences ended in different chords that should be more or less expected within each scale, and we can use your accuracy and response time as a way to assess how easy it was for you to process that particular chord. </p>")
        ,
        newText("<p>Of course, we don’t know the results of this experiment yet as we are still collecting data. However, if you still have any questions about this experiment, please feel free to contact Dr. Slevc at slevc@umd.edu. You may also contact slevc@umd.edu if you wish to withdraw your participation, in which case we will delete the data you provided.</p>")
        ,
        newText("<p>Finally, please don’t share any information about the experiment with other people who might participate, just in case knowing the goal of the experiment could bias peoples’ responses in some way.</p>")
        ,
        newText("<p>Thank you again for your time! "+'<strong><a href="https://umpsychology.sona-systems.com/webstudy_credit.aspx?experiment_id=1764&credit_token=e1a40badfc4d42ba98627a89e7da46b3&survey_code='+GetURLParameter('id')+'" rel="nofollow">Click here to confirm participation on SONA</a>.</strong>')            .print()
            .wait()
);

PennController( "exit" ,
        newText("<p>You may now close your browser window.</p>").print()
        ,
        newTimer("dummy", 10)
            .wait() // This will wait forever
);
