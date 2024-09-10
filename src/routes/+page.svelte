<script>
import { onMount } from 'svelte';
import imageCompression from 'browser-image-compression';
import * as THREE from 'three';
const textureLoader = new THREE.TextureLoader();
let images = {};
let twoFaces = false;
let hasImage = false;
let hasShadow = true;
let isSlab = false;
let isStair = false;
let isItem = false;
let scene = {}
let camera = {position: {x: 0, y: 0, z: 0}}
let renderer = {}
let shape;
let shape2 = {rotation: {x: 0, y: 0, z: 0}};
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
	} else if (isItem) {
		if (!images['topImage'].src == "") {
			configureItem();
		}
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

const renderType = (type) => {
	if (type == 'slab') {
		isStair = false
		isItem = false
	} else if (type == 'stair') {
		isSlab = false
		isItem = false
	} else if (type == 'item') {
		isSlab = false
		isStair = false
		twoFaces = false
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
		shape2.rotation.y = 0;
		shadow.rotation.y = 0;
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

function configureItem() {
	removeOld();
	const texture = textureLoader.load(images['topImage'].src);
	texture.magFilter = THREE.NearestFilter;
	texture.colorSpace = THREE.SRGBColorSpace;

	const material = new THREE.MeshBasicMaterial( { map: texture, transparent: true, alphaTest: 0.9 } )

	const geometry = new THREE.PlaneGeometry( 2, 2 );
	shape = new THREE.Mesh( geometry, material );
	scene.add( shape );

	shape2 = new THREE.Mesh( geometry, material );
	shape2.rotation.y = 1
	scene.add( shape2 );

	if (hasShadow) {
		const shadowGeometry = new THREE.PlaneGeometry( 2, 2 );
		const shadowMaterial = new THREE.MeshBasicMaterial({ map: texture, color: 0x000000, transparent: true, opacity: 0.3, alphaTest: 0 });
		shadow = new THREE.Mesh( shadowGeometry, shadowMaterial );
		shadow.rotation.y = 1
		scene.add( shadow );
	}

	renderer.render(scene, camera);
	hasImage = true;
}

function drawLoop() {
	renderer.render( scene, camera );
}

async function compressImage() {
	const dataFile = document.getElementById('blockCanvas').toDataURL();

	const imageFile = await (await fetch(dataFile)).blob();

	const options = {
		maxSizeMB: 1,
		maxWidthOrHeight: 1920,
		useWebWorker: true,
	}
	try {
		const compressedFile = await imageCompression(imageFile, options);

		await downloadCompressed(compressedFile);
	} catch (error) {
		console.log(error);
	}

}

function downloadCompressed(image) {
	let downloadLink = document.createElement('a');
	downloadLink.download = 'CRBlock.png';
	downloadLink.href = URL.createObjectURL(image);
	downloadLink.click();
}

</script>

<div style="width: fit-content;text-align:center;">
	<h3>{isItem ? "Item Image" : "Top Image"}</h3>
	<input type='file' id="topImage" style="display:none" on:change={() => updateImage('topImage')}>
	<button id="topImageButton" onclick="document.getElementById('topImage').click()" style="padding: 0;height: fit-content;"><i class='bx bx-image-add bx-md'></i></button>
	<img id="topImagePreview" alt="Preview of the top" onclick="document.getElementById('topImage').click()" src="" style="display:none;width: 50px;image-rendering: pixelated;">
</div>
{#if !isItem}
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
{/if}
<input type="checkbox" id="twoFaces" bind:checked={twoFaces} on:change={updateCanvas}><label for="twoFaces">Two Sides</label>
<br>
<input type="checkbox" id="shadowBlock" bind:checked={hasShadow} on:change={updateCanvas}><label for="shadowBlock">Has Shadow</label>
<br>
<input type="checkbox" id="isSlab" bind:checked={isSlab} on:change={() => renderType('slab')}><label for="isSlab">Is Slab</label>
<br>
<input type="checkbox" id="isStair" bind:checked={isStair} on:change={() => renderType('stair')}><label for="isStair">Is Stair</label>
<br>
<input type="checkbox" id="isItem" bind:checked={isItem} on:change={() => renderType('item')}><label for="isItem">Is Item</label>

<h3>Block Renderer</h3>
<div style="display: flex;flex-direction: column;width: fit-content;
">
	<canvas width="300" height="300" id="blockCanvas" ></canvas>
	{#if hasImage}
		<button on:click={compressImage} style="padding: 0;height: fit-content;">Download Cube <i class='bx bxs-download'></i></button>
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