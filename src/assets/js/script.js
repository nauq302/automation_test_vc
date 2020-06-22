
$(function() {

	$(document).ready(function() {

function remove_commans(num){
	if(num != null){
		return num.toString().replace(/,/g,"");	}
	else{	return "";}
	}



function numberWithCommas(x){
	x= remove_commans(x);
	  if(x  && isNaN(x) == false ){return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");}else{ return "";}
			}



function get_thanhtien(id_table, col_sum){
	var total_money = 0;
   	$( "#"+id_table+" > tr" ).each(function(){
				var code_pro = $(this).attr("name");
				var thanhtien = remove_commans($("#"+col_sum+code_pro).html());
				total_money = eval(total_money) +eval(thanhtien);
		});
	return total_money;
	}

function get_giamgia(total_money, num_sale, option){
	var result = num_sale;
	if(option == '%'){
		result = (eval(num_sale)*eval(total_money))/100;
		}
	return result;
	}




	/*MANAGE KIOTSO1.COM*/

$("[name='btn_del_customer']").click(function(e){
	  var id_customer = $(this).attr("title");
	  if (confirm("Ban xac nhan xoa?")){
	  $.ajax({
		url:"/del_customer",
		type:"POST",
		data:{'id_customer': id_customer},
		beforeSend:function(){},
		success: function(html){
		        alert("Xoa ID"+ id_customer);
			    var href = 'thong-tin-khach-hang';
				loadContent(href);
				// HISTORY.PUSHSTATE
				//history.pushState('', 'New URL: '+href, href);
				e.preventDefault();
				}
	  	})
	  	}
	  	});

/* POST DATA CHUNG*/

function post_data_common( name_button_post, name_item_post){
  var list_post = {};
  var url_request = $("[name='"+name_button_post+"']").attr("title");
  var table_save = $("[name='"+name_button_post+"']").attr("id");
	$("[name='"+name_item_post+"']").each(function(){
		       var values = $(this).val();
				var name_field = $(this).attr("title");
                 var require = $(this).attr("alt");

                  $(this).css("border-color","gray");
				if (require == "*" && values == ""){
                 $(this).css("border-color","red");
                 $(this).attr("placeholder", "Not Empty");
                 list_post= [];
                return false;
					}
				else{
				list_post[name_field] = values;
				}
		});

		if (list_post.length == 0){
		 alert("Ban chua nhap du thong tin !");
		}

       $.ajax({
		url:url_request,
		type:"POST",
		data:{"table": table_save, 'info_data': JSON.stringify(list_post)},
		beforeSend:function(){},
		success: function(html){
                if (html == "True"){
                  alert("Add Success");
                  $("[name='"+name_item_post+"']").val("");
                  location.reload();
                }
                else{
                  alert(html);
                  location.reload();
                }
                }
         });
}





/* QUAN LI DUTY*/

/* QUAN LI ORRDER - DU AN*/
$("#btn_save_order").click(function(){
var flag =1;
 var list_post = {};
 var status_action = $(this).attr("title");
$( "[name='form_post']" ).each(function(){
		         var values = $(this).val();
				 var name_field = $(this).attr("title");
                 var require = $(this).attr("alt");
                 $(this).css("border-color","gray");
				 if (require == "*" && values == ""){
                 $(this).css("border-color","red");
                 $(this).attr("placeholder", "Not Empty");
                 list_post= [];
                 flag =0;
                return false;
		       }
				else{
				    list_post[name_field] = values;
				}
		});

var list_post_cus = {};
$( "[name='form_post_cus']" ).each(function(){
		       var values = $(this).val();
				var name_field = $(this).attr("title");
                 var require = $(this).attr("alt");

                  $(this).css("border-color","gray");
				if (require == "*" && values == ""){
                 $(this).css("border-color","red");
                 $(this).attr("placeholder", "Not Empty");
                 list_post_cus= [];
                  flag =2;
                  return false;
					}
				else{
				list_post_cus[name_field] = values;
				}
		});

var list_post_duty = {};
$( "[name='form_duty']" ).each(function(){
		       var values = $(this).val();
				var name_field = $(this).attr("title");
                 var require = $(this).attr("alt");

                  $(this).css("border-color","gray");
				if (require == "*" && values == ""){
                 $(this).css("border-color","red");
                 $(this).attr("placeholder", "Not Empty");

                 list_post_duty= [];
                  flag =2;
                  return false;
					}
				else{
				if (values){
				  values = values.toString();
				}
				else{
				  values = "";
				}
				list_post_duty[name_field] = values;
				}
		});



list_order = [];
var total_order = '0';
$( "[name='row_order']" ).each(function(){
               var id_row = $(this).attr("id");
               var content_order = $("#"+id_row+" [name='content_order']").val();
               var unit_order = $("#"+id_row+" [name='unit_order']").val();
               var prices_order = $("#"+id_row+" [name='prices_order']").val();
               var qty_order = $("#"+id_row+" [name='qty_order']").val();
               var thanhtien_order = remove_commans($("#"+id_row+" [name='thanhtien_order']").html());
                total_order = eval(parseInt(thanhtien_order) + parseInt(total_order));
               console.log(thanhtien_order);

               console.log(total_order)
               var temp = {"id_order": id_row, "content_order": content_order,"unit_order": unit_order, "prices_order": remove_commans(prices_order),
               "qty_order":qty_order, "thanhtien_order": thanhtien_order};
               list_order.push(temp);
        });

list_post["list_order"]=list_order;


if (flag ==0 ){
alert("Ban Chua Nhap Du Thong Tin Yeu Cau, Đien đay đu thong tin trong (*) : Ma Du an , Hinh thuc thanh toan....");
}
else if (flag == 2 ){
alert("Ban Chua Nhap Thong Tin Khach Hang!");
}
else{
if(confirm("Ban chac chan luu du an nay ? ")){

list_post['total_order'] = total_order;
list_post["total_order_final"] = remove_commans($("#kh_thanhtoan").html());

$.ajax({
		url:"/save_order",
		type:"POST",
		data:{"status_action": status_action, "data_order": JSON.stringify(list_post), 'data_cus': JSON.stringify(list_post_cus),
		'data_duty': JSON.stringify(list_post_duty)},
		beforeSend:function(){},
		success: function(html){
                if (html == "True"){
                  alert("Add Success");
                  var url = "http://apec.kiotso1.com/show_invoice?code="+$("[title='code_order']").val();
                  window.location = url;

                }
                else{
                  alert(html);
                }
                }
                });
          }
   }

});







/* QUAN LI THU- CHI*/
$("[name='btn_post_recip']").click(function(){
var name_button_post = "btn_post_recip";
var name_item_post = "form_post_thu";
post_data_common( name_button_post, name_item_post);

});

$("[name='btn_update_recip']").click(function(){
var name_button_post = "btn_update_recip";
var name_item_post = "form_post_thu";
post_data_common( name_button_post, name_item_post);

});


function delete_data(obj){

var url_request = $(obj).attr("title");
var data_post = $.parseJSON($(obj).attr("id"));
var cf = $(obj).attr("alt");
if(confirm(cf)){
 $.ajax({
		url: url_request,
		type:"POST",
		data: data_post,
		beforeSend:function(){},
		success: function(html){
                if (html == "True"){
                  alert("Delete Success");
                  location.reload();
                }
                else{
                  alert(html);
                }

                }
                });
    }

}




$("[name='btn_del_data']").click(function(){
var url_request = $(this).attr("title");
var data_post = $.parseJSON($(this).attr("id"));
var cf = $(this).attr("alt");
if(confirm(cf)){
 $.ajax({
		url: url_request,
		type:"POST",
		data: data_post,
		beforeSend:function(){},
		success: function(html){
                if (html == "True"){
                  alert("Delete Success");
                  location.reload();
                }
                else{
                  alert(html);
                }

                }
                });
    }
});


$("[alt='requied_number']").keyup(function(){
var number = remove_commans($(this).val());
$(this).val(numberWithCommas(number));
});


$("[name='btn_post_give']").click(function(){
var name_button_post = "btn_post_give";
var name_item_post = "form_post_chi";
post_data_common( name_button_post, name_item_post);
});




$("[name='btn_post_data']").click(function(){
  var list_post = {};
  var url_request = $(this).attr("title");
  var table_save = $(this).attr("id");
  var option = $(this).attr("alt");


	$( "[name='form_post']" ).each(function(){
		       var values = $(this).val();
				var name_field = $(this).attr("title");
                 var require = $(this).attr("alt");

                  $(this).css("border-color","gray");
				if (require == "*" && values == ""){
                 $(this).css("border-color","red");
                 $(this).attr("placeholder", "Not Empty");
                 list_post= [];
                return false;
					}
				else{
				list_post[name_field] = values;
				}
		});



var list_permit = "";
$("#form_post_check input:checked").each(function() {
    var pm = $(this).attr('title');
    list_permit += pm + ",";
});



       $.ajax({
		url:url_request,
		type:"POST",
		data:{'option': option, "table": table_save, 'info_data': JSON.stringify(list_post),
		'list_permit': list_permit},
		beforeSend:function(){},
		success: function(html){
                if (html == "True"){
                  alert("Add Success");
                  $("[name='form_post']").val("");
                  location.reload();
                }
                else if (html == "Update"){
                   alert("Cap Nhat Thanh Cong !");

                  location.reload();
                }
                else{
                  alert(html);
                }

				}
	  	})


})












$("[name='btn_save_order']").click( function(){
var id = $(this).attr("title");
var name_cus = $("#txt_name_"+id).val();
var email_cus = $("#txt_email_"+id).val();
var phone_cus = $("#txt_phone_"+id).val();
var address_cus = $("#txt_address_"+id).val();
var list_label = [];
 	$( "#list_label_"+id+" > [name='label_user']" ).each(function(){
         var name_label = $(this).html();
          list_label.push(name_label);
    		});
var list_data = {"id_user": id, "name": name_cus, "email": email_cus,
"phone": phone_cus, "address": address_cus, "list_label": list_label};

	  $.ajax({
		url:"/update_user_inbox",
		type:"POST",
		data: list_data,
		beforeSend:function(){},
		success: function(response){
               $("#panel_name_"+id).html(name_cus);
               $("#panel_phone_"+id).html(phone_cus);
               $("#panel_address_"+id).html(address_cus);
				}
	  	})


});



$("[name='li_list_user']").click(function(){
var id = $(this).attr("title");

  $.ajax({
		url:"/gen_page_chat",
		type:"POST",
		data: {"id": id},
		beforeSend:function(){},
		success: function(response){
		     $(".tab-pane").html("");
             $("#tab-"+id).html(response);


				}
	  	})


});



});
});