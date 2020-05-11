$("#D1").animatedModal({
    animatedIn:'zoomIn',
    animatedOut:'bounceOut',
    color:'white',
    // Callbacks
    beforeOpen: function() {
        console.log("The animation was called");
    },           
    afterOpen: function() {
        console.log("The animation is completed");
    }, 
    beforeClose: function() {
        console.log("The animation was called");
    }, 
    afterClose: function() {
        console.log("The animation is completed");
    }
});