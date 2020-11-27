figma.showUI(__html__, {width:300, height:240});

async function main() {
  let settings = await figma.clientStorage.getAsync("settings")
  console.log("Loading settings")
  figma.ui.postMessage({type: 'settings', settings}) 
}

var placedEmojiGroup: GroupNode
  
figma.ui.onmessage = async (msg) => {

  console.log(msg)

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
  let scale = 1 / zoom;
  let bounds = figma.viewport.bounds
  // TODO: check to make sure selection is visible / in bounds
  let selection = figma.currentPage.selection[0]
  let name = msg.settings.name

  if (selection) {
    anchorX = selection.absoluteTransform[0][2] + selection.width;;
    anchorY = selection.absoluteTransform[1][2];
  }

  // if (!msg.altPressed) {
  //   figma.ui.hide();
  // }


  let color = {r: 1, g: 1, b: 1}
  
  if (msg.color) {
    var components = msg.color.match(/rgb\((\d+), ?(\d+), ?(\d+)\)/);
    color = {r: parseInt(components[1])/255, g: parseInt(components[2])/255, b: parseInt(components[3])/255}  
  }
  const bevelEffect:Effect = {
    type: "INNER_SHADOW",
    color: { r: 0, g: 0, b: 0, a: .25 },
    offset: { x: -3, y: -3 },
    radius: 0,
    visible: true,
    blendMode: "NORMAL",
  }

  if (msg.type === 'add-bubble') {   // comment bubble
    const frame = figma.createRectangle()
    frame.resizeWithoutConstraints(128 * scale, 48 * scale)
    frame.x = anchorX
    frame.y = anchorY - frame.height
    // frame.layoutMode = "VERTICAL"
    // frame.horizontalPadding = 16 * scale
    // frame.verticalPadding = 8 * scale
    frame.layoutAlign = "STRETCH"
    frame.cornerRadius = frame.height / 2;
    frame.bottomLeftRadius = 0;
    frame.strokeAlign = 'OUTSIDE'
    frame.strokeWeight = 1
    frame.fills = [{ type: 'SOLID', color: color }]
    frame.strokes = [{ type: 'SOLID', color: {r: 0, g: 0, b: 0}, opacity: 0.2 }]
    frame.effects = shadowEffect

    var string = msg.string || "❤️"
    const text = figma.createText()
    
    text.resizeWithoutConstraints(128 * scale, 48 * scale)
    text.x = anchorX
    text.y = anchorY - text.height
    text.layoutAlign = "STRETCH"
    text.fills = [{ type: 'SOLID', color: {r: 0, g: 0, b: 0} }]
    text.characters = string
    text.fontSize = 18 * scale
    if (text.characters.length <= 3) text.fontSize = 48 * scale;
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
    const frame = figma.createFrame()
    frame.resizeWithoutConstraints(200 * scale, 160 * scale)
    frame.x = anchorX - frame.width / 2
    frame.y = anchorY - frame.height / 2
    frame.horizontalPadding = frame.verticalPadding = 16 * scale
    // frame.layoutMode = "VERTICAL"
    frame.fills = [{type: "SOLID", color: color}]
    frame.strokeAlign = "INSIDE"
    frame.strokeWeight = 1
    frame.strokes = [{type: "SOLID", color: {r: 0, g: 0, b: 0}, opacity: 0.15}]
    frame.effects = shadowEffect

    const text = figma.createText()
    text.resizeWithoutConstraints(180 * scale, 140 * scale)
    text.x = 10 * scale
    text.y = 10 * scale
    text.characters = msg.content || "🤙"
    text.fills = [{type: "SOLID", color: {r: 0, g: 0, b: 0}, opacity: 0.8}]
    text.fontName = font
    text.fontSize = 18 * scale
    text.textAlignHorizontal = "CENTER"
    text.textAlignVertical ="CENTER"

    frame.appendChild(text)

    const group = figma.group([frame], figma.currentPage)
    group.name = `${name || "Sticky"}: ${text.characters}`
    group.expanded = false;

    figma.currentPage.selection = [group]

    figma.closePlugin();
    
  // emoji reaction  
  } else if (msg.type === "add-emoji") {
    console.log("Emoji")

    if (placedEmojiGroup !== undefined) { return }

    // this scale factor might get really weird
    // scale = scale * msg.reactionScale

    const frame = figma.createRectangle()
    frame.resizeWithoutConstraints(72 * scale, 72 * scale)
    frame.x = anchorX - 36 * scale
    frame.y = anchorY - 36 * scale

    // frame.horizontalPadding = frame.verticalPadding = 24 * scale
    // frame.layoutMode = "HORIZONTAL"
    // frame.primaryAxisSizingMode = "AUTO"
    // frame.counterAxisSizingMode = "AUTO"
    frame.fills = [{type: "SOLID", color: {r: 1, g: 1, b: 1}}]
    frame.strokeAlign = "INSIDE"
    frame.strokeWeight = 1
    frame.strokes = [{type: "SOLID", color: {r: 0, g: 0, b: 0}, opacity: 0.15}]
    frame.effects = shadowEffect
    frame.cornerRadius = frame.height/2

    const text = figma.createText()
    text.resizeWithoutConstraints(72 * scale, 72 * scale)
    text.x = frame.x //anchorX - 36 * scale
    text.y = frame.y //anchorY - 36 * scale

    text.characters = msg.content || "👍"
    text.fills = [{type: "SOLID", color: {r: 0, g: 0, b: 0}, opacity: 0.8}]
    text.fontName = font
    text.fontSize = 42 * scale
    text.textAlignHorizontal = "CENTER"
    text.textAlignVertical ="CENTER"

    const group = figma.group([text, frame], figma.currentPage)
    group.name = group.name = `${name ? name + ": " : ""}${text.characters}`
    group.expanded = false;
    placedEmojiGroup = group
    

    if (msg.altPressed) {
      // floatmoji
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
          group.y = startY - (Math.pow(15 * progress, 2) * scale);  
          group.x = group.x += drift * scale;
          group.opacity =  1.0 - Math.pow(progress, 2);
        } else {
          clearInterval(interval);
          group.remove()
        }
      },25)
      placedEmojiGroup = undefined
    } else {
      // bigmoji
      var duration = 2.5 * 1000;
      let startX = placedEmojiGroup.x + placedEmojiGroup.width/2;
      let startY = placedEmojiGroup.y + placedEmojiGroup.height/2;
      var then = new Date().getTime()
      var interval = setInterval((i) => {
        let now = new Date().getTime()
        let progress = (now - then) / duration
        if (progress < 2.5 && placedEmojiGroup != undefined) {
          if (progress > 0.25) {
            frame.opacity = 0.0;
            let scaleFactor = translateValue(progress, [.5, 2.5], [1.0075, 1.0125])
            placedEmojiGroup.rescale(scaleFactor)
            placedEmojiGroup.x = startX - placedEmojiGroup.width/2
            placedEmojiGroup.y = startY - placedEmojiGroup.height/2
          }
        } else {
          placedEmojiGroup = undefined
          clearInterval(interval)
          // group.remove()
        }
      },25)
      figma.currentPage.selection = [group]
      // figma.closePlugin()
    }
  } else if (msg.type === "emoji-mouseup" && !msg.altPressed) {
    console.log("Emoji Mouse Up")
    placedEmojiGroup = undefined
    figma.closePlugin()
    

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
    frame.effects = shadowEffect

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


// shadow effect style
let shadowEffect: Array<Effect>  = [{
  type: "DROP_SHADOW",
  color: { r: 0, g: 0, b: 0, a: .19 },
  offset: { x: 0, y: 10 },
  radius: 20,
  visible: true,
  blendMode: "NORMAL",
},{
  type: "DROP_SHADOW",
  color: { r: 0, g: 0, b: 0, a: .23 },
  offset: { x: 0, y: 6 },
  radius: 6,
  visible: true,
  blendMode: "NORMAL",
}]



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

// modulate a value from one range to another
function translateValue(value, from, to) {
	var scale = (to[1] - to[0]) / (from[1] - from[0]);
  var capped = (from[1], (from[0], value)) - from[0];

	return (capped * scale + to[0]);
}


main();