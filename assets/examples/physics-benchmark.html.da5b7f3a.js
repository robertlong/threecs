import "../styles.16b1c26f.js";
import {V as Vector3, T as TextureLoader, B as BoxGeometry, a as MeshBasicMaterial, M as Mesh, n as SphereGeometry, w as wasmUrl} from "../vendor.0520bc5a.js";
import {l as loadRapierPhysicsSystem, j as loadAmmoPhysicsSystem, c as createThreeWorld, I as InstancedMeshRendererSystem, g as addMapComponent, P as PhysicsWorldComponent, e as crateTextureUrl, k as InstancedMeshRenderer, f as addObject3DEntity, h as addComponent, m as PhysicsRigidBodyComponent, n as InstancedMeshRendererComponent} from "../crate.aae10597.js";
function benchmark(system, count = 500) {
  const times = [];
  let finished = false;
  return function benchmarkedSystem(world) {
    const start = performance.now();
    system(world);
    const finish = performance.now();
    if (times.length < count) {
      times.push(finish - start);
    } else if (times.length === count && !finished) {
      finished = true;
      let total = 0;
      for (let i = 0; i < count; i++) {
        total += times[i];
      }
      times.sort((a, b) => a - b);
      console.log({
        name: system.name,
        total,
        mean: total / count,
        median: times[Math.floor(count / 2)]
      });
    }
    return world;
  };
}
async function main() {
  let PhysicsSystem;
  const qs = new URLSearchParams(location.search);
  if (qs.has("rapier")) {
    document.getElementById("rapierLink").style.color = "blue";
    PhysicsSystem = await loadRapierPhysicsSystem();
  } else {
    document.getElementById("ammoLink").style.color = "blue";
    PhysicsSystem = await loadAmmoPhysicsSystem({wasmUrl});
  }
  const {world, scene, sceneEid, camera, start} = createThreeWorld({
    systems: [benchmark(PhysicsSystem), InstancedMeshRendererSystem]
  });
  addMapComponent(world, PhysicsWorldComponent, sceneEid, {
    gravity: new Vector3(0, -6, 0)
  });
  camera.position.z = 5;
  camera.position.y = 3;
  camera.lookAt(0, 0, 0);
  const crateTexture = new TextureLoader().load(crateTextureUrl);
  const instancedMeshRenderer = new InstancedMeshRenderer(new BoxGeometry(0.5, 0.5, 0.5), new MeshBasicMaterial({map: crateTexture}), 2500);
  const instancedMeshRendererEid = addObject3DEntity(world, instancedMeshRenderer, scene);
  addComponent(world, InstancedMeshRendererComponent, instancedMeshRendererEid);
  for (let i = 0; i < 2500; i++) {
    const cube = instancedMeshRenderer.createInstance();
    const cubeEid = addObject3DEntity(world, cube, scene);
    cube.position.y = Math.floor(i / 10) + 2;
    cube.position.x = i % 10 - 5;
    cube.rotation.x = 0.35;
    cube.rotation.z = 0.25;
    addMapComponent(world, PhysicsRigidBodyComponent, cubeEid, {
      mass: 1
    });
  }
  const sphere = new Mesh(new SphereGeometry(1, 10, 10), new MeshBasicMaterial({color: 16711680}));
  const sphereEid = addObject3DEntity(world, sphere, scene);
  sphere.position.y = 0.25;
  sphere.position.z = -0.5;
  addMapComponent(world, PhysicsRigidBodyComponent, sphereEid, {
    mass: 0
  });
  const ground = new Mesh(new BoxGeometry(10, 0.1, 10), new MeshBasicMaterial());
  const groundEid = addObject3DEntity(world, ground, scene);
  addMapComponent(world, PhysicsRigidBodyComponent, groundEid, {
    mass: 0
  });
  start();
}
main().catch(console.error);
