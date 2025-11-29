async function getAccessToken(callback) {
  try {
    const resp = await fetch('/api/auth/token');
    if (!resp.ok) {
      throw new Error(await resp.text());
    }
    const { access_token, expires_in } = await resp.json();
    callback(access_token, expires_in);
  } catch (err) {
    alert('Could not obtain access token. See the console for more details.');
    console.error(err);
  }
}

export function initViewer(container) {
  return new Promise((resolve, _reject) => {
    Autodesk.Viewing.Initializer({ env: 'AutodeskProduction', getAccessToken }, async () => {
      const config = {
        extensions: ['Autodesk.ModelStructure'],
      };

      const viewer = new Autodesk.Viewing.GuiViewer3D(container, config);
      viewer.start();
      viewer.setTheme('light-theme');

      function createBufferGeometry() {
        const geometry = new THREE.BufferGeometry();
        const vertices = new Float32Array([
          -1.0,
          -1.0,
          1.0, // v0
          1.0,
          -1.0,
          1.0, // v1
          1.0,
          1.0,
          1.0, // v2
          1.0,
          1.0,
          1.0, // v3
          -1.0,
          1.0,
          1.0, // v4
          -1.0,
          -1.0,
          1.0, // v5
        ]);
        // itemSize = 3 because there are 3 values (components) per vertex
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
        const mesh = new THREE.Mesh(geometry, material);

        return mesh;
      }

      viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, async function onceLoaded() {
        viewer.removeEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, onceLoaded);

        const sceneBuilder = await viewer.loadExtension('Autodesk.Viewing.SceneBuilder');
        const modelBuilder = await sceneBuilder.addNewModel({
          modelNameOverride: 'My Custom Model',
          conserveMemory: false,
        });

        const mesh = createBufferGeometry();
        mesh.dbId = 999999;
        modelBuilder.addMesh(mesh);
        viewer.impl.invalidate(true, true); // Force a refresh
      });

      resolve(viewer);
    });
  });
}

export function loadModel(viewer, urn) {
  return new Promise((resolve, reject) => {
    function onDocumentLoadSuccess(doc) {
      resolve(viewer.loadDocumentNode(doc, doc.getRoot().getDefaultGeometry()));
    }
    function onDocumentLoadFailure(code, message, errors) {
      reject({ code, message, errors });
    }
    viewer.setLightPreset(0);
    Autodesk.Viewing.Document.load(`urn:${urn}`, onDocumentLoadSuccess, onDocumentLoadFailure);
  });
}
