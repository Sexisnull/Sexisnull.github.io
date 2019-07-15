var h = location.href;
if(0 == h.indexOf('http:\/\/nmap.com.cn')){
	location.replace( h.replace('http:\/\/nmap.com.cn','http:\/\/www.nmap.com.cn') );
}

//*********************************************************
// 目的：    设置当前标签样式
// 输入：    无
// 返回：    无
//*********************************************************
function SetCurrentPage(){
	var h = location.href
	var obj = document.getElementById("menu").getElementsByTagName("a");	//get menus
	for(var i=0; i<obj.length; ++i){
		if(h == obj[i].href) {
			//console.log('got it')
			obj[i].parentElement.className += "current_page_item";
			obj[i].href = "javascript:void(0)";
			obj[i].style.cursor = "default";
			/*if( IsNarrowScreen()) {
				$(obj[i]).css('font-weight','bold');
			}*/
			break;
		}	//end if
	}	//end for	
	//$('#menus').css('display','block');
}