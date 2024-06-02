import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import colors from './colors.js';

/**
 * 트레이와 메쉬를 매핑한다.
 * @type {string[]}
 */
const TRAYS = [
    'tray-text1', 'tray-keycap1', 'tray-switch-board',
    'tray-keycap2', 'tray-keycap3', 'tray-keycap4',
    'tray-text2', 'tray-text3', 'tray-text4'
];

/**
 * STL 모델 파일 경로를 정의한다.
 * @type {string[]}
 */
const STLModelFiles = [
    "./models/text/upper_F.stl",
    "./models/keycap.stl",
    "", // 스위치보드 모델은 초기에 비어있는 상태로 설정한다.
    "./models/keycap.stl",
    "./models/keycap.stl",
    "./models/keycap.stl",
    "./models/text/upper_F.stl",
    "./models/text/upper_F.stl",
    "./models/text/upper_F.stl"
];

// 스위치보드 모델 파일 경로를 선택하는 함수
function selectSwitchBoardModel(slotCount) {
    switch (slotCount) {
        case 2:
            return "./models/switch_board/open-style/switch_boardv2 v1_switch_boardv2 v1_2slots_switch_board.stl";
        case 3:
            return "./models/switch_board/open-style/switch_boardv2 v1_switch_boardv2 v1_3slots_switch_board.stl";
        case 4:
            return "./models/switch_board/open-style/switch_boardv2 v1_switch_boardv2 v1_4slots_switch_board.stl";
        case 5:
            return "./models/switch_board/open-style/switch_boardv2 v1_switch_boardv2 v1_5slots_switch_board.stl";
        case 6:
            return "./models/switch_board/open-style/switch_boardv2 v1_switch_boardv2 v1_6slots_switch_board.stl";
        case 7:
            return "./models/switch_board/open-style/switch_boardv2 v1_switch_boardv2 v1_7slots_switch_board.stl";
        case 8:
            return "./models/switch_board/open-style/switch_boardv2 v1_switch_boardv2 v1_8slots_switch_board.stl";
        default:
            return "";
    }
}

function removeFirstCanvas() {
    document.querySelector('canvas').remove();
}

// 초기 STL 파일 설정
let initialSlotCount = 4; // 기본값은 4
let initialSwitchBoardModel = selectSwitchBoardModel(initialSlotCount);
STLModelFiles[2] = initialSwitchBoardModel;

// 슬롯 수를 선택하는 select 요소와 그 값을 처리하는 부분
const slotCountSelect = document.getElementById('slot-count');
slotCountSelect.addEventListener('change', function () {
    // 생성되어있는 캔버스 제거
    removeFirstCanvas();

    const selectedSlotCount = parseInt(this.value);
    const selectedSwitchBoardModel = selectSwitchBoardModel(selectedSlotCount);
    STLModelFiles[2] = selectedSwitchBoardModel;

    // 키캡을 슬롯 수에 맞게 조정
    adjustKeycaps(selectedSlotCount);

    // 변경된 모델 로드
    STLViewer(STLModelFiles, "model");
});

/**
 * 각 트레이에 대응하는 메쉬를 저장한다.
 * @type {THREE.Mesh[]}
 */
const meshes = Array(TRAYS.length).fill(null);

window.onload = function () {
    STLViewer(STLModelFiles, "model");
    setupSwatchClickHandlers();
};

/**
 * 각 트레이의 스와치에 클릭 이벤트 핸들러를 설정한다.
 */
function setupSwatchClickHandlers() {
    TRAYS.forEach((tray, index) => {
        document.querySelectorAll(`#${tray} .tray__swatch`).forEach(swatch => {
            swatch.addEventListener("click", function (e) {
                handleSwatchClick(e.target, meshes[index]);
            });
        });
    });
}

/**
 * 클릭된 스와치의 색상을 해당 메쉬에 적용한다.
 * @param {HTMLElement} clickedSwatch - 클릭된 스와치 요소
 * @param {THREE.Mesh} mesh - 색상을 적용할 메쉬
 */
function handleSwatchClick(clickedSwatch, mesh) {
    const color = colors[parseInt(clickedSwatch.dataset.key)];
    const newMtl = createMaterial(color);
    if (mesh) {
        setMaterial(mesh, newMtl);
    } else {
        console.error("Mesh not defined for the selected tray.");
    }
}

/**
 * 컬러 데이터를 기반으로 새로운 재질을 생성한다.
 * @param {Object} color - 컬러 데이터
 * @param {string} color.color - 색상 값
 * @param {string} [color.texture] - 텍스처 경로
 * @param {number[]} [color.size] - 텍스처 크기
 * @param {number} [color.shininess] - 광택 정도
 * @returns {THREE.Material} 생성된 재질
 */
function createMaterial(color) {
    if (color.texture) {
        const texture = new THREE.TextureLoader().load(color.texture);
        texture.repeat.set(color.size[0], color.size[1], color.size[2]);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;

        return new THREE.MeshPhongMaterial({
            map: texture,
            shininess: color.shininess || 10
        });
    } else {
        return new THREE.MeshPhongMaterial({
            color: parseInt('0x' + color.color),
            shininess: color.shininess || 10
        });
    }
}

/**
 * 컬러 스와치를 생성하여 각 트레이에 추가한다.
 * @param {Array<object>} colors - 컬러 데이터의 배열
 */
function buildColors(colors) {
    colors.forEach((color, i) => {
        const swatch = document.createElement('div');
        swatch.classList.add('tray__swatch');
        if (color.texture) {
            swatch.style.backgroundImage = "url(" + color.texture + ")";
        } else {
            swatch.style.background = "#" + color.color;
        }
        swatch.setAttribute('data-key', i);

        TRAYS.forEach(tray => {
            document.querySelector(`#${tray}`).append(swatch.cloneNode(true));
        });
    });
}

