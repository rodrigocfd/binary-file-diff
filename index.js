'use strict';

$(document).ready(function() {
	$('#byte1,#byte2,#real1,#real2').on('dragenter dragover', function(ev) { ev.preventDefault(); });
	$('#byte1,#real1').on('drop', function(ev) { loadBin(ev, 1); });
	$('#byte2,#real2').on('drop', function(ev) { loadBin(ev, 2); });
	$('#byte1,#real1').on('mouseenter', '.byte, .real', function(ev) { bin[1].onIn(ev) });
	$('#byte2,#real2').on('mouseenter', '.byte, .real', function(ev) { bin[2].onIn(ev) });
	$('#byte1,#real1').on('mouseleave', '.byte, .real', function(ev) { bin[1].onOut(ev) });
	$('#byte2,#real2').on('mouseleave', '.byte, .real', function(ev) { bin[2].onOut(ev) });
	$('#byte1').on('scroll', function() { $('#byte2,#real1,#real2').scrollTop($(this).scrollTop()); });
	$('#byte2').on('scroll', function() { $('#byte1,#real1,#real2').scrollTop($(this).scrollTop()); });
	$('#real1').on('scroll', function() { $('#byte1,#byte2,#real2').scrollTop($(this).scrollTop()); });
	$('#real2').on('scroll', function() { $('#byte1,#byte2,#real1').scrollTop($(this).scrollTop()); });
});

let bin = ['UNUSED', null, null];

function loadBin(ev, idx) {
	ev.preventDefault();
	bin[idx] = new BinFile(idx, ev.originalEvent.dataTransfer.files[0]);
}

class BinFile {
	constructor(idx, file) {
		this.idx = idx;
		this.dv = null;
		this.$byte = [];
		this.$real = [];
		this.loadDataView(file);
	}

	loadDataView(file) {
		$('#file' + this.idx).text(file.name);
		let re = new FileReader();
		re.onloadend = (ev) => {
			let bigBlob = ev.target.result;
			this.dv = new DataView(bigBlob);
			$('#size' + this.idx).text(this.dv.byteLength);
			this.printByteAndReal();
			$('#byte1,#byte2').scrollTop(0);
		};
		re.readAsArrayBuffer(file);
	}

	get otherBin() {
		return bin[this.idx === 1 ? 2 : 1];
	}

	printByteAndReal() {
		$('.diffed').removeClass('diffed');
		let diffCount = 0;
		for (let i = 0; i < this.dv.byteLength; ++i) {
			let num = this.dv.getUint8(i);
			this.$byte.push(this.createByteCell(num));
			this.$real.push(this.createRealCell(num));
			if (this.isDiff(i, num)) {
				++diffCount;
				this.paintDiffCell(i);
			}
		}
		$('#byte' + this.idx).empty().append(this.$byte);
		$('#real' + this.idx).empty().append(this.$real);
		$('#diffCount').text(diffCount);
	}

	createByteCell(num) {
		let $byteCell = $(document.createElement('div'));
		$byteCell.addClass('byte')
			.toggleClass('zero', num == 0)
			.text((num < 0x10 ? '0' : '') + num.toString(16));
		return $byteCell;
	}

	createRealCell(num) {
		let $realCell = $(document.createElement('div'));
		$realCell.addClass('real')
			.toggleClass('zero', num == 0)
			.html(num >= 33 ? String.fromCharCode(num) : '&nbsp;');
		return $realCell;
	}

	isDiff(i, num) {
		return this.otherBin &&
			this.otherBin.dv.byteLength > i &&
			num !== this.otherBin.dv.getUint8(i);
	}

	paintDiffCell(i) {
		this.$byte[i]
			.add(this.$real[i])
			.add(this.otherBin.$byte[i])
			.add(this.otherBin.$real[i])
			.addClass('diffed');
	}

	displayParsed(i) {
		let displayForBin = (bin) => {
			let displayEmpty = (selector1, selector2) => {
				$(selector1 + bin.idx).html('&nbsp;');
				if (selector2) {
					$(selector2 + bin.idx).html('&nbsp;');
				}
			};
			if (bin.dv.byteLength > i) {
				$('#uint8' + bin.idx).text(bin.dv.getUint8(i).toString(10));
			} else {
				displayEmpty('#uint8');
			}
			if (bin.dv.byteLength - 1 > i) {
				$('#uint16le' + bin.idx).text(bin.dv.getUint16(i, true).toString(10));
				$('#uint16be' + bin.idx).text(bin.dv.getUint16(i, false).toString(10));
			} else {
				displayEmpty('#uint16le', '#uint16be');
			}
			if (bin.dv.byteLength - 3 > i) {
				$('#uint32le' + bin.idx).text(bin.dv.getUint32(i, true).toString(10));
				$('#uint32be' + bin.idx).text(bin.dv.getUint32(i, false).toString(10));
			} else {
				displayEmpty('#uint32le', '#uint32be');
			}
			if (bin.dv.byteLength - 3 > i) {
				$('#float32le' + bin.idx).text(bin.dv.getFloat32(i, true).toFixed(4));
				$('#float32be' + bin.idx).text(bin.dv.getFloat32(i, false).toFixed(4));
			} else {
				displayEmpty('#float32le', '#float32be');
			}
		};
		displayForBin(this);
		if (this.otherBin) {
			displayForBin(this.otherBin);
		}
	}

	onIn(ev) {
		if (this.$byte.length) {
			let $cell = $(ev.target);
			let i = $cell.index();
			this.$byte[i]
				.add(this.$real[i])
				.add(this.otherBin ? this.otherBin.$byte[i] : null)
				.add(this.otherBin ? this.otherBin.$real[i] : null)
				.addClass('pointed');
			$('#off').text(i);
			this.displayParsed(i);
		}
	}

	onOut(ev) {
		$('.pointed').removeClass('pointed');
	}
}