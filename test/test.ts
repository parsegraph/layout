import Direction, {
  FORWARD,
  DOWNWARD,
  UPWARD,
  BACKWARD,
  DirectionCaret,
} from "parsegraph-direction";
import {
  LayoutNodePalette,
  style as readStyle,
  checkExtentsEqual,
  LayoutNode,
  BasicPositioned,
} from "../dist/parsegraph-layout";
import Extent from "parsegraph-extent";

import { elapsed } from "parsegraph-timing";

const BUD = "u";
const BLOCK = "b";
const SLOT = "s";
const SHRINK_SCALE = 0.85;

const expect = function (expected: any, actual: any) {
  const diff = expected - actual;
  if (diff) {
    console.log("expected=" + expected + ", actual=" + actual);
  }
  return diff;
};

export function getLayoutNodes(node: LayoutNode) {
  const list = [];
  const orig = node;
  const start = new Date();
  do {
    node = node._layoutNext;
    // console.log(node._id);
    for (let i = 0; i < list.length; ++i) {
      if (list[i] == node) {
        console.log(list);
        throw new Error("Layout list has loop");
      }
    }
    list.push(node);
    if (elapsed(start) > 5000) {
      throw new Error("Infinite loop");
    }
  } while (orig != node);
  return list;
}

function makeCaret(given?: any) {
  return new DirectionCaret<BasicPositioned>(new LayoutNodePalette(), given);
}

const palette = new LayoutNodePalette();
function makeNode(given?: any) {
  return palette.spawn(given);
}

