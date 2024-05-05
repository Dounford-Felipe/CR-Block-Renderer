const SideImage = new Image();
const TopImage = new Image();
let canvas = ""

window.addEventListener("load", function(event) {
    canvas = document.getElementById('blockCanvas')
    canvas.width = 180;
    canvas.height = 200;
    document.body.appendChild(canvas);
	document.getElementById('topImage').addEventListener("change", function(event) {
		const [file] = document.getElementById('topImage').files
		if (file) {
			document.getElementById('topImagePreview').src = URL.createObjectURL(file)
			TopImage.src = URL.createObjectURL(file)
			document.getElementById('topImagePreview').style.display = "";
			document.getElementById('topImageButton').style.display = "none";
			TopImage.onload = function(){
				if (!SideImage.src == "") {drawCube(canvas)};
			}
		}
	})
	document.getElementById('sideImage').addEventListener("change", function(event) {
		const [file] = document.getElementById('sideImage').files
		if (file) {
			document.getElementById('sideImagePreview').src = URL.createObjectURL(file)
			SideImage.src = URL.createObjectURL(file)
			document.getElementById('sideImagePreview').style.display = "";
			document.getElementById('sideImageButton').style.display = "none";
			SideImage.onload = function(){
				if (!TopImage.src == "") {drawCube(canvas)};
			}
		}
	})

});


function drawCube() {
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

    const defaultMat = [1, 0, 0, 1, 0, 0];

    // Left (red) side
    const leftMat = new DOMMatrix(defaultMat);
    leftMat.translateSelf(centerPosition.x - cubeWidth / 2, centerPosition.y - faceSize / 2);
    leftMat.skewYSelf(30);
    ctx.setTransform(leftMat);
    ctx.fillStyle = '#F00';
	ctx.drawImage(SideImage, 0, 0, cubeWidth / 2, faceSize);

    // Right (blue) side
    const rightMat = new DOMMatrix(defaultMat);
    rightMat.translateSelf(centerPosition.x, centerPosition.y);
    rightMat.skewYSelf(-30);
    ctx.setTransform(rightMat);
    ctx.fillStyle = '#00F';
	ctx.drawImage(SideImage, 0, 0, cubeWidth / 2, faceSize);
	
	//Change the a to control shadow
	ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
	ctx.fillRect(0, 0, cubeWidth / 2, faceSize);

    // Top (yellow) side
    const topMat = new DOMMatrix(defaultMat);
    const toOriginMat = new DOMMatrix(defaultMat);
    const fromOriginMat = new DOMMatrix(defaultMat);
    const rotMat = new DOMMatrix(defaultMat);
    const scaleMat = new DOMMatrix(defaultMat);

    toOriginMat.translateSelf(-faceSize / 2, -faceSize / 2);
    fromOriginMat.translateSelf(centerPosition.x, centerPosition.y - faceSize / 2);
    rotMat.rotateSelf(0, 0, -45);
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

function downloadCube() {
	if (TopImage.src == "" || SideImage.src == "") {
		return;
	} else {
		let downloadLink = document.createElement('a');
		downloadLink.download = 'CRBlock.png';
		downloadLink.href = document.getElementById('blockCanvas').toDataURL();
		downloadLink.click();
	}
}