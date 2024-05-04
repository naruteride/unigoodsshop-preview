import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import colors from './colors.js';

const TRAYS = [
    { id: 'js-tray-slide1', property: 'keycapMesh', mesh: THREE.Mesh },
    { id: 'js-tray-slide2', property: 'textMesh', mesh: THREE.Mesh },
    { id: 'js-tray-slide3', property: 'switchBoardMesh', mesh: THREE.Mesh }
];

const STLModelFiles = [
    "./models/text.stl",
    "./models/keycap.stl",
    "./models/switch_board/open-style/switch_boardv2 v1_switch_boardv2 v1_4slots_switch_board.stl",
]

window.onload = function () {
    STLViewer(STLModelFiles, "model");

    TRAYS.forEach(tray => {
        document.querySelectorAll(`#${tray.id} .tray__swatch`).forEach(swatch => {
            swatch.addEventListener("click", function (e) {
                handleSwatchClick(e.target, tray.mash);
            });
        });
    });
}

/**
 * 선택한 스와치에 대해 클릭 이벤트를 처리한다.
 * @param {HTMLElement} clickedSwatch - 클릭한 스와치 요소
 */
function handleSwatchClick(clickedSwatch) {
    let color = colors[parseInt(clickedSwatch.dataset.key)];
    let newMtl;

    if (color.texture) {
        let txt = new THREE.TextureLoader().load(color.texture);
        txt.repeat.set(color.size[0], color.size[1], color.size[2]);
        txt.wrapS = THREE.RepeatWrapping;
        txt.wrapT = THREE.RepeatWrapping;

        newMtl = new THREE.MeshPhongMaterial({
            map: txt,
            shininess: color.shininess ? color.shininess : 10
        });
    } else {
        newMtl = new THREE.MeshPhongMaterial({
            color: parseInt('0x' + color.color),
            shininess: color.shininess ? color.shininess : 10
        });
    }

    TRAYS.forEach(tray => {
        if (clickedSwatch.parentNode.id === tray.id) {
            setMaterial(tray.mash, newMtl);
        }
    });
}

/**
 * 컬러 스와치를 생성하고 트레이에 추가한다.
 * @param {Array<object>} colors - 컬러 데이터의 배열
 */
function buildColors(colors) {
    for (let [i, color] of colors.entries()) {
        let swatch = document.createElement('div');
        swatch.classList.add('tray__swatch');

        if (color.texture) {
            swatch.style.backgroundImage = "url(" + color.texture + ")";
        } else {
            swatch.style.background = "#" + color.color;
        }

        swatch.setAttribute('data-key', i);


        TRAYS.forEach(tray => {
            document.querySelector(`#${tray.id}`).append(swatch.cloneNode(true));
        })
    }
}

buildColors(colors);

/**
 * 모델과 컬러 스와치를 로드하고 관리하는 3D 뷰어를 생성한다.
 * @param {string[]} models - STL 파일 경로의 배열
 * @param {string} elementID - 3D 모델을 표시할 HTML 요소의 ID
 */
function STLViewer(models, elementID) {
    let elem = document.getElementById(elementID);
    let camera = new THREE.PerspectiveCamera(90, elem.clientWidth / elem.clientHeight, 1, 1000);
    let renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setSize(elem.clientWidth, elem.clientHeight);
    elem.appendChild(renderer.domElement);
    window.addEventListener('resize', function () {
        renderer.setSize(elem.clientWidth, elem.clientHeight);
        camera.aspect = elem.clientWidth / elem.clientHeight;
        camera.updateProjectionMatrix();
    }, false);
    let controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.rotateSpeed = 0.5;
    controls.dampingFactor = 0.1;
    controls.enableZoom = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.25;

    let scene = new THREE.Scene();
    let light = new THREE.HemisphereLight(0xffffff, 0xaaaaaa, 5);
    light.position.set(-5, 10, 10);
    scene.add(light);

    let group = new THREE.Group();
    scene.add(group);

    models.forEach((model, index) => {
        new STLLoader().load(model, function (geometry) {
            let material = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                specular: 100,
                shininess: 100
            });
            let mesh = new THREE.Mesh(geometry, material);
            group.add(mesh);

            // 각 모델에 대한 레퍼런스 저장
            if (index == 0) {
                TRAYS[0].mash = mesh;
            } else if (index == 1) {
                TRAYS[1].mash = mesh;
            } else if (index == 2) {
                TRAYS[2].mash = mesh;
            }

            let middle = new THREE.Vector3();
            geometry.computeBoundingBox();
            geometry.boundingBox.getCenter(middle);

            if (index == 0) {
                mesh.position.set(-middle.x, -middle.y, -middle.z + 4.925);
            } else if (index == 1) {
                mesh.position.set(-middle.x, -middle.y, -middle.z);
            } else if (index == 2) {
                let amount = 1
                mesh.scale.set(amount, amount, amount);
                mesh.position.set((-middle.x) * amount, (middle.z + 1.548) * amount, (-middle.y - 14) * amount);
                mesh.rotation.x = Math.PI / 2;
            }

            camera.position.z = 25;
            let animate = function () {
                requestAnimationFrame(animate);
                controls.update();
                renderer.render(scene, camera);
            };
            animate();
        });
    });
}

/**
 * 모델의 재질을 설정한다.
 * @param {THREE.Object3D} parent - 재질을 적용할 모델
 * @param {THREE.Material} mtl - 새로운 재질
 */
function setMaterial(parent, mtl) {
    parent.traverse(o => {
        o.material = mtl;
    });
}