const LeftImage = new Image();
const RightImage = new Image();
const TopImage = new Image();
let canvas = "";
let twoFaces = false;
let hasImage = false;

window.addEventListener("load", function(event) {
    canvas = document.getElementById('blockCanvas')
    canvas.width = 180;
    canvas.height = 200;
	document.getElementById('topImage').addEventListener("change", function(event) {
		const [file] = document.getElementById('topImage').files
		if (file) {
			document.getElementById('topImagePreview').src = URL.createObjectURL(file)
			TopImage.src = URL.createObjectURL(file)
			document.getElementById('topImagePreview').style.display = "";
			document.getElementById('topImageButton').style.display = "none";
			TopImage.onload = function(){
				if (twoFaces) {
					if (!LeftImage.src == "" && !RightImage.src == "") {
						if (document.getElementById('isStair').checked) {
							drawStairs(canvas)
						} else if (document.getElementById('isSlab').checked) {
							drawSlab(canvas)
						} else {
							drawCube(canvas)
						}
					};
				} else {
					if (!LeftImage.src == "") {
						if (document.getElementById('isStair').checked) {
							drawStairs(canvas)
						} else if (document.getElementById('isSlab').checked) {
							drawSlab(canvas)
						} else {
							drawCube(canvas)
						}
					};
				}
			}
		}
	})
	document.getElementById('leftImage').addEventListener("change", function(event) {
		const [file] = document.getElementById('leftImage').files
		if (file) {
			document.getElementById('leftImagePreview').src = URL.createObjectURL(file)
			LeftImage.src = URL.createObjectURL(file)
			document.getElementById('leftImagePreview').style.display = "";
			document.getElementById('leftImageButton').style.display = "none";
			LeftImage.onload = function(){
				if (twoFaces) {
					if (!TopImage.src == "" && !RightImage.src == "") {
						if (document.getElementById('isStair').checked) {
							drawStairs(canvas)
						} else if (document.getElementById('isSlab').checked) {
							drawSlab(canvas)
						} else {
							drawCube(canvas)
						}
					};
				} else {
					if (!TopImage.src == "") {
						if (document.getElementById('isStair').checked) {
							drawStairs(canvas)
						} else if (document.getElementById('isSlab').checked) {
							drawSlab(canvas)
						} else {
							drawCube(canvas)
						}
					};
				}
			}
		}
	})
	document.getElementById('rightImage').addEventListener("change", function(event) {
		const [file] = document.getElementById('rightImage').files
		if (file) {
			document.getElementById('rightImagePreview').src = URL.createObjectURL(file)
			RightImage.src = URL.createObjectURL(file)
			document.getElementById('rightImagePreview').style.display = "";
			document.getElementById('rightImageButton').style.display = "none";
			RightImage.onload = function(){
				if (twoFaces) {
					if (!TopImage.src == "" && !LeftImage.src == "") {
						if (document.getElementById('isStair').checked) {
							drawStairs(canvas)
						} else if (document.getElementById('isSlab').checked) {
							drawSlab(canvas)
						} else {
							drawCube(canvas)
						}
					};
				} else {
					if (!TopImage.src == "") {
						if (document.getElementById('isStair').checked) {
							drawStairs(canvas)
						} else if (document.getElementById('isSlab').checked) {
							drawSlab(canvas)
						} else {
							drawCube(canvas)
						}
					};
				}
			}
		}
	})
	document.getElementById('shadowBlock').addEventListener("change", function(event) {
		if (!TopImage.src == "" && !LeftImage.src == "" && (twoFaces == false || !RightImage.src == "")) {
			if (document.getElementById('isStair').checked) {
				drawStairs(canvas)
			} else if (document.getElementById('isSlab').checked) {
				drawSlab(canvas)
			} else {
				drawCube(canvas)
			}
		};
	})
	document.getElementById('isSlab').addEventListener("change", function(event) {
		if (event.currentTarget.checked) {
			if (document.getElementById('isStair').checked) {document.getElementById('isStair').checked = false	}
			if (!TopImage.src == "" && !LeftImage.src == "" && (twoFaces == false || !RightImage.src == "")) {drawSlab(canvas)};
		} else {
			if (!TopImage.src == "" && !LeftImage.src == "" && (twoFaces == false || !RightImage.src == "")) {drawCube(canvas)};
		}
	})
	document.getElementById('isStair').addEventListener("change", function(event) {
		if (event.currentTarget.checked) {
			if (document.getElementById('isSlab').checked) {document.getElementById('isSlab').checked = false}
			if (!TopImage.src == "" && !LeftImage.src == "" && (twoFaces == false || !RightImage.src == "")) {drawStairs(canvas)};
		} else {
			if (!TopImage.src == "" && !LeftImage.src == "" && (twoFaces == false || !RightImage.src == "")) {drawCube(canvas)};
		}
	})
	document.getElementById('twoFaces').addEventListener("change", function(event) {
		if (event.currentTarget.checked) {
			document.getElementById('leftH3').innerText = "Left Image";
			document.getElementById('rightDiv').style.display = "";
			twoFaces = true;
			if (!TopImage.src == "" && !LeftImage.src == "" && !RightImage.src == "") {
				if (document.getElementById('isStair').checked) {
					drawStairs(canvas)
				} else if (document.getElementById('isSlab').checked) {
					drawSlab(canvas)
				} else {
					drawCube(canvas)
				}
			};
		} else {
			document.getElementById('leftH3').innerText = "Side Image";
			document.getElementById('rightDiv').style.display = "none";
			twoFaces = false;
			if (!TopImage.src == "" && !LeftImage.src == "") {
				if (document.getElementById('isStair').checked) {
					drawStairs(canvas)
				} else if (document.getElementById('isSlab').checked) {
					drawSlab(canvas)
				} else {
					drawCube(canvas)
				}
			};
		}
	})

});


