(function($, global) {

	// requestAnimationFrame polyfill 
	// - https://gist.github.com/paulirish/1579671
	var lastTime = 0;
	var vendors = ['ms', 'moz', 'webkit', 'o'];
	for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
	}
 
	if (!window.requestAnimationFrame){
		window.requestAnimationFrame = function(callback, element) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function() { 
				callback(currTime + timeToCall); 
			}, timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};
	}

  if (!window.cancelAnimationFrame) {
  	window.cancelAnimationFrame = function(id) {
  		clearTimeout(id);
  	};
  }
  // end polyfill

	$(document).ready( function() {
		foodly.cacheSelectors();
		foodly.coverImg('.js-img-holder-cover');
		foodly.init();
	});

	$(window).load( function(){
		$('.content-wrapper').css({
			'overflow': 'hidden'
		});
	});

	var foodly = {
		cacheSelectors: function() {
			this.cache = {
				$body : $('body'),
				$cart : $('#cart'),
				$header: $('.header'),
				modalScroll : []
			};
		},

		init: function() {
			this.updateDropdownCart();
			this.initHeader();
			this.initAddToCard('form[action*="cart/add"]');
			this.initChangeQuantity('form[action*="cart"]');
			this.initUpdateCartAjax();
			this.initRecoverPasswordForm('.login-form');
			this.initFormsError();
			this.showTopBar('.fixed-bar');
			this.initDropdown('.js-dropdown');
			
			this.initModalAddresses();
			this.initDropdownScroll('.js-dropdown-scroll');
			this.foldElements('.fold');
			
			this.initToolbar('.collection__toolbar');
			this.initAddToWishlist('.js-wishlist-form');
			this.initActionsWishlist('.js-wishlist');
			this.initDropdownAfterChanageSelector('#address_country', '#address_province');
			this.initDropdownAfterChanageSelector('#AddressCountryNew', '#AddressProvinceNew');
			this.initDropdownAfterChanageSelector('.AddressCountry', '.AddressProvince');
			// this.parallaxScroll('.parallax');
		},

		// Initialization of functions for header
		initHeader: function() {
			// Opening and closing of drawers: mobile menu and shopping cart
			this.drawerOpenClose('.drawer--menu');
			this.drawerOpenClose('.drawer--cart');

			// Collapsing for mobile menu items
			this.collapseSubmenu('.drawer--menu');

			// Add overlay for drawers
			var $overlay = $('<div/>').addClass('overlay');

			$overlay.click(function(){
				$this.closeDrawer($('.drawer'));
			});
			this.cache.$header.append($overlay);

			// Search by clicking on icon
			this.searchOnIconClick();

			// Fixed header
			// this.fixedHeader('.header');

			// Closing dropdowns and search container by clicking on other elements
			this.cache.$body.mousedown(function(e) {
				$target = $(e.target);

				$parentTargetDropdown = $target.closest('.dropdown');
				$openDropdown = $('.dropdown.open');

				$parentTargetSearch = $target.closest('.search-container');
				$openSearch = $('.search-container.open');

				if ( $parentTargetDropdown.length === 0 && $openDropdown.length > 0 ) {
					$openDropdown.removeClass('open');
				} else if ( $parentTargetSearch .length === 0 && $openSearch.length > 0 ) {
				  //added to disable open search bar toggling
                  //$openSearch.removeClass('open');
          $openSearch.children().removeClass('popup-active');
				}
			});
		},

		drawerOpenClose: function(drawer) {
			var $drawer = $(drawer);
		
			if ( $drawer.length === 0 ){
				return 0;
			}

			var $drawerBtnOpen = $drawer.find('.drawer__btn-open');
			var $drawerBtnClose = $drawer.find('.drawer__btn-close');
			var $drawerWrapper = $drawer.find('.drawer__wrapper');

			// Variables for parallax disabling
			var $parallaxBack = this.cache.$body.find('.parallax__back');
			var $parallaxBase = this.cache.$body.find('.parallax__base');
			var $header = this.cache.$body.find('.header');
			var $this = this;

			$drawerBtnOpen.click( function(e) {
				e.preventDefault();
				
				if ( $(window).scrollTop() > 0 ) {
					$('html, body').animate({
						scrollTop: 0
					}, 1000, function(){
						setTimeout(function(){
							$this.openDrawer($drawer);
							// disable parallax
							// $this.dropParallaxCoords($parallaxBack, $parallaxBase);
						}, 450);
					});
				} else {
					$this.openDrawer($drawer);
					// disable parallax
					// $this.dropParallaxCoords($parallaxBack, $parallaxBase);
				}
			});

			$drawerBtnClose.click( function(e) {
				e.preventDefault();

				$this.closeDrawer($drawer);
				// enable parallax
	      // $this.setParallaxCoords($parallaxBack, $parallaxBase, $header);
			});
		},

		openDrawer: function($drawer) {
			if ( $drawer.length === 0 ){
				return 0;
			}

			var $drawerWrapper = $drawer.find('.drawer__wrapper');
			var $fixedBar = $('.fixed-bar');

			$this.cache.$body.addClass('drawer-open');
				
			if ( $drawer.hasClass('close') && $drawerWrapper.length > 0 ) {
				$fixedBar.hide(450);
				$drawer.removeClass('close').addClass('open');
				$drawer.css('zIndex', '8');
				$drawerWrapper.one('webkitTransitionEnd transitionend webkitAnimationEnd oanimationend msAnimationEnd animationend', function showIt() {

				$drawerWrapper.css('display', 'block');
				$drawerWrapper.off('webkitTransitionEnd transitionend webkitAnimationEnd oanimationend msAnimationEnd animationend', showIt);
			});

			} else if ( $drawer.hasClass('close') ) {
				$drawer.removeClass('close').addClass('open');
			}
		},

		closeDrawer: function($drawer) {

			if ( $drawer.length === 0 ){
				return 0;
			}

			var $drawerWrapper = $drawer.find('.drawer__wrapper');
			var $fixedBar = $('.fixed-bar');

			if ( $drawer.hasClass('open') && $drawerWrapper.length > 0 ) {				
				$drawer.removeClass('open').addClass('close');

				$drawerWrapper.one('webkitTransitionEnd transitionend webkitAnimationEnd oanimationend msAnimationEnd animationend', function hideIt() {
					$drawerWrapper.css('display', '');
					$drawer.css('zIndex', '');

					$drawerWrapper.off('webkitTransitionEnd transitionend webkitAnimationEnd oanimationend msAnimationEnd animationend', hideIt);
				});
				
				$fixedBar.show(450);
			} else if ( $drawer.hasClass('open') ) {
				$drawer.removeClass('open').addClass('close');
			}

			$this.cache.$body.removeClass('drawer-open');
		},

		// Collapsing menu items in mobile view
		collapseSubmenu: function(drawer) {
			var $drawer = $(drawer);
		
			if ( $drawer.length === 0 ){
				return 0;
			}

			var collapseToggles = $drawer.find('.js-collapse');

			collapseToggles.click( function(e) {
				e.preventDefault();
				$(this).parent('.has-dropdown').toggleClass('show-dropdown');
			});
		},

		// Search after click on search icon in the header
		searchOnIconClick: function() {
			var $searchContainer = $('.search-container');
			var $searchIcon = $searchContainer.find('.js-icon--search');

			$searchIcon.click(function(){
				$('#header-form').submit();
			});
		},
		
		// Add to cart (click on button "Add to cart")
		initAddToCard: function(forms) {

			var $forms = $(forms);
	
			if ( $forms.length === 0 ){
				return 0;
			}

			var $this = this;

	    var $quantityField;
      
      if ( $forms.hasClass('js-form-cart-alt') ) {
        $quantityField = $forms.find('.quantity-field');
        
        $quantityField.on('click', function(e){
          var $productVisual = $(this).closest('.product-in-cart');
          var target         = e.target;
          var currentTarget  = e.currentTarget;
          var quantityConter = currentTarget.querySelector('.quantity__counter');
          var quantity       = parseInt(quantityConter.innerHTML);
          var variantId      = $productVisual.find('input[name=id]').val();
          
          if ( target.classList.contains('js-down-quantity') || target.parentElement.classList.contains('js-down-quantity') ){
            
            quantity--;
          } else if ( target.classList.contains('js-up-quantity') || target.parentElement.classList.contains('js-up-quantity') ) {
            
            quantity++;
          } else {
            return null;
          }
          
          if ( quantity <= 0 ) {
            $productVisual.removeClass('product-in-cart');
          } else {
          	quantityConter.innerHTML = quantity;
          }
          
          $.ajax({
						type: "post",
						url: "/cart/update.js",
						data: 'updates[' + variantId + ']=' + quantity,
						dataType: 'json',
						success: function(data) {
							$this.doUpdateDropdownCart(data, false);
						}
					});

        });
        
        $forms.submit( function(e) {
					e.preventDefault();
	        $(this).closest('.product__visuals').addClass('product-in-cart');
					var $target = $(e.target);
					var variantId = $target.find('input[name=id]').val();
					var quantity  = $target.find('input[name=quantity]').val() || 1;

					// Ajax update of shopping cart
					$this.doAjaxAddToCart(variantId, quantity, $(this));
				});
      
      } else {
        $forms.submit( function(e) {
					e.preventDefault();
					var $target = $(e.target);
					var variantId = $target.find('input[name=id]').val();
					var quantity  = $target.find('input[name=quantity]').val() || 1;

					// Ajax update of shopping cart
					$this.doAjaxAddToCart(variantId, quantity, $(this));
				});
      }
		},

		// Sending Ajax query to update shopping cart
		doAjaxAddToCart: function(variantId, quantity, $_this_) {

			if ( $_this_.hasClass('wishlist-add-cart') ) {
				var $elementForInsert = $('.table-wrapper');
			} else {
				var $elementForInsert = $_this_.find('.js-add-to-card');
			}

			$.ajax({
				type: "post",
				url: "/cart/add.js",
				data: 'quantity=' + quantity + '&id=' + variantId,
				dataType: 'json',
				beforeSend: function() {
					// Show loading spiner on button
					if ( !$_this_.hasClass('js-messages-disable') ) {
						$elementForInsert.addClass('loading-spiner');
					}
				},
				success: function(msg) {
					foodly.updateDropdownCart();

					// The message when product successfully added to cart
					if ( !$_this_.hasClass('js-messages-disable') ) {
						
						var $formMessage = $_this_.find('.form-cart-message');

						// Show message
						if ( $formMessage.length > 0 && $formMessage.hasClass('hide-message') ) {
							$formMessage.removeClass('hide-message hide').addClass('show-message');
						} else {
							$formMessage = $('<p/>').addClass('form-cart-message show-message').html('The product was successfully added to cart.');
							$elementForInsert.before($formMessage);
						}

						// Hide message
						setTimeout(function() {
							$formMessage.addClass('hide-message').removeClass('show-message');
							$formMessage.one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function addClasses() {
								$formMessage.addClass('hide');
								$formMessage.off('webkitAnimationEnd oanimationend msAnimationEnd animationend', addClasses);
							});
						}, 5000);

						// Hide loading spiner on button
						$elementForInsert.removeClass('loading-spiner');
					}
				},
				error: function(xhr, text) {
					// The error message
					var $formMessage = $_this_.find('.form-cart-message');

					// Show error message
					if ( $formMessage.length > 0 && $formMessage.hasClass('hide-message') ) {
						$formMessage.removeClass('hide-message hide').addClass('show-message form-cart-message--error');
						$formMessage.text($.parseJSON(xhr.responseText).description);
					} else {
						$formMessage = $('<p/>').addClass('form-cart-message form-cart-message--error show-message').text($.parseJSON(xhr.responseText).description);

						$elementForInsert.before($formMessage);
					}

					// Hide error message
					setTimeout(function() {
						$formMessage.addClass('hide-message').removeClass('show-message');
						$formMessage.one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function addClasses() {
							$formMessage.addClass('hide');
							$formMessage.off('webkitAnimationEnd oanimationend msAnimationEnd animationend', addClasses);
						});
					}, 7000);

					// Hide loading spiner on button
					$elementForInsert.removeClass('loading-spiner');
				}
			});
		},

		// Update shopping cart using Shopify object
		updateDropdownCart: function() {
			Shopify.getCart(function(cart) {
				foodly.doUpdateDropdownCart(cart, false);
				
			});
		},

		updateForms: function(cart, removeItemId){
	      var $forms = $('.js-form-cart-alt');
	      
	      if (!cart || $forms.length <= 0 ) {
	        return null;
	      }
	      
	      var variantId, $productVisual, $quantityCounter;
	              
	      for (var i = 0, maxI = $forms.length; i < maxI; i++) {
	        variantId = $($forms[i]).find('input[name=id]').val();
	        
	        $productVisual   = $($forms[i]).closest('.product__visuals');
	        $quantityCounter = $($forms[i]).find('.quantity__counter');
	                
	        for (var j = 0, maxJ = cart.items.length; j < maxJ; j++) {
	          if (removeItemId[0] && removeItemId[0] == variantId && $productVisual.hasClass('product-in-cart') ) {
	            
	            $quantityCounter.text('1');
	            $productVisual.removeClass('product-in-cart');
	          } else if ( removeItemId[0] && removeItemId[0] == cart.items[j].id ) {

	            continue;
	          } else if ( variantId == cart.items[j].id ) {
	            
	            $quantityCounter.text(cart.items[j].quantity);
	            $productVisual.addClass('product-in-cart');
	          }
	        }
	      }
	    },

		// Update shopping cart items
		doUpdateDropdownCart: function(cart, removeItem) {
			// Template for cart item
			var template = '<li class="cart-list__item" id="product-id-{ID}"><div class="cart-list__item--img clearfix"><div class="img-holder img-holder--circle img-holder--circle-sm"><a href="{URL}"><img src="{IMAGE}" alt="{TITLE}"></a></div></div><div class="cart-list__item--title"><a href="{URL}">{TITLE}</a></div><div class="cart-list__item--quantity"><div class="quantity-field"><span class="icon icon--arrow-up js-up-quantity"></span><input id="updates_{ID}" type="number" name="updates[]" min="1" value="{QUANTITY}" size="5"><span class="icon icon--arrow-down js-down-quantity"></span></div></div><div class="cart-list__item--price"><span class="money">{PRICE}</span></div><div class="cart-list__item--remove"><a href="javascript:void(0)" class="js-cart-item-remove"><span class="icon icon--delete"></span></a></div></li>';

			// Template for special packaging
			var specialPackTemplate = '<div class="cart-list__item cart-list__item--special" id="product-id-{ID}"><div class="cart-list__item--img clearfix"><div class="img-holder img-holder--circle img-holder--circle-sm"><img src="{IMAGE}" alt="{TITLE}"></div></div><div class="cart-list__item--title">{TITLE}</div><div class="cart-list__item--quantity-special"></div><div class="cart-list__item--price"><span class="money">{PRICE}</span></div><div class="cart-list__item--remove"><a href="javascript:void(0)" class="js-cart-item-remove"></a></div></div>';

			var specialPack = false;
			var specialPackID = this.cache.$cart.find('.cart-list__item--special').attr('id');
			var $this = this;
			var $cartContainer = this.cache.$cart.find('.cart');
			var $cartForm = $cartContainer.find('#cart-form');
			var $cartEmpty = $cartContainer.find('.cart-empty');
			var $cartCount = this.cache.$cart.find('#cartCount');
			var $cartHeader = $this.cache.$cart.find('.cart-header');

			if ( specialPackID ) {
				specialPackID = specialPackID.match(/\d+/g);
			}

			if ( cart.attributes.special_pack == 'true' ) {
				specialPack = true;
				$cartCount.text(cart.item_count - 1);
			} else {
				$cartCount.text(cart.item_count);
			}

			// The message when cart item has been removed
			if ( removeItem ) {
				var $removeMessage = $this.cache.$cart.find('.remove-message');

				// Show message
				if ( $removeMessage.length > 0 && $removeMessage.hasClass('hide-message') ) {
					$removeMessage.removeClass('hide-message hide').addClass('show-message');
				} else {
					$removeMessage = $('<div/>').addClass('remove-message show-message');
					$removeMessageText = $('<p/>').text('The item has been removed');
					$removeMessage.append($removeMessageText);
					$cartHeader.after($removeMessage);
				}

				// Hide message
				setTimeout( function() {
					$removeMessage.removeClass('show-message').addClass('hide-message');
					$removeMessage.one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function addClasses() {
						$removeMessage.addClass('hide');
						$removeMessage.off('webkitAnimationEnd oanimationend msAnimationEnd animationend', addClasses);
					});
				}, 2500);
			}
			
			// Total of cart
			this.cache.$cart.find('.cart-total__amount .money').html(Shopify.formatMoney(cart.total_price, Shopify.money_format));

			// Delete items from cart
			this.cache.$cart.find('.cart-list').html('');
			this.initChangeQuantity('.cart');

			// Add current products to cart
			if ( cart.item_count > 0 ) {
				var item, truncateTilte, specialPackItem;

				// Hide 'Empty cart' message
				$cartEmpty.addClass('display-none');
				// Show table with cart items
				$cartForm.removeClass('display-none');

				for (var i = 0, max = cart.items.length; i < max; i++) {
					item = template;
					specialPackItem = specialPackTemplate;

					/*truncateTilte = cart.items[i].title;
					// Truncate long item name
					if ( cart.items[i].title.length > 20 ) {
						truncateTilte = cart.items[i].title.substr(0, 17);
						truncateTilte = truncateTilte + '...';
					}*/

					// If special pack is available in cart - don't show it twice
					if ( specialPackID && specialPackID[0] == cart.items[i].id ) {
						continue;
					}

					// Special packaging
					if ( specialPack && cart.items[i].sku == "" ) {
						// Add special packaging into cart
						specialPackItem = specialPackItem.replace(/\{ID\}/g, cart.items[i].id);
						specialPackItem = specialPackItem.replace(/\{TITLE\}/g, truncateTilte || cart.items[i].title);
						specialPackItem = specialPackItem.replace(/\{IMAGE\}/g, Shopify.resizeImage(cart.items[i].image, 'small'));
						specialPackItem = specialPackItem.replace(/\{PRICE\}/g, Shopify.formatMoney(cart.items[i].price, Shopify.money_format));
						$(specialPackItem).insertAfter(this.cache.$cart.find('.cart__package')); 
						continue;
					} else if ( !specialPack && this.cache.$cart.find('.cart-list__item--special').length > 0 ) {
						// Remove special packaging from cart
						this.cache.$cart.find('.cart-list__item--special').remove();
					}

					// Add item into cart
					item = item.replace(/\{ID\}/g, cart.items[i].id);
					item = item.replace(/\{URL\}/g, cart.items[i].url);
					item = item.replace(/\{TITLE\}/g, truncateTilte || cart.items[i].title);
					item = item.replace(/\{QUANTITY\}/g, cart.items[i].quantity);
					if ( cart.items[i].image == null ) {
						// Item without image
						item = item.replace(/\{IMAGE\}/g, Shopify.resizeImage("//cdn.shopify.com/s/files/1/2168/1709/t/20/assets/img_no_image_sm.jpg?14365944836370219672", 'small'));
					} else {
						// Item with image
						item = item.replace(/\{IMAGE\}/g, Shopify.resizeImage(cart.items[i].image, 'compact'));
					}
					item = item.replace(/\{PRICE\}/g, Shopify.formatMoney(cart.items[i].price, Shopify.money_format));
					this.cache.$cart.find('.cart-list').append(item);
				}

				// Initialization of the dynamic changing quantity for cart items
				this.initChangeQuantity('.cart');

				// Clicking on remove button
				this.cache.$cart.find('.js-cart-item-remove').click( function(e) {
					e.preventDefault();

					var productId = $(this).parents('.cart-list__item').attr('id');

					productId = productId.match(/\d+/g);
					
					Shopify.removeItem(productId, function(cart) {
						foodly.doUpdateDropdownCart(cart, true);
					});
					$this.initChangeQuantity('.cart');
				});

			} else {
				// If cart is empty
				$cartForm.addClass('display-none');
				$cartEmpty.removeClass('display-none');
			}

			
		},

		// Dynamic changing quantity
		initChangeQuantity: function(form) {
			var $form = $(form);

			var forms = document.querySelectorAll(form);
	
			if ( forms.length === 0 ){
				return 0;
			}

			var quantityContainer, arrowUp, arrowDown, inputField, inputFieldValue;

			for ( var i = 0, max = forms.length; i < max; i++ ) {

				if ( $form[i].classList.contains('js-form-cart-alt') ) {
          continue;
        }

				quantityContainer = $($form[i]).find('.quantity-field');
				arrowUp    = quantityContainer.find('.js-up-quantity');
				arrowDown  = quantityContainer.find('.js-down-quantity');

				arrowUp.click( function(e) {
					e.stopPropagation();
					inputField = $(e.currentTarget).next();
					inputFieldValue = inputField.val();
					inputFieldValue++;
					inputField.val(inputFieldValue);
					inputField.trigger("change");
				});

				arrowDown.click( function(e) {
					inputField = $(e.currentTarget).prev();
					inputFieldValue = inputField.val();

					if ( inputFieldValue == 0 ) {
						inputFieldValue = 0;
					} else {
						inputFieldValue--;
					}

					inputField.val(inputFieldValue);
					inputField.trigger("change");
				});
			}
		},

		// Update cart by clicking on updating button
		initUpdateCartAjax: function() {
			var $updateButton = this.cache.$cart.find('#update-cart');
			var $cartForm = this.cache.$cart.find('form[action="/cart"]');
			var $checkoutButton = this.cache.$cart.find('#checkout');

			$updateButton.on('click', function(e){
				e.preventDefault();

				var $cartItems = $cartForm.find('.cart-list .cart-list__item');
				var updateData = '';
				var productID, productValue, quantityField;

				for ( var i = 0, max = $cartItems.length; i < max; i++ ) {
					productID = $cartItems[i].getAttribute('id');
					productID = productID.match(/\d+/g);
					quantityField = $cartItems[i].querySelector('.quantity-field input');
					productValue = quantityField.value;


					if ( i === max - 1 ) {
						updateData += 'updates[' + productID +']=' + productValue;
					} else {
						updateData += 'updates[' + productID +']=' + productValue + '&';
					}
				}
					

				$.ajax({
					type: "post",
					url: "/cart/update.js",
					data: updateData,
					dataType: 'json',
					beforeSend: function() {
						if ( !$updateButton.hasClass('updating') ) {
							$updateButton.addClass('updating');
						}
					},
					success: function(msg) {
						foodly.updateDropdownCart();
						$updateButton.removeClass('updating');	
						var $priceField = $cartForm.find('.cart-total__amount .money');
						var totalPrice = parseFloat($priceField[0].innerHTML.replace(/[^0-9-.]/g, ''));
						console.log(totalPrice);

						if (totalPrice > 20){
							$checkoutButton.prop('disabled', false);
						}
						else {
							$checkoutButton.prop('disabled', true);
						}
					}
				});

			})
		},

		// Show/hide recovery password form
		initRecoverPasswordForm: function(container) {
			var $container = $(container);
	
			if ( $container.length === 0 ){
				return 0;
			}

			var $this = this;

			var recoverPasswordLink = $container.find('.js-forget-password');
			var hideRecoverPasswordLink = $container.find('.js-forget-password-cancel');

			var customerLoginForm = $container.find('.form-wrapper--login');
			var recoverPasswordForm = $container.find('.form-wrapper--recover-password');

			recoverPasswordLink.click( function(e) {
				e.preventDefault();
				$this.showRecoverPasswordForm(customerLoginForm, recoverPasswordForm);
			});

			hideRecoverPasswordLink.click( function(e) {
				e.preventDefault();
				$this.hideRecoverPasswordForm(customerLoginForm, recoverPasswordForm);
			});

			if ( window.location.hash == '#recover' ) {
				$this.showRecoverPasswordForm(customerLoginForm, recoverPasswordForm);
			}
		},

		showRecoverPasswordForm: function(loginForm, recoverForm) {
			loginForm.removeClass('fade-in').addClass('fade-out');

			loginForm.one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function showForm() {
				loginForm.addClass('display-none');
				recoverForm.removeClass('fade-out display-none').addClass('fade-in');
				loginForm.off('webkitAnimationEnd oanimationend msAnimationEnd animationend', showForm);
			});
		},

		hideRecoverPasswordForm: function(loginForm, recoverForm) {
			recoverForm.removeClass('fade-in ').addClass('fade-out');

			recoverForm.one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function hideForm() {
				recoverForm.addClass('display-none');
				loginForm.removeClass('fade-out display-none').addClass('fade-in');
				recoverForm.off('webkitAnimationEnd oanimationend msAnimationEnd animationend', hideForm);
			});
		},

		// Showing fixed top bar
		showTopBar: function(topBar) {
			var $topBar = $(topBar);
	
			if ( $topBar.length === 0 ){
				return 0;
			}

			var y;

			function checkScroll() {
				y = $(this).scrollTop();

				if ( y > 150 ) {
					$topBar[0].classList.add('show');
				} else {
					$topBar[0].classList.remove('show');
				}
			}

			$(window).scroll( function() {
				window.requestAnimationFrame(checkScroll);
			});
		},

		// Find forms and init custom validation on form sumbit
		initFormsError: function() {
			$this = this;

			$('.form-validation').on('submit', function(e) {
				e.preventDefault();

				var validationStatus;
				validationStatus = $this.formErrorValidation(e.target);

				if ( validationStatus ) {
					$('.form-validation').off('submit');
					$('.form-validation').submit();
				}

			});
		},

		formErrorValidation: function(form) {
			var $form = $(form);
	
			if ( $form.length === 0 ){
				return 0;
			}

			var $this = this;
			var $inputs = $form.find('[class=form__field], [class*=form__field--textarea]');

			for ( var i = 0, max = $inputs.length; i < max; i++ ) {
				if ( $inputs[i].value === '' ) {
					$($inputs[i]).one('keyup', function() {
						var value = $(this).val();
						if ( value.length > 0 ) {
							$(this).addClass('hide-border');
						}
					});
				}
			}

			// General fields
			var $firstName = $form.find('[name*=first_name]');
			var $lastName = $form.find('[name*=last_name]');
			var $email = $form.find('[name*=email]');
			var $password = $form.find('[name*=password]');
			var $passwordConfirm = $form.find('[name*=\\[password_confirmation\\]]');
			var $message = $form.find('[name*=body]');
			var $fullName = $form.find('[name*=\\[name\\]]');
			var $author = $form.find('[name*=author]');
			var $address1 = $form.find('[name*=address1]');
			var $city = $form.find('[name*=city]');
			var $zip = $form.find('[name*=zip]');

			// Error messages from settings
			var errorMsgName = "translation missing: en.general.form_popup_errors.name_html";
			var errorMsgLastName = "translation missing: en.general.form_popup_errors.last_name_html";
			var errorMsgEmail = "translation missing: en.general.form_popup_errors.email_html";
			var errorMsgPassword = "translation missing: en.general.form_popup_errors.password_html";
			var errorMsgMessage = "translation missing: en.general.form_popup_errors.message_html";
			var errorMsgFullname = "translation missing: en.general.form_popup_errors.fullname_html";
			var errorMsgAuthor = "translation missing: en.general.form_popup_errors.comment_author_html";
			var errorMsgAddress1 = "translation missing: en.general.form_popup_errors.city_html";
			var errorMsgCity = "translation missing: en.general.form_popup_errors.city_html";
			var errorMsgZip = "translation missing: en.general.form_popup_errors.zip_html";

			var counter = 0;

			// Erros messages for form validation
			function initErrorMsg(input, msg) {
				
				for ( var i = 0, max = $inputs.length; i < max; i++) {
					if ( input.is($inputs[i]) ) {
						counter = i + 1;
					}
				}

				var $errorMsgContainer = input.parent().prev('.error');
				var counterContainer = $('<span/>').addClass('error__counter');

				input.addClass('field__error');

				if ( $errorMsgContainer.length == 0 ) {
					$errorMsgContainer = $('<div/>').addClass('error show-message');
					var errorMessage = $('<p/>').addClass('error__message').html(msg);
					counterContainer.text(counter);
					counterContainer.appendTo(errorMessage);
					errorMessage.appendTo($errorMsgContainer);

					$('<span/>').addClass('icon icon--close').appendTo($errorMsgContainer).click( function(e) {
						var $targetParent = $(e.target).parent();
						$targetParent.removeClass('show-message').addClass('hide-message');

						$targetParent.one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function addClasses() {
							$targetParent.addClass('hide');
							$targetParent.off('webkitAnimationEnd oanimationend msAnimationEnd animationend', addClasses);
						});

						if ( $errorMsgContainer.closest('.modal').length > 0 ) {
							$this.cache.modalScroll.resize();
						}
					});

					input.parent().before($errorMsgContainer);

				} else if ($errorMsgContainer.hasClass('hide-message')) {
					$errorMsgContainer.removeClass('hide hide-message').addClass('show-message');
					$errorMsgContainer.find('.error__counter').text(counter);
				} else {
					$errorMsgContainer.find('.error__counter').text(counter);
				}

				if ( $errorMsgContainer.closest('.modal').length > 0 ) {
					$this.cache.modalScroll.resize();
				}
			}

			if ($firstName.length > 0 && $firstName.val() === "") {
				initErrorMsg($firstName, errorMsgName);
			} else {
				$firstName.removeClass('field__error');
				$firstName.parent().prev('.error').removeClass('show-message').addClass('hide');
			}

			if ($lastName.length > 0 && $lastName.val() === "") {
				initErrorMsg($lastName, errorMsgLastName);
			} else {
				$lastName.removeClass('field__error');
				$lastName.parent().prev('.error').removeClass('show-message').addClass('hide');
			}

			if ($email.length > 0 ){
				var emailValue = $email.val();
				if ( emailValue.indexOf('@') == -1 || emailValue.indexOf('.') == -1 ) {
					initErrorMsg($email, errorMsgEmail);
				} else {
					$email.removeClass('field__error');
					$email.parent().prev('.error').removeClass('show-message').addClass('hide');
				}
			}

			if ($password.length > 0) {
				var passwordValue = $password.val();
				if ( passwordValue.length < 6 ) {
					initErrorMsg($password, errorMsgPassword);
				} else {
					$password.removeClass('field__error');
					$password.parent().prev('.error').removeClass('show-message').addClass('hide');
				}
			}

			if ($passwordConfirm.length > 0) {
				var passwordValue = $passwordConfirm.val();
				if ( passwordValue.length < 6 ) {
					initErrorMsg($passwordConfirm, errorMsgPassword);
				} else {
					$passwordConfirm.removeClass('field__error');
					$passwordConfirm.parent().prev('.error').removeClass('show-message').addClass('hide');
				}
			}

			if ($message.length > 0 && $message.val() === "") {
				initErrorMsg($message, errorMsgMessage);
			} else {
				$message.removeClass('field__error');
				$message.parent().prev('.error').removeClass('show-message').addClass('hide');
			}

			if ($fullName.length > 0 && $fullName.val() === "") {
				initErrorMsg($fullName, errorMsgFullname);
			} else {
				$fullName.removeClass('field__error');
				$fullName.parent().prev('.error').removeClass('show-message').addClass('hide');
			}

			if ($author.length > 0 && $author.val() === "") {
				initErrorMsg($author, errorMsgAuthor);
			} else {
				$author.removeClass('field__error');
				$author.parent().prev('.error').removeClass('show-message').addClass('hide');
			}

			if ($address1.length > 0 && $address1.val() === "") {
				initErrorMsg($address1, errorMsgAddress1);
			} else {
				$address1.removeClass('field__error');
				$address1.parent().prev('.error').removeClass('show-message').addClass('hide');
			}

			if ($city.length > 0 && $city.val() === "") {
				initErrorMsg($city, errorMsgCity);
			} else {
				$city.removeClass('field__error');
				$city.parent().prev('.error').removeClass('show-message').addClass('hide');
			}

			if ($zip.length > 0 && $zip.val() === "") {
				initErrorMsg($zip, errorMsgZip);
			} else {
				$zip.removeClass('field__error');
				$zip.parent().prev('.error').removeClass('show-message').addClass('hide');
			}

			if ( $('.field__error').length === 0) {
				return true;
			} else {
				return false;
			}
		},

		// Make dropdown for province selector after changing country selector
		initDropdownAfterChanageSelector: function (select, selectForChange) {
			var $select = $(select);
	
			if ( $select.length === 0 ){
				return 0;
			}

			var $selectForNewDropdown;
			var $this = this;

			$select.change(function(e) {
				$selectForNewDropdown = $(e.target).closest('.form').find(selectForChange);
				$selectForNewDropdown.next('.dropdown').remove();
				setTimeout(function() {
					$this.initDropdownScroll(selectForChange);
				}, 100)
				
			})
		},

		// Make dropdown for select with scroll
		initDropdownScroll: function(selects) {
			var $selects = $(selects);
	
			if ( $selects.length === 0 ){
				return 0;
			}

			$this = this;
			var dropdownListScroll = [];

			for ( var i = 0, max = $selects.length; i < max; i++) {
				
				var $dropdown = $('<div/>').addClass('dropdown dropdown--scroll').click( function(e) {
					$this.dropdownEventsListener(e);
				});

				var $dropdownButton = $('<button/>').addClass('dropdown__button').appendTo($dropdown);
				$('<span/>').addClass('icon').appendTo($dropdown);

				var $dropdownList = $('<ul/>').addClass('dropdown-list');

				for ( var j = 0, maxj = $selects[i].length; j < maxj; j++) {

					if ( j === 0 ) {
						$dropdownButton.text($selects[i][j].textContent);
						$($selects[i][j]).addClass('active');
					};

					$('<li/>').addClass('dropdown-list__item').text($selects[i][j].textContent).attr('data-value', $selects[i][j].value).appendTo($dropdownList);
				}

				var $dropdownListWrapperForIcons = $('<div/>').addClass('dropdown-list-container');
				var $dropdownListWrapper = $('<div/>').addClass('dropdown-list-wrapper');

				$dropdownList.appendTo($dropdownListWrapper);

				$dropdownListWrapper.appendTo($dropdownListWrapperForIcons);
				$dropdownListWrapperForIcons.appendTo($dropdown);
				$dropdown.insertAfter($($selects[i]));
				$($selects[i]).hide();

				// Init scroll
				for ( var k = 0, maxk = $dropdownListWrapper.length; k < maxk; k++ ) {
					dropdownListScroll[k] = global.createScrollbar($dropdownListWrapper[k], {
						touchScrollSpeed: 1,
						preventDefaultScroll: true,
						customThumbHeight: 30
				  });
				}
			}
		},

		// Make dropdown for select without scroll
		initDropdown: function(selects) {
			var $selects = $(selects);
	
			if ( $selects.length === 0 ){
				return 0;
			}

			$this = this;
			var link = location.href;
			var searchPath = location.search;
			var pathURL = location.pathname.slice( location.pathname.indexOf('/collections/') + 13);
			var selectedTag = pathURL.slice(pathURL.lastIndexOf('/') + 1);	
			var orderQuery = searchPath.slice(searchPath.indexOf('sort_by') + 8);

			for ( var i = 0, max = $selects.length; i < max; i++) {
				
				var $dropdownContainer = $('<div/>').addClass('dropdown').click( function(e) {
					$this.dropdownEventsListener(e);
				});

				var $dropdownButton = $('<button/>').addClass('dropdown__button').appendTo($dropdownContainer);
				$('<span/>').addClass('icon').appendTo($dropdownContainer);

				var $dropdownList = $('<ul/>').addClass('dropdown-list');
				var selectedValue = $selects[i].id === 'tag-filter' ? selectedTag : orderQuery;

				for ( var j = 0, maxj = $selects[i].length; j < maxj; j++) {

					if ( selectedValue === $selects[i][j].value ) {
						$dropdownButton.text($selects[i][j].textContent);
					} else if ( j === 0 ) {
						$dropdownButton.text($selects[i][j].textContent);
					};

					$('<li/>').addClass('dropdown-list__item').text($selects[i][j].textContent).attr('data-value', $selects[i][j].value).appendTo($dropdownList);
				}

				$dropdownList.appendTo($dropdownContainer);
				$dropdownContainer.insertAfter($($selects[i]));
				$($selects[i]).hide();
			}
		},

		// Event listeners for dropdowns (open dropdown, select dropdown item)
		dropdownEventsListener: function(e) {
			e.preventDefault();

			var $target = $(e.target);
			var $parentDropdown = $target.closest('.dropdown');
			var $buttonDropdown = $parentDropdown.find('button.dropdown__button');
			var $currentSelect;
			var $currencyButtons, $currencyWrapers;
			var mobileMenuDrawer;
			var currentOpen = false;
			if ( $parentDropdown.hasClass('open') ) {
				currentOpen = true;
			}

			// Open dropdown
			if ( $target.hasClass('dropdown__button') || $target.hasClass('icon') ) {
				$target.closest('.collection__filters').find('.dropdown.open').removeClass('open');
				$target.closest('.shipping-calculator__container').find('.dropdown.open').removeClass('open');

				if ( currentOpen ) {
					$parentDropdown.removeClass('open');
				} else {
					$parentDropdown.addClass('open');
				}

				if ("createEvent" in document) {
					var evt = document.createEvent("HTMLEvents");
					evt.initEvent("resize", false, true);
					window.dispatchEvent(evt);
				} else {
					window.fireEvent("onresize");
				}
			};

			// Click on dropdown items
			if ( $target.hasClass('dropdown-list__item') ) {
				$currentSelect = $parentDropdown.prev('[class*="js-dropdown"]');
				$currentSelect.val($target.attr('data-value'));

				if ("createEvent" in document) {
					var evt = document.createEvent("HTMLEvents");
					evt.initEvent("change", false, true);
					$currentSelect[0].dispatchEvent(evt);
				} else {
					$currentSelect[0].fireEvent("onchange");
				}

				$currencyWrapers = $('.search-container .currency-picker__wrapper');

        if ( $currencyWrapers.length > 0 && $target.closest('.nav-list__item--currency').length > 0 ) {
          $currencyButtons = $currencyWrapers.find('.dropdown__button');
          $currencyButtons.text($target.text());
        }
        
        $buttonDropdown.text($target.text());

				$parentDropdown.find('.active').removeClass('active');
				$target.addClass('active');
				$parentDropdown.removeClass('open');

				mobileMenuDrawer = $('.drawer--menu.open');
				if ( mobileMenuDrawer.length > 0 ) {
        	mobileMenuDrawer.find('.drawer__btn-close').trigger('click');
        }
			}
		},

		// Make currency dropdown in the header
		initCurrencyDropdown: function(select) {
			var $select = $(select);
	
			if ( $select.length === 0 ){
				return 0;
			}

			$select.hide();

			$this = this;
			var link = location.href;
			
			var $dropdownContainer = $('<div/>').addClass('dropdown').click( function(e) {
				$this.dropdownEventsListener(e);
			});

			var $dropdownButton = $('<button/>').addClass('dropdown__button').appendTo($dropdownContainer);
			$('<span/>').addClass('icon').appendTo($dropdownContainer);

			var $dropdownList = $('<ul/>').addClass('dropdown-list');

			for ( var i = 0, max = $select[0].length; i < max; i++) {

				if ( Currency.currentCurrency !== '' && i === 0 ) {
					$dropdownButton.text(Currency.currentCurrency);
				} else if ( i === 0 ) {
					$dropdownButton.text($select[0][i].textContent);
				};

				$('<li/>').addClass('dropdown-list__item').text($select[0][i].textContent).attr('data-value', $select[0][i].value).appendTo($dropdownList);
			}

			$dropdownList.appendTo($dropdownContainer);
			$dropdownContainer.insertAfter($select);
		},

		// For elements that is folded (for example on product page, mobile view)
		foldElements: function(element) {
			var $foldContainers = $(element);
	
			if ( $foldContainers.length === 0 ){
				return 0;
			}

			var $foldToggle = $foldContainers.find('.fold__toggle');
			$foldToggle.click(function(e) {
				var $foldElement = $(e.target).closest('.fold')
				$foldElement.toggleClass('open');

				if ( $foldElement.find('.swiper-container').length > 0 ) {
					global.similarProducts.update();
				}
			});
		},

		// Modal window for addresses
		initModalAddresses: function() {
			var $this = this;
			var $newAddressBtn = $('.js-add-address');
			var $editAddressBtns = $('.js-edit-address');
			var $deleteAddressBtns = $('.js-delete-address');
			
			$newAddressBtn.click( function(e) {
				e.preventDefault();
				$this.toggleAddressForm('#AddAddress');
				$this.disableScroll();
			});

			$editAddressBtns.click( function(e) {
				e.preventDefault();
				var addressID = $(this).attr('data-address-id');
				addressID = '#EditAddress_' + addressID;
				$this.toggleAddressForm(addressID);
				$this.disableScroll();
			});

			$deleteAddressBtns.click( function(e) {
				e.preventDefault();
				var addressID = $(this).attr('data-address-id');
				addressID = '.js-delete-address_' + addressID;
				$this.toggleAddressForm(addressID);
				$this.disableScroll();
			})
		},

		// Show/hide modal window for addresses
		toggleAddressForm: function(container) {
			var $modalContainer = $(container);
	
			if ( $modalContainer.length === 0 ){
				return 0;
			}

			var $this = this;
			var $closeBtn = $modalContainer.find('.js-modal__btn-close');
			var $modalBody = $modalContainer.find('.modal__body');
			var $deleteBtnConfirm = $modalContainer.find('.js-delete-address-confirm');

			this.cache.$body.addClass('modal-open');

			$modalContainer.removeClass('display-none');

			if ( !$modalContainer.find('.modal__body').hasClass('scrollable') && $modalBody.length > 0 ) {
				this.cache.modalScroll = global.createScrollbar($modalBody[0], {
					touchScrollSpeed: 1,
					preventDefaultScroll: true
				});
			}
					
			$closeBtn.click( function(e) {
				e.preventDefault();
				$modalContainer.addClass('display-none');
				$modalContainer.attr('style', '');
				$this.enableScroll();
				$this.cache.$body.removeClass('modal-open');
			});

			// Delete address
			if ( $deleteBtnConfirm.length !== 0 ) {
				$deleteBtnConfirm.click( function(e){
					e.preventDefault();
					var addressID = $(this).attr('data-address-id');
					Shopify.postLink('/account/addresses/' + addressID, {'parameters': {'_method': 'delete'}} );
				});
			}
		},

		// Show hide Google maps on Contact page
		showHideMaps: function(mapsWrapperClass) {
			var $mapsWrapper = $(mapsWrapperClass);
	
			if ( $mapsWrapper.length === 0 ){
				return 0;
			}

			var $btnsOpenMap = $mapsWrapper.find('.js-open-map');
			var $btnCloseMap = $mapsWrapper.find('.js-close-map');

			$btnsOpenMap.click(function() {
				$(this).next().removeClass('elem-hide');
			});

			$btnCloseMap.click(function() {
				$(this).parent().addClass('elem-hide');
			});
		},

		// Toolbar for sorting filters
		initToolbar: function(tollbarClass) {
			var $toolbar = $(tollbarClass);
	
			if ( $toolbar.length === 0 ){
				return 0;
			}

			if ( location.href.indexOf('list') !=-1 ) {
				$toolbar.find('.list-view').addClass('active');
			}
		},

		// Make image as background for covering all container
		coverImg: function (holdersClass) {
			var $imgHolders = $(holdersClass);
	
			if ( $imgHolders.length === 0 ){
				return 0;
			}

			$imgHolders.each( function() {

				var $img = $(this).find('img');
				$img.css('display', 'none');

				$(this).css({
					'background': 'url(' + $img.attr('src') + ')',
					'background-repeat': 'no-repeat',
					'background-position': '50% 50%',
					'background-size': 'cover'
				});
			});
		},

		// Initialization of wishlist
		initAddToWishlist: function(wishlistContainer){
			var $wishlistContainer = $(wishlistContainer);
	
			if ( $wishlistContainer.length === 0 ){
				return 0;
			}

			$wishlistContainer.find('#add-to-wish-list').submit(function(e) {
				e.preventDefault();
				var postData = $(this).serializeArray();
				var formURL = $(this).attr("action");
				$.ajax({
					url : formURL,
					type: "POST",
					data : postData,
					success:function(data, textStatus) {
						$wishlistContainer.empty().html('<p>This product is in your <a class="text-link--default" href="/pages/wish-list">wishlist</a></p>');
						// $wishlistContainer.empty().html('<p></p>');
					},
					error: function() {
						$(this).append("<p>I'm afraid that didn't work.</p>");
					}
				});
			});
		},

		// Action for wishlist
		initActionsWishlist: function(wishlistContainer) {
			var $wishlistContainer = $(wishlistContainer);
	
			if ( $wishlistContainer.length === 0 ){
				return 0;
			}

			var $removeButton = $wishlistContainer.find('.js-remove-button');
			var $addToCartButton = $wishlistContainer.find('.js-add-to-cart');
			var $removeForm = $wishlistContainer.find('#remove');
			var $addToCartForm = $wishlistContainer.find('#add-product');
			var $this = this;

			$addToCartButton.on('click', function(e) {
				e.preventDefault();
				variantID = $(this).attr("data-id");
				$addToCartForm.find('#product-select').attr("value", variantID);
				$addToCartForm.submit();
			});

			$removeButton.on('click', function(e) {
				e.preventDefault();
				$this.removeFromWishlist($(this), $removeForm);
			});

		},

		// Remove item fron wishlist
		removeFromWishlist: function ($this, $removeForm) {
			var $elem = $this.closest("tr");
			var tagID = $elem.attr("id");

			$removeForm.find('#remove-value').attr("value", tagID);
			var postData = $removeForm.serializeArray();
			var formURL = $removeForm.attr("action");
			$.ajax({
				url : formURL,
				type: "POST",
				data : postData,
				success:function(data, textStatus) {
					// the message when product successfully added to cart
					var $parentMsg = $elem.closest('.js-wishlist');
					var $message = $parentMsg.find('.remove-message');
					var $table = $parentMsg.find('.table-wrapper');

					if ( $message.length > 0 && $message.hasClass('hide-message') ) {
						$message .removeClass('hide-message hide').addClass('show-message');
					} else {
						$message = $('<p/>').addClass('remove-message show-message').html(' This product has deleted from your wishlist.');
						$table.before($message);
					}

					// delete item
					$elem.remove();

					setTimeout(function() {
						$message.addClass('hide-message').removeClass('show-message');
						$message.one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function addClasses() {
							$message.addClass('hide');
							$message.off('webkitAnimationEnd oanimationend msAnimationEnd animationend', addClasses);
						});
					}, 5000);

					if( $(".wishlist__item").length == 0 ) {
						$removeForm.prev('.table-wrapper').hide();
						$removeForm.nextAll('.wishlist-empty').show();
					} 
				},
				error: function() {
					$(this).append("<p>Sorry, something went wrong. Please, try one more time</p>");
					// $(this).append("<p></p>");
				}
			});
		},

		// Fixed header
		fixedHeader: function(fixedHeader) {
			var $fixedHeader = $(fixedHeader);
	
			if ( $fixedHeader.length === 0 || $fixedHeader.hasClass('header--fixed-off') ){
				return 0;
			}

			var y;
			var $this = this;
			var headerHeight = $fixedHeader.outerHeight();

			var $navList = $fixedHeader.find('.nav-list');
			var navlistHeight = $navList.outerHeight();

			var headerHeightMinusNavlist = headerHeight - navlistHeight;
			var refreshY = $(window).scrollTop();

			if ( refreshY > navlistHeight ) {
				checkScrollHeader();
			}

			function checkScrollHeader() {

				if ($this.cache.$body.hasClass('cart-open')) {
					return 0;
				}

				y = $(window).scrollTop();

				if ( y > 80 && !$fixedHeader.hasClass('fixed') ) {
					// fixing header (animation with CSS transition)
					$fixedHeader[0].classList.add('fixed');

				} else if ( y < 80 && $fixedHeader.hasClass('fixed')) {
					// Unfixing header
					$fixedHeader[0].classList.remove('fixed');
				}
			}

			$(window).scroll( function() {
				window.requestAnimationFrame(checkScrollHeader);
			});
		},

		// Parallax effect for contact page and product page
		parallaxScroll: function(parallaxContainer) {
			var $parallaxContainer = $(parallaxContainer);
	
			if ( $parallaxContainer.length === 0 ){
				return 0;
			}

			var _this = this;
			var $parallaxBack = $parallaxContainer.find('.parallax__back');
			var parallaxBackHeight = $parallaxBack.outerHeight();
			
			var $parallaxBase = $parallaxContainer.find('.parallax__base');
			var $header = this.cache.$body.find('.header');
			var headerHeight = $header.outerHeight();
			var coordsBase = $parallaxBase[0].getBoundingClientRect();

			// for fadeup animation
			var windowBase =( $(window).height() - $(window).height() * 0.04);
			var emptyDiv = $('<div/>').addClass('empty-div').css('height', $parallaxBack.height() );

			if ( $parallaxContainer.parent().hasClass('main-content--top') ) {
      	 $parallaxContainer.parent().css('margin-top', '0px');
      }
			
			$parallaxBase.before(emptyDiv);

			this.setParallaxCoords($parallaxBack, $parallaxBase, $header);
			
			$(window).scroll(function(e) {
				window.requestAnimationFrame(function(){
					if ($this.cache.$body.hasClass('cart-open')) {
						return 0;
					}

					var y = $(window).scrollTop();

					if ( y > 80 && !$header.hasClass('header--clear') ) {
						$parallaxBack.css({
							'transform': 'translate3d(0, 80px, 0)',
							'-webkit-transform': 'translate3d(0, 80px, 0)'
						});
						$parallaxBase.css({
							'transform': 'translate3d(0, -80px, 0)',
							'-webkit-transform': 'translate3d(0, -80px, 0)'
						});
					} else if ( y < 80 && !$header.hasClass('header--clear') ) {
						$parallaxBack.css({
							'transform': 'translate3d(0, 220px, 0)',
							'-webkit-transform': 'translate3d(0, 220px, 0)'
						});
						$parallaxBase.css({
							'transform': 'translate3d(0, 0, 0)',
							'-webkit-transform': 'translate3d(0, 0, 0)',
						});
					}

					// Start fade up animation
					if ( y > 200 ) {
						$parallaxContainer.addClass('parallax-move');
					}

					// hide parallax back
					if ( y > coordsBase.bottom - 300 && $parallaxContainer.hasClass('parallax--additional') ) {
						$parallaxBack.css('opacity', '0');
					} else if ( y < coordsBase.bottom - 300 && $parallaxContainer.hasClass('parallax--additional') ) {
						$parallaxBack.css('opacity', '1');
					}
				});
			});
		},

		setParallaxCoords: function ($parallaxBack, $parallaxBase, $header) {
			if ( $header.length === 0 || $parallaxBack.length === 0 || $parallaxBase.length === 0 ){
				return 0;
			}

			if ( !$header.hasClass('header--clear') ) {
				$parallaxBack.css({
					'transform': 'translate3d(0, 220px, 0)',
					'-webkit-transform': 'translate3d(0, 220px, 0)'
				});
			}

			setTimeout(function(){
				$parallaxBack.css({
					'transition': 'transform 450ms cubic-bezier(0.50, 0.130, 0.5, 0.87)',
					'-webkit-transition': 'transform 450ms cubic-bezier(0.50, 0.130, 0.5, 0.87)'
				});
			}, 0);

			$parallaxBase.css({
				'transition': 'transform 450ms cubic-bezier(0.50, 0.130, 0.5, 0.87)',
				'-webkit-transition': 'transform 450ms cubic-bezier(0.50, 0.130, 0.5, 0.87)'
			});
		},

		dropParallaxCoords: function ($parallaxBack, $parallaxBase) {
			if ( $parallaxBack.length === 0 || $parallaxBase.length === 0 ){
				return 0;
			}

			$parallaxBack.css({
				'transition': 'none',
				'-webkit-transition': 'none'
			});

			$parallaxBase.css({
				'transition': 'none',
				'-webkit-transition': 'none'
			});
		},

		// Disabele/enable browser scroll
		// http://stackoverflow.com/questions/4770025/how-to-disable-scrolling-temporarily
		disableScroll: function () {
			if (window.addEventListener) // older FF
				window.addEventListener('DOMMouseScroll', this.preventDefault, false);
			window.onwheel = this.preventDefault; // modern standard
			window.onmousewheel = document.onmousewheel = this.preventDefault; // older browsers, IE
			window.ontouchmove = this.preventDefault; // mobile
		},

		enableScroll: function () {
			if (window.removeEventListener)
				window.removeEventListener('DOMMouseScroll', this.preventDefault, false);
			window.onmousewheel = document.onmousewheel = null;
			window.onwheel = null;
			window.ontouchmove = null;
		},

		preventDefault: function (e) {
			e = e || window.event;
			if (e.preventDefault)
				e.preventDefault();
			e.returnValue = false;
		}
	};

	// Using some function as global
	global.updateCart = foodly.updateDropdownCart;
	global.coverImg = foodly.coverImg;
	global.foodly = foodly;

	return global;
})($, global || {});
