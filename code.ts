figma.showUI(__html__);

figma.ui.onmessage = async (msg) => {
  await figma.loadFontAsync({ family: "Roboto", style: "Regular" })
  if (msg.type === 'add-reaction') {
    const frame = figma.createFrame()
    frame.resizeWithoutConstraints(300, 150)
    frame.name = "hello" 
    frame.x = figma.viewport.center.x - frame.width / 2
    frame.y = figma.viewport.center.y - frame.height / 2
    frame.layoutMode = "HORIZONTAL"
    frame.horizontalPadding = 50
    frame.verticalPadding = 50
    frame.layoutAlign = "STRETCH"
    frame.cornerRadius = frame.height / 2;
    frame.bottomLeftRadius = 0;

    const label = figma.createText()
    label.layoutAlign = "STRETCH"
    label.resizeWithoutConstraints(100, 100)
    label.fills = [{ type: 'SOLID', color: {r: 0, g: 0, b: 0} }]
    label.characters = msg.string || "❤️"
    if (label.characters.length < 3) label.fontSize = 24;
    label.fontSize = 30
    label.textAlignHorizontal = 'CENTER'
    label.textAlignVertical = 'CENTER'
    label.textAutoResize = "WIDTH_AND_HEIGHT"
    frame.appendChild(label)

    figma.group([frame], figma.currentPage)
    figma.viewport.scrollAndZoomIntoView([frame]);
    figma.currentPage.selection = [label];
  }

  figma.closePlugin();
};
