<script>
import { onMount } from 'svelte';
import * as THREE from 'three';
const textureLoader = new THREE.TextureLoader();
let images = {};
let twoFaces = false;
let hasImage = false;
let hasShadow = true;
let isSlab = false;
let isStair = false;
let scene = {}
let camera = {position: {x: 0, y: 0, z: 0}}
let renderer = {}
let shape;
let shape2;
let shape3;
let shadow;
let shadow2;
let shadow3;

$: camera.position.z = camera.position.x


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
				configureStairs();
			} else if (isSlab) {
				configureSlab();
			} else {
				configureCube();
			}
		};
	} else {
		if (!images['leftImage'].src == "" && !images['topImage'].src == "") {
			if (isStair) {
				configureStairs();
			} else if (isSlab) {
				configureSlab();
			} else {
				configureCube();
			}
		};
	}
}

const slabOrStair = (type) => {
	if (type == 'slab') {
		if (document.getElementById('isStair').checked) {
			isStair = false
		};
	} else if (type == 'stair') {
		if (document.getElementById('isSlab').checked) {
			isSlab = false
		}
	}
	updateCanvas();
}

const removeOld = () => {
	if (shape) {
        scene.remove(shape);
        scene.remove(shape2);
        scene.remove(shape3);
        scene.remove(shadow2);
        scene.remove(shadow3);
        scene.remove(shadow);
    }
}

onMount(() => {
	images.leftImage = new Image();
	images.rightImage = new Image();
	images.topImage = new Image();
	initThree()
	renderer.setAnimationLoop( drawLoop );
})

function initThree() {
	scene = new THREE.Scene();

	camera = new THREE.OrthographicCamera(-1,1,1,-1,0.1,1000);

	renderer = new THREE.WebGLRenderer({
		preserveDrawingBuffer: true, 
		canvas: document.getElementById('blockCanvas'),
		alpha: true
	});

	renderer.setSize( 300, 300 );

	camera.position.z = 6;
	camera.position.x = 6;
	camera.position.y = 4.9;
	camera.lookAt(0, 0, 0);
}

