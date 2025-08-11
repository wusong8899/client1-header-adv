import { extend } from 'flarum/extend';
import app from 'flarum/app';
import HeaderPrimary from 'flarum/forum/components/HeaderPrimary';

import Swiper from 'swiper';
import { EffectCoverflow, Navigation, Pagination, Autoplay} from "swiper";

const checkTime = 10;
let tronscanListLoading = false;
let tronscanList = null;
let linksQueueListLoading = false;
let linksQueueList = null;
let linksQueuePointer = 0;
let buttonsCustomizationListLoading = false;
let buttonsCustomizationList = null;
const isMobileView = mobileCheck();

app.initializers.add('wusong8899-client1-header-adv', () => {
    extend(HeaderPrimary.prototype, 'view', function (vnode) {
        const routeName = app.current.get('routeName');

        if(routeName){
            if(routeName!=="tags"){

            }else{
                attachAdvertiseHeader(vnode);
            }
        }
    });

    // extend(HeaderPrimary.prototype, 'oncreate', function (vnode) {
    //     $("#app .App-content").append($("#customFooter"));
    // });
});

function mobileCheck() {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

function parseTronscanResults(results){
    tronscanList = [];
    [].push.apply(tronscanList, results);
    return results;
}

function loadTronscanList(){
    if(tronscanListLoading===false){
        tronscanListLoading = true;
        return app.store
            .find("syncTronscanList")
            .catch(() => {})
            .then(parseTronscanResults.bind(this));
    }
}

function parseButtonsCustomizationResults(results){
    buttonsCustomizationList = [];
    [].push.apply(buttonsCustomizationList, results);
    return results;
}

function loadButtonsCustomizationList(){
    if(buttonsCustomizationListLoading===false){
        buttonsCustomizationListLoading = true;
        return app.store
          .find("buttonsCustomizationList")
          .catch(() => {})
          .then(parseButtonsCustomizationResults.bind(this));
    }
}

function parseLinksQueueResults(results) {
    linksQueueList = [];
    [].push.apply(linksQueueList, results);
    return results;
}

function loadLinksQueueList() {
    if(linksQueueListLoading===false){
        linksQueueListLoading = true;
        return app.store
            .find("linksQueueList")
            .catch(() => {})
            .then(parseLinksQueueResults.bind(this));
    }
}

function changeCategoryLayout(){
    const tagTile = $(".TagTile");

    if($("#swiperTagContainer").length===0){
        let swiperContainer = document.createElement("div");
        swiperContainer.className = "swiperTagContainer";
        swiperContainer.id = "swiperTagContainer";

        let swiper = document.createElement("div");
        swiper.className = "swiper tagSwiper";

        let TagTextOuterContainer = document.createElement("div");
        TagTextOuterContainer.className = "TagTextOuterContainer";

        swiperContainer.appendChild(TagTextOuterContainer);
        TagTextOuterContainer.appendChild(swiper);

        let swiper_wrapper = document.createElement("div");
        swiper_wrapper.className = "swiper-wrapper";
        swiper_wrapper.id = "swiperTagWrapper";
        swiper.appendChild(swiper_wrapper);

        for(let i=0;i<tagTile.length;i++){
            let tag = tagTile[i];
            let tagURL = $(tag).find("a").attr("href")
            let tagBackground = $(tag).css("background");
            let tagName = $(tag).find(".TagTile-name").text();
            let tagNameColor = $(tag).find(".TagTile-name").css("color");
            let tagDesc = $(tag).find(".TagTile-description").text();
            let tagDescColor = $(tag).find(".TagTile-description").css("color");

            if(tagName==="Review"){
                // tagBackground = "url(https://k-img.picimgfield.com/live/image/games/psh_mysterymissiontothemoon-en-US.png);";
            }

            let swiper_slide = document.createElement("div");
            swiper_slide.className = "swiper-slide swiper-slide-tag";
            swiper_slide.innerHTML = "<a href='"+tagURL+"'><div class='"+(isMobileView?'swiper-slide-tag-inner-mobile':'swiper-slide-tag-inner')+"' style='background:"+tagBackground+";background-size: cover;background-position: center;background-repeat: no-repeat;'><div style='font-weight:bold;font-size:14px;color:"+tagNameColor+"'>"+tagName+"</div></div></a>";

            swiper_wrapper.appendChild(swiper_slide);
        }

        $("#content .container .TagsPage-content").prepend(swiperContainer);
        $(TagTextOuterContainer).prepend("<div class='TagTextContainer'><div class='TagTextIcon'></div>中文玩家社区资讯</div>");
        $(TagTextOuterContainer).append('<div style="text-align:center;padding-top: 10px;"><button class="Button Button--primary" type="button" style="font-weight: normal !important; color:#ffa000; background: #1a1d2e !important;border-radius: 2rem !important;"><div style="margin-top: 5px;" class="Button-label"><img onClick="window.open(\'https://kick.com/wangming886\', \'_blank\')" style="width: 32px;" src="https://mutluresim.com/images/2023/04/10/KcgSG.png"><img onClick="window.open(\'https://m.facebook.com\', \'_blank\')" style="width: 32px;margin-left: 20px;" src="https://mutluresim.com/images/2023/04/10/KcF6i.png"><img onClick="window.open(\'https://twitter.com/youngron131_\', \'_blank\')" style="width: 32px;margin-left: 20px;" src="https://mutluresim.com/images/2023/04/10/KcDas.png"><img onClick="window.open(\'https://m.youtube.com/@ag8888\',\'_blank\')" style="width: 32px;margin-left: 20px;" src="https://mutluresim.com/images/2023/04/10/KcQjd.png"><img onClick="window.open(\'https://www.instagram.com/p/CqLvh94Sk8F/?igshid=YmMyMTA2M2Y=\', \'_blank\')" style="width: 32px;margin-left: 20px;" src="https://mutluresim.com/images/2023/04/10/KcBAL.png"></div></button></div>');
        // $("#content .container .TagsPage-content").append("<iframe style='width: 110%;border: 0;height: 500px;margin-top: 30px;margin-left: -20px;' name='contentOnly' src='https://lg666.cc/biddingRank'></iframe>");
        $(".TagTiles").remove();

        if(isMobileView===true){
            $("#app").css("overflow-x","hidden");
            $(".App-content").css("min-height","auto");
            $(".App-content").css("background","");
        }

        new Swiper(".tagSwiper", {
            loop:true,
            spaceBetween: isMobileView?90:10,
            slidesPerView: isMobileView?2:7,
            autoplay: {
              delay: 3000,
              disableOnInteraction: false,
            },
            modules: [Autoplay]
          });

        addTronscan();
    }
}

function addTronscan(){
    let TronscanTextContainer = document.getElementById("TronscanTextContainer");

    if(TronscanTextContainer===null){
        TronscanTextContainer = document.createElement("div");
        TronscanTextContainer.id = "TronscanTextContainer";
        TronscanTextContainer.innerHTML = "<div class='TronscanTextIcon'></div>知名博彩公司USDT/TRC公开链钱包额度";
        TronscanTextContainer.className = "TronscanTextContainer";
        $("#swiperTagContainer").append(TronscanTextContainer);

        let swiper = document.createElement("div");
        swiper.className = "swiper tronscanSwiper";
        $("#swiperTagContainer").append(swiper);

        let swiper_wrapper = document.createElement("div");
        swiper_wrapper.className = "swiper-wrapper";
        swiper.appendChild(swiper_wrapper);

        for(let i=0;i<tronscanList.length;i++){
            let tronscanData = tronscanList[i];
            let tronscanName = tronscanData.name();
            let tronscanValueUsd = parseInt(tronscanData.valueUsd())+" USD";
            let tronscanBackground = "url("+tronscanData.img()+");";

            let swiper_slide = document.createElement("div");
            swiper_slide.className = "swiper-slide swiper-slide-tag";
            swiper_slide.innerHTML = "<div style='width:100px;height:130px;border-radius: 12px;background: "+tronscanBackground+";background-size: cover;background-position: center;background-repeat: no-repeat;word-break: break-all;'><div style='display:inline-block;position: absolute;top: 56px;height:20px;width:100px;background: rgba(255,255,255,0.5);'></div><div class='tronscanMask'><div style='display: flex;width: 90px;justify-content: center;font-weight: bold;color:#02F78E;font-size:10px;'><span>"+tronscanValueUsd+"</span></div></div></div>";

            swiper_wrapper.appendChild(swiper_slide);
        }

        new Swiper(".tronscanSwiper", {
            loop:true,
            spaceBetween: isMobileView?80:10,
            slidesPerView: isMobileView?4:7,
          });
    }

}

function moveLeaderBoard(){
    $(".item-MoneyLeaderboard").addClass("App-primaryControl");
    $(".item-forum-checkin").parent().append($(".item-MoneyLeaderboard"));
    $(".item-MoneyLeaderboard").css("right","75px");
}

function addButtons(){
    let selectTitleContainer = document.getElementById("selectTitleContainer");

    if(selectTitleContainer===null){
        selectTitleContainer = document.createElement("div");
        selectTitleContainer.id = "selectTitleContainer";
        selectTitleContainer.className = "selectTitleContainer";

        let buttonsCustomization = "";
        let buttonsCustomizationMap = {};
        let totalButtons = 3;
        for(let i=0;i<buttonsCustomizationList.length;i++){
            let buttonsCustomizationData = buttonsCustomizationList[i];
            let buttonsCustomizationName = buttonsCustomizationData.name();
            let buttonsCustomizationIcon = buttonsCustomizationData.icon();
            let buttonsCustomizationColor = buttonsCustomizationData.color();
            let buttonsCustomizationURL = buttonsCustomizationData.url();

            totalButtons++;
            buttonsCustomizationMap[totalButtons] = {url:buttonsCustomizationURL};
            buttonsCustomization+='<button id="client1HeaderButton'+totalButtons+'" number="'+totalButtons+'" type="button" class="u-btn"><i class="'+buttonsCustomizationIcon+'"></i><div class="u-btn-text">'+buttonsCustomizationName+'</div></button>';
        }

        let selectTitle = document.createElement("div");
        selectTitle.className = "selectTitle";
        selectTitle.innerHTML = '<div class="switch-btns" style="max-width:'+$(".TagsPage-content").width()+'px"><div class="btns-container"><button id="client1HeaderButton0" type="button" class="u-btn" number="0"><i class="fas fa-paw"></i><div class="u-btn-text">论坛</div></button><button id="client1HeaderButton1" number="1" type="button" class="u-btn"><i class="fab fa-twitch"></i><div class="u-btn-text">直播</div></button><button id="client1HeaderButton2" number="2" type="button" class="u-btn"><i class="fas fa-dice"></i><div class="u-btn-text">游戏</div></button><button id="client1HeaderButton3" number="3" type="button" class="u-btn"><i class="fas fa-gifts"></i><div class="u-btn-text">商城</div></button>'+buttonsCustomization+'<div id="buttonSelectedBackground" class="selected-bg" style="left: 0px; top: 0px; opacity: 1;"></div></div></div>';  
        selectTitleContainer.appendChild(selectTitle);

        $("#content .TagsPage-content").prepend(selectTitleContainer);

        const eventType = isMobileView?"touchend":"click";
        let leftValuePrev = 0;
        let leftValueMap = {};
        let leftModifier = isMobileView?3:0;

        leftValueMap[0] = 0;
        for(let i=0;i<totalButtons;i++){
            let leftValue = $("#client1HeaderButton"+i).outerWidth();
           
            if(i===1 || i===2){
                continue;
            }

            if(i===0){
                $("#buttonSelectedBackground").width(leftValue);
            }

            leftValueMap[i+1] = leftValue+leftValuePrev-leftModifier;
            leftValuePrev += leftValue;
        }

        $('.u-btn').on(eventType, function(){
            const number = parseInt($(this).attr('number'));
            let zhiboIframe = document.getElementById("zhiboIframe");

            $(".App").css("min-height","100vh");

            if(number===0){
                $(".swiperTagContainer").css("display","");
                $(".zhiboContainer").css("display","none");
                $(".youxiContainer").css("display","none");
                $(".buttonCustomizationContainer").css("display","none");
                $(".shangchengContainer").css("display","none");
                $(".App").css("min-height","50vh");
                zhiboIframe.src = "";
            }else if(number===1){
                $(".swiperTagContainer").css("display","none");
                $(".zhiboContainer").css("display","inline-block");
                $(".youxiContainer").css("display","none");
                $(".buttonCustomizationContainer").css("display","none");
                $(".shangchengContainer").css("display","none");

                const iframeHeight = window.innerHeight-$("#app-navigation").outerHeight()-$(".selectTitleContainer").outerHeight()-$("#linksQueuePrev").outerHeight();
                $("#zhiboIframe").css("height",iframeHeight+"px");

                if(linksQueueList[linksQueuePointer]){
                    let linksQueueURL = linksQueueList[linksQueuePointer].attribute("links");

                    if(zhiboIframe.src!==linksQueueURL){
                        zhiboIframe.src = linksQueueURL;
                    }
                }
            }else if(number===2){
                $(".swiperTagContainer").css("display","none");
                $(".zhiboContainer").css("display","none");
                $(".youxiContainer").css("display","flex");
                $(".buttonCustomizationContainer").css("display","none");
                $(".shangchengContainer").css("display","none");
                zhiboIframe.src = "";
            }else if(number===3){
                $(".swiperTagContainer").css("display","none");
                $(".zhiboContainer").css("display","none");
                $(".youxiContainer").css("display","none");
                $(".buttonCustomizationContainer").css("display","none");
                $(".shangchengContainer").css("display","flex");
                zhiboIframe.src = "";
            }else{
                const customButtonData = buttonsCustomizationMap[number];

                if(customButtonData){
                    let iframeHeight = window.innerHeight-$("#app-navigation").outerHeight()-$(".selectTitleContainer").outerHeight()-$("#linksQueuePrev").outerHeight();
                    let paddingBottom = 0;
                    let scrolling = "yes";
                    let containerHeight = $(".swiperTagContainer").css("height");

                    if(number==5){
                        iframeHeight = 550;
                        containerHeight = 550;
                    }else if(number==6){
                        iframeHeight = containerHeight = 380;
                        scrolling = "no";
                    }else if(number==7){
                        paddingBottom = 20;
                    }else if(number==8){
                        paddingBottom = 20;
                    }

                    $(".buttonCustomizationContainer").css("padding-bottom",paddingBottom+"px");
                    $("#customButtonIframe").css("padding-bottom",paddingBottom+"px");
                    $('#customButtonIframe').attr("scrolling",scrolling);

                    $(".buttonCustomizationContainer").css("height",containerHeight+"px");
                    $("#customButtonIframe").css("height",iframeHeight+"px");

                    let customButtonIframe = document.getElementById("customButtonIframe");
                    $(".swiperTagContainer").css("display","none");
                    $(".zhiboContainer").css("display","none");
                    $(".youxiContainer").css("display","none");
                    $(".buttonCustomizationContainer").css("display","inline-block");
                    $(".shangchengContainer").css("display","none");

                    customButtonIframe.src = customButtonData.url;
                }
            }

            $("#buttonSelectedBackground").width($(this).outerWidth());

            if(leftValueMap[number]!==undefined){
                $("#buttonSelectedBackground").css("left",leftValueMap[number]);
            }
        });

    }
}

function addZhiBoContainer(){
    const swiperTagContainerHeight = $(".swiperTagContainer").css("height");

    let zhiboContainer = document.createElement("div");
    zhiboContainer.className = "zhiboContainer";
    zhiboContainer.style.height = $(".swiperTagContainer").css("height");

    const refreshButton = "<div style='padding-top: 0px;padding-bottom: 0px;' class='selectTitle'><div class='switch-btns'><div class='btns-container'><button type='button' class='u-btn'><div id='refreshZhiBoButton' class='u-btn-text'>刷新直播间</div></button><div id='buttonSelectedBackground' class='selected-bg' style='left: 0px; top: 0px; opacity: 1;'></div></div></div></div>";
    const prevButton = "<div style='padding-top: 0px;padding-bottom: 0px;' class='selectTitle'><div class='switch-btns'><div class='btns-container'><button type='button' class='u-btn'><div style='color:#666' id='prevZhiBoButton' class='u-btn-text'>上个直播间</div></button><div id='buttonSelectedBackground' class='selected-bg' style='left: 0px; top: 0px; opacity: 1;'></div></div></div></div>";
    const nextButton = "<div style='padding-top: 0px;padding-bottom: 0px;' class='selectTitle'><div class='switch-btns'><div class='btns-container'><button type='button' class='u-btn'><div id='nextZhiBoButton' class='u-btn-text'>切换直播间</div></button><div id='buttonSelectedBackground' class='selected-bg' style='left: 0px; top: 0px; opacity: 1;'></div></div></div></div>";
    zhiboContainer.innerHTML = "<div id='linksQueueRefresh' style='z-index: 1000;display:inline-block;scale:0.8;position: fixed;bottom: "+(isMobileView?0:-6)+"px;'>"+refreshButton+"</div><div class='zhiboSubContainer'><div id='linksQueuePrev' style='display:inline-block;scale:0.8'>"+prevButton+"</div><div id='linksQueueNext' style='display:inline-block;scale:0.8'>"+nextButton+"</div></div><iframe id='zhiboIframe' name='contentOnly' class='zhiboIframe' src=''></iframe>";

    $("#content .TagsPage-content").prepend(zhiboContainer);

    const eventType = isMobileView?"touchend":"click";
    let zhiboIframe = document.getElementById("zhiboIframe");

    $('#linksQueueRefresh').on(eventType, function(){
        zhiboIframe.src = "";

        setTimeout(function(){
            let linksQueueURL = linksQueueList[linksQueuePointer].attribute("links");
            zhiboIframe.src = linksQueueURL;
        },100)
    });

    $('#linksQueuePrev').on(eventType, function(){

        linksQueuePointer--;

        if(linksQueueList[linksQueuePointer]!==undefined){
            let linksQueueURL = linksQueueList[linksQueuePointer].attribute("links");
            zhiboIframe.src = linksQueueURL;
        }

        $("#nextZhiBoButton").css("color","");
        if(linksQueueList[linksQueuePointer-1]===undefined){
            $("#prevZhiBoButton").css("color","#666");
        }else{
            $("#prevZhiBoButton").css("color","");
        }
    });

    $('#linksQueueNext').on(eventType, function(){
        linksQueuePointer++;

        if(linksQueueList[linksQueuePointer]!==undefined){
            let linksQueueURL = linksQueueList[linksQueuePointer].attribute("links");
            zhiboIframe.src = linksQueueURL;
        }

        $("#prevZhiBoButton").css("color","");
        if(linksQueueList[linksQueuePointer+1]===undefined){
            $("#nextZhiBoButton").css("color","#666");
        }else{
            $("#nextZhiBoButton").css("color","");
        }
    });
}

function addButtonCustomizationContainer(){
    const swiperTagContainerHeight = $(".swiperTagContainer").css("height");

    let buttonCustomizationContainer = document.createElement("div");
    buttonCustomizationContainer.className = "buttonCustomizationContainer";
    buttonCustomizationContainer.style.height = $(".swiperTagContainer").css("height");
    buttonCustomizationContainer.innerHTML = "<iframe id='customButtonIframe' name='contentOnly' class='customButtonIframe' src=''></iframe>"

    $("#content .TagsPage-content").prepend(buttonCustomizationContainer);
}

function addYouXiContainer(){
    const swiperTagContainerHeight = $(".swiperTagContainer").css("height");

    let youxiContainer = document.createElement("div");
    youxiContainer.className = "youxiContainer";
    youxiContainer.style.height = $(".swiperTagContainer").css("height");
    youxiContainer.innerText = app.translator.trans("wusong8899-client1.forum.under-construction");

    $("#content .TagsPage-content").prepend(youxiContainer);
}

function addShangChengContainer(){
    const swiperTagContainerHeight = $(".swiperTagContainer").css("height");

    let shangchengContainer = document.createElement("div");
    shangchengContainer.className = "shangchengContainer";
    shangchengContainer.style.height = $(".swiperTagContainer").css("height");
    shangchengContainer.innerText = app.translator.trans("wusong8899-client1.forum.under-construction");

    $("#content .TagsPage-content").prepend(shangchengContainer);
}

function addHeaderIcon(){
    let headerIconContainer = document.getElementById("wusong8899Client1HeaderIcon");

    if(headerIconContainer===null){
        headerIconContainer = document.createElement("div");
        headerIconContainer.id = "wusong8899Client1HeaderIcon";
        headerIconContainer.style.display = 'inline-block';
        headerIconContainer.style.marginTop = '8px';
        headerIconContainer.innerHTML = '<img src="https://lg666.cc/assets/files/2023-01-18/1674049401-881154-test-16.png" style="height: 24px;" />';

        $("#app-navigation").find(".App-backControl").prepend(headerIconContainer);
    }
}

function attachAdvertiseHeader(vdom: Vnode<any>): void {
    if(isMobileView){
        $(".item-newDiscussion").find("span.Button-label").html("<div class='buttonRegister'>登录</div>");
        $(".item-newDiscussion").find("span.Button-label").css("display","block");
        $(".item-newDiscussion").find("span.Button-label").css("font-size","14px");
        $(".item-newDiscussion").find("span.Button-label").css("word-spacing","-1px");
    }

    $(".item-newDiscussion").find("i").css("display","none");
    $(".item-nav").remove();
    $(".TagTiles").css("display","none");

    let task = setInterval(function(){
        if(vdom.dom){
            clearInterval(task);

            if(vdom.dom!==undefined){
                let TransitionTime = app.forum.attribute('Client1HeaderAdvTransitionTime');

                if(!TransitionTime){
                    TransitionTime = 5000;
                }

                let screenWidth = $(window).width();
                let styleWidth = screenWidth*2-50;

                let swiperContainer = document.getElementById("swiperAdContainer");

                if(swiperContainer!==null){
                    return;
                }

                swiperContainer = document.createElement("div");
                swiperContainer.className = "swiperAdContainer";
                swiperContainer.id = "swiperAdContainer";

                if(isMobileView===true){
                    swiperContainer.style.width = styleWidth+"px";
                    swiperContainer.style.marginLeft = -(styleWidth*0.254)+"px";
                }

                let swiper = document.createElement("div");
                swiper.className = "swiper adSwiper";
                swiperContainer.appendChild(swiper);

                let swiper_wrapper = document.createElement("div");
                swiper_wrapper.className = "swiper-wrapper";
                swiper.appendChild(swiper_wrapper);

                for(let i=1;i<=30;i++){
                    let swiper_slide = document.createElement("div");
                    let imageSrc = app.forum.attribute('Client1HeaderAdvImage'+i);
                    let imageLink = app.forum.attribute('Client1HeaderAdvLink'+i);

                    if(imageSrc){
                        swiper_slide.className = "swiper-slide";
                        swiper_slide.innerHTML = "<img onclick='window.location.href=\""+imageLink+"\"' src='"+imageSrc+"' />";
                        swiper_wrapper.appendChild(swiper_slide);
                    }
                }

                let swiper_button_next = document.createElement("div");
                swiper_button_next.className = "swiper-button-next";
                swiper.appendChild(swiper_button_next);

                let swiper_button_prev = document.createElement("div");
                swiper_button_prev.className = "swiper-button-prev";
                swiper.appendChild(swiper_button_prev);

                let swiper_pagination = document.createElement("div");
                swiper_pagination.className = "swiper-pagination";
                swiper.appendChild(swiper_pagination);

                $("#content .container").prepend(swiperContainer);

                new Swiper(".adSwiper", {
                    autoplay: {
                       delay: TransitionTime,
                     },
                    loop: true,
                    spaceBetween: 30,
                    effect: "coverflow",
                    centeredSlides: true,
                    slidesPerView: 2,
                    coverflowEffect: {
                        rotate: 0,
                        depth: 100,
                        modifier: 1,
                        slideShadows: true,
                        stretch:0
                    },
                    pagination: {
                        el: '.swiper-pagination',
                        type: 'bullets',
                    },
                    navigation: {
                        nextEl: '.swiper-button-next',
                        prevEl: '.swiper-button-prev',
                    },
                    modules: [EffectCoverflow, Navigation, Pagination, Autoplay]
                  });

                loadLinksQueueList();
                loadTronscanList();
                loadButtonsCustomizationList();

                let checkDataTask = setInterval(function(){
                    if(tronscanList!==null && linksQueueList!==null && buttonsCustomizationList!==null){
                        clearInterval(checkDataTask);

                        if($("#swiperTagContainer").length===0){
                            changeCategoryLayout();
                            addZhiBoContainer();
                            addYouXiContainer();
                            addButtonCustomizationContainer();
                            addShangChengContainer();
                            addButtons();
                            moveLeaderBoard();
                        }

                        if(!app.session.user){
                            addHeaderIcon();
                        }
                    }
                },100);
            }
        }
    },checkTime);
}





