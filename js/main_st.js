
/*global $:false */
/*global window: false */

(function(){
  "use strict";

/*-----------------------------------------------------
                    pre loader init
-------------------------------------------------------*/
  $('body').jpreLoader({
    splashID: "#jSplash",
    loaderVPos: '40%',
    autoClose: true
  });
/*-----------------------------------------------------
animation
-------------------------------------------------------*/

$(function ($) {
    //ANIMATED ELEMENTS TRIGGERING
 if (!device.tablet() && !device.mobile()){
      
        $('.animated').appear(function() {
         $(this).each(function(){ 
            $(this).css('visibility','visible');
            $(this).addClass($(this).data('fx'));
           });
        },{accY: -200});
       }

       else {
        $('.animated').each(function(){ 
          $(this).removeClass('animated');
       });
       }

}); 
/*-----------------------------------------------------
Viewport Adjuter
-------------------------------------------------------*/
$(function ($) {

    var viewportHeight = $(window).height();
    //$('.splash-section, .autoheight').css('height',viewportHeight);
    $('.splash-section, .autoheight').css('height',viewportHeight/1);
    $('.autoheight-normal').css('height',viewportHeight/1);

              var parent_height = $('.splash-section').height();
              // alert(parent_height);
              var image_height = $('.vertical-center').height();
              var top_margin = (parent_height)/11;
              // normal row
              var parent_height_normal = $('.autoheight').height();
              var top_margin_normal = (parent_height_normal)/5;
              var add_margin_normal = (parent_height_normal)/5;
             
              //center it
              $('.vertical-center').css( 'padding-top', top_margin);
              //uncomment the following if ithe element to be centered is an image
              $('.vertical-center').css( 'margin-top' , top_margin);
              //center it normal
              $('.vertical-center-normal').css( 'padding-top' , top_margin_normal);
              $('.vertical-center-add').css( 'padding-top' , add_margin_normal);
              //uncomment the following if ithe element to be centered is an image
              $('.vertical-center-img-normal').css( 'margin-top' , top_margin_normal);

});

/*-----------------------------------------------------------------------------------*/
/*  MENU
/*-----------------------------------------------------------------------------------*/
function calculateScroll() {
  var contentTop      =   [];
  var contentBottom   =   [];
  var winTop      =   $(window).scrollTop();
  var rangeTop    =   200;
  var rangeBottom =   500;
  $('.navmenu ul').find('.scroll_btn a').each(function(){
    contentTop.push( $( $(this).attr('href') ).offset().top);
    contentBottom.push( $( $(this).attr('href') ).offset().top + $( $(this).attr('href') ).height() );
  })
  $.each( contentTop, function(i){
    if ( winTop > contentTop[i] - rangeTop && winTop < contentBottom[i] - rangeBottom ){
      $('.navmenu li.scroll_btn')
      .removeClass('active')
      .eq(i).addClass('active');      
    }
  })
};
$(document).ready(function() {
  //MobileMenu
  if ($(window).width() < 768){
    $('.top_menu_wrapper').prepend('<a href="javascript:void(0)" class="menu_toggler"><em></em><em></em><em></em></a>');
    $('header .navmenu').hide();
    $('.menu_toggler, .navmenu ul li a').click(function(){
      $('header .navmenu').slideToggle(300);
    });
  }   
  // page
  if ($("#page").hasClass("single_page")) {      
  }
  else {
    $(window).scroll(function(event) {
      calculateScroll();
    });
    $('.navmenu ul li a, .mobile_menu ul li a').click(function() {  
      $('html, body').animate({scrollTop: $(this.hash).offset().top - 79}, 1000);
      return false;
    });
  };
  setInterval(scrolled_menu, 100);
});
// =====stick nav========
function scrolled_menu() {
  if ($(window).scrollTop() > 30) {
    $('header').addClass('fixed_show');
  } else {
    $('header').removeClass('fixed_show');
  }
};
/*-----------------------------------------------------
                 Owl Carousel inits
------------------------------------------------------*/
$(document).ready(function() {
//Homepage Owl
$('#navigation_right').waypoint('sticky');

        $(".owl_head").owlCarousel({
          autoPlay:14000, //Set AutoPlay to 5 seconds
          autoHeight : false,
          singleItem:true,
          navigation: false,
          pagination: false,
        });

      var owl = $(".owl_head");
         // Custom Navigation Events
         $(".next").click(function(){
         owl.trigger('owl.next');
          })
         $(".prev").click(function(){
          owl.trigger('owl.prev');
          })
    // owl team
          $(".owl_price").owlCarousel({
          autoPlay:12000, //Set AutoPlay to 5 seconds
          autoHeight : true,
          singleItem:false,
          navigation: false,
          pagination: true,
          items:2,
          itemsMobile : [1199, 1]

          
        });
    // parallax home owl
          $(".para_owl").owlCarousel({
          autoPlay:5000, //Set AutoPlay to 5 seconds
          autoHeight : false,
          singleItem:true,
          navigation: false,
          pagination: false,
          transitionStyle: 'goDown',
          items:1,
          itemsMobile : [600, 1]

        });
    //client Owl
        $(".owl_client_slider").owlCarousel({
          autoPlay:12000, //Set AutoPlay to 5 seconds
          autoHeight : true,
          singleItem:false,
          navigation: false,
          pagination: true,
          items : 4,
          itemsDesktop : [1199,4],
          itemsDesktopSmall : [979,4]
        });
//Testimonial Owl     
        $(".testimonials_owl").owlCarousel({
          autoPlay:15000, //Set AutoPlay to 5 seconds
          autoHeight : true,
          slideSpeed:400,
          singleItem:true,
          navigation: false,
          pagination: true,
          navigationText: ["",""]
        }); 
//shop Owl     
        $(".shop_owl").owlCarousel({
          autoPlay:15000, //Set AutoPlay to 5 seconds
          autoHeight : true,
          slideSpeed:400,
          singleItem:true,
          navigation: false,
          pagination: true,
          navigationText: ["",""]
        }); 
//blog Owl     
        $(".blog_owl").owlCarousel({
          autoPlay:15000, //Set AutoPlay to 5 seconds
          autoHeight : true,
          slideSpeed:400,
          singleItem:true,
          navigation: false,
          pagination: true,
          navigationText: ["",""]
        }); 
//contact owl     
        $(".contact_owl").owlCarousel({
          autoPlay:false, //Set AutoPlay to 5 seconds
          autoHeight : false,
          slideSpeed:400,
          singleItem:true,
          navigation: false,
          pagination:true,
          navigationText: ["",""],

        afterInit: function(elem){
            $('.contact_owl .contact_item').each(function(){
            var about_txt = $(this).find('.contact-item-name').html();
            var about_order = $(this).find('.contact-item-name').data('order');
            $('.contact_owl .owl-pagination .owl-page:nth-child('+about_order+')').find('span').html(about_txt);
            });
            },

            afterUpdate: function(elem){
            $('.contact_owl .contact_item').each(function(){
              var about_txt = $(this).find('.contact-item-name').html();
              var about_order = $(this).find('.contact-item-name').data('order');
            $('.contact_owl .owl-pagination .owl-page:nth-child('+about_order+')').find('span').html(about_txt);
            });
            },

            });
//item owl     
        $(".sh_item_owl").owlCarousel({
          autoPlay:false, //Set AutoPlay to 5 seconds
          autoHeight : false,
          slideSpeed:400,
          singleItem:true,
          navigation: false,
          pagination:true,
          navigationText: ["",""],

        afterInit: function(elem){
            $('.sh_item_owl .sh_main_item').each(function(){
            var about_txt = $(this).find('.sh-item-name').html();
            var about_order = $(this).find('.sh-item-name').data('order');
            $('.sh_item_owl .owl-pagination .owl-page:nth-child('+about_order+')').find('span').html(about_txt);
            });
            },

            afterUpdate: function(elem){
            $('.sh_item_owl .sh_main_item').each(function(){
              var about_txt = $(this).find('.sh-item-name').html();
              var about_order = $(this).find('.sh-item-name').data('order');
            $('.sh_item_owl .owl-pagination .owl-page:nth-child('+about_order+')').find('span').html(about_txt);
            });
            },

          });

       //shop Owl for releted items    
        $(".related_owl").owlCarousel({
          autoPlay:20000, //Set AutoPlay to 5 seconds
          autoHeight : true,
          slideSpeed:400,
          singleItem:false,
          navigation: false,
          pagination: false,
          items : 4,
          itemsDesktop : [1199,4],
          itemsDesktopSmall : [979,4]
        });  
        var owl = $(".related_owl");
         // Custom Navigation Events
         $(".next-r").click(function(){
         owl.trigger('owl.next');
          })
         $(".prev-r").click(function(){
          owl.trigger('owl.prev');
          })  
});  

/*-----------------------------------------------------
           port nav btn effect
------------------------------------------------------*/ 

$('.port-nav #menu .port-hover').hover(function(){
  $(".port-ico-img i").addClass("icon-color-active");
  // $(".port-nav #menu .sub-menu").fadeIn(800);
  },function(){
  $(".port-ico-img i").removeClass("icon-color-active");
  // $(".port-nav #menu .sub-menu").fadeOut(800);
}); 


// -----------------feather popup---------------
$('.myElement').featherlight({
    targetAttr: 'href',     
    openSpeed: 700,
    closeSpeed: 700
});
// ------------------slick nav mob menu--------------------
$(document).ready(function(){
  $('#menu').slicknav({
   duration :'1000' 
    });
  });
// ---------------------------paraent close-------------------------------------
})();


/*-----------------------------------------------------
                  smooth scroll init
-------------------------------------------------------*/
  (function($) {
    jQuery(document).ready(function($) {
    $(".scroll").click(function(event){ // When a link with the .scroll class is clicked
    event.preventDefault(); // Prevent the default action from occurring
    $('html,body').animate({scrollTop:$(this.hash).offset().top}, 1500, 'easeInSine'); // Animate the scroll to this link's href value
      });
    });
   })(jQuery);