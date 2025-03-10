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
let customImages = {};
let shapes = [];

$: camera.position.z = camera.position.x


const updateImage = (image) => {
	const [file] = document.getElementById(image).files
	if (file) {
		document.getElementById(image + 'Preview').src = URL.createObjectURL(file);
		document.getElementById(image + 'Preview').style.display = "";
		document.getElementById(image + 'Button').style.display = "none";
		if (renderType == 'Json') {
			customImages[image].src = URL.createObjectURL(file);
			customImages[image].onload = function(){
				updateCanvas();
			}
		} else {
			images[image].src = URL.createObjectURL(file);
			images[image].onload = function(){
				updateCanvas();
			}
		}
	}	
}

const updateCanvas = () => {
	removeOld();
	if (renderType == 'Json') {
		if (Object.keys(customImages).length !== 0 && Object.keys(customImages).every(key => customImages[key].src !== "")) {
			configureJson();
		} else {
			updateJson();
		}
	} else if (renderType == 'Item') {
		if (images['top'].src !== "") {
			configureItem();
		}
	} else {
		const hasImages = images['left'].src !== "" && images['top'].src !== "";
		const hasRightImage = images['right'].src !== "" || twoFaces == false;
		if (hasImages && hasRightImage) {
			switch (renderType) {
				case 'Slab':
					configureSlab();
					break;
				case 'Stair':
					configureStairs();
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
	Object.keys(customModel.textures).forEach(key => {
		//customModel.textures[key].fileName = images[key].src;
	});
}

const removeOld = () => {
	shapes.forEach(shape => scene.remove(shape));
	shapes = [];
}

onMount(() => {
	images.left = new Image();
	images.right = new Image();
	images.top = new Image();
	//customImages.torch = new Image();
	images.left.src = "grass_side.png";
	images.right.src = "grass_side.png";
	images.top.src = "magma.png";
	//customImages.torch.src = "torch.png";
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

function configureJson() {
	customModel.cuboids.forEach((cuboid) => {
		const materials = [];
		Object.values(cuboid.faces).forEach(face => {
			const texture = textureLoader.load(customImages[face.texture].src);
			const material = new THREE.MeshBasicMaterial({ map: texture });
			materials.push(material);
		});

		const bounds = cuboid.localBounds;
		const sizes = [
			(bounds[3] - bounds[0]) / 12.8,
			(bounds[4] - bounds[1]) / 12.59,
			(bounds[5] - bounds[2]) / 12.8
		];

		const geometry = new THREE.BoxGeometry( ...sizes );

		const uvAttribute = geometry.getAttribute('uv');
		const uvs = uvAttribute.array;

		const faceMapping = {
			localPosY: 2, // Top
			localNegY: 3, // Bottom
			localPosZ: 4, // Front
			localNegZ: 5, // Back
			localPosX: 0, // Right
			localNegX: 1  // Left
		};

		const facesData  = {};
		Object.keys(cuboid.faces).forEach(face => {
			const uv = cuboid.faces[face].uv;
			uvs[face] = {
				uv: [
					uv[0] / 16, uv[1] / 16, uv[2] / 16, uv[3] / 16
				]
			}
		});

		for (const [faceName, faceData] of Object.entries(facesData)) {
			const threeFaceIndex = faceMapping[faceName];
			const uvPixels = faceData.uv;

			// Converte pixels para UVs normalizados (0-1) e inverte V
			const u0 = uvPixels[0];
			const v0 = (16 - uvPixels[1]);
			const u1 = uvPixels[2];
			const v1 = (16 - uvPixels[3]);

			// Define os 4 cantos da textura
			const bl = [u0, v1]; // Canto inferior esquerdo
			const br = [u1, v1]; // Canto inferior direito
			const tr = [u1, v0]; // Canto superior direito
			const tl = [u0, v0]; // Canto superior esquerdo

			// Ordem dos vértices no Three.js (6 por face)
			const faceUvs = [
				...bl, ...br, ...tr, // Primeiro triângulo
				...tr, ...tl, ...bl  // Segundo triângulo
			];

			// Atualiza os UVs na geometria
			const startIndex = threeFaceIndex * 12; // 12 elementos por face
			for (let i = 0; i < 12; i++) {
				uvs[startIndex + i] = faceUvs[i];
			}
		}

		uvAttribute.needsUpdate = true;

				
		shapes.push(new THREE.Mesh( geometry, materials ));

		});

	shapes.forEach(shape => scene.add(shape));
	renderer.render(scene, camera);
	hasImage = true;
}

function configureCube() {
	const textureLeft = textureLoader.load(images['left'].src);
	textureLeft.magFilter = THREE.NearestFilter;
	textureLeft.colorSpace = THREE.SRGBColorSpace;

	let textureRight;
	if (twoFaces) {
		textureRight = textureLoader.load(images['right'].src);
	} else {
		textureRight = textureLoader.load(images['left'].src);
	}
	textureRight.magFilter = THREE.NearestFilter;
	textureRight.colorSpace = THREE.SRGBColorSpace;

	const textureTop = textureLoader.load(images['top'].src);
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
	shapes.push(new THREE.Mesh( geometry, materials ))

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
	shapes.forEach(shape => scene.add(shape));

	renderer.render(scene, camera);
	hasImage = true;
}

function configureSlab() {

	const textureLeft = textureLoader.load(images['left'].src);
	textureLeft.magFilter = THREE.NearestFilter;
	textureLeft.colorSpace = THREE.SRGBColorSpace;
	textureLeft.repeat.set(1, 0.5);
	textureLeft.offset.set(0, 0.5);

	let textureRight;
	if (twoFaces) {
		textureRight = textureLoader.load(images['right'].src);
	} else {
		textureRight = textureLoader.load(images['left'].src);
	}
	textureRight.magFilter = THREE.NearestFilter;
	textureRight.colorSpace = THREE.SRGBColorSpace;
	textureRight.repeat.set(1, 0.5);
	textureRight.offset.set(0, 0.5);

	const textureTop = textureLoader.load(images['top'].src);
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
		shapes.push(new THREE.Mesh( geometry, shadowMaterial ))

	}

	shapes.forEach(shape => scene.add(shape));

	renderer.render(scene, camera);
	hasImage = true;
}

function configureStairs() {

	const textureLeft = textureLoader.load(images['left'].src);
	textureLeft.magFilter = THREE.NearestFilter;
	textureLeft.colorSpace = THREE.SRGBColorSpace;
	textureLeft.repeat.set(0.5, 0.5);

	let textureRight;
	if (twoFaces) {
		textureRight = textureLoader.load(images['right'].src);
	} else {
		textureRight = textureLoader.load(images['left'].src);
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
	let shape = new THREE.Mesh( geometry, materials );
	shape.position.set(-0.3125, -0.3175, 0);
	shapes.push(shape);
	
	const textureLeft2 = textureLoader.load(images['left'].src);
	textureLeft2.magFilter = THREE.NearestFilter;
	textureLeft2.colorSpace = THREE.SRGBColorSpace;
	textureLeft2.repeat.set(0.5, 0.5);
	textureLeft2.offset.set(0, 0.5);

	let textureRight2;
	if (twoFaces) {
		textureRight2 = textureLoader.load(images['right'].src);
	} else {
		textureRight2 = textureLoader.load(images['left'].src);
	}
	textureRight2.magFilter = THREE.NearestFilter;
	textureRight2.colorSpace = THREE.SRGBColorSpace;
	textureRight2.repeat.set(1, 0.5);
	textureRight2.offset.set(0, 0.5);

	const textureTop2 = textureLoader.load(images['top'].src);
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
	
	shape = new THREE.Mesh( geometry, materials2 );
	shape.position.set(-0.3125, 0.3175, 0);
	shapes.push(shape);

	const textureLeft3 = textureLoader.load(images['left'].src);
	textureLeft3.magFilter = THREE.NearestFilter;
	textureLeft3.colorSpace = THREE.SRGBColorSpace;
	textureLeft3.repeat.set(0.5, 0.5);
	textureLeft3.offset.set(0.5, 0);

	let textureRight3;
	if (twoFaces) {
		textureRight3 = textureLoader.load(images['right'].src);
	} else {
		textureRight3 = textureLoader.load(images['left'].src);
	}
	textureRight3.magFilter = THREE.NearestFilter;
	textureRight3.colorSpace = THREE.SRGBColorSpace;
	textureRight3.repeat.set(1, 0.5);
	textureRight3.offset.set(0, 0);

	const textureTop3 = textureLoader.load(images['top'].src);
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
	
	shape = new THREE.Mesh( geometry, materials3 );
	shape.position.set(0.3125, -0.3175, 0);
	shapes.push(shape);


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

		shape = new THREE.Mesh( shadowGeometry, shadowMaterial );
		shape.position.set(-0.3125, -0.3175, 0);
		shapes.push(shape);
		
		const shadowMaterial2 = [
			new THREE.MeshBasicMaterial( { map: textureRight2, color: 0x000000, transparent: true, opacity: 0.3, alphaTest: 0 } ),  // True Right
			new THREE.MeshBasicMaterial(),  // Ignore
			new THREE.MeshBasicMaterial( { color: 0x000000, transparent: true, opacity: 0 } ),   // True Top
			new THREE.MeshBasicMaterial(),// Ignore
			new THREE.MeshBasicMaterial( { map: textureLeft2, color: 0x000000, transparent: true, opacity: 0.1, alphaTest: 0 } ),  // True Left
			new THREE.MeshBasicMaterial()   // Ignore
		];

		shape = new THREE.Mesh( shadowGeometry, shadowMaterial2 );
		shape.position.set(-0.3125, 0.3175, 0);
		shapes.push(shape);
		
		const shadowMaterial3 = [
			new THREE.MeshBasicMaterial( { map: textureRight3, color: 0x000000, transparent: true, opacity: 0.3, alphaTest: 0 } ),  // True Right
			new THREE.MeshBasicMaterial(),  // Ignore
			new THREE.MeshBasicMaterial( { color: 0x000000, transparent: true, opacity: 0 } ),   // True Top
			new THREE.MeshBasicMaterial(),// Ignore
			new THREE.MeshBasicMaterial( { map: textureLeft3, color: 0x000000, transparent: true, opacity: 0.1, alphaTest: 0 } ),  // True Left
			new THREE.MeshBasicMaterial()   // Ignore
		];
		shape = new THREE.Mesh( shadowGeometry, shadowMaterial3 );
		shape.position.set(0.3125, -0.3175, 0);
		shapes.push(shape);
	}

	shapes.forEach(shape => scene.add(shape));

	renderer.render(scene, camera);
	hasImage = true;
}

function configureItem() {
	const texture = textureLoader.load(images['top'].src);
	texture.magFilter = THREE.NearestFilter;
	texture.colorSpace = THREE.SRGBColorSpace;

	const material = new THREE.MeshBasicMaterial( { map: texture, transparent: true, alphaTest: 0.9 } )

	const geometry = new THREE.PlaneGeometry( 2, 2 );
	let shape = new THREE.Mesh( geometry, material );
	shapes.push(shape);

	shape = new THREE.Mesh( geometry, material );
	shape.rotation.y = 1
	shapes.push(shape);

	if (hasShadow) {
		const shadowMaterial = new THREE.MeshBasicMaterial({ map: texture, color: 0x000000, transparent: true, opacity: 0.3, alphaTest: 0 });
		shape = new THREE.Mesh( geometry, shadowMaterial );
		shapes.push(shape);
	}
	
	shapes.forEach(shape => scene.add(shape));

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

{#if renderType == "Json"}
<div id="customImagesDiv">
	{#each Object.keys(customImages) as image}
		<div style="width: fit-content;text-align:center;">
			<h3>{image} Image</h3>
			<input type='file' id="{image}" style="display:none" on:change={() => updateImage(image)}>
			<button id="{image}Button" onclick="document.getElementById('{image}').click()" style="padding: 0;height: fit-content;"><i class='bx bx-image-add bx-md'></i></button>
			<img id="{image}Preview" alt="Preview of the {image}" onclick="document.getElementById('{image}').click()" src="" style="display:none;width: 50px;image-rendering: pixelated;">
		</div>
	{/each}
</div>
{:else}
<div style="width: fit-content;text-align:center;">
	<h3>{renderType == "Item" ? "Item Image" : "Top Image"}</h3>
	<input type='file' id="top" style="display:none" on:change={() => updateImage('top')}>
	<button id="topButton" onclick="document.getElementById('top').click()" style="padding: 0;height: fit-content;"><i class='bx bx-image-add bx-md'></i></button>
	<img id="topPreview" alt="Preview of the top" onclick="document.getElementById('top').click()" src="" style="display:none;width: 50px;image-rendering: pixelated;">
</div>
{#if renderType !== 'Item'}
<div style="display:flex;text-align:center;">
	<div>
		<h3 id="leftH3">{twoFaces ? "Left Image" : "Side Image"}</h3>
		<input type='file' id="left" style="display:none" on:change={() => updateImage('left')}>
		<button id="leftButton" onclick="document.getElementById('left').click()" style="padding: 0;height: fit-content;"><i class='bx bx-image-add bx-md'></i></button>
		<img id="leftPreview" alt="Preview of the left" onclick="document.getElementById('left').click()" src="" style="display:none;width: 50px;image-rendering: pixelated;">
	</div>
	{#if twoFaces}
		<div id="rightDiv">
			<h3>Right Image</h3>
			<input type='file' id="right" style="display:none" on:change={() => updateImage('right')}>
			<img id="rightPreview" alt="Preview of the right" onclick="document.getElementById('right').click()" src="{images['right'].src ? images['right'].src : ''}" style="width: 50px;image-rendering: pixelated;display:{images['right'].src ? '' : 'none'}">
			<button id="rightButton" onclick="document.getElementById('right').click()" style="padding: 0;height: fit-content;display:{images['right'].src ? 'none' : ''}">
				<i class='bx bx-image-add bx-md'></i>
			</button>
		</div>
	{/if}
</div>
{/if}
<input type="checkbox" id="twoFaces" bind:checked={twoFaces} on:change={updateCanvas}><label for="twoFaces">Two Sides</label>
<br>
{/if}
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
				let localImages = {};
				Object.keys(customModel.textures || {}).forEach(key => {
					localImages[key] = new Image();
					localImages[key].name = key;
				});
				customImages = localImages;
				console.log(customImages);
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