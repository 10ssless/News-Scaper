$(document).ready(function(){
  let scraped = false;
  let instructions;
  $("#placeholder").hide()

  $("#scrape-btn").click(function(){
    scraped = true
    $.ajax("/scrape", {
      method: "GET"
    }).then(function(result){
      console.log(result)
      window.location.reload()
      $("#scrape-btn").css("color", "lightgray")
    })
  })
  
  instructions = setInterval(function () {
    $("#placeholder").fadeToggle(1000)
  }, 1500)
  
  
  // $("#drop-btn").click(function(){
  //   scraped = true
  //   $.ajax("/drop", {
  //     method: "DELETE"
  //   }).then(function(result){
  //     console.log(result)
  //     window.location.reload()
  //     // $("#scrape-btn").css("color","lightgray")
  //   })
  // })
  
  
  // $("#notes").hide()


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


  $(document).on("click", "#savenote", function() {
    var thisId = $(this).attr("data-id");

    $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        title: $("#titleinput").val(),
        body: $("#bodyinput").val()
      }
    }).then(function(data) {
        console.log(data);
        $("#notes").empty();
        $("#titleinput").val("");
        $("#bodyinput").val("");
      });
  });
})