buildColors(colors);

/**
 * STL 모델을 로드하고 3D 뷰어를 초기화한다.
 * @param {string[]} models - STL 파일 경로의 배열
 * @param {string} elementID - 3D 모델을 표시할 HTML 요소의 ID
 */
function STLViewer(models, elementID) {
    const elem = document.getElementById(elementID);
    const camera = new THREE.PerspectiveCamera(90, elem.clientWidth / elem.clientHeight, 1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setSize(elem.clientWidth, elem.clientHeight);
    elem.appendChild(renderer.domElement);

    window.addEventListener('resize', () => {
        renderer.setSize(elem.clientWidth, elem.clientHeight);
        camera.aspect = elem.clientWidth / elem.clientHeight;
        camera.updateProjectionMatrix();
    });

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.rotateSpeed = 0.5;
    controls.dampingFactor = 0.1;
    controls.enableZoom = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0;

    const scene = new THREE.Scene();
    const light = new THREE.HemisphereLight(0xffffff, 0xaaaaaa, 5);
    light.position.set(-5, 10, 10);
    scene.add(light);

    const group = new THREE.Group();
    scene.add(group);

    models.forEach((model, index) => {
        if (model) {
            new STLLoader().load(model, function (geometry) {
                const material = new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 100, shininess: 100 });
                const mesh = new THREE.Mesh(geometry, material);
                group.add(mesh);
                meshes[index] = mesh;

                setPosition(mesh, geometry, index);
                camera.position.z = 25;
                animate(renderer, scene, camera, controls);
            });
        }
    });
}

/**
 * 각 인덱스에 따른 메쉬의 위치를 설정한다.
 * @param {THREE.Mesh} mesh - 위치를 설정할 메쉬
 * @param {THREE.BufferGeometry} geometry - 메쉬의 지오메트리
 * @param {number} index - 메쉬의 인덱스
 */
function setPosition(mesh, geometry, index) {
    const middle = new THREE.Vector3();
    geometry.computeBoundingBox();
    geometry.boundingBox.getCenter(middle);

    const oneSpace = 18.5;

    switch (index) {
        case 0: // 텍스트 1
            mesh.position.set(-middle.x + (oneSpace * 2) - (oneSpace / 2), -middle.y, -middle.z + 4.925);
            break;
        case 1: // 키캡 1
            mesh.position.set(-middle.x + (oneSpace * 2) - (oneSpace / 2), -middle.y, -middle.z);
            break;
        case 2: // 스위치보드
            mesh.scale.set(1, 1, 1);
            mesh.position.set((-middle.x) * 1 - 1.5, (middle.z + 1.548) * 1, (-middle.y - 14) * 1);
            mesh.rotation.x = Math.PI / 2;
            break;
        case 3: // 키캡 2
            mesh.position.set(-middle.x + (oneSpace * 1) - (oneSpace / 2), -middle.y, -middle.z);
            break;
        case 4: // 키캡 3
            mesh.position.set(-middle.x - (oneSpace * 1) + (oneSpace / 2), -middle.y, -middle.z);
            break;
        case 5: // 키캡 4
            mesh.position.set(-middle.x - (oneSpace * 2) + (oneSpace / 2), -middle.y, -middle.z);
            break;
        case 6: // 텍스트 2
            mesh.position.set(-middle.x + (oneSpace * 1) - (oneSpace / 2), -middle.y, -middle.z + 4.925);
            break;
        case 7: // 텍스트 3
            mesh.position.set(-middle.x - (oneSpace * 1) + (oneSpace / 2), -middle.y, -middle.z + 4.925);
            break;
        case 8: // 텍스트 4
            mesh.position.set(-middle.x - (oneSpace * 2) + (oneSpace / 2), -middle.y, -middle.z + 4.925);
            break;
    }
}

/**
 * 애니메이션을 시작하고 씬을 렌더링한다.
 * @param {THREE.WebGLRenderer} renderer - 씬을 렌더링할 렌더러
 * @param {THREE.Scene} scene - 렌더링할 씬
 * @param {THREE.PerspectiveCamera} camera - 씬을 렌더링할 카메라
 * @param {OrbitControls} controls - 카메라를 제어할 컨트롤러
 */
function animate(renderer, scene, camera, controls) {
    requestAnimationFrame(() => animate(renderer, scene, camera, controls));
    controls.update();
    renderer.render(scene, camera);
}

/**
 * 주어진 부모 메쉬와 그 자식 메쉬들에 새로운 재질을 적용한다.
 * @param {THREE.Object3D} parent - 재질을 적용할 부모 메쉬
 * @param {THREE.Material} mtl - 적용할 재질
 */
function setMaterial(parent, mtl) {
    parent.traverse(o => {
        if (o.isMesh) {
            o.material = mtl;
        }
    });
}

/**
 * 슬롯 수에 따라 키캡을 조정한다.
 * @param {number} slotCount - 선택된 슬롯 수
 */
function adjustKeycaps(slotCount) {
    // 현재 키캡 인덱스를 초기화
    let keycapIndex = 1; // STLModelFiles에서 키캡은 1부터 시작

    // 키캡을 초기화
    for (let i = 1; i <= 5; i++) {
        STLModelFiles[i + 1] = ""; // 모든 키캡을 비운다
    }

    // 선택된 슬롯 수만큼 키캡을 할당
    for (let i = 0; i < slotCount - 1; i++) {
        STLModelFiles[keycapIndex + 1] = "./models/keycap.stl";
        keycapIndex++;
    }
}
