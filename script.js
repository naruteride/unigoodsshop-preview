// script.js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';

let meshes = [];

window.onload = function () {
    STLViewer(["text.stl", "keycap.stl"], "model");

    document.getElementById("changeColorButton").addEventListener("click", changeColor);
}

function changeColor() {
    if (meshes.length === 0) return;

    meshes.forEach(mesh => {
        const newColor = Math.random() * 0xffffff;
        mesh.material.color.setHex(newColor);
    });
}

function STLViewer(models, elementID) {
    var elem = document.getElementById(elementID);
    var camera = new THREE.PerspectiveCamera(70, elem.clientWidth / elem.clientHeight, 1, 1000);
    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(elem.clientWidth, elem.clientHeight);
    elem.appendChild(renderer.domElement);
    window.addEventListener('resize', function () {
        renderer.setSize(elem.clientWidth, elem.clientHeight);
        camera.aspect = elem.clientWidth / elem.clientHeight;
        camera.updateProjectionMatrix();
    }, false);
    var controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.rotateSpeed = 0.5;
    controls.dampingFactor = 0.1;
    controls.enableZoom = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = .75;

    var scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xffffff, 1.5));

    var group = new THREE.Group();
    scene.add(group);

    models.forEach((model, index) => {
        new STLLoader().load(model, function (geometry) {
            var material = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                specular: 100,
                shininess: 100
            });
            var mesh = new THREE.Mesh(geometry, material);
            group.add(mesh);
            meshes.push(mesh);

            var middle = new THREE.Vector3();
            geometry.computeBoundingBox();
            geometry.boundingBox.getCenter(middle);
            
            var scale = 1;

            // text.stl 파일을 z축 방향으로 3.8mm만큼 옮기는 부분 추가
            if (index === 0) {
                mesh.position.set(-middle.x * scale, -middle.y * scale, -middle.z * scale + 4.925);
            } else {
                mesh.position.set(-middle.x * scale, -middle.y * scale, -middle.z * scale);
            }

            camera.position.z = 25;
            var animate = function () {
                requestAnimationFrame(animate);
                controls.update();
                renderer.render(scene, camera);
            }; 
            animate();
        });
    });
}
