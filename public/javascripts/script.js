$(function () {
  $('[data-toggle="tooltip"]').tooltip()
})

$( "#button-delete" ).click(function() {
  $('#form').attr('action', '/inbox/delete');
});

$( "#button-draft" ).click(function() {
  $('#form').attr('action', '/inbox/draft');
});

$( "#button-send" ).click(function() {
  $('#form').attr('action', '/inbox/send');
});
