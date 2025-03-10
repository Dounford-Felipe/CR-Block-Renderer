<script>
import { onMount } from 'svelte';
import imageCompression from 'browser-image-compression';
import * as THREE from 'three';
const textureLoader = new THREE.TextureLoader();
const cubeModel = [
	{
		"localBounds": [0,0,0, 16,16,16],
		"faces":
		{
			"localNegX": {"uv": [ 0, 0, 16, 16 ], "texture": "side"},
			"localPosX": {"uv": [ 0, 0, 16, 16 ], "texture": "side"},

			"localNegY": {"uv": [ 0, 0, 16, 16 ], "texture": "bottom"},
			"localPosY": {"uv": [ 0, 0, 16, 16 ], "texture": "top"},

			"localNegZ": {"uv": [ 0, 0, 16, 16 ], "texture": "side"},
			"localPosZ": {"uv": [ 0, 0, 16, 16 ], "texture": "side"}
		}
	}
];
const slabModel = [
	{
		"localBounds": [0,8,0, 16,16,16],
		"faces":
		{
			"localNegX": {"uv": [ 0, 0, 16, 8 ], "texture": "slab_side"},
			"localPosX": {"uv": [ 0, 0, 16, 8 ], "texture": "slab_side"},

			"localNegY": {"uv": [ 0, 0, 16, 16 ], "texture": "slab_bottom"},
			"localPosY": {"uv": [ 0, 0, 16, 16 ], "texture": "slab_top"},

			"localNegZ": {"uv": [ 0, 0, 16, 8 ], "texture": "slab_side"},
			"localPosZ": {"uv": [ 0, 0, 16, 8 ], "texture": "slab_side"}
		}
	}
];
let images = {};
let twoFaces = false;
let hasImage = false;
let hasShadow = true;
let renderType = 'Cube';
let scene = {}
let camera = {position: {x: 0, y: 0, z: 0}}
let renderer = {}
let shape;
let shape2 = {rotation: {x: 0, y: 0, z: 0}};
let shape3;
let shadow;
let shadow2;
let shadow3;
let customModel = {
	"textures": {
		"torch": {
			"fileName": "base:textures/blocks/torch.png"
		}
	},
	"cuboids": [{
			"localBounds": [7,0,7,9,11,9],
			"faces": {
				"localPosY": {"uv":[10,14,8,12],"ambientocclusion":false,"cullFace":false,"texture":"torch","uvRotation":0},
				"localNegY": {"uv":[10,0,8,2],"ambientocclusion":false,"cullFace":true,"texture":"torch","uvRotation":0},
				"localNegZ": {"uv":[0,11,2,0],"ambientocclusion":false,"cullFace":false,"texture":"torch","uvRotation":0},
				"localPosZ": {"uv":[4,11,6,0],"ambientocclusion":false,"cullFace":false,"texture":"torch","uvRotation":0},
				"localPosX": {"uv":[2,11,4,0],"ambientocclusion":false,"cullFace":false,"texture":"torch","uvRotation":0},
				"localNegX": {"uv":[6,11,8,0],"ambientocclusion":false,"cullFace":false,"texture":"torch","uvRotation":0}
			}
		}, {
			"localBounds": [7,7,7,9,9,9],
			"inflate": 0.1,
			"faces": {
				"localPosY": {"uv":[8,6,10,8],"ambientocclusion":false,"cullFace":false,"texture":"torch","uvRotation":0},
				"localNegY": {"uv":[8,8,10,10],"ambientocclusion":false,"cullFace":false,"texture":"torch","uvRotation":0},
				"localNegZ": {"uv":[0,11,2,13],"ambientocclusion":false,"cullFace":false,"texture":"torch","uvRotation":0},
				"localPosZ": {"uv":[4,11,6,13],"ambientocclusion":false,"cullFace":false,"texture":"torch","uvRotation":0},
				"localPosX": {"uv":[2,11,4,13],"ambientocclusion":false,"cullFace":false,"texture":"torch","uvRotation":0},
				"localNegX": {"uv":[6,11,8,13],"ambientocclusion":false,"cullFace":false,"texture":"torch","uvRotation":0}
			}
		}]
};
let shapes = [];
let shadows = [];

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
	if (renderType == 'Item') {
		if (images['topImage'].src !== "") {
			configureItem();
		}
	} else {
		const hasImages = images['leftImage'].src !== "" && images['topImage'].src !== "";
		const hasRightImage = images['rightImage'].src !== "" || twoFaces == false;
		const hasCustomModel = customModel !== null || renderType !== 'Json';
		if (hasImages && hasRightImage && hasCustomModel) {
			switch (renderType) {
				case 'Slab':
					configureSlab();
					break;
				case 'Stair':
					configureStairs();
					break;
				case 'Json':
					configureJson();
					break;
				default:
					configureCube();
					break;
			}
		}
	}
}

const updateJson = () => {
	if (customModel.parent == "base:models/blocks/cube.json") {
		customModel.cuboids = cubeModel;
	};
	configureJson();
}

