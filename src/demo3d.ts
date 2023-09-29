import { CommitLayoutData, LINE_THICKNESS } from ".";
import Direction, {
  Fit,
  DirectionCaret,
  AxisOverlap,
  DirectionNode,
} from "./direction";
import paintNodeLines from "./paintNodeLines";
import paintNodeBounds from "./paintNodeBounds";
import Axis from "./direction/Axis";
import Size from "./size";
import Camera from "parsegraph-camera";
import { readStyle } from "./demoutils";
import { BasicGLProvider } from "parsegraph-compileprogram";
import { BlockType, WebGLBlockPainter } from "parsegraph-blockpainter";
import Color from "parsegraph-color";
import buildGraph from "./demograph";
import {
  matrixMultiply3x3,
  makeTranslation3x3,
  makeScale3x3,
} from "parsegraph-matrix";

const layoutPainter = {
  size: (node: DirectionNode, size: Size) => {
    const style = readStyle(node.value());
    size.setWidth(
      style.minWidth + style.borderThickness * 2 + style.horizontalPadding * 2
    );
    size.setHeight(
      style.minHeight + style.borderThickness * 2 + style.verticalPadding * 2
    );
  },
  getSeparation: (
    node: DirectionNode,
    axis: Axis,
    dir: Direction,
    preferVertical: boolean
  ) => {
    const style = readStyle(node.value());
    switch (axis) {
      case Axis.VERTICAL:
        return style.verticalSeparation;
      case Axis.HORIZONTAL:
        return style.horizontalSeparation;
      case Axis.Z:
        if (preferVertical) {
          return style.verticalPadding - style.borderThickness;
        }
        return style.horizontalPadding - style.borderThickness;
    }
    return 0;
  },
};

document.addEventListener("DOMContentLoaded", () => {
  const glProvider = new BasicGLProvider();

  const painters = new WeakMap<DirectionNode, WebGLBlockPainter>();

  const graph = buildGraph();
  const cld = new CommitLayoutData(graph, {
    ...layoutPainter,
    paint: (pg: DirectionNode): boolean => {
      console.log("Painting", pg);
      if (!painters.get(pg)) {
        painters.set(pg, new WebGLBlockPainter(glProvider));
      }

      // Count the blocks for each node.
      let numBlocks = 0;
      pg.forEachNode((n) => {
        paintNodeBounds(n as DirectionNode, (x, y, w, h) => {
          numBlocks++;
        });
        paintNodeLines(n as DirectionNode, 1, (x, y, w, h) => {
          numBlocks++;
        });
      });

      const painter = painters.get(pg);
      if (!painter) {
        throw new Error("Impossible");
      }
      painter.initBuffer(numBlocks);

      painter.setBackgroundColor(new Color(0.5, 0.5, 0.5));
      painter.setBorderColor(new Color(1, 1, 1));

      pg.forEachNode((n) => {
        const style = readStyle((n as DirectionNode).value());
        paintNodeBounds(n as DirectionNode, (x, y, w, h) => {
          painter.drawBlock(
            x,
            y,
            w,
            h,
            style.borderRoundedness,
            style.borderThickness
          );
        });
        paintNodeLines(n as DirectionNode, 4, (x, y, w, h) => {
          painter.drawBlock(x, y, w, h, 0, 0);
        });
      });

      return false;
    },
  });

  // Add canvas to root
  const root = document.getElementById("demo");
  if (!root) {
    throw new Error("root not found");
  }
  root.style.position = "relative";
  root.style.width = "100vw";
  root.style.height = "100vh";
  glProvider.gl();

  const canvas = glProvider.canvas();

  canvas.style.width = "100%";
  canvas.style.height = "100%";

  glProvider.container().style.width = "100%";
  glProvider.container().style.height = "100%";

  root.appendChild(glProvider.container());

  const cam = new Camera();

  const count = 0;
  while (cld.crank()) {
    if (count > 1000) {
      throw new Error("Commit layout is looping forever");
    }
  }

  const reticlePainter = new WebGLBlockPainter(glProvider, BlockType.SQUARE);
  let selectedNode: DirectionNode;

  const loop = () => {
    cam.setSize(glProvider.width(), glProvider.height());

    if (glProvider.canProject()) {
      const world = cam.project();

      glProvider.render();

      const gl = glProvider.gl();
      gl.viewport(0, 0, cam.width(), cam.height());

      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.DST_ALPHA);

      graph.forEachPaintGroup((pg) => {
        const painter = painters.get(pg as DirectionNode);
        if (!painter) {
          console.log("No paint group for pg " + pg);
          return;
        }

        const layout = pg.getLayout();
        const scale = layout.absoluteScale();

        const moveMat = makeTranslation3x3(
          layout.absoluteX(),
          layout.absoluteY()
        );
        const scaleMat = makeScale3x3(scale, scale);

        painter.render(matrixMultiply3x3(scaleMat, moveMat, world), 2.0);
      });

      // Draw reticle
      if (selectedNode) {
        reticlePainter.clear();
        reticlePainter.setBackgroundColor(new Color(1, 1, 0, 1));
        reticlePainter.setBorderColor(new Color(1, 1, 0, 1));
        reticlePainter.initBuffer(1);
        const layout = selectedNode.getLayout();
        const style = readStyle(selectedNode.value());
        reticlePainter.drawBlock(
          layout.absoluteX(),
          layout.absoluteY(),
          layout.absoluteSize().width(),
          layout.absoluteSize().height(),
          style.borderRoundedness,
          style.borderThickness
        );
        reticlePainter.render(world, 1.0);
      }
    } else {
      requestAnimationFrame(loop);
    }
  };

  let isDown: Date | undefined;
  glProvider.container().addEventListener("mousedown", (e) => {
    isDown = new Date();
  });

  glProvider.container().addEventListener("mouseup", (e) => {
    if (!isDown) {
      return;
    }
    if (Date.now() - isDown.getTime() < 1000) {
      // Treat as click.
      console.log("click", e);
      const [x, y] = cam.transform(e.offsetX, e.offsetY);
      const selected = graph.getLayout().nodeUnderCoords(x, y, 1.0);
      if (selected) {
        alert(selected.state().id());
      }
    }
    isDown = undefined;
  });

  glProvider.container().addEventListener("mousemove", (e) => {
    requestAnimationFrame(loop);
    if (isDown) {
      console.log("mousemove", e.movementX, e.movementY);
      cam.adjustOrigin(e.movementX / cam.scale(), e.movementY / cam.scale());
      return;
    }
    const [x, y] = cam.transform(e.offsetX, e.offsetY);
    selectedNode = graph.getLayout().nodeUnderCoords(x, y, 1.0);
    if (selectedNode) {
      console.log(selectedNode);
    }
  });

  glProvider.container().addEventListener("wheel", (e) => {
    console.log(e);
    cam.zoomToPoint(Math.pow(1.1, e.deltaY / 100), e.offsetX, e.offsetY);
    requestAnimationFrame(loop);
  });

  requestAnimationFrame(loop);
});
