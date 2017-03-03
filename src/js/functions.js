jQuery.fn.selectText = function (start, end) {
	var range, selection;
	return this.each(function () {
		if (document.body.createTextRange) {
			range = document.body.createTextRange();
			range.moveToElementText(this);
			range.moveStart("character", start);
			range.collapse(true);
			range.moveEnd("character", end);


			range.select();
		} else if (window.getSelection) {
			selection = window.getSelection();
			range = document.createRange();
			//range.selectNodeContents(this);
			range.setStart(this.firstChild, start);
			range.setEnd(this.firstChild, end);
			selection.removeAllRanges();
			selection.addRange(range);
		}
	});
};