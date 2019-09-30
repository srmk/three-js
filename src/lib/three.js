import * as THREE from 'three';
global.THREE = THREE;

// used to load FBX formate
const Zlib = require("three/examples/js/libs/inflate.min");
window.Zlib = Zlib.Zlib;

if (!window.addEventListener) window.addEventListener = () => {};
require("three/examples/js/renderers/Projector");

//Loaders
require("three/examples/js/loaders/GLTFLoader");
require("three/examples/js/loaders/FBXLoader");
require("three/examples/js/loaders/ColladaLoader");
require("three/examples/js/loaders/OBJLoader");
require("three/examples/js/loaders/MTLLoader");
require("three/examples/js/objects/Reflector");
//Controls
require("three/examples/js/controls/OrbitControls");
require("three/examples/js/objects/Water");

export default THREE;