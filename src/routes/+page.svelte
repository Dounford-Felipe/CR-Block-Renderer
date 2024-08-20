<script>
import { onMount } from 'svelte';
import * as THREE from 'three';
const textureLoader = new THREE.TextureLoader();
let images = {};
let twoFaces = false;
let hasImage = false;
let hasShadow = false;
let isSlab = false;
let isStair = false;
let frontShadow = 0;
let sideShadow = 0;
let scene = {}
let camera = {position: {x: 0, y: 0, z: 0}}
let renderer = {}
let shape;
let shadow;


const updateImage = (image) => {
	const [file] = document.getElementById(image).files
	if (file) {
		document.getElementById(image + 'Preview').src = URL.createObjectURL(file);
		images[image].src = URL.createObjectURL(file);
		document.getElementById(image + 'Preview').style.display = "";
		document.getElementById(image + 'Button').style.display = "none";
		images[image].onload = function(){
			updateCanvas();
		}
	}	
}

const updateCanvas = () => {
	if (twoFaces) {
		if (!images['leftImage'].src == "" && !images['rightImage'].src == "" && !images['topImage'].src == "") {
			if (isStair) {
				
			} else if (isSlab) {
				configureSlab();
			} else {
				configureCube();
			}
		};
	} else {
		if (!images['leftImage'].src == "" && !images['topImage'].src == "") {
			if (isStair) {
				
			} else if (isSlab) {
				configureSlab();
			} else {
				configureCube();
			}
		};
	}
}

/* const slabOrStair = (type) => {
	if (type == 'slab') {
		if (document.getElementById('isStair').checked) {
			isStair = false
		};
		updateCanvas();
	} else if (type == 'stair') {
		if (document.getElementById('isSlab').checked) {
			isSlab = false
		}
		updateCanvas();
	}
} */

onMount(() => {
	images.leftImage = new Image();
	images.rightImage = new Image();
	images.topImage = new Image();
	images['leftImage'].src = "./grass_side.png";
	images['topImage'].src = "./grass_top.png";
	images['rightImage'].src = "./leaves.png";
	initThree()
	renderer.setAnimationLoop( drawLoop );
})

function initThree() {
	scene = new THREE.Scene();

	camera = new THREE.OrthographicCamera(-1,1,1,-1,0.1,1000);

	renderer = new THREE.WebGLRenderer({
		preserveDrawingBuffer: true, 
		canvas: document.getElementById('blockCanvas'),
		alpha: true,
		antilias: true
	});

	renderer.setSize( 300, 300 );

	camera.position.z = 6;
	camera.position.x = 6;
	camera.position.y = 5;
	camera.lookAt(0, 0, 0);
	renderer.setPixelRatio(window.devicePixelRatio);
	configureCube();
}

