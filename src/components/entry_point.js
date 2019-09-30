import THREE from '../lib/three';

import px from "../asset/textures/px.jpg";
import nx from "../asset/textures/nx.jpg";
import py from "../asset/textures/py.jpg";
import ny from "../asset/textures/ny.jpg";
import pz from "../asset/textures/pz.jpg";
import nz from "../asset/textures/nz.jpg";
import waterTexture from '../asset/textures/waternormals.jpg';

class ThreeEntryPoint {
    constructor(container) {
        this.container = container;
        this.renderer = null;
        this.scene = null;
        this.camera = null;
        this.light = null;
        this.water = null;

        this.init = this.init.bind(this);
        this.render = this.render.bind(this);
        this.animate = this.animate.bind(this);
    }

    init() {
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.container.appendChild(this.renderer.domElement);

        //
        this.scene = new THREE.Scene();
        //
        this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 20000);
        this.camera.position.set(30, 30, 100);
        //
        this.light = new THREE.DirectionalLight(0xffffff, 0.8);
        this.scene.add(this.light);

        // Water
        var waterGeometry = new THREE.PlaneBufferGeometry(10000, 10000);
        this.water = new THREE.Water(
            waterGeometry,
            {
                textureWidth: 512,
                textureHeight: 512,
                waterNormals: new THREE.TextureLoader().load(waterTexture, function (texture) {
                    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                }),
                alpha: 1.0,
                sunDirection: this.light.position.clone().normalize(),
                sunColor: 0xffffff,
                waterColor: 0x001e0f,
                distortionScale: 3.7,
                fog: this.scene.fog !== undefined
            }
        );
        this.water.rotation.x = - Math.PI / 2;
        this.scene.add(this.water);

        var textureCubeMap = THREE.ImageUtils.loadTextureCube(
            [px, nx, py, ny, pz, nz],
            new THREE.Reflector(),
            () => {
                console.log('loadManager');
            }
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
            new THREE.CubeGeometry(1024, 1024, 1024),
            aSkyBoxMaterial
        );

        this.scene.add(aSkybox);

        var cubeCamera = new THREE.CubeCamera(0.1, 1, 512);
        cubeCamera.renderTarget.texture.generateMipmaps = true;
        cubeCamera.renderTarget.texture.minFilter = THREE.LinearMipmapLinearFilter;
        this.scene.background = cubeCamera.renderTarget;
    }

    animate() {
        requestAnimationFrame(this.animate);
        this.render();
    }

    render() {
        // var time = performance.now() * 0.001; 
        this.water.material.uniforms['time'].value += 1.0 / 60.0;
        this.renderer.render(this.scene, this.camera);
    }
}

export default ThreeEntryPoint;