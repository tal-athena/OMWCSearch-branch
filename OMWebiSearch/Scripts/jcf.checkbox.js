// custom checkbox module
jcf.addModule({
	name:'checkbox',
	selector:'input[type="checkbox"]',
	defaultOptions: {
		wrapperClass:'chk-area',
		focusClass:'chk-focus',
		checkedClass:'chk-checked',
		labelActiveClass:'chk-label-active',
		uncheckedClass:'chk-unchecked',
		disabledClass:'chk-disabled',
		chkStructure:'<span></span>'
	},
	setupWrapper: function(){
		jcf.lib.addClass(this.fakeElement, this.options.wrapperClass);
		this.fakeElement.innerHTML = this.options.chkStructure;
		this.realElement.parentNode.insertBefore(this.fakeElement, this.realElement);
		jcf.lib.event.add(this.realElement, 'click', this.onRealClick, this);
		this.refreshState();
	},
	onFakePressed: function() {
		jcf.modules[this.name].superclass.onFakePressed.apply(this, arguments);
		if(!this.realElement.disabled) {
			this.realElement.focus();
		}
	},
	onFakeClick: function(e) {
		jcf.modules[this.name].superclass.onFakeClick.apply(this, arguments);
		this.tmpTimer = setTimeout(jcf.lib.bind(function(){
			this.toggle();
		},this),10);
		return false;
	},
	onRealClick: function(e) {
		setTimeout(jcf.lib.bind(function(){
			this.refreshState();
		},this),10);
		e.stopPropagation();
	},
	toggle: function(e){
		if(!this.realElement.disabled) {
			if(this.realElement.checked) {
				this.realElement.checked = false;
			} else {
				this.realElement.checked = true;
			}
		}
		this.refreshState();
		return false;
	},
	refreshState: function(){
		if(this.realElement.checked) {
			jcf.lib.addClass(this.fakeElement, this.options.checkedClass);
			jcf.lib.removeClass(this.fakeElement, this.options.uncheckedClass);
			if(this.labelFor) {
				jcf.lib.addClass(this.labelFor, this.options.labelActiveClass);
			}
		} else {
			jcf.lib.removeClass(this.fakeElement, this.options.checkedClass);
			jcf.lib.addClass(this.fakeElement, this.options.uncheckedClass);
			if(this.labelFor) {
				jcf.lib.removeClass(this.labelFor, this.options.labelActiveClass);
			}
		}
		if(this.realElement.disabled) {
			jcf.lib.addClass(this.fakeElement, this.options.disabledClass);
			if(this.labelFor) {
				jcf.lib.addClass(this.labelFor, this.options.labelDisabledClass);
			}
		} else {
			jcf.lib.removeClass(this.fakeElement, this.options.disabledClass);
			if(this.labelFor) {
				jcf.lib.removeClass(this.labelFor, this.options.labelDisabledClass);
			}
		}
	}
});