function configureCube() {
	removeOld();
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
	removeOld();

	const textureLeft = textureLoader.load(images['leftImage'].src);
	textureLeft.magFilter = THREE.NearestFilter;
	textureLeft.colorSpace = THREE.SRGBColorSpace;
	textureLeft.repeat.set(1, 0.5);
	textureLeft.offset.set(0, 0.5);

	let textureRight;
	if (twoFaces) {
		textureRight = textureLoader.load(images['rightImage'].src);
	} else {
		textureRight = textureLoader.load(images['leftImage'].src);
	}
	textureRight.magFilter = THREE.NearestFilter;
	textureRight.colorSpace = THREE.SRGBColorSpace;
	textureRight.repeat.set(1, 0.5);
	textureRight.offset.set(0, 0.5);

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

function configureStairs() {
	removeOld();

	const textureLeft = textureLoader.load(images['leftImage'].src);
	textureLeft.magFilter = THREE.NearestFilter;
	textureLeft.colorSpace = THREE.SRGBColorSpace;
	textureLeft.repeat.set(0.5, 0.5);

	let textureRight;
	if (twoFaces) {
		textureRight = textureLoader.load(images['rightImage'].src);
	} else {
		textureRight = textureLoader.load(images['leftImage'].src);
	}
	textureRight.magFilter = THREE.NearestFilter;
	textureRight.colorSpace = THREE.SRGBColorSpace;
	textureRight.repeat.set(1, 0.5);

	const materials = [
		new THREE.MeshBasicMaterial( { color: 0x000000, transparent: true, opacity: 0 } ),  // True Right
		new THREE.MeshBasicMaterial( { color: 0x000000 } ),  // Ignore
		new THREE.MeshBasicMaterial( { color: 0x000000, transparent: true, opacity: 0 } ),   // True Top
		new THREE.MeshBasicMaterial( { color: 0x000000 } ),// Ignore
		new THREE.MeshBasicMaterial( { map: textureLeft, transparent: true, alphaTest: 0.5 } ),  // True Left
		new THREE.MeshBasicMaterial( { color: 0x000000 } )   // Ignore
	];

	const geometry = new THREE.BoxGeometry( 0.625, 0.635, 1.25 );
	shape = new THREE.Mesh( geometry, materials );
	shape.position.set(-0.3125, -0.3175, 0);
	scene.add( shape );
	
	const textureLeft2 = textureLoader.load(images['leftImage'].src);
	textureLeft2.magFilter = THREE.NearestFilter;
	textureLeft2.colorSpace = THREE.SRGBColorSpace;
	textureLeft2.repeat.set(0.5, 0.5);
	textureLeft2.offset.set(0, 0.5);

	let textureRight2;
	if (twoFaces) {
		textureRight2 = textureLoader.load(images['rightImage'].src);
	} else {
		textureRight2 = textureLoader.load(images['leftImage'].src);
	}
	textureRight2.magFilter = THREE.NearestFilter;
	textureRight2.colorSpace = THREE.SRGBColorSpace;
	textureRight2.repeat.set(1, 0.5);
	textureRight2.offset.set(0, 0.5);

	const textureTop2 = textureLoader.load(images['topImage'].src);
	textureTop2.magFilter = THREE.NearestFilter;
	textureTop2.colorSpace = THREE.SRGBColorSpace;
	textureTop2.repeat.set(1, 0.5);
	textureTop2.offset.set(0, 0.25);
	textureTop2.rotation = Math.PI / 2;
	textureTop2.center.set(0.5, 0.5);

	const materials2 = [
		new THREE.MeshBasicMaterial( { map: textureRight2, transparent: true, alphaTest: 0.5 } ),  // True Right
		new THREE.MeshBasicMaterial( { color: 0x000000 } ),  // Ignore
		new THREE.MeshBasicMaterial( { map: textureTop2, transparent: true, alphaTest: 0.5 } ),   // True Top
		new THREE.MeshBasicMaterial( { color: 0x000000 } ),// Ignore
		new THREE.MeshBasicMaterial( { map: textureLeft2, transparent: true, alphaTest: 0.5 } ),  // True Left
		new THREE.MeshBasicMaterial( { color: 0x000000 } )   // Ignore
	];
	
	shape2 = new THREE.Mesh( geometry, materials2 );
	shape2.position.set(-0.3125, 0.3175, 0);
	scene.add( shape2 );

	const textureLeft3 = textureLoader.load(images['leftImage'].src);
	textureLeft3.magFilter = THREE.NearestFilter;
	textureLeft3.colorSpace = THREE.SRGBColorSpace;
	textureLeft3.repeat.set(0.5, 0.5);
	textureLeft3.offset.set(0.5, 0);

	let textureRight3;
	if (twoFaces) {
		textureRight3 = textureLoader.load(images['rightImage'].src);
	} else {
		textureRight3 = textureLoader.load(images['leftImage'].src);
	}
	textureRight3.magFilter = THREE.NearestFilter;
	textureRight3.colorSpace = THREE.SRGBColorSpace;
	textureRight3.repeat.set(1, 0.5);
	textureRight3.offset.set(0, 0);

	const textureTop3 = textureLoader.load(images['topImage'].src);
	textureTop3.magFilter = THREE.NearestFilter;
	textureTop3.colorSpace = THREE.SRGBColorSpace;
	textureTop3.repeat.set(1, 0.5);
	textureTop3.offset.set(0, -0.25);
	textureTop3.rotation = Math.PI / 2;
	textureTop3.center.set(0.5, 0.5);

	const materials3 = [
		new THREE.MeshBasicMaterial( { map: textureRight3, transparent: true, alphaTest: 0.5 } ),  // True Right
		new THREE.MeshBasicMaterial( { color: 0x000000 } ),  // Ignore
		new THREE.MeshBasicMaterial( { map: textureTop3, transparent: true, alphaTest: 0.5 } ),   // True Top
		new THREE.MeshBasicMaterial( { color: 0x000000 } ),// Ignore
		new THREE.MeshBasicMaterial( { map: textureLeft3, transparent: true, alphaTest: 0.5 } ),  // True Left
		new THREE.MeshBasicMaterial( { color: 0x000000 } )   // Ignore
	];
	
	shape3 = new THREE.Mesh( geometry, materials3 );
	shape3.position.set(0.3125, -0.3175, 0);
	scene.add( shape3 );


	if (hasShadow) {
		const shadowGeometry = new THREE.BoxGeometry( 0.625, 0.635, 1.25 );
		const shadowMaterial = [
			new THREE.MeshBasicMaterial( { color: 0x000000, transparent: true, opacity: 0 } ),  // True Right
			new THREE.MeshBasicMaterial( { color: 0x000000 } ),  // Ignore
			new THREE.MeshBasicMaterial( { color: 0x000000, transparent: true, opacity: 0 } ),   // True Top
			new THREE.MeshBasicMaterial( { color: 0x000000 } ),// Ignore
			new THREE.MeshBasicMaterial( { map: textureLeft, color: 0x000000, transparent: true, opacity: 0.1, alphaTest: 0 } ),  // True Left
			new THREE.MeshBasicMaterial( { color: 0x000000 } )   // Ignore
		];

		shadow = new THREE.Mesh( shadowGeometry, shadowMaterial );
		shadow.position.set(-0.3125, -0.3175, 0);
		scene.add( shadow );
		
		const shadowMaterial2 = [
			new THREE.MeshBasicMaterial( { map: textureRight2, color: 0x000000, transparent: true, opacity: 0.3, alphaTest: 0 } ),  // True Right
			new THREE.MeshBasicMaterial( { color: 0x000000 } ),  // Ignore
			new THREE.MeshBasicMaterial( { color: 0x000000, transparent: true, opacity: 0 } ),   // True Top
			new THREE.MeshBasicMaterial( { color: 0x000000 } ),// Ignore
			new THREE.MeshBasicMaterial( { map: textureLeft2, color: 0x000000, transparent: true, opacity: 0.1, alphaTest: 0 } ),  // True Left
			new THREE.MeshBasicMaterial( { color: 0x000000 } )   // Ignore
		];

		shadow2 = new THREE.Mesh( shadowGeometry, shadowMaterial2 );
		shadow2.position.set(-0.3125, 0.3175, 0);
		scene.add( shadow2 );
		
		const shadowMaterial3 = [
			new THREE.MeshBasicMaterial( { map: textureRight3, color: 0x000000, transparent: true, opacity: 0.3, alphaTest: 0 } ),  // True Right
			new THREE.MeshBasicMaterial( { color: 0x000000 } ),  // Ignore
			new THREE.MeshBasicMaterial( { color: 0x000000, transparent: true, opacity: 0 } ),   // True Top
			new THREE.MeshBasicMaterial( { color: 0x000000 } ),// Ignore
			new THREE.MeshBasicMaterial( { map: textureLeft3, color: 0x000000, transparent: true, opacity: 0.1, alphaTest: 0 } ),  // True Left
			new THREE.MeshBasicMaterial( { color: 0x000000 } )   // Ignore
		];
		shadow3 = new THREE.Mesh( shadowGeometry, shadowMaterial3 );
		shadow3.position.set(0.3125, -0.3175, 0);
		scene.add( shadow3 );
	}


	renderer.render(scene, camera);
	hasImage = true;
}

function drawLoop() {
	renderer.render( scene, camera );
}

function downloadCube() {
	let downloadLink = document.createElement('a');
	downloadLink.download = 'CRBlock.png';
	downloadLink.href = document.getElementById('blockCanvas').toDataURL();
	downloadLink.click();
}
</script>

<div style="width: fit-content;text-align:center;">
	<h3>Top Image</h3>
	<input type='file' id="topImage" style="display:none" on:change={() => updateImage('topImage')}>
	<button id="topImageButton" onclick="document.getElementById('topImage').click()" style="padding: 0;height: fit-content;"><i class='bx bx-image-add bx-md'></i></button>
	<img id="topImagePreview" alt="Preview of the top" onclick="document.getElementById('topImage').click()" src="" style="display:none;width: 50px;image-rendering: pixelated;">
</div>
<div style="display:flex;text-align:center;">
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
			<img id="rightImagePreview" alt="Preview of the right" onclick="document.getElementById('rightImage').click()" src="{images['rightImage'].src ? images['rightImage'].src : ''}" style="width: 50px;image-rendering: pixelated;display:{images['rightImage'].src ? '' : 'none'}">
			<button id="rightImageButton" onclick="document.getElementById('rightImage').click()" style="padding: 0;height: fit-content;display:{images['rightImage'].src ? 'none' : ''}">
				<i class='bx bx-image-add bx-md'></i>
			</button>
		</div>
	{/if}
</div>
<input type="checkbox" id="twoFaces" bind:checked={twoFaces} on:change={updateCanvas}><label for="twoFaces">Two Sides</label>
<br>
<input type="checkbox" id="shadowBlock" bind:checked={hasShadow} on:change={updateCanvas}><label for="shadowBlock">Has Shadow</label>
<br>
<input type="checkbox" id="isSlab" bind:checked={isSlab} on:change={() => slabOrStair('slab')}><label for="isSlab">Is Slab</label>
<br>
<input type="checkbox" id="isStair" bind:checked={isStair} on:change={() => slabOrStair('stair')}><label for="isStair">Is Stair</label>
<br>
<label for="x">Camera Position X and Z</label>
<input type="number" name="x" id="x" bind:value={camera.position.x} on:input={() => {camera.lookAt(0, 0, 0);}}>
<br>
<label for="x">Camera Position Y</label>
<input type="number" name="y" id="y" bind:value={camera.position.y} on:input={() => {camera.lookAt(0, 0, 0);}}>
<h3>Block Renderer</h3>
<div style="display: flex;flex-direction: column;width: fit-content;
">
	<canvas width="300" height="300" id="blockCanvas" ></canvas>
	{#if hasImage}
		<button on:click={downloadCube} style="padding: 0;height: fit-content;">Download Cube <i class='bx bxs-download'></i></button>
	{/if}
</div>

<style>
	h3 {
		margin-bottom:5px;
		margin-right:10px;
		margin-top: 5px;
	}
	label {
		margin-left: 4px;
	}
</style>