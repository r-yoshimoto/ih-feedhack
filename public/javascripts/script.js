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

$('#tokenfield')

  .on('tokenfield:createtoken', function (e) {
    var data = e.attrs.value.split('|')
    e.attrs.value = data[1] || data[0]
    e.attrs.label = data[1] ? data[0] + ' (' + data[1] + ')' : data[0]
  })

  .on('tokenfield:createdtoken', function (e) {
    // Über-simplistic e-mail validation
    var re = /\S+@\S+\.\S+/
    var valid = re.test(e.attrs.value)
    if (!valid) {
      $(e.relatedTarget).addClass('invalid')
    }
  })

  .on('tokenfield:edittoken', function (e) {
    if (e.attrs.label !== e.attrs.value) {
      var label = e.attrs.label.split(' (')
      e.attrs.value = label[0] + '|' + e.attrs.value
    }
  })

  .on('tokenfield:removedtoken', function (e) {
    alert('E-mail ' + e.attrs.value + ' removed from the invitee list.')
  })

  .tokenfield()