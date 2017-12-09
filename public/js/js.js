$(document).ready(function(){

$('#submit').click(function(){
	if(!$('#title').val()){
		alert('Hey you need a title');
		return false;
	}
})


$('#open').click(function(){
    $("#mySidenav").css( "width", "250" );
})


$('#close').click(function(){
	$("#mySidenav").css( "width", "0" );
})

})

