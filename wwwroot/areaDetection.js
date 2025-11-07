class AreaDetection extends Autodesk.Viewing.Extension {
  load() {
    /** @type {Autodesk.Viewing.GuiViewer3D} */
    const viewer = this.viewer;

    viewer.canvas.addEventListener('click', (e) => {
      const { clientX, clientY } = e;
      const worldCoor = viewer.impl.clientToWorld(clientX, clientY);
      console.dir('worldCoor', worldCoor);
    });

    viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, () => {
      const frags = viewer.model.getFragmentList();
      const lines = []; // Array to store {x1, y1, x2, y2}

      for (let fragId = 0; fragId < frags.fragments.length; fragId++) {
        const mesh = frags.getVizmesh(fragId);
        if (!mesh || !mesh.geometry) continue;

        const vbr = new Autodesk.Viewing.Private.VertexBufferReader(
          mesh.geometry,
          viewer.impl.use2dInstancing,
        );

        vbr.enumGeoms(null, {
          onLineSegment: (x1, y1, x2, y2) => {
            lines.push({ x1, y1, x2, y2 }); // Collect all segments
          },
          // Ignore arcs/circles for simplicity; extend if needed
        });
      }

      console.log('Total lines:', lines.length);

      // Check for near-connections (the smoking gun)
      let nearMisses = 0;
      const tolerance = 1e-9;

      for (let i = 0; i < lines.slice(0, 500).length; i++) {
        const lineA = lines[i];
        for (let j = i + 1; j < lines.length; j++) {
          const lineB = lines[j];

          // Check if end of A ≈ start of B
          if (
            Math.abs(lineA.x2 - lineB.x1) !== 0 &&
            Math.abs(lineA.x2 - lineB.x1) < tolerance &&
            Math.abs(lineA.y2 - lineB.y1) !== 0 &&
            Math.abs(lineA.y2 - lineB.y1) < tolerance
          ) {
            console.log(
              `Near miss: Line ${i} end (${lineA.x2.toFixed(10)}, ${lineA.y2.toFixed(10)}) ≈ Line ${j} start (${lineB.x1.toFixed(10)}, ${lineB.y1.toFixed(10)})`,
            );
            nearMisses++;
          }
        }
      }

      if (nearMisses > 0) {
        console.error(
          'THIS is why polygons are empty! Lines almost connect but not exactly. Total near misses found: ',
          nearMisses,
        );
      }

      // Now process lines into polygons (Step 2)
      computePolygons(lines);
    });
    return true;
  }

  unload() {
    console.info('AreaDetection is now unloaded!');
    return true;
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension('AreaDetection', AreaDetection);

function computePolygons(lines) {
  const jsts = window.jsts;
  const geomFactory = new jsts.geom.GeometryFactory();
  const snappedLines = lines.map((line) => {
    const start = snapCoord(line.x1, line.y1, 1e-7); // 0.0000001 mm grid
    const end = snapCoord(line.x2, line.y2, 1e-7);
    return { x1: start.x, y1: start.y, x2: end.x, y2: end.y };
  });

  const lineStrings = snappedLines.map((line) => {
    const c1 = new jsts.geom.Coordinate(line.x1, line.y1);
    const c2 = new jsts.geom.Coordinate(line.x2, line.y2);
    return geomFactory.createLineString([c1, c2]);
  });

  const multiLine = geomFactory.createMultiLineString(lineStrings);
  const polygonizer = new jsts.operation.polygonize.Polygonizer();
  polygonizer.add(multiLine);
  const polygons = polygonizer.getPolygons().array;
  const enclosedPolygons = [];
  for (const poly of polygons) {
    const shell = poly._shell;
    if (!shell || !shell._points || !shell._points._coordinates) continue;

    const coords = shell._points._coordinates.map((c) => ({
      x: c.x,
      y: c.y,
    }));

    // Close the loop (JSTS does this, but ensure last = first)
    if (
      coords.length > 0 &&
      (coords[0].x !== coords[coords.length - 1].x || coords[0].y !== coords[coords.length - 1].y)
    ) {
      coords.push(coords[0]);
    }

    enclosedPolygons.push({
      jstsPolygon: poly, // Keep original for .contains()
      points: coords, // For drawing or debug
      area: poly.getArea ? poly.getArea() : 0,
    });
  }

  return enclosedPolygons;
}

function snapCoord(x, y, precision = 1e-6) {
  return {
    x: Math.round(x / precision) * precision,
    y: Math.round(y / precision) * precision,
  };
}
