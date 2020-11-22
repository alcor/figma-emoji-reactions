figma.showUI(__html__, {width:300, height:400});

figma.ui.onmessage = async (msg) => {
  const font = { family: "Arimo", style: "Bold" }
  await figma.loadFontAsync(font)
  await figma.loadFontAsync({ family: "Roboto", style: "Regular" })
  if (msg.type === 'add-reaction') {
    const frame = figma.createFrame()
    frame.resizeWithoutConstraints(128, 48)
    frame.x = figma.viewport.center.x - frame.width / 2
    frame.y = figma.viewport.center.y - frame.height / 2
    frame.layoutMode = "VERTICAL"
    frame.horizontalPadding = 16
    frame.verticalPadding = 8
    frame.layoutAlign = "STRETCH"
    frame.cornerRadius = frame.height / 2;
    frame.bottomLeftRadius = 0;
    frame.strokeAlign = 'OUTSIDE'
    frame.strokeWeight = 1
    frame.strokes = [{ type: 'SOLID', color: {r: 0, g: 0, b: 0}, opacity: 0.2 }]

    var string = msg.string || "❤️"
    const label = figma.createText()
    label.layoutAlign = "STRETCH"
    label.fills = [{ type: 'SOLID', color: {r: 0, g: 0, b: 0} }]
    label.characters = string
    label.fontSize = 18
    if (label.characters.length <= 3) label.fontSize = 48;
    label.textAlignHorizontal = 'CENTER'
    label.textAlignVertical = 'CENTER'
    label.textAutoResize = "WIDTH_AND_HEIGHT"
    label.fontName = font
    frame.appendChild(label)

    var group = figma.group([frame], figma.currentPage)
    group.name = "Reaction: " + string
    figma.currentPage.selection = [group];
  }

  figma.closePlugin();
};