describe("Package", function () {
  it("Viewport - Trivial layout", function () {
    // Spawn the graph.
    // console.log("TRIV");
    const caret = makeCaret("b");
    caret.node().value().getLayout().commitLayoutIteratively();

    const value = caret.node().value();
    const layout = value.getLayout();
    const style = value.blockStyle();

    // Run the comparison tests.
    if (
      layout.extentOffsetAt(FORWARD) !=
      style.minHeight / 2 + style.borderThickness + style.verticalPadding
    ) {
      console.log(layout.extentOffsetAt(FORWARD));
      console.log(style.minHeight / 2);
      console.log(style.borderThickness);
      console.log(style.verticalPadding);
      console.log(
        style.minHeight / 2 + style.borderThickness + style.verticalPadding
      );
      throw new Error("Forward extent offset for block must match.");
    }

    if (
      layout.extentOffsetAt(BACKWARD) !=
      style.minHeight / 2 + style.borderThickness + style.verticalPadding
    ) {
      console.log(layout.extentOffsetAt(BACKWARD));
      console.log(style.minHeight / 2);
      console.log(style.borderThickness);
      console.log(style.verticalPadding);
      throw new Error("Backward extent offset for block must match.");
    }

    if (
      layout.extentOffsetAt(UPWARD) !=
      style.minWidth / 2 + style.borderThickness + style.horizontalPadding
    ) {
      console.log(layout.extentOffsetAt(UPWARD));
      console.log(style.minWidth / 2);
      console.log(style.borderThickness);
      console.log(style.horizontalPadding);
      throw new Error("Upward extent offset for block must match.");
    }

    if (
      layout.extentOffsetAt(DOWNWARD) !=
      style.minWidth / 2 + style.borderThickness + style.horizontalPadding
    ) {
      console.log(layout.extentOffsetAt(DOWNWARD));
      console.log(style.minWidth / 2);
      console.log(style.borderThickness);
      console.log(style.horizontalPadding);
      throw new Error("Downward extent offset for block must match.");
    }
  });

  it("Viewport - Block with forward bud", function () {
    // Spawn the graph.
    const caret = makeCaret(BLOCK);
    caret.spawn(FORWARD, BUD);
    caret.node().value().getLayout().commitLayoutIteratively();

    const value = caret.node().value();
    const layout = value.getLayout();
    const style = value.blockStyle();

    // Run the comparison tests.

    let diff = expect(
      style.minHeight / 2 + style.borderThickness + style.verticalPadding,
      layout.extentOffsetAt(FORWARD)
    );
    if (diff) {
      throw new Error("Forward extent offset is off by " + diff);
    }

    diff = expect(
      readStyle("b").minHeight / 2 +
        readStyle("b").borderThickness +
        readStyle("b").verticalPadding,
      layout.extentOffsetAt(BACKWARD)
    );
    if (diff) {
      throw new Error("Backward extent offset is off by " + diff);
    }

    diff = expect(
      readStyle("b").minWidth / 2 +
        readStyle("b").borderThickness +
        readStyle("b").horizontalPadding,
      layout.extentOffsetAt(UPWARD)
    );
    if (diff) {
      throw new Error("Upward extent offset is off by " + diff);
    }

    diff = expect(
      readStyle("b").minWidth / 2 +
        readStyle("b").borderThickness +
        readStyle("b").horizontalPadding,
      layout.extentOffsetAt(DOWNWARD)
    );
    if (diff) {
      throw new Error("Downward extent offset is off by " + diff);
    }
  });

  it("Viewport - Block with backward bud", function () {
    // Spawn the graph.
    const caret = makeCaret(BLOCK);
    caret.spawn(BACKWARD, BUD);
    caret.node().value().getLayout().commitLayoutIteratively();
    caret.moveToRoot();

    const value = caret.node().value();
    const layout = value.getLayout();
    const style = value.blockStyle();

    // Run the comparison tests.

    let diff = expect(
      style.minHeight / 2 + style.borderThickness + style.verticalPadding,
      layout.extentOffsetAt(FORWARD)
    );
    if (diff) {
      throw new Error("Forward extent offset is off by " + diff);
    }

    diff = expect(
      style.minHeight / 2 + style.borderThickness + style.verticalPadding,
      layout.extentOffsetAt(BACKWARD)
    );
    if (diff) {
      throw new Error("Backward extent offset is off by " + diff);
    }

    diff = expect(
      readStyle("bud").minWidth +
        readStyle("bud").borderThickness * 2 +
        readStyle("bud").horizontalPadding * 2 +
        layout.horizontalSeparation(BACKWARD) +
        readStyle("block").minWidth / 2 +
        readStyle("block").borderThickness +
        readStyle("block").horizontalPadding,
      layout.extentOffsetAt(UPWARD)
    );
    if (diff) {
      throw new Error("Upward extent offset is off by " + diff);
    }

    diff = expect(
      readStyle("bud").minWidth +
        readStyle("bud").borderThickness * 2 +
        readStyle("bud").horizontalPadding * 2 +
        layout.horizontalSeparation(BACKWARD) +
        readStyle("block").minWidth / 2 +
        readStyle("block").borderThickness +
        readStyle("block").horizontalPadding,
      layout.extentOffsetAt(DOWNWARD)
    );
    if (diff) {
      throw new Error("Downward extent offset is off by " + diff);
    }
  });

  it("Viewport - Block with downward bud", function () {
    // Build the graph.
    const caret = makeCaret(BLOCK);
    caret.spawn(DOWNWARD, BUD);
    caret.node().value().getLayout().commitLayoutIteratively();
    caret.moveToRoot();

    const value = caret.node().value();
    const layout = value.getLayout();

    // Run the comparison tests.

    let diff = expect(
      readStyle("block").verticalPadding +
        readStyle("block").borderThickness +
        readStyle("block").minHeight / 2,
      layout.extentOffsetAt(FORWARD)
    );
    if (diff) {
      throw new Error("Forward extent offset is off by " + diff);
    }

    diff = expect(
      readStyle("block").verticalPadding +
        readStyle("block").borderThickness +
        readStyle("block").minHeight / 2,
      layout.extentOffsetAt(BACKWARD)
    );
    if (diff) {
      throw new Error("Backward extent offset is off by " + diff);
    }

    diff = expect(
      readStyle("block").minWidth / 2 +
        readStyle("block").borderThickness +
        readStyle("block").horizontalPadding,
      layout.extentOffsetAt(UPWARD)
    );
    if (diff) {
      throw new Error("Upward extent offset is off by " + diff);
    }

    diff = expect(
      readStyle("block").minWidth / 2 +
        readStyle("block").borderThickness +
        readStyle("block").horizontalPadding,
      layout.extentOffsetAt(DOWNWARD)
    );
    if (diff) {
      throw new Error("Downward extent offset is off by " + diff);
    }
  });

  it("Viewport - Bud with downward block", function () {
    // Build the graph.
    const caret = makeCaret(BUD);
    caret.spawn(DOWNWARD, BLOCK);
    caret.moveToRoot();
    caret.node().value().getLayout().commitLayoutIteratively();

    const value = caret.node().value();
    const layout = value.getLayout();

    // Run the comparison tests.

    let diff = expect(
      readStyle("bu").verticalPadding +
        readStyle("bu").borderThickness +
        readStyle("bu").minHeight / 2,
      layout.extentOffsetAt(FORWARD)
    );
    if (diff) {
      throw new Error("Forward extent offset is off by " + diff);
    }

    diff = expect(
      readStyle("bu").verticalPadding +
        readStyle("bu").borderThickness +
        readStyle("bu").minHeight / 2,
      layout.extentOffsetAt(BACKWARD)
    );
    if (diff) {
      throw new Error("Backward extent offset is off by " + diff);
    }

    diff = expect(
      readStyle("b").minWidth / 2 +
        readStyle("b").borderThickness +
        readStyle("b").horizontalPadding,
      layout.extentOffsetAt(UPWARD)
    );
    if (diff) {
      throw new Error("Upward extent offset is off by " + diff);
    }

    diff = expect(
      readStyle("b").minWidth / 2 +
        readStyle("b").borderThickness +
        readStyle("b").horizontalPadding,
      layout.extentOffsetAt(DOWNWARD)
    );
    if (diff) {
      throw new Error("Downward extent offset is off by " + diff);
    }
  });

  it("Viewport - Bud with vertical blocks, two deep", function () {
    // Build the graph.
    const caret = makeCaret(BUD);

    const depth = 2;
    caret.push();
    for (let i = 0; i < depth; ++i) {
      caret.spawnMove(UPWARD, BLOCK);
    }
    caret.pop();
    caret.push();
    for (let i = 0; i < depth; ++i) {
      caret.spawnMove(DOWNWARD, BLOCK);
    }
    caret.pop();
    caret.moveToRoot();
    caret.node().value().getLayout().commitLayoutIteratively();

    const value = caret.node().value();
    const layout = value.getLayout();

    // Run comparison tests.

    const computedBlockSize =
      readStyle("b").verticalPadding * 2 +
      readStyle("b").borderThickness * 2 +
      readStyle("b").minHeight +
      caret
        .node()
        .nodeAt(UPWARD)
        .value()
        .getLayout()
        .verticalSeparation(UPWARD);

    let diff = expect(
      computedBlockSize * (depth - 1) +
        readStyle("b").verticalPadding * 2 +
        readStyle("b").borderThickness * 2 +
        readStyle("b").minHeight +
        layout.verticalSeparation(UPWARD) +
        readStyle("bu").verticalPadding +
        readStyle("bu").borderThickness +
        readStyle("bu").minHeight / 2,
      layout.extentOffsetAt(FORWARD)
    );
    if (diff) {
      throw new Error("Forward extent offset is off by " + diff);
    }

    diff = expect(
      computedBlockSize * (depth - 1) +
        readStyle("b").verticalPadding * 2 +
        readStyle("b").borderThickness * 2 +
        readStyle("b").minHeight +
        layout.verticalSeparation(UPWARD) +
        readStyle("bu").verticalPadding +
        readStyle("bu").borderThickness +
        readStyle("bu").minHeight / 2,
      layout.extentOffsetAt(BACKWARD)
    );
    if (diff) {
      throw new Error("Backward extent offset is off by " + diff);
    }

    diff = expect(
      readStyle("b").minWidth / 2 +
        readStyle("b").borderThickness +
        readStyle("b").horizontalPadding,
      layout.extentOffsetAt(UPWARD)
    );
    if (diff) {
      throw new Error("Upward extent offset is off by " + diff);
    }

    diff = expect(
      readStyle("b").minWidth / 2 +
        readStyle("b").borderThickness +
        readStyle("b").horizontalPadding,
      layout.extentOffsetAt(DOWNWARD)
    );
    if (diff) {
      throw new Error("Downward extent offset is off by " + diff);
    }
  });

  it("Viewport - Block with upward bud", function () {
    // Build the graph.
    const caret = makeCaret(BLOCK);
    caret.spawn(UPWARD, BUD);
    caret.moveToRoot();
    caret.node().value().getLayout().commitLayoutIteratively();

    const value = caret.node().value();
    const layout = value.getLayout();

    // Run comparison tests.

    let diff = expect(
      readStyle("bu").verticalPadding * 2 +
        readStyle("bu").borderThickness * 2 +
        readStyle("bu").minHeight +
        layout.verticalSeparation(UPWARD) +
        readStyle("b").verticalPadding +
        readStyle("b").borderThickness +
        readStyle("b").minHeight / 2,
      layout.extentOffsetAt(FORWARD)
    );
    if (diff) {
      throw new Error("Forward extent offset is off by " + diff);
    }

    diff = expect(
      readStyle("bu").verticalPadding * 2 +
        readStyle("bu").borderThickness * 2 +
        readStyle("bu").minHeight +
        layout.verticalSeparation(UPWARD) +
        readStyle("b").verticalPadding +
        readStyle("b").borderThickness +
        readStyle("b").minHeight / 2,
      layout.extentOffsetAt(BACKWARD)
    );
    if (diff) {
      throw new Error("Backward extent offset is off by " + diff);
    }

    diff = expect(
      readStyle("b").horizontalPadding +
        readStyle("b").borderThickness +
        readStyle("b").minWidth / 2,
      layout.extentOffsetAt(UPWARD)
    );
    if (diff) {
      throw new Error("Upward extent offset is off by " + diff);
    }

    diff = expect(
      readStyle("b").horizontalPadding +
        readStyle("b").borderThickness +
        readStyle("b").minWidth / 2,
      layout.extentOffsetAt(DOWNWARD)
    );
    if (diff) {
      throw new Error("Downward extent offset is off by " + diff);
    }
  });

  it("Viewport - Block with upward and downward buds", function () {
    // Build the graph.
    const caret = makeCaret(BLOCK);

    caret.spawn(UPWARD, BUD);
    caret.spawn(DOWNWARD, BUD);
    caret.moveToRoot();
    caret.node().value().getLayout().commitLayoutIteratively();

    const value = caret.node().value();
    const layout = value.getLayout();

    // Run comparison tests.

    let diff = expect(
      readStyle("b").minHeight / 2 +
        readStyle("b").borderThickness +
        readStyle("b").verticalPadding +
        layout.verticalSeparation(UPWARD) +
        readStyle("bu").verticalPadding * 2 +
        readStyle("bu").borderThickness * 2 +
        readStyle("bu").minHeight,
      layout.extentOffsetAt(FORWARD)
    );
    if (diff) {
      throw new Error("Forward extent offset is off by " + diff);
    }

    diff = expect(
      readStyle("b").minHeight / 2 +
        readStyle("b").borderThickness +
        readStyle("b").verticalPadding +
        layout.verticalSeparation(UPWARD) +
        readStyle("bu").verticalPadding * 2 +
        readStyle("bu").borderThickness * 2 +
        readStyle("bu").minHeight,
      layout.extentOffsetAt(BACKWARD)
    );
    if (diff) {
      throw new Error("Backward extent offset is off by " + diff);
    }

    diff = expect(
      readStyle("b").minWidth / 2 +
        readStyle("b").borderThickness +
        readStyle("b").horizontalPadding,
      layout.extentOffsetAt(UPWARD)
    );
    if (diff) {
      throw new Error("Upward extent offset is off by " + diff);
    }

    diff = expect(
      readStyle("b").minWidth / 2 +
        readStyle("b").borderThickness +
        readStyle("b").horizontalPadding,
      layout.extentOffsetAt(DOWNWARD)
    );
    if (diff) {
      throw new Error("Downward extent offset is off by " + diff);
    }
  });

  it("Viewport - Block with forward and backward buds", function () {
    // Build the graph.
    const caret = makeCaret(BLOCK);
    caret.spawn(FORWARD, BUD);
    caret.spawn(BACKWARD, BUD);
    caret.moveToRoot();
    caret.node().value().getLayout().commitLayoutIteratively();

    // Run comparison tests.

    const value = caret.node().value();
    const layout = value.getLayout();

    let diff = expect(
      readStyle("b").minHeight / 2 +
        readStyle("b").borderThickness +
        readStyle("b").verticalPadding,
      layout.extentOffsetAt(FORWARD)
    );
    if (diff) {
      throw new Error("Forward extent offset is off by " + diff);
    }

    diff = expect(
      readStyle("b").minHeight / 2 +
        readStyle("b").borderThickness +
        readStyle("b").verticalPadding,
      layout.extentOffsetAt(BACKWARD)
    );
    if (diff) {
      throw new Error("Backward extent offset is off by " + diff);
    }

    diff = expect(
      readStyle("bu").minWidth +
        readStyle("bu").borderThickness * 2 +
        readStyle("bu").horizontalPadding * 2 +
        layout.horizontalSeparation(BACKWARD) +
        readStyle("b").minWidth / 2 +
        readStyle("b").borderThickness +
        readStyle("b").horizontalPadding,
      layout.extentOffsetAt(UPWARD)
    );
    if (diff) {
      throw new Error("Upward extent offset is off by " + diff);
    }

    diff = expect(
      readStyle("bu").minWidth +
        readStyle("bu").borderThickness * 2 +
        readStyle("bu").horizontalPadding * 2 +
        layout.horizontalSeparation(BACKWARD) +
        readStyle("b").minWidth / 2 +
        readStyle("b").borderThickness +
        readStyle("b").horizontalPadding,
      layout.extentOffsetAt(DOWNWARD)
    );
    if (diff) {
      throw new Error("Downward extent offset is off by " + diff);
    }
  });

  it("Viewport - Double Axis Sans Backward T layout", function () {
    // Build the graph.
    const caret = makeCaret(BLOCK);
    caret.spawn(FORWARD, BUD);
    caret.spawn(UPWARD, BUD);
    caret.spawn(DOWNWARD, BUD);
    caret.moveToRoot();
    caret.node().value().getLayout().commitLayoutIteratively();

    // Run comparison tests.
    const value = caret.node().value();
    const layout = value.getLayout();

    if (layout.extentOffsetAt(BACKWARD) != layout.extentOffsetAt(FORWARD)) {
      throw new Error(
        "Graphs symmetric about the root should" +
          " have symmetric extent offsets."
      );
    }

    if (layout.extentOffsetAt(UPWARD) != layout.extentOffsetAt(DOWNWARD)) {
      throw new Error(
        "Graphs symmetric about the root should" +
          " have symmetric extent offsets."
      );
    }

    let diff = expect(
      readStyle("bu").verticalPadding * 2 +
        readStyle("bu").borderThickness * 2 +
        readStyle("bu").minHeight +
        layout.verticalSeparation(UPWARD) +
        readStyle("b").verticalPadding +
        readStyle("b").borderThickness +
        readStyle("b").minHeight / 2,
      layout.extentOffsetAt(FORWARD)
    );
    if (diff) {
      throw new Error("Forward extent offset is off by " + diff);
    }

    diff = expect(
      readStyle("bu").verticalPadding * 2 +
        readStyle("bu").borderThickness * 2 +
        readStyle("bu").minHeight +
        layout.verticalSeparation(UPWARD) +
        readStyle("b").verticalPadding +
        readStyle("b").borderThickness +
        readStyle("b").minHeight / 2,
      layout.extentOffsetAt(BACKWARD)
    );
    if (diff) {
      throw new Error("Backward extent offset is off by " + diff);
    }

    diff = expect(
      readStyle("b").minWidth / 2 +
        readStyle("b").borderThickness +
        readStyle("b").horizontalPadding,
      layout.extentOffsetAt(UPWARD)
    );
    if (diff) {
      throw new Error("Upward extent offset is off by " + diff);
    }

    diff = expect(
      readStyle("b").minWidth / 2 +
        readStyle("b").borderThickness +
        readStyle("b").horizontalPadding,
      layout.extentOffsetAt(DOWNWARD)
    );
    if (diff) {
      throw new Error("Downward extent offset is off by " + diff);
    }
  });

  it("Viewport - Positive Direction Layout", function () {
    // Build the graph.
    const caret = makeCaret(BLOCK);
    caret.spawn(UPWARD, BUD);
    caret.spawn(FORWARD, BUD);
    caret.node().value().getLayout().commitLayoutIteratively();

    // Run the tests.
    const value = caret.node().value();
    const layout = value.getLayout();

    if (layout.extentOffsetAt(BACKWARD) != layout.extentOffsetAt(FORWARD)) {
      throw new Error(
        "Graphs symmetric about the root should" +
          " have symmetric extent offsets."
      );
    }

    if (layout.extentOffsetAt(UPWARD) != layout.extentOffsetAt(DOWNWARD)) {
      throw new Error(
        "Graphs symmetric about the root should" +
          " have symmetric extent offsets."
      );
    }

    let diff = expect(
      readStyle("bu").minHeight +
        readStyle("bu").borderThickness * 2 +
        readStyle("bu").verticalPadding * 2 +
        layout.verticalSeparation(UPWARD) +
        readStyle("b").minHeight / 2 +
        readStyle("b").borderThickness +
        readStyle("b").verticalPadding,
      layout.extentOffsetAt(FORWARD)
    );
    if (diff) {
      throw new Error("Forward extent offset is off by " + diff);
    }

    diff = expect(
      readStyle("bu").minHeight +
        readStyle("bu").borderThickness * 2 +
        readStyle("bu").verticalPadding * 2 +
        layout.verticalSeparation(UPWARD) +
        readStyle("b").minHeight / 2 +
        readStyle("b").borderThickness +
        readStyle("b").verticalPadding,
      layout.extentOffsetAt(BACKWARD)
    );
    if (diff) {
      throw new Error("Backward extent offset is off by " + diff);
    }

    diff = expect(
      readStyle("b").minWidth / 2 +
        readStyle("b").borderThickness +
        readStyle("b").horizontalPadding,
      layout.extentOffsetAt(UPWARD)
    );
    if (diff) {
      throw new Error("Upward extent offset is off by " + diff);
    }

    diff = expect(
      readStyle("b").minWidth / 2 +
        readStyle("b").borderThickness +
        readStyle("b").horizontalPadding,
      layout.extentOffsetAt(DOWNWARD)
    );
    if (diff) {
      throw new Error("Downward extent offset is off by " + diff);
    }
  });

  it("Viewport - Negative Direction Layout", function () {
    // Build the graph.
    const caret = makeCaret(BLOCK);
    caret.spawn(BACKWARD, BUD);
    caret.spawn(DOWNWARD, BUD);
    caret.node().value().getLayout().commitLayoutIteratively();

    // Run comparison tests.
    const value = caret.node().value();
    const layout = value.getLayout();
    if (layout.extentOffsetAt(BACKWARD) != layout.extentOffsetAt(FORWARD)) {
      throw new Error(
        "Graphs symmetric about the root should" +
          " have symmetric extent offsets."
      );
    }

    if (layout.extentOffsetAt(UPWARD) != layout.extentOffsetAt(DOWNWARD)) {
      throw new Error(
        "Graphs symmetric about the root should" +
          " have symmetric extent offsets."
      );
    }

    let diff = expect(
      readStyle("b").verticalPadding +
        readStyle("b").borderThickness +
        readStyle("b").minHeight / 2,
      layout.extentOffsetAt(FORWARD)
    );
    if (diff) {
      throw new Error("Forward extent offset is off by " + diff);
    }

    diff = expect(
      readStyle("b").verticalPadding +
        readStyle("b").borderThickness +
        readStyle("b").minHeight / 2,
      layout.extentOffsetAt(BACKWARD)
    );
    if (diff) {
      throw new Error("Backward extent offset is off by " + diff);
    }

    diff = expect(
      readStyle("bu").minWidth +
        2 * readStyle("bu").horizontalPadding +
        2 * readStyle("bu").borderThickness +
        layout.horizontalSeparation(DOWNWARD) +
        readStyle("b").minWidth / 2 +
        readStyle("b").borderThickness +
        readStyle("b").horizontalPadding,
      layout.extentOffsetAt(UPWARD)
    );
    if (diff) {
      throw new Error("Upward extent offset is off by " + diff);
    }

    diff = expect(
      readStyle("bu").horizontalPadding * 2 +
        readStyle("bu").borderThickness * 2 +
        readStyle("bu").minWidth +
        layout.horizontalSeparation(DOWNWARD) +
        readStyle("b").horizontalPadding +
        readStyle("b").borderThickness +
        readStyle("b").minWidth / 2,
      layout.extentOffsetAt(DOWNWARD)
    );
    if (diff) {
      throw new Error("Downward extent offset is off by " + diff);
    }
  });

  it("Viewport - Double Axis layout", function () {
    // Build the graph.
    const caret = makeCaret(BLOCK);
    caret.spawn(BACKWARD, BUD);
    caret.spawn(FORWARD, BUD);
    caret.spawn(UPWARD, BUD);
    caret.spawn(DOWNWARD, BUD);
    caret.node().value().getLayout().commitLayoutIteratively();

    // Run comparison tests.
    const value = caret.node().value();
    const layout = value.getLayout();
    if (layout.extentOffsetAt(BACKWARD) != layout.extentOffsetAt(FORWARD)) {
      throw new Error(
        "Graphs symmetric about the root should" +
          " have symmetric extent offsets."
      );
    }

    if (layout.extentOffsetAt(UPWARD) != layout.extentOffsetAt(DOWNWARD)) {
      throw new Error(
        "Graphs symmetric about the root should" +
          " have symmetric extent offsets."
      );
    }

    let diff = expect(
      readStyle("bu").minHeight +
        readStyle("bu").borderThickness * 2 +
        readStyle("bu").verticalPadding * 2 +
        layout.verticalSeparation(UPWARD) +
        readStyle("b").minHeight / 2 +
        readStyle("b").borderThickness +
        readStyle("b").verticalPadding,
      layout.extentOffsetAt(FORWARD)
    );
    if (diff) {
      throw new Error("Forward extent offset is off by " + diff);
    }

    diff = expect(
      readStyle("bu").verticalPadding * 2 +
        readStyle("bu").borderThickness * 2 +
        readStyle("bu").minHeight +
        layout.verticalSeparation(FORWARD) +
        readStyle("b").verticalPadding +
        readStyle("b").borderThickness +
        readStyle("b").minHeight / 2,
      layout.extentOffsetAt(BACKWARD)
    );
    if (diff) {
      throw new Error("Backward extent offset is off by " + diff);
    }

    diff = expect(
      readStyle("bu").minWidth +
        2 * readStyle("bu").horizontalPadding +
        2 * readStyle("bu").borderThickness +
        layout.horizontalSeparation(BACKWARD) +
        readStyle("b").horizontalPadding +
        readStyle("b").borderThickness +
        readStyle("b").minWidth / 2,
      layout.extentOffsetAt(UPWARD)
    );
    if (diff) {
      throw new Error("Upward extent offset is off by " + diff);
    }

    diff = expect(
      readStyle("bu").horizontalPadding * 2 +
        readStyle("bu").borderThickness * 2 +
        readStyle("bu").minWidth +
        layout.horizontalSeparation(FORWARD) +
        readStyle("b").horizontalPadding +
        readStyle("b").borderThickness +
        readStyle("b").minWidth / 2,
      layout.extentOffsetAt(DOWNWARD)
    );
    if (diff) {
      throw new Error("Downward extent offset is off by " + diff);
    }
  });

  it("Viewport - Block with shrunk bud", function () {
    // Build the graph.
    const caret = makeCaret(BLOCK);
    caret.fitExact();
    caret.spawnMove(FORWARD, BUD);
    caret.shrink();
    caret.moveToRoot();
    caret.node().value().getLayout().commitLayoutIteratively();

    // Run comparison tests.
    const value = caret.node().value();
    const layout = value.getLayout();
    const expectedSeparation =
      readStyle("b").minWidth / 2 +
      readStyle("b").horizontalPadding +
      readStyle("b").borderThickness +
      SHRINK_SCALE * layout.horizontalSeparation(FORWARD) +
      SHRINK_SCALE *
        (readStyle("bu").horizontalPadding +
          readStyle("bu").borderThickness +
          readStyle("bu").minWidth / 2);
    if (caret.node().separationAt(FORWARD) != expectedSeparation) {
      throw new Error(
        "Expected forward separation = " +
          expectedSeparation +
          ", actual = " +
          caret.node().separationAt(FORWARD)
      );
    }

    const downwardExtent = new Extent();
    downwardExtent.appendLS(
      readStyle("b").minWidth +
        readStyle("b").borderThickness * 2 +
        readStyle("b").horizontalPadding * 2 +
        SHRINK_SCALE * layout.horizontalSeparation(FORWARD),
      readStyle("b").verticalPadding +
        readStyle("b").borderThickness +
        readStyle("b").minHeight / 2
    );
    downwardExtent.appendLS(
      SHRINK_SCALE *
        (2 * readStyle("bu").horizontalPadding +
          2 * readStyle("bu").borderThickness +
          readStyle("bu").minWidth),
      SHRINK_SCALE *
        (readStyle("bu").horizontalPadding +
          readStyle("bu").borderThickness +
          readStyle("bu").minWidth / 2)
    );

    if (
      !caret
        .node()
        .value()
        .getLayout()
        .extentsAt(DOWNWARD)
        .equals(downwardExtent)
    ) {
      console.log(downwardExtent.dump(""));
      caret.node().value().getLayout().extentsAt(DOWNWARD).dump("");
      throw new Error("Downward extent differs");
      /*// graph._nodePainter.enableExtentRendering();
      // resultDom.appendChild(
      // graph._container
      // );
      resultDom.appendChild(downwardExtent.toDom("Expected downward extent"));
      resultDom.appendChild(
        caret.node().extentsAt(DOWNWARD).toDom("Actual downward extent")
      );
      resultDom.appendChild(
        document.createTextNode(
          "Extent offset = " + layout.extentOffsetAt(DOWNWARD)
        )
      );
      throw new Error("Downward extent differs.");*/
    }

    const blockHeight =
      readStyle("b").minHeight +
      readStyle("b").borderThickness * 2 +
      readStyle("b").verticalPadding * 2;

    const budHeight =
      readStyle("bu").minHeight +
      readStyle("bu").borderThickness * 2 +
      readStyle("bu").verticalPadding * 2;

    const forwardExtent = new Extent();
    forwardExtent.appendLS(
      blockHeight / 2 - (SHRINK_SCALE * budHeight) / 2,
      readStyle("b").minWidth / 2 +
        readStyle("b").horizontalPadding +
        readStyle("b").borderThickness
    );
    forwardExtent.appendLS(
      SHRINK_SCALE * budHeight,
      readStyle("b").minWidth / 2 +
        readStyle("b").horizontalPadding +
        readStyle("b").borderThickness +
        SHRINK_SCALE * layout.horizontalSeparation(FORWARD) +
        SHRINK_SCALE * budHeight
    );
    forwardExtent.appendLS(
      blockHeight / 2 - (SHRINK_SCALE * budHeight) / 2,
      readStyle("b").minWidth / 2 +
        readStyle("b").horizontalPadding +
        readStyle("b").borderThickness
    );

    if (
      !caret.node().value().getLayout().extentsAt(FORWARD).equals(forwardExtent)
    ) {
      throw new Error("Forward extent differs");
      /*graph._nodePainter.enableExtentRendering();
      resultDom.appendChild(graph._container);
      resultDom.appendChild(forwardExtent.toDom("Expected forward extent"));
      resultDom.appendChild(
        caret.node().extentsAt(FORWARD).toDom("Actual forward extent")
      );
      resultDom.appendChild(
        document.createTextNode(
          "Extent offset = " + layout.extentOffsetAt(FORWARD)
        )
      );
      throw new Error("Forward extent differs.");*/
    }
  });

  it("Viewport - Bud with 2-deep shrunk downward block", function () {
    // Build the graph.
    const caret = makeCaret(BUD);
    caret.fitExact();
    caret.spawnMove(DOWNWARD, BUD);
    caret.shrink();
    caret.spawn(DOWNWARD, BLOCK);
    caret.moveToRoot();
    caret.node().value().getLayout().commitLayoutIteratively();

    // Run comparison tests.
    const value = caret.node().value();
    const layout = value.getLayout();
    const downwardExtent = new Extent();
    downwardExtent.appendLS(
      SHRINK_SCALE *
        (readStyle("b").minWidth +
          readStyle("b").borderThickness * 2 +
          readStyle("b").horizontalPadding * 2),
      readStyle("bu").verticalPadding +
        readStyle("bu").borderThickness +
        readStyle("bu").minHeight / 2 +
        SHRINK_SCALE * layout.verticalSeparation(DOWNWARD) +
        SHRINK_SCALE *
          2 *
          (readStyle("bu").verticalPadding +
            readStyle("bu").borderThickness +
            readStyle("bu").minHeight / 2) +
        SHRINK_SCALE *
          caret
            .node()
            .nodeAt(DOWNWARD)
            .value()
            .getLayout()
            .verticalSeparation(DOWNWARD) +
        SHRINK_SCALE *
          (readStyle("b").minHeight +
            readStyle("b").verticalPadding * 2 +
            readStyle("b").borderThickness * 2)
    );

    if (!checkExtentsEqual(caret, DOWNWARD, downwardExtent)) {
      throw new Error("Downward extent differs.");
    }
  });

  it("Viewport - Double Axis Sans Forward T layout", function () {
    // Build the graph.
    const caret = makeCaret(BLOCK);
    caret.spawn(BACKWARD, BUD);
    caret.spawn(UPWARD, BUD);
    caret.spawn(DOWNWARD, BUD);
    caret.moveToRoot();
    caret.node().value().getLayout().commitLayoutIteratively();

    // Run comparison tests.
    const value = caret.node().value();
    const layout = value.getLayout();
    if (layout.extentOffsetAt(BACKWARD) != layout.extentOffsetAt(FORWARD)) {
      throw new Error(
        "Graphs symmetric about the root should" +
          " have symmetric extent offsets."
      );
    }

    if (layout.extentOffsetAt(UPWARD) != layout.extentOffsetAt(DOWNWARD)) {
      throw new Error(
        "Graphs symmetric about the root should" +
          " have symmetric extent offsets."
      );
    }

    let diff = expect(
      readStyle("bu").verticalPadding * 2 +
        readStyle("bu").borderThickness * 2 +
        readStyle("bu").minHeight +
        layout.verticalSeparation(UPWARD) +
        readStyle("b").verticalPadding +
        readStyle("b").borderThickness +
        readStyle("b").minHeight / 2,
      layout.extentOffsetAt(FORWARD)
    );
    if (diff) {
      console.log(
        "Forward extent (offset to center=" +
          layout.extentOffsetAt(FORWARD) +
          ")"
      );
      const forwardExtent = caret.node().value().getLayout().extentsAt(FORWARD);
      forwardExtent.forEach(function (length: number, size: number, i: number) {
        console.log(i + ". l=" + length + ", s=" + size);
      });

      console.log(
        "UPWARDExtent (offset to center=" + layout.extentOffsetAt(UPWARD) + ")"
      );
      const UPWARDExtent = caret.node().value().getLayout().extentsAt(UPWARD);
      UPWARDExtent.forEach(function (length: number, size: number, i: number) {
        console.log(i + ". l=" + length + ", s=" + size);
      });

      throw new Error("Forward extent offset is off by " + diff);
    }

    diff = expect(
      readStyle("bu").verticalPadding * 2 +
        readStyle("bu").borderThickness * 2 +
        readStyle("bu").minHeight +
        layout.verticalSeparation(UPWARD) +
        readStyle("b").verticalPadding +
        readStyle("b").borderThickness +
        readStyle("b").minHeight / 2,
      layout.extentOffsetAt(BACKWARD)
    );
    if (diff) {
      throw new Error("Backward extent offset is off by " + diff);
    }

    diff = expect(
      readStyle("bu").minWidth +
        2 * readStyle("bu").horizontalPadding +
        2 * readStyle("bu").borderThickness +
        layout.horizontalSeparation(BACKWARD) +
        readStyle("b").minWidth / 2 +
        readStyle("b").borderThickness +
        readStyle("b").horizontalPadding,
      layout.extentOffsetAt(UPWARD)
    );
    if (diff) {
      throw new Error("Upward extent offset is off by " + diff);
    }

    diff = expect(
      readStyle("bu").horizontalPadding * 2 +
        readStyle("bu").borderThickness * 2 +
        readStyle("bu").minWidth +
        layout.horizontalSeparation(BACKWARD) +
        readStyle("b").horizontalPadding +
        readStyle("b").borderThickness +
        readStyle("b").minWidth / 2,
      layout.extentOffsetAt(DOWNWARD)
    );
    if (diff) {
      throw new Error("Downward extent offset is off by " + diff);
    }
  });

  it("Centrally aligned back-and-forth", function () {
    const car = makeCaret("b");
    car.spawnMove("d", "bu");
    car.align("f", "c");
    car.spawnMove("f", "bu");
    car.spawnMove("d", "bu");

    car.root().value().getLayout().commitLayoutIteratively();

    // const sep = car.root().separationAt(DOWNWARD);
    // console.log("Bud size: " +
    //   (style('bu').horizontalPadding * 2 +
    //   style('bu').borderThickness * 2 +
    //   style('bu').minWidth));
    // console.log("Vertical separation: " +
    //   car.root().verticalSeparation(DOWNWARD));
    // console.log("Block size: " +
    //   (style('b').horizontalPadding * 2 +
    //   style('b').borderThickness * 2 +
    //   style('b').minWidth));
    // console.log(sep);
    /* throw new Error(sep - );
        (style('b').horizontalPadding +
        style('b').borderThickness +
        style('b').minWidth / 2) +
        car.root().verticalSeparation(DOWNWARD) +
        (style('bu').horizontalPadding +
        style('bu').borderThickness +
        style('bu').minWidth / 2)
    );*/
  });

  it("Intra-group move test", function () {
    const car = makeCaret("b");

    const bnode = car.spawn("d", "b");
    car.pull("d");

    const anode = car.spawnMove("f", "u");
    const mnode = car.spawn("d", "b");
    car.root().value().getLayout().commitLayoutIteratively();
    const ax = anode.value().getLayout().groupX();

    const gx = mnode.value().getLayout().groupX();

    const ns = { ...readStyle("b") };
    const increase = 100;
    ns.minWidth += increase;
    bnode.value().setBlockStyle(ns);
    bnode.layoutHasChanged();
    car.root().value().getLayout().commitLayoutIteratively();
    if (ax === anode.value().getLayout().groupX()) {
      //simpleGraph(out, car);
      throw new Error(
        "Bud must move when another node grows in size. (ax=" +
          ax +
          ", x=" +
          anode.value().getLayout().groupX() +
          ")"
      );
    }
    if (gx + increase / 2 !== mnode.value().getLayout().groupX()) {
      //simpleGraph(out, car);
      throw new Error(
        "Node must be moved when another node grows in size. (expected " +
          (gx + increase / 2) +
          " versus actual " +
          mnode.value().getLayout().groupX() +
          ")"
      );
    }
  });

  it("Absolute position test", function () {
    const car = makeCaret(BLOCK);
    const bnode = car.spawnMove("f", "b");
    car.spawnMove("f", "b");
    car.root().value().getLayout().commitLayoutIteratively();
    car.crease();
    // console.log("bnode", bnode.absoluteX(), bnode.absoluteY());
    // console.log("bnode", bnode.groupX(), bnode.groupY(), bnode.groupScale());
    const bstyle = { ...readStyle("b") };
    bstyle.minWidth += 100;
    bnode.value().setBlockStyle(bstyle);
    car.root().value().getLayout().commitLayoutIteratively();
    // console.log("bnode", bnode.groupX(), bnode.groupY(), bnode.groupScale());
    // console.log("bnode", bnode.absoluteX(), bnode.absoluteY());
  });

  it("Node lisp test simplified", function () {
    const root = makeNode(BUD);
    root._id = "root";

    const a = makeNode(BLOCK);
    a._id = "a";
    const b = makeNode(BLOCK);
    b._id = "b";
    const c = makeNode(BLOCK);
    c._id = "c";

    const chi = makeNode(BUD);
    chi._id = "chi";

    chi.connectNode(FORWARD, c);

    a.connectNode(DOWNWARD, chi);
    a.connectNode(FORWARD, b);
    // console.log("LISP TEST");
    // console.log(getLayoutNodes(a));
    root.connectNode(FORWARD, a);

    root.value().getLayout().commitLayoutIteratively();
  });

  it("Right-to-left test", function () {
    const node = makeNode(BUD);
    node.setRightToLeft(true);
  });

  it("Crease test", function () {
    const node = makeNode(BLOCK);
    const inner = makeNode(BUD);
    inner.setPaintGroup(true);
    node.connectNode(Direction.INWARD, inner);
    inner.value().getLayout().groupScale();
    node.value().getLayout().groupScale();
  });

  it("Disconnect trivial test", function () {
    const car = makeCaret(BUD);
    car.node().value().getLayout().commitLayoutIteratively();
    const originalRoot = car.node();
    car.spawnMove("f", "b");
    car.node().value().getLayout().commitLayoutIteratively();
    const newRoot = car.node();
    car.disconnect();
    originalRoot.value().getLayout().commitLayoutIteratively();
    newRoot.value().getLayout().commitLayoutIteratively();
  });

  it("Proportion pull test", function () {
    const car = makeCaret(BUD);
    car.node().value().getLayout().commitLayoutIteratively();
    const originalRoot = car.node();
    originalRoot._id = "ROOT";
    // car.spawn('b', 'u');
    // car.spawn('f', 'u');

    /*    car.spawnMove('d', 'b');
      car.push();
      car.spawnMove('b', 'u');
      car.spawnMove('d', 'u');
      car.spawnMove('d', 's');
      car.label('2');
      car.pop();

      car.push();
      car.spawnMove('f', 'u');
      car.spawnMove('d', 'u');
      car.spawnMove('d', 's');
      car.label('2');
      car.pop();

      car.pull('d');
      */

    car.spawnMove("d", "b");
    car.node()._id = "CENTER BLOCK";
    car.push();
    car.spawnMove("b", "u");
    car.node()._id = "DOWN BUD";
    // car.spawnMove('d', 's');
    // car.label('1');
    car.pop();

    // car.push();
    // car.spawnMove('f', 'u');
    // car.spawnMove('d', 's');
    // car.label('1');
    // car.pop();

    // console.log("Proportion test start");
    car.pull("d");

    // car.spawnMove('d', 's');

    try {
      originalRoot.value().getLayout().commitLayoutIteratively();
      // console.log("Proportion test SUCCESS");
    } finally {
      // console.log("Proportion test finished");
    }
  });
});