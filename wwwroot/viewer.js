import { showSdd2Modal, showTemSddModal } from './modal.js';

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
    Autodesk.Viewing.Initializer({ env: 'AutodeskProduction', getAccessToken }, () => {
      const config = {
        extensions: ['Autodesk.DocumentBrowser', 'AreaDetection'],
      };
      const viewer = new Autodesk.Viewing.GuiViewer3D(container, config);
      viewer.start();
      viewer.setTheme('light-theme');

      viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, () => {
        const myDbids = viewer.getSelection();
        for (const id of myDbids) {
          viewer.getProperties(
            id,
            (obj) => {
              if (obj.name.startsWith('TEM SDD')) {
                const { externalId, properties } = obj;
                const info = {
                  externalId,
                  name: properties.find((prop) => prop.displayName === 'LK').displayValue,
                  area: properties.find((prop) => prop.displayName === 'S').displayValue,
                  mdxd: properties.find((prop) => prop.displayName === '60').displayValue,
                  minMax: properties.find((prop) => prop.displayName === '4').displayValue,
                  hs: properties.find((prop) => prop.displayName === 'HS').displayValue,
                };
                showTemSddModal(info);
              }

              if (obj.name.startsWith('SDD2')) {
                const { externalId, properties } = obj;
                const info = {
                  externalId,
                  name: properties.find((prop) => prop.displayName === 'LK').displayValue,
                  area: properties.find((prop) => prop.displayName === 'S').displayValue,
                };
                showSdd2Modal(info);
              }
            },
            (err) => {
              console.log(err);
            },
          );
        }
      });

      viewer.addEventListener(Autodesk.Viewing.EXTENSION_LOADED_EVENT, (e) => {
        if (e.extensionId === 'Autodesk.Measure') {
          viewer.unloadExtension('Autodesk.Measure');
        }
        if (e.extensionId === 'Autodesk.DocumentBrowser') {
          viewer.unloadExtension('Autodesk.DocumentBrowser');
        }
        if (e.extensionId === 'Autodesk.DefaultTools.NavTools') {
          const navTools = viewer.toolbar.getControl('navTools');
          if (navTools) {
            navTools.removeControl('toolbar-zoomTool');
            navTools.removeControl('toolbar-cameraSubmenuTool');
          }
        }
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
    Autodesk.Viewing.Document.load(`urn: ${urn}`, onDocumentLoadSuccess, onDocumentLoadFailure);
  });
}