function drawCube() {
	hasImage = true;
    const faceSize = 100
    const radians = 30 * Math.PI / 180;
    const cubeWidth = faceSize * Math.cos(radians) * 2;
    const centerPosition = {
        x: canvas.width / 2,
        y: canvas.height / 2
    };

	const ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	ctx.save();
	ctx.fillStyle = 'rgba(0, 0, 0, 0)';
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	ctx.imageSmoothingEnabled = false;


    const defaultMat = [1, 0, 0, 1, 0, 0];

    // Left side
    const leftMat = new DOMMatrix(defaultMat);
    leftMat.translateSelf(centerPosition.x - cubeWidth / 2, centerPosition.y - faceSize / 2);
    leftMat.skewYSelf(30);
    ctx.setTransform(leftMat);
    ctx.fillStyle = '#F00';
	ctx.drawImage(LeftImage, 0, 0, cubeWidth / 2, faceSize);

    // Right side
    const rightMat = new DOMMatrix(defaultMat);
    rightMat.translateSelf(centerPosition.x, centerPosition.y);
    rightMat.skewYSelf(-30);
    ctx.setTransform(rightMat);
    ctx.fillStyle = '#00F';
	if (twoFaces) {
		ctx.drawImage(RightImage, 0, 0, cubeWidth / 2, faceSize);
	} else {
		ctx.drawImage(LeftImage, 0, 0, cubeWidth / 2, faceSize);
	}
	
	if (document.getElementById('shadowBlock').checked) {
		//Change the a to control shadow
		ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
		ctx.fillRect(0, 0, cubeWidth / 2, faceSize);
	}

    // Top side
    const topMat = new DOMMatrix(defaultMat);
    const toOriginMat = new DOMMatrix(defaultMat);
    const fromOriginMat = new DOMMatrix(defaultMat);
    const rotMat = new DOMMatrix(defaultMat);
    const scaleMat = new DOMMatrix(defaultMat);

    toOriginMat.translateSelf(-faceSize / 2, -faceSize / 2);
	fromOriginMat.translateSelf(centerPosition.x, centerPosition.y - faceSize / 2);
    rotMat.rotateSelf(0, 0, 45);
    scaleMat.scaleSelf(1.24, (faceSize / cubeWidth) * 1.24);

    topMat.preMultiplySelf(toOriginMat);
    topMat.preMultiplySelf(rotMat);
    topMat.preMultiplySelf(scaleMat);
    topMat.preMultiplySelf(fromOriginMat);

    ctx.setTransform(topMat);
    ctx.fillStyle = '#FF0';
	ctx.drawImage(TopImage, 0, 0, faceSize, faceSize);
    ctx.restore();

}

