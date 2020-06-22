
var param_global ="" ;
var flag= 1;
$("#show_products_face").hide();

$("#ul_show_page").hide();


      // Permissions that are needed for the app
    var permsNeeded = ['publish_actions','email','user_likes','user_website','manage_pages','pages_manage_cta',
    'pages_show_list','read_page_mailboxes','publish_pages','user_photos', 'pages_messaging', 'pages_messaging_phone_number',
    'pages_messaging_subscriptions'
    ];


  /**  FB.init({
      appId   :  '1675084819406971',
      appSecret : '51d1d45a278f79b5634792f3c0c5b26e',
      //appId  : '1537496639804302',
      //appSecret : 'ebc451d790c7160c379d8f8293e357e8',
      //appId : '397951270370232',
      status : true, // check login status
      cookie : true, // enable cookies
      xfbml  : true, // parse XFBML
      oauth  : true // enable OAuth 2.0
    });
**/


     window.fbAsyncInit = function() {
    FB.init({
      appId      : '1675084819406971',
      xfbml      : true,
      version    : 'v2.8',
       status : true, // check login status
      cookie : true, // enable cookies
      xfbml  : true, // parse XFBML
      oauth  : true // enable OAuth 2.0
    });
    FB.AppEvents.logPageView();
  };

  (function(d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "//connect.facebook.net/en_US/sdk.js";
     fjs.parentNode.insertBefore(js, fjs);
   }(document, 'script', 'facebook-jssdk'));




    // Function that checks needed user permissions
    var checkPermissions = function() {
      FB.api('/me/permissions', function(response) {
       console.log(response);

      });
    };



function show_page_canhan(token_key, userID){
	 $("#album_face").html("");
	 $("#ul_page").html("");
	 var page_id = userID;
	 FB.api( "/"+page_id+"/picture",function(response) {
       					avata = response.data.url;
       					console.log(response);
       					console.log("response la: " + response.data);
       					//page_id = response.data.id;
       					console.log("page_id"+ page_id);
       				   response_data = "{'token_key':'"+ token_key+"','page_name':'Trang Ca nhan','page_avata':'"+avata+"','page_id':'"+page_id+"'}";
		     /* handle the result */
      $.ajax({
				url :'/show_page_face',
				type : 'POST',
				data :{"info":response_data},
				beforeSend:function(){

				},
				success : function(html){


				 $("#div_info_page").append(html);


				}
				}); /*End AJAX*/

       	}); /* END API PAGE AVATA*/


	}


function page_info(token_key, page_id,page_name){
	 $("#album_face").html("");
	 $("#ul_page").html("");

	 FB.api( "/"+page_id+"/picture",function(response) {
       					avata = response.data.url;
       				   response_data = "{'token_key':'"+ token_key+"','page_name':'"+page_name+"','page_avata':'"+avata+"','page_id':'"+page_id+"'}";
		     /* handle the result */
      $.ajax({
				url :'/show_page_face',
				type : 'POST',
				data :{"info":response_data},
				beforeSend:function(){

				},
				success : function(html){

				$("#div_info_page").append(html);


				}
				}); /*End AJAX*/

       	}); /* END API PAGE AVATA*/


	}


	// Function show all Page Manage Your Account
	var info_all_page = function(token_key, userID){
// Lay info page
		  FB.api(
    "/me/accounts",
    function (response) {
    	console.log(response);
    	var result = "";
      if (response && !response.error) {
      	// Lay cac thong tin chi tiet cua tung page
      	var ar_data = response.data;
      	//show_page_canhan(token_key,  userID);
      	for (var i=0;i<ar_data.length;i++){

					// Lay thong tin album tren moi page
				   page_info(token_key, ar_data[i].id,ar_data[i].name);


      		}
      }
    }
);
		};


function login_face(){

console.log("login face");
  FB.login(function(response) {
        console.log(response);
        if (response.status == "connected"){
        	  var token_key = String(response.authResponse['accessToken']);
        	  var user_ID = String(response.authResponse['userID']);
       		    info_all_page(token_key, user_ID);
        	}
      },{scope: permsNeeded.join(',')});

}

$("#login_face").click(function(){
console.log("login face");
  FB.login(function(response) {
        console.log(response);
        if (response.status == "connected"){
        	  var token_key = String(response.authResponse['accessToken']);
        	  var user_ID = String(response.authResponse['userID']);
       		    info_all_page(token_key, user_ID);
        	}
      },{scope: permsNeeded.join(',')});
	});



$("[name='btn_choose_page']").click(function(){
var token_key = $(this).attr("alt");
var page_id = $(this).attr("title");
		     /* handle the result */

      $.ajax({
				url :'/direct_chat',
				type : 'POST',
				data :{"token_key": token_key, "page_id": page_id},
				beforeSend:function(){
                    $("#div_info_page").html("<img src='http://test_image.vcmedia.vn/loading.gif'>");
				},
				success : function(html){

				    if (html == "True"){
				    window.location.href = "/chat";
				    }

				    else{
				       alert("Het Session");
				    }


				}
				}); /*End AJAX*/

});



