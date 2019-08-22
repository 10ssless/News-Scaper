$(document).ready(function(){
  $.ajax("/scrape", {
    method: "GET"
  }).then(function(result){
    console.log(result)
  })
  // $("#notes").hide()

  $("#placeholder").hide()
  let instructions = setInterval(function(){
    $("#placeholder").fadeToggle(1000)
  },1500)

  $(document).on("click", ".article-title", function() {
    clearInterval(instructions)
    $("#notes").empty();
    $("#notes").fadeOut(500);
    var id = $(this).attr("data-id");
    var note_timer = setTimeout(function() {
      $.ajax("/articles/"+id, {
        method: "GET",
      }).then(function (data) {
          $("#notes").append("<h2>Notes</h2><br>");
          $("#notes").append("<h3><i>" + data.title + "</i></h3>");
          $("#notes").append("<input id='titleinput' name='title' placeholder='title'>");
          $("#notes").append("<textarea id='bodyinput' name='body' placeholder='notes'></textarea>");
          $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");
          if (data.note) {
            $("#titleinput").val(data.note.title);
            $("#bodyinput").val(data.note.body);
          }
          $("#notes").fadeIn(500)
        });
    }, 500)
  });

  // When you click the savenote button
  $(document).on("click", "#savenote", function() {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");

    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        // Value taken from title input
        title: $("#titleinput").val(),
        // Value taken from note textarea
        body: $("#bodyinput").val()
      }
    })
      // With that done
      .then(function(data) {
        // Log the response
        console.log(data);
        // Empty the notes section
        $("#notes").empty();
      });

    // Also, remove the values entered in the input and textarea for note entry
    $("#titleinput").val("");
    $("#bodyinput").val("");
  });
})