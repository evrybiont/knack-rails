(function($){

  var doc = window.document,
      DOM = function(){
        return{
          html:  doc.documentElement,
          body:  doc.body,
          title: doc.title,
          projector: $('#projector')[0]
        };
      },
      _settings = null,
      _data = null,
      html = DOM().html,
      _htmlImages = null,
      _thumbs = null,
      busyMenuSpace = 145,
      supportFullScreen = (html.requestFullscreen ||
                           html.msRequestFullscreen ||
                           html.mozRequestFullScreen ||
                           html.webkitRequestFullScreen),
      exitFullScreen = (doc.exitFullscreen ||
                        doc.msExitFullscreen ||
                        doc.mozCancelFullScreen ||
                        doc.webkitCancelFullScreen);

  var fullScreen = {
    active: false,

    timeout: null,

    activePanel: null,

    make: function(){
      supportFullScreen.call(DOM().projector);
    },

    exit: function(){
      exitFullScreen.call(doc);
    },

    fadeOut: function(){
      clearTimeout(fullScreen.timeout);
      fullScreen.active = false;
      $('#projector').unbind('mousemove');
      $('.menu-area').unbind();
      $('.menu-area').show();
      $('.stage-area').dblclick(fullScreen.make);
      $('.fullscreen').bind('click', fullScreen.make);
    },

    mouseOver: function(){
      $('.menu-area').hover(function(){
        clearTimeout(fullScreen.timeout);
        fullScreen.activePanel = true;
      }, function(){
        fullScreen.activePanel = false;
      });
    },

    fadeIn: function(){
      fullScreen.active = true;
      $('.fullscreen').bind('click', fullScreen.exit);
      $('.stage-area').dblclick(fullScreen.exit);
      $('.menu-area').hide();
      fullScreen.mouseMove();
      fullScreen.mouseOver();
    },

    mouseMove: function(){
      $('#projector').mousemove(function(){
        clearTimeout(fullScreen.timeout);
        $('.menu-area').show();

        if (!fullScreen.activePanel){
          fullScreen.timeout = setTimeout(function(){
            $('.menu-area').hide();
          }, _settings.menuArea);
        }
      });
    },

    handler: function(){
      $(".fullscreen, .stage-area").unbind();
      $('.fullscreen').toggleClass('exit');
      $('.thumbs-area').toggleClass('full-thumbs');

      if (fullScreen.active){
        fullScreen.fadeOut();
      } else {
        fullScreen.fadeIn();
      }

    },

    bind: function(){
      $('.fullscreen').click(fullScreen.make);
      $('.stage-area').dblclick(fullScreen.make);
      doc.addEventListener('fullscreenchange', fullScreen.handler, false);
      doc.addEventListener('MSFullscreenChange', fullScreen.handler, false);
      doc.addEventListener('mozfullscreenchange', fullScreen.handler, false);
      doc.addEventListener('webkitfullscreenchange', fullScreen.handler, false);
    }
  };

  var loader = {
    show: function(){
      $('.stage-area').toggle();
      $('.loader').show();
    },

    hide: function(){
      setTimeout(function(){
        $('.stage-area').toggle();
        $('.loader').hide();
      }, 500);
    }
  };

  var _counter = {
    index: 0,

    update: function(){
      $('.current').html(_counter.index + 1);
    }
  };

  var _info = {
    update: function(){
      $('.info').html(_data[_counter.index][1] || '');
    }
  };

  var arrowsEvents = {
    right: function(){
      var activeImage = $('.on');
      _counter.index +=1;

      if (!_htmlImages.eq(_counter.index).length){
        _counter.index = 0;
      }

      _htmlImages.eq(_counter.index).toggleClass('off on');
      activeImage.toggleClass('on off');

      _counter.update();
      _info.update();
    },

    left: function(){
      var activeImage = $('.on');

      if (_counter.index) {
        _counter.index -=1
      }else{
        _counter.index = _htmlImages.length -1
      }

      _htmlImages.eq(_counter.index).toggleClass('off on');
      activeImage.toggleClass('on off');

      _counter.update();
      _info.update();
    },

    toggle: function(){
      $('.left-arrow, .right-arrow').toggle();
    },

    bind: function(){
      $('.right-arrow').bind('click', arrowsEvents.right);
      $('.left-arrow').bind('click', arrowsEvents.left);
      $('.arrows-area').mouseenter(arrowsEvents.toggle).mouseleave(arrowsEvents.toggle);
    }
  };

  var keyboard = {
    bind: function(){
      $('#projector').keydown(function(e){
        if (!autoPlay.active){
          switch (e.keyCode){
            case 39:
              arrowsEvents.right();
              break;
            case 37:
              arrowsEvents.left();
              break;
          }
        }
      });
    }
  };

  var autoPlay = {
    images: null,

    activeImage: null,

    active: false,

    startPoint: null,

    toggle: function(){
      $('.play').unbind();
      $('.play').toggleClass('stop');
      $('.arrows-area').toggle();
      $('.thumbs-area').hide();

      if($('.stop').length){
        $('.stop').click(autoPlay.stop);
      }else{
        autoPlay.bind();
      }
    },

    timer: null,

    update: function(){
      autoPlay.activeImage = $('.on');

      if (_counter.index < _data.length-1){_counter.index += 1}
      else{_counter.index = 0}

      autoPlay.images.eq(_counter.index).toggleClass('off on');
      autoPlay.activeImage.toggleClass('on off');
      _counter.update();
      _info.update();

      if (_counter.index == autoPlay.startPoint){autoPlay.active = false}
      if(!autoPlay.active){autoPlay.toggle()}
    },

    delay: function(){
      autoPlay.update();

      if (autoPlay.active){
        autoPlay.timer = setTimeout(function(){
          autoPlay.delay();
        }, _settings.autoPlay);
      }
    },

    play: function(){
      autoPlay.toggle();
      autoPlay.images = $('.stage-area').children();
      autoPlay.active = true;
      autoPlay.startPoint = _counter.index;
      autoPlay.delay();
    },

    stop: function(){
      autoPlay.active = false;
      autoPlay.toggle();
      clearTimeout(autoPlay.timer);
    },

    bind: function(){
      $('.play').click(autoPlay.play);
    }
  };

  var thumblink = {
    toggle: function(){
      $('.thumbs-area').toggle();
    },

    update: function(){
      $('.active-thumb').toggleClass('active-thumb');
      _thumbs.eq(_counter.index).addClass('active-thumb');
    },

    setImage: function(){
      var activeImage = $('.on');

      _counter.index = $(this).index();
      _htmlImages.eq(_counter.index).toggleClass('off on');
      activeImage.toggleClass('on off');

      _counter.update();
      _info.update();
      thumblink.toggle();
    },

    bind: function(){
      $('.thumb').click(function(){
        if (autoPlay.active){autoPlay.stop()}
        thumblink.update();
        thumblink.toggle();
      });
      $('.thumb-image').click(thumblink.setImage);
    }
  }

  var draggable = {
    curDown: false,

    curYPos: 0,

    mouseDown: function(e){
      draggable.curDown = true;
      draggable.curYPos = e.pageY;
    },

    mouseUp: function(){
      draggable.curDown = false;
    },

    mouseMove: function(e){
      if(draggable.curDown === true){
        $('.thumbs-box').scrollTop($('.thumbs-box').scrollTop() + (draggable.curYPos - e.pageY));
      }
    },

    bind: function(){
      $('img, div').disableSelection();
      $('.thumbs-box').mousedown(draggable.mouseDown)
                      .mouseup(draggable.mouseUp)
                      .mousemove(draggable.mouseMove);
    }
  };

  var projector = {
    change: function(){
      $('.info-box').width($('#projector').width() - busyMenuSpace);
    },

    bind: function(){
      $(window).resize(projector.change);
    }
  };

  var events = {
    bind: function(){
      fullScreen.bind();
      arrowsEvents.bind();
      autoPlay.bind();
      keyboard.bind();
      thumblink.bind();
      draggable.bind();
      projector.bind();
    }
  };

  var mainScope = {
    init: function(options){
      graphicScope.init.apply(this, options);
      _htmlImages = $('.stage-area').children();
      _thumbs = $('.thumbs-box').children();
      events.bind();
      loader.hide();

      return this;
    }
  };

  var graphicScope = {
    init: function(options){
      graphicScope.prepareProjector();
      graphicScope.prepareThumbsArea();
      graphicScope.prepareStageArea();
      graphicScope.prepareArrows();
      graphicScope.prepareMenuArea();
    },

    prepareProjector: function(){
      attrScope.init();

      $('#'+ _settings.id).append('<div class="thumbs-area"><div class="thumbs-box">');
      $('#'+ _settings.id).append('<div class="stage-area">');
      $('#'+ _settings.id).append('<div class="arrows-area">');
      $('#'+ _settings.id).append('<div class="loader">');
      $('#'+ _settings.id).append('<div class="menu-area">');

      loader.show();
    },

    prepareThumbsArea: function(){
      var className = 'active-thumb';

      $.each(_settings.data, function(_,v){
        $('.thumbs-box').append("<div class='" + className + "'><img src='" + v[0] + "' class='image'>");
        className = 'thumb-image';
      });

      $('.active-thumb').addClass('thumb-image');
    },

    prepareStageArea: function(){
      var className = 'on';

      $.each(_settings.data, function(_,v){
        $('.stage-area').append("<img src='" + v[0] + "' class=" + className + ">");
        className = 'off';
      });
    },

    prepareArrows: function(){
      $('.arrows-area').append('<span class="left-arrow hidden">');
      $('.arrows-area').append('<span class="right-arrow hidden">');
    },

    addFullScreen: function(){
      $('.menu-area').append('<div class="fullscreen">');
    },

    addThumbs: function(){
      $('.menu-area').append('<div class="thumb-box">');
      $('.thumb-box').append('<span class="thumb">');
    },

    addCounter: function(){
      $('.menu-area').append('<div class="counter">');
      $('.counter').append('<span class="current">' + 1);
      $('.counter').append('<span class="total"> / ' + _data.length);
    },

    addInfo: function(){
      $('.menu-area').append('<div class="info-box">');
      $('.info-box').append('<div class="info">' + (_data[0][1] || ''));
      $('.info-box').width($('#projector').width() - busyMenuSpace);
    },

    addPlayer: function(){
      $('.menu-area').append('<div class="play-box">');
      $('.play-box').append('<span class="play">');
    },

    prepareMenuArea: function(){
      graphicScope.addFullScreen();
      graphicScope.addThumbs();
      graphicScope.addInfo();
      graphicScope.addCounter();
      graphicScope.addPlayer();
    }
  };

  var attrScope = {
    init: function(){
      $('#' + _settings.id).attr('tabindex', '0');
    }
  };

  $.fn.disableSelection = function(){
    this.attr('unselectable','on')
        .css({'-moz-user-select':'-moz-none',
              '-moz-user-select':'none',
              '-o-user-select':'none',
              '-khtml-user-select':'none',
              '-webkit-user-select':'none',
              '-ms-user-select':'none',
              'user-select':'none'})
        .bind('selectstart', function(){return false;});
  };

  $.fn.knack = function(options, method){
    _settings = $.extend({
      'autoPlay': 5000,
      'menuArea': 3000,
      'id': 'projector',
    }, options);

    _data = _settings.data;

    if (_data){
      if (mainScope[method]){}
      else if (!method){return mainScope.init.apply(this, [])}
      else{$.error('Undefined method ' + method + 'for Knack')}
    }
    else{$.error('Please give me your images.')}
  };

})(jQuery);