const removeOld = () => {
	shapes.forEach(shape => scene.remove(shape));
	shadows.forEach(shadow => scene.remove(shadow));
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
	images.leftImage.src = "grass_side.png";
	images.rightImage.src = "grass_side.png";
	images.topImage.src = "magma.png";
	initThree()
	renderer.setAnimationLoop( drawLoop );
	configureJson();
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

function configureJson() {
	removeOld();
	customModel.cuboids.forEach((cuboid,index) => {
		if(index == 0) {return;}
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
			new THREE.MeshBasicMaterial(),  // Ignore
			new THREE.MeshBasicMaterial( { map: textureTop, transparent: true, alphaTest: 0.5 } ),   // True Top
			new THREE.MeshBasicMaterial(),// Ignore
			new THREE.MeshBasicMaterial( { map: textureLeft, transparent: true, alphaTest: 0.5 } ),  // True Left
			new THREE.MeshBasicMaterial()   // Ignore
		];

		const bounds = cuboid.localBounds;
		const sizes = [
			(bounds[3] - bounds[0]) / 12.8,
			(bounds[4] - bounds[1]) / 12.59,
			(bounds[5] - bounds[2]) / 12.8
		];

		const geometry = new THREE.BoxGeometry( ...sizes );
		shapes.push(new THREE.Mesh( geometry, materials ));

		if (hasShadow) {
			const shadowMaterial = [
				new THREE.MeshBasicMaterial({ map: textureRight, color: 0x000000, transparent: true, opacity: 0.3, alphaTest: 0 }), // Right Side Shadow
				new THREE.MeshBasicMaterial(), // Ignore
				new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 }), // Top Side Shadow
				new THREE.MeshBasicMaterial(), // Ignore
				new THREE.MeshBasicMaterial({ map: textureLeft, color: 0x000000, transparent: true, opacity: 0.1, alphaTest: 0 }), // Left Side Shadow
				new THREE.MeshBasicMaterial()  // Ignore
			];
			shapes.push(new THREE.Mesh( geometry, shadowMaterial ));
		}
		});

	shapes.forEach(shape => scene.add(shape));
	renderer.render(scene, camera);
	hasImage = true;
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
		new THREE.MeshBasicMaterial(),  // Ignore
		new THREE.MeshBasicMaterial( { map: textureTop, transparent: true, alphaTest: 0.5 } ),   // True Top
		new THREE.MeshBasicMaterial(),// Ignore
		new THREE.MeshBasicMaterial( { map: textureLeft, transparent: true, alphaTest: 0.5 } ),  // True Left
		new THREE.MeshBasicMaterial()   // Ignore
	];

	const geometry = new THREE.BoxGeometry( 1.25, 1.27, 1.25 );
	shape = new THREE.Mesh( geometry, materials );
	scene.add( shape );


	if (hasShadow) {
		const shadowGeometry = new THREE.BoxGeometry( 1.25, 1.27, 1.25 );
		const shadowMaterial = [
			new THREE.MeshBasicMaterial({ map: textureRight, color: 0x000000, transparent: true, opacity: 0.3, alphaTest: 0 }), // Right Side Shadow
			new THREE.MeshBasicMaterial(), // Ignore
			new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 }), // Top Side Shadow
			new THREE.MeshBasicMaterial(), // Ignore
			new THREE.MeshBasicMaterial({ map: textureLeft, color: 0x000000, transparent: true, opacity: 0.1, alphaTest: 0 }), // Left Side Shadow
			new THREE.MeshBasicMaterial()  // Ignore
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
		new THREE.MeshBasicMaterial(),  // Ignore
		new THREE.MeshBasicMaterial( { map: textureTop, transparent: true, alphaTest: 0.5 } ),   // True Top
		new THREE.MeshBasicMaterial(),// Ignore
		new THREE.MeshBasicMaterial( { map: textureLeft, transparent: true, alphaTest: 0.5 } ),  // True Left
		new THREE.MeshBasicMaterial()   // Ignore
	];

	const bounds = slabModel[0].localBounds;
	const sizes = [
		(bounds[3] - bounds[0]) / 12.8,
		(bounds[4] - bounds[1]) / 12.59,
		(bounds[5] - bounds[2]) / 12.8
	];

	const geometry = new THREE.BoxGeometry( ...sizes );
	shape = new THREE.Mesh( geometry, materials );
	scene.add( shape );


	if (hasShadow) {
		const shadowGeometry = new THREE.BoxGeometry( ...sizes );
		const shadowMaterial = [
			new THREE.MeshBasicMaterial({ map: textureRight, color: 0x000000, transparent: true, opacity: 0.3, alphaTest: 0 }), // Right Side Shadow
			new THREE.MeshBasicMaterial(), // Ignore
			new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 }), // Top Side Shadow
			new THREE.MeshBasicMaterial(), // Ignore
			new THREE.MeshBasicMaterial({ map: textureLeft, color: 0x000000, transparent: true, opacity: 0.1, alphaTest: 0 }), // Left Side Shadow
			new THREE.MeshBasicMaterial()  // Ignore
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
		new THREE.MeshBasicMaterial(),  // Ignore
		new THREE.MeshBasicMaterial( { color: 0x000000, transparent: true, opacity: 0 } ),   // True Top
		new THREE.MeshBasicMaterial(),// Ignore
		new THREE.MeshBasicMaterial( { map: textureLeft, transparent: true, alphaTest: 0.5 } ),  // True Left
		new THREE.MeshBasicMaterial()   // Ignore
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
		new THREE.MeshBasicMaterial(),  // Ignore
		new THREE.MeshBasicMaterial( { map: textureTop2, transparent: true, alphaTest: 0.5 } ),   // True Top
		new THREE.MeshBasicMaterial(),// Ignore
		new THREE.MeshBasicMaterial( { map: textureLeft2, transparent: true, alphaTest: 0.5 } ),  // True Left
		new THREE.MeshBasicMaterial()   // Ignore
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
		new THREE.MeshBasicMaterial(),  // Ignore
		new THREE.MeshBasicMaterial( { map: textureTop3, transparent: true, alphaTest: 0.5 } ),   // True Top
		new THREE.MeshBasicMaterial(),// Ignore
		new THREE.MeshBasicMaterial( { map: textureLeft3, transparent: true, alphaTest: 0.5 } ),  // True Left
		new THREE.MeshBasicMaterial()   // Ignore
	];
	
	shape3 = new THREE.Mesh( geometry, materials3 );
	shape3.position.set(0.3125, -0.3175, 0);
	scene.add( shape3 );


	if (hasShadow) {
		const shadowGeometry = new THREE.BoxGeometry( 0.625, 0.635, 1.25 );
		const shadowMaterial = [
			new THREE.MeshBasicMaterial( { color: 0x000000, transparent: true, opacity: 0 } ),  // True Right
			new THREE.MeshBasicMaterial(),  // Ignore
			new THREE.MeshBasicMaterial( { color: 0x000000, transparent: true, opacity: 0 } ),   // True Top
			new THREE.MeshBasicMaterial(),// Ignore
			new THREE.MeshBasicMaterial( { map: textureLeft, color: 0x000000, transparent: true, opacity: 0.1, alphaTest: 0 } ),  // True Left
			new THREE.MeshBasicMaterial()   // Ignore
		];

		shadow = new THREE.Mesh( shadowGeometry, shadowMaterial );
		shadow.position.set(-0.3125, -0.3175, 0);
		scene.add( shadow );
		
		const shadowMaterial2 = [
			new THREE.MeshBasicMaterial( { map: textureRight2, color: 0x000000, transparent: true, opacity: 0.3, alphaTest: 0 } ),  // True Right
			new THREE.MeshBasicMaterial(),  // Ignore
			new THREE.MeshBasicMaterial( { color: 0x000000, transparent: true, opacity: 0 } ),   // True Top
			new THREE.MeshBasicMaterial(),// Ignore
			new THREE.MeshBasicMaterial( { map: textureLeft2, color: 0x000000, transparent: true, opacity: 0.1, alphaTest: 0 } ),  // True Left
			new THREE.MeshBasicMaterial()   // Ignore
		];

		shadow2 = new THREE.Mesh( shadowGeometry, shadowMaterial2 );
		shadow2.position.set(-0.3125, 0.3175, 0);
		scene.add( shadow2 );
		
		const shadowMaterial3 = [
			new THREE.MeshBasicMaterial( { map: textureRight3, color: 0x000000, transparent: true, opacity: 0.3, alphaTest: 0 } ),  // True Right
			new THREE.MeshBasicMaterial(),  // Ignore
			new THREE.MeshBasicMaterial( { color: 0x000000, transparent: true, opacity: 0 } ),   // True Top
			new THREE.MeshBasicMaterial(),// Ignore
			new THREE.MeshBasicMaterial( { map: textureLeft3, color: 0x000000, transparent: true, opacity: 0.1, alphaTest: 0 } ),  // True Left
			new THREE.MeshBasicMaterial()   // Ignore
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
	<h3>{renderType == "Item" ? "Item Image" : "Top Image"}</h3>
	<input type='file' id="topImage" style="display:none" on:change={() => updateImage('topImage')}>
	<button id="topImageButton" onclick="document.getElementById('topImage').click()" style="padding: 0;height: fit-content;"><i class='bx bx-image-add bx-md'></i></button>
	<img id="topImagePreview" alt="Preview of the top" onclick="document.getElementById('topImage').click()" src="" style="display:none;width: 50px;image-rendering: pixelated;">
</div>
{#if renderType !== 'item'}
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
{#each ["Cube","Slab", "Stair","Item","Json"] as types}
	<label>
		<input
			type="radio"
			name="renderTypes"
			value={types}
			checked={types === "Cube"}
			on:change={() => {
				renderType = types;
				updateCanvas();
			}}
		/>

		{types} 
	</label>
	<br>
{/each}

{#if renderType == "Json"}
	<h3>Json Model</h3>
	<input type="file" id="jsonModel" on:change={() => {
		const [file] = document.getElementById('jsonModel').files
		if (file) {
			const reader = new FileReader();
			reader.onload = function(e) {
				customModel = JSON.parse(e.target.result);
				console.log(customModel);
				updateJson();
			}
			reader.readAsText(file);
		}
	}}>
	<br>
{/if}

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