function drawSlab() {
	hasImage = true;
    const faceSize = 100
    const radians = 30 * Math.PI / 180;
    const cubeWidth = faceSize * Math.cos(radians) * 2;
    const centerPosition = {
        x: canvas.width / 2,
        y: canvas.height / 2
    };

	const ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	ctx.save();
	ctx.fillStyle = 'rgba(0, 0, 0, 0)';
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	ctx.imageSmoothingEnabled = false;


    const defaultMat = [1, 0, 0, 1, 0, 0];

    // Left side
    const leftMat = new DOMMatrix(defaultMat);
    leftMat.translateSelf(centerPosition.x - cubeWidth / 2, centerPosition.y - faceSize / 2);
    leftMat.skewYSelf(30);
    ctx.setTransform(leftMat);
    ctx.fillStyle = '#F00';
	ctx.drawImage(LeftImage, 0, 0, LeftImage.width, LeftImage.height / 2, 0, 0 + (faceSize/2), cubeWidth / 2, faceSize/2);

    // Right side
    const rightMat = new DOMMatrix(defaultMat);
    rightMat.translateSelf(centerPosition.x, centerPosition.y);
    rightMat.skewYSelf(-30);
    ctx.setTransform(rightMat);
    ctx.fillStyle = '#00F';
	if (twoFaces) {
		ctx.drawImage(RightImage, 0, 0, RightImage.width, RightImage.height / 2, 0, 0 + (faceSize/2), cubeWidth / 2, faceSize/2);
	} else {
		ctx.drawImage(LeftImage, 0, 0, LeftImage.width, LeftImage.height / 2, 0, 0 + (faceSize/2), cubeWidth / 2, faceSize/2);
	}
	
	if (document.getElementById('shadowBlock').checked) {
		//Change the a to control shadow
		ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
		ctx.fillRect(0, 0 + (faceSize/2), cubeWidth / 2, faceSize / 2);
	}

    // Top side
    const topMat = new DOMMatrix(defaultMat);
    const toOriginMat = new DOMMatrix(defaultMat);
    const fromOriginMat = new DOMMatrix(defaultMat);
    const rotMat = new DOMMatrix(defaultMat);
    const scaleMat = new DOMMatrix(defaultMat);

    toOriginMat.translateSelf(-faceSize / 2, -faceSize / 2);
	fromOriginMat.translateSelf(centerPosition.x, (centerPosition.y - faceSize / 2) * 2);
    rotMat.rotateSelf(0, 0, 45);
    scaleMat.scaleSelf(1.24, (faceSize / cubeWidth) * 1.24);

    topMat.preMultiplySelf(toOriginMat);
    topMat.preMultiplySelf(rotMat);
    topMat.preMultiplySelf(scaleMat);
    topMat.preMultiplySelf(fromOriginMat);

    ctx.setTransform(topMat);
    ctx.fillStyle = '#FF0';
	ctx.drawImage(TopImage, 0, 0, faceSize, faceSize);
    ctx.restore();

}

