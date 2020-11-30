figma.showUI(__html__, {width:300, height:320});

async function main() {
  let settings = await figma.clientStorage.getAsync("settings")
  console.log("Loading settings")
  figma.ui.postMessage({type: 'settings', settings}) 
}
  
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'settings') {
    console.log("Setting received", msg.settings)
    await figma.clientStorage.setAsync("settings", msg.settings)
    return
  }

  const font = { family: "Arimo", style: "Bold" }  
  await figma.loadFontAsync(font)
  await figma.loadFontAsync({ family: "Roboto", style: "Regular" })

  let anchorX = figma.viewport.center.x
  let anchorY = figma.viewport.center.y

  let zoom = figma.viewport.zoom
  let s = 1 / zoom;
  let bounds = figma.viewport.bounds
  // TODO: check to make sure selection is visible / in bounds
  let selection = figma.currentPage.selection[0]
  let name = msg.settings.name

  // TODO: figure out canvas position of a nested selection
  if (selection) {
    anchorX = selection.absoluteTransform[0][2] + selection.width;;
    anchorY = selection.absoluteTransform[1][2];
  }

  if (!msg.altPressed) {
    figma.ui.hide();
  }


  let color = {r: 1, g: 1, b: 1}
  
  if (msg.color) {
    var components = msg.color.match(/rgb\((\d+), ?(\d+), ?(\d+)\)/);
    color = {r: parseInt(components[1])/255, g: parseInt(components[2])/255, b: parseInt(components[3])/255}  
  }

  const bevelEffect:Effect = {
    type: "INNER_SHADOW",
    color: { r: 0, g: 0, b: 0, a: 1 },
    offset: { x: -1 * s, y: -3 * s },
    radius: 0,
    visible: true,
    blendMode: "SOFT_LIGHT",
  }
  // shadow effect style
  let shadowEffect: Effect /*Array<Effect>*/  = {
    type: "DROP_SHADOW",
    color: { r: 0, g: 0, b: 0, a: 1},
    offset: { x: 0, y: 1 * s },
    radius: 3 * s,
    visible: true,
    blendMode: "SOFT_LIGHT",
  }

  if (msg.type === 'add-bubble') {   // comment bubble
    const frame = figma.createRectangle()
    frame.resizeWithoutConstraints(128 * s, 48 * s)
    frame.x = anchorX
    frame.y = anchorY - frame.height
    // frame.layoutMode = "VERTICAL"
    // frame.horizontalPadding = 16 * s
    // frame.verticalPadding = 8 * s
    frame.layoutAlign = "STRETCH"
    frame.cornerRadius = frame.height / 2;
    frame.bottomLeftRadius = 0;
    frame.strokeAlign = 'OUTSIDE'
    frame.strokeWeight = 1 * s
    frame.fills = [{ type: 'SOLID', color: color }]
    frame.strokes = [{ type: 'SOLID', color: {r: 0, g: 0, b: 0}, opacity: 0.2 }]
    frame.effects = [bevelEffect, shadowEffect]

    var string = msg.string || "❤️"
    const text = figma.createText()
    
    text.resizeWithoutConstraints(128 * s, 48 * s)
    text.x = anchorX
    text.y = anchorY - text.height
    text.layoutAlign = "STRETCH"
    text.fills = [{ type: 'SOLID', color: {r: 0, g: 0, b: 0} }]
    text.characters = string
    text.fontSize = 18 * s
    if (text.characters.length <= 3) text.fontSize = 48 * s;
    text.textAlignHorizontal = 'CENTER'
    text.textAlignVertical = 'CENTER'
    // text.textAutoResize = "WIDTH_AND_HEIGHT"
    text.fontName = font

    var group = figma.group([text,frame], figma.currentPage)
    group.name = `${name || "Comment"}: ${text.characters}`
    group.expanded = false;
    figma.currentPage.selection = [group];

    figma.closePlugin();

  // sticky note
  } else if (msg.type === "add-sticky") {
    const frame = figma.createRectangle()
    frame.resizeWithoutConstraints(200 * s, 160 * s)
    frame.x = anchorX - frame.width / 2
    frame.y = anchorY - frame.height / 2
    // frame.layoutMode = "VERTICAL"
    frame.fills = [{type: "SOLID", color: color}]
    frame.strokeAlign = "INSIDE"
    frame.strokeWeight = 1 * s
    frame.strokes = [{type: "SOLID", color: {r: 1, g: 1, b: 1}, opacity: 0.15}]
    frame.effects = [bevelEffect, shadowEffect]

    const text = figma.createText()
    text.resizeWithoutConstraints(180 * s, 140 * s)
    text.x = frame.x
    text.y = frame.y
    text.characters = msg.content || "🤙"
    text.fills = [{type: "SOLID", color: {r: 0, g: 0, b: 0}, opacity: 0.8}]
    text.fontName = font
    text.fontSize = 18 * s
    text.textAlignHorizontal = "CENTER"
    text.textAlignVertical ="CENTER"


    const group = figma.group([frame, text], figma.currentPage)
    group.name = `${name || "Sticky"}: ${text.characters}`
    group.expanded = false;

    figma.currentPage.selection = [group]

    figma.closePlugin();
    
  // emoji reaction  
  } else if (msg.type === "add-emoji") {
    console.log("Emoji")
    console.log(msg)

    // this s factor might get really weird
    s = s * msg.reactionScale

    const frame = figma.createRectangle()
    frame.resizeWithoutConstraints(72 * s, 72 * s)
    frame.x = anchorX - 36 * s
    frame.y = anchorY - 36 * s

    // frame.horizontalPadding = frame.verticalPadding = 24 * s
    // frame.layoutMode = "HORIZONTAL"
    // frame.primaryAxisSizingMode = "AUTO"
    // frame.counterAxisSizingMode = "AUTO"
    frame.fills = [{type: "SOLID", color: {r: 1, g: 1, b: 1}}]
    frame.strokeAlign = "INSIDE"
    frame.strokeWeight = 1
    frame.strokes = [{type: "SOLID", color: {r: 0, g: 0, b: 0}, opacity: 0.15}]
    frame.effects = [bevelEffect, shadowEffect]
    frame.cornerRadius = frame.height/2

    const text = figma.createText()
    text.resizeWithoutConstraints(72 * s, 72 * s)
    text.x = frame.x //anchorX - 36 * s
    text.y = frame.y //anchorY - 36 * s

    text.characters = msg.content || "👍"
    text.fills = [{type: "SOLID", color: {r: 0, g: 0, b: 0}, opacity: 0.8}]
    text.fontName = font
    text.fontSize = 42 * s
    text.textAlignHorizontal = "CENTER"
    text.textAlignVertical ="CENTER"

    const group = figma.group([text, frame], figma.currentPage)
    group.name = group.name = `${name ? name + ": " : ""}${text.characters}`
    group.expanded = false;
    

    if (msg.altPressed) {
      frame.opacity = 0.0;
      var duration = 2.0 * 1000;
      var drift = (Math.random() * 2) - 1;
      group.x += drift * 4;
      let startY = group.y;
      var then = new Date().getTime()
      var interval = setInterval((i) => {
        let now = new Date().getTime()
        let progress = (now - then) / duration
        if (progress < 1.0) {
          group.y = startY - (Math.pow(15 * progress, 2) * s);  
          group.x = group.x += drift * s;
          group.opacity =  1.0 - Math.pow(progress, 2);
        } else {
          clearInterval(interval);
          group.remove()
        }
      },100)
    } else {
      figma.currentPage.selection = [group]
      figma.closePlugin()
    }
    
  /*
    HIDE THE MEMES (FOR NOW?)
  */
  // meme image
  } else if (msg.type === "add-meme") {
    var memeType = msg.memeType || "satisfied"
    var topText = msg.topText || "Wrote this code"
    var bottomText = msg.bottomText || "Meme appeared"
    memeType = memeType.split(" ").join("_")
    topText = topText.split(" ").join("_")
    bottomText = bottomText.split(" ").join("_")
    // really slow to use this proxy to avoid cors error
    // we need to disable UI and show a loading state tho
    const url = `https://cors-anywhere.herokuapp.com/https://urlme.me/${memeType}/${topText}/${bottomText}.jpg`
    figma.ui.postMessage({ type: 'getImageData', url })
  // handle image data
  } else if (msg.type === "image-data-received") {

    const frame = figma.createFrame()
    frame.x = anchorX - frame.width / 2
    frame.y = anchorY - frame.height / 2
    frame.horizontalPadding = frame.verticalPadding = 8
    frame.layoutMode = "HORIZONTAL"
    frame.primaryAxisSizingMode = "AUTO"
    frame.counterAxisSizingMode = "AUTO"
    frame.fills = [{type: "SOLID", color: {r: 1, g: 1, b: 1}}]
    frame.strokeAlign = "INSIDE"
    frame.strokeWeight = 1
    frame.strokes = [{type: "SOLID", color: {r: 0, g: 0, b: 0}, opacity: 0.15}]
    frame.effects = [bevelEffect, shadowEffect]

    const imageFrame = figma.createFrame()
    imageFrame.resizeWithoutConstraints(200, 200)
    imageFrame.fills = makeFillFromImageData(msg.data)
    imageFrame.x = figma.viewport.center.x - imageFrame.width / 2
    imageFrame.y = figma.viewport.center.y - imageFrame.height / 2

    frame.appendChild(imageFrame)

    const group = figma.group([frame], figma.currentPage)
    group.name = `${name || "Meme"}: Meme`
    group.expanded = false;

    figma.currentPage.selection = [group]
    
    // had to move this into each condition so it doesn't close before we get the image data
    figma.closePlugin();
  }

};


// make image data into a fill
function makeFillFromImageData(data) {
  let imageHash = figma.createImage(data).hash
  
  const newFill: Paint = {
    type: "IMAGE",
    filters: {
      contrast: 0,
      exposure: 0,
      highlights: 0,
      saturation: 0,
      shadows: 0,
      temperature: 0,
      tint: 0,
    },
    imageHash,
    imageTransform: [
      [1, 0, 0],
      [0, 1, 0]
    ],
    opacity: 1,
    scaleMode: "FIT",
    scalingFactor: 0.5,
    visible: true,
  }
  return ([ newFill ])
}

main();