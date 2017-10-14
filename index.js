'use strict';

$(document).ready(function() {
	$('#print1,#print2').on('dragenter dragover', function(ev) { ev.preventDefault(); });
	$('#print1').on('drop', function(ev) { loadFile(ev, 1); });
	$('#print2').on('drop', function(ev) { loadFile(ev, 2); });
	$('#print1').on('mouseenter', '.byte', function(ev) { hoverIn(ev, 1) });
	$('#print2').on('mouseenter', '.byte', function(ev) { hoverIn(ev, 2) });
	$('#print1').on('mouseleave', '.byte', function(ev) { hoverOut(ev, 1) });
	$('#print2').on('mouseleave', '.byte', function(ev) { hoverOut(ev, 2) });
	$('#print1').on('scroll', function() { $('#print2').scrollTop($(this).scrollTop()); });
	$('#print2').on('scroll', function() { $('#print1').scrollTop($(this).scrollTop()); });
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
		$('#print1,#print2').scrollTop(0);
	};
	re.readAsArrayBuffer(file);
}

function printBytes(dv, pos) {
	$('.byteDiff').removeClass('byteDiff');
	$('.bytePointed').removeClass('bytePointed');

	var twinBytes = null;
	var $otherPrint = $('#print' + (pos === 1 ? 2 : 1));
	var $otherBytes = $otherPrint.find('.byte');
	if ($otherBytes.length) {
		twinBytes = $otherPrint.data('bytes');
	}

	var $boxes = [];
	var bytes = [];
	var diffCount = 0;
	for (var i = 0; i < dv.byteLength; ++i) {
		var num = dv.getUint8(i);
		var disp = (num < 0x10 ? '0' : '') + num.toString(16);
		bytes.push(disp);
		var $box = $(document.createElement('div'));
		$box.addClass('byte').text(disp);
		if (twinBytes && disp !== twinBytes[i]) {
			$box.add($otherBytes.get(i)).addClass('byteDiff');
			++diffCount;
		}
		$boxes.push($box);
	}
	$('#print' + pos).data('bytes', bytes)
		.empty().append($boxes);
	$('#diffCount').text(diffCount);
}

function hoverIn(ev, pos) {
	var $box = $(ev.target);
	var idx = $box.index();
	$box.add('#print' + (pos === 1 ? 2 : 1) + ' .byte:eq('+ idx + ')')
		.addClass('bytePointed');
	$('#off').text(idx);
}

function hoverOut(ev, pos) {
	var $box = $(ev.target);
	var idx = $box.index();
	$box.add('#print' + (pos === 1 ? 2 : 1) + ' .byte:eq('+ idx + ')')
	.removeClass('bytePointed');
}