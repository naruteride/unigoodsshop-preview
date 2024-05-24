import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import colors from './colors.js';

// 트레이와 해당하는 3D 메쉬를 정의합니다.
const TRAYS = [
    { id: 'tray-text', mesh: null },
    { id: 'tray-keycap1', mesh: null },
    { id: 'tray-switch-board', mesh: null },
    { id: 'tray-keycap2', mesh: null },
    { id: 'tray-keycap3', mesh: null },
    { id: 'tray-keycap4', mesh: null },
];

// STL 모델 파일의 경로를 정의합니다.
const STLModelFiles = [
    "./models/text.stl",
    "./models/keycap.stl",
    "./models/switch_board/open-style/switch_boardv2 v1_switch_boardv2 v1_4slots_switch_board.stl",
    "./models/keycap.stl",
    "./models/keycap.stl",
    "./models/keycap.stl",
]

window.onload = function () {
    // STL 모델을 로드하고 3D 뷰어를 초기화합니다.
    STLViewer(STLModelFiles, "model");

    // 각 트레이의 색상 스와치에 클릭 이벤트 리스너를 추가합니다.
    TRAYS.forEach(tray => {
        document.querySelectorAll(`#${tray.id} .tray__swatch`).forEach(swatch => {
            swatch.addEventListener("click", function (e) {
                handleSwatchClick(e.target, tray.mesh);
            });
        });
    });
}

/**
 * 선택한 스와치에 대해 클릭 이벤트를 처리합니다.
 * @param {HTMLElement} clickedSwatch - 클릭한 스와치 요소
 * @param {THREE.Mesh} mesh - 색상을 적용할 메쉬
 */
function handleSwatchClick(clickedSwatch, mesh) {
    let color = colors[parseInt(clickedSwatch.dataset.key)];
    let newMtl;

    // 텍스처가 있는 색상인지 확인합니다.
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

    // 메쉬가 정의되어 있으면 새 재질을 적용합니다.
    if (mesh) {
        setMaterial(mesh, newMtl);
    } else {
        console.error("Mesh not defined for the selected tray.");
    }
}

/**
 * 컬러 스와치를 생성하고 트레이에 추가합니다.
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

        // 각 트레이에 스와치를 추가합니다.
        TRAYS.forEach(tray => {
            document.querySelector(`#${tray.id}`).append(swatch.cloneNode(true));
        })
    }
}

// 컬러 스와치를 생성합니다.
buildColors(colors);

/**
 * 모델과 컬러 스와치를 로드하고 관리하는 3D 뷰어를 생성합니다.
 * @param {string[]} models - STL 파일 경로의 배열
 * @param {string} elementID - 3D 모델을 표시할 HTML 요소의 ID
 */
function STLViewer(models, elementID) {
    let elem = document.getElementById(elementID);
    let camera = new THREE.PerspectiveCamera(90, elem.clientWidth / elem.clientHeight, 1, 1000);
    let renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setSize(elem.clientWidth, elem.clientHeight);
    elem.appendChild(renderer.domElement);

    // 창 크기 조정에 따라 렌더러와 카메라를 업데이트합니다.
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
    controls.autoRotateSpeed = 0.1;

    let scene = new THREE.Scene();
    let light = new THREE.HemisphereLight(0xffffff, 0xaaaaaa, 5);
    light.position.set(-5, 10, 10);
    scene.add(light);

    let group = new THREE.Group();
    scene.add(group);

    // 각 STL 모델을 로드하고 씬에 추가합니다.
    models.forEach((model, index) => {
        new STLLoader().load(model, function (geometry) {
            let material = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                specular: 100,
                shininess: 100
            });
            let mesh = new THREE.Mesh(geometry, material);
            group.add(mesh);

            // 각 모델에 대한 레퍼런스를 트레이 객체에 저장합니다.
            if (index == 0) {
                TRAYS[0].mesh = mesh;
            } else if (index == 1) {
                TRAYS[1].mesh = mesh;
            } else if (index == 2) {
                TRAYS[2].mesh = mesh;
            } else if (index == 3) {
                TRAYS[3].mesh = mesh;
            } else if (index == 4) {
                TRAYS[4].mesh = mesh;
            } else if (index == 5) {
                TRAYS[5].mesh = mesh;
            }

            // 모델의 중심을 계산하여 올바른 위치에 배치합니다.
            let middle = new THREE.Vector3();
            geometry.computeBoundingBox();
            geometry.boundingBox.getCenter(middle);

            let amount = 1;
            let oneSpace = 18.5;

            if (index == 0) {
                // 텍스트
                mesh.position.set(-middle.x, -middle.y, -middle.z + 4.925);
            } else if (index == 1) {
                // 키캡 1
                mesh.position.set(-middle.x + (oneSpace * 2) - (oneSpace / 2), -middle.y, -middle.z);
            } else if (index == 2) {
                // 스위치보드
                mesh.scale.set(amount, amount, amount);
                mesh.position.set((-middle.x) * amount - 1.5, (middle.z + 1.548) * amount, (-middle.y - 14) * amount);
                mesh.rotation.x = Math.PI / 2;
            } else if (index == 3) {
                // 키캡 2
                mesh.position.set(-middle.x + (oneSpace * 1) - (oneSpace / 2), -middle.y, -middle.z);
            } else if (index == 4) {
                // 키캡 3
                mesh.position.set(-middle.x - (oneSpace * 1) + (oneSpace / 2), -middle.y, -middle.z);
            } else if (index == 5) {
                // 키캡 4
                mesh.position.set(-middle.x - (oneSpace * 2) + (oneSpace / 2), -middle.y, -middle.z);
            }

            // 카메라의 초기 위치를 설정합니다.
            camera.position.z = 25;

            // 씬을 애니메이션하여 렌더링합니다.
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
 * 모델의 재질을 설정합니다.
 * @param {THREE.Object3D} parent - 재질을 적용할 모델
 * @param {THREE.Material} mtl - 새로운 재질
 */
function setMaterial(parent, mtl) {
    console.log(`parent: ${JSON.stringify(parent)}`);
    console.log(`mtl: ${JSON.stringify(mtl)}`);
    parent.traverse(o => {
        if (o.isMesh) {
            o.material = mtl;
        }
    });
}
