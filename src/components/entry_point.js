import THREE from '../lib/three';

import { vertexShader, fragmentShader } from "./helper/shader";

import px from "../asset/textures/px.jpg";
import nx from "../asset/textures/nx.jpg";
import py from "../asset/textures/py.jpg";
import ny from "../asset/textures/ny.jpg";
import pz from "../asset/textures/pz.jpg";
import nz from "../asset/textures/nz.jpg";
import waterTexture from '../asset/textures/waternormals.jpg';
import groundPattern from '../asset/textures/terrian/grasslight-big.jpg';

class ThreeEntryPoint {
    constructor(container) {
        this.container = container;
        this.renderer = null;
        this.scene = null;
        this.camera = null;
        this.controls = null;
        this.light = null;
        this.water = null;
        this.terrian = null;
        this.animationFrame = null;
        this.clock = new THREE.Clock();
        this.itemsLoaded= false;

        // for shaders
        // this.timeUniform = {
        //     iGlobalTime: {
        //         type: 'f',
        //         value: 0.1
        //     },
        //     iResolution: {
        //         type: 'v2',
        //         value: new THREE.Vector2()
        //     }
        // };
        // this.timeUniform.iResolution.value.x = window.innerWidth;
        // this.timeUniform.iResolution.value.y = window.innerHeight;

        this.init = this.init.bind(this);
        this.render = this.render.bind(this);
        this.animate = this.animate.bind(this);
        this.createWater = this.createWater.bind(this);
        this.loadingManager = this.loadingManager(this);
        this.onWindowResize = this.onWindowResize.bind(this);

        this.init();
        this.animate();
    }

    init() {
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.gammaInput = true;
        this.renderer.gammaOutput = true;
        this.renderer.shadowMap.enabled = true;
        this.container.appendChild(this.renderer.domElement);

        // scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xcce0ff);
        this.scene.fog = new THREE.Fog(0xcce0ff, 500, 10000);

        const aspectRatio = window.innerWidth / window.innerHeight;
        const fieldOfView = 30;
        const nearPlane = 1;
        const farPlane = 10000;
        this.camera = new THREE.PerspectiveCamera(
            fieldOfView,
            aspectRatio,
            nearPlane,
            farPlane
        );
        this.camera.position.set(1, 0, 50);
        // lighting
        var light = new THREE.DirectionalLight(0xdfebff, 1);
        light.position.set(50, 200, 100);
        light.position.multiplyScalar(1.3);
        light.castShadow = true;
        light.shadow.mapSize.width = 1024;
        light.shadow.mapSize.height = 1024;
        var d = 300;
        light.shadow.camera.left = - d;
        light.shadow.camera.right = d;
        light.shadow.camera.top = d;
        light.shadow.camera.bottom = - d;
        light.shadow.camera.far = 1000;
        this.scene.add(light);

        // sky
        var textureCubeMap = THREE.ImageUtils.loadTextureCube(
            [px, nx, py, ny, pz, nz],
            new THREE.Reflector(),
        );
        textureCubeMap.format = THREE.RGBFormat;

        var aShader = THREE.ShaderLib["cube"];
        aShader.uniforms["tCube"].value = textureCubeMap;

        var aSkyBoxMaterial = new THREE.ShaderMaterial({
            fragmentShader: aShader.fragmentShader,
            vertexShader: aShader.vertexShader,
            uniforms: aShader.uniforms,
            depthWrite: false,
            side: THREE.BackSide
        });

        var aSkybox = new THREE.Mesh(
            new THREE.CubeGeometry(10000, 10000, 10000),
            aSkyBoxMaterial
        );

        this.scene.add(aSkybox);

        // ground
        var groundTexture = new THREE.TextureLoader().load(groundPattern);
        groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
        groundTexture.repeat.set(8, 8);
        groundTexture.anisotropy = 16;
        var groundMaterial = new THREE.MeshLambertMaterial({ map: groundTexture });
        var mesh = new THREE.Mesh(new THREE.CircleGeometry(3000, 3000), groundMaterial);
        // mesh.position.z = 250;
        mesh.position.y = - 250;
        mesh.rotation.x = - Math.PI / 2;
        mesh.receiveShadow = true;
        this.scene.add(mesh);

        // Water
        var waterGeometry = new THREE.PlaneBufferGeometry(100000, 100000);
        this.water = new THREE.Water(waterGeometry, {
            textureWidth: 256,
            textureHeight: 256,
            waterNormals: new THREE.TextureLoader(this.loadingManager).load(
                waterTexture,
                (texture) => {
                    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                }
            ),
            alpha: 1.0,
            sunColor: 0xffffff,
            waterColor: 0x001e0f,
            distortionScale: 3.7
        });
        this.water.position.y = - 300;
        this.water.rotation.x = -Math.PI / 2;

        this.scene.add(this.water);
        // this.createWater();

        // camera controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.maxPolarAngle = Math.PI * 0.5;
        this.controls.minDistance = 1;
        this.controls.maxDistance = 5000;

        window.addEventListener('resize', this.onWindowResize, false); 
        
    }

    createWater() {
        this.waterMaterial = new THREE.ShaderMaterial({
            uniforms: this.timeUniform,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader
        });

        var water = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(window.innerWidth, window.innerHeight, 40), this.waterMaterial
          );
        this.scene.add(water);
    }

    loadingManager() {
        const manager = new THREE.LoadingManager();
        manager.onProgress = (url, itemsLoaded, itemsTotal) => {
            let loadedValue = (itemsLoaded / itemsTotal) * 100;
            if (loadedValue === 100) {
                this.itemsLoaded = true
            } else {
                this.itemsLoaded = false
            }

        };

        manager.onError = url => {
            console.log("There was an error loading " + url);
        };
        return manager;
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );
    }

    animate() {
        this.animationFrame = requestAnimationFrame(this.animate);
        this.render();
    }

    render() {
        // var time = performance.now() * 0.001;
        
        this.water.material.uniforms['time'].value += this.clock.getDelta();
        // this.timeUniform.iGlobalTime.value += this.clock.getDelta();
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

export default ThreeEntryPoint;