function configureCube() {
	if (shape) {
        scene.remove(shape);
    }
	if (shadow) {
        scene.remove(shadow);
    }
	const textureLeft = textureLoader.load(images['leftImage'].src);
	textureLeft.magFilter = THREE.NearestFilter;
	textureLeft.colorSpace = THREE.SRGBColorSpace;

	let textureRight;
	if (twoFaces) {
		textureRight = textureLoader.load(images['rightImage'].src);
	} else {
		textureRight = textureLoader.load(images['leftImage'].src);
	}
	textureRight.magFilter = THREE.NearestFilter;
	textureRight.colorSpace = THREE.SRGBColorSpace;

	const textureTop = textureLoader.load(images['topImage'].src);
	textureTop.magFilter = THREE.NearestFilter;
	textureTop.colorSpace = THREE.SRGBColorSpace;
	textureTop.rotation = Math.PI / 2;
	textureTop.center.set(0.5, 0.5);

	const materials = [
		new THREE.MeshBasicMaterial( { map: textureRight, transparent: true, alphaTest: 0.9 } ),  // True Right
		new THREE.MeshBasicMaterial( { color: 0x000000 } ),  // Ignore
		new THREE.MeshBasicMaterial( { map: textureTop, transparent: true, alphaTest: 0.5 } ),   // True Top
		new THREE.MeshBasicMaterial( { color: 0x000000 } ),// Ignore
		new THREE.MeshBasicMaterial( { map: textureLeft, transparent: true, alphaTest: 0.5 } ),  // True Left
		new THREE.MeshBasicMaterial( { color: 0x000000 } )   // Ignore
	];

	const geometry = new THREE.BoxGeometry( 1.25, 1.27, 1.25 );
	shape = new THREE.Mesh( geometry, materials );
	scene.add( shape );


	if (hasShadow) {
		const shadowGeometry = new THREE.BoxGeometry( 1.25, 1.27, 1.25 );
		const shadowMaterial = [
			new THREE.MeshBasicMaterial({ map: textureRight, color: 0x000000, transparent: true, opacity: 0.3, alphaTest: 0 }), // Right Side Shadow
			new THREE.MeshBasicMaterial({ color: 0x000000 }), // Ignore
			new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 }), // Top Side Shadow
			new THREE.MeshBasicMaterial({ color: 0x000000 }), // Ignore
			new THREE.MeshBasicMaterial({ map: textureLeft, color: 0x000000, transparent: true, opacity: 0.1, alphaTest: 0 }), // Left Side Shadow
			new THREE.MeshBasicMaterial({ color: 0x000000 })  // Ignore
		];
		shadow = new THREE.Mesh( shadowGeometry, shadowMaterial );
		scene.add( shadow );
	}


	renderer.render(scene, camera);
	hasImage = true;
}

function configureSlab() {
	if (shape) {
        scene.remove(shape);
    }
	if (shadow) {
        scene.remove(shadow);
    }
	const textureLeft = textureLoader.load(images['leftImage'].src);
	textureLeft.magFilter = THREE.NearestFilter;
	textureLeft.colorSpace = THREE.SRGBColorSpace;

	let textureRight;
	if (twoFaces) {
		textureRight = textureLoader.load(images['rightImage'].src);
	} else {
		textureRight = textureLoader.load(images['leftImage'].src);
	}
	textureRight.magFilter = THREE.NearestFilter;
	textureRight.colorSpace = THREE.SRGBColorSpace;

	const textureTop = textureLoader.load(images['topImage'].src);
	textureTop.magFilter = THREE.NearestFilter;
	textureTop.colorSpace = THREE.SRGBColorSpace;
	textureTop.rotation = Math.PI / 2;
	textureTop.center.set(0.5, 0.5);

	const materials = [
		new THREE.MeshBasicMaterial( { map: textureRight, transparent: true, alphaTest: 0.9 } ),  // True Right
		new THREE.MeshBasicMaterial( { color: 0x000000 } ),  // Ignore
		new THREE.MeshBasicMaterial( { map: textureTop, transparent: true, alphaTest: 0.5 } ),   // True Top
		new THREE.MeshBasicMaterial( { color: 0x000000 } ),// Ignore
		new THREE.MeshBasicMaterial( { map: textureLeft, transparent: true, alphaTest: 0.5 } ),  // True Left
		new THREE.MeshBasicMaterial( { color: 0x000000 } )   // Ignore
	];

	const geometry = new THREE.BoxGeometry( 1.25, 0.635, 1.25 );
	shape = new THREE.Mesh( geometry, materials );
	scene.add( shape );


	if (hasShadow) {
		const shadowGeometry = new THREE.BoxGeometry( 1.25, 0.635, 1.25 );
		const shadowMaterial = [
			new THREE.MeshBasicMaterial({ map: textureRight, color: 0x000000, transparent: true, opacity: 0.3, alphaTest: 0 }), // Right Side Shadow
			new THREE.MeshBasicMaterial({ color: 0x000000 }), // Ignore
			new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 }), // Top Side Shadow
			new THREE.MeshBasicMaterial({ color: 0x000000 }), // Ignore
			new THREE.MeshBasicMaterial({ map: textureLeft, color: 0x000000, transparent: true, opacity: 0.1, alphaTest: 0 }), // Left Side Shadow
			new THREE.MeshBasicMaterial({ color: 0x000000 })  // Ignore
		];
		shadow = new THREE.Mesh( shadowGeometry, shadowMaterial );
		scene.add( shadow );
	}


	renderer.render(scene, camera);
	hasImage = true;
}

