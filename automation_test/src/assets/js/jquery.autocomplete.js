/*
 * jQuery Autocomplete plugin 1.1
 *
 * Copyright (c) 2009 Jörn Zaefferer
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * Revision: $Id: jquery.autocomplete.js 15 2009-08-22 10:30:27Z joern.zaefferer $
 */


 var matched, browser;

jQuery.uaMatch = function( ua ) {
    ua = ua.toLowerCase();

    var match = /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
        /(webkit)[ \/]([\w.]+)/.exec( ua ) ||
        /(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
        /(msie) ([\w.]+)/.exec( ua ) ||
        ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
        [];

    return {
        browser: match[ 1 ] || "",
        version: match[ 2 ] || "0"
    };
};

matched = jQuery.uaMatch( navigator.userAgent );
browser = {};

if ( matched.browser ) {
    browser[ matched.browser ] = true;
    browser.version = matched.version;
}

// Chrome is Webkit, but Webkit is also Safari.
if ( browser.chrome ) {
    browser.webkit = true;
} else if ( browser.webkit ) {
    browser.safari = true;
}

jQuery.browser = browser;

function numberWithCommas(x){
    		    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
				}
function remove_commans(num){
		return num.toString().replace(/,/g,"");	
	}
			
function getRadioValue(groupName){
    var _result;
    try {
        var o_radio_group = document.getElementsByName(groupName);
        for (var a = 0; a < o_radio_group.length; a++) {
            if (o_radio_group[a].checked) {
                _result = o_radio_group[a].value;
                break;
            }
        }
    } catch (e) {}
    return _result;
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

function gen_nhaphang_cal(){
	/* Tinh tong tien hang */
	var total_money = get_thanhtien("table_pro_nhaphang", "td_thanhtien");
	//Gan gia tri Tong tien hang
	$("#total_import").html(numberWithCommas(total_money));
	
	// Lay gia tri sale off - giam gia ra VND
	var num_sale = $("[name='txt_gg_nhaphang']").val();
	var option = getRadioValue("gg_nhaphang");
	var giamgia = get_giamgia(total_money,num_sale,option);
	
	// Tinh tien phai tra cho nha cung cap
	var tong_tien_da_thanhtoan = remove_commans($("#td_total_pay_ncc").html());
	var tong_tien = total_money - giamgia - tong_tien_da_thanhtoan;
	$("#td_money_rep_ncc").html(numberWithCommas(tong_tien));
	
	// Tinh TK nha cung cap
	var tien_tra = remove_commans($("#txt_tien_tra_nhaphang").val());
	if (tien_tra == null) {
		tien_tra = 0;
		}
	var tien_tk = tien_tra - tong_tien;
	$("#td_add_ncc").html(numberWithCommas(tien_tk));
	}

function gen_chuyenhang_cal(id_table){
  	var total_num = 0;   	
   	$( "#"+id_table+" > tr" ).each(function(){
					var code_pro = $(this).attr("name");
		
				var num_move = remove_commans($("#txt_num_move"+code_pro).val());
				total_num = eval(total_num) +eval(num_move);
	
		});		
	
       $("#total_num_move").html(total_num);	
	
	}


function gen_trahangnhap_cal(){
	/* Tinh tong tien hang */
	var total_money = get_thanhtien("table_pro_trahangnhap", "td_thanhtien");
	
	//Gan gia tri Tong tien hang
	$("#total_rep_import").html(numberWithCommas(total_money));
	$("#td_money_ncc_rep").html(numberWithCommas(total_money));
	var total_money_ncc_rep =  remove_commans($("#txt_tien_tra_trahangnhap").val());
	if (total_money_ncc_rep == null){ total_money_ncc_rep = 0};
	$("#td_sub_ncc").html(numberWithCommas(eval(total_money_ncc_rep-total_money)));
	
	}

function cal_reppay(tab_active){
	var total_money = $("#btn_kpt"+tab_active).html().replace(/,/g,"");
	var tkt = $("#txt_tkt"+tab_active).val().replace(/,/g,"");
	var res_ttk = eval(tkt - total_money);
	$("#txt_tkt"+tab_active).val(numberWithCommas(tkt));
	$("#td_ttk"+tab_active).html(numberWithCommas(res_ttk));	
}



function cal_sale_off(tab_active,sale_off){
     //Tong tien hang	   
	   var total_money = $("#td_tth"+tab_active).attr("title");	    
		// Loai giam gia (VND/%)		
		var kind_sales = getRadioValue('gg'+tab_active);		 
       if(kind_sales == '%'){
			sale_off = Math.round((sale_off*total_money)/100);        	
       	}
      total_money = total_money - sale_off;
      $("[name='kpt"+tab_active+"']").html(numberWithCommas(total_money));
      var tkt = $("#txt_tkt"+tab_active).val().replace(/,/g,"");
      var res_ttk = eval(tkt - total_money);
      $("#td_ttk"+tab_active).html(numberWithCommas(res_ttk));	
     
	}	
					
function change_val_order(tab_active,code_pro,num,sales_prices){
	    
	     if(sales_prices){
	   	sales_prices = sales_prices.toString().replace(/,/g,"");}
   	var thanhtien = eval(num*sales_prices);   	
      $("#thanh_tien"+tab_active+code_pro).attr("title",thanhtien);	
		var total_money = 0;   	
   	$( "[name='thanhtien_products"+tab_active+"']" ).each(function(){
				var tam = $(this).attr("title").replace(/,/g,"");
				total_money = eval(total_money)+eval(tam);
				console.log(total_money);
		});		
		thanhtien = numberWithCommas(thanhtien);
		
   	$("#thanh_tien"+tab_active+code_pro).html(thanhtien);
      $("#td_tth"+tab_active).html(numberWithCommas(total_money));
      $("#td_tth"+tab_active).attr("title",total_money);
       if(tab_active.toString().indexOf("TH")>=0){
	     	get_row_rep_pro_storage(tab_active);
	     	}
	     	else{
		var kind_sales = $("#gg"+tab_active).val();
      var sale_off = $("#txtgg_"+tab_active).val();
       cal_sale_off(tab_active, sale_off);
       cal_reppay(tab_active);
       get_row_order_storage(tab_active);}
	}	

// SAVE order in localstorage
function get_row_order_storage(name_tab){
								var info_order={};
	                     var info_pro=[];
	                     var total_root_cost = 0;
	                     // Lay order trong storage
	                      var order_storage = $.jStorage.get(name_tab);
								// neu hoa don chua ton tai	                   
									                                            
	                 		$("#body_tab"+name_tab).find("b").each(function(){
	                 			//Info Products
	                 			var pro = $.parseJSON($(this).html());
	                 		   var code_pro = pro.code_pro;
	                 		   var pro_name = pro.name_pro;
	                 		   var root_price = pro.import_prices;
	                 		   var discount = 0;
	                 		   var sale_prices = $("[name='prices"+name_tab+code_pro+"']").val().replace(/,/g,"");
	                 		   var num_sales= $("#txt"+name_tab+code_pro).val();
	                 		   // Tinh chi phi nhap ban dau
	                 		   total_root_cost = eval(total_root_cost+root_price);
	                 		   var total = eval(num_sales*sale_prices);
	  								var info_pro_temp = {'sale_prices': parseInt(sale_prices),'pro_name': pro_name,'root_prices':parseInt(root_price),'num_sales':parseInt(num_sales),'pro_id':code_pro,'discount': 0,'total': parseInt(total)};
	  										info_pro.push(info_pro_temp);			
        								});
        								
        								
        					var status_order = "temp";
        					var name_customer = $("#search_cus"+name_tab).val();
							var tth = $("#td_tth"+name_tab).attr("title");
							var kpt = $("#btn_kpt"+name_tab).html().replace(/,/g,"");
						   
						     					
        					var discount_order = eval(tth-kpt);
        					var create_person = $("#txt_tennv").html().replace("Hi,","");
        					var code_order = name_tab;
        					var total_order = $("#btn_kpt"+name_tab).html().replace(/,/g,"");
        					var cus_pay = $("#txt_tkt"+name_tab).val().replace(/,/g,"");
        					var cus_rep_pay = $("#td_ttk"+name_tab).html().replace(/,/g,"");
        					var note = $("#area_note"+name_tab).val();
        					var info_temp ={'status': status_order,'total_root_cost':total_root_cost,'name_customer': name_customer, 
'discount_order': parseInt(discount_order), 'create_person': create_person,
'code_order': name_tab, 'total_order': parseInt(total_order), 'cus_rep_pay': parseInt(cus_rep_pay), 
'note': note, 'products': info_pro, 'cus_pay': parseInt(cus_pay)};
        					info_order[name_tab]=info_temp;
        					$.jStorage.set(name_tab,JSON.stringify(info_temp));
							console.log(info_order);			  
	}
	
	
function add_pro(v, table_pro_id, input, url_request){
	var found = $(v).find("#name_pro").html(); // Tim ten Sp
		var code_pro = $(v).find("#search_code_pro").html(); //Tim ma sp		
		// Kiem tra row SP day da ton tai trong tab dang Active hay chua
        				var flag = 0;
        				$("#"+table_pro_id).find('tr').each(function(){
        					// Lay ma san pham trong ten row
        					var name_row = $(this).attr("name").trim();
        				     // Neu ma san pham da ton tai
        					if(name_row == code_pro.trim()){
								flag = 1;        						
        						}        					
        					});
        					
		// Gan text box tim kiem bang ten san pham
		input.val(found);
		var info_push = {};
		if(table_pro_id == "table_pro_promotion"){
			var kind_sales = getRadioValue("radio_kind_sale_off");
         var val_sales = remove_commans($("#txt_giatri").val());
			info_push = {"kind_sales": kind_sales, "val_sales": val_sales};
			};
			
			
		if(flag ==0){
		$.ajax({
				url :'/'+url_request,
				type : 'POST',
				data :{"code_pro":code_pro,"info_push": JSON.stringify(info_push)},
				beforeSend:function(){
					},
				success : function(html){
				   if (html != "False"){
					$("#"+table_pro_id).append(html);
					
					if(table_pro_id == "table_pro_nhaphang"){
					gen_nhaphang_cal();
					}
					else if(table_pro_id == "table_pro_trahangnhap"){
						gen_trahangnhap_cal();						
						}
					else if(table_pro_id == "table_pro_chuyenhang"){
						gen_chuyenhang_cal(table_pro_id);						
						}
				  }else{
				  	swal("warning", "Sản phẩm này đã hết , không thực hiện được thao tác ! ", "warning");
				  	}
				  
				  }
				}); 		
			}
		
	
	}	
	
	
	
;(function($) {
	
$.fn.extend({
	autocomplete: function(urlOrData, options) {
		var isUrl = typeof urlOrData == "string";
		options = $.extend({}, $.Autocompleter.defaults, {
			url: isUrl ? urlOrData : null,
			data: isUrl ? null : urlOrData,
			delay: isUrl ? $.Autocompleter.defaults.delay : 10,
			max: options && !options.scroll ? 10 : 150
		}, options);
		
		// if highlight is set to false, replace it with a do-nothing function
		options.highlight = options.highlight || function(value) { return value; };
		
		// if the formatMatch option is not specified, then use formatItem for backwards compatibility
		options.formatMatch = options.formatMatch || options.formatItem;
		
		return this.each(function() {
			new $.Autocompleter(this, options);
		});
	},
	result: function(handler) {
		return this.bind("result", handler);
	},
	search: function(handler) {
		return this.trigger("search", [handler]);
	},
	flushCache: function() {
		return this.trigger("flushCache");
	},
	setOptions: function(options){
		return this.trigger("setOptions", [options]);
	},
	unautocomplete: function() {
		return this.trigger("unautocomplete");
	}
});

$.Autocompleter = function(input, options) {

	var KEY = {
		UP: 38,
		DOWN: 40,
		DEL: 46,
		TAB: 9,
		RETURN: 13,
		ESC: 27,
		COMMA: 188,
		PAGEUP: 33,
		PAGEDOWN: 34,
		BACKSPACE: 8
	};

	// Create $ object for input element
	var $input = $(input).attr("autocomplete", "off").addClass(options.inputClass);

	var timeout;
	var previousValue = "";
	var cache = $.Autocompleter.Cache(options);
	var hasFocus = 0;
	var lastKeyPressCode;
	var config = {
		mouseDownOnSelect: false
	};
	var select = $.Autocompleter.Select(options, input, selectCurrent, config);
	
	var blockSubmit;
	
	// prevent form submit in opera when selecting with return key
	$.browser.opera && $(input.form).bind("submit.autocomplete", function() {
		if (blockSubmit) {
			blockSubmit = false;
			return false;
		}
	});
	
	// only opera doesn't trigger keydown multiple times while pressed, others don't work with keypress at all
	$input.bind(($.browser.opera ? "keypress" : "keydown") + ".autocomplete", function(event) {
		// a keypress means the input has focus
		// avoids issue where input had focus before the autocomplete was applied
		hasFocus = 1;
		// track last key pressed
		lastKeyPressCode = event.keyCode;
		switch(event.keyCode) {
		
			case KEY.UP:
				event.preventDefault();
				if ( select.visible() ) {
					select.prev();
				} else {
					onChange(0, true);
				}
				break;
				
			case KEY.DOWN:
				event.preventDefault();
				if ( select.visible() ) {
					select.next();
				} else {
					onChange(0, true);
				}
				break;
				
			case KEY.PAGEUP:
				event.preventDefault();
				if ( select.visible() ) {
					select.pageUp();
				} else {
					onChange(0, true);
				}
				break;
				
			case KEY.PAGEDOWN:
				event.preventDefault();
				if ( select.visible() ) {
					select.pageDown();
				} else {
					onChange(0, true);
				}
				break;
			
			// matches also semicolon
			case options.multiple && $.trim(options.multipleSeparator) == "," && KEY.COMMA:
			case KEY.TAB:
			case KEY.RETURN:
				if( selectCurrent() ) {
					// stop default to prevent a form submit, Opera needs special handling
					event.preventDefault();
					blockSubmit = true;
					return false;
				}
				break;
				
			case KEY.ESC:
				select.hide();
				break;
				
			default:
				clearTimeout(timeout);
				timeout = setTimeout(onChange, options.delay);
				break;
		}
	}).focus(function(){
		// track whether the field has focus, we shouldn't process any
		// results if the field no longer has focus
		hasFocus++;
	}).blur(function() {
		hasFocus = 0;
		if (!config.mouseDownOnSelect) {
			hideResults();
		}
	}).click(function() {
			
		// show select when clicking in a focused field
		if ( hasFocus++ > 1 && !select.visible() ) {
			onChange(0, true);
		}
	}).bind("search", function() {
		// TODO why not just specifying both arguments?
		var fn = (arguments.length > 1) ? arguments[1] : null;
		function findValueCallback(q, data) {
			var result;
			if( data && data.length ) {
				for (var i=0; i < data.length; i++) {
					if( data[i].result.toLowerCase() == q.toLowerCase() ) {
						result = data[i];
						break;
					}
				}
			}
			if( typeof fn == "function" ) fn(result);
			else $input.trigger("result", result && [result.data, result.value]);
		}
		$.each(trimWords($input.val()), function(i, value) {
			request(value, findValueCallback, findValueCallback);
		});
	}).bind("flushCache", function() {
		cache.flush();
	}).bind("setOptions", function() {
		$.extend(options, arguments[1]);
		// if we've updated the data, repopulate
		if ( "data" in arguments[1] )
			cache.populate();
	}).bind("unautocomplete", function() {
		select.unbind();
		$input.unbind();
		$(input.form).unbind(".autocomplete");
	});
	
	
	function selectCurrent() {
		var selected = select.selected();
		if( !selected )
			return false;
		
		var v = selected.result;
		previousValue = v;
		
		if ( options.multiple ) {
			var words = trimWords($input.val());
			if ( words.length > 1 ) {
				var seperator = options.multipleSeparator.length;
				var cursorAt = $(input).selection().start;
				var wordAt, progress = 0;
				$.each(words, function(i, word) {
					progress += word.length;
					if (cursorAt <= progress) {
						wordAt = i;
						return false;
					}
					progress += seperator;
				});
				words[wordAt] = v;
				// TODO this should set the cursor to the right position, but it gets overriden somewhere
				//$.Autocompleter.Selection(input, progress + seperator, progress + seperator);
				v = words.join( options.multipleSeparator );
			}
			v += options.multipleSeparator;
		}
      var name_complete =  input.name;   
      
      	
      if (name_complete == "course" ||name_complete == "course_sales"){
		var found = $(v).find("#name_pro").html(); // Tim ten Sp
		var code_pro = $(v).find("#search_code_pro").html(); // Tim ma sp
		var pro_pending = {}		
		// Gan text box tim kiem bang ten san pham
		$input.val(found);
		
		hideResultsNow();
		
		$input.trigger("result", [selected.data, selected.value]);
		      // Chay cac li trong ul_tab tim tab Active
				$('#ul_tab').each(function(){
    			$(this).find('li').each(function(){
        			var cl = $(this).attr("class");
        			// tim dc tab Active
        			if (cl=="active"){
        				// Ten tab Active
        				var name = $(this).attr("name");
        				// Kiem tra row SP day da ton tai trong tab dang Active hay chua
        				var flag = 0 ;
        				$("#body_tab"+name).find('tr').each(function(){
        					// Lay ma san pham trong ten row
        					var name_row = $(this).attr("id").replace('tr' + name,"").trim();
        				     // Neu ma san pham da ton tai
        					if(name_row == code_pro.trim()){
								flag = 1;        						
        						}        					
        					});
        		 // Neu ma san pham chua ton tai 
        		if(flag == 0){			
							$.ajax({
				url :'/add_row_products',
				type : 'POST',
				data :{"code_pro":code_pro , "tab_active":name},
				beforeSend:function(){
					
					
					},
				success : function(html)
				{

					$("#body_tab"+name).append(html);
					var num = $("#txt"+name+code_pro).val();
					var sales_prices = $("[name='prices"+name+code_pro+"']").val();
					change_val_order(name,code_pro,num,sales_prices);
					//alert(html);
				}
				}); }
				else{
					var cur_num = $("#txt"+name+code_pro).val();
					$("#txt"+name+code_pro).val(eval(cur_num)+1);
					var num = $("#txt"+name+code_pro).val();
					var sales_prices = $("[name='prices"+name+code_pro+"']").val();
					change_val_order(name,code_pro,num,sales_prices);					
					}  
        				}        		 
    			});
				});
				 $("#show_success_order").show();
				 $("#show_success_order").css("visibility", "visible");
				 setTimeout( "$('#show_success_order').hide();",4000 );
} // End course

else if (name_complete == 'course_add_pro_facebook'){
	add_pro(v,"table_pro_check",$input,"add_pro_facebook");
	}

else if (name_complete == 'course_kiemkho'){
	add_pro(v,"table_pro_check",$input,"add_check_pro");
	}
else if (name_complete == "serch_pro_nhaphang"){
		add_pro(v,"table_pro_nhaphang",$input,"add_import_pro");
	}
else if (name_complete == "search_pro_promotion"){
	   add_pro(v,"table_pro_promotion",$input,"add_promotion_pro");
	}
else if (name_complete == "search_pro_trahangnhap"){
		add_pro(v,"table_pro_trahangnhap",$input,"add_rep_import_pro");
	}
	else if (name_complete == "search_pro_chuyenhang"){
		add_pro(v,"table_pro_chuyenhang",$input,"add_move_pro");
	}
else if(name_complete == "search_provider_import"){
	  var name_provider = v.split("-")[0];
	  $input.val(v);
	  $.ajax({
				url :'/get_info_provider',
				type : 'POST',
				data :{'name':name_provider},
				beforeSend:function()
		{
				},
				success : function(html){
					$("#td_total_pay_ncc").html(numberWithCommas(html));
					gen_nhaphang_cal();
				}
				});
	  
	}
else {
	   $input.val(v);
	}		

	
	   hideResultsNow();
		$input.trigger("result", [selected.data, selected.value]);	
		return true;
	}
	
	function onChange(crap, skipPrevCheck) {
		if( lastKeyPressCode == KEY.DEL ) {
			select.hide();
			return;
		}
		
		var currentValue = $input.val();
		
		if ( !skipPrevCheck && currentValue == previousValue )
			return;
		
		previousValue = currentValue;
		
		currentValue = lastWord(currentValue);
		if ( currentValue.length >= options.minChars) {
			$input.addClass(options.loadingClass);
			if (!options.matchCase)
				currentValue = currentValue.toLowerCase();
			request(currentValue, receiveData, hideResultsNow);
		} else {
			stopLoading();
			select.hide();
		}
	};
	
	function trimWords(value) {
		if (!value)
			return [""];
		if (!options.multiple)
			return [$.trim(value)];
		return $.map(value.split(options.multipleSeparator), function(word) {
			return $.trim(value).length ? $.trim(word) : null;
		});
	}
	
	function lastWord(value) {
		if ( !options.multiple )
			return value;
		var words = trimWords(value);
		if (words.length == 1) 
			return words[0];
		var cursorAt = $(input).selection().start;
		if (cursorAt == value.length) {
			words = trimWords(value)
		} else {
			words = trimWords(value.replace(value.substring(cursorAt), ""));
		}
		return words[words.length - 1];
	}
	
	// fills in the input box w/the first match (assumed to be the best match)
	// q: the term entered
	// sValue: the first matching result
	function autoFill(q, sValue){
		// autofill in the complete box w/the first match as long as the user hasn't entered in more data
		// if the last user key pressed was backspace, don't autofill
		if( options.autoFill && (lastWord($input.val()).toLowerCase() == q.toLowerCase()) && lastKeyPressCode != KEY.BACKSPACE ) {
			// fill in the value (keep the case the user has typed)
			$input.val($input.val() + sValue.substring(lastWord(previousValue).length));
			// select the portion of the value not typed by the user (so the next character will erase)
			$(input).selection(previousValue.length, previousValue.length + sValue.length);
		}
	};

	function hideResults() {
		clearTimeout(timeout);
		timeout = setTimeout(hideResultsNow, 200);
	};

	function hideResultsNow() {
		var wasVisible = select.visible();
		select.hide();
		clearTimeout(timeout);
		stopLoading();
		if (options.mustMatch) {
			// call search and run callback
			$input.search(
				function (result){
					// if no value found, clear the input box
					if( !result ) {
						if (options.multiple) {
							var words = trimWords($input.val()).slice(0, -1);
							$input.val( words.join(options.multipleSeparator) + (words.length ? options.multipleSeparator : "") );
						}
						else {
							$input.val( "" );
							$input.trigger("result", null);
						}
					}
				}
			);
		}
	};

	function receiveData(q, data) {
		if ( data && data.length && hasFocus ) {
			stopLoading();
			select.display(data, q);
			autoFill(q, data[0].value);
			select.show();
		} else {
			hideResultsNow();
		}
	};

	function request(term, success, failure) {
		if (!options.matchCase)
			term = term.toLowerCase();
		var data = cache.load(term);
		// recieve the cached data
		if (data && data.length) {
			success(term, data);
		// if an AJAX url has been supplied, try loading the data now
		} else if( (typeof options.url == "string") && (options.url.length > 0) ){
			
			var extraParams = {
				timestamp: +new Date()
			};
			$.each(options.extraParams, function(key, param) {
				extraParams[key] = typeof param == "function" ? param() : param;
			});
			
			$.ajax({
				// try to leverage ajaxQueue plugin to abort previous requests
				mode: "abort",
				// limit abortion to this input
				port: "autocomplete" + input.name,
				dataType: options.dataType,
				url: options.url,
				data: $.extend({
					q: lastWord(term),
					limit: options.max
				}, extraParams),
				success: function(data) {
					var parsed = options.parse && options.parse(data) || parse(data);
					cache.add(term, parsed);
					success(term, parsed);
				}
			});
		} else {
			// if we have a failure, we need to empty the list -- this prevents the the [TAB] key from selecting the last successful match
			select.emptyList();
			failure(term);
		}
	};
	
	function parse(data) {
		var parsed = [];
		var rows = data.split("\n");
		for (var i=0; i < rows.length; i++) {
			var row = $.trim(rows[i]);
			if (row) {
				row = row.split("|");
				parsed[parsed.length] = {
					data: row,
					value: row[0],
					result: options.formatResult && options.formatResult(row, row[0]) || row[0]
				};
			}
		}
		return parsed;
	};

	function stopLoading() {
		$input.removeClass(options.loadingClass);
	};

};

$.Autocompleter.defaults = {
	inputClass: "ac_input",
	resultsClass: "ac_results",
	loadingClass: "ac_loading",
	minChars: 1,
	delay: 400,
	matchCase: false,
	matchSubset: true,
	matchContains: false,
	cacheLength: 10,
	max: 100,
	mustMatch: false,
	extraParams: {},
	selectFirst: true,
	formatItem: function(row) { return row[0]; },
	formatMatch: null,
	autoFill: false,
	width: 0,
	multiple: false,
	multipleSeparator: ", ",
	highlight: function(value, term) {
		return value.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + term.replace(/([\^\$\(\)\[\]\{\}\*\.\+\?\|\\])/gi, "\\$1") + ")(?![^<>]*>)(?![^&;]+;)", "gi"), "<strong>$1</strong>");
	},
    scroll: true,
    scrollHeight: 180
};

$.Autocompleter.Cache = function(options) {

	var data = {};
	var length = 0;
	
	function matchSubset(s, sub) {
		if (!options.matchCase) 
			s = s.toLowerCase();
		var i = s.indexOf(sub);
		if (options.matchContains == "word"){
			i = s.toLowerCase().search("\\b" + sub.toLowerCase());
		}
		if (i == -1) return false;
		return i == 0 || options.matchContains;
	};
	
	function add(q, value) {
		if (length > options.cacheLength){
			flush();
		}
		if (!data[q]){ 
			length++;
		}
		data[q] = value;
	}
	
	function populate(){
		if( !options.data ) return false;
		// track the matches
		var stMatchSets = {},
			nullData = 0;

		// no url was specified, we need to adjust the cache length to make sure it fits the local data store
		if( !options.url ) options.cacheLength = 1;
		
		// track all options for minChars = 0
		stMatchSets[""] = [];
		
		// loop through the array and create a lookup structure
		for ( var i = 0, ol = options.data.length; i < ol; i++ ) {
			var rawValue = options.data[i];
			// if rawValue is a string, make an array otherwise just reference the array
			rawValue = (typeof rawValue == "string") ? [rawValue] : rawValue;
			
			var value = options.formatMatch(rawValue, i+1, options.data.length);
			if ( value === false )
				continue;
				
			var firstChar = value.charAt(0).toLowerCase();
			// if no lookup array for this character exists, look it up now
			if( !stMatchSets[firstChar] ) 
				stMatchSets[firstChar] = [];

			// if the match is a string
			var row = {
				value: value,
				data: rawValue,
				result: options.formatResult && options.formatResult(rawValue) || value
			};
			
			// push the current match into the set list
			stMatchSets[firstChar].push(row);

			// keep track of minChars zero items
			if ( nullData++ < options.max ) {
				stMatchSets[""].push(row);
			}
		};

		// add the data items to the cache
		$.each(stMatchSets, function(i, value) {
			// increase the cache size
			options.cacheLength++;
			// add to the cache
			add(i, value);
		});
	}
	
	// populate any existing data
	setTimeout(populate, 25);
	
	function flush(){
		data = {};
		length = 0;
	}
	
	return {
		flush: flush,
		add: add,
		populate: populate,
		load: function(q) {
			if (!options.cacheLength || !length)
				return null;
			/* 
			 * if dealing w/local data and matchContains than we must make sure
			 * to loop through all the data collections looking for matches
			 */
			if( !options.url && options.matchContains ){
				// track all matches
				var csub = [];
				// loop through all the data grids for matches
				for( var k in data ){
					// don't search through the stMatchSets[""] (minChars: 0) cache
					// this prevents duplicates
					if( k.length > 0 ){
						var c = data[k];
						$.each(c, function(i, x) {
							// if we've got a match, add it to the array
							if (matchSubset(x.value, q)) {
								csub.push(x);
							}
						});
					}
				}				
				return csub;
			} else 
			// if the exact item exists, use it
			if (data[q]){
				return data[q];
			} else
			if (options.matchSubset) {
				for (var i = q.length - 1; i >= options.minChars; i--) {
					var c = data[q.substr(0, i)];
					if (c) {
						var csub = [];
						$.each(c, function(i, x) {
							if (matchSubset(x.value, q)) {
								csub[csub.length] = x;
							}
						});
						return csub;
					}
				}
			}
			return null;
		}
	};
};

$.Autocompleter.Select = function (options, input, select, config) {
	var CLASSES = {
		ACTIVE: "ac_over"
	};
	
	var listItems,
		active = -1,
		data,
		term = "",
		needsInit = true,
		element,
		list;
	
	// Create results
	function init() {
		if (!needsInit)
			return;
		element = $("<div/>")
		.hide()
		.addClass(options.resultsClass)
		.css("position", "absolute")
		.appendTo(document.body);
	
		list = $("<ul/>").appendTo(element).mouseover( function(event) {
			if(target(event).nodeName && target(event).nodeName.toUpperCase() == 'LI') {
	            active = $("li", list).removeClass(CLASSES.ACTIVE).index(target(event));
			    $(target(event)).addClass(CLASSES.ACTIVE);            
	        }
		}).click(function(event) {
			$(target(event)).addClass(CLASSES.ACTIVE);
			//alert(input.value);	
		
		  
			select();
			// TODO provide option to avoid setting focus again after selection? useful for cleanup-on-focus
			input.focus();		
	
			return false;
		}).mousedown(function() {
			config.mouseDownOnSelect = true;
		}).mouseup(function() {
			config.mouseDownOnSelect = false;
		});
		
		if( options.width > 0 )
			element.css("width", options.width);
			
		needsInit = false;
	} 
	
	function target(event) {
		var element = event.target;
		while(element && element.tagName != "LI")
			element = element.parentNode;
		// more fun with IE, sometimes event.target is empty, just ignore it then
		if(!element)
			return [];
		return element;
	}

	function moveSelect(step) {
		listItems.slice(active, active + 1).removeClass(CLASSES.ACTIVE);
		movePosition(step);
        var activeItem = listItems.slice(active, active + 1).addClass(CLASSES.ACTIVE);
        if(options.scroll) {
            var offset = 0;
            listItems.slice(0, active).each(function() {
				offset += this.offsetHeight;
			});
            if((offset + activeItem[0].offsetHeight - list.scrollTop()) > list[0].clientHeight) {
                list.scrollTop(offset + activeItem[0].offsetHeight - list.innerHeight());
            } else if(offset < list.scrollTop()) {
                list.scrollTop(offset);
            }
        }
	};
	
	function movePosition(step) {
		active += step;
		if (active < 0) {
			active = listItems.size() - 1;
		} else if (active >= listItems.size()) {
			active = 0;
		}
	}
	
	function limitNumberOfItems(available) {
		return options.max && options.max < available
			? options.max
			: available;
	}
	
	function fillList() {
		list.empty();
		var max = limitNumberOfItems(data.length);
		for (var i=0; i < max; i++) {
			if (!data[i])
				continue;
			var formatted = options.formatItem(data[i].data, i+1, max, data[i].value, term);
			if ( formatted === false )
				continue;
			var li = $("<li/>").html( options.highlight(formatted, term) ).addClass(i%2 == 0 ? "ac_even" : "ac_odd").appendTo(list)[0];
			$.data(li, "ac_data", data[i]);
		}
		listItems = list.find("li");
		if ( options.selectFirst ) {
			listItems.slice(0, 1).addClass(CLASSES.ACTIVE);
			active = 0;
		}
		// apply bgiframe if available
		if ( $.fn.bgiframe )
			list.bgiframe();
	}
	
	return {
		display: function(d, q) {
			init();
			data = d;
			term = q;
			fillList();
		},
		next: function() {
			moveSelect(1);
		},
		prev: function() {
			moveSelect(-1);
		},
		pageUp: function() {
			if (active != 0 && active - 8 < 0) {
				moveSelect( -active );
			} else {
				moveSelect(-8);
			}
		},
		pageDown: function() {
			if (active != listItems.size() - 1 && active + 8 > listItems.size()) {
				moveSelect( listItems.size() - 1 - active );
			} else {
				moveSelect(8);
			}
		},
		hide: function() {
			element && element.hide();
			listItems && listItems.removeClass(CLASSES.ACTIVE);
			active = -1;
		},
		visible : function() {
			return element && element.is(":visible");
		},
		current: function() {
			return this.visible() && (listItems.filter("." + CLASSES.ACTIVE)[0] || options.selectFirst && listItems[0]);
		},
		show: function() {
			var offset = $(input).offset();
			element.css({
				width: typeof options.width == "string" || options.width > 0 ? options.width : $(input).width(),
				top: offset.top + input.offsetHeight,
				left: offset.left
			}).show();
            if(options.scroll) {
                list.scrollTop(0);
                list.css({
					maxHeight: options.scrollHeight,
					overflow: 'auto'
				});
				
                if($.browser.msie && typeof document.body.style.maxHeight === "undefined") {
					var listHeight = 0;
					listItems.each(function() {
						listHeight += this.offsetHeight;
					});
					var scrollbarsVisible = listHeight > options.scrollHeight;
                    list.css('height', scrollbarsVisible ? options.scrollHeight : listHeight );
					if (!scrollbarsVisible) {
						// IE doesn't recalculate width when scrollbar disappears
						listItems.width( list.width() - parseInt(listItems.css("padding-left")) - parseInt(listItems.css("padding-right")) );
					}
                }
                
            }
		},
		selected: function() {
			var selected = listItems && listItems.filter("." + CLASSES.ACTIVE).removeClass(CLASSES.ACTIVE);
			return selected && selected.length && $.data(selected[0], "ac_data");
		},
		emptyList: function (){
			list && list.empty();
		},
		unbind: function() {
			element && element.remove();
		}
	};
};

$.fn.selection = function(start, end) {
	if (start !== undefined) {
		return this.each(function() {
			if( this.createTextRange ){
				var selRange = this.createTextRange();
				if (end === undefined || start == end) {
					selRange.move("character", start);
					selRange.select();
				} else {
					selRange.collapse(true);
					selRange.moveStart("character", start);
					selRange.moveEnd("character", end);
					selRange.select();
				}
			} else if( this.setSelectionRange ){
				this.setSelectionRange(start, end);
			} else if( this.selectionStart ){
				this.selectionStart = start;
				this.selectionEnd = end;
			}
		});
	}
	var field = this[0];
	if ( field.createTextRange ) {
		var range = document.selection.createRange(),
			orig = field.value,
			teststring = "<->",
			textLength = range.text.length;
		range.text = teststring;
		var caretAt = field.value.indexOf(teststring);
		field.value = orig;
		this.selection(caretAt, caretAt + textLength);
		return {
			start: caretAt,
			end: caretAt + textLength
		}
	} else if( field.selectionStart !== undefined ){
		return {
			start: field.selectionStart,
			end: field.selectionEnd
		}
	}
};

})(jQuery);

