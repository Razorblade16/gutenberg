/**
 * External dependencies
 */
import { cond, matchesProperty } from 'lodash';

/**
 * WordPress dependencies
 */
import { NavigableMenu, KeyboardShortcuts } from '@wordpress/components';
import { Component, findDOMNode } from '@wordpress/element';
import { focus } from '@wordpress/dom';
import { ESCAPE } from '@wordpress/keycodes';

class NavigableToolbar extends Component {
	constructor() {
		super( ...arguments );

		this.bindNode = this.bindNode.bind( this );
		this.focusToolbar = this.focusToolbar.bind( this );
		this.restoreFocus = this.restoreFocus.bind( this );

		this.switchOnKeyDown = cond( [
			[ matchesProperty( [ 'keyCode' ], ESCAPE ), this.restoreFocus ],
		] );
	}

	bindNode( ref ) {
		// Disable reason: Need DOM node for finding first focusable element
		// on keyboard interaction to shift to toolbar.
		// eslint-disable-next-line react/no-find-dom-node
		this.toolbar = findDOMNode( ref );
	}

	/**
	 * Shifts focus to the first tabbable element within the toolbar container,
	 * if one exists.
	 */
	focusToolbar() {
		const tabbables = focus.tabbable.find( this.toolbar );
		if ( ! tabbables.length ) {
			return;
		}

		// Track the original active element prior to shifting focus, so that
		// focus can be returned if the user presses Escape while in toolbar.
		//
		// [TODO]: Currently, to support "stepping down" through multiple
		// navigable toolbars, the assigned value is only cleared after
		// pressing Escape. If the user manually shifts focus away and later
		// returns to press Escape, it will still (wrongly) use the earlier-
		// assigned value.
		this.activeElementBeforeFocus = document.activeElement;

		tabbables[ 0 ].focus();
	}

	/**
	 * Restores focus to the active element at the time focus was
	 * programattically shifted to the toolbar, if one exists.
	 */
	restoreFocus() {
		if ( this.activeElementBeforeFocus ) {
			this.activeElementBeforeFocus.focus();
			delete this.activeElementBeforeFocus;
		}
	}

	render() {
		const { children, ...props } = this.props;
		return (
			<NavigableMenu
				orientation="horizontal"
				role="toolbar"
				ref={ this.bindNode }
				onKeyDown={ this.switchOnKeyDown }
				{ ...props }
			>
				<KeyboardShortcuts
					bindGlobal
					// Use the same event that TinyMCE uses in the Classic block for its own `alt+f10` shortcut.
					eventName="keydown"
					shortcuts={ {
						'alt+f10': this.focusToolbar,
					} }
				/>
				{ children }
			</NavigableMenu>
		);
	}
}

export default NavigableToolbar;
