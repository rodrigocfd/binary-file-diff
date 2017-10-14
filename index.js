'use strict';

$(document).ready(function() {
	$('#byte1,#byte2,#real1,#real2').on('dragenter dragover', function(ev) { ev.preventDefault(); });
	$('#byte1,#real1').on('drop', function(ev) { loadFile(ev, 1); });
	$('#byte2,#real2').on('drop', function(ev) { loadFile(ev, 2); });
	$('#byte1,#real1').on('mouseenter', '.byte', function(ev) { hoverIn(ev, 1) });
	$('#byte2,#real2').on('mouseenter', '.byte', function(ev) { hoverIn(ev, 2) });
	$('#byte1,#real1').on('mouseleave', '.byte', function(ev) { hoverOut(ev, 1) });
	$('#byte2,#real2').on('mouseleave', '.byte', function(ev) { hoverOut(ev, 2) });
	$('#byte1').on('scroll', function() { $('#byte2,#real1,#real2').scrollTop($(this).scrollTop()); });
	$('#byte2').on('scroll', function() { $('#byte1,#real1,#real2').scrollTop($(this).scrollTop()); });
	$('#real1').on('scroll', function() { $('#byte1,#byte2,#real2').scrollTop($(this).scrollTop()); });
	$('#real2').on('scroll', function() { $('#byte1,#byte2,#real1').scrollTop($(this).scrollTop()); });
});

function loadFile(ev, pos) {
	ev.preventDefault();
	var file = ev.originalEvent.dataTransfer.files[0];
	$('#file' + pos).text(file.name);
	var re = new FileReader();
	re.onloadend = function(ev) {
		var bigBlob = ev.target.result;
		var dv = new DataView(bigBlob);
		$('#size' + pos).text(dv.byteLength);
		printBytes(dv, pos);
		$('#byte1,#byte2').scrollTop(0);
	};
	re.readAsArrayBuffer(file);
}

var hexStrs1 = [];
var hexStrs2 = [];

function printBytes(dv, pos) {
	$('.diffed').removeClass('diffed');
	$('.pointed').removeClass('pointed');

	var $otherByte = $('#byte' + (pos === 1 ? 2 : 1));
	var $otherBytes = $otherByte.find('.byte');
	var $otherReal = $('#real' + (pos === 1 ? 2 : 1));
	var $otherReals = $otherReal.find('.real');

	var diffCount = 0;
	var $newBytes = [];
	var $newReals = [];
	var hasOtherFileLoaded = $otherBytes.length > 0;
	var otherHexStrs = (pos === 1 ? hexStrs2 : hexStrs1);
	var newHexStrs = (pos === 1 ? hexStrs1 : hexStrs2);
	newHexStrs.length = 0;

	for (var i = 0; i < dv.byteLength; ++i) {
		var num = dv.getUint8(i);
		var disp = (num < 0x10 ? '0' : '') + num.toString(16);
		newHexStrs.push(disp);

		var isDiff = hasOtherFileLoaded && disp !== otherHexStrs[i];
		var $byteStr = $(document.createElement('div'));
		$byteStr.addClass('byte')
			.toggleClass('zero', num == 0)
			.text(disp);
		if (isDiff) {
			$byteStr.add($otherBytes.get(i)).addClass('diffed');
			++diffCount;
		}
		$newBytes.push($byteStr);

		var $realStr = $(document.createElement('div'));
		$realStr.addClass('real')
			.toggleClass('zero', num == 0)
			.html(num >= 33 ? String.fromCharCode(num) : '&nbsp;');
		if (isDiff) {
			$realStr.add($otherReals.get(i)).addClass('diffed');
		}
		$newReals.push($realStr);
	}
	$('#byte' + pos).empty().append($newBytes);
	$('#real' + pos).empty().append($newReals);
	$('#diffCount').text(diffCount);
}

function hoverIn(ev, pos) {
	var $byteOrReal = $(ev.target);
	var idx = $byteOrReal.index();
	$('#byte1 .byte:eq(' + idx + '), #byte2 .byte:eq(' + idx + '), ' +
		'#real1 .real:eq(' + idx + '), #real2 .real:eq(' + idx + ')').addClass('pointed');
	$('#off').text(idx);
}

function hoverOut(ev, pos) {
	$('.pointed').removeClass('pointed');
}