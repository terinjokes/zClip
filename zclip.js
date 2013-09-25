/*!
 * zClip
 * Copyright (c) 2013 Terin Stock, SteamDev
 * Licensed MIT
 */
/* global jQuery:true */
'use strict';

var ZeroClipboard = global.ZeroClipboard = require('ZeroClipboard'),
		defaults = {
			path: 'ZeroClipboard.swf',
			copy: null,
			beforeCopy: null,
			afterCopy: null,
			clickAfter: true,
		},
		unique = (function() {
			var count = 0;

			return function() {
				return count++;
			};
		}()),
		clients = {},
		clip;

jQuery.fn.zclip = function(options) {
	var settings,
			clientId;

	if (jQuery.isPlainObject(options)) {
		settings = jQuery.extend({}, defaults, options);
		clientId = unique();

		clients[clientId] = settings;

		this.data('zclip-client', clientId);

		if (clip) {
			clip.glue(this);
		} else {
			clip = new ZeroClipboard(this, {
				moviePath: settings.path,
				trustedDomains: [global.location.protocol + '//' + global.location.host],
				hoverClass: 'hover',
				activeClass: 'active'
			});
		}

		if (jQuery.isFunction(settings.copy)) {
			this.on('zClip_copy', jQuery.proxy(settings.copy, this));
		}

		if (jQuery.isFunction(settings.beforeCopy)) {
			this.on('zClip_beforeCopy', jQuery.proxy(settings.beforeCopy, this));
		}

		if (jQuery.isFunction(settings.afterCopy)) {
			this.on('zClip_afterCopy', jQuery.proxy(settings.afterCopy, this));
		}

		clip.on('mouseover', function() {
			var zclip = jQuery(this);
			zclip.trigger('mouseenter');
		});

		clip.on('mouseout', function() {
			var zclip = jQuery(this);
			zclip.trigger('mouseleave');
		});

		clip.on('mousedown', function() {
			var zclip = jQuery(this);
			zclip.trigger('mousedown');
		});

		clip.on('load', function(client) {
			client.setHandCursor(settings.setHandCursor);
		});

		clip.on('complete', function(client, args) {
			var text = args.text,
					$el = jQuery(this),
					settings = clients[$el.data('zclip-client')];

			if (jQuery.isFunction(settings.afterCopy)) {
				$el.trigger('zClip_afterCopy', text);
			} else {
				if (text.length > 500) {
					text = text.substr(0, 500) + '…\n\n(' + (text.length - 500) + 'characters not shown)';
				}
				global.alert('Copied text to clipboard:\n\n'+args.text);
			}

			if (settings.clickAfter) {
				$el.trigger('click');
			}
		});

		clip.on('dataRequested', function(client) {
			var $el = jQuery(this),
					settings = clients[$el.data('zclip-client')];

			$el.trigger('zClip_beforeCopy');

			if (jQuery.isFunction(settings.copy)) {
				client.setText(String($el.triggerHandler('zClip_copy')));
			} else {
				client.setText(settings.copy);
			}
		});

		jQuery(global).on('load resize', function() {
			clip.reposition();
		});

	} else if (clip && typeof options === 'string') {
		switch (options) {
			case 'remove':
			case 'hide':
				clip.unglue(this);
				break;
			case 'show':
				clip.glue(this);
		}
	}
};
