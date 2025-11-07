class AreaDetection extends Autodesk.Viewing.Extension {
  load() {
    /** @type {Autodesk.Viewing.GuiViewer3D} */
    const viewer = this.viewer;

    viewer.canvas.addEventListener('click', (e) => {
      const { clientX, clientY } = e;
      const worldCoor = viewer.impl.clientToWorld(clientX, clientY);
      console.dir('worldCoor', worldCoor);
    });

    return true;
  }

  unload() {
    console.info('AreaDetection is now unloaded!');
    return true;
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension('AreaDetection', AreaDetection);