function drawLoop() {
	renderer.render( scene, camera );
}

function downloadCube() {
	if (hasImage) {
		let downloadLink = document.createElement('a');
		downloadLink.download = 'CRBlock.png';
		downloadLink.href = document.getElementById('blockCanvas').toDataURL();
		downloadLink.click();
	}
}
</script>

<div style="width: fit-content;">
	<h3>Top Image</h3>
	<input type='file' id="topImage" style="display:none" on:change={() => updateImage('topImage')}>
	<button id="topImageButton" onclick="document.getElementById('topImage').click()" style="padding: 0;height: fit-content;"><i class='bx bx-image-add bx-md'></i></button>
	<img id="topImagePreview" alt="Preview of the top" onclick="document.getElementById('topImage').click()" src="" style="display:none;width: 50px;image-rendering: pixelated;">
</div>
<div style="display:flex">
	<div>
		<h3 id="leftH3">{twoFaces ? "Left Image" : "Side Image"}</h3>
		<input type='file' id="leftImage" style="display:none" on:change={() => updateImage('leftImage')}>
		<button id="leftImageButton" onclick="document.getElementById('leftImage').click()" style="padding: 0;height: fit-content;"><i class='bx bx-image-add bx-md'></i></button>
		<img id="leftImagePreview" alt="Preview of the left" onclick="document.getElementById('leftImage').click()" src="" style="display:none;width: 50px;image-rendering: pixelated;">
	</div>
	{#if twoFaces}
		<div id="rightDiv">
			<h3>Right Image</h3>
			<input type='file' id="rightImage" style="display:none" on:change={() => updateImage('rightImage')}>
			<button id="rightImageButton" onclick="document.getElementById('rightImage').click()" style="padding: 0;height: fit-content;"><i class='bx bx-image-add bx-md'></i></button>
			<img id="rightImagePreview" alt="Preview of the right" onclick="document.getElementById('rightImage').click()" src="" style="display:none;width: 50px;image-rendering: pixelated;">
		</div>
	{/if}
</div>
<br>
<br>
<input type="checkbox" id="twoFaces" bind:checked={twoFaces} on:change={updateCanvas}><span>Two Sides</span>
<br>
<input type="checkbox" id="shadowBlock" bind:checked={hasShadow} on:change={updateCanvas}><span>Has Shadow</span>
<br>
<input type="checkbox" id="isSlab" bind:checked={isSlab} on:change={updateCanvas}><span>Is Slab</span>
<br>
<label for="x">Camera Position X</label>
<input type="number" name="x" id="x" bind:value={camera.position.x} on:input={() => {camera.lookAt(0, 0, 0);}}>
<br>
<label for="x">Camera Position Y</label>
<input type="number" name="y" id="y" bind:value={camera.position.y} on:input={() => {camera.lookAt(0, 0, 0);}}>
<br>
<label for="x">Camera Position Z</label>
<input type="number" name="z" id="z" bind:value={camera.position.z} on:input={() => {camera.lookAt(0, 0, 0);}}>
<!-- <br>
<input type="checkbox" id="isStair" bind:checked={isStair} on:change={() => slabOrStair('stair')}><span>Is Stair</span> -->
<h3>Block Renderer</h3>
{#if hasImage}
	<button on:click={downloadCube} style="padding: 0;height: fit-content;">Download Cube <i class='bx bxs-download'></i></button>
{/if}
<div style="display: flex;">
	<canvas width="300" height="300" id="blockCanvas" ></canvas>
</div>

<style>
	div {
		text-align:center;
	} 
	h3 {
		margin-bottom:5px;
		margin-right:10px;
	}
	span {
		margin-left: 4px;
	}
</style>