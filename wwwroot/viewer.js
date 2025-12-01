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
          2,
          2,
          -1, // v0
          3,
          2,
          -1, // v1
          3,
          4,
          -1, // v2
          3,
          4,
          -1, // v3
          2,
          4,
          -1, // v4
          2,
          2,
          -1, // v5
        ]);
        // itemSize = 3 because there are 3 values (components) per vertex
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
        const mesh = new THREE.Mesh(geometry, material);

        return mesh;
      }

      function createGeoLikeLand() {
        const points = [
          {
            x: 1.838666127046963,
            y: 3.6717783117419458,
            z: -1,
          },
          {
            x: 1.864315201004501,
            y: 3.6336535112186539,
            z: -1,
          },
          {
            x: 1.898642468038361,
            y: 3.6227277443540515,
            z: -1,
          },
          {
            x: 1.976441796829931,
            y: 3.652226782460275,
            z: -1,
          },
          {
            x: 1.924467255123545,
            y: 3.7294782336248318,
            z: -1,
          },
          {
            x: 1.83866613080454,
            y: 3.6717783108215372,
            z: -1,
          },
        ];
        const shape = new THREE.Shape(points);
        const bufferGeo = new THREE.BufferGeometry().fromGeometry(new THREE.ShapeGeometry(shape));
        const material = new THREE.MeshBasicMaterial({
          color: 0xff0000,
          transparent: true,
          opacity: 0.8,
          depthWrite: true,
          depthTest: true,
        });

        const pos = bufferGeo.getAttribute('position');
        for (let i = 0; i < pos.count; i++) {
          pos.setZ(i, -1);
        }
        pos.needsUpdate = true;

        const mesh = new THREE.Mesh(bufferGeo, material);
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
        const meshLand = createGeoLikeLand();
        modelBuilder.addMesh(meshLand);
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