function drawStairs() {
	hasImage = true;
    const faceSize = 100
    const radians = 30 * Math.PI / 180;
    const cubeWidth = faceSize * Math.cos(radians) * 2;
    const centerPosition = {
        x: canvas.width / 2,
        y: canvas.height / 2
    };

	const ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	ctx.save();
	ctx.fillStyle = 'rgba(0, 0, 0, 0)';
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	ctx.imageSmoothingEnabled = false;


    const defaultMat = [1, 0, 0, 1, 0, 0];

    // Left side
    const leftMat = new DOMMatrix(defaultMat);
    leftMat.translateSelf(centerPosition.x - cubeWidth / 2, centerPosition.y - faceSize / 2);
    leftMat.skewYSelf(30);
    ctx.setTransform(leftMat);
    ctx.fillStyle = '#F00';
	ctx.drawImage(LeftImage, 0, 0, LeftImage.width/2, LeftImage.height, 0, 0, cubeWidth / 4, faceSize);
	ctx.drawImage(LeftImage, 0, (LeftImage.height/2), LeftImage.width, (LeftImage.height/2), 0, faceSize/2, cubeWidth / 2, faceSize/2);

    // Right Bottom side
    const rightMat = new DOMMatrix(defaultMat);
    rightMat.translateSelf(centerPosition.x, centerPosition.y);
    rightMat.skewYSelf(-30);
    ctx.setTransform(rightMat);
    ctx.fillStyle = '#00F';
	if (twoFaces) {
		ctx.drawImage(RightImage, 0, (RightImage.height/2), RightImage.width, (RightImage.height/2), 0, faceSize/2, cubeWidth / 2, faceSize/2);
	} else {
		ctx.drawImage(LeftImage, 0, (LeftImage.height/2), LeftImage.width, (LeftImage.height/2), 0, faceSize/2, cubeWidth / 2, faceSize/2);
	}
	
	if (document.getElementById('shadowBlock').checked) {
		//Change the a to control shadow
		ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
		ctx.fillRect(0, faceSize/2, cubeWidth / 2, faceSize/2);
	}
	
	//Right Top side
    const rightMat2 = new DOMMatrix(defaultMat);
    rightMat2.translateSelf(centerPosition.x/2 + 1, centerPosition.y/4);
    rightMat2.skewYSelf(-30);
    ctx.setTransform(rightMat2);
	if (twoFaces) {
		ctx.drawImage(RightImage, 0, 0, RightImage.width, (RightImage.height/2), 0, faceSize/2, cubeWidth / 2, faceSize/2);
	} else {
		ctx.drawImage(LeftImage, 0, 0, LeftImage.width, (LeftImage.height/2), 0, faceSize/2, cubeWidth / 2, faceSize/2);
	}
	if (document.getElementById('shadowBlock').checked) {
		//Change the a to control shadow
		ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
		ctx.fillRect(0, faceSize/2, cubeWidth / 2, faceSize/2);
	}
    

    // Top side
    const topMat = new DOMMatrix(defaultMat);
    const toOriginMat = new DOMMatrix(defaultMat);
    const fromOriginMat = new DOMMatrix(defaultMat);
    const rotMat = new DOMMatrix(defaultMat);
    const scaleMat = new DOMMatrix(defaultMat);

    toOriginMat.translateSelf(-faceSize / 2, -faceSize / 2);
	fromOriginMat.translateSelf(centerPosition.x, centerPosition.y - faceSize / 2);
    rotMat.rotateSelf(0, 0, 45);
    scaleMat.scaleSelf(1.24, (faceSize / cubeWidth) * 1.24);

    topMat.preMultiplySelf(toOriginMat);
    topMat.preMultiplySelf(rotMat);
    topMat.preMultiplySelf(scaleMat);
    topMat.preMultiplySelf(fromOriginMat);

    ctx.setTransform(topMat);
    ctx.fillStyle = '#FF0';
	ctx.drawImage(TopImage, 0, 0, (TopImage.width/2), TopImage.height, 0, 0, faceSize / 2, faceSize);
	
	// Top Bottom side
    const topMat2 = new DOMMatrix(defaultMat);
    const toOriginMat2 = new DOMMatrix(defaultMat);
    const fromOriginMat2 = new DOMMatrix(defaultMat);
    const rotMat2 = new DOMMatrix(defaultMat);
    const scaleMat2 = new DOMMatrix(defaultMat);

    toOriginMat2.translateSelf(-faceSize / 2, -faceSize / 2);
	fromOriginMat2.translateSelf((centerPosition.x*1.5)-2, centerPosition.y*1.25);
    rotMat2.rotateSelf(0, 0, 45);
    scaleMat2.scaleSelf(1.24, (faceSize / cubeWidth) * 1.24);

    topMat2.preMultiplySelf(toOriginMat2);
    topMat2.preMultiplySelf(rotMat2);
    topMat2.preMultiplySelf(scaleMat2);
    topMat2.preMultiplySelf(fromOriginMat2);

    ctx.setTransform(topMat2);
    ctx.fillStyle = '#FF0';
	ctx.drawImage(TopImage, (TopImage.width/2), 0, (TopImage.width/2), TopImage.height, 0, 0, faceSize / 2 + 1, faceSize);
    ctx.restore();

}

function downloadCube() {
	if (hasImage) {
		let downloadLink = document.createElement('a');
		downloadLink.download = 'CRBlock.png';
		downloadLink.href = document.getElementById('blockCanvas').toDataURL();
		downloadLink.click();
	}
}